#ifdef _WIN32
#ifndef __USE_MINGW_ANSI_STDIO
#define __USE_MINGW_ANSI_STDIO 1
#endif
#endif

#include <errno.h>
#include <math.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <fcntl.h>
#include <io.h>
#include <windows.h>
#define fx_isatty _isatty
#else
#include <fcntl.h>
#include <poll.h>
#include <sys/resource.h>
#include <sys/wait.h>
#include <unistd.h>
#define fx_isatty isatty
#endif

#define FX_FN static __attribute__((unused))

typedef enum {
  FX_NULL,
  FX_INT,
  FX_FLOAT,
  FX_BOOL,
  FX_STRING,
  FX_LIST,
  FX_OBJECT
} FxTag;

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

typedef struct {
  FxValue result, error;
} FxPair;

static int fx_line;
#define FX_LINE(n) (fx_line = (n))

static int fx_tagged;

FX_FN int fx_use_color(int fd) {
  const char *no = getenv("NO_COLOR");
  if (no && no[0])
    return 0;
  const char *force = getenv("FORCE_COLOR");
  if (force && force[0] && strcmp(force, "0") != 0)
    return 1;
  return fx_isatty(fd);
}

FX_FN const char *fx_color_of(char kind) {
  switch (kind) {
  case 'L':
    return "\033[94m";
  case 'I':
    return "\033[36m";
  case 'W':
    return "\033[33m";
  case 'E':
    return "\033[31m";
  default:
    return "\033[1;31m";
  }
}

FX_FN void fx_emit(char kind, const char *text) {
  size_t n = strlen(text);
  fprintf(stdout, "\x1e%c%zu:", kind, n);
  fwrite(text, 1, n, stdout);
}

FX_FN void fx_die(const char *fmt, ...)
    __attribute__((noreturn, format(printf, 1, 2)));
FX_FN void fx_die(const char *fmt, ...) {
  va_list args;
  va_start(args, fmt);
  int n = vsnprintf(NULL, 0, fmt, args);
  va_end(args);
  char *msg = malloc((size_t)n + 1);
  if (msg) {
    va_start(args, fmt);
    vsnprintf(msg, (size_t)n + 1, fmt, args);
    va_end(args);
  }
  const char *text = msg ? msg : "erro de execução";
  if (fx_tagged) {
    size_t size = strlen(text) + 64;
    char *full = malloc(size);
    if (full) {
      snprintf(full, size, "Erro de execução [linha %d]:\n%s", fx_line, text);
      fx_emit('F', full);
    }
    fflush(stdout);
    exit(1);
  }
  fflush(stdout);
  int color = fx_use_color(2);
  fprintf(stderr, "%sErro de execução [linha %d]:\n%s%s\n",
          color ? fx_color_of('F') : "", fx_line, text, color ? "\033[0m" : "");
  exit(1);
}

FX_FN const char *fx_tag_name(FxTag t) {
  switch (t) {
  case FX_NULL:
    return "null";
  case FX_INT:
    return "int";
  case FX_FLOAT:
    return "float";
  case FX_BOOL:
    return "bool";
  case FX_STRING:
    return "string";
  case FX_LIST:
    return "list";
  default:
    return "object";
  }
}

FX_FN void fx_null_use(void) __attribute__((noreturn));
FX_FN void fx_null_use(void) { fx_die("Uso de valor null."); }

FX_FN void fx_type_err(const char *expected, FxValue got)
    __attribute__((noreturn));
FX_FN void fx_type_err(const char *expected, FxValue got) {
  if (got.tag == FX_NULL)
    fx_null_use();
  fx_die("Esperado %s, encontrado %s.", expected, fx_tag_name(got.tag));
}

static const char *fx_stack_base;
static size_t fx_stack_limit;

FX_FN int fx_stack_full(void) {
  const char *here = __builtin_frame_address(0);
  return (size_t)(fx_stack_base - here) > fx_stack_limit;
}

FX_FN void fx_check_stack(void) {
  if (fx_stack_full())
    fx_die("Estouro de pilha: recursão profunda demais.");
}

typedef enum { FXB_RAW, FXB_LIST, FXB_VALUES, FXB_OBJ, FXB_KEYS } FxBlockKind;

