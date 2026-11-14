/* Converte a árvore de derivação (tree.h) em AST (ast.h).
 *
 * A árvore de derivação tem um nó por regra da BNF, inclusive os *_rest da
 * fatoração LL(1). Aqui cada regra vira um construtor: por exemplo
 *   or_expr -> and_expr or_rest        or_rest -> OR and_expr or_rest | e
 * vira um laço que monta Binary(||, a, b) associativo à esquerda.
 *
 * O formato exato de cada regra está em docs/BNF.txt; os comentários abaixo
 * repetem a regra que cada função lê. */

#include "ast.h"
#include "tree.h"
#include <stdlib.h>
#include <string.h>

/* ---------- Leitura da árvore ---------- */

static const Node *kid(const Node *n, int i) {
  const Node *c = n->first_child;
  while (c && i-- > 0)
    c = c->next;
  return c;
}

static int is(const Node *n, const char *label) {
  return n && strcmp(n->label, label) == 0;
}

/* O nó tem conteúdo de verdade (não é uma produção vazia ε)? */
static int filled(const Node *n) {
  return n->first_child && n->first_child->kind != NODE_EMPTY;
}

static Pos pos_of(const Node *n) {
  Pos p = {n->line, n->column};
  return p;
}

static char *dup(const char *s) {
  char *copy = strdup(s);
  if (!copy) {
    perror("strdup");
    exit(2);
  }
  return copy;
}

static int has_error_node(const Node *n) {
  if (n->kind == NODE_ERROR)
    return 1;
  for (const Node *c = n->first_child; c; c = c->next)
    if (has_error_node(c))
      return 1;
  return 0;
}

/* ---------- Vetor de ponteiros ---------- */

typedef struct {
  void **v;
  int n, cap;
} Vec;

static void push(Vec *vec, void *p) {
  if (vec->n == vec->cap) {
    vec->cap = vec->cap ? vec->cap * 2 : 8;
    vec->v = realloc(vec->v, vec->cap * sizeof(void *));
    if (!vec->v) {
      perror("realloc");
      exit(2);
    }
  }
  vec->v[vec->n++] = p;
}

/* ---------- Tipos ---------- */

/* <type> ::= TYPE_INT | ... | TYPE_LIST LOWER_THAN <type> GREATER_THAN */
static Type *build_type(const Node *t) {
  const Node *first = kid(t, 0);
  if (is(first, "TYPE_INT"))    return type_prim(T_INT);
  if (is(first, "TYPE_FLOAT"))  return type_prim(T_FLOAT);
  if (is(first, "TYPE_STRING")) return type_prim(T_STRING);
  if (is(first, "TYPE_BOOL"))   return type_prim(T_BOOL);
  if (is(first, "TYPE_OBJECT")) return type_prim(T_OBJECT);
  return type_list(build_type(kid(t, 2))); /* TYPE_LIST < type > */
}

/* ---------- Expressões ---------- */

static Expr *new_expr(ExprKind kind, const Node *at) {
  Expr *e = ast_alloc(sizeof *e);
  e->kind = kind;
  e->pos = pos_of(at);
  return e;
}

static Expr *build_expr(const Node *n);

static Op op_from_token(const char *label) {
  static const struct { const char *label; Op op; } table[] = {
      {"OR", OP_OR},          {"AND", OP_AND},
      {"EQUAL", OP_EQ},       {"NOT_EQUAL", OP_NE},
      {"LOWER_THAN", OP_LT},  {"LOWER_THAN_EQUAL", OP_LE},
      {"GREATER_THAN", OP_GT}, {"GREATER_THAN_EQUAL", OP_GE},
      {"PLUS", OP_ADD},       {"MINUS", OP_SUB},
      {"MUL", OP_MUL},        {"DIV", OP_DIV},
      {"MOD", OP_MOD},        {"NOT", OP_NOT},
  };
  for (size_t i = 0; i < sizeof table / sizeof table[0]; i++)
    if (strcmp(table[i].label, label) == 0)
      return table[i].op;
  return OP_ADD;
}

