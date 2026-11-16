import { Callout, Code, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Parser() {
  return (
    <>
      <H2 title="O papel do parser" />
      <P>
        O parser confere se a sequência de tokens obedece à gramática e, ao mesmo tempo, monta a árvore de derivação. Ele
        está em {mono('src/frontend/parser.y')}, uma especificação do Bison (3.6 ou mais novo; a versão medida aqui é a
        3.8.2): o Bison gera {mono('build/parser.tab.c')} e {mono('build/parser.tab.h')}. A entrada são os tokens que{' '}
        <PageLink to="compilador/lexico">{mono('yylex')}</PageLink> entrega um a um; as saídas são a árvore, guardada em{' '}
        {mono('parse_root')} (nó {mono('program')}), e as mensagens de erro sintático, impressas por {mono('report_error')}.
        Quem chama é {mono('main')}, com {mono('yyparse()')}.
      </P>
      <P>
        Esta página explica a gramática como está escrita no arquivo, a forma das ações, a checagem do erro S3 e as
        mensagens de erro. A recuperação de erros (as regras com {mono('error')}) está em{' '}
        <PageLink to="compilador/modo-panico">Modo pânico</PageLink>, e o nó da árvore ({mono('Node')}, {mono('mknode')}) em{' '}
        <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink>.
      </P>

      <H2 title="Estrutura do arquivo" />
      <Table
        head={['Parte', 'O que faz']}
        rows={[
          [
            <>Bloco {mono('%{ ... %}')}</>,
            <>
              Inclui {mono('stdio.h')}, {mono('string.h')}, {mono('fluxc.h')} e {mono('tree.h')} e declara {mono('yylex')} e{' '}
              {mono('yyerror')}.
            </>,
          ],
          [
            mono('%define parse.error custom'),
            <>
              Desliga as mensagens de erro prontas do Bison (em inglês). Em vez disso, o Bison chama{' '}
              {mono('yyreport_syntax_error')}, definida no fim do arquivo. É o que exige o Bison 3.6.
            </>,
          ],
          [
            mono('%code requires { #include "tree.h" }'),
            <>
              Põe o {mono('#include "tree.h"')} dentro de {mono('parser.tab.h')}, o cabeçalho que o lexer inclui. Assim quem
              incluir o cabeçalho do parser conhece o tipo {mono('Node')} do valor semântico.
            </>,
          ],
          [
            mono('%code { ... }'),
            <>
              Dois itens usados só nas ações: a variável {mono('static YYLTYPE assign_loc')} e a enumeração{' '}
              {mono('SUFFIX_NONE, SUFFIX_ACCESS, SUFFIX_CALL')}, ambas da checagem S3.
            </>,
          ],
          [
            mono('%locations'),
            <>Liga o rastreio de posição: cada símbolo tem um {mono('YYLTYPE')} (acessado como {mono('@1')}, {mono('@2')}...).</>,
          ],
          [
            mono('%union { struct Node *node; }'),
            <>
              Todo símbolo, token ou não terminal, tem como valor um {mono('Node *')}. Por isso toda declaração é{' '}
              {mono('%token <node>')} ou {mono('%type <node>')}. O tipo {mono('Node')} está em {mono('tree.h')}; ver{' '}
              <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink>.
            </>,
          ],
          [
            mono('%token <node>'),
            <>
              56 tokens em seis grupos, nesta ordem: palavras reservadas, palavras de tipo, literais ({mono('TRUE')},{' '}
              {mono('FALSE')}, {mono('NULL_LITERAL')}, depois os três literais com valor), {mono('IDENTIFIER')}, operadores
              e pontuação. A ordem importa, ver "Mensagens de erro sintático".
            </>,
          ],
          [mono('%type <node>'), <>Os 71 não terminais, todos com valor do tipo {mono('node')}.</>],
          [
            'Regras (entre os dois %%)',
            <>148 alternativas: 143 correspondem à BNF e 5 usam o token {mono('error')} (modo pânico).</>,
          ],
          [
            'Epílogo (depois do segundo %%)',
            <>
              {mono('token_name')}, {mono('yyerror')}, as funções auxiliares das mensagens de erro e{' '}
              {mono('yyreport_syntax_error')}.
            </>,
          ],
        ]}
      />

      <H2 title="Uma transcrição da BNF, com forma de LL(1)" />
      <P>
        Cada não terminal de {mono('docs/BNF.txt')} é um não terminal de {mono('parser.y')}, com o mesmo nome, e cada
        alternativa da BNF é uma alternativa do arquivo, na mesma ordem. Conferido com os dois arquivos: os 71 nomes são
        os mesmos. A BNF é LL(1), e o arquivo mantém essa forma: recursão à direita nas regras auxiliares {mono('*_rest')}{' '}
        (como {mono('or_rest: OR and_expr or_rest')}) e fatoração à esquerda (como {mono('FUNC after_func')} no lugar de
        duas regras que começariam por {mono('FUNC')}). Não há {mono('%left')}, {mono('%right')} nem {mono('%prec')}: a
        precedência dos operadores vem de um não terminal por nível.
      </P>
      <Why>
        Um parser de Bison idiomático seria escrito com recursão à esquerda e declarações de precedência ({mono('%left')}).
        O arquivo não é assim de propósito: o CLAUDE.md registra que o Trabalho 2 pedia mostrar a transformação da gramática
        para LL(1), então as regras seguem a BNF uma a uma, e a árvore de derivação sai fiel a ela, com os nós {mono('*_rest')}.
        Quem mexer nas regras deve manter o estilo e sem conflitos do Bison.
      </Why>
      <Callout kind="nota">
        Depois, o usuário decidiu dispensar a demonstração da transformação para LL(1), porque a linguagem nasceu LL(1)
        (registrado no AGENTS.md). A forma do arquivo continuou a mesma.
      </Callout>
      <P>
        O Bison gera um autômato LALR(1), mais forte que LL(1); por isso uma gramática LL(1) passa sem conflitos. Medido
        com {mono('bison -Wall')}, que não imprimiu nenhum aviso: 56 tokens declarados, 71 não terminais, 254 estados e nenhum conflito
        de deslocamento e redução nem de redução e redução. Qualquer regra nova tem de manter isso.
      </P>

      <H2 title="A forma uniforme das ações" />
      <P>
        Toda alternativa tem a mesma ação: cria o nó do não terminal com os filhos que a alternativa tem, na ordem.
      </P>
      <Code lang="text">
        {String.raw`before_main
  : global_no_func before_main { $$ = mknode("before_main", 2, $1, $2); }
  | FUNC after_func { $$ = mknode("before_main", 2, $1, $2); }
  ;

initializer
  : ASSIGN rhs { $$ = mknode("initializer", 2, $1, $2); }
  | %empty { $$ = mknode("initializer", 1, empty_node()); }
  ;

command
  : variable_declaration { $$ = mknode("command", 1, $1); }
  | error SEMICOLON { $$ = mknode("command", 2, error_node(@1.first_line, @1.first_column), $2); yyerrok; }`}
      </Code>
      <P>
        No último trecho, só duas das doze alternativas de {mono('command')} estão mostradas (a primeira e uma das de recuperação).
      </P>
      <Table
        head={['Parte da ação', 'Significado']}
        rows={[
          [mono('"before_main"'), <>O nome do não terminal, igual ao da BNF. Vira o {mono('label')} do nó.</>],
          [mono('2'), 'O número de filhos, igual ao número de símbolos da alternativa.'],
          [<>{mono('$1')}, {mono('$2')}...</>, <>Os valores dos símbolos da alternativa: para um token, a folha criada por {mono('RET')}; para um não terminal, o nó que a sua regra montou.</>],
          [mono('empty_node()'), <>Folha ε. Toda alternativa vazia ({mono('%empty')}) tem um nó com um único filho ε.</>],
          [mono('error_node(@k.first_line, @k.first_column)'), <>Folha que marca o trecho descartado pelo modo pânico, no lugar do token {mono('error')}. A posição é a do início do trecho.</>],
          [mono('yyerrok'), <>Só nas cinco alternativas com {mono('error')}: volta a permitir mensagens de erro.</>],
        ]}
      />
      <P>
        Sai no {mono('--tree')} (programa {mono('func main () { break; }')}, real):
      </P>
      <Code lang="text">
        {`program
  before_main
    FUNC 'func' 1:1
    after_func
      MAIN 'main' 1:6
      LPAREN '(' 1:11
      RPAREN ')' 1:12
      block
        LBRACE '{' 1:14
        commands
          command
            command_break
              BREAK 'break' 2:5
              SEMICOLON ';' 2:10
          commands
            ε
        RBRACE '}' 3:1
      after_main
        ε`}
      </Code>
      <P>
        Poucas ações têm algo além disso. {mono('program')} também grava a raiz ({mono('parse_root = $$')}), e é o que
        {mono('main')} usa; as regras de expressão, a lista de expressões e {mono('assignment_rest')} ajustam o campo{' '}
        {mono('flag')} do nó (ver abaixo); e {mono('command_expression')} tem um bloco a mais com a checagem S3.
      </P>
      <Why>
        {mono('program: before_main')} não tem uma folha para o fim do arquivo. A BNF escreve {mono('<before_main> EOF')}, mas o
        fim do arquivo não é um token do lexer: o Bison o chama de {mono('$end')} e o trata sozinho. Por isso a árvore tem
        o nó {mono('program')} com um único filho.
      </Why>

      <H2 title="As regras por área" />
      <P>
        Todos os não terminais da BNF, agrupados. Os nomes são os de {mono('docs/BNF.txt')}, que tem o texto completo de cada regra; as
        regras de erro estão em <PageLink to="compilador/modo-panico">Modo pânico</PageLink>.
      </P>
      <Table
        head={['Área', 'Não terminais', 'Como estão escritos']}
        rows={[
          [
            'Estrutura do programa',
            <>{mono('program')}, {mono('before_main')}, {mono('after_func')}, {mono('after_main')}, {mono('global_no_func')}</>,
            <>
              Itens globais em qualquer ordem, com exatamente uma {mono('main')}. {mono('FUNC')} é fatorado: depois dele, {mono('MAIN')} (a
              função principal) ou {mono('IDENTIFIER')} (uma função comum) decide. Depois da {mono('main')}, {mono('after_main')} não
              aceita {mono('MAIN')}, e isso garante que ela é única.
            </>,
          ],
          [
            'Declarações',
            <>{mono('variable_declaration')}, {mono('variable_rest')}, {mono('initializer')}, {mono('constant_declaration')}, {mono('constant_rest')}, {mono('identifier_list')}, {mono('identifier_list_rest')}, {mono('rhs')}</>,
            <>
              {mono('variable_rest')} é {mono('COLON type initializer')} ou {mono('ASSIGN rhs')}, o que permite omitir o tipo ou o valor, mas
              não os dois. {mono('const')} usa {mono('expression_list')} e não {mono('rhs')}, então não aceita {mono('call')} nem {mono('run')}.{' '}
              {mono('rhs')} é {mono('CALL IDENTIFIER ( args )')}, {mono('RUN object_literal')} ou uma lista de expressões.
            </>,
          ],
          [
            'Tipos',
            mono('type'),
            <>Os cinco tipos simples e {mono('TYPE_LIST < type >')}, recursivo.</>,
          ],
          [
            'Funções e workflows',
            <>{mono('workflow')}, {mono('function_rest')}, {mono('parameter_list')}, {mono('parameters')}, {mono('parameters_rest')}, {mono('parameter')}, {mono('return_type')}</>,
            <>
              Função e workflow partilham tudo depois do nome: {mono('function_rest')} é parâmetros, tipo de retorno opcional e bloco.
            </>,
          ],
          [
            'Comandos',
            <>
              {mono('block')}, {mono('commands')}, {mono('command')}, {mono('command_if')}, {mono('else_part')}, {mono('command_while')}, {mono('command_for')},{' '}
              {mono('command_return')}, {mono('return_values')}, {mono('command_break')}, {mono('command_continue')}, {mono('command_error')},{' '}
              {mono('error_action')}, {mono('command_expression')}, {mono('assignment_rest')}
            </>,
            <>
              {mono('commands')} é uma lista recursiva à direita. {mono('command')} tem as dez alternativas da BNF e mais duas de
              recuperação. Uma chamada, uma atribuição e uma atribuição múltipla começam por uma expressão, então{' '}
              {mono('command_expression')} lê a expressão primeiro e deixa o {mono('assignment_rest')} (um {mono('=')}, uma vírgula ou nada) decidir.
            </>,
          ],
          [
            'Expressões',
            <>
              {mono('expression')}, {mono('or_expr')}, {mono('and_expr')}, {mono('equality_expr')}, {mono('relational_expr')}, {mono('additive_expr')},{' '}
              {mono('multiplicative_expr')}, {mono('unary_expr')}, {mono('postfix_expr')}, {mono('primary')} e as regras {mono('*_rest')} e {mono('*_op')} de cada nível
            </>,
            <>Um não terminal por nível de precedência, ver a tabela abaixo.</>,
          ],
          [
            'Listas, objetos e argumentos',
            <>
              {mono('list_literal')}, {mono('list_items')}, {mono('list_rest')}, {mono('list_after_comma')}, {mono('object_literal')}, {mono('object_items')},{' '}
              {mono('fields_rest')}, {mono('fields_after_comma')}, {mono('field')}, {mono('field_key')}, {mono('expression_list')}, {mono('expression_list_rest')}, {mono('args')}
            </>,
            <>
              Listas e objetos aceitam vírgula final ({mono('[1, 2,]')}), por isso têm o par {mono('*_rest')} e {mono('*_after_comma')} em vez de
              reusar {mono('expression_list')}, que é a lista dos lugares onde a vírgula final não vale (retorno, {mono('rhs')} e argumentos).
            </>,
          ],
        ]}
      />
      <H3 title="Os oito níveis de expressão" />
      <Table
        head={['Nível', 'Não terminais', 'Operadores', 'Observação']}
        rows={[
          ['1 (mais baixo)', <>{mono('or_expr')}, {mono('or_rest')}</>, mono('||'), 'Recursão à direita; a associatividade à esquerda aparece na árvore de derivação como a cadeia de nós or_rest.'],
          ['2', <>{mono('and_expr')}, {mono('and_rest')}</>, mono('&&'), ''],
          ['3', <>{mono('equality_expr')}, {mono('equality_rest')}, {mono('equality_op')}</>, <>{mono('==')} {mono('!=')}</>, ''],
          ['4', <>{mono('relational_expr')}, {mono('relational_rest')}, {mono('relational_op')}</>, <>{mono('<')} {mono('>')} {mono('<=')} {mono('>=')}</>, ''],
          ['5', <>{mono('additive_expr')}, {mono('additive_rest')}, {mono('additive_op')}</>, <>{mono('+')} {mono('-')}</>, ''],
          ['6', <>{mono('multiplicative_expr')}, {mono('multiplicative_rest')}, {mono('multiplicative_op')}</>, <>{mono('*')} {mono('/')} {mono('%')}</>, ''],
          ['7', <>{mono('unary_expr')}, {mono('unary_op')}</>, <>{mono('!')} {mono('-')} (prefixos)</>, <>{mono('unary_expr: unary_op unary_expr')} ou {mono('postfix_expr')}.</>],
          ['8 (mais alto)', <>{mono('postfix_expr')}, {mono('postfix_rest')}, {mono('primary')}</>, <>{mono('.campo')} {mono('[índice]')} {mono('(argumentos)')}</>, <>{mono('postfix_rest')} repete os sufixos; {mono('primary')} são os literais, o identificador, a expressão entre parênteses, as listas e os objetos.</>],
        ]}
      />
      <P>
        {mono('expression')} é só {mono('or_expr')}. Uma expressão simples como {mono('x')} desce pelos oito níveis até
        {mono('primary')}, e cada nível deixa o seu nó na árvore, com os filhos ε dos {mono('*_rest')}.
      </P>

      <H2 title="A checagem S3 e o campo flag" />
      <P>
        S3 é o erro de atribuição a algo que não é variável, campo ou índice. Ele não está na gramática, e sim nas ações. A
        razão é a própria gramática: uma chamada, uma atribuição e uma atribuição múltipla começam todas por uma expressão, e o
        próximo token ({mono('=')}, vírgula ou {mono(';')}) é que diz qual é o comando. Então a gramática aceita qualquer
        expressão à esquerda do {mono('=')}, e a ação rejeita o que não vale.
      </P>
      <P>
        Para saber se uma expressão pode receber um valor, cada nó de expressão carrega o campo {mono('flag')} (um {mono('int')}
        de {mono('Node')}, descrito em {mono('tree.h')} como de uso interno do parser). O valor 1 quer dizer "pode receber atribuição".
        Nos nós {mono('*_rest')}, ele quer dizer "apareceu um operador". As ações calculam assim:
      </P>
      <Table
        head={['Nó', 'Valor de flag']}
        rows={[
          [<>{mono('primary')} com {mono('IDENTIFIER')}</>, '1'],
          [<>{mono('primary')} com literal, {mono('( expressão )')}, lista ou objeto</>, '0'],
          [mono('postfix_rest'), <>O tipo do último sufixo: {mono('SUFFIX_NONE')} (0) para ε, {mono('SUFFIX_ACCESS')} (1) para {mono('.campo')} e {mono('[índice]')}, {mono('SUFFIX_CALL')} (2) para {mono('(argumentos)')}. Um sufixo que tem outro depois herda o do último.</>],
          [mono('postfix_expr'), <>Sem sufixo, o do {mono('primary')}; com sufixo, 1 se o último é acesso e 0 se é chamada.</>],
          [mono('unary_expr'), <>Com {mono('!')} ou {mono('-')}, 0; senão, o do {mono('postfix_expr')}.</>],
          [<>{mono('or_rest')}, {mono('and_rest')}, {mono('equality_rest')}, {mono('relational_rest')}, {mono('additive_rest')}, {mono('multiplicative_rest')}</>, <>1 quando há operador (a alternativa não vazia), 0 para ε.</>],
          [<>{mono('or_expr')}, {mono('and_expr')}, {mono('equality_expr')}, {mono('relational_expr')}, {mono('additive_expr')}, {mono('multiplicative_expr')}</>, <>1 só se o primeiro operando pode receber valor e o {mono('*_rest')} não tem operador.</>],
          [mono('expression'), <>O do {mono('or_expr')}.</>],
          [<>{mono('expression_list')}, {mono('expression_list_rest')}</>, <>1 só se todas as expressões da lista podem receber valor (o ε vale 1).</>],
          [mono('assignment_rest'), <>0 sem {mono('=')}; 1 para {mono('= rhs')} e para {mono(', lista = rhs')} com a lista toda atribuível; 2 para {mono(', lista = rhs')} com algum item que não pode receber valor.</>],
        ]}
      />
      <P>A ação de {mono('command_expression')} junta as duas pontas:</P>
      <Code lang="text">
        {String.raw`command_expression
  : expression assignment_rest SEMICOLON { $$ = mknode("command_expression", 3, $1, $2, $3); {
    if ($2->flag != 0 && (!$1->flag || $2->flag == 2)) {
      report_error("sintático", assign_loc.first_line, assign_loc.first_column,
                   "Token encontrado: '='\nEsperado: ';' (o lado esquerdo não é variável, campo ou índice)");
    }
  } }
  ;`}
      </Code>
      <P>
        Quer dizer: há uma atribuição ({mono('$2->flag != 0')}) e o primeiro alvo não pode recebê-la ({mono('!$1->flag')}), ou algum alvo da lista
        extra não pode ({mono('$2->flag == 2')}). A posição vem de {mono('assign_loc')}, gravada em {mono('assignment_rest')} com a posição do {mono('=')}
        ({mono('@1')} na atribuição simples, {mono('@3')} na múltipla).
      </P>
      <Why>
        {mono('assign_loc')} existe porque a ação de {mono('command_expression')} roda depois de o {mono('assignment_rest')} já ter sido reduzido, e
        precisa dizer a posição do {mono('=')}, que não é um dos símbolos da regra. É uma variável global de arquivo ({mono('static')}) que a ação
        de {mono('assignment_rest')} sobrescreve a cada atribuição. Já o {mono('flag')} guarda só o último sufixo da expressão pós-fixa, porque é ele
        que decide: {mono('x')}, {mono('obj.a')}, {mono('l[0]')} e {mono('f().x')} recebem valor; {mono('f()')}, {mono('(x)')}, {mono('a + b')} e {mono('10')} não.
      </Why>
      <P>
        O erro S3 só reporta: o comando já terminou, então o parser não entra em recuperação, a árvore continua inteira e o programa é rejeitado
        porque {mono('report_error')} conta o erro. Medido (cada linha dentro de uma {mono('main')}):
      </P>
      <Table
        head={['Comando', 'Resultado']}
        rows={[
          [mono('x = 1;   obj.a = 1;   l[0] = 1;   f().x = 1;   a, b = 1, 2;'), 'Aceitos.'],
          [mono('f() = 1;'), <>S3, apontando para o {mono('=')}.</>],
          [mono('(x) = 1;   a + b = 1;   10 = x;   -x = 1;   l[0]() = 1;'), 'S3, todos.'],
          [mono('a, f() = 1, 2;'), <>S3 (o segundo alvo é uma chamada); a posição é a do {mono('=')}, linha 2 coluna 12 nesse teste.</>],
          [mono('f();'), 'Aceito: é uma chamada como comando (sem atribuição, o flag é 0).'],
        ]}
      />

      <H2 title="Mensagens de erro sintático" />
      <P>
        Com {mono('%define parse.error custom')}, o Bison chama {mono('yyreport_syntax_error')} quando encontra um erro e ainda não
        está em recuperação. Ela recebe o contexto do erro: o token encontrado, a posição dele e a lista dos tokens que o
        estado atual aceitaria. Com isso monta a mensagem em português, no formato de duas linhas das mensagens do
        compilador. O formato completo e as regras de escrita dos tokens estão no catálogo de erros.
      </P>
      <H3 title="Como a lista de esperados vira texto" />
      <Table
        head={['Passo', 'O que a função faz']}
        rows={[
          ['1', <>Pede a lista de tokens esperados ({mono('yypcontext_expected_tokens')}, em ordem de declaração dos {mono('%token')}) e marca cada um num vetor.</>],
          ['2', <>Se todos os tokens de {mono('COMMAND_KEYWORDS')} estão marcados, e também todos os de {mono('EXPRESSION_START')}, troca todos pela palavra {mono('comando')}. Se só os de comando estão, deixa-os como estavam.</>],
          ['3', <>Se não virou {mono('comando')} e todos os tokens de {mono('EXPRESSION_START')} estão marcados, troca-os pela palavra {mono('expressão')}.</>],
          ['4', <>Se todos os de {mono('TYPE_START')} estão marcados, troca-os pela palavra {mono('tipo')}.</>],
          ['5', <>Os que sobraram são escritos um a um por {mono('expected_name')}, depois das palavras de grupo, na ordem de declaração.</>],
          ['6', <>Junta tudo com vírgula, e com {mono('ou')} antes do último. Se o token encontrado é {mono('call')} ou {mono('run')}, acrescenta a explicação entre parênteses.</>],
          ['7', <>Escreve a mensagem na posição do token encontrado. Se a lista de esperados ficou vazia (caso defensivo do código), escreve só a linha do token encontrado.</>],
        ]}
      />
      <Why>
        {mono('comando')} é testado antes de {mono('expressão')} porque o início de um comando inclui o início de uma expressão (um comando pode ser uma
        chamada ou uma atribuição): se a expressão fosse retirada primeiro, os tokens de comando restantes apareceriam um a um.
      </Why>
      <Table
        head={['Vetor', 'Tokens']}
        rows={[
          [mono('EXPRESSION_START'), <>{mono('INT_LITERAL FLOAT_LITERAL STRING_LITERAL TRUE FALSE NULL_LITERAL IDENTIFIER LPAREN LBRACKET LBRACE NOT MINUS')}</>],
          [mono('TYPE_START'), <>{mono('TYPE_INT TYPE_FLOAT TYPE_STRING TYPE_BOOL TYPE_OBJECT TYPE_LIST')}</>],
          [mono('COMMAND_KEYWORDS'), <>{mono('VAR CONST IF WHILE FOR RETURN BREAK CONTINUE STOP ABORT PROCEED')}</>],
        ]}
      />
      <P>Cada vetor termina com um marcador ({mono('YYSYMBOL_YYEMPTY')}) que o laço usa para saber onde parar. Resultados medidos:</P>
      <Code lang="text">
        {`var x:int = ;      Token encontrado: ';'  /  Esperado: expressão, 'call' ou 'run'
var x: = 1;        Token encontrado: '='  /  Esperado: tipo
 ;  (num bloco)    Token encontrado: ';'  /  Esperado: comando ou '}'
x = 1;  (depois da main)
                   Token encontrado: identificador 'x'
                   Esperado: fim do arquivo, 'var', 'const', 'func' ou 'workflow'
call f();  (num bloco)
                   Token encontrado: palavra reservada 'call'
                   Esperado: comando ou '}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)`}
      </Code>
      <Callout kind="aviso">
        Os vetores de grupo e {mono('spelling')} são listas escritas à mão. Se um token novo começa uma expressão, um tipo ou um comando e
        ninguém o põe no vetor correspondente, a mensagem deixa de colapsar o grupo e passa a listar os tokens um a um, sem nenhum erro de compilação.
      </Callout>
      <H3 title="Funções do epílogo" />
      <Fn name="token_name" signature="const char *token_name(int tok)">
        Devolve o nome que o Bison dá ao código de token {mono('tok')}, como {mono('"IDENTIFIER"')} ou {mono('"PLUS"')}, por{' '}
        {mono('yysymbol_name(YYTRANSLATE(tok))')}. Usada por {mono('list_tokens')} no modo {mono('-t')}. Declarada em {mono('fluxc.h')}.
      </Fn>
      <Fn name="yyerror" signature="void yyerror(const char *msg)">
        Imprime {mono('msg')} e uma quebra de linha na saída de erro. Com {mono('parse.error custom')}, os erros de sintaxe não passam por ela:
        o Bison só a usa para falhas que não são de sintaxe, como a memória esgotada da pilha do parser. Não conta o erro em {mono('error_count')}.
      </Fn>
      <Fn name="spelling" signature="static const char *spelling(yysymbol_kind_t s)">
        Devolve como o token {mono('s')} é escrito no código-fonte ({mono('"if"')}, {mono('";"')}, {mono('">="')}), ou {mono('NULL')} para identificadores, literais
        com valor e o fim do arquivo. Um token novo sem um {mono('case')} aqui aparece nas mensagens como {mono("'(null)'")}.
      </Fn>
      <Fn name="is_keyword" signature="static int is_keyword(yysymbol_kind_t s)">
        Diz se {mono('s')} é palavra reservada, pela faixa {mono('YYSYMBOL_VAR')} até {mono('YYSYMBOL_NULL_LITERAL')}: as 18 palavras reservadas, as 6 de tipo e{' '}
        {mono('true')}, {mono('false')} e {mono('null')}. Serve para escrever {mono("palavra reservada 'if'")} em vez de {mono("'if'")}.
      </Fn>
      <Why>
        {mono('is_keyword')} depende da ordem das declarações {mono('%token')}: palavras reservadas, de tipo e literais fixos têm de ficar juntos, entre {mono('VAR')}{' '}
        e {mono('NULL_LITERAL')}, e nenhum outro token pode cair nessa faixa. Um token novo de outro tipo vai depois, e um token novo de palavra reservada vai dentro dela. A
        mesma ordem de declaração é a ordem em que a lista de esperados sai na mensagem.
      </Why>
      <Fn name="expected_name" signature="static const char *expected_name(yysymbol_kind_t s, char *buf, size_t size)">
        Escreve o nome de um token esperado: {mono('fim do arquivo')}, {mono('identificador')}, {mono('número inteiro')}, {mono('número real')} e {mono('texto')}
        para os que não têm grafia fixa; para os demais, a grafia entre aspas simples, montada em {mono('buf')} (de {mono('size')} bytes).
      </Fn>
      <Fn name="found_name" signature="static void found_name(yysymbol_kind_t s, char *buf, size_t size)">
        Escreve o token encontrado em {mono('buf')}. Usa o texto do lexema, que está em {mono('yylval.node->text')} (o valor do token que está sendo
        lido): {mono("identificador 'total'")}, {mono('número inteiro 10')}, {mono('número real 3.14')}, {mono('texto "abc"')} (o texto de uma string
        leva as aspas), e {mono('fim do arquivo')}. Para os demais, {mono("palavra reservada 'if'")} ou o símbolo entre aspas.
      </Fn>
      <Fn name="take_group" signature="static int take_group(int *expected, const yysymbol_kind_t *group)">
        Se todos os tokens de {mono('group')} estão marcados em {mono('expected')}, desmarca todos e devolve 1; senão não muda nada e devolve 0.
      </Fn>
      <Fn name="yyreport_syntax_error" signature="int yyreport_syntax_error(const yypcontext_t *ctx)">
        Chamada pelo Bison em cada erro de sintaxe fora de recuperação. Faz os sete passos da tabela acima e chama {mono('report_error')} com a classe{' '}
        {mono('"sintático"')} e a posição do token encontrado ({mono('yypcontext_location')}). Devolve 0 (o Bison segue a recuperação). Usa vetores de tamanho fixo.
        O texto do token encontrado (256 caracteres) é montado por {mono('found_name')} com {mono('snprintf')}, então é truncado e nunca estoura. Sem verificação de
        limite estão só a lista dos esperados ({mono('wanted')}, 512 caracteres, montada com {mono('strcat')}) e o vetor de itens da mensagem ({mono('words')}, 40 posições).
      </Fn>
      <P>
        O Bison não chama {mono('yyreport_syntax_error')} quando o próprio lexer devolve {mono('YYerror')} (erro léxico), nem enquanto um erro anterior
        ainda está em recuperação sem {mono('yyerrok')}; ver <PageLink to="compilador/modo-panico">Modo pânico</PageLink>.
      </P>

      <H2 title="O que atualizar ao criar um token" />
      <Table
        head={['Onde', 'O que fazer']}
        rows={[
          [mono('lexer.l'), <>A regra do token, terminando em {mono('RET(NOME)')}, antes de {mono('{ID}')} se for palavra reservada.</>],
          [mono('parser.y, %token'), <>A declaração {mono('%token <node> NOME')}, no grupo certo. Palavra reservada, de tipo ou literal fixo: dentro da faixa de {mono('is_keyword')}.</>],
          [mono('spelling'), <>Um {mono('case')} com a grafia.</>],
          [<>{mono('EXPRESSION_START')}, {mono('TYPE_START')}, {mono('COMMAND_KEYWORDS')}</>, 'O token, se ele pode começar uma expressão, um tipo ou um comando.'],
          [mono('parser.y, regras'), <>As alternativas com o mesmo formato {mono('mknode')}, sem conflitos.</>],
          [<>{mono('ast_build.c')}, {mono('sema.c')}</>, <>Quem consome o nome do token (o rótulo da folha) para montar a AST e conferir tipos.</>],
        ]}
      />
    </>
  )
}
