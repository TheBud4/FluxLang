#include "types.h"
#include "mem.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static Type prims[] = {
    {T_ERROR, NULL}, {T_VOID, NULL},   {T_NULL, NULL},   {T_DYN, NULL},
    {T_INT, NULL},   {T_FLOAT, NULL},  {T_BOOL, NULL},   {T_STRING, NULL},
    {T_OBJECT, NULL}, {T_LIST, NULL},
};

Type *type_prim(TypeKind kind) { return &prims[kind]; }

Type *type_list(Type *elem) {
  Type *t = mem_alloc(sizeof *t);
  t->kind = T_LIST;
  t->elem = elem;
  return t;
}

int type_equal(const Type *a, const Type *b) {
  if (a->kind != b->kind)
    return 0;
  return a->kind != T_LIST || type_equal(a->elem, b->elem);
}

int type_assignable(const Type *to, const Type *from) {
  if (to->kind == T_ERROR || from->kind == T_ERROR)
    return 1; /* o erro já foi reportado */
  if (to->kind == T_DYN || from->kind == T_DYN)
    return 1;
  if (from->kind == T_NULL)
    return to->kind != T_VOID;
  if (to->kind == T_FLOAT && from->kind == T_INT)
    return 1;
  if (to->kind == T_LIST && from->kind == T_LIST) {
    if (from->elem->kind == T_NULL) /* o literal [] */
      return 1;
    return type_equal(to->elem, from->elem) ||
           to->elem->kind == T_DYN || from->elem->kind == T_DYN;
  }
  return to->kind == from->kind;
}

const char *type_name(const Type *t, char *buf, int size) {
  switch (t->kind) {
  case T_ERROR:  snprintf(buf, size, "erro"); break;
  case T_VOID:   snprintf(buf, size, "nada"); break;
  case T_NULL:   snprintf(buf, size, "null"); break;
  case T_DYN:    snprintf(buf, size, "dinâmico"); break;
  case T_INT:    snprintf(buf, size, "int"); break;
  case T_FLOAT:  snprintf(buf, size, "float"); break;
  case T_BOOL:   snprintf(buf, size, "bool"); break;
  case T_STRING: snprintf(buf, size, "string"); break;
  case T_OBJECT: snprintf(buf, size, "object"); break;
  case T_LIST: {
    char inner[128];
    type_name(t->elem, inner, sizeof inner);
    snprintf(buf, size, "list<%s>", inner);
    break;
  }
  }
  return buf;
}