/* Os seis níveis binários têm a mesma forma:
 *   <x_expr> ::= <y_expr> <x_rest>
 *   <x_rest> ::= <x_op> <y_expr> <x_rest> | e
 * (em or_rest e and_rest o operador é o próprio token). Lê da esquerda para a
 * direita, então a e b e c vira Binary(Binary(a, b), c). */
static Expr *build_binary(const Node *n) {
  Expr *left = build_expr(kid(n, 0));
  const Node *rest = kid(n, 1);
  while (filled(rest)) {
    const Node *op = kid(rest, 0);
    const Node *token = op->kind == NODE_TOKEN ? op : kid(op, 0);
    Expr *e = new_expr(EX_BINARY, token);
    e->op = op_from_token(token->label);
    e->a = left;
    e->b = build_expr(kid(rest, 1));
    left = e;
    rest = kid(rest, 2);
  }
  return left;
}

/* <expression_list> ::= <expression> <expression_list_rest>
 * <expression_list_rest> ::= COMMA <expression> <expression_list_rest> | e */
static void build_expr_list(const Node *list, Vec *out) {
  push(out, build_expr(kid(list, 0)));
  const Node *rest = kid(list, 1);
  while (filled(rest)) {
    push(out, build_expr(kid(rest, 1)));
    rest = kid(rest, 2);
  }
}

/* <args> ::= <expression_list> | e */
static void build_args(const Node *args, Vec *out) {
  if (filled(args))
    build_expr_list(kid(args, 0), out);
}

/* <list_literal> ::= LBRACKET <list_items> RBRACKET
 * <list_items> ::= <expression> <list_rest> | e
 * <list_rest> ::= COMMA <list_after_comma> | e
 * <list_after_comma> ::= <expression> <list_rest> | e   (vírgula final) */
static Expr *build_list(const Node *lit) {
  Expr *e = new_expr(EX_LIST, lit);
  Vec items = {0};
  const Node *it = kid(lit, 1);
  if (filled(it)) {
    push(&items, build_expr(kid(it, 0)));
    const Node *rest = kid(it, 1);
    while (filled(rest)) {
      const Node *after = kid(rest, 1);
      if (!filled(after))
        break;
      push(&items, build_expr(kid(after, 0)));
      rest = kid(after, 1);
    }
  }
  e->items = (Expr **)items.v;
  e->n_items = items.n;
  return e;
}

/* <field> ::= <field_key> COLON <expression>; a chave é IDENTIFIER ou
 * STRING_LITERAL (sem as aspas). */
static void build_field(const Node *field, Vec *keys, Vec *values) {
  const Node *key = kid(kid(field, 0), 0);
  char *text = dup(key->text);
  if (is(key, "STRING_LITERAL")) { /* tira as aspas */
    size_t len = strlen(text);
    memmove(text, text + 1, len - 2);
    text[len - 2] = '\0';
  }
  push(keys, text);
  push(values, build_expr(kid(field, 2)));
}

/* <object_literal> ::= LBRACE <object_items> RBRACE
 * <object_items> ::= <field> <fields_rest> | e
 * <fields_rest> ::= COMMA <fields_after_comma> | e
 * <fields_after_comma> ::= <field> <fields_rest> | e */
static Expr *build_object(const Node *lit) {
  Expr *e = new_expr(EX_OBJECT, lit);
  Vec keys = {0}, values = {0};
  const Node *it = kid(lit, 1);
  if (filled(it)) {
    build_field(kid(it, 0), &keys, &values);
    const Node *rest = kid(it, 1);
    while (filled(rest)) {
      const Node *after = kid(rest, 1);
      if (!filled(after))
        break;
      build_field(kid(after, 0), &keys, &values);
      rest = kid(after, 1);
    }
  }
  e->keys = (char **)keys.v;
  e->items = (Expr **)values.v;
  e->n_items = values.n;
  return e;
}

