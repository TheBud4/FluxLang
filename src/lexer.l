%{
#include <string.h>
#include "parser.tab.h"
#include <errno.h>
#include <limits.h>
#include <stdlib.h>
#include "fluxc.h"

    static int line = 1, column = 1;
    static void next(const char *s, int n);
    static int count_chars(const char *s, int n);
    static int comment_line, comment_column;

    #define YY_USER_ACTION                                  \
        yylloc.first_line = yylloc.last_line = line;       \
        yylloc.first_column = column;                       \
        yylval = NULL;                                      \
        next(yytext, yyleng);
%}

%option noyywrap nounput noinput
%x COMMENT

DIG     [0-9]
LETTER   [A-Za-z_]
ID      {LETTER}({LETTER}|{DIG})*
UTF8    [\xC2-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF4][\x80-\xBF]{3}

%%

[ \t\r\n]+      { /* ignores spaces */ }

 /* Comments */
"//"[^\n]*      { /* ignores line comments */ }

"/*" {
    comment_line = yylloc.first_line;
    comment_column = yylloc.first_column;
    BEGIN(COMMENT);
}
<COMMENT>"*/"       { BEGIN(INITIAL); }
<COMMENT>[^*]+|"*"  { /* ignores comment content */ }
<COMMENT><<EOF>> {
    report_error("léxico", comment_line, comment_column,
                 "Comentário de bloco não terminado");
    BEGIN(INITIAL);
    return YYerror;
}

 /* Keywords */
"var"           { return VAR; }
"const"         { return CONST; }
"func"          {return FUNC; }
"workflow"      {return WORKFLOW; }
"main"          {return MAIN; }
"return"        {return RETURN; }
"if"            {return IF; }
"else"          {return ELSE; }
"while"         {return WHILE; }
"for"           {return FOR; }
"in"            {return IN; }
"break"         {return BREAK; }
"continue"      {return CONTINUE; }
"call"          {return CALL; }
"run"           {return RUN; }
"stop"          {return STOP; }
"abort"         {return ABORT; }
"proceed"       { return PROCEED; }

 /* Type keywords */
"int"           { return TYPE_INT; }
"float"         { return TYPE_FLOAT; }
"string"        { return TYPE_STRING; }
"bool"          { return TYPE_BOOL; }
"object"        { return TYPE_OBJECT; }
"list"          { return TYPE_LIST; }

 /* Literals */
"true"          { return TRUE; }
"false"         { return FALSE; }
"null"          { return NULL_LITERAL; }

 /* Numbers */
{DIG}+"."{DIG}+ { yylval = strdup(yytext); return FLOAT_LITERAL; }

{DIG}+ {
    errno = 0;
    long value = strtol(yytext, NULL, 10);
    if (errno == ERANGE || value > INT_MAX) {
        report_error("léxico", yylloc.first_line, yylloc.first_column,
                     "Número inteiro fora do intervalo: '%s'", yytext);
        return YYerror;
    }
    yylval = strdup(yytext);
    return INT_LITERAL;
}

{DIG}+"."                                  |
{DIG}+{LETTER}({LETTER}|{DIG})*            |
{DIG}+"."{DIG}+{LETTER}({LETTER}|{DIG})*   {
    report_error("léxico", yylloc.first_line, yylloc.first_column,
                 "Número malformado: '%s'", yytext);
    return YYerror;
}

 /* Strings */
\"([^"\\\n]|\\[^\n])*\" {
    for (int i = 1; i < yyleng - 1; i++) {
        if (yytext[i] != '\\')
            continue;
        char c = yytext[i + 1];
        if (c != 'n' && c != 't' && c != '"' && c != '\\') {
            int size = 2;
            while ((yytext[i + size] & 0xC0) == 0x80)
                size++;
            report_error("léxico", yylloc.first_line,
                         yylloc.first_column + count_chars(yytext, i),
                         "Sequência de escape inválida: '%.*s'", size, yytext + i);
            return YYerror;
        }
        i++;
    }
    yylval = strdup(yytext);
    return STRING_LITERAL;
}

\"([^"\\\n]|\\[^\n])*\\? {
    report_error("léxico", yylloc.first_line, yylloc.first_column,
                 "String não terminada");
    return YYerror;
}

 /* Operators */
"="             { return ASSIGN; }
"=="            { return EQUAL; }
"!="            { return NOT_EQUAL; }
"<"             { return LOWER_THAN; }
"<="            { return LOWER_THAN_EQUAL; }
">"             { return GREATER_THAN; }
">="            { return GREATER_THAN_EQUAL; }
"+"             { return PLUS; }
"-"             { return MINUS; }
"*"             { return MUL; }
"/"             { return DIV; }
"%"             { return MOD; }
"&&"            { return AND; }
"||"            { return OR; }
"!"             { return NOT; }


 /* Punctuation */
"("             { return LPAREN; }
")"             { return RPAREN; }
"{"             { return LBRACE; }
"}"             { return RBRACE; }
"["             { return LBRACKET; }
"]"             { return RBRACKET; }
","             { return COMMA; }
":"             { return COLON; }
";"             { return SEMICOLON; }
"."             { return DOT; }

 /* Identifier */
{ID}            { yylval = strdup(yytext); return IDENTIFIER; }

 /* Unrecognized characters (L1) */
{UTF8}|[\x21-\x7E] {
    report_error("léxico", yylloc.first_line, yylloc.first_column,
                 "Caractere não reconhecido: '%s'", yytext);
    return YYerror;
}

. {
    report_error("léxico", yylloc.first_line, yylloc.first_column,
                 "Caractere não reconhecido: código %d", (unsigned char)yytext[0]);
    return YYerror;
}

%%

static void next(const char *s, int n) {
    for (int i = 0; i < n; i++) {
        unsigned char c = s[i];
        if (c == '\n') { line++; column = 1; }
        else if ((c & 0xC0) != 0x80) column++;
    }
}
static int count_chars(const char *s, int n) {
    int count = 0;
    for (int i = 0; i < n; i++)
        if ((s[i] & 0xC0) != 0x80)
            count++;
    return count;
}
