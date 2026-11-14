/* Biblioteca de execução da FluxLang.
 *
 * É embutida em todo programa C que o compilador gera (./flux --c), então o
 * resultado compila sozinho com `gcc`. Tudo aqui é static: não há .o separado.
 *
 * Todo valor em tempo de execução é um FxValue com uma etiqueta (tag). Como
 * `null` vale para qualquer tipo e o valor de um campo de object é dinâmico
 * (decisão D1), um único tipo com etiqueta evita casos especiais: os operadores
 * conferem as etiquetas e dão os erros de execução R1 a R6 (docs/ERROS.md).
 *
 * list e object são referências (decisão D2): FxList e FxObj ficam no heap e o
 * FxValue só guarda o ponteiro. Nada é liberado: o programa roda e termina. */

#include <errno.h>
#include <fcntl.h>
#include <math.h>
#include <poll.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>

#define FX_FN static __attribute__((unused))

typedef enum { FX_NULL, FX_INT, FX_FLOAT, FX_BOOL, FX_STRING, FX_LIST, FX_OBJECT } FxTag;

typedef struct FxList FxList;
typedef struct FxObj FxObj;

typedef struct {
  FxTag tag;
  union {
    int32_t i;
    double f;
    int b;
    const char *s;
    FxList *l;
    FxObj *o;
  } as;
} FxValue;

struct FxList {
  int n, cap;
  FxValue *v;
};

struct FxObj {
  int n, cap;
  const char **keys;
  FxValue *vals;
};

/* O par (resultado, erro) que um workflow, um call e um run devolvem. */
typedef struct {
  FxValue result, error;
} FxPair;

static int fx_line; /* a linha do comando em execução, para as mensagens */
#define FX_LINE(n) (fx_line = (n))

/* ---------- Erros de execução (R1 a R6) ---------- */

FX_FN void fx_die(const char *fmt, ...) __attribute__((noreturn, format(printf, 1, 2)));
FX_FN void fx_die(const char *fmt, ...) {
  va_list args;
  fflush(stdout);
  fprintf(stderr, "Erro de execução [linha %d]:\n", fx_line);
  va_start(args, fmt);
  vfprintf(stderr, fmt, args);
  va_end(args);
  fprintf(stderr, "\n");
  exit(1);
}

FX_FN const char *fx_tag_name(FxTag t) {
  switch (t) {
  case FX_NULL:   return "null";
  case FX_INT:    return "int";
  case FX_FLOAT:  return "float";
  case FX_BOOL:   return "bool";
  case FX_STRING: return "string";
  case FX_LIST:   return "list";
  default:        return "object";
  }
}

FX_FN void fx_null_use(void) __attribute__((noreturn));
FX_FN void fx_null_use(void) { fx_die("Uso de valor null."); } /* R3 */

/* R5: o valor tem outro tipo do que o lugar exige. */
FX_FN void fx_type_err(const char *expected, FxValue got) __attribute__((noreturn));
FX_FN void fx_type_err(const char *expected, FxValue got) {
  if (got.tag == FX_NULL)
    fx_null_use();
  fx_die("Esperado %s, encontrado %s.", expected, fx_tag_name(got.tag));
}

FX_FN void *fx_alloc(size_t n) {
  void *p = calloc(1, n ? n : 1);
  if (!p) {
    fprintf(stderr, "Memória esgotada.\n");
    exit(2);
  }
  return p;
}

/* ---------- Construtores ---------- */

FX_FN FxValue fx_null(void) { FxValue v = {FX_NULL, {0}}; return v; }
FX_FN FxValue fx_int(int32_t i) { FxValue v; v.tag = FX_INT; v.as.i = i; return v; }
FX_FN FxValue fx_float(double f) { FxValue v; v.tag = FX_FLOAT; v.as.f = f; return v; }
FX_FN FxValue fx_bool(int b) { FxValue v; v.tag = FX_BOOL; v.as.b = b != 0; return v; }
FX_FN FxValue fx_str(const char *s) { FxValue v; v.tag = FX_STRING; v.as.s = s; return v; }

