#include "ast.h"
#include "fluxc.h"
#include "mem.h"
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <unistd.h>

extern const char flux_runtime_source[];

static FILE *out;
static int depth;
static int next_tmp;
static const Program *prog;
static const Func *cur_func;

static void emit(const char *fmt, ...) {
  va_list args;
  fprintf(out, "%*s", depth * 2, "");
  va_start(args, fmt);
  vfprintf(out, fmt, args);
  va_end(args);
  fputc('\n', out);
}

static char *fstr(const char *fmt, ...) {
  va_list args;
  va_start(args, fmt);
  int n = vsnprintf(NULL, 0, fmt, args);
  va_end(args);
  char *s = mem_alloc(n + 1);
  va_start(args, fmt);
  vsnprintf(s, n + 1, fmt, args);
  va_end(args);
  return s;
}

static char *new_tmp(void) { return fstr("t%d", next_tmp++); }

static const Func *find_func(const char *name) {
  for (int i = 0; i < prog->n_decls; i++) {
    const Func *f = prog->decls[i].func;
    if (f && !f->is_main && strcmp(f->name.name, name) == 0)
      return f;
  }
  return NULL;
}

static char *expr(Expr *e);

static char *float_literal(double d) {
  char buf[40];
  snprintf(buf, sizeof buf, "%.17g", d);
  if (!strpbrk(buf, ".eE"))
    strcat(buf, ".0");
  return fstr("%s", buf);
}

static char *convert(Expr *e, const Type *target) {
  char *v = expr(e);
  if (!target || !e->type || e->type->kind == T_ERROR)
    return v;
  int dyn = e->type->kind == T_DYN;
  switch (target->kind) {
  case T_FLOAT:
    if (e->type->kind == T_INT)
      return fstr("fx_to_float(%s)", v);
    if (dyn)
      return fstr("fx_as_float(%s)", v);
    break;
  case T_INT:    if (dyn) return fstr("fx_as_int(%s)", v); break;
  case T_BOOL:   if (dyn) return fstr("fx_as_bool(%s)", v); break;
  case T_STRING: if (dyn) return fstr("fx_as_string(%s)", v); break;
  case T_LIST:   if (dyn) return fstr("fx_as_list(%s)", v); break;
  case T_OBJECT: if (dyn) return fstr("fx_as_object(%s)", v); break;
  default:
    break;
  }
  return v;
}

static const char *binary_fn(Op op) {
  switch (op) {
  case OP_ADD: return "fx_add";
  case OP_SUB: return "fx_sub";
  case OP_MUL: return "fx_mul";
  case OP_DIV: return "fx_div";
  case OP_MOD: return "fx_mod";
  case OP_LT:  return "fx_lt";
  case OP_LE:  return "fx_le";
  case OP_GT:  return "fx_gt";
  case OP_GE:  return "fx_ge";
  case OP_EQ:  return "fx_eq";
  default:     return "fx_ne";
  }
}

static char *gen_binary(Expr *e) {
  if (e->op == OP_AND || e->op == OP_OR) {
    char *left = expr(e->a);
    char *t = new_tmp();
    emit("FxValue %s = fx_bool(fx_cond(%s));", t, left);
    emit(e->op == OP_AND ? "if (%s.as.b) {" : "if (!%s.as.b) {", t);
    depth++;
    char *right = expr(e->b);
    emit("%s = fx_bool(fx_cond(%s));", t, right);
    depth--;
    emit("}");
    return t;
  }
  char *a = expr(e->a);
  char *b = expr(e->b);
  char *t = new_tmp();
  emit("FxValue %s = %s(%s, %s);", t, binary_fn(e->op), a, b);
  return t;
}

static char *join_args(char **args, int n) {
  char *s = fstr("%s", "");
  for (int i = 0; i < n; i++)
    s = fstr("%s%s%s", s, i ? ", " : "", args[i]);
  return s;
}