typedef struct FxBlock {
  struct FxBlock *next;
  size_t size;
  unsigned char kind, mark, busy;
} __attribute__((aligned(16))) FxBlock;

static FxBlock *fx_blocks;
static size_t fx_block_count;
static size_t fx_gc_since;
static size_t fx_gc_threshold = 4u << 20;
static int fx_gc_disabled, fx_gc_stress;
static size_t fx_gc_runs, fx_gc_freed;

static FxValue **fx_roots;
static size_t fx_n_roots, fx_cap_roots;

static FxBlock **fx_gc_sorted;
static size_t fx_gc_n;
static FxBlock **fx_gc_todo;
static size_t fx_gc_todo_n, fx_gc_todo_cap;

FX_FN void fx_no_memory(void) __attribute__((noreturn));
FX_FN void fx_no_memory(void) {
  fprintf(stderr, "Memória esgotada.\n");
  exit(2);
}

FX_FN void fx_gc_root(FxValue *slot) {
  if (fx_n_roots == fx_cap_roots) {
    fx_cap_roots = fx_cap_roots ? fx_cap_roots * 2 : 16;
    fx_roots = realloc(fx_roots, fx_cap_roots * sizeof *fx_roots);
    if (!fx_roots)
      fx_no_memory();
  }
  fx_roots[fx_n_roots++] = slot;
}

FX_FN int fx_block_cmp(const void *a, const void *b) {
  const FxBlock *x = *(FxBlock *const *)a, *y = *(FxBlock *const *)b;
  return (x > y) - (x < y);
}

FX_FN FxBlock *fx_gc_find(const void *p) {
  size_t lo = 0, hi = fx_gc_n;
  while (lo < hi) {
    size_t mid = (lo + hi) / 2;
    if ((const void *)fx_gc_sorted[mid] <= p)
      lo = mid + 1;
    else
      hi = mid;
  }
  if (lo == 0)
    return NULL;
  FxBlock *b = fx_gc_sorted[lo - 1];
  const char *end = (const char *)(b + 1) + b->size;
  return ((const char *)p >= (const char *)b && (const char *)p < end) ? b
                                                                       : NULL;
}

FX_FN void fx_gc_mark_ptr(const void *p) {
  FxBlock *b = p ? fx_gc_find(p) : NULL;
  if (!b || b->mark)
    return;
  b->mark = 1;
  if (fx_gc_todo_n == fx_gc_todo_cap) {
    fx_gc_todo_cap = fx_gc_todo_cap ? fx_gc_todo_cap * 2 : 256;
    fx_gc_todo = realloc(fx_gc_todo, fx_gc_todo_cap * sizeof *fx_gc_todo);
    if (!fx_gc_todo)
      fx_no_memory();
  }
  fx_gc_todo[fx_gc_todo_n++] = b;
}

FX_FN void fx_gc_mark_value(const FxValue *v) {
  switch (v->tag) {
  case FX_STRING:
    fx_gc_mark_ptr(v->as.s);
    break;
  case FX_LIST:
    fx_gc_mark_ptr(v->as.l);
    break;
  case FX_OBJECT:
    fx_gc_mark_ptr(v->as.o);
    break;
  default:
    break;
  }
}

FX_FN void fx_gc_trace(FxBlock *b) {
  void *payload = b + 1;
  switch (b->kind) {
  case FXB_LIST:
    fx_gc_mark_ptr(((FxList *)payload)->v);
    break;
  case FXB_OBJ:
    fx_gc_mark_ptr(((FxObj *)payload)->keys);
    fx_gc_mark_ptr(((FxObj *)payload)->vals);
    break;
  case FXB_VALUES:
    for (size_t i = 0; i < b->size / sizeof(FxValue); i++)
      fx_gc_mark_value(&((FxValue *)payload)[i]);
    break;
  case FXB_KEYS:
    for (size_t i = 0; i < b->size / sizeof(char *); i++)
      fx_gc_mark_ptr(((const char **)payload)[i]);
    break;
  default:
    break;
  }
}

FX_FN void fx_gc_scan_range(const char *lo, const char *hi)
    __attribute__((noinline, no_sanitize_address));
