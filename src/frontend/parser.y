%{
#include <stdio.h>
#include <string.h>
#include "fluxc.h"
#include "tree.h"
    int yylex(void);
    void yyerror(const char *msg);
%}
%define parse.error custom
%code requires {
#include "tree.h"
}
%code {
static YYLTYPE assign_loc;

enum { SUFFIX_NONE, SUFFIX_ACCESS, SUFFIX_CALL };
}

%locations
%union {
  struct Node *node;
}

%token <node> VAR CONST FUNC WORKFLOW MAIN RETURN IF ELSE WHILE FOR IN BREAK CONTINUE CALL RUN STOP ABORT PROCEED
%token <node> TYPE_INT TYPE_FLOAT TYPE_STRING TYPE_BOOL TYPE_OBJECT TYPE_LIST
%token <node> TRUE FALSE NULL_LITERAL
%token <node> INT_LITERAL FLOAT_LITERAL STRING_LITERAL
%token <node> IDENTIFIER
%token <node> ASSIGN EQUAL NOT_EQUAL LOWER_THAN LOWER_THAN_EQUAL GREATER_THAN GREATER_THAN_EQUAL PLUS MINUS MUL DIV MOD AND OR NOT
%token <node> LPAREN RPAREN LBRACE RBRACE LBRACKET RBRACKET COMMA COLON SEMICOLON DOT
%type <node> program before_main after_func after_main global_no_func variable_declaration
%type <node> variable_rest initializer constant_declaration constant_rest identifier_list identifier_list_rest
%type <node> rhs type workflow function_rest parameter_list parameters
%type <node> parameters_rest parameter return_type block commands command
%type <node> command_if else_part command_while command_for command_return return_values
%type <node> command_break command_continue command_error error_action command_expression assignment_rest
%type <node> expression or_expr or_rest and_expr and_rest equality_expr
%type <node> equality_rest equality_op relational_expr relational_rest relational_op additive_expr
%type <node> additive_rest additive_op multiplicative_expr multiplicative_rest multiplicative_op unary_expr
%type <node> unary_op postfix_expr postfix_rest primary list_literal list_items
%type <node> list_rest list_after_comma object_literal object_items fields_rest fields_after_comma
%type <node> field field_key expression_list expression_list_rest args

