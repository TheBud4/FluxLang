#ifndef FLUXC_H
#define FLUXC_H

#include <stddef.h>
#include <stdio.h>

/* ---- lexer.l ---- */

extern FILE *yyin;
int  yylex(void);
int  yylex_destroy(void);

/* Texto do último token lido (truncado), usado nas mensagens de erro. */
extern char flux_lexema[];

/* Cópia de string que vive até flux_liberar_strings(). */
char *flux_strdup(const char *s, size_t n);
void  flux_liberar_strings(void);

/* ---- parser.y ---- */

int yyparse(void);

/* Nome do token (ex.: "SEMICOLON"), usado no modo --tokens. */
const char *flux_nome_token(int token);

/* ---- main.c ---- */

/* Imprime o cabeçalho "Erro <classe> [linha L, coluna C]:" e conta o erro. */
void flux_erro(const char *classe, int linha, int coluna);

#endif
