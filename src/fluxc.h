#ifndef FLUXC_H
#define FLUXC_H

/* Declarações compartilhadas entre lexer.l, parser.y e main.c */

int yylex(void); /* lexer.l: devolve o próximo token (0 no fim) */
const char *token_name(int tok); /* parser.y: nome do token, ex: "IDENTIFIER" */

/* rdparser.c: parser descendente recursivo. Devolve 0 se o programa foi
   aceito e 1 se foi rejeitado (o erro já foi impresso). */
int rd_parse(void);

/* main.c: quantos erros já foram reportados (léxicos e sintáticos) */
int error_total(void);

/* main.c: imprime "Erro <kind> [linha L, coluna C]:" e mensagem */
void report_error(const char *kind, int line, int column, const char *fmt, ...);

#endif