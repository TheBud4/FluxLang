#ifndef TYPES_H
#define TYPES_H

typedef enum {
  T_ERROR,
  T_VOID,
  T_NULL,
  T_DYN,
  T_INT,
  T_FLOAT,
  T_BOOL,
  T_STRING,
  T_OBJECT,
  T_LIST
} TypeKind;

typedef struct Type {
  TypeKind kind;
  struct Type *elem;
} Type;

Type *type_prim(TypeKind kind);
Type *type_list(Type *elem);
int type_equal(const Type *a, const Type *b);

int type_assignable(const Type *to, const Type *from);

const char *type_name(const Type *t, char *buf, int size);

#endif
