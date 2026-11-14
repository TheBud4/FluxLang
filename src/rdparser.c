/* Parser descendente recursivo da FluxLang.
 *
 * É a BNF de docs/BNF.txt escrita à mão: cada não-terminal vira uma função e
 * cada alternativa é escolhida olhando só o token seguinte (o "lookahead").
 * Isso só funciona porque a gramática é LL(1): os FIRST das alternativas de
 * um mesmo não-terminal não se cruzam.
 *
 * Como ler a tradução, regra por regra:
 *
 *   <a> ::= X <b> Y            ->  expect(X); b(); expect(Y);
 *   <a> ::= X <b> | Y <c>      ->  switch (tok) { case X: ...; case Y: ... }
 *   <a> ::= <b> <a> | ε        ->  while (tok começa <b>) b();
 *   <a> ::= X <a_rest>         ->  as regras "*_rest" (recursão à direita,
 *   <a_rest> ::= Y <a_rest> | ε    criadas para tirar a recursão à esquerda)
 *                                  viram um laço: while (tok == Y) { ... }
 *
 * O ε nunca é testado: se o token não começa nenhuma alternativa, a função
 * simplesmente retorna, e quem a chamou acusa o erro ao esperar o seu próprio
 * token. É por isso que as mensagens coincidem com as do Bison (que também
 * adia o erro por causa das reduções ε).
 *
 * Modo pânico (docs/ERROS.md, seção 6): ao achar um erro, fail() o reporta e
 * salta (longjmp) para o ponto de recuperação mais interno, que descarta
 * tokens até um token de sincronização e segue a análise. Há pontos de
 * recuperação em cada comando de um bloco e em cada declaração global; ver
 * guarded(), sync_in_block() e sync_global(). */

#include "fluxc.h"
#include "parser.tab.h" /* só os códigos dos tokens, yylval, yylloc e YYerror */
#include <setjmp.h>
#include <stdio.h>
#include <string.h>

/* ---------- Leitura de tokens ---------- */

static int tok;          /* o lookahead: token que ainda não foi consumido */
static YYLTYPE tok_loc;  /* onde ele começa (linha e coluna) */
static char *tok_text;   /* texto de identificadores e literais, senão NULL */
static int tok_index;    /* quantos tokens já foram lidos (posição do lookahead) */
static int last_error_index = -1; /* posição do último erro reportado */

/* Consome o lookahead e lê o próximo token do lexer. Um erro léxico chega
 * aqui como o token YYerror: o lexer já imprimiu a mensagem, e o parser o
 * trata como um token que nada aceita, o que dispara o modo pânico em
 * fail() sem segunda mensagem. */
static void advance(void) {
  tok = yylex();
  tok_index++;
  tok_loc = yylloc;
  tok_text = yylval.text;
}

/* ---------- Nomes dos tokens nas mensagens ---------- */

/* Como o token é escrito no código ("if", ";"), ou NULL para identificadores,
 * literais e fim do arquivo. */
static const char *spelling(int t) {
  switch (t) {
  case VAR: return "var";           case CONST: return "const";
  case FUNC: return "func";         case WORKFLOW: return "workflow";
  case MAIN: return "main";         case RETURN: return "return";
  case IF: return "if";             case ELSE: return "else";
  case WHILE: return "while";       case FOR: return "for";
  case IN: return "in";             case BREAK: return "break";
  case CONTINUE: return "continue"; case CALL: return "call";
  case RUN: return "run";           case STOP: return "stop";
  case ABORT: return "abort";       case PROCEED: return "proceed";
  case TYPE_INT: return "int";      case TYPE_FLOAT: return "float";
  case TYPE_STRING: return "string"; case TYPE_BOOL: return "bool";
  case TYPE_OBJECT: return "object"; case TYPE_LIST: return "list";
  case TRUE: return "true";         case FALSE: return "false";
  case NULL_LITERAL: return "null";
  case ASSIGN: return "=";          case EQUAL: return "==";
  case NOT_EQUAL: return "!=";      case LOWER_THAN: return "<";
  case LOWER_THAN_EQUAL: return "<="; case GREATER_THAN: return ">";
  case GREATER_THAN_EQUAL: return ">="; case PLUS: return "+";
  case MINUS: return "-";           case MUL: return "*";
  case DIV: return "/";             case MOD: return "%";
  case AND: return "&&";            case OR: return "||";
  case NOT: return "!";             case LPAREN: return "(";
  case RPAREN: return ")";          case LBRACE: return "{";
  case RBRACE: return "}";          case LBRACKET: return "[";
  case RBRACKET: return "]";        case COMMA: return ",";
  case COLON: return ":";           case SEMICOLON: return ";";
  case DOT: return ".";
  default: return NULL;
  }
}