/* <primary> ::= literais | IDENTIFIER | LPAREN <expression> RPAREN
 *             | <list_literal> | <object_literal> */
static Expr *build_primary(const Node *n) {
  const Node *first = kid(n, 0);
  Expr *e;
  if (is(first, "LPAREN"))
    return build_expr(kid(n, 1));
  if (is(first, "list_literal"))
    return build_list(first);
  if (is(first, "object_literal"))
    return build_object(first);

  if (is(first, "IDENTIFIER")) {
    e = new_expr(EX_IDENT, first);
    e->text = dup(first->text);
  } else if (is(first, "INT_LITERAL")) {
    e = new_expr(EX_INT, first);
    e->ival = strtol(first->text, NULL, 10);
  } else if (is(first, "FLOAT_LITERAL")) {
    e = new_expr(EX_FLOAT, first);
    e->fval = strtod(first->text, NULL);
  } else if (is(first, "STRING_LITERAL")) {
    e = new_expr(EX_STRING, first);
    e->text = dup(first->text);
  } else if (is(first, "NULL_LITERAL")) {
    e = new_expr(EX_NULL, first);
  } else { /* TRUE ou FALSE */
    e = new_expr(EX_BOOL, first);
    e->bval = is(first, "TRUE");
  }
  return e;
}

/* <postfix_expr> ::= <primary> <postfix_rest>
 * <postfix_rest> ::= DOT IDENTIFIER <postfix_rest>
 *                  | LBRACKET <expression> RBRACKET <postfix_rest>
 *                  | LPAREN <args> RPAREN <postfix_rest> | e */
static Expr *build_postfix(const Node *n) {
  Expr *base = build_primary(kid(n, 0));
  const Node *rest = kid(n, 1);
  while (filled(rest)) {
    const Node *first = kid(rest, 0);
    Expr *e;
    if (is(first, "DOT")) {
      const Node *name = kid(rest, 1);
      e = new_expr(EX_FIELD, name);
      e->text = dup(name->text);
      e->a = base;
    } else if (is(first, "LBRACKET")) {
      e = new_expr(EX_INDEX, first);
      e->a = base;
      e->b = build_expr(kid(rest, 1));
    } else { /* LPAREN */
      Vec args = {0};
      build_args(kid(rest, 1), &args);
      e = new_expr(EX_CALL, first);
      e->pos = base->pos; /* os erros de chamada apontam para o início dela */
      e->a = base;
      e->items = (Expr **)args.v;
      e->n_items = args.n;
    }
    base = e;
    rest = rest->last_child;
  }
  return base;
}

/* <unary_expr> ::= <unary_op> <unary_expr> | <postfix_expr> */
static Expr *build_unary(const Node *n) {
  const Node *first = kid(n, 0);
  if (is(first, "unary_op")) {
    const Node *token = kid(first, 0);
    Expr *e = new_expr(EX_UNARY, token);
    e->op = is(token, "MINUS") ? OP_NEG : OP_NOT;
    e->a = build_expr(kid(n, 1));
    return e;
  }
  return build_postfix(first);
}

static Expr *build_expr(const Node *n) {
  if (is(n, "expression"))
    return build_expr(kid(n, 0));
  if (is(n, "unary_expr"))
    return build_unary(n);
  if (is(n, "postfix_expr"))
    return build_postfix(n);
  return build_binary(n); /* or_expr, and_expr, equality_expr, ... */
}

/* ---------- Comandos ---------- */

static Stmt *new_stmt(StmtKind kind, const Node *at) {
  Stmt *s = ast_alloc(sizeof *s);
  s->kind = kind;
  s->pos = pos_of(at);
  return s;
}

static Name make_name(const Node *token) {
  Name n = {dup(token->text), pos_of(token)};
  return n;
}

