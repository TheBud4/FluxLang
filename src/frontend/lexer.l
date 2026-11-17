%{
#include <string.h>
#include "parser.tab.h"
#include <errno.h>
#include <limits.h>
#include <stdlib.h>
#include "fluxc.h"
#include "tree.h"

    static int line = 1, column = 1;
    static void next(const char *s, int n);
    static int count_chars(const char *s, int n);
    static int comment_line, comment_column;

    /* Devolve o token t com um nó-folha (nome do token, lexema, posição) como
       valor semântico: é o que vira folha da árvore de derivação. */
    #define RET(t) do { \
        yylval.node = token_node(#t, yytext, yylloc.first_line, yylloc.first_column); \
        json_record_token(#t, yytext, yylloc.first_line, yylloc.first_column); \
        return t; \
    } while (0)

    #define YY_USER_ACTION                                  \
        yylloc.first_line = yylloc.last_line = line;       \
        yylloc.first_column = column;                       \
        yylval.node = NULL;                                      \
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
"var"           { RET(VAR); }
"const"         { RET(CONST); }
"func"          { RET(FUNC); }
"workflow"      { RET(WORKFLOW); }
"main"          { RET(MAIN); }
"return"        { RET(RETURN); }
"if"            { RET(IF); }
"else"          { RET(ELSE); }
"while"         { RET(WHILE); }
"for"           { RET(FOR); }
"in"            { RET(IN); }
"break"         { RET(BREAK); }
"continue"      { RET(CONTINUE); }
"call"          { RET(CALL); }
"run"           { RET(RUN); }
"stop"          { RET(STOP); }
"abort"         { RET(ABORT); }
"proceed"       { RET(PROCEED); }

 /* Type keywords */
"int"           { RET(TYPE_INT); }
"float"         { RET(TYPE_FLOAT); }
"string"        { RET(TYPE_STRING); }
"bool"          { RET(TYPE_BOOL); }
"object"        { RET(TYPE_OBJECT); }
"list"          { RET(TYPE_LIST); }

 /* Literals */
"true"          { RET(TRUE); }
"false"         { RET(FALSE); }
"null"          { RET(NULL_LITERAL); }

 /* Numbers */
{DIG}+"."{DIG}+ { RET(FLOAT_LITERAL); }

{DIG}+ {
    errno = 0;
    long value = strtol(yytext, NULL, 10);
    if (errno == ERANGE || value > INT_MAX) {
        report_error("léxico", yylloc.first_line, yylloc.first_column,
                     "Número inteiro fora do intervalo: '%s'", yytext);
        return YYerror;
    }
    RET(INT_LITERAL);
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
    RET(STRING_LITERAL);
}

\"([^"\\\n]|\\[^\n])*\\? {
    report_error("léxico", yylloc.first_line, yylloc.first_column,
                 "String não terminada");
    return YYerror;
}

 /* Operators */
"="             { RET(ASSIGN); }
"=="            { RET(EQUAL); }
"!="            { RET(NOT_EQUAL); }
"<"             { RET(LOWER_THAN); }
"<="            { RET(LOWER_THAN_EQUAL); }
">"             { RET(GREATER_THAN); }
">="            { RET(GREATER_THAN_EQUAL); }
"+"             { RET(PLUS); }
"-"             { RET(MINUS); }
"*"             { RET(MUL); }
"/"             { RET(DIV); }
"%"             { RET(MOD); }
"&&"            { RET(AND); }
"||"            { RET(OR); }
"!"             { RET(NOT); }


 /* Punctuation */
"("             { RET(LPAREN); }
")"             { RET(RPAREN); }
"{"             { RET(LBRACE); }
"}"             { RET(RBRACE); }
"["             { RET(LBRACKET); }
"]"             { RET(RBRACKET); }
","             { RET(COMMA); }
":"             { RET(COLON); }
";"             { RET(SEMICOLON); }
"."             { RET(DOT); }

 /* Identifier */
{ID}            { RET(IDENTIFIER); }

 /* End of file: the position is where the input ends */
<<EOF>> {
    yylloc.first_line = yylloc.last_line = line;
    yylloc.first_column = column;
    return 0;
}

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

/* Depois de ler tudo: line é a linha do fim; se o código termina em '\n',
   o fim está na coluna 1 de uma linha que não tem nada. */
int source_lines(void) {
    if (line == 1 && column == 1) return 0;
    return column == 1 ? line - 1 : line;
}
