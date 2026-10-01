%{
#include <stdio.h>
#include <string.h>
#include "fluxc.h"
    int yylex(void);
    void yyerror(const char *msg);
%}
%define parse.error custom
%code {
/* S3: onde está o "=" da atribuição, para a mensagem de erro */
static YYLTYPE assign_loc;

/* Último sufixo de uma expressão pós-fixa (postfix_rest) */
enum { SUFFIX_NONE, SUFFIX_ACCESS, SUFFIX_CALL };
}

%locations
%union {
  char *text;      /* texto do token (identificadores e literais) */
  int assignable;  /* expressões: 1 se pode receber atribuição */
}

/* Keywords */
%token VAR CONST FUNC WORKFLOW MAIN RETURN IF ELSE WHILE FOR IN BREAK CONTINUE CALL RUN STOP ABORT PROCEED
/* Type Keywords */
%token TYPE_INT TYPE_FLOAT TYPE_STRING TYPE_BOOL TYPE_OBJECT TYPE_LIST
/* Literals */
%token TRUE FALSE NULL_LITERAL
%token <text> INT_LITERAL FLOAT_LITERAL STRING_LITERAL
/* Identifier */
%token <text> IDENTIFIER
/* Operators */
%token ASSIGN EQUAL NOT_EQUAL LOWER_THAN LOWER_THAN_EQUAL GREATER_THAN GREATER_THAN_EQUAL PLUS MINUS MUL DIV MOD AND OR NOT
/* Punctuation */
%token LPAREN RPAREN LBRACE RBRACE LBRACKET RBRACKET COMMA COLON SEMICOLON DOT


%type <assignable> expression or_expr or_rest and_expr and_rest
%type <assignable> equality_expr equality_rest relational_expr relational_rest
%type <assignable> additive_expr additive_rest multiplicative_expr multiplicative_rest
%type <assignable> unary_expr postfix_expr postfix_rest primary
%type <assignable> expression_list expression_list_rest assignment_rest

