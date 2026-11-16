#include "ast.h"
#include "fluxc.h"
#include "mem.h"
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
  int line, column, order;
  char message[300];
} Diag;

static Diag *diags;
static int n_diags, cap_diags;

static void err(Pos pos, const char *fmt, ...) {
  if (n_diags == cap_diags) {
    int cap = cap_diags ? cap_diags * 2 : 32;
    diags = mem_grow(diags, cap_diags * sizeof *diags, cap * sizeof *diags);
    cap_diags = cap;
  }
  Diag *d = &diags[n_diags];
  d->line = pos.line;
  d->column = pos.column;
  d->order = n_diags;
  va_list args;
  va_start(args, fmt);
  vsnprintf(d->message, sizeof d->message, fmt, args);
  va_end(args);
  for (int i = 0; i < n_diags; i++)
    if (diags[i].line == d->line && diags[i].column == d->column &&
        strcmp(diags[i].message, d->message) == 0)
      return;
  n_diags++;
}

static int by_position(const void *a, const void *b) {
  const Diag *x = a, *y = b;
  if (x->line != y->line)
    return x->line - y->line;
  if (x->column != y->column)
    return x->column - y->column;
  return x->order - y->order;
}

static Type *T(TypeKind k) { return type_prim(k); }

static const char *tn(const Type *t) {
  static char bufs[4][160];
  static int next;
  char *buf = bufs[next++ % 4];
  return type_name(t, buf, sizeof bufs[0]);
}

static int is_num(const Type *t) { return t->kind == T_INT || t->kind == T_FLOAT; }
static int num_or_dyn(const Type *t) { return is_num(t) || t->kind == T_DYN; }

static const char *plural(int n, const char *one, const char *many) {
  return n == 1 ? one : many;
}

typedef enum { SYM_VAR, SYM_FUNC, SYM_WORKFLOW, SYM_LIBFN, SYM_TERMINAL } SymKind;

#define MAX_SYMS 8192

typedef struct Symbol {
  char *name;
  SymKind kind;
  Type *type;
  int is_const;
  int flow_id;
  int is_err;
  int handled;
  Pos err_pos;
  Func *func;
  Pos decl_pos;
  struct Symbol *next;
} Symbol;

typedef struct Scope {
  Symbol *syms;
  struct Scope *parent;
} Scope;

static Scope *scope;
static Scope *globals;
static int next_flow_id;

static void scope_push(void) {
  Scope *s = ast_alloc(sizeof *s);
  s->parent = scope;
  scope = s;
}

static void scope_pop(void) {
  for (Symbol *s = scope->syms; s; s = s->next)
    if (s->is_err && !s->handled)
      err(s->err_pos, "O erro '%s' não foi tratado.", s->name);
  scope = scope->parent;
}

static Symbol *lookup(const char *name) {
  for (Scope *sc = scope; sc; sc = sc->parent)
    for (Symbol *s = sc->syms; s; s = s->next)
      if (strcmp(s->name, name) == 0)
        return s;
  return NULL;
}

static Symbol *new_symbol(const char *name, SymKind kind, Type *type) {
  Symbol *s = ast_alloc(sizeof *s);
  s->name = (char *)name;
  s->kind = kind;
  s->type = type;
  s->flow_id = -1;
  return s;
}

static Symbol *declare(Name *name, SymKind kind, Type *type) {
  if (lookup(name->name)) {
    err(name->pos, "'%s' já foi declarada.", name->name);
    return NULL;
  }
  Symbol *s = new_symbol(name->name, kind, type);
  s->decl_pos = name->pos;
  s->next = scope->syms;
  scope->syms = s;
  return s;
}

typedef struct {
  unsigned char init[MAX_SYMS];
  int dead;
} Flow;

static Flow flow;

static Flow merge(const Flow *a, const Flow *b) {
  if (a->dead)
    return *b;
  if (b->dead)
    return *a;
  Flow r;
  r.dead = 0;
  for (int i = 0; i < MAX_SYMS; i++)
    r.init[i] = a->init[i] && b->init[i];
  return r;
}

static void mark_initialized(Symbol *s) {
  if (s->flow_id >= 0)
    flow.init[s->flow_id] = 1;
}

static Func *cur_func;
static int loop_depth;
static int in_global_init;

static int can_use_call_run(void) {
  return cur_func && (cur_func->is_workflow || cur_func->is_main);
}