/* Palavras reservadas são os tokens de VAR até NULL_LITERAL (a ordem do
 * %token em parser.y; ver token_name/lexer.l). */
static int is_keyword(int t) { return t >= VAR && t <= NULL_LITERAL; }

/* O token que apareceu, com o texto quando houver: identificador 'total'... */
static void found_name(char *buf, size_t size) {
  const char *text = tok_text ? tok_text : "";
  switch (tok) {
  case 0:              snprintf(buf, size, "fim do arquivo"); break;
  case IDENTIFIER:     snprintf(buf, size, "identificador '%s'", text); break;
  case INT_LITERAL:    snprintf(buf, size, "número inteiro %s", text); break;
  case FLOAT_LITERAL:  snprintf(buf, size, "número real %s", text); break;
  case STRING_LITERAL: snprintf(buf, size, "texto %s", text); break;
  default:
    if (is_keyword(tok))
      snprintf(buf, size, "palavra reservada '%s'", spelling(tok));
    else
      snprintf(buf, size, "'%s'", spelling(tok));
  }
}

/* O token que esperávamos, quando é um só: ';', identificador... */
static void expected_name(int t, char *buf, size_t size) {
  switch (t) {
  case 0:              snprintf(buf, size, "fim do arquivo"); break;
  case IDENTIFIER:     snprintf(buf, size, "identificador"); break;
  case INT_LITERAL:    snprintf(buf, size, "número inteiro"); break;
  case FLOAT_LITERAL:  snprintf(buf, size, "número real"); break;
  case STRING_LITERAL: snprintf(buf, size, "texto"); break;
  default:             snprintf(buf, size, "'%s'", spelling(t));
  }
}

/* Listas de esperados que valem mais de um token. Cada uma é a união dos
 * FIRST das alternativas no ponto onde o parser decide; quando a lista
 * completa de um grupo cabe, ela vira uma palavra (docs/ERROS.md, seção 1). */
#define EXPECT_EXPRESSION "expressão"
#define EXPECT_RHS "expressão, 'call' ou 'run'" /* <rhs> */
#define EXPECT_TYPE "tipo"
#define EXPECT_GLOBAL "'var', 'const', 'func' ou 'workflow'"
#define EXPECT_MAIN_OR_NAME "'main' ou identificador"
#define EXPECT_INIT "'=' ou ':'" /* <variable_rest> e <constant_rest> */

/* ---------- Erros ---------- */

/* Pontos de recuperação: handler aponta para o jmp_buf do mais interno
 * (guarded() empilha e desempilha). */
static jmp_buf *handler;

/* Erro sintático: "Token encontrado: X / Esperado: Y". Não volta: salta para
 * o ponto de recuperação mais interno. Duas situações não imprimem nada:
 *  - o lookahead é YYerror: o erro léxico já foi reportado;
 *  - já houve erro neste mesmo token: seria cascata (ocorre, por exemplo,
 *    com vários blocos abertos no fim do arquivo). */
static void fail(const char *expected) {
  if (tok != YYerror && tok_index != last_error_index) {
    char found[256];
    found_name(found, sizeof found);
    const char *hint = "";
    if (tok == CALL || tok == RUN)
      hint = " (call e run só aparecem logo depois do '=' de um var ou de uma "
             "atribuição)";
    report_error("sintático", tok_loc.first_line, tok_loc.first_column,
                 "Token encontrado: %s\nEsperado: %s%s", found, expected, hint);
  }
  last_error_index = tok_index;
  longjmp(*handler, 1);
}

/* Roda f() sob um ponto de recuperação. Devolve 1 se f() terminou sem erro e
 * 0 se algum fail() saltou para cá (o erro já foi impresso): quem chamou
 * deve então sincronizar. Só globais são alteradas depois do setjmp, então
 * nada precisa de volatile. */
