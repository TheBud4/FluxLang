/*
 * Analisador léxico da FluxLang (Flex).
 * Tokens e erros léxicos seguem a seção 0 de BNF.txt e ERROS.md.
 */

%{
#include <errno.h>
#include <limits.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>

#include "fluxc.h"
#include "parser.h"

#define TAM_LEXEMA 64

char flux_lexema[TAM_LEXEMA + 4];

static int linha = 1, coluna = 1;
static YYLTYPE inicio_comentario;

/* Colunas contam caracteres: bytes de continuação UTF-8 não avançam. */
static void avancar(const char *texto, int n)
{
    for (int i = 0; i < n; i++) {
        unsigned char c = (unsigned char) texto[i];
        if (c == '\n') {
            linha++;
            coluna = 1;
        } else if ((c & 0xC0) != 0x80) {
            coluna++;
        }
    }
}

#define YY_USER_ACTION                                   \
    yylloc.first_line = linha;                           \
    yylloc.first_column = coluna;                        \
    avancar(yytext, yyleng);                             \
    yylloc.last_line = linha;                            \
    yylloc.last_column = coluna;

static void guardar_lexema(void)
{
    if (yyleng <= TAM_LEXEMA) {
        memcpy(flux_lexema, yytext, yyleng);
        flux_lexema[yyleng] = '\0';
    } else {
        memcpy(flux_lexema, yytext, TAM_LEXEMA);
        strcpy(flux_lexema + TAM_LEXEMA, "...");
    }
}

#define TOKEN(t) do { guardar_lexema(); return (t); } while (0)

static int erro_lexico(int lin, int col, const char *formato, ...)
{
    va_list args;
    flux_erro("léxico", lin, col);
    va_start(args, formato);
    vfprintf(stderr, formato, args);
    va_end(args);
    fputc('\n', stderr);
    guardar_lexema();
    return ERRO_LEXICO;
}

/* Remove as aspas e traduz os escapes \n \t \" \\. */
static char *desescapar(const char *texto, int n)
{
    char *s = flux_strdup(texto + 1, n - 2);
    char *w = s;
    for (const char *r = s; *r; r++) {
        if (*r == '\\') {
            r++;
            *w++ = *r == 'n' ? '\n' : *r == 't' ? '\t' : *r;
        } else {
            *w++ = *r;
        }
    }
    *w = '\0';
    return s;
}

/* Localiza o primeiro escape inválido de uma string já casada. */
static int erro_escape(void)
{
    int col = yylloc.first_column;
    for (int i = 0; i < yyleng; i++) {
        unsigned char c = (unsigned char) yytext[i];
        if (c == '\\') {
            char e = yytext[i + 1];
            if (e != 'n' && e != 't' && e != '"' && e != '\\') {
                int n = 1;   /* o caractere escapado pode ter vários bytes */
                while ((yytext[i + 1 + n] & 0xC0) == 0x80)
                    n++;
                return erro_lexico(yylloc.first_line, col,
                                   "Sequência de escape inválida: '\\%.*s'", n, yytext + i + 1);
            }
            i++;
            col++;
        }
        if ((c & 0xC0) != 0x80)
            col++;
    }
    return ERRO_LEXICO;
}

static int erro_caractere(void)
{
    unsigned char c = (unsigned char) yytext[0];
    if (c < 32 || c == 127)
        return erro_lexico(yylloc.first_line, yylloc.first_column,
                           "Caractere não reconhecido: código %d", c);
    return erro_lexico(yylloc.first_line, yylloc.first_column,
                       "Caractere não reconhecido: '%s'", yytext);
}
%}

%option noyywrap nounput noinput
%x COMENTARIO

DIGITO   [0-9]
LETRA    [A-Za-z_]
ID       {LETRA}({LETRA}|{DIGITO})*
UTF8     [\xC0-\xFF][\x80-\xBF]*

%%

[ \t\r\n]+                  ;
"//".*                      ;

"/*"                        { inicio_comentario = yylloc; BEGIN(COMENTARIO); }
<COMENTARIO>"*/"            { BEGIN(INITIAL); }
<COMENTARIO>[^*]+           ;
<COMENTARIO>"*"             ;
<COMENTARIO><<EOF>>         {
                                BEGIN(INITIAL);
                                return erro_lexico(inicio_comentario.first_line,
                                                   inicio_comentario.first_column,
                                                   "Comentário de bloco não terminado");
                            }

 /* ---- Palavras reservadas ---- */
