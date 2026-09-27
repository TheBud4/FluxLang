%{
#include <stdio.h>
    int yylex(void);
    void yyerror(const char *msg);
%}
%define parse.error detailed
%locations
%define api.value.type {char *}

/* Keywords */
%token VAR CONST FUNC WORKFLOW MAIN RETURN IF ELSE WHILE FOR IN BREAK CONTINUE CALL RUN STOP ABORT PROCEED
/* Type Keywords */
%token TYPE_INT TYPE_FLOAT TYPE_STRING TYPE_BOOL TYPE_OBJECT TYPE_LIST
/* Literals */
%token TRUE FALSE NULL_LITERAL INT_LITERAL FLOAT_LITERAL STRING_LITERAL
/* Identifier */
%token IDENTIFIER
/* Operators */
%token ASSIGN EQUAL NOT_EQUAL LOWER_THAN LOWER_THAN_EQUAL GREATER_THAN GREATER_THAN_EQUAL PLUS MINUS MUL DIV MOD AND OR NOT
/* Punctuation */
%token LPAREN RPAREN LBRACE RBRACE LBRACKET RBRACKET COMMA COLON SEMICOLON DOT

%%

    program
    : %empty ;

%%

const char *token_name(int tok) { return yysymbol_name(YYTRANSLATE(tok)); }

void yyerror(const char *msg) { fprintf(stderr, "%s\n", msg); }