static Type *check_expr(Expr *e);

static const char *callee_name(const Expr *e);

static Type *value_of(Expr *e) {
  Type *t = check_expr(e);
  if (t->kind == T_VOID) {
    err(e->pos, "'%s' não retorna valor.", callee_name(e));
    e->type = T(T_ERROR);
    return e->type;
  }
  return t;
}

static const char *callee_name(const Expr *e) {
  if (e->kind == EX_CALL)
    return callee_name(e->a);
  if (e->kind == EX_IDENT || e->kind == EX_FIELD)
    return e->text;
  return "valor";
}

static void expect_assignable(Type *to, Expr *e, Type *got) {
  if (!type_assignable(to, got))
    err(e->pos, "Tipo incompatível: esperado %s, encontrado %s.", tn(to), tn(got));
}

static void check_assign_to(Type *to, Expr *e) {
  if (e->kind == EX_LIST && to->kind == T_LIST) {
    for (int i = 0; i < e->n_items; i++)
      check_assign_to(to->elem, e->items[i]);
    e->type = to;
    return;
  }
  Type *got = value_of(e);
  expect_assignable(to, e, got);
}

static Type *check_cond(Expr *e, const char *keyword) {
  Type *t = value_of(e);
  if (t->kind != T_BOOL && t->kind != T_DYN && t->kind != T_ERROR)
    err(e->pos, "A condição do '%s' deve ser bool, encontrado %s.", keyword, tn(t));
  return t;
}

static const char *op_text(Op op) {
  switch (op) {
  case OP_OR:  return "||";  case OP_AND: return "&&";
  case OP_EQ:  return "==";  case OP_NE:  return "!=";
  case OP_LT:  return "<";   case OP_LE:  return "<=";
  case OP_GT:  return ">";   case OP_GE:  return ">=";
  case OP_ADD: return "+";   case OP_SUB: return "-";
  case OP_MUL: return "*";   case OP_DIV: return "/";
  case OP_MOD: return "%";   case OP_NEG: return "-";
  default:     return "!";
  }
}

static Type *check_binary(Expr *e) {
  Type *l = value_of(e->a), *r = value_of(e->b);
  if (l->kind == T_ERROR || r->kind == T_ERROR)
    return T(T_ERROR);
  int dyn = l->kind == T_DYN || r->kind == T_DYN;
  Type *bad = NULL;

  switch (e->op) {
  case OP_ADD:
    if (l->kind == T_STRING && r->kind == T_STRING)
      return T(T_STRING);
    if (dyn && (l->kind == T_STRING || r->kind == T_STRING))
      return T(T_DYN);
  case OP_SUB: case OP_MUL: case OP_DIV:
    if (num_or_dyn(l) && num_or_dyn(r)) {
      if (dyn)
        return T(T_DYN);
      return T(l->kind == T_FLOAT || r->kind == T_FLOAT ? T_FLOAT : T_INT);
    }
    bad = l;
    break;
  case OP_MOD:
    if ((l->kind == T_INT || l->kind == T_DYN) && (r->kind == T_INT || r->kind == T_DYN))
      return T(dyn ? T_DYN : T_INT);
    bad = l;
    break;
  case OP_LT: case OP_LE: case OP_GT: case OP_GE:
    if (num_or_dyn(l) && num_or_dyn(r))
      return T(T_BOOL);
    bad = l;
    break;
  case OP_EQ: case OP_NE:
    if (dyn || l->kind == T_NULL || r->kind == T_NULL)
      return T(T_BOOL);
    if (is_num(l) && is_num(r))
      return T(T_BOOL);
    if (l->kind == r->kind && l->kind != T_LIST && l->kind != T_OBJECT)
      return T(T_BOOL);
    bad = l;
    break;
  case OP_AND: case OP_OR:
    if ((l->kind == T_BOOL || l->kind == T_DYN) && (r->kind == T_BOOL || r->kind == T_DYN))
      return T(T_BOOL);
    bad = l;
    break;
  default:
    break;
  }
  if (bad)
    err(e->pos, "Operador '%s' não aceita %s e %s.", op_text(e->op), tn(l), tn(r));
  return T(T_ERROR);
}

