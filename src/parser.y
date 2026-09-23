/*
 * Analisador sintático da FluxLang (GNU Bison).
 *
 * Tradução direta de BNF.txt: cada <nao-terminal> vira nao_terminal e
 * cada ε vira %empty. A gramática continua LL(1); o Bison a trata como
 * LALR(1) sem conflitos. O EOF da BNF é o $end implícito do Bison.
 *
 * Por enquanto não há AST. O único valor semântico calculado é um
 * atributo inteiro (<flag>) usado na verificação do alvo de atribuição
 * (erro S3 em ERROS.md):
 *   - na cadeia de expressões, 1 = a expressão é atribuível
 *     (IDENTIFIER seguido só de .campo ou [indice]);
 *   - nos não-terminais "-resto", 1 = derivou ε;
 *   - em sufixo/sufixos, 1 = não há chamada.
 */

%{
#include <stdio.h>
#include <string.h>

#include "fluxc.h"

#define YYMAXDEPTH 100000

void yyerror(const char *msg);
%}

%code {
static void erro_atribuicao(const YYLTYPE *loc);
}

%define parse.error custom
%locations

%union {
    int    ival;
    double fval;
    char  *sval;
    int    flag;
}

/* Palavras reservadas */
%token VAR CONST FUNC WORKFLOW CALL RETURN
%token IF ELSE WHILE FOR IN BREAK CONTINUE STOP ABORT
%token RUN TRUE FALSE NULL_LITERAL
%token TYPE_INT TYPE_FLOAT TYPE_STRING TYPE_BOOL TYPE_OBJECT TYPE_LIST

/* Pontuação e operadores. A ordem de declaração é a ordem em que os
   tokens aparecem na lista "Esperado:" das mensagens de erro. */
%token LPAREN RPAREN LBRACE RBRACE LBRACKET RBRACKET
%token COMMA COLON SEMICOLON DOT
%token ASSIGN EQ NEQ LT GT LTE GTE
%token PLUS MINUS MUL DIV MOD
%token AND OR NOT

/* Literais e identificadores */
%token <sval> IDENTIFIER STRING_LITERAL
%token <ival> INT_LITERAL
%token <fval> FLOAT_LITERAL

/* Devolvido pelo lexer depois de reportar um erro léxico. */
%token ERRO_LEXICO

%type <flag> expressao expressao_or_resto
%type <flag> expressao_and expressao_and_resto
%type <flag> expressao_igualdade expressao_igualdade_resto
%type <flag> expressao_relacional expressao_relacional_resto
%type <flag> expressao_aditiva expressao_aditiva_resto
%type <flag> expressao_multiplicativa expressao_multiplicativa_resto
%type <flag> expressao_unaria expressao_posfixa
%type <flag> sufixos sufixo primaria alvos_resto

%start programa

%%

/* ===== 1. Estrutura geral do programa ===== */

programa:
    globais
  ;

globais:
    elemento_global globais
  | %empty
  ;

elemento_global:
    declaracao_var
  | declaracao_const
  | funcao
  | workflow
  ;

bloco:
    LBRACE comandos RBRACE
  ;

comandos:
    comando comandos
  | %empty
  ;

/* ===== 2. Tipos de dados ===== */

tipo:
    TYPE_INT
  | TYPE_FLOAT
  | TYPE_STRING
  | TYPE_BOOL
  | TYPE_OBJECT
  | TYPE_LIST LT tipo GT
  ;

/* ===== 3. Declaração de variáveis e constantes ===== */

declaracao_var:
    VAR lista_identificadores declaracao_var_resto SEMICOLON
  ;

declaracao_var_resto:
    COLON tipo inicializacao_opcional
  | ASSIGN lista_expressoes
  ;

inicializacao_opcional:
    ASSIGN lista_expressoes
  | %empty
  ;

declaracao_const:
    CONST lista_identificadores COLON tipo ASSIGN lista_expressoes SEMICOLON
  ;

lista_identificadores:
    IDENTIFIER lista_identificadores_resto
  ;

lista_identificadores_resto:
    COMMA IDENTIFIER lista_identificadores_resto
  | %empty
  ;