"var"                       TOKEN(VAR);
"const"                     TOKEN(CONST);
"func"                      TOKEN(FUNC);
"workflow"                  TOKEN(WORKFLOW);
"call"                      TOKEN(CALL);
"return"                    TOKEN(RETURN);
"if"                        TOKEN(IF);
"else"                      TOKEN(ELSE);
"while"                     TOKEN(WHILE);
"for"                       TOKEN(FOR);
"in"                        TOKEN(IN);
"break"                     TOKEN(BREAK);
"continue"                  TOKEN(CONTINUE);
"stop"                      TOKEN(STOP);
"abort"                     TOKEN(ABORT);
"run"                       TOKEN(RUN);
"true"                      TOKEN(TRUE);
"false"                     TOKEN(FALSE);
"null"                      TOKEN(NULL_LITERAL);
"int"                       TOKEN(TYPE_INT);
"float"                     TOKEN(TYPE_FLOAT);
"string"                    TOKEN(TYPE_STRING);
"bool"                      TOKEN(TYPE_BOOL);
"object"                    TOKEN(TYPE_OBJECT);
"list"                      TOKEN(TYPE_LIST);

 /* ---- Literais e identificadores ---- */
{DIGITO}+"."{DIGITO}+       { yylval.fval = strtod(yytext, NULL); TOKEN(FLOAT_LITERAL); }
{DIGITO}+                   {
                                errno = 0;
                                long v = strtol(yytext, NULL, 10);
                                if (errno == ERANGE || v > INT_MAX)
                                    return erro_lexico(yylloc.first_line, yylloc.first_column,
                                                       "Número inteiro fora do intervalo: '%s'", yytext);
                                yylval.ival = (int) v;
                                TOKEN(INT_LITERAL);
                            }
{DIGITO}+("."{DIGITO}+)?{ID} |
{DIGITO}+"."                {
                                return erro_lexico(yylloc.first_line, yylloc.first_column,
                                                   "Número malformado: '%s'", yytext);
                            }
{ID}                        { yylval.sval = flux_strdup(yytext, yyleng); TOKEN(IDENTIFIER); }

\"([^"\\\n]|\\[nt"\\])*\"   { yylval.sval = desescapar(yytext, yyleng); TOKEN(STRING_LITERAL); }
\"([^"\\\n]|\\.)*\"         { return erro_escape(); }
\"([^"\\\n]|\\.)*\\?        {
                                return erro_lexico(yylloc.first_line, yylloc.first_column,
                                                   "String não terminada");
                            }

 /* ---- Operadores e pontuação ---- */
"=="                        TOKEN(EQ);
"!="                        TOKEN(NEQ);
"<="                        TOKEN(LTE);
">="                        TOKEN(GTE);
"&&"                        TOKEN(AND);
"||"                        TOKEN(OR);
"="                         TOKEN(ASSIGN);
"<"                         TOKEN(LT);
">"                         TOKEN(GT);
"+"                         TOKEN(PLUS);
"-"                         TOKEN(MINUS);
"*"                         TOKEN(MUL);
"/"                         TOKEN(DIV);
"%"                         TOKEN(MOD);
"!"                         TOKEN(NOT);
"("                         TOKEN(LPAREN);
")"                         TOKEN(RPAREN);
"{"                         TOKEN(LBRACE);
"}"                         TOKEN(RBRACE);
"["                         TOKEN(LBRACKET);
"]"                         TOKEN(RBRACKET);
","                         TOKEN(COMMA);
":"                         TOKEN(COLON);
";"                         TOKEN(SEMICOLON);
"."                         TOKEN(DOT);

 /* ---- Erros ---- */
{UTF8}                      { return erro_caractere(); }
.                           { return erro_caractere(); }

<<EOF>>                     {
                                yylloc.first_line = yylloc.last_line = linha;
                                yylloc.first_column = yylloc.last_column = coluna;
                                flux_lexema[0] = '\0';
                                return YYEOF;
                            }

%%

static char **strings;
static size_t n_strings, cap_strings;

char *flux_strdup(const char *s, size_t n)
{
    if (n_strings == cap_strings) {
        cap_strings = cap_strings ? 2 * cap_strings : 64;
        strings = realloc(strings, cap_strings * sizeof *strings);
        if (!strings) {
            perror("fluxc");
            exit(2);
        }
    }
    char *copia = malloc(n + 1);
    if (!copia) {
        perror("fluxc");
        exit(2);
    }
    memcpy(copia, s, n);
    copia[n] = '\0';
    strings[n_strings++] = copia;
    return copia;
}

void flux_liberar_strings(void)
{
    for (size_t i = 0; i < n_strings; i++)
        free(strings[i]);
    free(strings);
    strings = NULL;
    n_strings = cap_strings = 0;
}