%%

  program
  : before_main { $$ = mknode("program", 1, $1); parse_root = $$; }
  ;

  before_main
  : global_no_func before_main { $$ = mknode("before_main", 2, $1, $2); }
  | FUNC after_func { $$ = mknode("before_main", 2, $1, $2); }
  ;

  after_func
  : MAIN LPAREN RPAREN block after_main { $$ = mknode("after_func", 5, $1, $2, $3, $4, $5); }
  | IDENTIFIER function_rest before_main { $$ = mknode("after_func", 3, $1, $2, $3); }
  | MAIN error block after_main { $$ = mknode("after_func", 4, $1, error_node(@2.first_line, @2.first_column), $3, $4); yyerrok; }
  ;

  after_main
  : global_no_func after_main { $$ = mknode("after_main", 2, $1, $2); }
  | FUNC IDENTIFIER function_rest after_main { $$ = mknode("after_main", 4, $1, $2, $3, $4); }
  | %empty { $$ = mknode("after_main", 1, empty_node()); }
  ;

  global_no_func
  : variable_declaration { $$ = mknode("global_no_func", 1, $1); }
  | constant_declaration { $$ = mknode("global_no_func", 1, $1); }
  | workflow { $$ = mknode("global_no_func", 1, $1); }
  | error SEMICOLON { $$ = mknode("global_no_func", 2, error_node(@1.first_line, @1.first_column), $2); yyerrok; }
  | error block { $$ = mknode("global_no_func", 2, error_node(@1.first_line, @1.first_column), $2); yyerrok; }
  | error { $$ = mknode("global_no_func", 1, error_node(@1.first_line, @1.first_column)); }
  ;

  variable_declaration
  : VAR identifier_list variable_rest SEMICOLON { $$ = mknode("variable_declaration", 4, $1, $2, $3, $4); }
  ;

  variable_rest
  : COLON type initializer { $$ = mknode("variable_rest", 3, $1, $2, $3); }
  | ASSIGN rhs { $$ = mknode("variable_rest", 2, $1, $2); }
  ;

  initializer
  : ASSIGN rhs { $$ = mknode("initializer", 2, $1, $2); }
  | %empty { $$ = mknode("initializer", 1, empty_node()); }
  ;

  constant_declaration
  : CONST identifier_list constant_rest SEMICOLON { $$ = mknode("constant_declaration", 4, $1, $2, $3, $4); }
  ;

  constant_rest
  : COLON type ASSIGN expression_list { $$ = mknode("constant_rest", 4, $1, $2, $3, $4); }
  | ASSIGN expression_list { $$ = mknode("constant_rest", 2, $1, $2); }
  ;

  identifier_list
  : IDENTIFIER identifier_list_rest { $$ = mknode("identifier_list", 2, $1, $2); }
  ;

  identifier_list_rest
  : COMMA IDENTIFIER identifier_list_rest { $$ = mknode("identifier_list_rest", 3, $1, $2, $3); }
  | %empty { $$ = mknode("identifier_list_rest", 1, empty_node()); }
  ;

  rhs
  : CALL IDENTIFIER LPAREN args RPAREN { $$ = mknode("rhs", 5, $1, $2, $3, $4, $5); }
  | RUN object_literal { $$ = mknode("rhs", 2, $1, $2); }
  | expression_list { $$ = mknode("rhs", 1, $1); }
  ;

  type
  : TYPE_INT { $$ = mknode("type", 1, $1); }
  | TYPE_FLOAT { $$ = mknode("type", 1, $1); }
  | TYPE_STRING { $$ = mknode("type", 1, $1); }
  | TYPE_BOOL { $$ = mknode("type", 1, $1); }
  | TYPE_OBJECT { $$ = mknode("type", 1, $1); }
  | TYPE_LIST LOWER_THAN type GREATER_THAN { $$ = mknode("type", 4, $1, $2, $3, $4); }
  ;

  workflow
  : WORKFLOW IDENTIFIER function_rest { $$ = mknode("workflow", 3, $1, $2, $3); }
  ;

  function_rest
  : LPAREN parameter_list RPAREN return_type block { $$ = mknode("function_rest", 5, $1, $2, $3, $4, $5); }
  ;

  parameter_list
  : parameters { $$ = mknode("parameter_list", 1, $1); }
  | %empty { $$ = mknode("parameter_list", 1, empty_node()); }
  ;

  parameters
  : parameter parameters_rest { $$ = mknode("parameters", 2, $1, $2); }
  ;

  parameters_rest
  : COMMA parameter parameters_rest { $$ = mknode("parameters_rest", 3, $1, $2, $3); }
  | %empty { $$ = mknode("parameters_rest", 1, empty_node()); }
  ;

  parameter
  : IDENTIFIER COLON type { $$ = mknode("parameter", 3, $1, $2, $3); }
  ;

  return_type
  : COLON type { $$ = mknode("return_type", 2, $1, $2); }
  | %empty { $$ = mknode("return_type", 1, empty_node()); }
  ;

  block
  : LBRACE commands RBRACE { $$ = mknode("block", 3, $1, $2, $3); }
  ;

  commands
  : command commands { $$ = mknode("commands", 2, $1, $2); }
  | %empty { $$ = mknode("commands", 1, empty_node()); }
  ;

  command
  : variable_declaration { $$ = mknode("command", 1, $1); }
  | constant_declaration { $$ = mknode("command", 1, $1); }
  | command_if { $$ = mknode("command", 1, $1); }
  | command_while { $$ = mknode("command", 1, $1); }
  | command_for { $$ = mknode("command", 1, $1); }
  | command_return { $$ = mknode("command", 1, $1); }
  | command_break { $$ = mknode("command", 1, $1); }
  | command_continue { $$ = mknode("command", 1, $1); }
  | command_error { $$ = mknode("command", 1, $1); }
  | command_expression { $$ = mknode("command", 1, $1); }
  | error SEMICOLON { $$ = mknode("command", 2, error_node(@1.first_line, @1.first_column), $2); yyerrok; }
  | error block { $$ = mknode("command", 2, error_node(@1.first_line, @1.first_column), $2); yyerrok; }
  ;

  command_if
  : IF LPAREN expression RPAREN block else_part { $$ = mknode("command_if", 6, $1, $2, $3, $4, $5, $6); }
  ;

  else_part
  : ELSE block { $$ = mknode("else_part", 2, $1, $2); }
  | %empty { $$ = mknode("else_part", 1, empty_node()); }
  ;

  command_while
  : WHILE LPAREN expression RPAREN block { $$ = mknode("command_while", 5, $1, $2, $3, $4, $5); }
  ;

  command_for
  : FOR IDENTIFIER IN expression block { $$ = mknode("command_for", 5, $1, $2, $3, $4, $5); }
  ;

  command_return
  : RETURN return_values SEMICOLON { $$ = mknode("command_return", 3, $1, $2, $3); }
  ;

  return_values
  : expression_list { $$ = mknode("return_values", 1, $1); }
  | %empty { $$ = mknode("return_values", 1, empty_node()); }
  ;

  command_break
  : BREAK SEMICOLON { $$ = mknode("command_break", 2, $1, $2); }
  ;

  command_continue
  : CONTINUE SEMICOLON { $$ = mknode("command_continue", 2, $1, $2); }
  ;

  command_error
  : error_action IF IDENTIFIER SEMICOLON { $$ = mknode("command_error", 4, $1, $2, $3, $4); }
  ;

  error_action
  : STOP { $$ = mknode("error_action", 1, $1); }
  | ABORT { $$ = mknode("error_action", 1, $1); }
  | PROCEED { $$ = mknode("error_action", 1, $1); }
  ;

  command_expression
  : expression assignment_rest SEMICOLON { $$ = mknode("command_expression", 3, $1, $2, $3); {
    if ($2->flag != 0 && (!$1->flag || $2->flag == 2)) {
      report_error("sintático", assign_loc.first_line, assign_loc.first_column,
                   "Token encontrado: '='\nEsperado: ';' (o lado esquerdo não é variável, campo ou índice)");
    }
  } }
  ;

  assignment_rest
  : ASSIGN rhs { $$ = mknode("assignment_rest", 2, $1, $2); assign_loc = @1; $$->flag = 1; }
  | COMMA expression_list ASSIGN rhs { $$ = mknode("assignment_rest", 4, $1, $2, $3, $4); assign_loc = @3; $$->flag = $2->flag ? 1 : 2; }
  | %empty { $$ = mknode("assignment_rest", 1, empty_node()); }
  ;

  expression
  : or_expr { $$ = mknode("expression", 1, $1); $$->flag = $1->flag; }
  ;

  or_expr
  : and_expr or_rest { $$ = mknode("or_expr", 2, $1, $2); $$->flag = $1->flag && !$2->flag; }
  ;

  or_rest
  : OR and_expr or_rest { $$ = mknode("or_rest", 3, $1, $2, $3); $$->flag = 1; }
  | %empty { $$ = mknode("or_rest", 1, empty_node()); }
  ;

  and_expr
  : equality_expr and_rest { $$ = mknode("and_expr", 2, $1, $2); $$->flag = $1->flag && !$2->flag; }
  ;

  and_rest
  : AND equality_expr and_rest { $$ = mknode("and_rest", 3, $1, $2, $3); $$->flag = 1; }
  | %empty { $$ = mknode("and_rest", 1, empty_node()); }
  ;

  equality_expr
  : relational_expr equality_rest { $$ = mknode("equality_expr", 2, $1, $2); $$->flag = $1->flag && !$2->flag; }
  ;

  equality_rest
  : equality_op relational_expr equality_rest { $$ = mknode("equality_rest", 3, $1, $2, $3); $$->flag = 1; }
  | %empty { $$ = mknode("equality_rest", 1, empty_node()); }
  ;

  equality_op
  : EQUAL { $$ = mknode("equality_op", 1, $1); }
  | NOT_EQUAL { $$ = mknode("equality_op", 1, $1); }
  ;

  relational_expr
  : additive_expr relational_rest { $$ = mknode("relational_expr", 2, $1, $2); $$->flag = $1->flag && !$2->flag; }
  ;

  relational_rest
  : relational_op additive_expr relational_rest { $$ = mknode("relational_rest", 3, $1, $2, $3); $$->flag = 1; }
  | %empty { $$ = mknode("relational_rest", 1, empty_node()); }
  ;

  relational_op
  : LOWER_THAN { $$ = mknode("relational_op", 1, $1); }
  | GREATER_THAN { $$ = mknode("relational_op", 1, $1); }
  | LOWER_THAN_EQUAL { $$ = mknode("relational_op", 1, $1); }
  | GREATER_THAN_EQUAL { $$ = mknode("relational_op", 1, $1); }
  ;

  additive_expr
  : multiplicative_expr additive_rest { $$ = mknode("additive_expr", 2, $1, $2); $$->flag = $1->flag && !$2->flag; }
  ;

  additive_rest
  : additive_op multiplicative_expr additive_rest { $$ = mknode("additive_rest", 3, $1, $2, $3); $$->flag = 1; }
  | %empty { $$ = mknode("additive_rest", 1, empty_node()); }
  ;

  additive_op
  : PLUS { $$ = mknode("additive_op", 1, $1); }
  | MINUS { $$ = mknode("additive_op", 1, $1); }
  ;

  multiplicative_expr
  : unary_expr multiplicative_rest { $$ = mknode("multiplicative_expr", 2, $1, $2); $$->flag = $1->flag && !$2->flag; }
  ;

  multiplicative_rest
  : multiplicative_op unary_expr multiplicative_rest { $$ = mknode("multiplicative_rest", 3, $1, $2, $3); $$->flag = 1; }
  | %empty { $$ = mknode("multiplicative_rest", 1, empty_node()); }
  ;

  multiplicative_op
  : MUL { $$ = mknode("multiplicative_op", 1, $1); }
  | DIV { $$ = mknode("multiplicative_op", 1, $1); }
  | MOD { $$ = mknode("multiplicative_op", 1, $1); }
  ;

  unary_expr
  : unary_op unary_expr { $$ = mknode("unary_expr", 2, $1, $2); }
  | postfix_expr { $$ = mknode("unary_expr", 1, $1); $$->flag = $1->flag; }
  ;

  unary_op
  : NOT { $$ = mknode("unary_op", 1, $1); }
  | MINUS { $$ = mknode("unary_op", 1, $1); }
  ;

  postfix_expr
  : primary postfix_rest { $$ = mknode("postfix_expr", 2, $1, $2); $$->flag = ($2->flag == SUFFIX_NONE) ? $1->flag : ($2->flag == SUFFIX_ACCESS); }
  ;

  postfix_rest
  : DOT IDENTIFIER postfix_rest { $$ = mknode("postfix_rest", 3, $1, $2, $3); $$->flag = $3->flag ? $3->flag : SUFFIX_ACCESS; }
  | LBRACKET expression RBRACKET postfix_rest { $$ = mknode("postfix_rest", 4, $1, $2, $3, $4); $$->flag = $4->flag ? $4->flag : SUFFIX_ACCESS; }
  | LPAREN args RPAREN postfix_rest { $$ = mknode("postfix_rest", 4, $1, $2, $3, $4); $$->flag = $4->flag ? $4->flag : SUFFIX_CALL; }
  | %empty { $$ = mknode("postfix_rest", 1, empty_node()); }
  ;

  primary
  : INT_LITERAL { $$ = mknode("primary", 1, $1); }
  | FLOAT_LITERAL { $$ = mknode("primary", 1, $1); }
  | STRING_LITERAL { $$ = mknode("primary", 1, $1); }
  | TRUE { $$ = mknode("primary", 1, $1); }
  | FALSE { $$ = mknode("primary", 1, $1); }
  | NULL_LITERAL { $$ = mknode("primary", 1, $1); }
  | IDENTIFIER { $$ = mknode("primary", 1, $1); $$->flag = 1; }
  | LPAREN expression RPAREN { $$ = mknode("primary", 3, $1, $2, $3); }
  | list_literal { $$ = mknode("primary", 1, $1); }
  | object_literal { $$ = mknode("primary", 1, $1); }
  ;

  list_literal
  : LBRACKET list_items RBRACKET { $$ = mknode("list_literal", 3, $1, $2, $3); }
  ;

  list_items
  : expression list_rest { $$ = mknode("list_items", 2, $1, $2); }
  | %empty { $$ = mknode("list_items", 1, empty_node()); }
  ;

  list_rest
  : COMMA list_after_comma { $$ = mknode("list_rest", 2, $1, $2); }
  | %empty { $$ = mknode("list_rest", 1, empty_node()); }
  ;

  list_after_comma
  : expression list_rest { $$ = mknode("list_after_comma", 2, $1, $2); }
  | %empty { $$ = mknode("list_after_comma", 1, empty_node()); }
  ;

  object_literal
  : LBRACE object_items RBRACE { $$ = mknode("object_literal", 3, $1, $2, $3); }
  ;

  object_items
  : field fields_rest { $$ = mknode("object_items", 2, $1, $2); }
  | %empty { $$ = mknode("object_items", 1, empty_node()); }
  ;

  fields_rest
  : COMMA fields_after_comma { $$ = mknode("fields_rest", 2, $1, $2); }
  | %empty { $$ = mknode("fields_rest", 1, empty_node()); }
  ;

  fields_after_comma
  : field fields_rest { $$ = mknode("fields_after_comma", 2, $1, $2); }
  | %empty { $$ = mknode("fields_after_comma", 1, empty_node()); }
  ;

  field
  : field_key COLON expression { $$ = mknode("field", 3, $1, $2, $3); }
  ;

  field_key
  : IDENTIFIER { $$ = mknode("field_key", 1, $1); }
  | STRING_LITERAL { $$ = mknode("field_key", 1, $1); }
  ;

  expression_list
  : expression expression_list_rest { $$ = mknode("expression_list", 2, $1, $2); $$->flag = $1->flag && $2->flag; }
  ;

  expression_list_rest
  : COMMA expression expression_list_rest { $$ = mknode("expression_list_rest", 3, $1, $2, $3); $$->flag = $2->flag && $3->flag; }
  | %empty { $$ = mknode("expression_list_rest", 1, empty_node()); $$->flag = 1; }
  ;

  args
  : expression_list { $$ = mknode("args", 1, $1); }
  | %empty { $$ = mknode("args", 1, empty_node()); }
  ;

%%

const char *token_name(int tok) { return yysymbol_name(YYTRANSLATE(tok)); }

void yyerror(const char *msg) {
  (void)msg;
  report_error("sintático", yylloc.first_line, yylloc.first_column,
               "Programa grande ou aninhado demais: o analisador esgotou a pilha "
               "(expressão encadeada longa demais).");
}

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

static void found_name(yysymbol_kind_t s, char *buf, size_t size) {
  const char *text = yylval.node && yylval.node->text ? yylval.node->text : "";
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