static char *gen_call(Expr *c) {
  Expr *callee = c->a;
  char *t;

  if (callee->kind == EX_IDENT) {
    const char *name = callee->text;
    static const struct { const char *name, *fn; } conversions[] = {
        {"toString", "fx_to_string"}, {"toInt", "fx_to_int"},
        {"toFloat", "fx_to_float"},   {"toBool", "fx_to_bool"},
    };
    for (size_t i = 0; i < sizeof conversions / sizeof conversions[0]; i++) {
      if (strcmp(name, conversions[i].name) == 0) {
        char *a = expr(c->items[0]);
        t = new_tmp();
        emit("FxValue %s = %s(%s);", t, conversions[i].fn, a);
        return t;
      }
    }
    const Func *f = find_func(name);
    char **args = mem_alloc((c->n_items + 1) * sizeof(char *));
    for (int i = 0; i < c->n_items; i++)
      args[i] = convert(c->items[i], f->params[i]->type);
    t = new_tmp();
    emit("FxValue %s = f_%s(%s);", t, name, join_args(args, c->n_items));
    return t;
  }

  Expr *base = callee->a;
  const char *m = callee->text;
  if (base->kind == EX_IDENT && strcmp(base->text, "terminal") == 0) {
    t = new_tmp();
    if (strcmp(m, "input") == 0) {
      char *prompt = c->n_items > 0 ? expr(c->items[0]) : fstr("fx_null()");
      emit("FxValue %s = fx_input(%s);", t, prompt);
    } else {
      char *a = expr(c->items[0]);
      emit("FxValue %s = fx_%s(%s);", t, m, a);
    }
    return t;
  }

  char *b = expr(base);
  t = new_tmp();
  if (strcmp(m, "length") == 0) {
    emit("FxValue %s = fx_length(%s);", t, b);
  } else if (strcmp(m, "push") == 0) {
    const Type *elem = base->type && base->type->kind == T_LIST ? base->type->elem : NULL;
    char *v = convert(c->items[0], elem);
    emit("FxValue %s = fx_push(%s, %s);", t, b, v);
  } else {
    char *i = expr(c->items[0]);
    emit("FxValue %s = fx_remove(%s, %s);", t, b, i);
  }
  return t;
}

static char *expr(Expr *e) {
  char *t;
  switch (e->kind) {
  case EX_INT:    return fstr("fx_int(%ld)", e->ival);
  case EX_FLOAT:  return fstr("fx_float(%s)", float_literal(e->fval));
  case EX_STRING: return fstr("fx_str(%s)", e->text);
  case EX_BOOL:   return fstr("fx_bool(%d)", e->bval);
  case EX_NULL:   return fstr("fx_null()");
  case EX_IDENT:
    t = new_tmp();
    emit("FxValue %s = v_%s;", t, e->text);
    return t;
  case EX_UNARY: {
    char *a = expr(e->a);
    t = new_tmp();
    emit("FxValue %s = %s(%s);", t, e->op == OP_NEG ? "fx_neg" : "fx_not", a);
    return t;
  }
  case EX_BINARY:
    return gen_binary(e);
  case EX_INDEX: {
    char *a = expr(e->a);
    char *b = expr(e->b);
    t = new_tmp();
    emit("FxValue %s = fx_index(%s, %s);", t, a, b);
    return t;
  }
  case EX_FIELD: {
    char *a = expr(e->a);
    t = new_tmp();
    emit("FxValue %s = fx_field(%s, \"%s\");", t, a, e->text);
    return t;
  }
  case EX_CALL:
    return gen_call(e);
  case EX_LIST: {
    const Type *elem = e->type && e->type->kind == T_LIST ? e->type->elem : NULL;
    t = new_tmp();
    emit("FxValue %s = fx_new_list();", t);
    for (int i = 0; i < e->n_items; i++) {
      char *v = convert(e->items[i], elem);
      emit("fx_list_add(%s, %s);", t, v);
    }
    return t;
  }
  default: {
    t = new_tmp();
    emit("FxValue %s = fx_new_object();", t);
    for (int i = 0; i < e->n_items; i++) {
      char *v = expr(e->items[i]);
      emit("fx_obj_set(%s, \"%s\", %s);", t, e->keys[i], v);
    }
    return t;
  }
  }
}

static void gen_stmt(Stmt *s);

static char *gen_pair(Rhs *r) {
  char *t = new_tmp();
  if (r->kind == RHS_RUN) {
    char *spec = expr(r->run);
    emit("FxPair %s = fx_run(%s);", t, spec);
    return t;
  }
  const Func *f = find_func(r->callee.name);
  char **args = mem_alloc((r->n_args + 1) * sizeof(char *));
  for (int i = 0; i < r->n_args; i++)
    args[i] = convert(r->args[i], f->params[i]->type);
  emit("FxPair %s = w_%s(%s);", t, r->callee.name, join_args(args, r->n_args));
  return t;
}

static void gen_var(Stmt *s, int global) {
  if (!s->rhs) {
    for (int i = 0; i < s->n_names; i++)
      emit("FxValue v_%s = fx_null();", s->names[i]->name);
    return;
  }
  Rhs *r = s->rhs;
  if (r->kind == RHS_EXPRS) {
    char **vals = mem_alloc((r->n_exprs + 1) * sizeof(char *));
    for (int i = 0; i < r->n_exprs; i++)
      vals[i] = convert(r->exprs[i], s->declared);
    for (int i = 0; i < s->n_names && i < r->n_exprs; i++)
      emit(global ? "v_%s = %s;" : "FxValue v_%s = %s;", s->names[i]->name, vals[i]);
    return;
  }
  char *pair = gen_pair(r);
  emit(global ? "v_%s = %s.result;" : "FxValue v_%s = %s.result;", s->names[0]->name, pair);
  emit(global ? "v_%s = %s.error;" : "FxValue v_%s = %s.error;", s->names[1]->name, pair);
}

