/*
 * fluxc — compilador da FluxLang (Trabalho 1: análise léxica e sintática).
 *
 * Uso: fluxc [--tokens] [arquivo]
 * Sem arquivo (ou com "-"), lê o código-fonte da entrada padrão.
 */

#include <errno.h>
#include <locale.h>
#include <stdio.h>
#include <string.h>

#include "fluxc.h"
#include "parser.h"

static int total_erros;

void flux_erro(const char *classe, int linha, int coluna)
{
    fprintf(stderr, "Erro %s [linha %d, coluna %d]:\n", classe, linha, coluna);
    total_erros++;
}

/* Modo --tokens: só o lexer, listando todos os tokens reconhecidos. */
static int listar_tokens(void)
{
    int token, n = 0;

    printf("%-10s %-16s %s\n", "LINHA:COL", "TOKEN", "LEXEMA");
    while ((token = yylex()) != YYEOF) {
        if (token == ERRO_LEXICO)
            continue;   /* já reportado; o lexer segue a partir do próximo caractere */
        char pos[32];
        snprintf(pos, sizeof pos, "%d:%d", yylloc.first_line, yylloc.first_column);
        printf("%-10s %-16s %s\n", pos, flux_nome_token(token), flux_lexema);
        n++;
    }
    printf("\n%d token(s) reconhecido(s), %d erro(s) léxico(s).\n", n, total_erros);
    return total_erros == 0;
}

static void uso(FILE *saida)
{
    fputs("Uso: fluxc [--tokens] [arquivo]\n"
          "  Sem arquivo (ou com \"-\"), lê da entrada padrão.\n"
          "  --tokens  lista os tokens reconhecidos em vez de analisar a sintaxe\n",
          saida);
}

int main(int argc, char **argv)
{
    const char *arquivo = NULL;
    int so_tokens = 0;

    /* Mensagens do sistema (strerror) no idioma e na codificação do usuário.
       LC_NUMERIC fica em "C": em pt_BR, strtod esperaria vírgula decimal. */
    setlocale(LC_MESSAGES, "");
    setlocale(LC_CTYPE, "");

    /* Mantém a ordem entre saída normal e mensagens de erro. */
    setvbuf(stdout, NULL, _IOLBF, 0);

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--tokens") == 0) {
            so_tokens = 1;
        } else if (strcmp(argv[i], "-h") == 0 || strcmp(argv[i], "--ajuda") == 0) {
            uso(stdout);
            return 0;
        } else if (argv[i][0] == '-' && argv[i][1] != '\0') {
            fprintf(stderr, "Opção desconhecida: %s\n", argv[i]);
            uso(stderr);
            return 2;
        } else if (arquivo) {
            fputs("Informe apenas um arquivo.\n", stderr);
            return 2;
        } else {
            arquivo = argv[i];
        }
    }

    if (arquivo && strcmp(arquivo, "-") != 0) {
        yyin = fopen(arquivo, "r");
        if (!yyin) {
            fprintf(stderr, "Não foi possível abrir '%s': %s\n", arquivo, strerror(errno));
            return 2;
        }
    }

    int aceito;
    if (so_tokens) {
        aceito = listar_tokens();
    } else {
        aceito = yyparse() == 0;
        puts(aceito ? "Programa aceito." : "Programa rejeitado.");
    }

    if (yyin && yyin != stdin)
        fclose(yyin);
    yylex_destroy();
    flux_liberar_strings();
    return aceito ? 0 : 1;
}
