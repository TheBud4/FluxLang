#ifndef AST_H
#define AST_H

#include "types.h"
#include <stdio.h>

/* AST da FluxLang: a árvore de derivação sem a burocracia da gramática LL(1).
 * `1 + 2 * 3` vira Binary(+, 1, Binary(*, 2, 3)) em vez de 40 linhas de
 * or_expr -> and_expr -> ... O analisador semântico (sema.c) trabalha sobre
 * esta árvore, e o backend também vai trabalhar.
 *
 * Os nós nunca são liberados: o compilador roda uma vez por arquivo. */

typedef struct {
  int line, column;
} Pos;

typedef struct {
  char *name;
  Pos pos;
} Name;

/* ---------- Expressões ---------- */

typedef enum {
  EX_INT, EX_FLOAT, EX_STRING, EX_BOOL, EX_NULL,
  EX_IDENT,
  EX_UNARY, EX_BINARY,
  EX_INDEX,  /* a[b]   */
  EX_FIELD,  /* a.text */
  EX_CALL,   /* a(items) */
  EX_LIST,   /* [items] */
  EX_OBJECT  /* { keys: items } */
} ExprKind;

typedef enum {
  OP_OR, OP_AND, OP_EQ, OP_NE, OP_LT, OP_LE, OP_GT, OP_GE,
  OP_ADD, OP_SUB, OP_MUL, OP_DIV, OP_MOD,
  OP_NEG, OP_NOT
} Op;

typedef struct Expr Expr;
struct Expr {
  ExprKind kind;
  Pos pos;
  long ival;            /* EX_INT */
  double fval;          /* EX_FLOAT */
  int bval;             /* EX_BOOL */
  char *text;           /* EX_STRING (com as aspas), EX_IDENT e EX_FIELD (o nome) */
  Op op;                /* EX_UNARY, EX_BINARY */
  Expr *a, *b;          /* operandos; base de EX_INDEX/EX_FIELD; callee de EX_CALL */
  Expr **items;         /* argumentos (EX_CALL), elementos (EX_LIST), valores (EX_OBJECT) */
  int n_items;
  char **keys;          /* EX_OBJECT: as chaves, paralelas a items */
  Type *type;           /* preenchido pelo analisador semântico */
};

/* ---------- Comandos ---------- */

typedef enum {
  ST_VAR,      /* var/const, também no nível global */
  ST_ASSIGN,
  ST_IF,
  ST_WHILE,
  ST_FOR,
  ST_RETURN,
  ST_BREAK,
  ST_CONTINUE,
  ST_ERRACT,   /* stop/abort/proceed if e; */
  ST_EXPR,
  ST_BLOCK
} StmtKind;

typedef enum { ACT_STOP, ACT_ABORT, ACT_PROCEED } ErrAction;
typedef enum { RHS_EXPRS, RHS_CALL, RHS_RUN } RhsKind;

/* O lado direito de um `=`: lista de expressões, `call f(args)` ou `run {...}` */
typedef struct {
  RhsKind kind;
  Pos pos;
  Expr **exprs;     /* RHS_EXPRS */
  int n_exprs;
  Name callee;      /* RHS_CALL */
  Expr **args;
  int n_args;
  Expr *run;        /* RHS_RUN: o literal de objeto */
} Rhs;

typedef struct Stmt Stmt;
struct Stmt {
  StmtKind kind;
  Pos pos;
  int is_const;          /* ST_VAR */
  Name **names;          /* ST_VAR: os nomes declarados */
  int n_names;
  Type *declared;        /* ST_VAR: o :tipo escrito, ou NULL */
  Rhs *rhs;              /* ST_VAR (pode ser NULL) e ST_ASSIGN */
  Expr **targets;        /* ST_ASSIGN */
  int n_targets;
  Expr *cond;            /* ST_IF, ST_WHILE; o iterável do ST_FOR */
  Stmt *then, *els;      /* ST_IF; o corpo de ST_WHILE e ST_FOR fica em `then` */
  Name var;              /* ST_FOR: a variável do laço; ST_ERRACT: o operando */
  ErrAction act;         /* ST_ERRACT */
  Expr **exprs;          /* ST_RETURN: os valores; ST_EXPR: exprs[0] */
  int n_exprs;
  Stmt **stmts;          /* ST_BLOCK */
  int n_stmts;
};

/* ---------- Declarações ---------- */

typedef struct {
  Name name;
  Type *type;
} Param;

typedef struct {
  Name name;
  int is_workflow;
  int is_main;
  Param **params;
  int n_params;
  Type *ret;   /* o :tipo escrito, ou NULL */
  Stmt *body;  /* ST_BLOCK */
} Func;

/* Os itens do nível global, na ordem do arquivo (a ordem importa: um
 * inicializador de global só usa globais declarados acima, decisão D3). */
typedef struct {
  Stmt *var;   /* var/const global, ou NULL */
  Func *func;  /* func/workflow/main, ou NULL */
} Decl;

typedef struct {
  Decl *decls;
  int n_decls;
  Func *main;
} Program;

/* Converte a árvore de derivação (parse_root) em AST. Devolve NULL se a
 * árvore tem trechos de erro (o programa não passou na análise sintática). */
struct Node;
Program *build_ast(const struct Node *root);

/* Imprime a AST indentada, um nó por linha (--ast). */
void ast_print(const Program *program, FILE *out);

/* Auxiliares de alocação usados por ast_build.c. */
void *ast_alloc(size_t size);

#endif