static void assign_to(Expr *target, const char *value) {
  if (target->kind == EX_IDENT) {
    emit("v_%s = %s;", target->text, value);
  } else if (target->kind == EX_FIELD) {
    char *base = expr(target->a);
    emit("fx_set_field(%s, \"%s\", %s);", base, target->text, value);
  } else {
    char *base = expr(target->a);
    char *idx = expr(target->b);
    emit("fx_set_index(%s, %s, %s);", base, idx, value);
  }
}

static void gen_assign(Stmt *s) {
  Rhs *r = s->rhs;
  if (r->kind == RHS_EXPRS) {
    char **vals = mem_alloc((r->n_exprs + 1) * sizeof(char *));
    for (int i = 0; i < r->n_exprs; i++)
      vals[i] = convert(r->exprs[i], i < s->n_targets ? s->targets[i]->type : NULL);
    for (int i = 0; i < s->n_targets && i < r->n_exprs; i++)
      assign_to(s->targets[i], vals[i]);
    return;
  }
  char *pair = gen_pair(r);
  assign_to(s->targets[0], fstr("%s.result", pair));
  assign_to(s->targets[1], fstr("%s.error", pair));
}

static void gen_block(Stmt *block) {
  emit("{");
  depth++;
  for (int i = 0; i < block->n_stmts; i++)
    gen_stmt(block->stmts[i]);
  depth--;
  emit("}");
}

static void gen_return(Stmt *s) {
  const Func *f = cur_func;
  if (f->is_workflow) {
    char *result = convert(s->exprs[0], f->ret);
    char *error = expr(s->exprs[1]);
    emit("return fx_pair(%s, %s);", result, error);
  } else if (s->n_exprs == 1) {
    emit("return %s;", convert(s->exprs[0], f->ret));
  } else {
    emit("return fx_null();");
  }
}

static void gen_stmt(Stmt *s) {
  if (s->kind != ST_BLOCK && s->kind != ST_BREAK && s->kind != ST_CONTINUE)
    emit("FX_LINE(%d);", s->pos.line);
  switch (s->kind) {
  case ST_VAR:
    gen_var(s, 0);
    break;
  case ST_ASSIGN:
    gen_assign(s);
    break;
  case ST_EXPR: {
    char *v = expr(s->exprs[0]);
    emit("(void)%s;", v);
    break;
  }
  case ST_BLOCK:
    gen_block(s);
    break;
  case ST_IF: {
    char *c = expr(s->cond);
    emit("if (fx_cond(%s))", c);
    gen_block(s->then);
    if (s->els) {
      emit("else");
      gen_block(s->els);
    }
    break;
  }
  case ST_WHILE:
    emit("for (;;) {");
    depth++;
    {
      char *c = expr(s->cond);
      emit("if (!fx_cond(%s)) break;", c);
    }
    gen_block(s->then);
    depth--;
    emit("}");
    break;
  case ST_FOR: {
    emit("{");
    depth++;
    char *list = expr(s->cond);
    char *l = new_tmp();
    emit("FxList *%s = fx_for_list(%s);", l, list);
    emit("for (int i_%s = 0; i_%s < %s->n; i_%s++) {", l, l, l, l);
    depth++;
    emit("FxValue v_%s = %s->v[i_%s];", s->var.name, l, l);
    gen_block(s->then);
    depth--;
    emit("}");
    depth--;
    emit("}");
    break;
  }
  case ST_RETURN:
    gen_return(s);
    break;
  case ST_BREAK:
    emit("break;");
    break;
  case ST_CONTINUE:
    emit("continue;");
    break;
  case ST_ERRACT:
    if (s->act == ACT_STOP)
      emit("if (v_%s.tag != FX_NULL) return fx_pair(fx_null(), v_%s);", s->var.name, s->var.name);
    else if (s->act == ACT_ABORT)
      emit("if (v_%s.tag != FX_NULL) fx_abort(v_%s);", s->var.name, s->var.name);
    else
      emit("/* proceed if %s: o erro conta como tratado */", s->var.name);
    break;
  }
}

