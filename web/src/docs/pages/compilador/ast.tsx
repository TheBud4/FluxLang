import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

interface Box {
  x: number
  y: number
  w: number
  label: string
}

function Boxes({ boxes, tone }: { boxes: Box[]; tone: string }) {
  return (
    <>
      {boxes.map((b) => (
        <g key={`${b.x}-${b.y}`}>
          <rect x={b.x} y={b.y} width={b.w} height="28" rx="5" strokeWidth="1.25" className={`fill-bg ${tone}`} />
          <text x={b.x + b.w / 2} y={b.y + 18} fontSize="11" fontFamily="monospace" textAnchor="middle" className="fill-ink">
            {b.label}
          </text>
        </g>
      ))}
    </>
  )
}

function FoldDiagram() {
  const left: Box[] = [
    { x: 10, y: 10, w: 100, label: 'additive_expr' },
    { x: 10, y: 62, w: 100, label: 'a' },
    { x: 130, y: 62, w: 100, label: 'additive_rest' },
    { x: 130, y: 114, w: 100, label: '+ b' },
    { x: 250, y: 114, w: 100, label: 'additive_rest' },
    { x: 250, y: 166, w: 100, label: '+ c' },
    { x: 370, y: 166, w: 100, label: 'additive_rest' },
    { x: 370, y: 218, w: 100, label: 'ε' },
  ]
  const leftLines = [
    'M 60 38 L 60 62',
    'M 60 38 L 180 62',
    'M 180 90 L 180 114',
    'M 180 90 L 300 114',
    'M 300 142 L 300 166',
    'M 300 142 L 420 166',
    'M 420 194 L 420 218',
  ]
  const right: Box[] = [
    { x: 600, y: 10, w: 100, label: 'Binary +' },
    { x: 540, y: 80, w: 100, label: 'Binary +' },
    { x: 680, y: 80, w: 60, label: 'c' },
    { x: 500, y: 150, w: 50, label: 'a' },
    { x: 580, y: 150, w: 50, label: 'b' },
  ]
  const rightLines = ['M 650 38 L 590 80', 'M 650 38 L 710 80', 'M 590 108 L 525 150', 'M 590 108 L 605 150']
  return (
    <svg viewBox="0 0 760 260" width="760" height="260" className="block max-w-none">
      <defs>
        <marker id="seta-ast" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent" />
        </marker>
      </defs>
      {leftLines.map((d) => (
        <path key={d} d={d} fill="none" strokeWidth="1.25" className="stroke-muted" />
      ))}
      {rightLines.map((d) => (
        <path key={d} d={d} fill="none" strokeWidth="1.25" className="stroke-muted" />
      ))}
      <Boxes boxes={left} tone="stroke-line" />
      <Boxes boxes={right} tone="stroke-accent" />
      <path d="M 480 120 L 530 120" fill="none" strokeWidth="1.75" className="stroke-accent" markerEnd="url(#seta-ast)" />
      <text x="500" y="108" fontSize="11" textAnchor="middle" className="fill-accent">
        laço
      </text>
      <text x="10" y="252" fontSize="11" className="fill-muted">
        derivação de a + b + c
      </text>
      <text x="520" y="252" fontSize="11" className="fill-muted">
        AST: associativa à esquerda
      </text>
    </svg>
  )
}