lista_expressoes:
    expressao lista_expressoes_resto
  ;

lista_expressoes_resto:
    COMMA expressao lista_expressoes_resto
  | %empty
  ;

/* ===== 4. Funções ===== */

funcao:
    FUNC IDENTIFIER LPAREN parametros_opcionais RPAREN tipo_retorno bloco
  ;

tipo_retorno:
    COLON tipo
  | %empty
  ;

parametros_opcionais:
    parametro parametros_resto
  | %empty
  ;

parametros_resto:
    COMMA parametro parametros_resto
  | %empty
  ;

parametro:
    IDENTIFIER COLON tipo
  ;

/* ===== 5. Workflows ===== */

workflow:
    WORKFLOW IDENTIFIER LPAREN parametros_opcionais RPAREN tipo_retorno bloco
  ;

chamada_workflow:
    CALL IDENTIFIER LPAREN argumentos_opcionais RPAREN
  ;

argumentos_opcionais:
    lista_expressoes
  | %empty
  ;

/* ===== 6. Comandos ===== */

comando:
    declaracao_var
  | declaracao_const
  | comando_if
  | comando_while
  | comando_for
  | comando_return
  | comando_break
  | comando_continue
  | comando_erro
  | comando_expressao
  ;

/* ===== 7. Comandos de expressão e atribuição ===== */

comando_expressao:
    expressao resto_comando_expressao
  ;

/* $<flag>0 é o valor da <expressao> que vem logo antes deste
   não-terminal na pilha (o primeiro alvo); $1 cobre os demais. */
resto_comando_expressao:
    SEMICOLON
  | alvos_resto ASSIGN
      {
        if (!$<flag>0 || !$1) {
            erro_atribuicao(&@2);
            YYABORT;
        }
      }
    lista_expressoes SEMICOLON
  ;

alvos_resto:
    COMMA expressao alvos_resto   { $$ = $2 && $3; }
  | %empty                        { $$ = 1; }
  ;

/* ===== 8. Estruturas de controle ===== */

comando_if:
    IF LPAREN expressao RPAREN bloco else_opcional
  ;

else_opcional:
    ELSE bloco
  | %empty
  ;

comando_while:
    WHILE LPAREN expressao RPAREN bloco
  ;

comando_for:
    FOR IDENTIFIER IN expressao bloco
  ;

comando_return:
    RETURN valor_retorno SEMICOLON
  ;

valor_retorno:
    lista_expressoes
  | %empty
  ;

comando_break:
    BREAK SEMICOLON
  ;

/* ===== 9. Continue e tratamento de erros ===== */

comando_continue:
    CONTINUE continue_resto
  ;

continue_resto:
    SEMICOLON
  | IF IDENTIFIER SEMICOLON
  ;

comando_erro:
    STOP IF IDENTIFIER SEMICOLON
  | ABORT IF IDENTIFIER SEMICOLON
  ;

/* ===== 10. Expressões e precedência ===== */

expressao:
    expressao_and expressao_or_resto   { $$ = $1 && $2; }
  ;

expressao_or_resto:
    OR expressao_and expressao_or_resto   { $$ = 0; }
  | %empty                                { $$ = 1; }
  ;

expressao_and:
    expressao_igualdade expressao_and_resto   { $$ = $1 && $2; }
  ;

expressao_and_resto:
    AND expressao_igualdade expressao_and_resto   { $$ = 0; }
  | %empty                                        { $$ = 1; }
  ;

expressao_igualdade:
    expressao_relacional expressao_igualdade_resto   { $$ = $1 && $2; }
  ;

expressao_igualdade_resto:
    operador_igualdade expressao_relacional expressao_igualdade_resto   { $$ = 0; }
  | %empty                                                              { $$ = 1; }
  ;

operador_igualdade:
    EQ
  | NEQ
  ;

expressao_relacional:
    expressao_aditiva expressao_relacional_resto   { $$ = $1 && $2; }
  ;

expressao_relacional_resto:
    operador_relacional expressao_aditiva expressao_relacional_resto   { $$ = 0; }
  | %empty                                                             { $$ = 1; }
  ;

