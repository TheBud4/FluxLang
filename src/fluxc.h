#ifndef FLUXC_H
#define FLUXC_H

#include <stdio.h>

/* Declarações compartilhadas entre lexer.l, parser.y e main.c */

int yylex(void); /* lexer.l: devolve o próximo token (0 no fim) */
const char *token_name(int tok); /* parser.y: nome do token, ex: "IDENTIFIER" */

/* sema.c: análise semântica (E1 a E22). Devolve quantos erros reportou. */
struct Program;
int semantic_check(struct Program *program);

/* json.c: modo --json. Tokens e erros são registrados durante a análise e
   impressos no fim junto com a árvore de derivação. */
void json_enable(void);
int json_enabled(void);
void json_record_token(const char *type, const char *text, int line, int column);
void json_record_error(const char *kind, int line, int column, const char *message);
void json_print(FILE *out, int accepted, int lines);

/* lexer.l: quantas linhas tem o código lido (vale depois de ler tudo) */
int source_lines(void);

/* main.c: imprime "Erro <kind> [linha L, coluna C]:" e mensagem */
void report_error(const char *kind, int line, int column, const char *fmt, ...);

#endif