/* <rhs> ::= CALL IDENTIFIER LPAREN <args> RPAREN | RUN <object_literal>
 *         | <expression_list> */
static Rhs *build_rhs(const Node *rhs) {
  Rhs *r = ast_alloc(sizeof *r);
  const Node *first = kid(rhs, 0);
  r->pos = pos_of(rhs);
  Vec items = {0};
  if (is(first, "CALL")) {
    r->kind = RHS_CALL;
    r->callee = make_name(kid(rhs, 1));
    build_args(kid(rhs, 3), &items);
    r->args = (Expr **)items.v;
    r->n_args = items.n;
  } else if (is(first, "RUN")) {
    r->kind = RHS_RUN;
    r->run = build_object(kid(rhs, 1));
  } else {
    r->kind = RHS_EXPRS;
    build_expr_list(first, &items);
    r->exprs = (Expr **)items.v;
    r->n_exprs = items.n;
  }
  return r;
}

/* RHS_EXPRS a partir de uma <expression_list> solta (o const) */
static Rhs *rhs_from_list(const Node *list) {
  Rhs *r = ast_alloc(sizeof *r);
  Vec items = {0};
  r->kind = RHS_EXPRS;
  r->pos = pos_of(list);
  build_expr_list(list, &items);
  r->exprs = (Expr **)items.v;
  r->n_exprs = items.n;
  return r;
}

/* <identifier_list> ::= IDENTIFIER <identifier_list_rest>
 * <identifier_list_rest> ::= COMMA IDENTIFIER <identifier_list_rest> | e */
static void build_names(const Node *list, Stmt *s) {
  Vec names = {0};
  Name *n = ast_alloc(sizeof *n);
  *n = make_name(kid(list, 0));
  push(&names, n);
  const Node *rest = kid(list, 1);
  while (filled(rest)) {
    n = ast_alloc(sizeof *n);
    *n = make_name(kid(rest, 1));
    push(&names, n);
    rest = kid(rest, 2);
  }
  s->names = (Name **)names.v;
  s->n_names = names.n;
}

/* <variable_declaration> ::= VAR <identifier_list> <variable_rest> SEMICOLON
 * <variable_rest> ::= COLON <type> <initializer> | ASSIGN <rhs>
 * <initializer> ::= ASSIGN <rhs> | e */
static Stmt *build_var(const Node *n) {
  Stmt *s = new_stmt(ST_VAR, n);
  build_names(kid(n, 1), s);
  const Node *rest = kid(n, 2);
  if (is(kid(rest, 0), "COLON")) {
    s->declared = build_type(kid(rest, 1));
    const Node *init = kid(rest, 2);
    if (filled(init))
      s->rhs = build_rhs(kid(init, 1));
  } else {
    s->rhs = build_rhs(kid(rest, 1));
  }
  return s;
}

/* <constant_declaration> ::= CONST <identifier_list> <constant_rest> SEMICOLON
 * <constant_rest> ::= COLON <type> ASSIGN <expression_list>
 *                   | ASSIGN <expression_list> */
static Stmt *build_const(const Node *n) {
  Stmt *s = new_stmt(ST_VAR, n);
  s->is_const = 1;
  build_names(kid(n, 1), s);
  const Node *rest = kid(n, 2);
  if (is(kid(rest, 0), "COLON")) {
    s->declared = build_type(kid(rest, 1));
    s->rhs = rhs_from_list(kid(rest, 3));
  } else {
    s->rhs = rhs_from_list(kid(rest, 1));
  }
  return s;
}

static Stmt *build_block(const Node *block);

/* <command_expression> ::= <expression> <assignment_rest> SEMICOLON
 * <assignment_rest> ::= ASSIGN <rhs> | COMMA <expression_list> ASSIGN <rhs> | e */
