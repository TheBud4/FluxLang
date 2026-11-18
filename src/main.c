#include "fluxc.h"
#include "parser.tab.h"
#include "ast.h"
#include "mem.h"
#include "tree.h"
#include <stdarg.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

extern FILE *yyin;

static int error_count = 0;

void report_error(const char *kind, int line, int column, const char *fmt,
                  ...) {
  va_list args;
  va_start(args, fmt);
  if (json_enabled()) {
    char message[1024];
    vsnprintf(message, sizeof message, fmt, args);
    json_record_error(kind, line, column, message);
  } else {
    fflush(stdout);
    fprintf(stderr, "Erro %s [linha %d, coluna %d]:\n", kind, line, column);
    vfprintf(stderr, fmt, args);
    fprintf(stderr, "\n");
  }
  va_end(args);
  error_count++;
}

static void help(void) {
  printf("Uso: ./flux [opções] [arquivo.flux]\n"
         "Sem arquivo, lê o programa da entrada padrão.\n"
         "\n"
         "Opções:\n"
         "  -t, --tokens   lista os tokens reconhecidos (só o lexer)\n"
         "  --tree         imprime a árvore de derivação\n"
         "  --json         imprime tokens, erros e árvore em JSON\n"
         "  --ast          imprime a AST (a árvore sem a burocracia da gramática)\n"
         "  --semantic     confere também os erros semânticos (E1 a E24)\n"
         "  --c            imprime o programa em C (com a biblioteca de execução)\n"
         "  --build [-o x] gera o executável (via gcc); sem -o, usa o nome do arquivo\n"
         "  --run          gera o executável, roda e apaga\n"
         "  --windows      com --build/--run: gera um .exe de Windows (precisa do mingw64-gcc; o --run usa o wine)\n"
         "  -h, --help     mostra esta mensagem\n");
}

static int list_tokens(void) {
  int tok;
  while ((tok = yylex()) != 0) {
    if (tok == YYerror)
      continue;
    int has_text = tok == IDENTIFIER || tok == INT_LITERAL ||
                   tok == FLOAT_LITERAL || tok == STRING_LITERAL;
    printf("%d:%d\t%-20s %s\n", yylloc.first_line, yylloc.first_column,
           token_name(tok), has_text ? yylval.node->text : "");
  }
  return error_count > 0;
}

static char *default_exe_name(const char *file) {
  if (!file)
    return mem_strdup(is_windows_target() ? "a.exe" : "a.out");
  const char *base = strrchr(file, '/');
  base = base ? base + 1 : file;
  char *name = mem_strdup(base);
  char *dot = strrchr(name, '.');
  if (dot && dot != name)
    *dot = '\0';
  if (is_windows_target()) {
    char *with_exe = mem_alloc(strlen(name) + 5);
    sprintf(with_exe, "%s.exe", name);
    return with_exe;
  }
  return name;
}

static int same_file(const char *a, const char *b) {
  struct stat sa, sb;
  return stat(a, &sa) == 0 && stat(b, &sb) == 0 && sa.st_dev == sb.st_dev && sa.st_ino == sb.st_ino;
}

