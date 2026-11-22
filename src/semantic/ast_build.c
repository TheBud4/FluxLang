#include "ast.h"
#include "mem.h"
#include "tree.h"
#include <stdlib.h>
#include <string.h>

static const Node *kid(const Node *n, int i) {
  const Node *c = n->first_child;
  while (c && i-- > 0)
    c = c->next;
  return c;
}

static int is(const Node *n, const char *label) {
  return n && strcmp(n->label, label) == 0;
}

static int filled(const Node *n) {
  return n->first_child && n->first_child->kind != NODE_EMPTY;
}

static Pos pos_of(const Node *n) {
  Pos p = {n->line, n->column};
  return p;
}

static char *dup(const char *s) {
  return mem_strdup(s);
}

static int has_error_node(const Node *n) {
  if (n->kind == NODE_ERROR)
    return 1;
  for (const Node *c = n->first_child; c; c = c->next)
    if (has_error_node(c))
      return 1;
  return 0;
}

typedef struct {
  void **v;
  int n, cap;
} Vec;

static void push(Vec *vec, void *p) {
  if (vec->n == vec->cap) {
    int cap = vec->cap ? vec->cap * 2 : 8;
    vec->v = mem_grow(vec->v, vec->cap * sizeof(void *), cap * sizeof(void *));
    vec->cap = cap;
  }
  vec->v[vec->n++] = p;
}

static Type *build_type(const Node *t) {
  const Node *first = kid(t, 0);
  if (is(first, "TYPE_INT"))    return type_prim(T_INT);
  if (is(first, "TYPE_FLOAT"))  return type_prim(T_FLOAT);
  if (is(first, "TYPE_STRING")) return type_prim(T_STRING);
  if (is(first, "TYPE_BOOL"))   return type_prim(T_BOOL);
  if (is(first, "TYPE_OBJECT")) return type_prim(T_OBJECT);
  return type_list(build_type(kid(t, 2)));
}

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

static void build_expr_list(const Node *list, Vec *out) {
  push(out, build_expr(kid(list, 0)));
  const Node *rest = kid(list, 1);
  while (filled(rest)) {
    push(out, build_expr(kid(rest, 1)));
    rest = kid(rest, 2);
  }
}

static void build_args(const Node *args, Vec *out) {
  if (filled(args))
    build_expr_list(kid(args, 0), out);
}

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

static void build_field(const Node *field, Vec *keys, Vec *values) {
  const Node *key = kid(kid(field, 0), 0);
  char *text = dup(key->text);
  if (is(key, "STRING_LITERAL")) {
    size_t len = strlen(text);
    memmove(text, text + 1, len - 2);
    text[len - 2] = '\0';
  }
  push(keys, text);
  push(values, build_expr(kid(field, 2)));
}

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
  } else {
    e = new_expr(EX_BOOL, first);
    e->bval = is(first, "TRUE");
  }
  return e;
}

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
    } else {
      Vec args = {0};
      build_args(kid(rest, 1), &args);
      e = new_expr(EX_CALL, first);
      e->pos = base->pos;
      e->a = base;
      e->items = (Expr **)args.v;
      e->n_items = args.n;
    }
    base = e;
    rest = rest->last_child;
  }
  return base;
}

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
  return build_binary(n);
}

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
  if (is(kid(rest, 0), "COMMA")) {
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

  if (is(n, "command_if")) {
    Stmt *s = new_stmt(ST_IF, n);
    s->cond = build_expr(kid(n, 2));
    s->then = build_block(kid(n, 4));
    const Node *els = kid(n, 5);
    if (filled(els))
      s->els = build_block(kid(els, 1));
    return s;
  }
  if (is(n, "command_while")) {
    Stmt *s = new_stmt(ST_WHILE, n);
    s->cond = build_expr(kid(n, 2));
    s->then = build_block(kid(n, 4));
    return s;
  }
  if (is(n, "command_for")) {
    Stmt *s = new_stmt(ST_FOR, n);
    s->var = make_name(kid(n, 1));
    s->cond = build_expr(kid(n, 3));
    s->then = build_block(kid(n, 4));
    return s;
  }
  if (is(n, "command_return")) {
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

  Stmt *s = new_stmt(ST_ERRACT, n);
  const Node *action = kid(kid(n, 0), 0);
  s->act = is(action, "STOP") ? ACT_STOP : is(action, "ABORT") ? ACT_ABORT : ACT_PROCEED;
  s->var = make_name(kid(n, 2));
  return s;
}

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

static void add_global(Vec *decls, const Node *g) {
  const Node *n = kid(g, 0);
  if (is(n, "variable_declaration"))
    add_decl(decls, build_var(n), NULL);
  else if (is(n, "constant_declaration"))
    add_decl(decls, build_const(n), NULL);
  else
    add_decl(decls, NULL, build_func(kid(n, 1), kid(n, 2), 1));
}

Program *build_ast(const Node *root) {
  if (!root || has_error_node(root))
    return NULL;

  Program *program = ast_alloc(sizeof *program);
  Vec decls = {0};
  const Node *cur = kid(root, 0);

  for (;;) {
    if (is(cur, "before_main")) {
      if (is(kid(cur, 0), "global_no_func")) {
        add_global(&decls, kid(cur, 0));
        cur = kid(cur, 1);
      } else {
        cur = kid(cur, 1);
      }
    } else if (is(cur, "after_func")) {
      if (is(kid(cur, 0), "MAIN")) {
        Func *f = ast_alloc(sizeof *f);
        f->name = make_name(kid(cur, 0));
        f->is_main = 1;
        f->body = build_block(kid(cur, 3));
        program->main = f;
        add_decl(&decls, NULL, f);
        cur = kid(cur, 4);
      } else {
        add_decl(&decls, NULL, build_func(kid(cur, 0), kid(cur, 1), 0));
        cur = kid(cur, 2);
      }
    } else {
      if (!filled(cur))
        break;
      if (is(kid(cur, 0), "global_no_func")) {
        add_global(&decls, kid(cur, 0));
        cur = kid(cur, 1);
      } else {
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