FX_FN void fx_gc_scan_range(const char *lo, const char *hi) {
  uintptr_t start = ((uintptr_t)lo + 7) & ~(uintptr_t)7;
  for (const uintptr_t *w = (const uintptr_t *)start;
       (const char *)(w + 1) <= hi; w++)
    fx_gc_mark_ptr((const void *)*w);
}

FX_FN void fx_gc_collect(void) __attribute__((noinline));
FX_FN void fx_gc_collect(void) {
  uintptr_t saved[16] __attribute__((aligned(16))) = {0};
#if defined(__x86_64__) && defined(_WIN32)
  uintptr_t saved_xmm[20] __attribute__((aligned(16))) = {0};
  __asm__ volatile("movups %%xmm6, 0(%0)\n\tmovups %%xmm7, 16(%0)\n\tmovups "
                   "%%xmm8, 32(%0)\n\t"
                   "movups %%xmm9, 48(%0)\n\tmovups %%xmm10, 64(%0)\n\tmovups "
                   "%%xmm11, 80(%0)\n\t"
                   "movups %%xmm12, 96(%0)\n\tmovups %%xmm13, "
                   "112(%0)\n\tmovups %%xmm14, 128(%0)\n\t"
                   "movups %%xmm15, 144(%0)"
                   :
                   : "c"(saved_xmm)
                   : "memory");
#endif
#if defined(__x86_64__)
  __asm__ volatile(
      "movq %%rbx, 0(%0)\n\tmovq %%rbp, 8(%0)\n\tmovq %%r12, 16(%0)\n\t"
      "movq %%r13, 24(%0)\n\tmovq %%r14, 32(%0)\n\tmovq %%r15, 40(%0)\n\t"
      "movq %%rdi, 48(%0)\n\tmovq %%rsi, 56(%0)"
      :
      : "c"(saved)
      : "memory");
#else
  __builtin_unwind_init();
#endif
  fx_gc_runs++;

  fx_gc_n = fx_block_count;
  fx_gc_sorted = malloc((fx_gc_n ? fx_gc_n : 1) * sizeof *fx_gc_sorted);
  if (!fx_gc_sorted)
    fx_no_memory();
  size_t i = 0;
  for (FxBlock *b = fx_blocks; b; b = b->next)
    fx_gc_sorted[i++] = b;
  qsort(fx_gc_sorted, fx_gc_n, sizeof *fx_gc_sorted, fx_block_cmp);
  fx_gc_todo_n = 0;

  for (size_t r = 0; r < fx_n_roots; r++)
    fx_gc_mark_value(fx_roots[r]);
  volatile char here = 0;
  const char *lo = (const char *)&here;
  if ((const char *)saved < lo)
    lo = (const char *)saved;
#if defined(__x86_64__) && defined(_WIN32)
  if ((const char *)saved_xmm < lo)
    lo = (const char *)saved_xmm;
#endif
  fx_gc_scan_range(lo, fx_stack_base + 64);
  while (fx_gc_todo_n > 0)
    fx_gc_trace(fx_gc_todo[--fx_gc_todo_n]);

  size_t live_bytes = 0, live = 0;
  FxBlock **link = &fx_blocks;
  while (*link) {
    FxBlock *b = *link;
    if (b->mark) {
      b->mark = 0;
      live++;
      live_bytes += b->size + sizeof *b;
      link = &b->next;
    } else {
      *link = b->next;
      free(b);
      fx_gc_freed++;
    }
  }
  fx_block_count = live;
  fx_gc_since = 0;
  fx_gc_threshold = live_bytes > (4u << 20) ? live_bytes : (4u << 20);
  free(fx_gc_sorted);
  fx_gc_sorted = NULL;
  fx_gc_n = 0;
}

FX_FN void *fx_gc_alloc(size_t n, FxBlockKind kind) {
  if (!fx_gc_disabled && (fx_gc_stress || fx_gc_since >= fx_gc_threshold))
    fx_gc_collect();
  size_t size = n ? n : 1;
  FxBlock *b = calloc(1, sizeof *b + size);
  if (!b)
    fx_no_memory();
  b->size = size;
  b->kind = (unsigned char)kind;
  b->next = fx_blocks;
  fx_blocks = b;
  fx_block_count++;
  fx_gc_since += size + sizeof *b;
  return b + 1;
}

