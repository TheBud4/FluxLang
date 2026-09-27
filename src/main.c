#include "fluxc.h"
#include "parser.tab.h"
#include <stdarg.h>
#include <stdio.h>
#include <string.h>

extern FILE *yyin;

static int error_count = 0;

void report_error(const char *kind, int line, int column, const char *fmt,
                  ...) {
  va_list args;
  fflush(stdout);
  fprintf(stderr, "Erro %s [linha %d, coluna %d]:\n", kind, line, column);
  va_start(args, fmt);
  vfprintf(stderr, fmt, args);
  va_end(args);
  fprintf(stderr, "\n");
  error_count++;
}

static void help(void) {
  printf("Uso: ./fluxc [opções] [arquivo.flux]\n"
         "Sem arquivo, lê o programa da entrada padrão.\n"
         "\n"
         "Opções:\n"
         "  -t, --tokens   lista os tokens reconhecidos (só o lexer)\n"
         "  -h, --help     mostra esta mensagem\n");
}

static int list_tokens(void) {
  int tok;
  while ((tok = yylex()) != 0) {
    if (tok == YYerror)
      continue;
    printf("%d:%d\t%-20s %s\n", yylloc.first_line, yylloc.first_column,
           token_name(tok), yylval ? yylval : "");
  }
  return error_count > 0;
}

int main(int argc, char **argv) {
  int token_mode = 0;
  const char *file = NULL;

  for (int i = 1; i < argc; i++) {
    if (strcmp(argv[i], "--tokens") == 0 || strcmp(argv[i], "-t") == 0) {
      token_mode = 1;
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

  if (yyparse() == 0) {
    printf("Programa aceito.\n");
    return 0;
  }
  printf("Programa rejeitado.\n");
  return 1;
}
