#ifndef AST_H
#define AST_H

#include "types.h"
#include <stdio.h>

typedef struct {
  int line, column;
} Pos;

typedef struct {
  char *name;
  Pos pos;
} Name;

typedef enum {
  EX_INT, EX_FLOAT, EX_STRING, EX_BOOL, EX_NULL,
  EX_IDENT,
  EX_UNARY, EX_BINARY,
  EX_INDEX,
  EX_FIELD,
  EX_CALL,
  EX_LIST,
  EX_OBJECT
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
  long ival;
  double fval;
  int bval;
  char *text;
  Op op;
  Expr *a, *b;
  Expr **items;
  int n_items;
  char **keys;
  Type *type;
};

typedef enum {
  ST_VAR,
  ST_ASSIGN,
  ST_IF,
  ST_WHILE,
  ST_FOR,
  ST_RETURN,
  ST_BREAK,
  ST_CONTINUE,
  ST_ERRACT,
  ST_EXPR,
  ST_BLOCK
} StmtKind;

typedef enum { ACT_STOP, ACT_ABORT, ACT_PROCEED } ErrAction;
typedef enum { RHS_EXPRS, RHS_CALL, RHS_RUN } RhsKind;

typedef struct {
  RhsKind kind;
  Pos pos;
  Expr **exprs;
  int n_exprs;
  Name callee;
  Expr **args;
  int n_args;
  Expr *run;
} Rhs;

typedef struct Stmt Stmt;
struct Stmt {
  StmtKind kind;
  Pos pos;
  int is_const;
  Name **names;
  int n_names;
  Type *declared;
  Rhs *rhs;
  Expr **targets;
  int n_targets;
  Expr *cond;
  Stmt *then, *els;
  Name var;
  ErrAction act;
  Expr **exprs;
  int n_exprs;
  Stmt **stmts;
  int n_stmts;
};

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
  Type *ret;
  Stmt *body;
} Func;

typedef struct {
  Stmt *var;
  Func *func;
} Decl;

typedef struct Program {
  Decl *decls;
  int n_decls;
  Func *main;
} Program;

struct Node;
Program *build_ast(const struct Node *root);

void ast_print(const Program *program, FILE *out);

void *ast_alloc(size_t size);

#endif