FX_FN void *fx_alloc(size_t n) { return fx_gc_alloc(n, FXB_RAW); }

FX_FN void fx_gc_report(void) {
  fprintf(stderr, "[gc] %zu coletas, %zu blocos liberados, %zu blocos vivos\n",
          fx_gc_runs, fx_gc_freed, fx_block_count);
}

FX_FN void fx_init(const void *stack_base) {
  fx_tagged = getenv("FLUX_TAGGED") != NULL;
  const char *gc = getenv("FLUX_GC");
  fx_gc_disabled = gc && strcmp(gc, "0") == 0;
  fx_gc_stress = getenv("FLUX_GC_STRESS") != NULL;
  if (getenv("FLUX_GC_STATS"))
    atexit(fx_gc_report);

#ifdef _WIN32
  ULONG_PTR stack_low = 0, stack_high = 0;
  GetCurrentThreadStackLimits(&stack_low, &stack_high);
  size_t limit = (size_t)(stack_high - stack_low);
  if (fx_tagged) {
    _setmode(_fileno(stdout), _O_BINARY);
    _setmode(_fileno(stderr), _O_BINARY);
  }
  DWORD console_mode;
  HANDLE handles[2] = {GetStdHandle(STD_OUTPUT_HANDLE),
                       GetStdHandle(STD_ERROR_HANDLE)};
  for (int i = 0; i < 2; i++)
    if (GetConsoleMode(handles[i], &console_mode))
      SetConsoleMode(handles[i], console_mode | 0x0004);
#else
  struct rlimit rl;
  size_t limit = 8u << 20;
  if (getrlimit(RLIMIT_STACK, &rl) == 0 && rl.rlim_cur != RLIM_INFINITY)
    limit = (size_t)rl.rlim_cur;
#endif
  fx_stack_limit = limit > (512u << 10) ? limit - (256u << 10) : limit / 2;
  fx_stack_base = stack_base;
}

#ifdef _WIN32
typedef struct {
  int (*program)(void);
  int code;
} FxStart;

FX_FN DWORD WINAPI fx_thread_main(LPVOID arg) {
  FxStart *start = (FxStart *)arg;
  start->code = start->program();
  return 0;
}

FX_FN int fx_start(int (*program)(void)) {
  FxStart start = {program, 0};
  HANDLE thread = CreateThread(NULL, (SIZE_T)64 << 20, fx_thread_main, &start,
                               STACK_SIZE_PARAM_IS_A_RESERVATION, NULL);
  if (!thread)
    return program();
  WaitForSingleObject(thread, INFINITE);
  CloseHandle(thread);
  return start.code;
}
#else
FX_FN int fx_start(int (*program)(void)) { return program(); }
#endif

FX_FN FxValue fx_null(void) {
  FxValue v = {FX_NULL, {0}};
  return v;
}
FX_FN FxValue fx_int(int32_t i) {
  FxValue v;
  v.tag = FX_INT;
  v.as.i = i;
  return v;
}
FX_FN FxValue fx_float(double f) {
  FxValue v;
  v.tag = FX_FLOAT;
  v.as.f = f;
  return v;
}
FX_FN FxValue fx_bool(int b) {
  FxValue v;
  v.tag = FX_BOOL;
  v.as.b = b != 0;
  return v;
}
FX_FN FxValue fx_str(const char *s) {
  FxValue v;
  v.tag = FX_STRING;
  v.as.s = s;
  return v;
}

FX_FN FxValue fx_new_list(void) {
  FxValue v;
  v.tag = FX_LIST;
  v.as.l = fx_gc_alloc(sizeof(FxList), FXB_LIST);
  return v;
}

FX_FN FxValue fx_new_object(void) {
  FxValue v;
  v.tag = FX_OBJECT;
  v.as.o = fx_gc_alloc(sizeof(FxObj), FXB_OBJ);
  return v;
}

FX_FN FxPair fx_pair(FxValue result, FxValue error) {
  FxPair p = {result, error};
  return p;
}