operador_relacional:
    GT
  | LT
  | GTE
  | LTE
  ;

expressao_aditiva:
    expressao_multiplicativa expressao_aditiva_resto   { $$ = $1 && $2; }
  ;

expressao_aditiva_resto:
    operador_aditivo expressao_multiplicativa expressao_aditiva_resto   { $$ = 0; }
  | %empty                                                              { $$ = 1; }
  ;

operador_aditivo:
    PLUS
  | MINUS
  ;

expressao_multiplicativa:
    expressao_unaria expressao_multiplicativa_resto   { $$ = $1 && $2; }
  ;

expressao_multiplicativa_resto:
    operador_multiplicativo expressao_unaria expressao_multiplicativa_resto   { $$ = 0; }
  | %empty                                                                    { $$ = 1; }
  ;

operador_multiplicativo:
    MUL
  | DIV
  | MOD
  ;

expressao_unaria:
    NOT expressao_unaria     { $$ = 0; }
  | MINUS expressao_unaria   { $$ = 0; }
  | expressao_posfixa        { $$ = $1; }
  ;

/* ===== 11. Expressões pós-fixas ===== */

expressao_posfixa:
    primaria sufixos   { $$ = $1 && $2; }
  ;

sufixos:
    sufixo sufixos   { $$ = $1 && $2; }
  | %empty           { $$ = 1; }
  ;

sufixo:
    DOT IDENTIFIER                              { $$ = 1; }
  | LBRACKET expressao RBRACKET                 { $$ = 1; }
  | LPAREN argumentos_opcionais RPAREN          { $$ = 0; }
  ;

/* ===== 12. Expressões primárias ===== */

primaria:
    INT_LITERAL                { $$ = 0; }
  | FLOAT_LITERAL              { $$ = 0; }
  | STRING_LITERAL             { $$ = 0; }
  | TRUE                       { $$ = 0; }
  | FALSE                      { $$ = 0; }
  | NULL_LITERAL               { $$ = 0; }
  | IDENTIFIER                 { $$ = 1; }
  | lista                      { $$ = 0; }
  | literal_object             { $$ = 0; }
  | run                        { $$ = 0; }
  | chamada_workflow           { $$ = 0; }
  | LPAREN expressao RPAREN    { $$ = 0; }
  ;

/* ===== 13. Listas (vírgula final opcional) ===== */

lista:
    LBRACKET elementos_lista RBRACKET
  ;

elementos_lista:
    expressao elementos_lista_resto
  | %empty
  ;

elementos_lista_resto:
    COMMA elementos_lista
  | %empty
  ;

/* ===== 14. Objetos (vírgula final opcional) ===== */

literal_object:
    LBRACE campos_object RBRACE
  ;

campos_object:
    campo_object campos_object_resto
  | %empty
  ;

campos_object_resto:
    COMMA campos_object
  | %empty
  ;

campo_object:
    IDENTIFIER COLON expressao
  ;

/* ===== 15. Bloco run ===== */

run:
    RUN literal_object
  ;

%%

/* ---- Mensagens de erro em português (formato em ERROS.md) ---- */