FX_FN FxValue fx_new_list(void) {
  FxValue v;
  v.tag = FX_LIST;
  v.as.l = fx_alloc(sizeof(FxList));
  return v;
}

FX_FN FxValue fx_new_object(void) {
  FxValue v;
  v.tag = FX_OBJECT;
  v.as.o = fx_alloc(sizeof(FxObj));
  return v;
}

FX_FN FxPair fx_pair(FxValue result, FxValue error) {
  FxPair p = {result, error};
  return p;
}

/* ---------- Listas e objetos ---------- */

FX_FN void fx_list_add(FxValue list, FxValue v) {
  FxList *l = list.as.l;
  if (l->n == l->cap) {
    l->cap = l->cap ? l->cap * 2 : 4;
    l->v = realloc(l->v, l->cap * sizeof(FxValue));
    if (!l->v) {
      fprintf(stderr, "Memória esgotada.\n");
      exit(2);
    }
  }
  l->v[l->n++] = v;
}

FX_FN FxList *fx_as_list_ptr(FxValue v) {
  if (v.tag != FX_LIST)
    fx_type_err("list", v);
  return v.as.l;
}

FX_FN FxObj *fx_as_obj_ptr(FxValue v) {
  if (v.tag != FX_OBJECT)
    fx_type_err("object", v);
  return v.as.o;
}

FX_FN int fx_obj_find(const FxObj *o, const char *key) {
  for (int i = 0; i < o->n; i++)
    if (strcmp(o->keys[i], key) == 0)
      return i;
  return -1;
}

/* Atribuir a um campo que não existe cria o campo. */
FX_FN void fx_obj_put(FxObj *o, const char *key, FxValue v) {
  int i = fx_obj_find(o, key);
  if (i >= 0) {
    o->vals[i] = v;
    return;
  }
  if (o->n == o->cap) {
    o->cap = o->cap ? o->cap * 2 : 4;
    o->keys = realloc(o->keys, o->cap * sizeof(char *));
    o->vals = realloc(o->vals, o->cap * sizeof(FxValue));
    if (!o->keys || !o->vals) {
      fprintf(stderr, "Memória esgotada.\n");
      exit(2);
    }
  }
  o->keys[o->n] = key;
  o->vals[o->n++] = v;
}

FX_FN void fx_obj_set(FxValue obj, const char *key, FxValue v) { fx_obj_put(obj.as.o, key, v); }

/* Ler um campo que não existe devolve null. */
FX_FN FxValue fx_field(FxValue base, const char *key) {
  FxObj *o = fx_as_obj_ptr(base);
  int i = fx_obj_find(o, key);
  return i < 0 ? fx_null() : o->vals[i];
}

FX_FN void fx_set_field(FxValue base, const char *key, FxValue v) {
  fx_obj_put(fx_as_obj_ptr(base), key, v);
}

FX_FN int32_t fx_index_of(FxValue idx, const FxList *l) {
  if (idx.tag != FX_INT)
    fx_type_err("int", idx);
  if (idx.as.i < 0 || idx.as.i >= l->n) /* R2 */
    fx_die("Índice %d fora da lista (tamanho %d).", idx.as.i, l->n);
  return idx.as.i;
}

FX_FN FxValue fx_index(FxValue base, FxValue idx) {
  if (base.tag == FX_LIST) {
    FxList *l = base.as.l;
    return l->v[fx_index_of(idx, l)];
  }
  if (base.tag == FX_OBJECT) {
    if (idx.tag != FX_STRING)
      fx_type_err("string", idx);
    return fx_field(base, idx.as.s);
  }
  fx_type_err("list ou object", base);
}

FX_FN void fx_set_index(FxValue base, FxValue idx, FxValue v) {
  if (base.tag == FX_LIST) {
    FxList *l = base.as.l;
    l->v[fx_index_of(idx, l)] = v;
    return;
  }
  if (base.tag == FX_OBJECT) {
    if (idx.tag != FX_STRING)
      fx_type_err("string", idx);
    fx_obj_put(base.as.o, idx.as.s, v);
    return;
  }
  fx_type_err("list ou object", base);
}

