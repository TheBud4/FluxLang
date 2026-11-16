#ifndef FLUXC_H
#define FLUXC_H

#include <stdio.h>

int yylex(void);
const char *token_name(int tok);

struct Program;
int semantic_check(struct Program *program);

struct Program;
int generate_c(const struct Program *program, FILE *out);
int compile_c(const char *c_path, const char *exe_path);
int execute_program(const char *exe_path);
void set_windows_target(void);
int is_windows_target(void);

void json_enable(void);
int json_enabled(void);
void json_record_token(const char *type, const char *text, int line, int column);
void json_record_error(const char *kind, int line, int column, const char *message);
void json_print(FILE *out, int accepted, int lines);

int source_lines(void);

void report_error(const char *kind, int line, int column, const char *fmt, ...);

#endif