export function Ast() {
  return (
    <>
      <H2 title="O papel da AST" />
      <P>
        A árvore de derivação é fiel à BNF, e por isso é desajeitada para trabalhar: {mono('1 + 2 * 3')} atravessa uma dezena de níveis de
        precedência, cada um com o seu {mono('*_rest')}. A <strong>AST</strong> (árvore sintática abstrata) é a mesma informação sem a burocracia da
        gramática LL(1): {mono('1 + 2 * 3')} vira {mono('Binary(+, 1, Binary(*, 2, 3))')}. O analisador semântico (
        {mono('sema.c')}) e o gerador de C ({mono('codegen_c.c')}) trabalham sobre ela, nunca sobre a árvore de derivação.
      </P>
      <P>
        Os arquivos são {mono('src/semantic/ast.h')} (os tipos), {mono('src/semantic/ast.c')} (a alocação e a impressão do {mono('--ast')}) e{' '}
        {mono('src/semantic/ast_build.c')} (a conversão). No caminho do programa, a AST fica depois do parser e antes da semântica: ver{' '}
        <PageLink to="compilador/visao-geral">Visão geral</PageLink>.
      </P>
      <Table
        head={['Quem', 'O que faz']}
        rows={[
          [<>{mono('main.c')}</>, <>Chama {mono('build_ast(parse_root)')} só se o programa foi aceito (nenhum erro até ali) e se alguma opção precisa da AST: {mono('--ast')}, {mono('--semantic')}, {mono('--c')}, {mono('--build')} ou {mono('--run')}. Chama {mono('ast_print')} com {mono('--ast')}.</>],
          [<>{mono('sema.c')}</>, <>Lê a AST e preenche o campo {mono('type')} de cada expressão. Usa {mono('ast_alloc')} para os próprios escopos e símbolos.</>],
          [<>{mono('codegen_c.c')}</>, <>Lê a AST (já tipada) e escreve o programa em C.</>],
        ]}
      />
      <Why>
        {mono('build_ast')} só roda com a árvore de um programa aceito. Com erro de sintaxe a árvore pode ter nós de erro do modo pânico, e a
        função devolve nulo se achar algum; mas é o {mono('main')} que nem a chama quando houve qualquer erro léxico ou sintático. Assim as
        funções de construção supõem uma árvore com exatamente o formato da BNF e não validam a forma da árvore: nenhuma função emite erro por
        um nó fora do formato (o {mono('is')} trata ponteiro nulo como "não é", e {mono('op_from_token')} cai em {mono('OP_ADD')}
        para um operador desconhecido).
      </Why>
      <Why>
        Os nós da AST nunca são liberados: o compilador roda uma vez por arquivo, e tudo vem da arena. Ver{' '}
        <PageLink to="compilador/arena">Arena de memória</PageLink>. A AST também não aponta para a árvore de derivação: os textos são copiados com{' '}
        {mono('mem_strdup')} e as posições são guardadas por valor.
      </Why>

      <H2 title="As estruturas da AST" />
      <H3 title="Posição e nome" />
      <Table
        head={['Tipo', 'Campos', 'Uso']}
        rows={[
          [mono('Pos'), <>{mono('int line, column')}</>, 'Uma posição no código, copiada do primeiro token do nó.'],
          [mono('Name'), <>{mono('char *name')}, {mono('Pos pos')}</>, 'Um identificador com a posição dele: nomes declarados, nome da função, variável do for, operando do stop/abort/proceed, destino de uma chamada.'],
        ]}
      />

      <H3 title="Expressões" />
      <P>
        Uma expressão é um {mono('Expr')}. Há um só struct para todos os tipos; o campo {mono('kind')} diz quais campos valem.
      </P>
      <Table
        head={['ExprKind', 'Impresso como', 'Campos que valem', 'Posição do nó']}
        rows={[
          [mono('EX_INT'), mono('Int 10'), <>{mono('ival')} ({mono('long')})</>, 'o token'],
          [mono('EX_FLOAT'), mono('Float 1.5'), <>{mono('fval')} ({mono('double')})</>, 'o token'],
          [mono('EX_STRING'), mono('String "ls"'), <>{mono('text')}, com as aspas</>, 'o token'],
          [mono('EX_BOOL'), mono('Bool true'), <>{mono('bval')}</>, 'o token'],
          [mono('EX_NULL'), mono('Null'), 'nenhum', 'o token'],
          [mono('EX_IDENT'), mono('Ident x'), <>{mono('text')}: o nome</>, 'o token'],
          [mono('EX_UNARY'), mono('Unary -'), <>{mono('op')} ({mono('OP_NEG')} ou {mono('OP_NOT')}), {mono('a')}: o operando</>, 'o operador'],
          [mono('EX_BINARY'), mono('Binary +'), <>{mono('op')}, {mono('a')}: esquerda, {mono('b')}: direita</>, 'o operador'],
          [mono('EX_INDEX'), mono('Index'), <>{mono('a')}: a base, {mono('b')}: o índice</>, <>o {mono('[')}</>],
          [mono('EX_FIELD'), mono('Field nome'), <>{mono('a')}: a base, {mono('text')}: o nome do campo</>, 'o nome do campo, depois do ponto'],
          [mono('EX_CALL'), mono('Call'), <>{mono('a')}: quem é chamado, {mono('items')} e {mono('n_items')}: os argumentos</>, 'o começo da expressão chamada'],
          [mono('EX_LIST'), mono('List'), <>{mono('items')} e {mono('n_items')}: os elementos</>, <>o {mono('[')}</>],
          [mono('EX_OBJECT'), mono('Object'), <>{mono('keys')} e {mono('items')}, paralelos, e {mono('n_items')}</>, <>o {mono('{')}</>],
        ]}
      />
      <Table
        head={['Campo de Expr', 'Tipo', 'Significado']}
        rows={[
          [mono('kind'), mono('ExprKind'), 'Qual das 13 formas é.'],
          [mono('pos'), mono('Pos'), 'A posição (coluna da direita da tabela acima), usada nos erros semânticos.'],
          [<>{mono('ival')}, {mono('fval')}, {mono('bval')}</>, <>{mono('long')}, {mono('double')}, {mono('int')}</>, 'Os valores dos literais.'],
          [mono('text'), mono('char *'), <>O texto de {mono('EX_STRING')} (com as aspas, como no código), o nome de {mono('EX_IDENT')} e o nome do campo de {mono('EX_FIELD')}.</>],
          [mono('op'), mono('Op'), <>O operador de {mono('EX_UNARY')} e {mono('EX_BINARY')}.</>],
          [<>{mono('a')}, {mono('b')}</>, mono('Expr *'), <>Os operandos; a base de {mono('EX_INDEX')} e {mono('EX_FIELD')}; o chamado de {mono('EX_CALL')}.</>],
          [<>{mono('items')}, {mono('n_items')}</>, <>{mono('Expr **')}, {mono('int')}</>, <>Os argumentos de uma chamada, os elementos de uma lista e os valores de um objeto.</>],
          [mono('keys'), mono('char **'), <>As chaves de {mono('EX_OBJECT')}, sem aspas, paralelas a {mono('items')}.</>],
          [mono('type'), mono('Type *'), <>Nulo depois do {mono('build_ast')}; preenchido pelo analisador semântico. Ver <PageLink to="compilador/tipos-internos">Tipos internos</PageLink>.</>],
        ]}
      />
      <Table
        head={['Op', 'Símbolo', 'Nível da BNF (do menos para o mais forte)']}
        rows={[
          [mono('OP_OR'), mono('||'), mono('or_expr')],
          [mono('OP_AND'), mono('&&'), mono('and_expr')],
          [<>{mono('OP_EQ')}, {mono('OP_NE')}</>, <>{mono('==')}, {mono('!=')}</>, mono('equality_expr')],
          [<>{mono('OP_LT')}, {mono('OP_LE')}, {mono('OP_GT')}, {mono('OP_GE')}</>, <>{mono('<')}, {mono('<=')}, {mono('>')}, {mono('>=')}</>, mono('relational_expr')],
          [<>{mono('OP_ADD')}, {mono('OP_SUB')}</>, <>{mono('+')}, {mono('-')}</>, mono('additive_expr')],
          [<>{mono('OP_MUL')}, {mono('OP_DIV')}, {mono('OP_MOD')}</>, <>{mono('*')}, {mono('/')}, {mono('%')}</>, mono('multiplicative_expr')],
          [<>{mono('OP_NEG')}, {mono('OP_NOT')}</>, <>{mono('-')}, {mono('!')} (prefixos)</>, mono('unary_expr')],
        ]}
      />

      <H3 title="Comandos" />
      <Table
        head={['StmtKind', 'Impresso como', 'Campos que valem']}
        rows={[
          [mono('ST_VAR'), <>{mono('Var a b :tipo')} ou {mono('Const ...')}</>, <>{mono('is_const')}, {mono('names')} e {mono('n_names')}, {mono('declared')} (o tipo escrito, ou nulo), {mono('rhs')} (pode ser nulo, em {mono('var x: int;')}). Serve também para as globais.</>],
          [mono('ST_ASSIGN'), mono('Assign'), <>{mono('targets')} e {mono('n_targets')}, {mono('rhs')}.</>],
          [mono('ST_IF'), mono('If'), <>{mono('cond')}, {mono('then')} (bloco), {mono('els')} (bloco do else, ou nulo).</>],
          [mono('ST_WHILE'), mono('While'), <>{mono('cond')}, o corpo em {mono('then')}.</>],
          [mono('ST_FOR'), mono('For nome'), <>{mono('var')} (a variável do laço), {mono('cond')} (o iterável, apesar do nome), o corpo em {mono('then')}.</>],
          [mono('ST_RETURN'), mono('Return'), <>{mono('exprs')} e {mono('n_exprs')}: os valores (podem ser nenhum).</>],
          [<>{mono('ST_BREAK')}, {mono('ST_CONTINUE')}</>, <>{mono('Break')}, {mono('Continue')}</>, 'nenhum'],
          [mono('ST_ERRACT'), mono('Stop if e'), <>{mono('act')} ({mono('ACT_STOP')}, {mono('ACT_ABORT')}, {mono('ACT_PROCEED')}) e {mono('var')} (o operando).</>],
          [mono('ST_EXPR'), mono('ExprStmt'), <>{mono('exprs[0]')}: uma expressão, em geral uma chamada. A AST aceita qualquer expressão aqui; as que não são chamada o E24 rejeita depois, na análise semântica (por exemplo, {mono('x + 1;')} chega como {mono('ST_EXPR')}).</>],
          [mono('ST_BLOCK'), mono('Block'), <>{mono('stmts')} e {mono('n_stmts')}.</>],
        ]}
      />
      <P>
        O lado direito de um {mono('=')} (ou do valor inicial de um {mono('var')}) é um {mono('Rhs')}, que tem três formas, escolhidas por{' '}
        {mono('kind')}:
      </P>
      <Table
        head={['RhsKind', 'Impresso como', 'Campos']}
        rows={[
          [mono('RHS_EXPRS'), mono('Values'), <>{mono('exprs')} e {mono('n_exprs')}: uma lista de expressões.</>],
          [mono('RHS_CALL'), mono('CallWorkflow nome'), <>{mono('callee')} (um {mono('Name')}), {mono('args')} e {mono('n_args')}: um {mono('call f(args)')}.</>],
          [mono('RHS_RUN'), mono('Run'), <>{mono('run')}: o literal de objeto que descreve o comando.</>],
          [mono('pos'), 'Os três: a posição do primeiro token do nó de regra do lado direito.'],
        ]}
      />
      <P>O {mono('Stmt')} é um struct só para todos os comandos, e alguns campos servem a mais de um tipo:</P>
      <Table
        head={['Campo de Stmt', 'Serve a']}
        rows={[
          [mono('cond'), <>{mono('ST_IF')}, {mono('ST_WHILE')}: a condição. {mono('ST_FOR')}: o iterável.</>],
          [<>{mono('then')}, {mono('els')}</>, <>{mono('ST_IF')}. O corpo de {mono('ST_WHILE')} e de {mono('ST_FOR')} fica em {mono('then')}.</>],
          [mono('var'), <>{mono('ST_FOR')}: a variável do laço. {mono('ST_ERRACT')}: a variável testada.</>],
          [mono('exprs'), <>{mono('ST_RETURN')}: os valores. {mono('ST_EXPR')}: só {mono('exprs[0]')}.</>],
          [mono('rhs'), <>{mono('ST_VAR')} (pode ser nulo) e {mono('ST_ASSIGN')}.</>],
          [mono('pos'), <>Todos: a posição do primeiro token do nó de regra de onde o comando veio (a regra herda a posição do primeiro filho, em {mono('mknode')}).</>],
        ]}
      />

      <H3 title="Declarações e o programa" />
      <Table
        head={['Tipo', 'Campos', 'Papel']}
        rows={[
          [mono('Param'), <>{mono('Name name')}, {mono('Type *type')}</>, 'Um parâmetro.'],
          [mono('Func'), <>{mono('name')}, {mono('is_workflow')}, {mono('is_main')}, {mono('params')} e {mono('n_params')}, {mono('ret')} (o tipo escrito, ou nulo), {mono('body')} (um {mono('ST_BLOCK')})</>, <>Uma {mono('func')}, um {mono('workflow')} ou o {mono('main')}.</>],
          [mono('Decl'), <>{mono('Stmt *var')}, {mono('Func *func')}</>, 'Um item do nível global: exatamente um dos dois campos é não nulo.'],
          [mono('Program'), <>{mono('decls')} e {mono('n_decls')}, {mono('main')}</>, <>Os itens globais na ordem do arquivo e um atalho para o {mono('main')}.</>],
        ]}
      />
      <Why>
        {mono('Program.decls')} guarda os itens globais na ordem do arquivo, e a ordem importa: um inicializador de global só usa globais
        declarados acima (decisão D3). O analisador semântico depende dela.
      </Why>

      <H2 title="Como a árvore de derivação vira AST" />
      <P>
        Cada regra da BNF vira uma função de construção em {mono('ast_build.c')}, por exemplo {mono('build_var')} para {mono('variable_declaration')}. O
        arquivo lê a árvore pelos filhos, por posição: o filho 0, o filho 1, e assim por diante, exatamente como a regra da BNF os lista. Três
        auxiliares fazem a leitura: {mono('kid(n, i)')} devolve o i-ésimo filho, {mono('is(n, rótulo)')} compara o {mono('label')} com um texto e{' '}
        {mono('filled(n)')} diz se o nó tem conteúdo de verdade (o primeiro filho não é ε).
      </P>
      <H3 title="Os *_rest viram laços" />
      <P>
        A fatoração LL(1) trocou a recursão à esquerda por recursão à direita nos {mono('*_rest')}: o primeiro operando fica no nó pai e os
        demais se aninham, um dentro do outro. A conversão faz o caminho inverso com um {mono('while')} que anda pela cadeia de {mono('*_rest')} enquanto o
        nó tem conteúdo ({mono('filled')}), e a cada passo embrulha o que já tem: o resultado é associativo à esquerda, como a aritmética pede.
      </P>
      <Diagram
        title="A cadeia de additive_rest da árvore de derivação e o Binary associativo à esquerda que o laço monta"
        label="À esquerda, additive_expr tem o filho a e um additive_rest que contém mais bê e outro additive_rest, que contém mais cê e um additive_rest vazio. À direita, a AST: um Binary mais cuja esquerda é um Binary mais de a e b e cuja direita é c."
      >
        <FoldDiagram />
      </Diagram>
      <Code lang="c">
        {`static Expr *build_binary(const Node *n) {
  Expr *left = build_expr(kid(n, 0));
  const Node *rest = kid(n, 1);
  while (filled(rest)) {
    const Node *op = kid(rest, 0);
    const Node *token = op->kind == NODE_TOKEN ? op : kid(op, 0);
    Expr *e = new_expr(EX_BINARY, token);
    e->op = op_from_token(token->label);
    e->a = left;
    e->b = build_expr(kid(rest, 1));
    left = e;
    rest = kid(rest, 2);
  }
  return left;
}`}
      </Code>
      <P>
        Os seis níveis binários ({mono('or_expr')}, {mono('and_expr')}, {mono('equality_expr')}, {mono('relational_expr')}, {mono('additive_expr')},{' '}
        {mono('multiplicative_expr')}) têm a mesma forma e usam a mesma função. Nos dois primeiros o operador é o próprio token ({mono('OR')},{' '}
        {mono('AND')}); nos outros, é um nó de regra ({mono('additive_op')} etc.) cujo primeiro filho é o token. A função cobre as duas formas
        pelo teste {mono('op->kind == NODE_TOKEN')}. A precedência não é calculada: ela já está na profundidade da cadeia da BNF, e{' '}
        {mono('1 + 2 * 3')} dá {mono('Binary +')} com {mono('Binary *')} dentro porque o {mono('*')} fica um nível mais fundo.
      </P>

      <H3 title="Mapa das regras" />
      <Table
        head={['Regra da BNF', 'Vira', 'Como']}
        rows={[
          [<>{mono('expression')}, {mono('or_expr')} até {mono('multiplicative_expr')}</>, mono('EX_BINARY'), <>Laço sobre o {mono('*_rest')}, associativo à esquerda. {mono('expression')} só desce para o filho.</>],
          [mono('unary_expr'), mono('EX_UNARY'), <>{mono('-')} vira {mono('OP_NEG')}, {mono('!')} vira {mono('OP_NOT')}; o operando é outro {mono('unary_expr')}, então {mono('- -z')} aninha.</>],
          [<>{mono('postfix_expr')}, {mono('postfix_rest')}</>, <>{mono('EX_FIELD')}, {mono('EX_INDEX')}, {mono('EX_CALL')}</>, <>Laço que embrulha a base, na ordem em que os sufixos aparecem.</>],
          [mono('primary'), <>literal, {mono('EX_IDENT')}, lista, objeto</>, <>Os parênteses não geram nó: {mono('(a + b)')} devolve a expressão de dentro.</>],
          [<>{mono('list_literal')} e seus {mono('*_rest')}</>, mono('EX_LIST'), <>Aceita vírgula final: {mono('[1, 2,]')} tem dois elementos.</>],
          [<>{mono('object_literal')} e {mono('field')}</>, mono('EX_OBJECT'), <>Chaves e valores em vetores paralelos; a chave string perde as aspas.</>],
          [<>{mono('expression_list')}, {mono('args')}</>, <>{mono('items')} ou {mono('exprs')}</>, <>Um vetor de expressões; {mono('args')} vazio dá vetor nulo e zero itens.</>],
          [<>{mono('variable_declaration')}</>, <>{mono('ST_VAR')}</>, <>Três formas: com tipo e valor, só com tipo, só com valor.</>],
          [<>{mono('constant_declaration')}</>, <>{mono('ST_VAR')} com {mono('is_const')}</>, <>O valor é sempre uma lista de expressões ({mono('RHS_EXPRS')}).</>],
          [<>{mono('command_expression')}</>, <>{mono('ST_EXPR')} ou {mono('ST_ASSIGN')}</>, <>Sem {mono('assignment_rest')} com conteúdo é {mono('ST_EXPR')}; com, é uma atribuição, de um ou de vários alvos.</>],
          [mono('rhs'), mono('Rhs'), <>{mono('call')}, {mono('run')} ou lista de expressões.</>],
          [<>{mono('command_if')}, {mono('command_while')}, {mono('command_for')}</>, <>{mono('ST_IF')}, {mono('ST_WHILE')}, {mono('ST_FOR')}</>, <>Os blocos viram {mono('ST_BLOCK')}; o else é opcional.</>],
          [<>{mono('command_return')}, {mono('command_break')}, {mono('command_continue')}</>, <>{mono('ST_RETURN')}, {mono('ST_BREAK')}, {mono('ST_CONTINUE')}</>, <>{mono('return')} sem valor tem zero expressões.</>],
          [<>{mono('command_error')}</>, mono('ST_ERRACT'), <>A ação vem de {mono('STOP')}, {mono('ABORT')} ou {mono('PROCEED')}; o operando vira {mono('var')}.</>],
          [<>{mono('block')}, {mono('commands')}</>, mono('ST_BLOCK'), <>Percorre o {mono('commands')} recursivo e junta os comandos num vetor.</>],
          [<>{mono('workflow')}, {mono('function_rest')}</>, mono('Func'), <>Os parâmetros, o tipo de retorno e o corpo. O {mono('main')} é feito à parte.</>],
          [mono('type'), mono('Type *'), <>{mono('type_prim')} para os cinco primitivos, {mono('type_list')} para {mono('list<T>')}.</>],
          [<>{mono('before_main')}, {mono('after_func')}, {mono('after_main')}</>, mono('Program'), <>Percorre as três regras, que se chamam em círculo, e junta os itens globais.</>],
        ]}
      />
      <Callout kind="nota">
        Um objeto ou uma lista pode aparecer em qualquer lugar onde uma expressão aparece; já o {mono('run')} só aceita um literal de objeto. Os
        sufixos {mono('.nome')}, {mono('[i]')} e {mono('(args)')} podem se encadear sem limite fixo: {mono('a.b(1)[2].c')} é um {mono('Field')}
        sobre um {mono('Index')} sobre um {mono('Call')} sobre um {mono('Field')}.
      </Callout>

      <H2 title="Funções de ast_build.c" />
      <Fn name="build_ast" signature="Program *build_ast(const Node *root)">
        A única função pública. Converte a árvore de derivação, cuja raiz é o nó {mono('program')}, em um {mono('Program')}. Devolve nulo se{' '}
        {mono('root')} é nulo ou se a árvore tem algum nó de erro (de {mono('has_error_node')}); e, nesses casos, não aloca nada. Do contrário, aloca o {mono('Program')} e anda pelas três regras que se alternam: {mono('before_main')} (globais e funções
        antes do {mono('main')}), {mono('after_func')} (o {mono('main')} ou uma função) e {mono('after_main')} (o que vem depois). Em cada passo trata o item (global,
        função ou {mono('main')}) e passa para o resto da cadeia, até um {mono('after_main')} vazio. As declarações vão para um vetor, na ordem do arquivo, e no
        fim são copiadas por valor para o vetor contíguo {mono('program->decls')}, alocado com {mono('decls.n * sizeof(Decl) + 1')} bytes; o{' '}
        {mono('+ 1')} só evita uma alocação de tamanho zero quando não há nenhuma declaração (o {mono('mem_alloc')} já trata tamanho 0 como 16 bytes,
        então o {mono('+ 1')} não muda o resultado). O {mono('main')} é registrado em {mono('program->main')} e também
        entra em {mono('decls')}. Chamada por {mono('main')}, e só quando ela é necessária.
      </Fn>
      <Fn name="has_error_node" signature="static int has_error_node(const Node *n)">
        Devolve 1 se existe, em qualquer profundidade da subárvore de {mono('n')}, um nó {mono('NODE_ERROR')}; senão 0. É recursiva.
      </Fn>
      <Fn name="push" signature="static void push(Vec *vec, void *p)">
        Acrescenta um ponteiro a um {mono('Vec')}, o vetor genérico de ponteiros do arquivo ({mono('void **v')}, {mono('int n')}, {mono('int cap')}).
        Quando está cheio, dobra a capacidade (começa em 8) com {mono('mem_grow')}. Todas as listas da AST (expressões, nomes, comandos,
        parâmetros, declarações) são montadas num {mono('Vec')} e entregues como {mono('Expr **')}, {mono('Stmt **')} etc.; o vetor vazio fica nulo.
      </Fn>
      <Fn name="build_type" signature="static Type *build_type(const Node *t)">
        Converte um nó {mono('type')}. Se o primeiro filho é {mono('TYPE_INT')}, {mono('TYPE_FLOAT')}, {mono('TYPE_STRING')}, {mono('TYPE_BOOL')} ou{' '}
        {mono('TYPE_OBJECT')}, devolve o tipo primitivo compartilhado de {mono('type_prim')}. Qualquer outro caso é tratado como {mono('list')}: monta um{' '}
        {mono('type_list')} do tipo do terceiro filho (entre o {mono('<')} e o {mono('>')}), recursivamente, então {mono('list<list<int>>')} aninha.
      </Fn>
      <Fn name="op_from_token" signature="static Op op_from_token(const char *label)">
        Procura o nome do token numa tabela fixa ({mono('OR')} dá {mono('OP_OR')}, {mono('AND')}, {mono('EQUAL')}, {mono('NOT_EQUAL')}, {mono('LOWER_THAN')},{' '}
        {mono('LOWER_THAN_EQUAL')}, {mono('GREATER_THAN')}, {mono('GREATER_THAN_EQUAL')}, {mono('PLUS')}, {mono('MINUS')}, {mono('MUL')}, {mono('DIV')},{' '}
        {mono('MOD')}, {mono('NOT')}) e devolve o {mono('Op')}. Se não acha, devolve {mono('OP_ADD')}, caso que a gramática não deixa acontecer. O {mono('-')} e o{' '}
        {mono('!')} prefixos não passam por aqui: {mono('build_unary')} decide o operador direto.
      </Fn>
      <Fn name="build_binary" signature="static Expr *build_binary(const Node *n)">
        O laço da seção anterior, para os seis níveis binários. {mono('n')} tem dois filhos: o operando da esquerda (o nível seguinte) e o{' '}
        {mono('*_rest')}. A cada volta cria um {mono('EX_BINARY')} cuja posição é a do operador, com o resultado até ali como {mono('a')} e o novo operando
        como {mono('b')}. Por isso {mono('1 < 2 < 3')} sai como {mono('(1 < 2) < 3')}.
      </Fn>
      <Fn name="build_expr_list" signature="static void build_expr_list(const Node *list, Vec *out)">
        Converte uma {mono('expression_list')} (uma expressão, mais {mono('COMMA expressão')} repetido) e empurra cada expressão em {mono('out')}.
      </Fn>
      <Fn name="build_args" signature="static void build_args(const Node *args, Vec *out)">
        Converte {mono('args')}: se tem conteúdo, trata a lista de expressões que há dentro; se é ε, não empurra nada.
      </Fn>
      <Fn name="build_list" signature="static Expr *build_list(const Node *lit)">
        Converte um {mono('list_literal')} num {mono('EX_LIST')} posicionado no {mono('[')}. A BNF aceita vírgula final: depois de cada vírgula, o nó{' '}
        {mono('list_after_comma')} pode ser vazio, e então o laço termina sem acrescentar elemento. Uma lista {mono('[]')} fica com {mono('items')} nulo e{' '}
        {mono('n_items')} 0.
      </Fn>
      <Fn name="build_field" signature="static void build_field(const Node *field, Vec *keys, Vec *values)">
        Converte um {mono('field')} de objeto ({mono('chave : expressão')}). A chave é um identificador ou uma string; a string perde as aspas das pontas (o
        texto é deslocado com {mono('memmove')}). Empurra a chave em {mono('keys')} e o valor em {mono('values')}.
      </Fn>
      <Fn name="build_object" signature="static Expr *build_object(const Node *lit)">
        Converte um {mono('object_literal')} num {mono('EX_OBJECT')} posicionado no {mono('{')}, com o mesmo laço de {mono('build_list')} (e a mesma
        vírgula final aceita). {mono('keys')} e {mono('items')} saem paralelos.
      </Fn>
      <Fn name="build_primary" signature="static Expr *build_primary(const Node *n)">
        Converte um {mono('primary')}. Para {mono('(')} devolve a expressão de dentro, sem criar nó; para lista e objeto chama {mono('build_list')} e{' '}
        {mono('build_object')}; para os demais cria o literal ou o {mono('EX_IDENT')}. O inteiro vem de {mono('strtol')} e o real de {mono('strtod')} sobre o
        texto do token; a string guarda o texto com as aspas; o último caso, {mono('TRUE')} ou {mono('FALSE')}, vira {mono('EX_BOOL')}.
      </Fn>
      <Fn name="build_postfix" signature="static Expr *build_postfix(const Node *n)">
        Converte um {mono('postfix_expr')}: começa pelo {mono('primary')} como base e, enquanto há um {mono('postfix_rest')} com conteúdo, embrulha a base no
        sufixo. {mono('DOT')} gera {mono('EX_FIELD')} (posição e nome do identificador), {mono('LBRACKET')} gera {mono('EX_INDEX')} e {mono('LPAREN')} gera{' '}
        {mono('EX_CALL')}, cuja posição é a da base, não a do parêntese. O próximo {mono('postfix_rest')} é sempre o último filho do atual, por isso o laço avança
        com {mono('rest->last_child')}.
      </Fn>
      <Why>
        A posição de um {mono('EX_CALL')} é a do começo da expressão chamada, não a do parêntese, para que os erros de uma chamada apontem para o início dela (por
        exemplo, {mono('f')} em {mono('f(1)')}). Já num {mono('EX_FIELD')} a posição é a do nome depois do ponto, e num {mono('EX_INDEX')}, a do colchete.
      </Why>
      <Fn name="build_unary" signature="static Expr *build_unary(const Node *n)">
        Converte um {mono('unary_expr')}: se o primeiro filho é um {mono('unary_op')}, cria um {mono('EX_UNARY')} ({mono('MINUS')} vira {mono('OP_NEG')}, o outro{' '}
        {mono('OP_NOT')}) e converte o operando, que é outro {mono('unary_expr')}; senão delega a {mono('build_postfix')}.
      </Fn>
      <Fn name="build_expr" signature="static Expr *build_expr(const Node *n)">
        O ponto de entrada das expressões: despacha pelo rótulo do nó. {mono('expression')} desce para o filho; {mono('unary_expr')} e {mono('postfix_expr')} vão
        para as funções delas; todo o resto (os seis níveis binários) vai para {mono('build_binary')}.
      </Fn>
      <Fn name="build_rhs" signature="static Rhs *build_rhs(const Node *rhs)">
        Converte um {mono('rhs')}: {mono('CALL IDENTIFIER ( args )')} gera {mono('RHS_CALL')} com o {mono('callee')} e os argumentos; {mono('RUN objeto')} gera{' '}
        {mono('RHS_RUN')} com o literal de objeto; o resto é uma lista de expressões, {mono('RHS_EXPRS')}. A posição é a do primeiro token do {mono('rhs')}.
      </Fn>
      <Fn name="rhs_from_list" signature="static Rhs *rhs_from_list(const Node *list)">
        Monta um {mono('RHS_EXPRS')} a partir de uma {mono('expression_list')} solta. É o que o {mono('const')} usa, porque a BNF do {mono('const')} não aceita{' '}
        {mono('call')} nem {mono('run')} no valor.
      </Fn>
      <Fn name="build_names" signature="static void build_names(const Node *list, Stmt *s)">
        Converte uma {mono('identifier_list')} e grava em {mono('s->names')} e {mono('s->n_names')} um {mono('Name')} (alocado individualmente) por identificador,
        andando pelo {mono('identifier_list_rest')}.
      </Fn>
      <Fn name="build_var" signature="static Stmt *build_var(const Node *n)">
        Converte uma {mono('variable_declaration')} num {mono('ST_VAR')}. A parte depois dos nomes tem duas formas: {mono(': tipo')} seguido de um valor opcional
        (grava {mono('declared')} e, se há {mono('= valor')}, {mono('rhs')}), ou só {mono('= valor')} (sem tipo, só {mono('rhs')}). Sem valor, {mono('rhs')} fica nulo.
        Serve ao {mono('var')} local e ao global.
      </Fn>
      <Fn name="build_const" signature="static Stmt *build_const(const Node *n)">
        Converte uma {mono('constant_declaration')} num {mono('ST_VAR')} com {mono('is_const')} em 1. O tipo é opcional ({mono('const k: int = 1;')} ou{' '}
        {mono('const k = 1;')}); o valor é sempre uma lista de expressões, via {mono('rhs_from_list')}.
      </Fn>
      <Fn name="build_expression_stmt" signature="static Stmt *build_expression_stmt(const Node *n)">
        Converte um {mono('command_expression')}. Se o {mono('assignment_rest')} é vazio, o comando é só a expressão: cria um {mono('ST_EXPR')} com um vetor de um
        elemento. Se não, é uma atribuição, {mono('ST_ASSIGN')}: o primeiro alvo é a primeira expressão, e a forma {mono('a, b = ...')} acrescenta os demais alvos de
        uma lista de expressões; o {mono('rhs')} vem depois do {mono('=')}. A conversão não confere se o alvo pode receber valor: isso já foi barrado no parser (S3).
      </Fn>
      <Fn name="build_command" signature="static Stmt *build_command(const Node *cmd)">
        Despacha um nó {mono('command')} pelo rótulo do filho: declaração, constante, expressão, {mono('if')}, {mono('while')}, {mono('for')}, {mono('return')},{' '}
        {mono('break')}, {mono('continue')} e, por exclusão, {mono('command_error')}. O {mono('if')} e o {mono('else')} viram {mono('then')} e {mono('els')}; o laço guarda o corpo em{' '}
        {mono('then')}. O {mono('return')} sem valores devolve zero expressões.
      </Fn>
      <Fn name="build_block" signature="static Stmt *build_block(const Node *block)">
        Converte um {mono('block')} num {mono('ST_BLOCK')}, andando pela cadeia recursiva {mono('commands')} e empurrando um comando por volta.
      </Fn>
      <Fn name="build_func" signature="static Func *build_func(const Node *name, const Node *rest, int is_workflow)">
        Converte uma função ou um workflow. {mono('name')} é o token do nome e {mono('rest')} o nó {mono('function_rest')}, com os parênteses, os parâmetros, o tipo de
        retorno opcional e o bloco. Cada parâmetro vira um {mono('Param')} com o nome e o tipo. O {mono('main')} não passa por aqui.
      </Fn>
      <Fn name="add_decl" signature="static void add_decl(Vec *decls, Stmt *var, Func *func)">
        Cria um {mono('Decl')} com um dos dois campos e o empurra em {mono('decls')}.
      </Fn>
      <Fn name="add_global" signature="static void add_global(Vec *decls, const Node *g)">
        Converte um {mono('global_no_func')} (uma {mono('var')}, uma {mono('const')} ou um {mono('workflow')}) e o acrescenta aos itens globais.
      </Fn>
      <P>Os auxiliares triviais:</P>
      <Table
        head={['Função', 'O que faz']}
        rows={[
          [mono('kid(n, i)'), <>O i-ésimo filho de {mono('n')}, ou nulo se não existe.</>],
          [mono('is(n, label)'), <>Verdadeiro se {mono('n')} existe e o {mono('label')} é igual ao texto dado.</>],
          [mono('filled(n)'), <>Verdadeiro se o primeiro filho de {mono('n')} existe e não é ε. Distingue um {mono('*_rest')} que continua de um que acabou.</>],
          [mono('pos_of(n)'), <>A posição de {mono('n')} como {mono('Pos')}.</>],
          [mono('dup(s)'), <>Atalho para {mono('mem_strdup')}.</>],
          [mono('new_expr(kind, at)'), <>Aloca um {mono('Expr')}, grava o tipo e a posição de {mono('at')}.</>],
          [mono('new_stmt(kind, at)'), <>O mesmo, para {mono('Stmt')}.</>],
          [mono('make_name(token)'), <>Monta um {mono('Name')} com o texto do token copiado e a posição dele.</>],
        ]}
      />

      <H2 title="Funções de ast.c" />
      <Fn name="ast_alloc" signature="void *ast_alloc(size_t size)">
        Aloca {mono('size')} bytes da arena, zerados. É um {mono('mem_alloc')} com outro nome, declarado em {mono('ast.h')} para quem constrói a AST. Chamada por{' '}
        {mono('ast_build.c')} e também por {mono('sema.c')}, para os escopos e os símbolos.
      </Fn>
      <Fn name="ast_print" signature="void ast_print(const Program *program, FILE *out)">
        Imprime a AST indentada em {mono('out')}, um nó por linha: a palavra {mono('Program')} e, a um nível de recuo, cada declaração global na ordem do arquivo
        (variável pelo {mono('print_stmt')}, função pelo {mono('print_func')}). Só é chamada por {mono('main')}, com a opção {mono('--ast')} e se {mono('build_ast')}
        devolveu uma AST. O formato está em "A opção --ast".
      </Fn>
      <Fn name="print_func" signature="static void print_func(const Func *f, int depth, FILE *out)">
        Imprime o cabeçalho da função: {mono('Func')} ou {mono('Workflow')}, o nome e, entre parênteses, cada parâmetro como {mono('nome:tipo')}, separados por vírgula e
        espaço; depois o tipo de retorno, {mono(' :tipo')}, se há; em seguida o corpo, como um {mono('Block')}.
      </Fn>
      <Fn name="print_stmt" signature="static void print_stmt(const Stmt *s, int depth, FILE *out)">
        Imprime um comando conforme o tipo, na forma da tabela de comandos acima. Imprime o {mono('Else')} com o bloco dele um nível mais fundo, e o corpo dos laços
        como um {mono('Block')} logo depois da condição. Chama {mono('print_expr')}, {mono('print_exprs')}, {mono('print_rhs')} e {mono('print_block')}.
      </Fn>
      <Fn name="print_expr" signature="static void print_expr(const Expr *e, int depth, FILE *out)">
        Imprime uma expressão e, recursivamente, os operandos um nível mais fundo. {mono('Object')} imprime cada chave numa linha {mono('Key nome')}, com o valor um
        nível abaixo. O real sai no formato curto do {mono('printf')} para {mono('double')}, então {mono('1.50')} aparece como {mono('1.5')}.
      </Fn>
      <Fn name="print_rhs" signature="static void print_rhs(const Rhs *r, int depth, FILE *out)">
        Imprime um lado direito: {mono('Values')} com as expressões, {mono('CallWorkflow nome')} com os argumentos, ou {mono('Run')} com o literal de objeto.
      </Fn>
      <Fn name="print_block" signature="static void print_block(const Stmt *s, int depth, FILE *out)">
        Imprime {mono('Block')} e os comandos do bloco, um nível mais fundo.
      </Fn>
      <Fn name="print_exprs" signature="static void print_exprs(Expr **items, int n, int depth, FILE *out)">
        Imprime {mono('n')} expressões consecutivas, no mesmo nível.
      </Fn>
      <Fn name="print_type" signature="static void print_type(FILE *out, const Type *t)">
        Escreve o nome do tipo ({mono('int')}, {mono('list<string>')}), por {mono('type_name')}, num buffer local de 128 bytes.
      </Fn>
      <Fn name="op_name" signature="static const char *op_name(Op op)">
        O símbolo de um {mono('Op')}, para o {mono('Unary')} e o {mono('Binary')}. {mono('OP_NEG')} e {mono('OP_SUB')} dão {mono('-')}; qualquer valor fora da tabela
        cai em {mono('!')}.
      </Fn>
      <Fn name="indent" signature="static void indent(FILE *out, int depth)">
        Escreve dois espaços por nível de profundidade.
      </Fn>

      <H2 title="A opção --ast" />
      <P>
        {mono('./flux --ast arquivo.flux')} imprime a AST em {mono('stdout')} e depois a linha de aceito. Se o programa foi rejeitado por erro léxico ou sintático,
        não há AST e só sai {mono('Programa rejeitado.')}. A saída abaixo é a real, para um programa com uma constante, uma variável sem valor, um workflow, uma
        função e o {mono('main')} (ele tem um {mono('run')}, uma atribuição de dois alvos com {mono('call')}, uma chamada como comando e um {mono('proceed')}):
      </P>
      <Code lang="flux">
        {`const limite: int = 10;
var nome: string;
workflow deploy(alvo: string, vezes: int): list<string> {
  return [alvo], 1;
}
func soma(a: int, b: int): int {
  return a + b;
}
func main() {
  var r, e = run { cmd: "ls" };
  a, b.c = call deploy("x", 2);
  soma(1, 2);
  proceed if e;
}
const k = 2;`}
      </Code>
      <Code lang="text">
        {`$ ./flux --ast g.flux
Program
  Const limite :int
    Values
      Int 10
  Var nome :string
  Workflow deploy(alvo:string, vezes:int) :list<string>
    Block
      Return
        List
          Ident alvo
        Int 1
  Func soma(a:int, b:int) :int
    Block
      Return
        Binary +
          Ident a
          Ident b
  Func main()
    Block
      Var r e
        Run
          Object
            Key cmd
              String "ls"
      Assign
        Targets
          Ident a
          Field c
            Ident b
        CallWorkflow deploy
          String "x"
          Int 2
      ExprStmt
        Call
          Ident soma
          Int 1
          Int 2
      Proceed if e
  Const k
    Values
      Int 2
Programa aceito.`}
      </Code>
      <P>
        Cada nível de profundidade são dois espaços, e a ordem das declarações é a do arquivo. Há várias particularidades de impressão: o {mono('main')} sai como{' '}
        {mono('Func main()')} (a flag {mono('is_main')} não aparece); as chaves de objeto saem sem aspas, enquanto uma string de expressão sai com as aspas do código; a{' '}
        {mono('Targets')} e o lado direito de uma atribuição são irmãos sob {mono('Assign')}; e o {mono('Else')} aparece com o bloco um nível abaixo. O nome do campo de{' '}
        {mono('b.c')} é {mono('Field c')} e a base é o filho. Aqui estão os efeitos do laço dos binários e das expressões compostas (resultado real):
      </P>
      <Code lang="flux">
        {`func main() {
  var x = 1 < 2 < 3;
  var y = - -z;
  var w = (a + b) * c;
  var s = -1;
  var f = a.b(1)[2].c;
}`}
      </Code>
      <Code lang="text">
        {`$ ./flux --ast h.flux
Program
  Func main()
    Block
      Var x
        Values
          Binary <
            Binary <
              Int 1
              Int 2
            Int 3
      Var y
        Values
          Unary -
            Unary -
              Ident z
      Var w
        Values
          Binary *
            Binary +
              Ident a
              Ident b
            Ident c
      Var s
        Values
          Unary -
            Int 1
      Var f
        Values
          Field c
            Index
              Call
                Field b
                  Ident a
                Int 1
              Int 2
Programa aceito.`}
      </Code>
      <Callout kind="nota">
        {mono('-1')} é um {mono('Unary -')} sobre {mono('Int 1')}: a AST não dobra o literal. E os parênteses de {mono('(a + b) * c')} somem; a ordem de cálculo fica
        na forma da árvore.
      </Callout>
      <P>
        Com {mono('--semantic')}, a AST é impressa mesmo se a análise semântica relatar erro (a mensagem sai em {mono('stderr')} e a última linha é{' '}
        {mono('Programa rejeitado.')}), desde que o programa passe pelo parser. Os casos de teste da AST estão em {mono('tests/ast/')} e a árvore de derivação, que
        é a entrada, em <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink>.
      </P>

      <H2 title="O que a AST descarta" />
      <Table
        head={['Da árvore de derivação', 'O que acontece na AST']}
        rows={[
          [<>Os {mono('*_rest')} e {mono('*_after_comma')}</>, 'Viram laços e vetores; os nós desaparecem.'],
          [<>As folhas ε</>, 'Servem só para saber se uma cadeia acabou; não são copiadas.'],
          [<>Os dez níveis de {mono('expression')} até {mono('primary')}</>, <>Só ficam os operadores que de fato apareceram, como {mono('Binary')}. Um literal solto é um único {mono('Int 10')}.</>],
          [<>Pontuação: {mono(';')}, {mono(',')}, {mono(':')}, {mono('=')}, parênteses, chaves, colchetes</>, <>Somem. Os parênteses de agrupamento não deixam nó, e a posição do nó vem do token que o resume (operador, nome, colchete ou chave).</>],
          [<>As palavras-chave {mono('var')}, {mono('const')}, {mono('func')}, {mono('workflow')}, {mono('if')}, {mono('else')}...</>, <>Viram o tipo do nó ({mono('ST_VAR')} com {mono('is_const')}, {mono('Func')} com {mono('is_workflow')}, {mono('ST_IF')}); o texto some.</>],
          [<>Os nós-casca ({mono('command')}, {mono('commands')}, {mono('global_no_func')}, {mono('error_action')}, {mono('unary_op')})</>, 'Viram o próprio comando, o vetor do bloco ou o valor de um campo.'],
          [<>As aspas das chaves de objeto</>, <>Saem de {mono('keys')}; nos valores string as aspas ficam em {mono('text')}.</>],
          [<>Os nós de erro do modo pânico</>, <>Não existem na AST: uma árvore com erro nem é convertida.</>],
        ]}
      />
      <Callout kind="nota">
        A AST também traz o que a árvore de derivação não tem: o inteiro e o real já convertidos para número, os tipos escritos montados como {mono('Type')} e o
        campo {mono('type')} de cada expressão, vazio até a análise semântica.
      </Callout>
    </>
  )
}
