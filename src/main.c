#include "fluxc.h"
#include "parser.tab.h"
#include "tree.h"
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

extern FILE *yyin;

static int error_count = 0;

void report_error(const char *kind, int line, int column, const char *fmt,
                  ...) {
  va_list args;
  va_start(args, fmt);
  if (json_enabled()) { /* no modo --json o stdout é só o JSON */
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
         "  -h, --help     mostra esta mensagem\n");
}

static int list_tokens(void) {
  int tok;
  while ((tok = yylex()) != 0) {
    if (tok == YYerror)
      continue;
    /* só identificadores e literais mostram o texto */
    int has_text = tok == IDENTIFIER || tok == INT_LITERAL ||
                   tok == FLOAT_LITERAL || tok == STRING_LITERAL;
    printf("%d:%d\t%-20s %s\n", yylloc.first_line, yylloc.first_column,
           token_name(tok), has_text ? yylval.node->text : "");
  }
  return error_count > 0;
}

int main(int argc, char **argv) {
  int token_mode = 0;
  int tree_mode = 0;
  int json_mode = 0;
  const char *file = NULL;

  for (int i = 1; i < argc; i++) {
    if (strcmp(argv[i], "--tokens") == 0 || strcmp(argv[i], "-t") == 0) {
      token_mode = 1;
    } else if (strcmp(argv[i], "--json") == 0) {
      json_mode = 1;
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

  /* Com o modo pânico o yyparse() termina com 0 mesmo depois de erros
     recuperados: o programa só é aceito se nenhum erro foi reportado. */
  if (json_mode)
    json_enable();
  int parsed = yyparse();
  if (json_mode) {
    int accepted = parsed == 0 && error_count == 0;
    json_print(stdout, accepted, source_lines());
    return accepted ? 0 : 1;
  }
  if (tree_mode)
    print_tree(parse_root, stdout);
  if (parsed == 0 && error_count == 0) {
    printf("Programa aceito.\n");
    return 0;
  }
  printf("Programa rejeitado.\n");
  return 1;
}