static Type *check_unary(Expr *e) {
  Type *t = value_of(e->a);
  if (t->kind == T_ERROR)
    return t;
  if (e->op == OP_NEG && (is_num(t) || t->kind == T_DYN))
    return t;
  if (e->op == OP_NOT && (t->kind == T_BOOL || t->kind == T_DYN))
    return T(T_BOOL);
  err(e->pos, "Operador '%s' não aceita %s.", op_text(e->op), tn(t));
  return T(T_ERROR);
}

static int is_terminal(const Expr *e) {
  if (e->kind != EX_IDENT)
    return 0;
  Symbol *s = lookup(e->text);
  return s && s->kind == SYM_TERMINAL;
}

static Type *check_ident(Expr *e) {
  Symbol *s = lookup(e->text);
  if (!s) {
    err(e->pos, "'%s' não foi declarado.", e->text);
    return T(T_ERROR);
  }
  switch (s->kind) {
  case SYM_FUNC:
  case SYM_WORKFLOW:
  case SYM_LIBFN:
    err(e->pos, "Tipo incompatível: '%s' é uma função, não um valor.", e->text);
    return T(T_ERROR);
  case SYM_TERMINAL:
    err(e->pos, "Tipo incompatível: 'terminal' não é um valor.");
    return T(T_ERROR);
  default:
    break;
  }
  if (!s->type) {
    err(e->pos, "'%s' só é declarado depois deste ponto.", e->text);
    return T(T_ERROR);
  }
  if (s->flow_id >= 0 && !flow.dead && !flow.init[s->flow_id]) {
    err(e->pos, "Variável '%s' utilizada antes de ser inicializada.", e->text);
    flow.init[s->flow_id] = 1;
  }
  return s->type;
}

static Type *check_index(Expr *e) {
  Type *base = value_of(e->a);
  Type *idx = value_of(e->b);
  if (base->kind == T_ERROR || idx->kind == T_ERROR)
    return T(T_ERROR);
  if (base->kind == T_DYN)
    return T(T_DYN);
  if (base->kind == T_LIST) {
    if (idx->kind != T_INT && idx->kind != T_DYN)
      err(e->b->pos, "Índice de lista deve ser int, encontrado %s.", tn(idx));
    return base->elem->kind == T_NULL ? T(T_DYN) : base->elem;
  }
  if (base->kind == T_OBJECT) {
    if (idx->kind != T_STRING && idx->kind != T_DYN) {
      err(e->b->pos, "Chave de object deve ser string, encontrado %s.", tn(idx));
      return T(T_ERROR);
    }
    return T(T_DYN);
  }
  err(e->pos, "'%s' não é uma lista nem um object e não aceita [ ].", callee_name(e->a));
  return T(T_ERROR);
}

static Type *check_field(Expr *e) {
  if (is_terminal(e->a)) {
    err(e->pos, "Tipo incompatível: 'terminal.%s' é uma função, não um valor.", e->text);
    return T(T_ERROR);
  }
  Type *base = value_of(e->a);
  if (base->kind == T_ERROR)
    return base;
  if (base->kind == T_OBJECT || base->kind == T_DYN)
    return T(T_DYN);
  err(e->pos, "Tipo incompatível: esperado object, encontrado %s.", tn(base));
  return T(T_ERROR);
}

static Type *check_list_literal(Expr *e) {
  Type *elem = NULL;
  int had_error = 0;
  for (int i = 0; i < e->n_items; i++) {
    Type *t = value_of(e->items[i]);
    if (t->kind == T_ERROR) {
      had_error = 1;
      continue;
    }
    if (!elem)
      elem = t;
    else if (type_assignable(elem, t)) {
    } else if (type_assignable(t, elem)) {
      elem = t;
    } else {
      err(e->items[i]->pos, "Tipo incompatível: esperado %s, encontrado %s.", tn(elem), tn(t));
    }
  }
  if (!elem)
    return had_error ? T(T_ERROR) : type_list(T(T_NULL));
  return type_list(elem);
}

static Type *check_object_literal(Expr *e) {
  for (int i = 0; i < e->n_items; i++)
    value_of(e->items[i]);
  return T(T_OBJECT);
}

static void check_arg_count(Expr *call, const char *name, int expected) {
  if (call->n_items != expected)
    err(call->pos, "'%s' espera %d %s, recebeu %d.", name, expected,
        plural(expected, "argumento", "argumentos"), call->n_items);
}

static void eval_args(Expr *call) {
  for (int i = 0; i < call->n_items; i++)
    value_of(call->items[i]);
}