%%

  program
  : before_main;
  before_main
  : global_no_func before_main | FUNC after_func;

  after_func
  : MAIN LPAREN RPAREN block after_main | IDENTIFIER function_rest before_main;

  after_main
  : global_no_func after_main | FUNC IDENTIFIER function_rest after_main | %empty;

  global_no_func
  : variable_declaration | constant_declaration | workflow;

  variable_declaration
  : VAR identifier_list variable_rest SEMICOLON;
  variable_rest
  : COLON type initializer | ASSIGN rhs;

  initializer
  : ASSIGN rhs | %empty;

  constant_declaration
  : CONST identifier_list constant_rest SEMICOLON;

  constant_rest
  : COLON type ASSIGN expression_list | ASSIGN expression_list;

  identifier_list
  : IDENTIFIER identifier_list_rest;

  identifier_list_rest
  : COMMA IDENTIFIER identifier_list_rest | %empty;

  rhs
  : CALL IDENTIFIER LPAREN args RPAREN | RUN object_literal | expression_list;

  type
  : TYPE_INT | TYPE_FLOAT | TYPE_STRING | TYPE_BOOL | TYPE_OBJECT | TYPE_LIST LOWER_THAN type GREATER_THAN;

  workflow
  : WORKFLOW IDENTIFIER function_rest;

  function_rest
  : LPAREN parameter_list RPAREN return_type block;

  parameter_list
  : parameters | %empty;

  parameters
  : parameter parameters_rest;

  parameters_rest
  : COMMA parameter parameters_rest | %empty;

  parameter
  : IDENTIFIER COLON type;

  return_type
  : COLON type | %empty;

  block
  : LBRACE commands RBRACE;

  commands
  : command commands | %empty;

  command
  : variable_declaration | constant_declaration | command_if | command_while | command_for | command_return | command_break | command_continue | command_error | command_expression;

  command_if
  : IF LPAREN expression RPAREN block else_part;

  else_part
  : ELSE block | %empty;

  command_while
  : WHILE LPAREN expression RPAREN block;

  command_for
  : FOR IDENTIFIER IN expression block;

  command_return
  : RETURN return_values SEMICOLON;

  return_values
  : expression_list | %empty;

  command_break
  : BREAK SEMICOLON;

  command_continue
  : CONTINUE SEMICOLON;

  command_error
  : error_action IF IDENTIFIER SEMICOLON;

  error_action
  : STOP | ABORT | PROCEED;

  command_expression
  : expression assignment_rest SEMICOLON {
  if ($2 != 0 && (!$1 || $2 == 2)) {
  report_error("sintático", assign_loc.first_line, assign_loc.first_column,
  "Token encontrado: '='\nEsperado: ';' (o lado esquerdo não é variável, campo ou índice)");
  YYABORT;
  }
  };

  assignment_rest
  : ASSIGN rhs { assign_loc = @1; $$ = 1; }
  | COMMA expression_list ASSIGN rhs { assign_loc = @3; $$ = $2 ? 1 : 2; }
  | %empty { $$ = 0; };

  expression
  : or_expr;

  or_expr
  : and_expr or_rest { $$ = $1 && !$2; };

  or_rest
  : OR and_expr or_rest { $$ = 1; } | %empty { $$ = 0; };

  and_expr
  : equality_expr and_rest { $$ = $1 && !$2; };

  and_rest
  : AND equality_expr and_rest { $$ = 1; } | %empty { $$ = 0; };

  equality_expr
  : relational_expr equality_rest { $$ = $1 && !$2; };

  equality_rest
  : equality_op relational_expr equality_rest { $$ = 1; } | %empty { $$ = 0; };

  equality_op
  : EQUAL | NOT_EQUAL;

  relational_expr
  : additive_expr relational_rest { $$ = $1 && !$2; };

  relational_rest
  : relational_op additive_expr relational_rest { $$ = 1; } | %empty { $$ = 0; };

  relational_op
  : LOWER_THAN | GREATER_THAN | LOWER_THAN_EQUAL | GREATER_THAN_EQUAL;

  additive_expr
  : multiplicative_expr additive_rest { $$ = $1 && !$2; };

  additive_rest
  : additive_op multiplicative_expr additive_rest { $$ = 1; } | %empty { $$ = 0; };

  additive_op
  : PLUS | MINUS;

  multiplicative_expr
  : unary_expr multiplicative_rest { $$ = $1 && !$2; };

  multiplicative_rest
  : multiplicative_op unary_expr multiplicative_rest { $$ = 1; } | %empty { $$ = 0; };

  multiplicative_op
  : MUL | DIV | MOD;

  unary_expr
  : unary_op unary_expr { $$ = 0; } | postfix_expr;

  unary_op
  : NOT | MINUS;

  postfix_expr
  : primary postfix_rest { $$ = ($2 == SUFFIX_NONE) ? $1 : ($2 == SUFFIX_ACCESS); };

  postfix_rest
  : DOT IDENTIFIER postfix_rest { $$ = $3 ? $3 : SUFFIX_ACCESS; }
  | LBRACKET expression RBRACKET postfix_rest { $$ = $4 ? $4 : SUFFIX_ACCESS; }
  | LPAREN args RPAREN postfix_rest { $$ = $4 ? $4 : SUFFIX_CALL; }
  | %empty { $$ = SUFFIX_NONE; };

  primary
  : IDENTIFIER { $$ = 1; }
  | INT_LITERAL { $$ = 0; } | FLOAT_LITERAL { $$ = 0; } | STRING_LITERAL { $$ = 0; }
  | TRUE { $$ = 0; } | FALSE { $$ = 0; } | NULL_LITERAL { $$ = 0; }
  | LPAREN expression RPAREN { $$ = 0; } | list_literal { $$ = 0; } | object_literal { $$ = 0; };

  list_literal
  : LBRACKET list_items RBRACKET;

  list_items
  : expression list_rest | %empty;

  list_rest
  : COMMA list_after_comma | %empty;

  list_after_comma
  : expression list_rest | %empty;

  object_literal
  : LBRACE object_items RBRACE;

  object_items
  : field fields_rest | %empty;

  fields_rest
  : COMMA fields_after_comma | %empty;

  fields_after_comma
  : field fields_rest | %empty;

  field
  : field_key COLON expression;

  field_key
  : IDENTIFIER | STRING_LITERAL;

  expression_list
  : expression expression_list_rest { $$ = $1 && $2; };

  expression_list_rest
  : COMMA expression expression_list_rest { $$ = $2 && $3; } | %empty { $$ = 1; };

  args
  : expression_list | %empty;


%%

const char *token_name(int tok) { return yysymbol_name(YYTRANSLATE(tok)); }

void yyerror(const char *msg) { fprintf(stderr, "%s\n", msg); }

/* ---------- Mensagens de erro sintático (docs/ERROS.md,1 e 3) ---------- */

