#include "fluxc.h"
#include "mem.h"
#include "tree.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
  char *type, *text;
  int line, column;
} TokenRec;

typedef struct {
  char *kind, *message;
  int line, column;
} ErrorRec;

static int enabled;
static TokenRec *tokens;
static int token_count, token_cap;
static ErrorRec *errors;
static int error_count_rec, error_cap;

static void *grow(void *array, int count, int *cap, size_t size) {
  if (count < *cap)
    return array;
  int new_cap = *cap ? *cap * 2 : 64;
  array = mem_grow(array, (size_t)*cap * size, (size_t)new_cap * size);
  *cap = new_cap;
  return array;
}

void json_enable(void) { enabled = 1; }
int json_enabled(void) { return enabled; }

void json_record_token(const char *type, const char *text, int line,
                       int column) {
  if (!enabled)
    return;
  tokens = grow(tokens, token_count, &token_cap, sizeof *tokens);
  tokens[token_count++] = (TokenRec){mem_strdup(type), mem_strdup(text), line, column};
}

void json_record_error(const char *kind, int line, int column,
                       const char *message) {
  errors = grow(errors, error_count_rec, &error_cap, sizeof *errors);
  errors[error_count_rec++] =
      (ErrorRec){mem_strdup(kind), mem_strdup(message), line, column};
}

static void put_string(FILE *out, const char *s) {
  fputc('"', out);
  for (const unsigned char *p = (const unsigned char *)s; *p;) {
    unsigned char c = *p;
    if (c == '"' || c == '\\') {
      fprintf(out, "\\%c", c);
      p++;
    } else if (c == '\n') {
      fputs("\\n", out);
      p++;
    } else if (c == '\t') {
      fputs("\\t", out);
      p++;
    } else if (c < 0x20) {
      fprintf(out, "\\u%04x", c);
      p++;
    } else if (c < 0x80) {
      fputc(c, out);
      p++;
    } else {
      int len = c >= 0xF0 ? 4 : c >= 0xE0 ? 3 : c >= 0xC2 ? 2 : 0;
      int ok = len > 0 && c <= 0xF4;
      for (int i = 1; ok && i < len; i++)
        ok = (p[i] & 0xC0) == 0x80;
      if (ok) {
        fwrite(p, 1, len, out);
        p += len;
      } else {
        fputs("\\ufffd", out);
        p++;
      }
    }
  }
  fputc('"', out);
}

static const char *kind_name(enum NodeKind kind) {
  switch (kind) {
  case NODE_RULE:  return "rule";
  case NODE_TOKEN: return "token";
  case NODE_EMPTY: return "empty";
  default:         return "error";
  }
}

static void put_node(FILE *out, const Node *node) {
  fprintf(out, "{\"kind\":\"%s\",\"label\":", kind_name(node->kind));
  put_string(out, node->label);
  if (node->text) {
    fputs(",\"text\":", out);
    put_string(out, node->text);
  }
  if (node->line)
    fprintf(out, ",\"line\":%d,\"column\":%d", node->line, node->column);
  if (node->first_child) {
    fputs(",\"children\":[", out);
    for (const Node *c = node->first_child; c; c = c->next) {
      if (c != node->first_child)
        fputc(',', out);
      put_node(out, c);
    }
    fputc(']', out);
  }
  fputc('}', out);
}

void json_print(FILE *out, int accepted, int lines) {
  fprintf(out, "{\n\"accepted\": %s,\n\"lines\": %d,\n", accepted ? "true" : "false",
          lines);

  fputs("\"tokens\": [", out);
  for (int i = 0; i < token_count; i++) {
    fputs(i ? ",\n  " : "\n  ", out);
    fprintf(out, "{\"line\":%d,\"column\":%d,\"type\":", tokens[i].line,
            tokens[i].column);
    put_string(out, tokens[i].type);
    fputs(",\"text\":", out);
    put_string(out, tokens[i].text);
    fputc('}', out);
  }
  fputs(token_count ? "\n],\n" : "],\n", out);

  fputs("\"errors\": [", out);
  for (int i = 0; i < error_count_rec; i++) {
    fputs(i ? ",\n  " : "\n  ", out);
    fprintf(out, "{\"kind\":");
    put_string(out, errors[i].kind);
    fprintf(out, ",\"line\":%d,\"column\":%d,\"message\":", errors[i].line,
            errors[i].column);
    put_string(out, errors[i].message);
    fputc('}', out);
  }
  fputs(error_count_rec ? "\n],\n" : "],\n", out);

  fputs("\"tree\": ", out);
  if (parse_root)
    put_node(out, parse_root);
  else
    fputs("null", out);
  fputs("\n}\n", out);
}
