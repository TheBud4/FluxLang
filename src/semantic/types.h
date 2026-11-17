#ifndef TYPES_H
#define TYPES_H

/* Tipos da FluxLang, como o analisador semântico os enxerga.
 *
 * Os seis tipos que o usuário escreve (int, float, bool, string, object e
 * list<T>) e três internos:
 *   T_NULL  o tipo do valor `null` (e do resultado de um workflow sem :tipo);
 *   T_DYN   o tipo dinâmico: o valor de um campo de object (decisão D1), que
 *           combina com qualquer tipo e é conferido na execução;
 *   T_ERROR o tipo de uma expressão que já teve erro: serve com qualquer tipo
 *           para não gerar uma segunda mensagem em cascata;
 *   T_VOID  o "tipo" de uma chamada que não devolve valor. */

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
  struct Type *elem; /* só em T_LIST: o tipo dos elementos */
} Type;

Type *type_prim(TypeKind kind);     /* int, float... (instâncias compartilhadas) */
Type *type_list(Type *elem);        /* list<elem> */
int type_equal(const Type *a, const Type *b);

/* Um valor do tipo `from` pode ir para um lugar do tipo `to`? Vale o mesmo
 * tipo, int -> float, null para qualquer tipo, dinâmico para qualquer um e
 * `list<null>` (o literal []) para qualquer lista. */
int type_assignable(const Type *to, const Type *from);

/* Escreve o nome do tipo ("int", "list<string>"...) em buf e o devolve. */
const char *type_name(const Type *t, char *buf, int size);

#endif