static void check_args_against(Expr *call, const char *name, Param **params, int n) {
  check_arg_count(call, name, n);
  for (int i = 0; i < call->n_items; i++) {
    if (i < n)
      check_assign_to(params[i]->type, call->items[i]);
    else
      value_of(call->items[i]);
  }
}

static Type *check_conversion(Expr *call, const char *name) {
  check_arg_count(call, name, 1);
  eval_args(call);
  if (call->n_items < 1)
    return T(T_ERROR);
  Type *a = call->items[0]->type;
  if (a->kind == T_ERROR || a->kind == T_DYN) {
  } else if (strcmp(name, "toInt") == 0 && a->kind != T_STRING && a->kind != T_FLOAT) {
    err(call->items[0]->pos, "Tipo incompatível: esperado string ou float, encontrado %s.", tn(a));
  } else if (strcmp(name, "toFloat") == 0 && a->kind != T_STRING && a->kind != T_INT) {
    err(call->items[0]->pos, "Tipo incompatível: esperado string ou int, encontrado %s.", tn(a));
  } else if (strcmp(name, "toBool") == 0 && a->kind != T_STRING) {
    err(call->items[0]->pos, "Tipo incompatível: esperado string, encontrado %s.", tn(a));
  }
  if (strcmp(name, "toInt") == 0)    return T(T_INT);
  if (strcmp(name, "toFloat") == 0)  return T(T_FLOAT);
  if (strcmp(name, "toBool") == 0)   return T(T_BOOL);
  return T(T_STRING);
}

static Type *check_terminal_call(Expr *call, const char *method) {
  if (strcmp(method, "log") == 0 || strcmp(method, "info") == 0 ||
      strcmp(method, "warn") == 0 || strcmp(method, "error") == 0) {
    char name[40];
    snprintf(name, sizeof name, "terminal.%s", method);
    check_arg_count(call, name, 1);
    eval_args(call);
    return T(T_VOID);
  }
  if (strcmp(method, "input") == 0) {
    if (call->n_items > 1)
      err(call->pos, "'terminal.input' espera até 1 argumento, recebeu %d.", call->n_items);
    for (int i = 0; i < call->n_items; i++) {
      Type *t = value_of(call->items[i]);
      expect_assignable(T(T_STRING), call->items[i], t);
    }
    return T(T_STRING);
  }
  err(call->a->pos, "'terminal' não tem o método '%s'.", method);
  eval_args(call);
  return T(T_ERROR);
}

static Type *check_list_method(Expr *call, const char *method, Type *base) {
  int dyn = base->kind == T_DYN;
  if (strcmp(method, "length") == 0) {
    check_arg_count(call, "length", 0);
    eval_args(call);
    return T(T_INT);
  }
  if (strcmp(method, "push") == 0) {
    check_arg_count(call, "push", 1);
    if (call->n_items >= 1) {
      if (!dyn && base->elem->kind != T_NULL)
        check_assign_to(base->elem, call->items[0]);
      else
        value_of(call->items[0]);
    }
    return T(T_VOID);
  }
  check_arg_count(call, "remove", 1);
  if (call->n_items >= 1) {
    Type *t = value_of(call->items[0]);
    if (t->kind != T_INT && t->kind != T_DYN && t->kind != T_ERROR)
      err(call->items[0]->pos, "Tipo incompatível: esperado int, encontrado %s.", tn(t));
  }
  return T(T_VOID);
}

static Type *check_method_call(Expr *call) {
  Expr *callee = call->a;
  const char *method = callee->text;
  if (is_terminal(callee->a))
    return check_terminal_call(call, method);

  Type *base = value_of(callee->a);
  if (base->kind == T_ERROR) {
    eval_args(call);
    return base;
  }
  int is_list_method = strcmp(method, "length") == 0 || strcmp(method, "push") == 0 ||
                       strcmp(method, "remove") == 0;
  if ((base->kind == T_LIST || base->kind == T_DYN) && is_list_method)
    return check_list_method(call, method, base);

  err(callee->pos, "'%s' não tem o método '%s'.", callee_name(callee->a), method);
  eval_args(call);
  return T(T_ERROR);
}