/* Os métodos de lista: l.length(), l.push(v) e l.remove(i). */
FX_FN FxValue fx_length(FxValue l) { return fx_int(fx_as_list_ptr(l)->n); }

FX_FN FxValue fx_push(FxValue l, FxValue v) {
  fx_as_list_ptr(l);
  fx_list_add(l, v);
  return fx_null();
}

FX_FN FxValue fx_remove(FxValue list, FxValue idx) {
  FxList *l = fx_as_list_ptr(list);
  int32_t i = fx_index_of(idx, l);
  memmove(&l->v[i], &l->v[i + 1], (l->n - i - 1) * sizeof(FxValue));
  l->n--;
  return fx_null();
}

/* O `for item in lista`: a lista tem de ser mesmo uma lista. */
FX_FN FxList *fx_for_list(FxValue v) { return fx_as_list_ptr(v); }

/* ---------- Conferência de tipo em tempo de execução ----------
 * Valor vindo de um campo de object é dinâmico: ao ir para uma variável ou
 * parâmetro com tipo, o tipo real é conferido aqui (R5). null passa em tudo. */

FX_FN FxValue fx_as_int(FxValue v) {
  if (v.tag != FX_INT && v.tag != FX_NULL) fx_type_err("int", v);
  return v;
}
FX_FN FxValue fx_as_bool(FxValue v) {
  if (v.tag != FX_BOOL && v.tag != FX_NULL) fx_type_err("bool", v);
  return v;
}
FX_FN FxValue fx_as_string(FxValue v) {
  if (v.tag != FX_STRING && v.tag != FX_NULL) fx_type_err("string", v);
  return v;
}
FX_FN FxValue fx_as_list(FxValue v) {
  if (v.tag != FX_LIST && v.tag != FX_NULL) fx_type_err("list", v);
  return v;
}
FX_FN FxValue fx_as_object(FxValue v) {
  if (v.tag != FX_OBJECT && v.tag != FX_NULL) fx_type_err("object", v);
  return v;
}

/* float aceita int (a única conversão implícita da linguagem). */
FX_FN FxValue fx_as_float(FxValue v) {
  if (v.tag == FX_INT) return fx_float((double)v.as.i);
  if (v.tag != FX_FLOAT && v.tag != FX_NULL) fx_type_err("float", v);
  return v;
}

/* ---------- Operadores ---------- */

FX_FN int fx_is_num(FxValue v) { return v.tag == FX_INT || v.tag == FX_FLOAT; }
FX_FN double fx_num(FxValue v) { return v.tag == FX_INT ? (double)v.as.i : v.as.f; }

/* Confere os dois operandos de um operador numérico. */
FX_FN void fx_need_nums(FxValue a, FxValue b) {
  if (a.tag == FX_NULL || b.tag == FX_NULL)
    fx_null_use();
  if (!fx_is_num(a))
    fx_type_err("int ou float", a);
  if (!fx_is_num(b))
    fx_type_err("int ou float", b);
}

FX_FN const char *fx_concat(const char *a, const char *b) {
  size_t la = strlen(a), lb = strlen(b);
  char *r = fx_alloc(la + lb + 1);
  memcpy(r, a, la);
  memcpy(r + la, b, lb);
  return r;
}

FX_FN FxValue fx_add(FxValue a, FxValue b) {
  if (a.tag == FX_STRING && b.tag == FX_STRING)
    return fx_str(fx_concat(a.as.s, b.as.s));
  if (a.tag == FX_STRING || b.tag == FX_STRING) {
    if (a.tag == FX_NULL || b.tag == FX_NULL)
      fx_null_use();
    fx_type_err("string", a.tag == FX_STRING ? b : a);
  }
  fx_need_nums(a, b);
  if (a.tag == FX_INT && b.tag == FX_INT) {
    int32_t r;
    if (__builtin_add_overflow(a.as.i, b.as.i, &r)) /* R6 */
      fx_die("Estouro de inteiro.");
    return fx_int(r);
  }
  return fx_float(fx_num(a) + fx_num(b));
}