FX_FN void fx_list_add(FxValue list, FxValue v) {
  FxList *l = list.as.l;
  if (l->n == l->cap) {
    int cap = l->cap ? l->cap * 2 : 4;
    FxValue *buffer = fx_gc_alloc((size_t)cap * sizeof(FxValue), FXB_VALUES);
    if (l->n)
      memcpy(buffer, l->v, (size_t)l->n * sizeof(FxValue));
    l->v = buffer;
    l->cap = cap;
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

FX_FN void fx_obj_put(FxObj *o, const char *key, FxValue v) {
  int i = fx_obj_find(o, key);
  if (i >= 0) {
    o->vals[i] = v;
    return;
  }
  if (o->n == o->cap) {
    int cap = o->cap ? o->cap * 2 : 4;
    const char **keys = fx_gc_alloc((size_t)cap * sizeof(char *), FXB_KEYS);
    FxValue *vals = fx_gc_alloc((size_t)cap * sizeof(FxValue), FXB_VALUES);
    if (o->n) {
      memcpy(keys, o->keys, (size_t)o->n * sizeof(char *));
      memcpy(vals, o->vals, (size_t)o->n * sizeof(FxValue));
    }
    o->keys = keys;
    o->vals = vals;
    o->cap = cap;
  }
  o->keys[o->n] = key;
  o->vals[o->n++] = v;
}

FX_FN void fx_obj_set(FxValue obj, const char *key, FxValue v) {
  fx_obj_put(obj.as.o, key, v);
}

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
  if (idx.as.i < 0 || idx.as.i >= l->n)
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
  l->v[l->n] = fx_null();
  return fx_null();
}

FX_FN FxList *fx_for_list(FxValue v) { return fx_as_list_ptr(v); }

FX_FN FxValue fx_as_int(FxValue v) {
  if (v.tag != FX_INT && v.tag != FX_NULL)
    fx_type_err("int", v);
  return v;
}
FX_FN FxValue fx_as_bool(FxValue v) {
  if (v.tag != FX_BOOL && v.tag != FX_NULL)
    fx_type_err("bool", v);
  return v;
}
FX_FN FxValue fx_as_string(FxValue v) {
  if (v.tag != FX_STRING && v.tag != FX_NULL)
    fx_type_err("string", v);
  return v;
}
FX_FN FxValue fx_as_list(FxValue v) {
  if (v.tag != FX_LIST && v.tag != FX_NULL)
    fx_type_err("list", v);
  return v;
}
FX_FN FxValue fx_as_object(FxValue v) {
  if (v.tag != FX_OBJECT && v.tag != FX_NULL)
    fx_type_err("object", v);
  return v;
}

FX_FN FxValue fx_as_float(FxValue v) {
  if (v.tag == FX_INT)
    return fx_float((double)v.as.i);
  if (v.tag != FX_FLOAT && v.tag != FX_NULL)
    fx_type_err("float", v);
  return v;
}

FX_FN int fx_is_num(FxValue v) { return v.tag == FX_INT || v.tag == FX_FLOAT; }
FX_FN double fx_num(FxValue v) {
  return v.tag == FX_INT ? (double)v.as.i : v.as.f;
}

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
    if (__builtin_add_overflow(a.as.i, b.as.i, &r))
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
    if (b.as.i == 0)
      fx_die("Divisão por zero.");
    if (a.as.i == INT32_MIN && b.as.i == -1)
      fx_die("Estouro de inteiro.");
    return fx_int(a.as.i / b.as.i);
  }
  return fx_float(fx_num(a) / fx_num(b));
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

FX_FN int fx_cond(FxValue v) {
  if (v.tag != FX_BOOL)
    fx_type_err("bool", v);
  return v.as.b;
}

FX_FN FxValue fx_not(FxValue v) { return fx_bool(!fx_cond(v)); }

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

