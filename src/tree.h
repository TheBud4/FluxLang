#ifndef TREE_H
#define TREE_H

#include <stdio.h>

/* Árvore de derivação: um nó por não-terminal da BNF (inclusive os *_rest
 * criados na fatoração LL(1)), uma folha por token e uma folha ε para cada
 * produção vazia. Fica fiel à gramática; quem a exibe pode colapsar os *_rest. */

enum NodeKind {
  NODE_RULE,  /* não-terminal: label = nome na BNF ("or_expr") */
  NODE_TOKEN, /* token: label = nome ("IDENTIFIER"), text = lexema */
  NODE_EMPTY, /* produção vazia (ε) */
  NODE_ERROR  /* trecho descartado pelo modo pânico */
};

typedef struct Node {
  enum NodeKind kind;
  const char *label;
  char *text;                /* só em tokens; senão NULL */
  int line, column;          /* onde o nó começa (0 se não há token, como o ε) */
  int flag;                  /* uso interno do parser (checagem S3), ver parser.y */
  struct Node *first_child, *last_child;
  struct Node *next;         /* próximo irmão */
} Node;

/* Cria um não-terminal com n filhos (Node *), na ordem. */
Node *mknode(const char *label, int n, ...);
Node *token_node(const char *label, const char *text, int line, int column);
Node *empty_node(void);
Node *error_node(int line, int column);

/* A raiz da última análise (nó "program"); NULL se nenhuma regra fechou. */
extern Node *parse_root;

/* Imprime a árvore indentada, um nó por linha. */
void print_tree(const Node *root, FILE *out);

#endif