static int guarded(void (*f)(void)) {
  jmp_buf here;
  jmp_buf *outer = handler;
  handler = &here;
  if (setjmp(here) == 0) {
    f();
    handler = outer;
    return 1;
  }
  handler = outer;
  return 0;
}

/* Consome o token t ou acusa o erro "Esperado: t". */
static void expect(int t) {
  if (tok != t) {
    char name[32];
    expected_name(t, name, sizeof name);
    fail(name);
  }
  advance();
}

/* ---------- Conjuntos FIRST usados nas decisões ---------- */

/* FIRST(<expression>): tokens que podem iniciar uma expressão. */
static int starts_expression(void) {
  switch (tok) {
  case INT_LITERAL: case FLOAT_LITERAL: case STRING_LITERAL:
  case TRUE: case FALSE: case NULL_LITERAL: case IDENTIFIER:
  case LPAREN: case LBRACKET: case LBRACE: case NOT: case MINUS:
    return 1;
  default:
    return 0;
  }
}

/* FIRST(<command>): as palavras que iniciam comando e, como todo comando
 * pode ser uma expressão, FIRST(<expression>). */
static int starts_command(void) {
  switch (tok) {
  case VAR: case CONST: case IF: case WHILE: case FOR: case RETURN:
  case BREAK: case CONTINUE: case STOP: case ABORT: case PROCEED:
    return 1;
  default:
    return starts_expression();
  }
}

/* ---------- Modo pânico: descartar tokens até poder continuar ---------- */

/* Pula um bloco { ... } inteiro, contando as chaves (chamada com tok == '{').
 * Sem isso, em "if x > 5 { ... }" o '}' do if fecharia o bloco da função e
 * geraria erros em cascata. Para no fim do arquivo. */
static void skip_braces(void) {
  int depth = 0;
  do {
    if (tok == LBRACE)
      depth++;
    else if (tok == RBRACE)
      depth--;
    advance();
  } while (depth > 0 && tok != 0);
}

/* Sincronização dentro de um bloco: chamada depois de um erro num comando.
 * Descarta tokens até um ponto onde o bloco possa seguir:
 *   ';'                       consome e segue para o próximo comando
 *   '}'                       não consome: o bloco termina normalmente
 *   var const if while for    início de comando: segue a partir dele
 *   return break continue
 *   stop abort proceed
 *   func workflow, fim        o bloco ficou aberto: o erro sobe, sem
 *                             consumir, até o nível global (rethrow)
 * IDENTIFIER, literais, '(' e '[' também iniciam comandos, mas aparecem no
 * meio de expressões e não servem. Como stop, abort e proceed são pontos de
 * retomada, o 'if' que vem depois deles é consumido pelo próprio comando e
 * nunca é visto aqui como início de um if. */
static void sync_in_block(void) {
  for (;;) {
    switch (tok) {
    case SEMICOLON:
      advance();
      return;
    case RBRACE:
    case VAR: case CONST: case IF: case WHILE: case FOR: case RETURN:
    case BREAK: case CONTINUE: case STOP: case ABORT: case PROCEED:
      return;
    case FUNC: case WORKFLOW: case 0:
      longjmp(*handler, 1); /* silencioso: o erro já foi reportado */
    case LBRACE:
      skip_braces();
      continue;
    default:
      advance();
    }
  }
}

/* Sincronização no nível global: descarta até func, workflow, var, const ou
 * o fim do arquivo; um ';' é consumido e a análise segue depois dele. */
static void sync_global(void) {
  for (;;) {
    switch (tok) {
    case FUNC: case WORKFLOW: case VAR: case CONST: case 0:
      return;
    case SEMICOLON:
      advance();
      return;
    case LBRACE:
      skip_braces();
      continue;
    default:
      advance();
    }
  }
}

/* ---------- Declarações das regras (uma por não-terminal) ---------- */

/* As funções de expressão devolvem 1 se a expressão pode receber atribuição
 * (variável, campo ou índice) e 0 se não. É a checagem S3: a gramática aceita
 * qualquer expressão antes do '=', e command_expression() rejeita o que não
 * for alvo. Fica nos retornos para não precisar de árvore ainda. */
static int expression(void);
static int expression_list(void);
static void args(void);
static void type(void);
static void block(void);
static void object_literal(void);
static void function_rest(void);