/* Como um token esperado aparece na mensagem. */
static const char *descrever(yysymbol_kind_t s)
{
    switch (s) {
    case YYSYMBOL_YYEOF:          return "fim do arquivo";
    case YYSYMBOL_IDENTIFIER:     return "identificador";
    case YYSYMBOL_INT_LITERAL:    return "número inteiro";
    case YYSYMBOL_FLOAT_LITERAL:  return "número real";
    case YYSYMBOL_STRING_LITERAL: return "texto";
    case YYSYMBOL_VAR:            return "'var'";
    case YYSYMBOL_CONST:          return "'const'";
    case YYSYMBOL_FUNC:           return "'func'";
    case YYSYMBOL_WORKFLOW:       return "'workflow'";
    case YYSYMBOL_CALL:           return "'call'";
    case YYSYMBOL_RETURN:         return "'return'";
    case YYSYMBOL_IF:             return "'if'";
    case YYSYMBOL_ELSE:           return "'else'";
    case YYSYMBOL_WHILE:          return "'while'";
    case YYSYMBOL_FOR:            return "'for'";
    case YYSYMBOL_IN:             return "'in'";
    case YYSYMBOL_BREAK:          return "'break'";
    case YYSYMBOL_CONTINUE:       return "'continue'";
    case YYSYMBOL_STOP:           return "'stop'";
    case YYSYMBOL_ABORT:          return "'abort'";
    case YYSYMBOL_RUN:            return "'run'";
    case YYSYMBOL_TRUE:           return "'true'";
    case YYSYMBOL_FALSE:          return "'false'";
    case YYSYMBOL_NULL_LITERAL:   return "'null'";
    case YYSYMBOL_TYPE_INT:       return "'int'";
    case YYSYMBOL_TYPE_FLOAT:     return "'float'";
    case YYSYMBOL_TYPE_STRING:    return "'string'";
    case YYSYMBOL_TYPE_BOOL:      return "'bool'";
    case YYSYMBOL_TYPE_OBJECT:    return "'object'";
    case YYSYMBOL_TYPE_LIST:      return "'list'";
    case YYSYMBOL_ASSIGN:         return "'='";
    case YYSYMBOL_EQ:             return "'=='";
    case YYSYMBOL_NEQ:            return "'!='";
    case YYSYMBOL_LT:             return "'<'";
    case YYSYMBOL_GT:             return "'>'";
    case YYSYMBOL_LTE:            return "'<='";
    case YYSYMBOL_GTE:            return "'>='";
    case YYSYMBOL_PLUS:           return "'+'";
    case YYSYMBOL_MINUS:          return "'-'";
    case YYSYMBOL_MUL:            return "'*'";
    case YYSYMBOL_DIV:            return "'/'";
    case YYSYMBOL_MOD:            return "'%'";
    case YYSYMBOL_AND:            return "'&&'";
    case YYSYMBOL_OR:             return "'||'";
    case YYSYMBOL_NOT:            return "'!'";
    case YYSYMBOL_LPAREN:         return "'('";
    case YYSYMBOL_RPAREN:         return "')'";
    case YYSYMBOL_LBRACE:         return "'{'";
    case YYSYMBOL_RBRACE:         return "'}'";
    case YYSYMBOL_LBRACKET:       return "'['";
    case YYSYMBOL_RBRACKET:       return "']'";
    case YYSYMBOL_COMMA:          return "','";
    case YYSYMBOL_COLON:          return "':'";
    case YYSYMBOL_SEMICOLON:      return "';'";
    case YYSYMBOL_DOT:            return "'.'";
    default:                      return yysymbol_name(s);
    }
}

static int eh_palavra_reservada(yysymbol_kind_t s)
{
    return s >= YYSYMBOL_VAR && s <= YYSYMBOL_TYPE_LIST;
}

/* Como o token encontrado aparece: inclui o lexema quando ajuda. */
static void imprimir_encontrado(yysymbol_kind_t s)
{
    switch (s) {
    case YYSYMBOL_IDENTIFIER:
        fprintf(stderr, "identificador '%s'", flux_lexema);
        break;
    case YYSYMBOL_INT_LITERAL:
        fprintf(stderr, "número inteiro %s", flux_lexema);
        break;
    case YYSYMBOL_FLOAT_LITERAL:
        fprintf(stderr, "número real %s", flux_lexema);
        break;
    case YYSYMBOL_STRING_LITERAL:
        fprintf(stderr, "texto %s", flux_lexema);
        break;
    default:
        if (eh_palavra_reservada(s))
            fprintf(stderr, "palavra reservada %s", descrever(s));
        else
            fputs(descrever(s), stderr);
    }
}