FX_FN FxValue fx_lt(FxValue a, FxValue b) {
  int u;
  int c = fx_order(a, b, &u);
  return fx_bool(!u && c < 0);
}
FX_FN FxValue fx_le(FxValue a, FxValue b) {
  int u;
  int c = fx_order(a, b, &u);
  return fx_bool(!u && c <= 0);
}
FX_FN FxValue fx_gt(FxValue a, FxValue b) {
  int u;
  int c = fx_order(a, b, &u);
  return fx_bool(!u && c > 0);
}
FX_FN FxValue fx_ge(FxValue a, FxValue b) {
  int u;
  int c = fx_order(a, b, &u);
  return fx_bool(!u && c >= 0);
}

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
  case FX_BOOL:
    return a.as.b == b.as.b;
  case FX_STRING:
    return strcmp(a.as.s, b.as.s) == 0;
  case FX_LIST:
    return a.as.l == b.as.l;
  default:
    return a.as.o == b.as.o;
  }
}

FX_FN FxValue fx_eq(FxValue a, FxValue b) { return fx_bool(fx_equal(a, b)); }
FX_FN FxValue fx_ne(FxValue a, FxValue b) { return fx_bool(!fx_equal(a, b)); }

FX_FN const char *fx_dup_printf(const char *fmt, ...)
    __attribute__((format(printf, 1, 2)));
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

FX_FN FxBlock *fx_repr_enter(const void *payload) {
  FxBlock *b = (FxBlock *)payload - 1;
  if (b->busy || fx_stack_full())
    fx_die("Estrutura circular ou profunda demais para imprimir.");
  b->busy = 1;
  return b;
}

FX_FN const char *fx_repr(FxValue v, int quote) {
  switch (v.tag) {
  case FX_NULL:
    return "null";
  case FX_INT:
    return fx_dup_printf("%d", v.as.i);
  case FX_FLOAT:
    return fx_fmt_float(v.as.f);
  case FX_BOOL:
    return v.as.b ? "true" : "false";
  case FX_STRING:
    return quote ? fx_dup_printf("\"%s\"", v.as.s) : v.as.s;
  case FX_LIST: {
    FxBlock *b = fx_repr_enter(v.as.l);
    const char *s = "[";
    for (int i = 0; i < v.as.l->n; i++)
      s = fx_dup_printf("%s%s%s", s, i ? ", " : "", fx_repr(v.as.l->v[i], 1));
    b->busy = 0;
    return fx_dup_printf("%s]", s);
  }
  default: {
    FxBlock *b = fx_repr_enter(v.as.o);
    const char *s = "{";
    for (int i = 0; i < v.as.o->n; i++)
      s = fx_dup_printf("%s%s%s: %s", s, i ? ", " : "", v.as.o->keys[i],
                        fx_repr(v.as.o->vals[i], 1));
    b->busy = 0;
    return fx_dup_printf("%s}", s);
  }
  }
}

FX_FN FxValue fx_to_string(FxValue v) { return fx_str(fx_repr(v, 0)); }

FX_FN void fx_cannot_convert(FxValue v, const char *to)
    __attribute__((noreturn));
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
    return fx_int((int32_t)f);
  }
  if (v.tag == FX_STRING) {
    char *end;
    errno = 0;
    long n = strtol(v.as.s, &end, 10);
    if (v.as.s[0] == '\0' || *end != '\0' || errno == ERANGE || n > INT32_MAX ||
        n < INT32_MIN)
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

FX_FN FxValue fx_print(char kind, int to_stderr, FxValue v) {
  const char *text = fx_repr(v, 0);
  if (fx_tagged) {
    fx_emit(kind, text);
    return fx_null();
  }
  FILE *stream = to_stderr ? stderr : stdout;
  if (to_stderr)
    fflush(stdout);
  int color = fx_use_color(to_stderr ? 2 : 1);
  fprintf(stream, "%s%s%s\n", color ? fx_color_of(kind) : "", text,
          color ? "\033[0m" : "");
  return fx_null();
}

FX_FN FxValue fx_log(FxValue v) { return fx_print('L', 0, v); }
FX_FN FxValue fx_info(FxValue v) { return fx_print('I', 0, v); }
FX_FN FxValue fx_warn(FxValue v) { return fx_print('W', 1, v); }
FX_FN FxValue fx_error(FxValue v) { return fx_print('E', 1, v); }

FX_FN FxValue fx_input(FxValue prompt) {
  if (prompt.tag == FX_STRING) {
    if (fx_tagged)
      fx_emit('P', prompt.as.s);
    else
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
      char *bigger = fx_alloc(cap * 2);
      memcpy(bigger, buf, n);
      buf = bigger;
      cap *= 2;
    }
    buf[n++] = (char)c;
  }
  buf[n] = '\0';
  if (fx_tagged)
    fx_emit('A', buf);
  return fx_str(buf);
}