/* ---------- 2. Tipos ---------- */

/* <type> ::= TYPE_INT | TYPE_FLOAT | TYPE_STRING | TYPE_BOOL | TYPE_OBJECT
 *          | TYPE_LIST LOWER_THAN <type> GREATER_THAN */
static void type(void) {
  switch (tok) {
  case TYPE_INT: case TYPE_FLOAT: case TYPE_STRING:
  case TYPE_BOOL: case TYPE_OBJECT:
    advance();
    return;
  case TYPE_LIST:
    advance();
    expect(LOWER_THAN);
    type(); /* recursão: list<list<int>> */
    expect(GREATER_THAN);
    return;
  default:
    fail(EXPECT_TYPE);
  }
}

/* ---------- 6. Expressões (um nível de precedência por função) ---------- */

/* <list_literal> ::= LBRACKET <list_items> RBRACKET
 * As quatro regras <list_items>/<list_rest>/<list_after_comma> existem para
 * aceitar a vírgula final ([1, 2,]); no código viram um laço que, depois de
 * cada vírgula, olha se ainda vem expressão. */
static void list_literal(void) {
  expect(LBRACKET);
  if (starts_expression()) {
    expression();
    while (tok == COMMA) {
      advance();
      if (!starts_expression())
        break; /* vírgula final */
      expression();
    }
  }
  expect(RBRACKET);
}

/* <field> ::= <field_key> COLON <expression>
 * <field_key> ::= IDENTIFIER | STRING_LITERAL
 * Quem chama já conferiu que o token é uma chave. */
static void field(void) {
  advance(); /* a chave */
  expect(COLON);
  expression();
}

/* <object_literal> ::= LBRACE <object_items> RBRACE, também com vírgula
 * final ({ a: 1, }). */
static void object_literal(void) {
  expect(LBRACE);
  if (tok == IDENTIFIER || tok == STRING_LITERAL) {
    field();
    while (tok == COMMA) {
      advance();
      if (tok != IDENTIFIER && tok != STRING_LITERAL)
        break; /* vírgula final */
      field();
    }
  }
  expect(RBRACE);
}

/* <primary> ::= literais | IDENTIFIER | LPAREN <expression> RPAREN
 *             | <list_literal> | <object_literal>
 * Devolve 1 só para IDENTIFIER (um nome pode receber atribuição). */
static int primary(void) {
  switch (tok) {
  case IDENTIFIER:
    advance();
    return 1;
  case INT_LITERAL: case FLOAT_LITERAL: case STRING_LITERAL:
  case TRUE: case FALSE: case NULL_LITERAL:
    advance();
    return 0;
  case LPAREN:
    advance();
    expression();
    expect(RPAREN);
    return 0; /* (x) = 1 não é alvo válido */
  case LBRACKET:
    list_literal();
    return 0;
  case LBRACE:
    object_literal();
    return 0;
  default:
    fail(EXPECT_EXPRESSION);
    return 0; /* fail() não volta; o return acalma o compilador */
  }
}

/* <postfix_expr> ::= <primary> <postfix_rest>
 * <postfix_rest> ::= DOT IDENTIFIER <postfix_rest>
 *                  | LBRACKET <expression> RBRACKET <postfix_rest>
 *                  | LPAREN <args> RPAREN <postfix_rest> | ε
 * Acesso (.campo, [i]) mantém a expressão atribuível; chamada não. Vale o
 * último sufixo: f().campo = 1 pode, f()[0].g() = 1 não. */
static int postfix_expr(void) {
  int assignable = primary();
  for (;;) {
    switch (tok) {
    case DOT:
      advance();
      expect(IDENTIFIER);
      assignable = 1;
      break;
    case LBRACKET:
      advance();
      expression();
      expect(RBRACKET);
      assignable = 1;
      break;
    case LPAREN:
      advance();
      args();
      expect(RPAREN);
      assignable = 0;
      break;
    default: /* ε */
      return assignable;
    }
  }
}

/* <unary_expr> ::= <unary_op> <unary_expr> | <postfix_expr>
 * <unary_op> ::= NOT | MINUS */
static int unary_expr(void) {
  if (tok == NOT || tok == MINUS) {
    advance();
    unary_expr();
    return 0;
  }
  return postfix_expr();
}