static int run_codegen(Program *program, int c_mode, int build_mode, const char *outfile,
                       const char *file) {
  if (!program) {
    fprintf(stderr, "Programa rejeitado.\n");
    return 1;
  }
  if (c_mode) {
    generate_c(program, stdout);
    return 0;
  }

  char exe_path[512];
  if (build_mode) {
    snprintf(exe_path, sizeof exe_path, "%s", outfile ? outfile : default_exe_name(file));
    if (file && same_file(file, exe_path)) {
      fprintf(stderr,
              "Não é possível gerar o executável '%s': ele é o próprio arquivo fonte.\n"
              "Use -o para escolher outro nome ou dê ao fonte uma extensão (por exemplo, "
              "prog.flux).\n",
              exe_path);
      return 2;
    }
  }

  const char *tmpdir = getenv("TMPDIR");
  char c_path[512];
  snprintf(c_path, sizeof c_path, "%s/fluxXXXXXX", tmpdir ? tmpdir : "/tmp");
  int fd = mkstemp(c_path);
  if (fd < 0) {
    perror(c_path);
    return 3;
  }
  FILE *c_file = fdopen(fd, "w");
  generate_c(program, c_file);
  fclose(c_file);

  if (!build_mode) {
    const char *suffix = is_windows_target() ? ".exe" : "";
    snprintf(exe_path, sizeof exe_path, "%s/fluxexeXXXXXX%s", tmpdir ? tmpdir : "/tmp", suffix);
    int exe_fd = mkstemps(exe_path, (int)strlen(suffix));
    if (exe_fd < 0) {
      perror(exe_path);
      unlink(c_path);
      return 3;
    }
    close(exe_fd);
  }

  if (compile_c(c_path, exe_path) != 0) {
    fprintf(stderr, "Erro interno: o gcc não conseguiu compilar o C gerado (guardado em %s).\n",
            c_path);
    if (!build_mode)
      unlink(exe_path);
    return 3;
  }
  unlink(c_path);
  if (build_mode) {
    printf("Executável gerado: %s\n", exe_path);
    return 0;
  }
  int code = execute_program(exe_path);
  unlink(exe_path);
  return code;
}

static int run(int argc, char **argv) {
  int token_mode = 0;
  int tree_mode = 0;
  int json_mode = 0;
  int ast_mode = 0;
  int semantic_mode = 0;
  int c_mode = 0, build_mode = 0, run_mode = 0;
  const char *outfile = NULL;
  const char *file = NULL;

  for (int i = 1; i < argc; i++) {
    if (strcmp(argv[i], "--tokens") == 0 || strcmp(argv[i], "-t") == 0) {
      token_mode = 1;
    } else if (strcmp(argv[i], "--json") == 0) {
      json_mode = 1;
    } else if (strcmp(argv[i], "--semantic") == 0) {
      semantic_mode = 1;
    } else if (strcmp(argv[i], "--c") == 0) {
      c_mode = 1;
    } else if (strcmp(argv[i], "--build") == 0) {
      build_mode = 1;
    } else if (strcmp(argv[i], "--run") == 0) {
      run_mode = 1;
    } else if (strcmp(argv[i], "--windows") == 0) {
      set_windows_target();
    } else if (strcmp(argv[i], "-o") == 0 && i + 1 < argc) {
      outfile = argv[++i];
    } else if (strcmp(argv[i], "--ast") == 0) {
      ast_mode = 1;
    } else if (strcmp(argv[i], "--tree") == 0) {
      tree_mode = 1;
    } else if (strcmp(argv[i], "--help") == 0 || strcmp(argv[i], "-h") == 0) {
      help();
      return 0;
    } else if (argv[i][0] == '-') {
      fprintf(stderr, "Opção desconhecida: %s\n", argv[i]);
      help();
      return 2;
    } else {
      file = argv[i];
    }
  }

  if (file) {
    yyin = fopen(file, "r");
    if (!yyin) {
      perror(file);
      return 2;
    }
  }

  if (token_mode)
    return list_tokens();

  if (json_mode)
    json_enable();
  int parsed = yyparse();

  int codegen = c_mode || build_mode || run_mode;
  if (codegen)
    semantic_mode = 1;

  Program *program = NULL;
  if ((ast_mode || semantic_mode) && parsed == 0 && error_count == 0)
    program = build_ast(parse_root);
  if (semantic_mode && program)
    semantic_check(program);
  int accepted = parsed == 0 && error_count == 0;

  if (json_mode) {
    json_print(stdout, accepted, source_lines());
    return accepted ? 0 : 1;
  }
  if (codegen)
    return run_codegen(accepted ? program : NULL, c_mode, build_mode, outfile, file);
  if (tree_mode)
    print_tree(parse_root, stdout);
  if (ast_mode && program)
    ast_print(program, stdout);
  if (accepted) {
    printf("Programa aceito.\n");
    return 0;
  }
  printf("Programa rejeitado.\n");
  return 1;
}

int yylex_destroy(void);

int main(int argc, char **argv) {
  int code = run(argc, argv);
  yylex_destroy();
  if (yyin && yyin != stdin)
    fclose(yyin);
  mem_free_all();
  return code;
}