FX_FN void fx_abort(FxValue e) __attribute__((noreturn));
FX_FN void fx_abort(FxValue e) { fx_die("%s", fx_repr(e, 0)); }

FX_FN FxPair fx_run_result(const char *command, char *out, char *err,
                           size_t err_len, int exited, int code) {
  if (exited && code == 0)
    return fx_pair(fx_str(out), fx_null());
  while (err_len > 0 && (err[err_len - 1] == '\n' || err[err_len - 1] == '\r'))
    err[--err_len] = '\0';
  if (err_len > 0)
    return fx_pair(fx_null(), fx_str(err));
  if (exited)
    return fx_pair(fx_null(),
                   fx_str(fx_dup_printf("comando '%s' terminou com código %d",
                                        command, code)));
  return fx_pair(fx_null(),
                 fx_str(fx_dup_printf("comando '%s' terminou pelo sinal %d",
                                      command, code)));
}

FX_FN void fx_run_room(char **buf, size_t *cap, size_t len, size_t need) {
  if (len + need + 1 <= *cap)
    return;
  char *bigger = fx_alloc(*cap * 2 + need);
  memcpy(bigger, *buf, len);
  *buf = bigger;
  *cap = *cap * 2 + need;
}

#ifdef _WIN32

FX_FN const char *fx_win_message(DWORD code) {
  char buf[256];
  DWORD n =
      FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
                     NULL, code, 0, buf, sizeof buf, NULL);
  while (n > 0 &&
         (buf[n - 1] == '\n' || buf[n - 1] == '\r' || buf[n - 1] == ' '))
    buf[--n] = '\0';
  return n > 0 ? fx_dup_printf("%s", buf)
               : fx_dup_printf("erro %lu do sistema", (unsigned long)code);
}

FX_FN const char *fx_win_quote(const char *arg) {
  size_t n = strlen(arg);
  if (n > 0 && !strpbrk(arg, " \t\n\v\""))
    return arg;
  char *out = fx_alloc(n * 2 + 3);
  size_t o = 0;
  out[o++] = '"';
  for (size_t i = 0; i < n; i++) {
    size_t slashes = 0;
    while (i < n && arg[i] == '\\') {
      slashes++;
      i++;
    }
    if (i == n) {
      for (size_t k = 0; k < slashes * 2; k++)
        out[o++] = '\\';
      break;
    }
    if (arg[i] == '"') {
      for (size_t k = 0; k < slashes * 2 + 1; k++)
        out[o++] = '\\';
    } else {
      for (size_t k = 0; k < slashes; k++)
        out[o++] = '\\';
    }
    out[o++] = arg[i];
  }
  out[o++] = '"';
  out[o] = '\0';
  return out;
}