FX_FN FxValue fx_sub(FxValue a, FxValue b) {
  fx_need_nums(a, b);
  if (a.tag == FX_INT && b.tag == FX_INT) {
    int32_t r;
    if (__builtin_sub_overflow(a.as.i, b.as.i, &r))
      fx_die("Estouro de inteiro.");
    return fx_int(r);
  }
  return fx_float(fx_num(a) - fx_num(b));
}

FX_FN FxValue fx_mul(FxValue a, FxValue b) {
  fx_need_nums(a, b);
  if (a.tag == FX_INT && b.tag == FX_INT) {
    int32_t r;
    if (__builtin_mul_overflow(a.as.i, b.as.i, &r))
      fx_die("Estouro de inteiro.");
    return fx_int(r);
  }
  return fx_float(fx_num(a) * fx_num(b));
}

FX_FN FxValue fx_div(FxValue a, FxValue b) {
  fx_need_nums(a, b);
  if (a.tag == FX_INT && b.tag == FX_INT) {
    if (b.as.i == 0) /* R4 */
      fx_die("Divisão por zero.");
    if (a.as.i == INT32_MIN && b.as.i == -1)
      fx_die("Estouro de inteiro.");
    return fx_int(a.as.i / b.as.i); /* divisão inteira, como em C */
  }
  return fx_float(fx_num(a) / fx_num(b)); /* float segue o IEEE: x / 0.0 é infinito */
}

FX_FN FxValue fx_mod(FxValue a, FxValue b) {
  if (a.tag == FX_NULL || b.tag == FX_NULL)
    fx_null_use();
  if (a.tag != FX_INT)
    fx_type_err("int", a);
  if (b.tag != FX_INT)
    fx_type_err("int", b);
  if (b.as.i == 0)
    fx_die("Divisão por zero.");
  return fx_int(b.as.i == -1 ? 0 : a.as.i % b.as.i);
}

FX_FN FxValue fx_neg(FxValue a) {
  if (a.tag == FX_INT) {
    if (a.as.i == INT32_MIN)
      fx_die("Estouro de inteiro.");
    return fx_int(-a.as.i);
  }
  if (a.tag == FX_FLOAT)
    return fx_float(-a.as.f);
  fx_type_err("int ou float", a);
}

/* Uma condição tem de ser bool (sem truthy/falsy). */
FX_FN int fx_cond(FxValue v) {
  if (v.tag != FX_BOOL)
    fx_type_err("bool", v);
  return v.as.b;
}

FX_FN FxValue fx_not(FxValue v) { return fx_bool(!fx_cond(v)); }

/* < <= > >=: int e float se comparam promovendo o int. Devolve <0, 0 ou >0. */
FX_FN int fx_order(FxValue a, FxValue b, int *unordered) {
  fx_need_nums(a, b);
  *unordered = 0;
  if (a.tag == FX_INT && b.tag == FX_INT)
    return (a.as.i > b.as.i) - (a.as.i < b.as.i);
  double x = fx_num(a), y = fx_num(b);
  if (isnan(x) || isnan(y)) {
    *unordered = 1;
    return 0;
  }
  return (x > y) - (x < y);
}

FX_FN FxValue fx_lt(FxValue a, FxValue b) { int u; int c = fx_order(a, b, &u); return fx_bool(!u && c < 0); }
FX_FN FxValue fx_le(FxValue a, FxValue b) { int u; int c = fx_order(a, b, &u); return fx_bool(!u && c <= 0); }
FX_FN FxValue fx_gt(FxValue a, FxValue b) { int u; int c = fx_order(a, b, &u); return fx_bool(!u && c > 0); }
FX_FN FxValue fx_ge(FxValue a, FxValue b) { int u; int c = fx_order(a, b, &u); return fx_bool(!u && c >= 0); }

/* == e !=: mesmo tipo (int e float se comparam), ou qualquer valor com null.
 * list e object só se comparam com null; entre si, comparam a identidade. */