static Stmt *build_expression_stmt(const Node *n) {
  Expr *first = build_expr(kid(n, 0));
  const Node *rest = kid(n, 1);
  if (!filled(rest)) {
    Stmt *s = new_stmt(ST_EXPR, n);
    s->exprs = ast_alloc(sizeof(Expr *));
    s->exprs[0] = first;
    s->n_exprs = 1;
    return s;
  }
  Stmt *s = new_stmt(ST_ASSIGN, n);
  Vec targets = {0};
  push(&targets, first);
  if (is(kid(rest, 0), "COMMA")) { /* a, b = ... */
    Vec more = {0};
    build_expr_list(kid(rest, 1), &more);
    for (int i = 0; i < more.n; i++)
      push(&targets, more.v[i]);
    s->rhs = build_rhs(kid(rest, 3));
  } else {
    s->rhs = build_rhs(kid(rest, 1));
  }
  s->targets = (Expr **)targets.v;
  s->n_targets = targets.n;
  return s;
}

static Stmt *build_command(const Node *cmd) {
  const Node *n = kid(cmd, 0);
  if (is(n, "variable_declaration"))
    return build_var(n);
  if (is(n, "constant_declaration"))
    return build_const(n);
  if (is(n, "command_expression"))
    return build_expression_stmt(n);

  if (is(n, "command_if")) { /* IF ( expr ) block else_part */
    Stmt *s = new_stmt(ST_IF, n);
    s->cond = build_expr(kid(n, 2));
    s->then = build_block(kid(n, 4));
    const Node *els = kid(n, 5);
    if (filled(els))
      s->els = build_block(kid(els, 1));
    return s;
  }
  if (is(n, "command_while")) { /* WHILE ( expr ) block */
    Stmt *s = new_stmt(ST_WHILE, n);
    s->cond = build_expr(kid(n, 2));
    s->then = build_block(kid(n, 4));
    return s;
  }
  if (is(n, "command_for")) { /* FOR IDENTIFIER IN expr block */
    Stmt *s = new_stmt(ST_FOR, n);
    s->var = make_name(kid(n, 1));
    s->cond = build_expr(kid(n, 3));
    s->then = build_block(kid(n, 4));
    return s;
  }
  if (is(n, "command_return")) { /* RETURN <return_values> SEMICOLON */
    Stmt *s = new_stmt(ST_RETURN, n);
    const Node *values = kid(n, 1);
    Vec items = {0};
    if (filled(values))
      build_expr_list(kid(values, 0), &items);
    s->exprs = (Expr **)items.v;
    s->n_exprs = items.n;
    return s;
  }
  if (is(n, "command_break"))
    return new_stmt(ST_BREAK, n);
  if (is(n, "command_continue"))
    return new_stmt(ST_CONTINUE, n);

  /* command_error: <error_action> IF IDENTIFIER SEMICOLON */
  Stmt *s = new_stmt(ST_ERRACT, n);
  const Node *action = kid(kid(n, 0), 0);
  s->act = is(action, "STOP") ? ACT_STOP : is(action, "ABORT") ? ACT_ABORT : ACT_PROCEED;
  s->var = make_name(kid(n, 2));
  return s;
}

/* <block> ::= LBRACE <commands> RBRACE
 * <commands> ::= <command> <commands> | e */
static Stmt *build_block(const Node *block) {
  Stmt *s = new_stmt(ST_BLOCK, block);
  Vec stmts = {0};
  const Node *commands = kid(block, 1);
  while (filled(commands)) {
    push(&stmts, build_command(kid(commands, 0)));
    commands = kid(commands, 1);
  }
  s->stmts = (Stmt **)stmts.v;
  s->n_stmts = stmts.n;
  return s;
}

/* ---------- Declarações ---------- */

/* <function_rest> ::= LPAREN <parameter_list> RPAREN <return_type> <block>
 * <parameter_list> ::= <parameters> | e
 * <parameters> ::= <parameter> <parameters_rest>
 * <parameters_rest> ::= COMMA <parameter> <parameters_rest> | e
 * <parameter> ::= IDENTIFIER COLON <type>
 * <return_type> ::= COLON <type> | e */