static Type *check_call(Expr *call) {
  Expr *callee = call->a;
  if (callee->kind == EX_FIELD)
    return check_method_call(call);

  if (callee->kind != EX_IDENT) {
    err(call->pos, "Isso não é uma função e não pode ser chamado.");
    eval_args(call);
    return T(T_ERROR);
  }
  Symbol *s = lookup(callee->text);
  if (!s) {
    err(callee->pos, "'%s' não foi declarado.", callee->text);
    eval_args(call);
    return T(T_ERROR);
  }
  switch (s->kind) {
  case SYM_FUNC:
    check_args_against(call, s->name, s->func->params, s->func->n_params);
    return s->func->ret ? s->func->ret : T(T_VOID);
  case SYM_WORKFLOW:
    err(callee->pos, "'%s' é um workflow e deve ser chamado com 'call'.", s->name);
    eval_args(call);
    return T(T_ERROR);
  case SYM_LIBFN:
    return check_conversion(call, s->name);
  case SYM_TERMINAL:
    err(callee->pos, "'terminal' não é uma função.");
    eval_args(call);
    return T(T_ERROR);
  default:
    err(callee->pos, "'%s' não é uma função.", s->name);
    eval_args(call);
    return T(T_ERROR);
  }
}

static Type *check_expr(Expr *e) {
  Type *t;
  switch (e->kind) {
  case EX_INT:    t = T(T_INT); break;
  case EX_FLOAT:  t = T(T_FLOAT); break;
  case EX_STRING: t = T(T_STRING); break;
  case EX_BOOL:   t = T(T_BOOL); break;
  case EX_NULL:   t = T(T_NULL); break;
  case EX_IDENT:  t = check_ident(e); break;
  case EX_UNARY:  t = check_unary(e); break;
  case EX_BINARY: t = check_binary(e); break;
  case EX_INDEX:  t = check_index(e); break;
  case EX_FIELD:  t = check_field(e); break;
  case EX_CALL:   t = check_call(e); break;
  case EX_LIST:   t = check_list_literal(e); break;
  default:        t = check_object_literal(e); break;
  }
  e->type = t;
  return t;
}

static void check_run_object(Expr *obj) {
  int seen_command = 0;
  for (int i = 0; i < obj->n_items; i++) {
    const char *key = obj->keys[i];
    Expr *value = obj->items[i];
    Type *t = value_of(value);
    int known = strcmp(key, "command") == 0 || strcmp(key, "flags") == 0 ||
                strcmp(key, "workingDir") == 0;
    int repeated = 0;
    for (int j = 0; j < i; j++)
      if (strcmp(obj->keys[j], key) == 0)
        repeated = 1;
    if (!known) {
      err(value->pos, "'run' não aceita o campo '%s'.", key);
      continue;
    }
    if (repeated) {
      err(value->pos, "'run' tem o campo '%s' repetido.", key);
      continue;
    }
    if (strcmp(key, "command") == 0) {
      seen_command = 1;
      if (t->kind != T_STRING && t->kind != T_DYN && t->kind != T_ERROR)
        err(value->pos, "O campo 'command' de 'run' deve ser string, encontrado %s.", tn(t));
    } else if (strcmp(key, "workingDir") == 0) {
      if (t->kind != T_STRING && t->kind != T_DYN && t->kind != T_ERROR)
        err(value->pos, "O campo 'workingDir' de 'run' deve ser string, encontrado %s.", tn(t));
    } else if (!type_assignable(type_list(T(T_STRING)), t)) {
      err(value->pos, "O campo 'flags' de 'run' deve ser list<string>, encontrado %s.", tn(t));
    }
  }
  if (!seen_command)
    err(obj->pos, "'run' sem o campo obrigatório 'command'.");
}

static Type *check_call_or_run(Rhs *r) {
  if (!can_use_call_run()) {
    err(r->pos, "'%s' só pode ser usado em workflow ou na main.",
        r->kind == RHS_CALL ? "call" : "run");
  }
  if (r->kind == RHS_RUN) {
    check_run_object(r->run);
    return T(T_STRING);
  }
  Symbol *s = lookup(r->callee.name);
  Expr fake = {0};
  fake.n_items = r->n_args;
  fake.items = r->args;
  fake.pos = r->callee.pos;
  if (!s) {
    err(r->callee.pos, "'%s' não foi declarado.", r->callee.name);
    eval_args(&fake);
    return T(T_ERROR);
  }
  if (s->kind == SYM_FUNC) {
    err(r->callee.pos, "'%s' é uma função e deve ser chamada sem 'call'.", s->name);
    eval_args(&fake);
    return T(T_ERROR);
  }
  if (s->kind != SYM_WORKFLOW) {
    err(r->callee.pos, "'%s' não é um workflow.", s->name);
    eval_args(&fake);
    return T(T_ERROR);
  }
  check_args_against(&fake, s->name, s->func->params, s->func->n_params);
  return s->func->ret ? s->func->ret : T(T_NULL);
}