FX_FN int fx_equal(FxValue a, FxValue b) {
  if (a.tag == FX_NULL || b.tag == FX_NULL)
    return a.tag == b.tag;
  if (fx_is_num(a) && fx_is_num(b)) {
    if (a.tag == FX_INT && b.tag == FX_INT)
      return a.as.i == b.as.i;
    return fx_num(a) == fx_num(b);
  }
  if (a.tag != b.tag)
    return 0;
  switch (a.tag) {
  case FX_BOOL:   return a.as.b == b.as.b;
  case FX_STRING: return strcmp(a.as.s, b.as.s) == 0;
  case FX_LIST:   return a.as.l == b.as.l;
  default:        return a.as.o == b.as.o;
  }
}

FX_FN FxValue fx_eq(FxValue a, FxValue b) { return fx_bool(fx_equal(a, b)); }
FX_FN FxValue fx_ne(FxValue a, FxValue b) { return fx_bool(!fx_equal(a, b)); }

/* ---------- Texto: toString e a formatação dos valores ---------- */

FX_FN const char *fx_dup_printf(const char *fmt, ...) __attribute__((format(printf, 1, 2)));
FX_FN const char *fx_dup_printf(const char *fmt, ...) {
  va_list args;
  va_start(args, fmt);
  int n = vsnprintf(NULL, 0, fmt, args);
  va_end(args);
  char *s = fx_alloc(n + 1);
  va_start(args, fmt);
  vsnprintf(s, n + 1, fmt, args);
  va_end(args);
  return s;
}

/* float: a forma mais curta que volta ao mesmo número, com ".0" se for inteiro. */
FX_FN const char *fx_fmt_float(double f) {
  if (isnan(f))
    return "nan";
  if (isinf(f))
    return f < 0 ? "-inf" : "inf";
  char buf[40];
  for (int prec = 15; prec <= 17; prec++) {
    snprintf(buf, sizeof buf, "%.*g", prec, f);
    if (strtod(buf, NULL) == f)
      break;
  }
  if (!strpbrk(buf, ".eE"))
    strcat(buf, ".0");
  return fx_dup_printf("%s", buf);
}

FX_FN const char *fx_repr(FxValue v, int quote);

FX_FN const char *fx_repr(FxValue v, int quote) {
  switch (v.tag) {
  case FX_NULL:   return "null";
  case FX_INT:    return fx_dup_printf("%d", v.as.i);
  case FX_FLOAT:  return fx_fmt_float(v.as.f);
  case FX_BOOL:   return v.as.b ? "true" : "false";
  case FX_STRING: return quote ? fx_dup_printf("\"%s\"", v.as.s) : v.as.s;
  case FX_LIST: {
    const char *s = "[";
    for (int i = 0; i < v.as.l->n; i++)
      s = fx_dup_printf("%s%s%s", s, i ? ", " : "", fx_repr(v.as.l->v[i], 1));
    return fx_dup_printf("%s]", s);
  }
  default: {
    const char *s = "{";
    for (int i = 0; i < v.as.o->n; i++)
      s = fx_dup_printf("%s%s%s: %s", s, i ? ", " : "", v.as.o->keys[i],
                        fx_repr(v.as.o->vals[i], 1));
    return fx_dup_printf("%s}", s);
  }
  }
}

FX_FN FxValue fx_to_string(FxValue v) { return fx_str(fx_repr(v, 0)); }

/* ---------- Conversões (R1) ---------- */

FX_FN void fx_cannot_convert(FxValue v, const char *to) __attribute__((noreturn));
FX_FN void fx_cannot_convert(FxValue v, const char *to) {
  fx_die("Não é possível converter %s para %s.", fx_repr(v, 1), to);
}

FX_FN FxValue fx_to_int(FxValue v) {
  if (v.tag == FX_NULL)
    fx_null_use();
  if (v.tag == FX_INT)
    return v;
  if (v.tag == FX_FLOAT) {
    double f = v.as.f;
    if (isnan(f) || f >= 2147483648.0 || f <= -2147483649.0)
      fx_cannot_convert(v, "int");
    return fx_int((int32_t)f); /* trunca */
  }
  if (v.tag == FX_STRING) {
    char *end;
    errno = 0;
    long n = strtol(v.as.s, &end, 10);
    if (v.as.s[0] == '\0' || *end != '\0' || errno == ERANGE || n > INT32_MAX || n < INT32_MIN)
      fx_cannot_convert(v, "int");
    return fx_int((int32_t)n);
  }
  fx_type_err("string ou float", v);
}

