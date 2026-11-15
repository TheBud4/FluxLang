#include "ast.h"
#include "mem.h"
#include <stdlib.h>
#include <string.h>

void *ast_alloc(size_t size) { return mem_alloc(size); }

/* ---------- Impressão (--ast) ---------- */

static const char *op_name(Op op) {
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

static void indent(FILE *out, int depth) { fprintf(out, "%*s", depth * 2, ""); }

static void print_type(FILE *out, const Type *t) {
  char buf[128];
  fprintf(out, "%s", type_name(t, buf, sizeof buf));
}

static void print_expr(const Expr *e, int depth, FILE *out);

static void print_exprs(Expr **items, int n, int depth, FILE *out) {
  for (int i = 0; i < n; i++)
    print_expr(items[i], depth, out);
}

static void print_expr(const Expr *e, int depth, FILE *out) {
  indent(out, depth);
  switch (e->kind) {
  case EX_INT:    fprintf(out, "Int %ld\n", e->ival); break;
  case EX_FLOAT:  fprintf(out, "Float %g\n", e->fval); break;
  case EX_STRING: fprintf(out, "String %s\n", e->text); break;
  case EX_BOOL:   fprintf(out, "Bool %s\n", e->bval ? "true" : "false"); break;
  case EX_NULL:   fprintf(out, "Null\n"); break;
  case EX_IDENT:  fprintf(out, "Ident %s\n", e->text); break;
  case EX_UNARY:
    fprintf(out, "Unary %s\n", op_name(e->op));
    print_expr(e->a, depth + 1, out);
    break;
  case EX_BINARY:
    fprintf(out, "Binary %s\n", op_name(e->op));
    print_expr(e->a, depth + 1, out);
    print_expr(e->b, depth + 1, out);
    break;
  case EX_INDEX:
    fprintf(out, "Index\n");
    print_expr(e->a, depth + 1, out);
    print_expr(e->b, depth + 1, out);
    break;
  case EX_FIELD:
    fprintf(out, "Field %s\n", e->text);
    print_expr(e->a, depth + 1, out);
    break;
  case EX_CALL:
    fprintf(out, "Call\n");
    print_expr(e->a, depth + 1, out);
    print_exprs(e->items, e->n_items, depth + 1, out);
    break;
  case EX_LIST:
    fprintf(out, "List\n");
    print_exprs(e->items, e->n_items, depth + 1, out);
    break;
  case EX_OBJECT:
    fprintf(out, "Object\n");
    for (int i = 0; i < e->n_items; i++) {
      indent(out, depth + 1);
      fprintf(out, "Key %s\n", e->keys[i]);
      print_expr(e->items[i], depth + 2, out);
    }
    break;
  }
}

static void print_rhs(const Rhs *r, int depth, FILE *out) {
  indent(out, depth);
  switch (r->kind) {
  case RHS_EXPRS:
    fprintf(out, "Values\n");
    print_exprs(r->exprs, r->n_exprs, depth + 1, out);
    break;
  case RHS_CALL:
    fprintf(out, "CallWorkflow %s\n", r->callee.name);
    print_exprs(r->args, r->n_args, depth + 1, out);
    break;
  case RHS_RUN:
    fprintf(out, "Run\n");
    print_expr(r->run, depth + 1, out);
    break;
  }
}

static void print_stmt(const Stmt *s, int depth, FILE *out);

static void print_block(const Stmt *s, int depth, FILE *out) {
  indent(out, depth);
  fprintf(out, "Block\n");
  for (int i = 0; i < s->n_stmts; i++)
    print_stmt(s->stmts[i], depth + 1, out);
}

static void print_stmt(const Stmt *s, int depth, FILE *out) {
  switch (s->kind) {
  case ST_VAR:
    indent(out, depth);
    fprintf(out, "%s", s->is_const ? "Const" : "Var");
    for (int i = 0; i < s->n_names; i++)
      fprintf(out, " %s", s->names[i]->name);
    if (s->declared) {
      fprintf(out, " :");
      print_type(out, s->declared);
    }
    fprintf(out, "\n");
    if (s->rhs)
      print_rhs(s->rhs, depth + 1, out);
    break;
  case ST_ASSIGN:
    indent(out, depth);
    fprintf(out, "Assign\n");
    indent(out, depth + 1);
    fprintf(out, "Targets\n");
    print_exprs(s->targets, s->n_targets, depth + 2, out);
    print_rhs(s->rhs, depth + 1, out);
    break;
  case ST_IF:
    indent(out, depth);
    fprintf(out, "If\n");
    print_expr(s->cond, depth + 1, out);
    print_block(s->then, depth + 1, out);
    if (s->els) {
      indent(out, depth + 1);
      fprintf(out, "Else\n");
      print_block(s->els, depth + 2, out);
    }
    break;
  case ST_WHILE:
    indent(out, depth);
    fprintf(out, "While\n");
    print_expr(s->cond, depth + 1, out);
    print_block(s->then, depth + 1, out);
    break;
  case ST_FOR:
    indent(out, depth);
    fprintf(out, "For %s\n", s->var.name);
    print_expr(s->cond, depth + 1, out);
    print_block(s->then, depth + 1, out);
    break;
  case ST_RETURN:
    indent(out, depth);
    fprintf(out, "Return\n");
    print_exprs(s->exprs, s->n_exprs, depth + 1, out);
    break;
  case ST_BREAK:
    indent(out, depth);
    fprintf(out, "Break\n");
    break;
  case ST_CONTINUE:
    indent(out, depth);
    fprintf(out, "Continue\n");
    break;
  case ST_ERRACT:
    indent(out, depth);
    fprintf(out, "%s if %s\n",
            s->act == ACT_STOP ? "Stop" : s->act == ACT_ABORT ? "Abort" : "Proceed",
            s->var.name);
    break;
  case ST_EXPR:
    indent(out, depth);
    fprintf(out, "ExprStmt\n");
    print_expr(s->exprs[0], depth + 1, out);
    break;
  case ST_BLOCK:
    print_block(s, depth, out);
    break;
  }
}

static void print_func(const Func *f, int depth, FILE *out) {
  indent(out, depth);
  fprintf(out, "%s %s(", f->is_workflow ? "Workflow" : "Func", f->name.name);
  for (int i = 0; i < f->n_params; i++) {
    fprintf(out, "%s%s:", i ? ", " : "", f->params[i]->name.name);
    print_type(out, f->params[i]->type);
  }
  fprintf(out, ")");
  if (f->ret) {
    fprintf(out, " :");
    print_type(out, f->ret);
  }
  fprintf(out, "\n");
  print_block(f->body, depth + 1, out);
}

void ast_print(const Program *program, FILE *out) {
  fprintf(out, "Program\n");
  for (int i = 0; i < program->n_decls; i++) {
    if (program->decls[i].var)
      print_stmt(program->decls[i].var, 1, out);
    else
      print_func(program->decls[i].func, 1, out);
  }
}