static void check_stmt(Stmt *s);
static void check_block(Stmt *block);

static void count_mismatch(Pos pos, int vars, int values) {
  err(pos, "%d %s e %d %s.", vars, plural(vars, "variável", "variáveis"), values,
      plural(values, "valor", "valores"));
}

static void make_error_var(Symbol *s, Pos pos) {
  s->is_err = 1;
  s->handled = 0;
  s->err_pos = pos;
}

static void check_var(Stmt *s, int is_global) {
  Type *types[64];
  int n = s->n_names < 64 ? s->n_names : 64;
  for (int i = 0; i < n; i++)
    types[i] = s->declared ? s->declared : T(T_ERROR);
  int has_value = s->rhs != NULL;

  if (s->rhs && s->rhs->kind == RHS_EXPRS) {
    Rhs *r = s->rhs;
    for (int i = 0; i < r->n_exprs; i++) {
      if (i < n && s->declared) {
        check_assign_to(s->declared, r->exprs[i]);
        continue;
      }
      Type *t = value_of(r->exprs[i]);
      if (i >= n)
        continue;
      if (t->kind == T_ERROR) {
        types[i] = t;
      } else if (t->kind == T_NULL || t->kind == T_DYN ||
                 (t->kind == T_LIST && t->elem->kind == T_NULL)) {
        err(s->names[i]->pos, "Não é possível inferir o tipo de '%s'; declare o tipo.",
            s->names[i]->name);
      } else {
        types[i] = t;
      }
    }
    if (r->n_exprs != s->n_names)
      count_mismatch(s->pos, s->n_names, r->n_exprs);
  } else if (s->rhs) {
    Type *result = check_call_or_run(s->rhs);
    if (s->n_names != 2)
      count_mismatch(s->pos, s->n_names, 2);
    if (s->declared) {
      if (!type_assignable(s->declared, result))
        err(s->rhs->pos, "Tipo incompatível: esperado %s, encontrado %s.", tn(s->declared), tn(result));
      if (!type_assignable(s->declared, T(T_STRING)))
        err(s->rhs->pos, "Tipo incompatível: o erro é string, mas '%s' foi declarado %s.",
            s->n_names > 1 ? s->names[1]->name : s->names[0]->name, tn(s->declared));
    } else {
      if (n > 0) types[0] = result;
      if (n > 1) types[1] = T(T_STRING);
    }
  }

  for (int i = 0; i < s->n_names; i++) {
    Symbol *sym;
    if (is_global) {
      sym = lookup(s->names[i]->name);
      if (!sym || sym->kind != SYM_VAR || sym->decl_pos.line != s->names[i]->pos.line ||
          sym->decl_pos.column != s->names[i]->pos.column)
        continue;
      sym->is_const = s->is_const;
      sym->type = i < n ? types[i] : T(T_ERROR);
    } else {
      sym = declare(s->names[i], SYM_VAR, i < n ? types[i] : T(T_ERROR));
      if (!sym)
        continue;
      sym->is_const = s->is_const;
      if (next_flow_id < MAX_SYMS)
        sym->flow_id = next_flow_id++;
      if (has_value)
        mark_initialized(sym);
    }
    if (s->rhs && s->rhs->kind != RHS_EXPRS && i == 1 && can_use_call_run())
      make_error_var(sym, s->names[i]->pos);
  }
}

static Type *check_target(Expr *t, Symbol **sym_out) {
  *sym_out = NULL;
  if (t->kind == EX_IDENT) {
    Symbol *s = lookup(t->text);
    if (!s) {
      err(t->pos, "'%s' não foi declarado.", t->text);
      t->type = T(T_ERROR);
      return t->type;
    }
    if (s->kind != SYM_VAR) {
      err(t->pos, "Tipo incompatível: '%s' é uma função e não pode receber um valor.", s->name);
      t->type = T(T_ERROR);
      return t->type;
    }
    if (s->is_const) {
      err(t->pos, "'%s' é constante e não pode ser reatribuída.", s->name);
    }
    if (!s->type) {
      err(t->pos, "'%s' só é declarado depois deste ponto.", s->name);
      t->type = T(T_ERROR);
      return t->type;
    }
    *sym_out = s;
    t->type = s->type;
    return s->type;
  }
  return check_expr(t);
}