/* Os cinco níveis binários seguem todos o mesmo molde. Na BNF:
 *     <x_expr> ::= <y_expr> <x_rest>
 *     <x_rest> ::= <x_op> <y_expr> <x_rest> | ε
 * No código, <x_rest> vira o while: enquanto aparecer um operador do nível,
 * consome-o e lê mais um operando. Se algum operador apareceu, a expressão
 * deixa de ser atribuível (a + b = 1 é erro S3). */

/* 6. * / %  */
static int multiplicative_expr(void) {
  int assignable = unary_expr();
  while (tok == MUL || tok == DIV || tok == MOD) {
    advance();
    unary_expr();
    assignable = 0;
  }
  return assignable;
}

/* 5. + - */
static int additive_expr(void) {
  int assignable = multiplicative_expr();
  while (tok == PLUS || tok == MINUS) {
    advance();
    multiplicative_expr();
    assignable = 0;
  }
  return assignable;
}

/* 4. < > <= >= */
static int relational_expr(void) {
  int assignable = additive_expr();
  while (tok == LOWER_THAN || tok == GREATER_THAN ||
         tok == LOWER_THAN_EQUAL || tok == GREATER_THAN_EQUAL) {
    advance();
    additive_expr();
    assignable = 0;
  }
  return assignable;
}

/* 3. == != */
static int equality_expr(void) {
  int assignable = relational_expr();
  while (tok == EQUAL || tok == NOT_EQUAL) {
    advance();
    relational_expr();
    assignable = 0;
  }
  return assignable;
}

/* 2. && */
static int and_expr(void) {
  int assignable = equality_expr();
  while (tok == AND) {
    advance();
    equality_expr();
    assignable = 0;
  }
  return assignable;
}

/* 1. || */
static int or_expr(void) {
  int assignable = and_expr();
  while (tok == OR) {
    advance();
    and_expr();
    assignable = 0;
  }
  return assignable;
}

/* <expression> ::= <or_expr> */
static int expression(void) { return or_expr(); }

/* <expression_list> ::= <expression> <expression_list_rest>
 * Devolve 1 se TODAS as expressões são atribuíveis (usado em a, b = 1, 2;). */
static int expression_list(void) {
  int assignable = expression();
  while (tok == COMMA) {
    advance();
    if (!expression())
      assignable = 0;
  }
  return assignable;
}

/* <args> ::= <expression_list> | ε (quem chama espera o ')') */
static void args(void) {
  if (starts_expression())
    expression_list();
}

/* ---------- 2. Declarações ---------- */

/* <identifier_list> ::= IDENTIFIER <identifier_list_rest> */
static void identifier_list(void) {
  expect(IDENTIFIER);
  while (tok == COMMA) {
    advance();
    expect(IDENTIFIER);
  }
}

/* <rhs> ::= CALL IDENTIFIER LPAREN <args> RPAREN | RUN <object_literal>
 *         | <expression_list>
 * call e run não são expressões: só aparecem aqui, logo depois de um '='. */
static void rhs(void) {
  switch (tok) {
  case CALL:
    advance();
    expect(IDENTIFIER);
    expect(LPAREN);
    args();
    expect(RPAREN);
    return;
  case RUN:
    advance();
    object_literal();
    return;
  default:
    if (!starts_expression())
      fail(EXPECT_RHS); /* é aqui que 'call' e 'run' entram na lista */
    expression_list();
  }
}

/* <variable_declaration> ::= VAR <identifier_list> <variable_rest> SEMICOLON
 * <variable_rest> ::= COLON <type> <initializer> | ASSIGN <rhs>
 * <initializer>   ::= ASSIGN <rhs> | ε */
static void variable_declaration(void) {
  expect(VAR);
  identifier_list();
  if (tok == COLON) {
    advance();
    type();
    if (tok == ASSIGN) { /* <initializer> */
      advance();
      rhs();
    }
  } else if (tok == ASSIGN) {
    advance();
    rhs();
  } else {
    fail(EXPECT_INIT); /* var x; não vale: falta o tipo ou o valor */
  }
  expect(SEMICOLON);
}

/* <constant_declaration> ::= CONST <identifier_list> <constant_rest> SEMICOLON
 * <constant_rest> ::= COLON <type> ASSIGN <expression_list>
 *                   | ASSIGN <expression_list>
 * Diferente do var, o const exige valor e não aceita call/run. */