/* Como o token é escrito no código-fonte ("if", ";"...), ou NULL para
   identificadores, literais e fim do arquivo. */
static const char *spelling(yysymbol_kind_t s) {
  switch (s) {
  case YYSYMBOL_VAR: return "var";           case YYSYMBOL_CONST: return "const";
  case YYSYMBOL_FUNC: return "func";         case YYSYMBOL_WORKFLOW: return "workflow";
  case YYSYMBOL_MAIN: return "main";         case YYSYMBOL_RETURN: return "return";
  case YYSYMBOL_IF: return "if";             case YYSYMBOL_ELSE: return "else";
  case YYSYMBOL_WHILE: return "while";       case YYSYMBOL_FOR: return "for";
  case YYSYMBOL_IN: return "in";             case YYSYMBOL_BREAK: return "break";
  case YYSYMBOL_CONTINUE: return "continue"; case YYSYMBOL_CALL: return "call";
  case YYSYMBOL_RUN: return "run";           case YYSYMBOL_STOP: return "stop";
  case YYSYMBOL_ABORT: return "abort";       case YYSYMBOL_PROCEED: return "proceed";
  case YYSYMBOL_TYPE_INT: return "int";      case YYSYMBOL_TYPE_FLOAT: return "float";
  case YYSYMBOL_TYPE_STRING: return "string"; case YYSYMBOL_TYPE_BOOL: return "bool";
  case YYSYMBOL_TYPE_OBJECT: return "object"; case YYSYMBOL_TYPE_LIST: return "list";
  case YYSYMBOL_TRUE: return "true";         case YYSYMBOL_FALSE: return "false";
  case YYSYMBOL_NULL_LITERAL: return "null";
  case YYSYMBOL_ASSIGN: return "=";          case YYSYMBOL_EQUAL: return "==";
  case YYSYMBOL_NOT_EQUAL: return "!=";      case YYSYMBOL_LOWER_THAN: return "<";
  case YYSYMBOL_LOWER_THAN_EQUAL: return "<="; case YYSYMBOL_GREATER_THAN: return ">";
  case YYSYMBOL_GREATER_THAN_EQUAL: return ">="; case YYSYMBOL_PLUS: return "+";
  case YYSYMBOL_MINUS: return "-";           case YYSYMBOL_MUL: return "*";
  case YYSYMBOL_DIV: return "/";             case YYSYMBOL_MOD: return "%";
  case YYSYMBOL_AND: return "&&";            case YYSYMBOL_OR: return "||";
  case YYSYMBOL_NOT: return "!";             case YYSYMBOL_LPAREN: return "(";
  case YYSYMBOL_RPAREN: return ")";          case YYSYMBOL_LBRACE: return "{";
  case YYSYMBOL_RBRACE: return "}";          case YYSYMBOL_LBRACKET: return "[";
  case YYSYMBOL_RBRACKET: return "]";        case YYSYMBOL_COMMA: return ",";
  case YYSYMBOL_COLON: return ":";           case YYSYMBOL_SEMICOLON: return ";";
  case YYSYMBOL_DOT: return ".";
  default: return NULL;
  }
}

static int is_keyword(yysymbol_kind_t s) {
  return s >= YYSYMBOL_VAR && s <= YYSYMBOL_NULL_LITERAL;
}

/* Nome de um token esperado: 'if', ';', identificador... */
static const char *expected_name(yysymbol_kind_t s, char *buf, size_t size) {
  switch (s) {
  case YYSYMBOL_YYEOF:          return "fim do arquivo";
  case YYSYMBOL_IDENTIFIER:     return "identificador";
  case YYSYMBOL_INT_LITERAL:    return "número inteiro";
  case YYSYMBOL_FLOAT_LITERAL:  return "número real";
  case YYSYMBOL_STRING_LITERAL: return "texto";
  default:
    snprintf(buf, size, "'%s'", spelling(s));
    return buf;
  }
}

/* O token encontrado, com o texto quando houver: identificador 'total'... */
static void found_name(yysymbol_kind_t s, char *buf, size_t size) {
  const char *text = yylval.text ? yylval.text : "";
  switch (s) {
  case YYSYMBOL_YYEOF:          snprintf(buf, size, "fim do arquivo"); break;
  case YYSYMBOL_IDENTIFIER:     snprintf(buf, size, "identificador '%s'", text); break;
  case YYSYMBOL_INT_LITERAL:    snprintf(buf, size, "número inteiro %s", text); break;
  case YYSYMBOL_FLOAT_LITERAL:  snprintf(buf, size, "número real %s", text); break;
  case YYSYMBOL_STRING_LITERAL: snprintf(buf, size, "texto %s", text); break;
  default:
    if (is_keyword(s)) snprintf(buf, size, "palavra reservada '%s'", spelling(s));
    else snprintf(buf, size, "'%s'", spelling(s));
  }
}