static void check_assign(Stmt *s) {
  Symbol *syms[64] = {0};
  Type *types[64];
  int n = s->n_targets < 64 ? s->n_targets : 64;
  for (int i = 0; i < n; i++)
    types[i] = check_target(s->targets[i], &syms[i]);

  if (s->rhs->kind == RHS_EXPRS) {
    Rhs *r = s->rhs;
    for (int i = 0; i < r->n_exprs; i++) {
      if (i < n)
        check_assign_to(types[i], r->exprs[i]);
      else
        value_of(r->exprs[i]);
    }
    if (r->n_exprs != s->n_targets)
      count_mismatch(s->pos, s->n_targets, r->n_exprs);
  } else {
    Type *result = check_call_or_run(s->rhs);
    if (s->n_targets != 2) {
      count_mismatch(s->pos, s->n_targets, 2);
    } else {
      if (!type_assignable(types[0], result))
        err(s->rhs->pos, "Tipo incompatível: esperado %s, encontrado %s.", tn(types[0]), tn(result));
      Expr *second = s->targets[1];
      if (second->kind != EX_IDENT) {
        err(second->pos, "O segundo valor de '%s' deve ir para uma variável de erro.",
            s->rhs->kind == RHS_CALL ? "call" : "run");
      } else if (syms[1]) {
        if (!type_assignable(syms[1]->type, T(T_STRING)))
          err(second->pos, "Tipo incompatível: esperado %s, encontrado string.", tn(syms[1]->type));
        if (can_use_call_run())
          make_error_var(syms[1], second->pos);
      }
    }
  }
  for (int i = 0; i < n; i++)
    if (syms[i])
      mark_initialized(syms[i]);
}

static void check_return(Stmt *s) {
  Func *f = cur_func;
  if (!f)
    return;
  if (f->is_workflow) {
    for (int i = 0; i < s->n_exprs; i++)
      value_of(s->exprs[i]);
    if (s->n_exprs != 2) {
      err(s->pos, "Workflow deve retornar (resultado, erro).");
      return;
    }
    Type *want = f->ret ? f->ret : T(T_NULL);
    expect_assignable(want, s->exprs[0], s->exprs[0]->type);
    expect_assignable(T(T_STRING), s->exprs[1], s->exprs[1]->type);
    return;
  }
  if (f->ret) {
    if (s->n_exprs != 1) {
      for (int i = 0; i < s->n_exprs; i++)
        value_of(s->exprs[i]);
      err(s->pos, "A função '%s' deve retornar um valor %s.", f->name.name, tn(f->ret));
    } else {
      check_assign_to(f->ret, s->exprs[0]);
    }
    return;
  }
  for (int i = 0; i < s->n_exprs; i++)
    value_of(s->exprs[i]);
  if (s->n_exprs != 0)
    err(s->pos, "A função '%s' não retorna valor.", f->name.name);
}