FX_FN FxValue fx_to_float(FxValue v) {
  if (v.tag == FX_NULL)
    fx_null_use();
  if (v.tag == FX_FLOAT)
    return v;
  if (v.tag == FX_INT)
    return fx_float((double)v.as.i);
  if (v.tag == FX_STRING) {
    char *end;
    errno = 0;
    double f = strtod(v.as.s, &end);
    if (v.as.s[0] == '\0' || *end != '\0' || errno == ERANGE)
      fx_cannot_convert(v, "float");
    return fx_float(f);
  }
  fx_type_err("string ou int", v);
}

FX_FN FxValue fx_to_bool(FxValue v) {
  if (v.tag == FX_NULL)
    fx_null_use();
  if (v.tag == FX_BOOL)
    return v;
  if (v.tag == FX_STRING) {
    if (strcmp(v.as.s, "true") == 0)
      return fx_bool(1);
    if (strcmp(v.as.s, "false") == 0)
      return fx_bool(0);
    fx_cannot_convert(v, "bool");
  }
  fx_type_err("string", v);
}

/* ---------- terminal ---------- */

/* log e info vão para a saída padrão; warn e error, para a de erro. */
FX_FN FxValue fx_log(FxValue v)   { fprintf(stdout, "%s\n", fx_repr(v, 0)); return fx_null(); }
FX_FN FxValue fx_info(FxValue v)  { fprintf(stdout, "%s\n", fx_repr(v, 0)); return fx_null(); }
FX_FN FxValue fx_warn(FxValue v)  { fflush(stdout); fprintf(stderr, "%s\n", fx_repr(v, 0)); return fx_null(); }
FX_FN FxValue fx_error(FxValue v) { fflush(stdout); fprintf(stderr, "%s\n", fx_repr(v, 0)); return fx_null(); }

/* terminal.input(prompt): lê uma linha; no fim da entrada devolve "". */
FX_FN FxValue fx_input(FxValue prompt) {
  if (prompt.tag == FX_STRING) {
    fputs(prompt.as.s, stdout);
    fflush(stdout);
  } else if (prompt.tag != FX_NULL) {
    fx_type_err("string", prompt);
  }
  size_t cap = 128, n = 0;
  char *buf = fx_alloc(cap);
  int c;
  while ((c = getchar()) != EOF && c != '\n') {
    if (n + 1 >= cap) {
      cap *= 2;
      buf = realloc(buf, cap);
      if (!buf) {
        fprintf(stderr, "Memória esgotada.\n");
        exit(2);
      }
    }
    buf[n++] = (char)c;
  }
  buf[n] = '\0';
  return fx_str(buf);
}

/* abort if e: escreve a mensagem na saída de erro e encerra com código 1. */
FX_FN void fx_abort(FxValue e) __attribute__((noreturn));
FX_FN void fx_abort(FxValue e) { fx_die("%s", fx_repr(e, 0)); }

/* ---------- run ---------- */