static void signature(const Func *f, int with_semicolon) {
  char *params = fstr("%s", "");
  for (int i = 0; i < f->n_params; i++)
    params = fstr("%s%sFxValue v_%s", params, i ? ", " : "", f->params[i]->name.name);
  if (f->n_params == 0)
    params = fstr("%s", "void");
  const char *ret = f->is_workflow ? "FxPair" : "FxValue";
  const char *prefix = f->is_workflow ? "w" : "f";
  fprintf(out, "static %s %s_%s(%s)%s\n", ret, prefix, f->name.name, params,
          with_semicolon ? ";" : "");
}

static void gen_func(const Func *f) {
  cur_func = f;
  next_tmp = 0;
  signature(f, 0);
  emit("{");
  depth++;
  emit("fx_check_stack();");
  for (int i = 0; i < f->body->n_stmts; i++)
    gen_stmt(f->body->stmts[i]);
  emit(f->is_workflow ? "return fx_pair(fx_null(), fx_null());" : "return fx_null();");
  depth--;
  emit("}");
  fputc('\n', out);
  cur_func = NULL;
}

int generate_c(const Program *program, FILE *file) {
  out = file;
  prog = program;
  depth = 0;

  fputs("/* Gerado pelo compilador FluxLang (./flux --c). Compila sozinho com o gcc. */\n\n", out);
  fputs(flux_runtime_source, out);
  fputs("\n/* ---------- programa ---------- */\n\n", out);

  for (int i = 0; i < program->n_decls; i++) {
    Stmt *v = program->decls[i].var;
    for (int k = 0; v && k < v->n_names; k++)
      fprintf(out, "static FxValue v_%s;\n", v->names[k]->name);
  }
  fputc('\n', out);
  for (int i = 0; i < program->n_decls; i++)
    if (program->decls[i].func)
      signature(program->decls[i].func, 1);
  fputc('\n', out);
  for (int i = 0; i < program->n_decls; i++)
    if (program->decls[i].func)
      gen_func(program->decls[i].func);

  next_tmp = 0;
  fputs("static int fx_program(void) {\n", out);
  depth = 1;
  emit("fx_init(__builtin_frame_address(0));");
  for (int i = 0; i < program->n_decls; i++) {
    Stmt *v = program->decls[i].var;
    for (int k = 0; v && k < v->n_names; k++)
      emit("fx_gc_root(&v_%s);", v->names[k]->name);
  }
  for (int i = 0; i < program->n_decls; i++) {
    Stmt *v = program->decls[i].var;
    if (!v)
      continue;
    emit("FX_LINE(%d);", v->pos.line);
    gen_var(v, 1);
  }
  emit("f_main();");
  emit("return 0;");
  fputs("}\n\nint main(void) { return fx_start(fx_program); }\n", out);
  return 0;
}

static int windows_target;
void set_windows_target(void) { windows_target = 1; }
int is_windows_target(void) { return windows_target; }

static int run_program(char *const argv[]) {
  pid_t pid = fork();
  if (pid < 0)
    return -1;
  if (pid == 0) {
    execvp(argv[0], argv);
    perror(argv[0]);
    _exit(127);
  }
  int status;
  while (waitpid(pid, &status, 0) < 0)
    ;
  if (WIFEXITED(status))
    return WEXITSTATUS(status);
  return 128 + (WIFSIGNALED(status) ? WTERMSIG(status) : 0);
}

int compile_c(const char *c_path, const char *exe_path) {
  const char *cc = getenv("FLUX_CC");
  if (!cc && windows_target)
    cc = "x86_64-w64-mingw32-gcc";
  const char *warn = getenv("FLUX_CC_WARN") ? "-Wall" : "-w";
  char *argv[64];
  int n = 0;
  argv[n++] = (char *)(cc ? cc : "gcc");
  argv[n++] = "-x";
  argv[n++] = "c";
  argv[n++] = "-O1";
  argv[n++] = (char *)warn;
  if (windows_target)
    argv[n++] = "-static";
  char *extra = getenv("FLUX_CC_FLAGS") && !windows_target ? mem_strdup(getenv("FLUX_CC_FLAGS")) : NULL;
  for (char *tok = extra ? strtok(extra, " ") : NULL; tok && n < 56; tok = strtok(NULL, " "))
    argv[n++] = tok;
  argv[n++] = "-o";
  argv[n++] = (char *)exe_path;
  argv[n++] = (char *)c_path;
  argv[n++] = "-lm";
  argv[n] = NULL;
  return run_program(argv);
}

int execute_program(const char *exe_path) {
  if (windows_target) {
    setenv("WINEDEBUG", "-all", 0);
    char *wine_argv[] = {"wine", (char *)exe_path, NULL};
    return run_program(wine_argv);
  }
  char *argv[] = {(char *)exe_path, NULL};
  return run_program(argv);
}