/* Categorias: quando todos os tokens que iniciam uma expressão, um tipo ou
   um comando são esperados, a lista vira uma palavra só. */
static const yysymbol_kind_t EXPRESSION_START[] = {
  YYSYMBOL_INT_LITERAL, YYSYMBOL_FLOAT_LITERAL, YYSYMBOL_STRING_LITERAL,
  YYSYMBOL_TRUE, YYSYMBOL_FALSE, YYSYMBOL_NULL_LITERAL, YYSYMBOL_IDENTIFIER,
  YYSYMBOL_LPAREN, YYSYMBOL_LBRACKET, YYSYMBOL_LBRACE, YYSYMBOL_NOT, YYSYMBOL_MINUS,
  YYSYMBOL_YYEMPTY};
static const yysymbol_kind_t TYPE_START[] = {
  YYSYMBOL_TYPE_INT, YYSYMBOL_TYPE_FLOAT, YYSYMBOL_TYPE_STRING,
  YYSYMBOL_TYPE_BOOL, YYSYMBOL_TYPE_OBJECT, YYSYMBOL_TYPE_LIST, YYSYMBOL_YYEMPTY};
static const yysymbol_kind_t COMMAND_KEYWORDS[] = {
  YYSYMBOL_VAR, YYSYMBOL_CONST, YYSYMBOL_IF, YYSYMBOL_WHILE, YYSYMBOL_FOR,
  YYSYMBOL_RETURN, YYSYMBOL_BREAK, YYSYMBOL_CONTINUE, YYSYMBOL_STOP,
  YYSYMBOL_ABORT, YYSYMBOL_PROCEED, YYSYMBOL_YYEMPTY};

/* Se todos os tokens de "group" estão marcados em "expected", desmarca-os e
   devolve 1. */
static int take_group(int *expected, const yysymbol_kind_t *group) {
  for (int i = 0; group[i] != YYSYMBOL_YYEMPTY; i++)
    if (!expected[group[i]]) return 0;
  for (int i = 0; group[i] != YYSYMBOL_YYEMPTY; i++)
    expected[group[i]] = 0;
  return 1;
}

int yyreport_syntax_error(const yypcontext_t *ctx) {
  yysymbol_kind_t list[YYNTOKENS];
  int n = yypcontext_expected_tokens(ctx, list, YYNTOKENS);
  int expected[YYNTOKENS] = {0};
  for (int i = 0; i < n; i++) expected[list[i]] = 1;

  /* "comando" inclui o início de expressão, então é testado primeiro */
  const char *words[40];
  char bufs[40][16];
  int count = 0;
  int has_command = 0;
  if (take_group(expected, COMMAND_KEYWORDS)) {
    if (take_group(expected, EXPRESSION_START)) { words[count++] = "comando"; has_command = 1; }
    else for (int i = 0; COMMAND_KEYWORDS[i] != YYSYMBOL_YYEMPTY; i++) expected[COMMAND_KEYWORDS[i]] = 1;
  }
  if (!has_command && take_group(expected, EXPRESSION_START)) words[count++] = "expressão";
  if (take_group(expected, TYPE_START)) words[count++] = "tipo";
  for (int i = 0; i < n; i++)
    if (expected[list[i]]) { words[count] = expected_name(list[i], bufs[count], sizeof bufs[count]); count++; }

  char found[256], wanted[512] = "";
  yysymbol_kind_t token = yypcontext_token(ctx);
  found_name(token, found, sizeof found);
  for (int i = 0; i < count; i++) {
    if (i > 0) strcat(wanted, i == count - 1 ? " ou " : ", ");
    strcat(wanted, words[i]);
  }
  if (token == YYSYMBOL_CALL || token == YYSYMBOL_RUN)
    strcat(wanted, " (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)");

  const YYLTYPE *loc = yypcontext_location(ctx);
  if (count > 0)
    report_error("sintático", loc->first_line, loc->first_column,
                 "Token encontrado: %s\nEsperado: %s", found, wanted);
  else
    report_error("sintático", loc->first_line, loc->first_column,
                 "Token encontrado: %s", found);
  return 0;
}