static void constant_declaration(void) {
  expect(CONST);
  identifier_list();
  if (tok == COLON) {
    advance();
    type();
    expect(ASSIGN);
  } else if (tok == ASSIGN) {
    advance();
  } else {
    fail(EXPECT_INIT);
  }
  expression_list();
  expect(SEMICOLON);
}

/* ---------- 5. Comandos ---------- */

static void command(void);

/* <commands> ::= <command> <commands> | ε
 * Roda comandos enquanto o token iniciar um. Se parou em algo que não é '}',
 * o bloco está quebrado: "Esperado: '}'" (é o que o Bison também diz, ver o
 * comentário no início do arquivo). */
static void commands(void) {
  while (starts_command())
    command();
  if (tok != RBRACE)
    fail("'}'");
}

/* <block> ::= LBRACE <commands> RBRACE
 * O ponto de recuperação dos comandos: se um comando falha, sync_in_block()
 * descarta tokens e o laço recomeça no próximo comando do MESMO bloco. Erros
 * dentro de um bloco aninhado são tratados pelo laço do bloco aninhado. */
static void block(void) {
  expect(LBRACE);
  while (!guarded(commands))
    sync_in_block();
  expect(RBRACE);
}

/* <command_expression> ::= <expression> <assignment_rest> SEMICOLON
 * <assignment_rest> ::= ASSIGN <rhs> | COMMA <expression_list> ASSIGN <rhs> | ε
 *
 * Chamada, atribuição e atribuição múltipla começam todas por uma expressão,
 * então lê-se a expressão primeiro e o token seguinte decide. A checagem S3
 * (alvo inválido) fica para depois do ';', como no Bison: um erro de sintaxe
 * mais adiante no mesmo comando tem prioridade (e, com o pânico, o S3 desse
 * comando nem chega a ser reportado). */
static void command_expression(void) {
  int assignable = expression();
  int has_assign = 0;
  YYLTYPE assign_loc = tok_loc;

  if (tok == ASSIGN) {
    has_assign = 1;
    advance();
    rhs();
  } else if (tok == COMMA) {
    advance();
    if (!expression_list())
      assignable = 0;
    has_assign = 1;
    assign_loc = tok_loc;
    expect(ASSIGN);
    rhs();
  }
  expect(SEMICOLON);

  /* O comando já terminou (o ';' foi consumido), então não há o que
   * sincronizar: reporta e segue para o próximo. */
  if (has_assign && !assignable)
    report_error("sintático", assign_loc.first_line, assign_loc.first_column,
                 "Token encontrado: '='\nEsperado: ';' (o lado esquerdo não é "
                 "variável, campo ou índice)");
}

/* <command> ::= declarações | if | while | for | return | break | continue
 *             | <command_error> | <command_expression> */
static void command(void) {
  switch (tok) {
  case VAR:
    variable_declaration();
    break;
  case CONST:
    constant_declaration();
    break;
  case IF: /* <command_if> ::= IF ( <expression> ) <block> <else_part> */
    advance();
    expect(LPAREN);
    expression();
    expect(RPAREN);
    block();
    if (tok == ELSE) { /* <else_part> ::= ELSE <block> | ε  (sem else if) */
      advance();
      block();
    }
    break;
  case WHILE: /* <command_while> ::= WHILE ( <expression> ) <block> */
    advance();
    expect(LPAREN);
    expression();
    expect(RPAREN);
    block();
    break;
  case FOR: /* <command_for> ::= FOR IDENTIFIER IN <expression> <block> */
    advance();
    expect(IDENTIFIER);
    expect(IN);
    expression();
    block();
    break;
  case RETURN: /* <command_return> ::= RETURN <return_values> SEMICOLON */
    advance();
    if (starts_expression()) /* <return_values> ::= <expression_list> | ε */
      expression_list();
    expect(SEMICOLON);
    break;
  case BREAK:
    advance();
    expect(SEMICOLON);
    break;
  case CONTINUE:
    advance();
    expect(SEMICOLON);
    break;
  case STOP: case ABORT: case PROCEED:
    /* <command_error> ::= <error_action> IF IDENTIFIER SEMICOLON */
    advance();
    expect(IF);
    expect(IDENTIFIER);
    expect(SEMICOLON);
    break;
  default: /* starts_command() garante que aqui começa uma expressão */
    command_expression();
  }
}

