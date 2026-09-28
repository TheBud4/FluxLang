#ifndef FLUXC_H
#define FLUXC_H

/* Declarações compartilhadas entre lexer.l, parser.y e main.c */

int yylex(void); /* lexer.l: devolve o próximo token (0 no fim) */
const char *
token_name(int tok); /* parser.y: nome do token, ex.: "IDENTIFIER" */

/* main.c: imprime "Erro <kind> [linha L, coluna C]:" e a mensagem */
void report_error(const char *kind, int line, int column, const char *fmt, ...);

#endif