/* Conjuntos que viram uma palavra só na lista de esperados. */
static const yysymbol_kind_t inicio_expressao[] = {
    YYSYMBOL_CALL, YYSYMBOL_FALSE, YYSYMBOL_FLOAT_LITERAL, YYSYMBOL_IDENTIFIER,
    YYSYMBOL_INT_LITERAL, YYSYMBOL_LBRACE, YYSYMBOL_LBRACKET, YYSYMBOL_LPAREN,
    YYSYMBOL_MINUS, YYSYMBOL_NOT, YYSYMBOL_NULL_LITERAL, YYSYMBOL_RUN,
    YYSYMBOL_STRING_LITERAL, YYSYMBOL_TRUE,
};
static const yysymbol_kind_t inicio_tipo[] = {
    YYSYMBOL_TYPE_INT, YYSYMBOL_TYPE_FLOAT, YYSYMBOL_TYPE_STRING,
    YYSYMBOL_TYPE_BOOL, YYSYMBOL_TYPE_OBJECT, YYSYMBOL_TYPE_LIST,
};

#define TAMANHO(v) (sizeof (v) / sizeof *(v))

/* Se todos os tokens do grupo são esperados, marca-os como cobertos. */
static int cobrir_grupo(const yysymbol_kind_t *grupo, size_t n_grupo,
                        const yysymbol_kind_t *esperados, int n, int *coberto)
{
    int achados[YYNTOKENS];
    for (size_t g = 0; g < n_grupo; g++) {
        achados[g] = -1;
        for (int i = 0; i < n; i++)
            if (esperados[i] == grupo[g])
                achados[g] = i;
        if (achados[g] < 0)
            return 0;
    }
    for (size_t g = 0; g < n_grupo; g++)
        coberto[achados[g]] = 1;
    return 1;
}

static void imprimir_esperados(const yysymbol_kind_t *esperados, int n)
{
    const char *itens[YYNTOKENS + 2];
    int coberto[YYNTOKENS] = {0};
    int k = 0;

    /* Após "programa: globais" só resta $end, mas qualquer elemento
       global ainda poderia vir: a redução de <globais> por ε foi
       feita antes de olhar o token. */
    if (n == 1 && esperados[0] == YYSYMBOL_YYEOF) {
        fputs("'var', 'const', 'func', 'workflow' ou fim do arquivo", stderr);
        return;
    }

    if (cobrir_grupo(inicio_expressao, TAMANHO(inicio_expressao), esperados, n, coberto))
        itens[k++] = "expressão";
    if (cobrir_grupo(inicio_tipo, TAMANHO(inicio_tipo), esperados, n, coberto))
        itens[k++] = "tipo";
    for (int i = 0; i < n; i++)
        if (!coberto[i])
            itens[k++] = descrever(esperados[i]);

    for (int i = 0; i < k; i++) {
        if (i > 0)
            fputs(i == k - 1 ? " ou " : ", ", stderr);
        fputs(itens[i], stderr);
    }
}

static int yyreport_syntax_error(const yypcontext_t *ctx)
{
    yysymbol_kind_t encontrado = yypcontext_token(ctx);
    if (encontrado == YYSYMBOL_ERRO_LEXICO)
        return 0;   /* o lexer já reportou o erro */

    const YYLTYPE *loc = yypcontext_location(ctx);
    yysymbol_kind_t esperados[YYNTOKENS];
    int n = yypcontext_expected_tokens(ctx, esperados, YYNTOKENS);

    flux_erro("sintático", loc->first_line, loc->first_column);
    fputs("Token encontrado: ", stderr);
    imprimir_encontrado(encontrado);
    fputs("\nEsperado: ", stderr);
    imprimir_esperados(esperados, n);
    fputc('\n', stderr);
    return 0;
}

/* Erro S3: o "=" veio depois de algo que não é variável, campo ou índice. */
static void erro_atribuicao(const YYLTYPE *loc)
{
    flux_erro("sintático", loc->first_line, loc->first_column);
    fputs("Token encontrado: '='\n"
          "Esperado: ';' (o lado esquerdo não é variável, campo ou índice)\n",
          stderr);
}

void yyerror(const char *msg)
{
    if (strcmp(msg, "memory exhausted") == 0)
        msg = "memória esgotada (programa grande demais para a pilha do parser)";
    fprintf(stderr, "Erro: %s\n", msg);
}

const char *flux_nome_token(int token)
{
    return yysymbol_name(YYTRANSLATE(token));
}