/* ---------- 4. Funções e workflows ---------- */

/* <parameter> ::= IDENTIFIER COLON <type> */
static void parameter(void) {
  expect(IDENTIFIER);
  expect(COLON);
  type();
}

/* <function_rest> ::= LPAREN <parameter_list> RPAREN <return_type> <block>
 * Tudo o que vem depois do nome, igual para func e workflow. */
static void function_rest(void) {
  expect(LPAREN);
  if (tok == IDENTIFIER) { /* <parameter_list> ::= <parameters> | ε */
    parameter();
    while (tok == COMMA) {
      advance();
      parameter();
    }
  }
  expect(RPAREN);
  if (tok == COLON) { /* <return_type> ::= COLON <type> | ε */
    advance();
    type();
  }
  block();
}

/* ---------- 1. Estrutura do programa ---------- */

/* <global_no_func> ::= <variable_declaration> | <constant_declaration>
 *                    | <workflow>
 * Devolve 0 se o token não começa nenhuma delas. */
static int global_no_func(void) {
  switch (tok) {
  case VAR:
    variable_declaration();
    return 1;
  case CONST:
    constant_declaration();
    return 1;
  case WORKFLOW: /* <workflow> ::= WORKFLOW IDENTIFIER <function_rest> */
    advance();
    expect(IDENTIFIER);
    function_rest();
    return 1;
  default:
    return 0;
  }
}

static int main_seen; /* já passou pelo "func main"? */
static int at_end;    /* já chegou ao fim do arquivo depois da main? */

/* <after_main> ::= <global_no_func> <after_main>
 *                | FUNC IDENTIFIER <function_rest> <after_main> | ε
 * Depois da main, MAIN não é mais aceito: é isso que a torna única. Uma
 * chamada processa um item; o ε (fim do arquivo) marca at_end. */
static void after_main_item(void) {
  if (global_no_func())
    return;
  if (tok == FUNC) {
    advance();
    expect(IDENTIFIER);
    function_rest();
    return;
  }
  if (tok != 0)
    fail("fim do arquivo"); /* <program> ::= <before_main> EOF */
  at_end = 1;
}

/* <before_main> ::= <global_no_func> <before_main> | FUNC <after_func>
 * <after_func>  ::= MAIN LPAREN RPAREN <block> <after_main>
 *                 | IDENTIFIER <function_rest> <before_main>
 *
 * O FUNC é fatorado: sozinho, ele não diz se vem uma função ou a main. O
 * token depois dele decide (MAIN ou IDENTIFIER). <before_main> e <after_func>
 * se chamam em círculo até achar a main; uma chamada processa um item. */
static void before_main_item(void) {
  if (global_no_func())
    return;
  if (tok != FUNC)
    fail(EXPECT_GLOBAL);
  advance();
  if (tok == MAIN) {
    main_seen = 1; /* mesmo se a main tiver erro, o resto vem depois dela */
    advance();
    expect(LPAREN);
    expect(RPAREN);
    block();
    return;
  }
  if (tok != IDENTIFIER)
    fail(EXPECT_MAIN_OR_NAME);
  advance();
  function_rest();
}

/* O ponto de recuperação global: cada item (declaração, função, workflow)
 * roda sob guarded(); se falha, sync_global() descarta até o próximo item. */
static void globals(void) {
  while (!main_seen) {
    if (!guarded(before_main_item)) {
      sync_global();
      if (tok == 0)
        return; /* acabou sem main: o erro já foi reportado */
    }
  }
  while (!at_end) {
    if (!guarded(after_main_item)) {
      sync_global();
      if (tok == 0)
        return;
    }
  }
}

/* <program> ::= <before_main> EOF
 * Devolve 0 se o programa foi aceito e 1 se houve algum erro (léxico ou
 * sintático): o parser segue até o fim do arquivo para reportar todos. */
int rd_parse(void) {
  jmp_buf top; /* rede de segurança: todo fail() cai num guarded() antes */
  handler = &top;
  if (setjmp(top))
    return 1;
  advance();
  globals();
  return error_total() > 0;
}