FX_FN FxPair fx_run_process(const char *command, char **argv, int argc,
                            const char *dir) {
  const char *cmdline = "";
  for (int i = 0; i < argc; i++)
    cmdline =
        fx_dup_printf("%s%s%s", cmdline, i ? " " : "", fx_win_quote(argv[i]));

  SECURITY_ATTRIBUTES sa = {sizeof sa, NULL, TRUE};
  HANDLE out_r, out_w, err_r, err_w;
  if (!CreatePipe(&out_r, &out_w, &sa, 0) ||
      !CreatePipe(&err_r, &err_w, &sa, 0))
    return fx_pair(fx_null(),
                   fx_str("não foi possível criar os pipes do comando"));
  SetHandleInformation(out_r, HANDLE_FLAG_INHERIT, 0);
  SetHandleInformation(err_r, HANDLE_FLAG_INHERIT, 0);

  STARTUPINFOA si;
  memset(&si, 0, sizeof si);
  si.cb = sizeof si;
  si.dwFlags = STARTF_USESTDHANDLES;
  si.hStdOutput = out_w;
  si.hStdError = err_w;
  si.hStdInput = GetStdHandle(STD_INPUT_HANDLE);
  PROCESS_INFORMATION pi;
  memset(&pi, 0, sizeof pi);

  fflush(stdout);
  fflush(stderr);
  char *mutable_line = fx_alloc(strlen(cmdline) + 1);
  strcpy(mutable_line, cmdline);
  BOOL started = CreateProcessA(NULL, mutable_line, NULL, NULL, TRUE, 0, NULL,
                                dir, &si, &pi);
  DWORD error = started ? 0 : GetLastError();
  CloseHandle(out_w);
  CloseHandle(err_w);
  if (!started) {
    CloseHandle(out_r);
    CloseHandle(err_r);
    return fx_pair(fx_null(), fx_str(fx_dup_printf(
                                  "comando '%s' não pôde ser iniciado: %s",
                                  command, fx_win_message(error))));
  }

  HANDLE pipes[2] = {out_r, err_r};
  char *bufs[2] = {fx_alloc(256), fx_alloc(256)};
  size_t lens[2] = {0, 0}, caps[2] = {256, 256};
  int open_pipes = 2;
  while (open_pipes > 0) {
    int idle = 1;
    for (int k = 0; k < 2; k++) {
      if (!pipes[k])
        continue;
      DWORD avail = 0;
      if (!PeekNamedPipe(pipes[k], NULL, 0, NULL, &avail, NULL)) {
        CloseHandle(pipes[k]);
        pipes[k] = NULL;
        open_pipes--;
        continue;
      }
      if (avail > 0) {
        DWORD want = avail < 4096 ? avail : 4096, got = 0;
        fx_run_room(&bufs[k], &caps[k], lens[k], want);
        if (ReadFile(pipes[k], bufs[k] + lens[k], want, &got, NULL) &&
            got > 0) {
          lens[k] += got;
          idle = 0;
        }
      }
    }
    if (idle && open_pipes > 0)
      Sleep(1);
  }
  bufs[0][lens[0]] = '\0';
  bufs[1][lens[1]] = '\0';

  WaitForSingleObject(pi.hProcess, INFINITE);
  DWORD code = 0;
  GetExitCodeProcess(pi.hProcess, &code);
  CloseHandle(pi.hProcess);
  CloseHandle(pi.hThread);
  return fx_run_result(command, bufs[0], bufs[1], lens[1], 1, (int)code);
}

#else

FX_FN FxPair fx_run_process(const char *command, char **argv, int argc,
                            const char *dir) {
  (void)argc;
  int out_pipe[2], err_pipe[2];
  if (pipe(out_pipe) < 0 || pipe(err_pipe) < 0)
    return fx_pair(fx_null(),
                   fx_str("não foi possível criar os pipes do comando"));

  fflush(stdout);
  fflush(stderr);
  pid_t pid = fork();
  if (pid < 0)
    return fx_pair(fx_null(), fx_str(fx_dup_printf(
                                  "comando '%s' não pôde ser iniciado: %s",
                                  command, strerror(errno))));
  if (pid == 0) {
    dup2(out_pipe[1], 1);
    dup2(err_pipe[1], 2);
    close(out_pipe[0]);
    close(out_pipe[1]);
    close(err_pipe[0]);
    close(err_pipe[1]);
    if (dir && chdir(dir) < 0) {
      fprintf(stderr, "comando '%s' não pôde ser iniciado: %s: %s\n", command,
              dir, strerror(errno));
      _exit(127);
    }
    execvp(argv[0], argv);
    fprintf(stderr, "comando '%s' não pôde ser iniciado: %s\n", command,
            strerror(errno));
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
      fx_run_room(&bufs[k], &caps[k], lens[k], 128);
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
  if (WIFEXITED(status))
    return fx_run_result(command, bufs[0], bufs[1], lens[1], 1,
                         WEXITSTATUS(status));
  return fx_run_result(command, bufs[0], bufs[1], lens[1], 0, WTERMSIG(status));
}

#endif

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
  return fx_run_process(command.as.s, argv, n_flags + 1, dir);
}
