#include "tree.h"
#include "mem.h"
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>

Node *parse_root = NULL;

static Node *alloc(enum NodeKind kind, const char *label) {
  Node *n = mem_alloc(sizeof *n);
  n->kind = kind;
  n->label = label;
  return n;
}

Node *mknode(const char *label, int n, ...) {
  Node *node = alloc(NODE_RULE, label);
  va_list args;
  va_start(args, n);
  for (int i = 0; i < n; i++) {
    Node *child = va_arg(args, Node *);
    if (!child)
      continue;
    if (node->last_child)
      node->last_child->next = child;
    else
      node->first_child = child;
    node->last_child = child;
    if (node->line == 0) {
      node->line = child->line;
      node->column = child->column;
    }
  }
  va_end(args);
  return node;
}

Node *token_node(const char *label, const char *text, int line, int column) {
  Node *node = alloc(NODE_TOKEN, label);
  node->text = mem_strdup(text);
  node->line = line;
  node->column = column;
  return node;
}

Node *empty_node(void) { return alloc(NODE_EMPTY, "ε"); }

Node *error_node(int line, int column) {
  Node *node = alloc(NODE_ERROR, "error");
  node->line = line;
  node->column = column;
  return node;
}

static void print_node(const Node *node, int depth, FILE *out) {
  fprintf(out, "%*s", depth * 2, "");
  switch (node->kind) {
  case NODE_TOKEN:
    fprintf(out, "%s '%s' %d:%d\n", node->label, node->text, node->line,
            node->column);
    break;
  case NODE_ERROR:
    fprintf(out, "error %d:%d\n", node->line, node->column);
    break;
  default:
    fprintf(out, "%s\n", node->label);
  }
  for (const Node *c = node->first_child; c; c = c->next)
    print_node(c, depth + 1, out);
}

void print_tree(const Node *root, FILE *out) {
  if (root)
    print_node(root, 0, out);
}