/* Executa o comando (sem shell) e junta a saída padrão e a de erro. */
FX_FN FxPair fx_run(FxValue spec) {
  FxObj *o = fx_as_obj_ptr(spec);
  int ic = fx_obj_find(o, "command");
  if (ic < 0)
    fx_die("'run' sem o campo obrigatório 'command'.");
  FxValue command = o->vals[ic];
  if (command.tag != FX_STRING)
    fx_type_err("string", command);

  int n_flags = 0;
  FxList *flags = NULL;
  int iflags = fx_obj_find(o, "flags");
  if (iflags >= 0 && o->vals[iflags].tag != FX_NULL) {
    flags = fx_as_list_ptr(o->vals[iflags]);
    n_flags = flags->n;
  }
  const char *dir = NULL;
  int idir = fx_obj_find(o, "workingDir");
  if (idir >= 0 && o->vals[idir].tag != FX_NULL) {
    if (o->vals[idir].tag != FX_STRING)
      fx_type_err("string", o->vals[idir]);
    dir = o->vals[idir].as.s;
  }

  char **argv = fx_alloc((n_flags + 2) * sizeof(char *));
  argv[0] = (char *)command.as.s;
  for (int i = 0; i < n_flags; i++) {
    if (flags->v[i].tag != FX_STRING)
      fx_type_err("string", flags->v[i]);
    argv[i + 1] = (char *)flags->v[i].as.s;
  }

  int out_pipe[2], err_pipe[2];
  if (pipe(out_pipe) < 0 || pipe(err_pipe) < 0)
    return fx_pair(fx_null(), fx_str("não foi possível criar os pipes do comando"));

  fflush(stdout);
  fflush(stderr);
  pid_t pid = fork();
  if (pid < 0)
    return fx_pair(fx_null(), fx_str(fx_dup_printf("comando '%s' não pôde ser iniciado: %s",
                                                   command.as.s, strerror(errno))));
  if (pid == 0) {
    dup2(out_pipe[1], 1);
    dup2(err_pipe[1], 2);
    close(out_pipe[0]); close(out_pipe[1]);
    close(err_pipe[0]); close(err_pipe[1]);
    if (dir && chdir(dir) < 0) {
      fprintf(stderr, "comando '%s' não pôde ser iniciado: %s: %s\n", command.as.s, dir,
              strerror(errno));
      _exit(127);
    }
    execvp(argv[0], argv);
    fprintf(stderr, "comando '%s' não pôde ser iniciado: %s\n", command.as.s, strerror(errno));
    _exit(127);
  }
  close(out_pipe[1]);
  close(err_pipe[1]);

  char *bufs[2] = {fx_alloc(256), fx_alloc(256)};
  size_t lens[2] = {0, 0}, caps[2] = {256, 256};
  struct pollfd fds[2] = {{out_pipe[0], POLLIN, 0}, {err_pipe[0], POLLIN, 0}};
  int open_fds = 2;
  while (open_fds > 0) {
    if (poll(fds, 2, -1) < 0 && errno != EINTR)
      break;
    for (int k = 0; k < 2; k++) {
      if (fds[k].fd < 0 || !(fds[k].revents & (POLLIN | POLLHUP)))
        continue;
      if (lens[k] + 129 > caps[k]) {
        caps[k] *= 2;
        bufs[k] = realloc(bufs[k], caps[k]);
        if (!bufs[k]) {
          fprintf(stderr, "Memória esgotada.\n");
          exit(2);
        }
      }
      ssize_t got = read(fds[k].fd, bufs[k] + lens[k], 128);
      if (got > 0) {
        lens[k] += (size_t)got;
      } else if (got == 0 || (got < 0 && errno != EINTR)) {
        close(fds[k].fd);
        fds[k].fd = -1;
        open_fds--;
      }
    }
  }
  bufs[0][lens[0]] = '\0';
  bufs[1][lens[1]] = '\0';

  int status = 0;
  while (waitpid(pid, &status, 0) < 0 && errno == EINTR) {
  }
  if (WIFEXITED(status) && WEXITSTATUS(status) == 0)
    return fx_pair(fx_str(bufs[0]), fx_null());

  /* o erro é a saída de erro do comando; se vier vazia, uma frase com o código */
  while (lens[1] > 0 && (bufs[1][lens[1] - 1] == '\n' || bufs[1][lens[1] - 1] == '\r'))
    bufs[1][--lens[1]] = '\0';
  if (lens[1] > 0)
    return fx_pair(fx_null(), fx_str(bufs[1]));
  if (WIFEXITED(status))
    return fx_pair(fx_null(), fx_str(fx_dup_printf("comando '%s' terminou com código %d",
                                                   command.as.s, WEXITSTATUS(status))));
  return fx_pair(fx_null(), fx_str(fx_dup_printf("comando '%s' terminou pelo sinal %d",
                                                 command.as.s, WTERMSIG(status))));
}