static Func *build_func(const Node *name, const Node *rest, int is_workflow) {
  Func *f = ast_alloc(sizeof *f);
  f->name = make_name(name);
  f->is_workflow = is_workflow;

  Vec params = {0};
  const Node *list = kid(rest, 1);
  if (filled(list)) {
    const Node *parameters = kid(list, 0);
    const Node *p = kid(parameters, 0);
    const Node *more = kid(parameters, 1);
    for (;;) {
      Param *param = ast_alloc(sizeof *param);
      param->name = make_name(kid(p, 0));
      param->type = build_type(kid(p, 2));
      push(&params, param);
      if (!filled(more))
        break;
      p = kid(more, 1);
      more = kid(more, 2);
    }
  }
  f->params = (Param **)params.v;
  f->n_params = params.n;

  const Node *ret = kid(rest, 3);
  if (filled(ret))
    f->ret = build_type(kid(ret, 1));
  f->body = build_block(kid(rest, 4));
  return f;
}

static void add_decl(Vec *decls, Stmt *var, Func *func) {
  Decl *d = ast_alloc(sizeof *d);
  d->var = var;
  d->func = func;
  push(decls, d);
}

/* <global_no_func> ::= <variable_declaration> | <constant_declaration>
 *                    | <workflow>
 * <workflow> ::= WORKFLOW IDENTIFIER <function_rest> */
static void add_global(Vec *decls, const Node *g) {
  const Node *n = kid(g, 0);
  if (is(n, "variable_declaration"))
    add_decl(decls, build_var(n), NULL);
  else if (is(n, "constant_declaration"))
    add_decl(decls, build_const(n), NULL);
  else
    add_decl(decls, NULL, build_func(kid(n, 1), kid(n, 2), 1));
}

/* Percorre <before_main>, <after_func> e <after_main>, que se chamam em
 * círculo (ver a seção 1 da BNF), juntando as declarações na ordem do arquivo. */
Program *build_ast(const Node *root) {
  if (!root || has_error_node(root))
    return NULL;

  Program *program = ast_alloc(sizeof *program);
  Vec decls = {0};
  const Node *cur = kid(root, 0); /* before_main */

  for (;;) {
    if (is(cur, "before_main")) {
      if (is(kid(cur, 0), "global_no_func")) {
        add_global(&decls, kid(cur, 0));
        cur = kid(cur, 1);
      } else { /* FUNC <after_func> */
        cur = kid(cur, 1);
      }
    } else if (is(cur, "after_func")) {
      if (is(kid(cur, 0), "MAIN")) { /* MAIN ( ) <block> <after_main> */
        Func *f = ast_alloc(sizeof *f);
        f->name = make_name(kid(cur, 0));
        f->is_main = 1;
        f->body = build_block(kid(cur, 3));
        program->main = f;
        add_decl(&decls, NULL, f);
        cur = kid(cur, 4);
      } else { /* IDENTIFIER <function_rest> <before_main> */
        add_decl(&decls, NULL, build_func(kid(cur, 0), kid(cur, 1), 0));
        cur = kid(cur, 2);
      }
    } else { /* after_main */
      if (!filled(cur))
        break;
      if (is(kid(cur, 0), "global_no_func")) {
        add_global(&decls, kid(cur, 0));
        cur = kid(cur, 1);
      } else { /* FUNC IDENTIFIER <function_rest> <after_main> */
        add_decl(&decls, NULL, build_func(kid(cur, 1), kid(cur, 2), 0));
        cur = kid(cur, 3);
      }
    }
  }

  program->n_decls = decls.n;
  program->decls = ast_alloc(decls.n * sizeof(Decl) + 1);
  for (int i = 0; i < decls.n; i++)
    program->decls[i] = *(Decl *)decls.v[i];
  return program;
}