static void check_stmt(Stmt *s) {
  switch (s->kind) {
  case ST_VAR:
    check_var(s, 0);
    break;
  case ST_ASSIGN:
    check_assign(s);
    break;
  case ST_EXPR:
    check_expr(s->exprs[0]);
    if (s->exprs[0]->kind != EX_CALL)
      err(s->pos, "Esta expressão não faz nada: só chamadas podem ser usadas como comando.");
    break;
  case ST_BLOCK:
    check_block(s);
    break;
  case ST_IF: {
    check_cond(s->cond, "if");
    Flow before = flow;
    check_block(s->then);
    Flow after_then = flow;
    flow = before;
    if (s->els)
      check_block(s->els);
    Flow merged = merge(&after_then, &flow);
    flow = merged;
    break;
  }
  case ST_WHILE: {
    check_cond(s->cond, "while");
    Flow before = flow;
    loop_depth++;
    check_block(s->then);
    loop_depth--;
    flow = before;
    break;
  }
  case ST_FOR: {
    Type *it = value_of(s->cond);
    Type *elem;
    if (it->kind == T_LIST)
      elem = it->elem->kind == T_NULL ? T(T_DYN) : it->elem;
    else if (it->kind == T_DYN)
      elem = T(T_DYN);
    else if (it->kind == T_ERROR)
      elem = it;
    else {
      err(s->cond->pos, "'for' exige uma lista, encontrado %s.", tn(it));
      elem = T(T_ERROR);
    }
    Flow before = flow;
    scope_push();
    Symbol *v = declare(&s->var, SYM_VAR, elem);
    if (v) {
      if (next_flow_id < MAX_SYMS)
        v->flow_id = next_flow_id++;
      mark_initialized(v);
    }
    loop_depth++;
    check_block(s->then);
    loop_depth--;
    scope_pop();
    flow = before;
    break;
  }
  case ST_RETURN:
    check_return(s);
    flow.dead = 1;
    break;
  case ST_BREAK:
  case ST_CONTINUE:
    if (loop_depth == 0)
      err(s->pos, "'%s' fora de um laço.", s->kind == ST_BREAK ? "break" : "continue");
    flow.dead = 1;
    break;
  case ST_ERRACT: {
    if (s->act == ACT_STOP && !(cur_func && cur_func->is_workflow))
      err(s->pos, "'stop if' só pode ser usado dentro de workflow.");
    Symbol *v = lookup(s->var.name);
    if (!v)
      err(s->var.pos, "'%s' não foi declarado.", s->var.name);
    else if (v->kind != SYM_VAR || !v->is_err)
      err(s->var.pos, "'%s' não é uma variável de erro.", s->var.name);
    else
      v->handled = 1;
    break;
  }
  }
}

static void check_block(Stmt *block) {
  scope_push();
  for (int i = 0; i < block->n_stmts; i++)
    check_stmt(block->stmts[i]);
  scope_pop();
}

static void check_func(Func *f) {
  cur_func = f;
  loop_depth = 0;
  next_flow_id = 0;
  memset(&flow, 0, sizeof flow);

  scope_push();
  for (int i = 0; i < f->n_params; i++) {
    Symbol *p = declare(&f->params[i]->name, SYM_VAR, f->params[i]->type);
    if (p) {
      p->flow_id = next_flow_id++;
      mark_initialized(p);
    }
  }
  check_block(f->body);
  if (f->ret && !f->is_workflow && !f->is_main && !flow.dead)
    err(f->name.pos, "A função '%s' deve retornar %s em todos os caminhos.", f->name.name,
        tn(f->ret));
  scope_pop();
  cur_func = NULL;
}

static void declare_library(void) {
  static const char *fns[] = {"toString", "toInt", "toFloat", "toBool"};
  Symbol *t = new_symbol("terminal", SYM_TERMINAL, NULL);
  t->next = scope->syms;
  scope->syms = t;
  for (int i = 0; i < 4; i++) {
    Symbol *f = new_symbol(fns[i], SYM_LIBFN, NULL);
    f->next = scope->syms;
    scope->syms = f;
  }
}

int semantic_check(Program *program) {
  n_diags = 0;
  scope = NULL;
  scope_push();
  globals = scope;
  declare_library();

  for (int i = 0; i < program->n_decls; i++) {
    Decl *d = &program->decls[i];
    if (d->func && !d->func->is_main) {
      Symbol *s = declare(&d->func->name, d->func->is_workflow ? SYM_WORKFLOW : SYM_FUNC, NULL);
      if (s)
        s->func = d->func;
    } else if (d->var) {
      for (int k = 0; k < d->var->n_names; k++)
        declare(d->var->names[k], SYM_VAR, NULL);
    }
  }

  for (int i = 0; i < program->n_decls; i++) {
    Decl *d = &program->decls[i];
    if (!d->var)
      continue;
    if (!d->var->rhs)
      for (int k = 0; k < d->var->n_names; k++)
        err(d->var->names[k]->pos, "A variável global '%s' precisa de valor inicial.",
            d->var->names[k]->name);
    cur_func = NULL;
    in_global_init = 1;
    memset(&flow, 0, sizeof flow);
    check_var(d->var, 1);
    in_global_init = 0;
  }

  for (int i = 0; i < program->n_decls; i++)
    if (program->decls[i].func)
      check_func(program->decls[i].func);

  scope_pop();

  if (n_diags > 1)
    qsort(diags, n_diags, sizeof *diags, by_position);
  for (int i = 0; i < n_diags; i++)
    report_error("semântico", diags[i].line, diags[i].column, "%s", diags[i].message);
  return n_diags;
}
