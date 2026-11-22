#ifndef TREE_H
#define TREE_H

#include <stdio.h>

enum NodeKind { NODE_RULE, NODE_TOKEN, NODE_EMPTY, NODE_ERROR };

typedef struct Node {
  enum NodeKind kind;
  const char *label;
  char *text;
  int line, column;
  int flag;
  struct Node *first_child, *last_child;
  struct Node *next;
} Node;

Node *mknode(const char *label, int n, ...);
Node *token_node(const char *label, const char *text, int line, int column);
Node *empty_node(void);
Node *error_node(int line, int column);

extern Node *parse_root;

void print_tree(const Node *root, FILE *out);

#endif
