import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

interface Step {
  x: number
  title: string
  note: string
}

function PassesDiagram() {
  const steps: Step[] = [
    { x: 10, title: 'Passada 1', note: 'declarar os globais' },
    { x: 200, title: 'Passada 2', note: 'valores iniciais' },
    { x: 390, title: 'Passada 3', note: 'corpo de cada função' },
    { x: 580, title: 'Fim', note: 'ordenar e imprimir' },
  ]
  const raises = ['E2', 'E1, E23, E4, E8', 'quase todos os demais', 'report_error']
  return (
    <svg viewBox="0 0 770 150" width="770" height="150" className="block max-w-none">
      <defs>
        <marker id="seta-sema" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent" />
        </marker>
      </defs>
      {steps.map((s, i) => (
        <g key={s.title}>
          <rect x={s.x} y="20" width="170" height="70" rx="6" strokeWidth="1.25" className="fill-bg stroke-line" />
          <text x={s.x + 85} y="46" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-ink">
            {s.title}
          </text>
          <text x={s.x + 85} y="66" fontSize="11" textAnchor="middle" className="fill-ink">
            {s.note}
          </text>
          <text x={s.x + 85} y="116" fontSize="11" fontFamily="monospace" textAnchor="middle" className="fill-muted">
            {raises[i]}
          </text>
          {i < steps.length - 1 && (
            <path d={`M ${s.x + 172} 55 L ${s.x + 198} 55`} fill="none" strokeWidth="1.75" className="stroke-accent" markerEnd="url(#seta-sema)" />
          )}
        </g>
      ))}
      <text x="10" y="144" fontSize="11" className="fill-muted">
        em semantic_check, nesta ordem; os erros vão para um buffer
      </text>
    </svg>
  )
}

export function Semantica() {
  return (
    <>
      <H2 title="O papel da análise semântica" />
      <P>
        {mono('src/semantic/sema.c')} confere o que a gramática não consegue: se os nomes existem, se os tipos combinam, se um caminho do programa termina como deve. Ela implementa os erros E1 a E24 do
        catálogo ({mono('docs/ERROS.md')}, seção 4) e, de passagem, preenche o campo {mono('type')} das expressões da AST, que o gerador de C usa depois.
      </P>
      <Table
        head={['', 'Detalhe']}
        rows={[
          ['Entrada', <>O {mono('Program')} da AST (ver <PageLink to="compilador/ast">AST</PageLink>), só se o programa foi aceito pela análise léxica e sintática.</>],
          ['Chamada', <>{mono('main')} chama {mono('semantic_check(program)')} quando a opção pede análise semântica ({mono('--semantic')}, ou {mono('--c')}, {mono('--build')} e {mono('--run')}, que a ligam). A interface web também a liga.</>],
          ['Saída', <>Mensagens {mono('Erro semântico [linha L, coluna C]:')} por {mono('report_error')}, e os campos {mono('Expr.type')} preenchidos. {mono('semantic_check')} devolve a quantidade de erros, mas {mono('main')} ignora o valor: o que decide aceito ou rejeitado é o contador de {mono('report_error')}.</>],
          ['Depende de', <>{mono('ast.h')}, {mono('types.h')} (ver <PageLink to="compilador/tipos-internos">Tipos internos</PageLink>), {mono('fluxc.h')} ({mono('report_error')}) e a arena ({mono('mem_alloc')}, {mono('mem_grow')}, via {mono('ast_alloc')}).</>],
          ['Única função pública', <>{mono('int semantic_check(Program *program)')}. Todo o resto do arquivo é {mono('static')}.</>],
        ]}
      />
      <Callout kind="nota">
        Programa com erro léxico ou sintático não chega aqui: {mono('build_ast')} só roda quando não houve nenhum erro, e a análise semântica só roda se houve AST. Com um erro de sintaxe, os erros
        semânticos do mesmo programa ficam invisíveis até o primeiro ser corrigido.
      </Callout>

      <H2 title="O estado do módulo" />
      <P>
        A análise guarda seu estado em variáveis estáticas do arquivo (não há struct de contexto). Elas valem para uma execução de {mono('semantic_check')}; o compilador chama a função uma vez por processo.
      </P>
      <Table
        head={['Variável', 'Tipo', 'Papel']}
        rows={[
          [mono('diags'), mono('Diag *'), <>O buffer de erros ({mono('n_diags')} usados, {mono('cap_diags')} de capacidade). Começa em 32 e dobra com {mono('mem_grow')}.</>],
          [mono('scope'), mono('Scope *'), 'O escopo atual, o topo da pilha de escopos.'],
          [mono('globals'), mono('Scope *'), <>O escopo global. É atribuída em {mono('semantic_check')} e nunca lida: o escopo global é sempre alcançado pela cadeia de {mono('parent')}.</>],
          [mono('flow'), mono('Flow'), 'O estado de fluxo no ponto atual do programa.'],
          [mono('next_flow_id'), mono('int'), <>O próximo índice de {mono('Flow.init')}; volta a 0 a cada função.</>],
          [mono('cur_func'), mono('Func *'), <>A função cujo corpo está sendo conferido; nulo no nível global (passadas 1 e 2).</>],
          [mono('loop_depth'), mono('int'), <>Quantos {mono('while')}/{mono('for')} envolvem o ponto atual; zero fora de laço.</>],
          [mono('in_global_init'), mono('int'), <>Ligada enquanto o inicializador de um global é conferido. É atribuída e nunca lida.</>],
        ]}
      />
      <H3 title="Diag" />
      <P>
        Um erro guardado: {mono('line')}, {mono('column')}, {mono('order')} (a posição de chegada, usada para desempatar) e {mono('message[300]')}. A mensagem é formatada com {mono('vsnprintf')}, então uma mensagem com mais de 299 caracteres é truncada.
      </P>
      <H3 title="Symbol e SymKind" />
      <Table
        head={['Campo', 'Papel']}
        rows={[
          [mono('name'), 'O nome (ponteiro para o texto da AST, sem cópia).'],
          [mono('kind'), <>{mono('SYM_VAR')} (variável, constante, parâmetro, variável do {mono('for')}), {mono('SYM_FUNC')}, {mono('SYM_WORKFLOW')}, {mono('SYM_LIBFN')} (as quatro conversões) ou {mono('SYM_TERMINAL')}.</>],
          [mono('type'), <>O tipo, só para {mono('SYM_VAR')}. Nulo nas funções, em {mono('terminal')} e nas conversões, e nulo num global cujo inicializador ainda não foi conferido.</>],
          [mono('is_const'), <>Veio de um {mono('const')}: o alvo de uma atribuição vira E6.</>],
          [mono('flow_id'), <>O índice dele em {mono('Flow.init')}, ou -1 se a variável não é rastreada (globais, funções, e locais além do limite).</>],
          [<>{mono('is_err')}, {mono('handled')}, {mono('err_pos')}</>, <>É a variável de erro de um {mono('call')}/{mono('run')}; já foi tratada por {mono('stop if')}, {mono('abort if')} ou {mono('proceed if')}; e a posição de onde ela recebeu o erro, para a mensagem do E9.</>],
          [mono('func'), <>Em {mono('SYM_FUNC')} e {mono('SYM_WORKFLOW')}: a {mono('Func')} da AST (os parâmetros e o tipo de retorno).</>],
          [mono('decl_pos'), 'Onde o nome foi declarado.'],
          [mono('next'), 'O próximo símbolo do mesmo escopo (lista encadeada, o mais novo na frente).'],
        ]}
      />
      <Why>
        {mono('Symbol.type') } é nulo num global ainda não resolvido de propósito: é assim que {mono('check_ident')} descobre que o nome já foi declarado (passada 1), mas o valor dele ainda não foi conferido (passada 2). Esse
        nulo vira a mensagem {mono('\'b\' só é declarado depois deste ponto.')}, tanto para um nome declarado mais abaixo quanto para o próprio global no seu inicializador ({mono('var g = g + 1;')}).
      </Why>
      <H3 title="Scope" />
      <P>
        Um escopo é a lista de símbolos ({mono('syms')}) e o escopo de fora ({mono('parent')}). Os escopos vêm de {mono('ast_alloc')} e nunca são liberados.
      </P>
      <H3 title="Flow e MAX_SYMS" />
      <P>
        {mono('Flow')} é um vetor de {mono('MAX_SYMS')} (8192) bytes, {mono('init')}, mais o indicador {mono('dead')}. {mono('init[i]')} diz se a variável de {mono('flow_id')} {mono('i')} já tem valor no ponto atual;{' '}
        {mono('dead')} diz que o caminho já terminou em {mono('return')}, {mono('break')} ou {mono('continue')}. O {mono('Flow')} é copiado por valor (8 KB) a cada {mono('if')}, {mono('while')} e {mono('for')}.
      </P>
      <Why>
        {mono('MAX_SYMS')} limita as variáveis locais que o fluxo acompanha numa função. Passando disso, a variável recebe {mono('flow_id')} -1: não é rastreada, e o uso dela antes de ter valor deixa de ser o E3. Medido:
        numa {mono('main')} com 8195 variáveis {mono('var vN:int;')} sem valor, {mono('terminal.log(toString(v0))')} deu o E3 e o uso da última variável, {mono('v8194')}, não deu nada. Os parâmetros ganham o índice sem conferir esse limite.
      </Why>

      <H2 title="As três passadas" />
      <Diagram title="As três passadas" label="Quatro caixas em sequência: passada 1, passada 2, passada 3 e o fim, com o que cada uma levanta.">
        <PassesDiagram />
      </Diagram>
      <P>
        {mono('semantic_check')} zera a contagem de erros, cria o escopo global, põe a biblioteca nele ({mono('declare_library')}) e roda as três passadas sobre {mono('program->decls')}, a lista de itens globais na ordem do arquivo.
      </P>
      <H3 title="Passada 1: declarar os globais" />
      <P>
        Para cada item: uma {mono('func')} ou um {mono('workflow')} (que não é a {mono('main')}) vira um símbolo {mono('SYM_FUNC')} ou {mono('SYM_WORKFLOW')} com o ponteiro {mono('func')}; cada nome de um {mono('var')} ou {mono('const')} vira um {mono('SYM_VAR')} sem
        tipo. É {mono('declare')} que levanta o E2 quando o nome já existe. A {mono('main')} não vira símbolo (e a palavra {mono('main')} é reservada, então ninguém a chama).
      </P>
      <Why>
        A passada 1 existe para que os globais valham em todo o arquivo (decisão D3): uma função pode usar um global ou chamar outra função declarada mais abaixo, porque todos os nomes já estão na tabela antes de qualquer corpo ser conferido. Ela também faz o E2 valer
        para um local que reusa o nome de um global declarado depois dele.
      </Why>
      <H3 title="Passada 2: os inicializadores dos globais" />
      <P>
        Para cada {mono('var')} ou {mono('const')} global, na ordem do arquivo: se não há valor inicial, o E23 (um por nome); depois zera o fluxo, deixa {mono('cur_func')} nulo e chama {mono('check_var(var, 1)')}, que confere o inicializador e grava o tipo nos símbolos da passada 1.
        Como um global só ganha tipo quando chega a sua vez, um inicializador só enxerga os globais declarados acima. As funções não têm essa restrição, pois já foram declaradas por inteiro.
      </P>
      <Why>
        Um inicializador de global só usa globais declarados acima (decisão D3) porque a passada 2 os confere na ordem do arquivo e só grava o tipo de cada global quando chega a vez dele: um global declarado abaixo ainda não tem tipo quando o inicializador é conferido, e vira
        o erro &quot;só é declarado depois deste ponto&quot;. Usar uma função, ao contrário, é permitido (medido: {mono('var x = dobra(3);')} com {mono('dobra')} declarada depois passa): o tipo de uma função vem da AST, não da ordem.
      </Why>
      <H3 title="Passada 3: o corpo de cada função" />
      <P>
        Cada item com {mono('func')} (as funções, os workflows e a {mono('main')}, na ordem do arquivo) vai a {mono('check_func')}. É aqui que mora a maior parte das conferências: tipos, fluxo, {mono('call')} e {mono('run')}.
      </P>
      <P>Um programa e a saída real do compilador mostram as três passadas e a ordenação por posição (o E2 de {mono('terminal')} vem da passada 1, os outros da 2 e da 3, mas saem por linha):</P>
      <Code lang="flux">
        {`var a = b;
var b = 2;
var c:int;
var terminal:int = 1;
func dobra(n:int):int { return n * limite; }
const limite = 10;
func main() {
  var x = dobra(limite);
  var limite = 3;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 9]:
'b' só é declarado depois deste ponto.
Erro semântico [linha 3, coluna 5]:
A variável global 'c' precisa de valor inicial.
Erro semântico [linha 4, coluna 5]:
'terminal' já foi declarada.
Erro semântico [linha 9, coluna 7]:
'limite' já foi declarada.`}
      </Code>
      <P>
        {mono('dobra')} usa {mono('limite')}, declarado depois dela, sem erro. O {mono('var limite')} de dentro da {mono('main')} repete o nome do global.
      </P>
      <Why>
        Depois da passada 3 sai-se do escopo global com {mono('scope_pop')}, mas o E9 nunca dispara ali: um {mono('call')} ou {mono('run')} no nível global já é o E18, e {mono('make_error_var')} só marca uma variável de erro dentro de uma função que pode usar {mono('call')}/{mono('run')}.
      </Why>
      <Why>
        O {mono('qsort')} só roda com mais de um erro porque, com zero ou um, não há o que ordenar, e {mono('diags')} pode ser nulo (nunca foi alocado) quando não houve erro: {mono('qsort')} não aceita ponteiro nulo, nem com zero elementos.
      </Why>

      <H2 title="Escopos e a regra sem shadowing" />
      <P>
        Os escopos formam uma pilha ligada por {mono('parent')}. Durante o corpo de uma função, ela tem, de baixo para cima: o escopo global (a biblioteca e os globais), o escopo dos parâmetros ({mono('check_func')}), o bloco do corpo e um escopo novo para cada bloco e cada {mono('for')} que se abre
        ({mono('check_block')} faz {mono('scope_push')} e {mono('scope_pop')}; o {mono('for')} empilha um a mais, só para a variável do laço).
      </P>
      <Table
        head={['Operação', 'O que faz']}
        rows={[
          [mono('scope_push'), <>Aloca um escopo vazio, com {mono('parent')} no atual, e o torna o atual.</>],
          [mono('scope_pop'), <>Antes de sair, confere o E9 nos símbolos do escopo; depois volta para o {mono('parent')}.</>],
          [mono('lookup'), <>Procura um nome do escopo atual para fora, escopo por escopo; devolve o primeiro símbolo achado, ou nulo.</>],
          [mono('declare'), <>Declara no escopo atual; se {mono('lookup')} já acha o nome em qualquer escopo visível, é o E2 e nada é declarado.</>],
        ]}
      />
      <Why>
        Não há shadowing: {mono('declare')} usa {mono('lookup')} (que procura em todos os escopos de fora) e não só o escopo atual. Por isso um nome interno que repete um externo (um local igual a um parâmetro, a um global, a uma função, a {mono('terminal')} ou a uma conversão) é o E2. O mesmo nome só pode
        ser reusado depois que o escopo que o declarou fecha.
      </Why>
      <Why>
        Os nomes da biblioteca ({mono('terminal')}, {mono('toString')}, {mono('toInt')}, {mono('toFloat')}, {mono('toBool')}) são símbolos do escopo global, declarados por {mono('declare_library')} antes da passada 1. Assim a regra de E2 vale para eles sem caso especial, e uma chamada a eles
        passa pelo mesmo {mono('lookup')} que as funções do usuário. Têm {mono('type')} nulo e kind {mono('SYM_LIBFN')} ou {mono('SYM_TERMINAL')}.
      </Why>
      <Code lang="flux">
        {`func f(p:int) {
  var p = 1;
  if (true) {
    var q = 1;
    if (true) { var q = 2; }
  }
  var q = 3;
  for p2 in [1] { var p2 = 1; }
  var toInt = 1;
}
func main() {}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 7]:
'p' já foi declarada.
Erro semântico [linha 5, coluna 21]:
'q' já foi declarada.
Erro semântico [linha 8, coluna 23]:
'p2' já foi declarada.
Erro semântico [linha 9, coluna 7]:
'toInt' já foi declarada.`}
      </Code>
      <P>
        O {mono('var q = 3;')} da linha 7 passa: o {mono('q')} do {mono('if')} já saiu de cena. O {mono('var q = 2;')} da linha 5 não passa, porque o {mono('q')} do bloco de fora ainda está visível.
      </P>

      <H2 title="Tipagem das expressões" />
      <P>
        O tipo de uma expressão é calculado de baixo para cima por {mono('check_expr')}, que despacha pelo {mono('ExprKind')}, grava o resultado em {mono('e->type')} e o devolve. As funções {mono('check_*')} de cada kind
        conferem as subexpressões e devolvem o tipo do resultado; um erro devolve {mono('T_ERROR')}. Quase toda subexpressão é pedida por {mono('value_of')}, que é {mono('check_expr')} mais a recusa de um valor {mono('T_VOID')} (E13).
      </P>
      <Table
        head={['ExprKind', 'Tipo calculado', 'Erros que pode levantar']}
        rows={[
          [<>{mono('EX_INT')}, {mono('EX_FLOAT')}, {mono('EX_STRING')}, {mono('EX_BOOL')}</>, <>{mono('int')}, {mono('float')}, {mono('string')}, {mono('bool')}.</>, 'nenhum'],
          [mono('EX_NULL'), mono('T_NULL'), 'nenhum'],
          [mono('EX_IDENT'), <>O tipo do símbolo (o {mono('check_ident')} lê o nome).</>, 'E1, E3, E4 (nome de função ou terminal usado como valor), E1 variante (global adiante)'],
          [mono('EX_UNARY'), <>{mono('-')} devolve o tipo do operando (número ou dinâmico); {mono('!')} devolve {mono('bool')}.</>, 'E4'],
          [mono('EX_BINARY'), 'Pela tabela de operadores abaixo.', 'E4, E13'],
          [mono('EX_INDEX'), <>Elemento da lista, ou dinâmico para {mono('object')} e dinâmico.</>, 'E19'],
          [mono('EX_FIELD'), <>Dinâmico, se a base é {mono('object')} ou dinâmica.</>, 'E4'],
          [mono('EX_CALL'), 'O retorno da função, o das conversões ou da biblioteca, o do método.', 'E1, E4, E13, E15, E21, E22'],
          [mono('EX_LIST'), <>{mono('list<T>')}, com o {mono('T')} calculado elemento a elemento.</>, 'E4'],
          [mono('EX_OBJECT'), mono('T_OBJECT'), 'só os erros dos valores de dentro'],
        ]}
      />
      <H3 title="Operadores" />
      <P>
        {mono('check_binary')} implementa a tabela de operadores da seção 3 do README. Se um dos lados é {mono('T_ERROR')}, devolve {mono('T_ERROR')} sem mensagem. Os outros casos:
      </P>
      <Table
        head={['Operador', 'Aceita', 'Resultado']}
        rows={[
          [mono('+'), <>{mono('string')} com {mono('string')}</>, mono('string')],
          [<>{mono('+')}, {mono('-')}, {mono('*')}, {mono('/')}</>, <>número com número ({mono('int')} e {mono('float')} se misturam)</>, <>{mono('float')} se um dos lados é {mono('float')}, senão {mono('int')}</>],
          [mono('%'), <>só {mono('int')} com {mono('int')}</>, mono('int')],
          [<>{mono('<')}, {mono('<=')}, {mono('>')}, {mono('>=')}</>, 'número com número', mono('bool')],
          [<>{mono('==')}, {mono('!=')}</>, <>número com número (decisão D6, {mono('1 == 1.0')}); dois lados do mesmo kind que não sejam {mono('list')} nem {mono('object')}; qualquer coisa com {mono('null')} ou com um lado dinâmico</>, mono('bool')],
          [<>{mono('&&')}, {mono('||')}</>, <>{mono('bool')} com {mono('bool')}</>, mono('bool')],
        ]}
      />
      <P>
        Um operando dinâmico passa nas mesmas condições que o tipo que seria aceito; o resultado de uma operação aritmética com um operando dinâmico é dinâmico ({mono('%')} também), e o de uma comparação ou de um operador lógico continua {mono('bool')}.
        Um {mono('+')} entre dinâmico e {mono('string')} é dinâmico. Fora disso o erro é o E4 {mono('Operador \'+\' não aceita A e B.')} na posição do operador. Mensagens reais de dois programas pequenos com essas operações:
      </P>
      <Code lang="text">
        {`Operador '%' não aceita int e float.
Operador '==' não aceita list<int> e list<int>.
Operador '==' não aceita object e object.
Operador '<' não aceita bool e bool.
Operador '-' não aceita string e string.
Operador '+' não aceita string e int.
Operador '+' não aceita dinâmico e bool.`}
      </Code>
      <Why>
        A comparação {mono('==')} entre {mono('int')} e {mono('float')} é aceita (decisão D6): {mono('1 == 1.0')} é {mono('true')}, e a conferência deixa as duas se compararem. Já listas e objetos não se comparam por {mono('==')}, nem entre dois do mesmo tipo.
      </Why>
      <Why>
        O resultado dinâmico de uma operação com um operando dinâmico (decisão D1) mantém a incerteza: o compilador não sabe o tipo do campo, então não pode afirmar que {mono('o.a + 1')} é {mono('int')}. A conferência real acontece na execução.
      </Why>
      <Callout kind="nota">
        O {mono('+')} de {mono('check_binary')} tem um {mono('fallthrough')} deliberado: se os dois lados não são {mono('string')} (nem um dinâmico com {mono('string')}), o mesmo {mono('case')} cai no teste numérico de {mono('-')}, {mono('*')} e {mono('/')}.
      </Callout>
      <H3 title="Valores dinâmicos (D1)" />
      <P>
        O valor de {mono('o.campo')} e de {mono('o["campo"]')} ({mono('o')} sendo um {mono('object')}) é {mono('T_DYN')}. Ele passa onde um tipo concreto é esperado ({mono('type_assignable')} regra 2), vale como número, texto, condição ou lista, e as operações com ele ficam
        dinâmicas. Uma base dinâmica também aceita {mono('.campo')}, {mono('[i]')} e os métodos {mono('length')}, {mono('push')} e {mono('remove')}. O que o compilador não permite é <em>inferir</em> o tipo de uma variável a partir dele: {mono('var a = user.age;')} é o E8, e o usuário
        declara o tipo ({mono('var a:int = user.age;')}). Ver <PageLink to="compilador/tipos-internos">Tipos internos</PageLink>.
      </P>
      <Why>
        {mono('check_field') } devolve {mono('T_DYN')} sem olhar o nome do campo porque o compilador não sabe o que há dentro de um {mono('object')} (decisão D1); o tipo só se sabe na execução. Se a base não é {mono('object') } nem dinâmica, é o E4 (esperado object).
      </Why>
      <H3 title="Literais de lista e de object" />
      <P>
        {mono('check_list_literal') } calcula o tipo dos elementos juntando um a um. O primeiro elemento dá o tipo inicial. Cada um dos seguintes: se cabe no tipo atual, nada muda; se o tipo atual cabe nele, o tipo atual se alarga (um {mono('null') } vira {mono('int')},
        um {mono('int')} vira {mono('float')}: {mono('[1, 2.5]')} é {mono('list<float>')}); se nenhum cabe no outro, é um E4 no elemento. Um literal vazio é {mono('list<null>')}, e um literal em que todo elemento teve erro é {mono('T_ERROR')}.
        {mono(' check_object_literal')} só confere os valores de dentro com {mono('value_of')} e devolve {mono('T_OBJECT')}: os nomes dos campos não são conferidos (nem repetição).
      </P>
      <Why>
        Um literal de lista é conferido elemento a elemento contra o tipo esperado: {mono('check_assign_to')} trata esse caso antes da regra geral. Por isso {mono('var l:list<float> = [1, 2];')} vale (cada {mono('int')} vira {mono('float')}), embora {mono('[1, 2]')} sozinho seja um {mono('list<int>')},
        que a regra 6 de {mono('type_assignable')} não deixa ir para {mono('list<float>')}. Depois de conferir os elementos, {mono('check_assign_to')} grava o tipo esperado no literal inteiro ({mono('e->type = to')}): esse caminho não passa por {mono('check_expr')}, então ninguém mais daria um tipo ao literal, e o gerador de C lê o {mono('type->elem')} dele para converter
        cada elemento ({mono('int')} em {mono('float')}).
      </Why>
      <H3 title="Chamadas" />
      <P>
        {mono('check_call')} olha o que está do lado esquerdo do parêntese. Um campo ({mono('a.b(...)')}) é um método e vai para {mono('check_method_call')}. Qualquer outra coisa que não seja um nome é o E22 (&quot;Isso não é uma função&quot;). Um nome que não existe é o E1. Senão, o que o nome é decide:
      </P>
      <Table
        head={['O nome é', 'O que acontece', 'Retorno']}
        rows={[
          [mono('SYM_FUNC'), <>{mono('check_args_against')}: quantidade (E21), depois cada argumento contra o tipo do parâmetro (E4).</>, <>o tipo de {mono('ret')}, ou {mono('T_VOID')} sem {mono(':tipo')}</>],
          [mono('SYM_WORKFLOW'), <>E15: &quot;é um workflow e deve ser chamado com &apos;call&apos;&quot;; os argumentos são avaliados.</>, mono('T_ERROR')],
          [mono('SYM_LIBFN'), <>{mono('check_conversion')}.</>, 'o tipo da conversão'],
          [mono('SYM_TERMINAL'), <>E22: {mono('\'terminal\' não é uma função.')}</>, mono('T_ERROR')],
          ['uma variável', <>E22: {mono('\'x\' não é uma função.')}</>, mono('T_ERROR')],
        ]}
      />
      <P>
        Em todos os casos de erro os argumentos ainda são avaliados ({mono('eval_args')}), para que os erros de dentro apareçam. A posição de uma chamada é a do começo da expressão chamada (o nome da função, ou o nome do método depois do ponto), que é
        onde {mono('check_arg_count')} aponta o E21.
      </P>
      <Table
        head={['Método', 'Regras', 'Retorno']}
        rows={[
          [<>{mono('terminal.log')}, {mono('info')}, {mono('warn')}, {mono('error')}</>, <>Exatamente 1 argumento (E21), de qualquer tipo (D4).</>, mono('T_VOID')],
          [mono('terminal.input'), <>0 ou 1 argumento (E21, &quot;espera até 1&quot;); o argumento tem de caber em {mono('string')} (E4).</>, mono('string')],
          [<>{mono('terminal.')}outro</>, <>E22: {mono('\'terminal\' não tem o método \'foo\'.')}</>, mono('T_ERROR')],
          [mono('lista.length()'), '0 argumentos (E21).', mono('int')],
          [mono('lista.push(v)'), <>1 argumento (E21), que tem de caber no tipo dos elementos (E4), a não ser que a lista seja {mono('list<null>')} ou dinâmica.</>, mono('T_VOID')],
          [mono('lista.remove(i)'), <>1 argumento (E21), {mono('int')} ou dinâmico (E4).</>, mono('T_VOID')],
          ['qualquer outro método, ou em outra base', <>E22: {mono('\'l\' não tem o método \'foo\'.')} (também para {mono('object')}, {mono('int')}...).</>, mono('T_ERROR')],
        ]}
      />
      <Why>
        {mono('terminal.log') }, {mono('info')}, {mono('warn')} e {mono('error')} aceitam um argumento de qualquer tipo (decisão D4, &quot;terminal.* com qualquer tipo&quot;): a única conferência é a da quantidade de argumentos.
      </Why>
      <Why>
        Uma base dinâmica aceita {mono('length')}, {mono('push')} e {mono('remove')}, como uma lista, porque um valor dinâmico pode ser uma lista na execução (um campo de {mono('object')} que guarda uma lista); a conferência de verdade é adiada. Com base dinâmica o {mono('push')}
        também não confere o tipo do argumento (não há elemento a comparar).
      </Why>
      <H3 title="Conversões" />
      <P>
        {mono('toString')}, {mono('toInt')}, {mono('toFloat')} e {mono('toBool')} recebem exatamente 1 argumento (E21). {mono('toString')} aceita qualquer tipo e devolve {mono('string')}. As outras só aceitam as entradas da decisão D5 (outra entrada é o E4):
      </P>
      <Table
        head={['Conversão', 'Aceita', 'Devolve']}
        rows={[
          [mono('toInt'), <>{mono('string')} ou {mono('float')}</>, mono('int')],
          [mono('toFloat'), <>{mono('string')} ou {mono('int')}</>, mono('float')],
          [mono('toBool'), <>só {mono('string')}</>, mono('bool')],
          [mono('toString'), 'qualquer tipo', mono('string')],
        ]}
      />
      <Why>
        Com o argumento já com erro ({mono('T_ERROR')}) ou dinâmico, {mono('check_conversion')} não confere nada: o erro já foi dado, ou o tipo só se sabe na execução. O tipo devolvido é o da conversão mesmo assim.
      </Why>

      <H2 title="Comandos" />
      <P>{mono('check_stmt')} despacha pelo {mono('StmtKind')}. Tabela do que cada comando confere:</P>
      <Table
        head={['StmtKind', 'O que confere', 'Erros']}
        rows={[
          [mono('ST_VAR'), <>{mono('check_var')}: inicializador contra o tipo declarado, ou o tipo inferido; quantidade de nomes e valores; só depois, declara os nomes.</>, 'E2, E4, E7, E8, E13 e os das expressões'],
          [mono('ST_ASSIGN'), <>{mono('check_assign')}: cada alvo ({mono('check_target')}) e cada valor contra o tipo do alvo; {mono('call')}/{mono('run')} com dois alvos.</>, 'E1, E4, E6, E7, E17'],
          [mono('ST_EXPR'), <>{mono('check_expr')} da expressão (uma chamada sem valor é aceita aqui). Se não é {mono('EX_CALL')}, é o E24.</>, 'E24 e os da chamada'],
          [mono('ST_BLOCK'), <>{mono('check_block')}: abre um escopo, confere os comandos, fecha.</>, 'os de dentro e o E9'],
          [mono('ST_IF'), <>{mono('check_cond')} (E5); o fluxo é copiado, unido.</>, 'E5'],
          [mono('ST_WHILE'), <>{mono('check_cond')}; o corpo com {mono('loop_depth')} mais 1; o fluxo volta ao de antes.</>, 'E5'],
          [mono('ST_FOR'), <>O iterável tem de ser lista ou dinâmico; a variável do laço ganha o tipo do elemento.</>, 'E16, E2'],
          [mono('ST_RETURN'), <>{mono('check_return')}; depois marca o caminho como terminado.</>, 'E12'],
          [<>{mono('ST_BREAK')}, {mono('ST_CONTINUE')}</>, <>{mono('loop_depth')} tem de ser maior que 0; marcam o caminho como terminado.</>, 'E10'],
          [mono('ST_ERRACT'), <>{mono('stop if')} só em workflow; o operando tem de ser variável de erro; marca-a como tratada.</>, 'E11, E1, E17'],
        ]}
      />
      <H3 title="var e const" />
      <P>
        {mono('check_var')} serve a locais e a globais ({mono('is_global')}). Com tipo declarado, cada valor é conferido contra ele ({mono('check_assign_to')}); sem tipo, o tipo de cada nome é o do valor, e um valor {mono('null')}, dinâmico ou {mono('list<null>')}
        é o E8 (não dá para inferir). Se a quantidade de nomes é diferente da de valores, é o E7 (&quot;2 variáveis e 1 valor.&quot;, com singular e plural). O lado direito {mono('call')}/{mono('run')} dá dois valores, o resultado e o erro:
        exige exatamente 2 nomes, o primeiro recebe o tipo do resultado e o segundo é {mono('string')}. Com tipo declarado, o resultado e a {mono('string')} do erro têm de caber nele.
        Só no fim os nomes entram no escopo: nos locais por {mono('declare')} (E2), e então {mono('check_var')} dá o {mono('flow_id')} e marca a variável como iniciada, se houve valor; nos globais, só se completa o símbolo da passada 1.
      </P>
      <Why>
        Os nomes só entram no escopo depois de conferir o inicializador: {mono('var x = x + 1;')} não enxerga o {mono('x') } novo e dá o E1 (&quot;&apos;x&apos; não foi declarado&quot;), em vez de usar uma variável ainda sem valor.
      </Why>
      <Why>
        Num global, o símbolo já foi declarado na passada 1, então {mono('check_var')} só procura de volta o símbolo pela <em>posição de declaração</em>. Se o nome foi repetido (E2), o símbolo achado tem outra posição, e o nome repetido é pulado: vale a primeira declaração, sem uma segunda mensagem sobre o mesmo nome.
      </Why>
      <Callout kind="nota">
        {mono('check_var')} e {mono('check_assign')} usam vetores de 64 posições para os tipos e símbolos. Uma declaração com mais de 64 nomes (ou uma atribuição com mais de 64 alvos) trata só os 64 primeiros como tipados; os demais ficam {mono('T_ERROR')}.
      </Callout>
      <H3 title="Atribuição" />
      <P>
        {mono('check_target')} dá o tipo esperado de cada alvo: para um nome, o E1 se não existe, o E4 se é função, o E6 se é {mono('const')}, o E1 variante se é global ainda sem tipo; para um campo ou um índice, só avalia a expressão com {mono('check_expr')}.
        Para {mono('call')}/{mono('run')}, são exigidos 2 alvos; o resultado tem de caber no primeiro; o segundo tem de ser um nome (senão E17) cujo tipo aceite {mono('string')}, e ele vira variável de erro. Terminado o comando, todos os nomes atribuídos passam a ter valor ({mono('mark_initialized')}), mesmo se houve erro.
      </P>
      <Why>
        Atribuir a um campo ou a um índice de uma {mono('const')} não é o E6: o conteúdo de um {mono('const')} pode mudar (só o nome não pode ser religado). A base é lida e conferida normalmente, e o E6 só vale para o nome sozinho no alvo.
      </Why>
      <H3 title="return" />
      <P>
        {mono('check_return')} depende de onde estamos ({mono('cur_func')}). Num workflow: dois valores, o primeiro cabendo no {mono('ret')} (ou em {mono('null')}, se não há {mono(':tipo')}) e o segundo cabendo em {mono('string')}; senão &quot;Workflow deve retornar (resultado, erro).&quot; Numa função com {mono(':tipo')}:
        exatamente 1 valor cabendo no tipo. Numa função sem {mono(':tipo')} (e na {mono('main')}): nenhum valor. Se não há função, a conferência é pulada.
      </P>
      <Why>
        {mono('check_return') } começa com {mono('if (!f) return')} só por segurança: o parser não aceita um {mono('return')} fora de uma função, então essa guarda nunca é exercida.
      </Why>
      <Code lang="text">
        {`A função 'a' deve retornar um valor int.            (func a():int { return; })
A função 'b' não retorna valor.                      (func b() { return 1; })
Workflow deve retornar (resultado, erro).            (workflow w1():int { return 1; })
Tipo incompatível: esperado null, encontrado int.    (workflow w3() { return 1, null; })
A função 'main' não retorna valor.                   (func main() { return 1; })`}
      </Code>

      <H2 title="O estado de fluxo: E3, E20, E9, E10" />
      <P>
        O fluxo acompanha o caminho que o programa percorre. O {mono('Flow')} guarda quais variáveis rastreadas já têm valor e se o caminho atual terminou. Ele muda assim:
      </P>
      <Table
        head={['Onde', 'Efeito no fluxo']}
        rows={[
          [mono('check_func'), <>Zera o fluxo (todas sem valor, caminho vivo) e declara cada parâmetro como iniciado.</>],
          [<>{mono('var')} com valor, atribuição</>, <>{mono('mark_initialized')}: a variável passa a ter valor.</>],
          [mono('return'), <>{mono('dead = 1')}.</>],
          [<>{mono('break')}, {mono('continue')}</>, <>{mono('dead = 1')} (e o E10 se não há laço).</>],
          [mono('if'), <>Copia o fluxo, confere o {mono('then')}, volta à cópia, confere o {mono('else')} (se houver) e une os dois com {mono('merge')}.</>],
          [<>{mono('while')}, {mono('for')}</>, <>Guarda o fluxo, confere o corpo, e restaura o guardado: o que o corpo fez é descartado.</>],
          [mono('check_ident'), <>Uma variável rastreada, ainda sem valor, num caminho vivo: E3 (e passa a ter, para a mensagem sair uma só vez).</>],
        ]}
      />
      <Why>
        {mono('merge')} é uma interseção: depois de um {mono('if')}, só vale o que os dois ramos garantem. Uma variável atribuída só dentro do {mono('then')}, sem {mono('else')}, continua sem valor depois. Um ramo que terminou ({mono('dead')}, em {mono('return')}, {mono('break')} ou {mono('continue')}) não restringe nada: o fluxo que sai é o do outro ramo. Se os dois terminam, o caminho continua morto
        (decisão D8: um caminho que termina em {mono('return')}, {mono('break')} ou {mono('continue')} conta).
      </Why>
      <Why>
        Sem {mono('else')}, o fluxo do ramo &quot;falso&quot; é o de antes do {mono('if')}, e é com ele que o do {mono('then')} é unido. Por isso a atribuição dentro de um {mono('if')} sem {mono('else')} nunca vale para depois.
      </Why>
      <Why>
        {mono('while') } e {mono('for')} restauram o fluxo de antes porque o laço pode não rodar nenhuma vez: o que o corpo atribui ou o {mono('return')} dele não vale para o código seguinte. A análise não olha o valor da condição, então {mono('while (true) { return 1; }')} no fim de uma função com {mono(':tipo')} ainda é o E20.
      </Why>
      <Code lang="flux">
        {`func a(c:bool):int {
  if (c) { return 1; }
}
func b(c:bool):int {
  if (c) { return 1; } else { return 2; }
}
func w():int {
  while (true) { return 1; }
}
func main() {
  var x:int;
  var c = true;
  if (c) { x = 1; }
  terminal.log(toString(x));
  terminal.log(toString(x));
  var y:int;
  if (c) { y = 1; } else { y = 2; }
  terminal.log(toString(y));
  var z:int;
  while (c) { z = 1; }
  terminal.log(toString(z));
  var k:int;
  if (c) { k = 1; } else { return; }
  terminal.log(toString(k));
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 6]:
A função 'a' deve retornar int em todos os caminhos.
Erro semântico [linha 7, coluna 6]:
A função 'w' deve retornar int em todos os caminhos.
Erro semântico [linha 14, coluna 25]:
Variável 'x' utilizada antes de ser inicializada.
Erro semântico [linha 21, coluna 25]:
Variável 'z' utilizada antes de ser inicializada.`}
      </Code>
      <P>
        {mono('b') } passa (os dois ramos terminam). {mono('x') } dá o E3 uma vez só, no primeiro uso (a linha 15 não dá). {mono('y') } passa (os dois ramos atribuem). {mono('z') } dá o E3 (o laço pode não rodar). {mono('k') } passa: o ramo do {mono('else')} termina em {mono('return')}, então só o do {mono('then')} chega à linha 24.
        Código depois de um {mono('return')} também não é conferido para o E3, e não é erro.
      </P>
      <H3 title="E20: retorno em todos os caminhos" />
      <P>
        No fim do corpo de uma função, {mono('check_func')} levanta o E20 se a função tem {mono(':tipo')} e o caminho ainda está vivo ({mono('!flow.dead')}), na posição do nome da função. A {mono('main')} e os workflows ficam de fora.
      </P>
      <Why>
        Um workflow não precisa de {mono('return')} em todos os caminhos: um workflow que termina sem {mono('return') } devolve (null, null). Por isso o E20 é só para {mono('func')} com {mono(':tipo')}.
      </Why>
      <H3 title="E9: erro de call ou run não tratado" />
      <P>
        A segunda variável de um {mono('call')} ou {mono('run')} é uma variável de erro: {mono('make_error_var')} a marca ({mono('is_err')}, {mono('handled = 0')}, {mono('err_pos')}), só dentro de uma função que pode usar {mono('call')}/{mono('run')} (workflow ou {mono('main')}). Um {mono('stop if')},
        {mono(' abort if')} ou {mono('proceed if')} sobre ela marca {mono('handled')}. Ao fechar o escopo onde a variável foi declarada, {mono('scope_pop')} levanta o E9 (na posição em que ela recebeu o erro) para toda variável de erro não tratada.
      </P>
      <Why>
        O erro de um {mono('call')}/{mono('run')} tem de ser tratado até o fim do bloco onde foi declarado. {mono('scope_pop')} é o ponto onde esse bloco termina, então é nele que o E9 é conferido; o tratamento dentro de um bloco interno vale (ver o próximo item).
      </Why>
      <Why>
        {mono('handled')} é uma propriedade do símbolo, não do fluxo: um tratamento dentro de um bloco interno ({mono('if (x > 0) { stop if e; }')}) conta para o escopo todo, mesmo que o caminho sem o {mono('if') } não trate o erro. Já uma nova atribuição à variável de erro ({mono('r2, e2 = run ...')}) chama {mono('make_error_var')} de novo e zera {mono('handled')}: o novo erro tem de ser tratado de novo.
      </Why>
      <Code lang="flux">
        {`workflow w(x:int):string {
  var r, e = run { command: "ls" };
  if (x > 0) { stop if e; }
  var r2, e2 = run { command: "ls" };
  stop if e2;
  r2, e2 = run { command: "pwd" };
  return r, null;
}
func main() {
  var s, e = run { command: "ls" };
  for i in [1, 2] {
    var t, e3 = run { command: "ls" };
    if (i > 1) { break; }
    proceed if e3;
  }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 7]:
O erro 'e2' não foi tratado.
Erro semântico [linha 10, coluna 10]:
O erro 'e' não foi tratado.`}
      </Code>

      <H2 title="call e run" />
      <P>
        {mono('check_call_or_run')} confere o lado direito de um {mono('var')} ou de uma atribuição que é {mono('call')} ou {mono('run')}, e devolve o tipo do primeiro valor (o segundo é sempre a {mono('string')} do erro). Primeiro, fora de workflow ou {mono('main')}, é o E18.
        Depois, conforme a forma:
      </P>
      <Table
        head={['Forma', 'Conferência', 'Tipo do resultado']}
        rows={[
          [mono('run { ... }'), <>{mono('check_run_object')} (E14).</>, mono('string')],
          [mono('call nome(args)'), <>Nome não declarado: E1. É uma {mono('func')}: E15 (sem {mono('call')}). Não é workflow: E15 (&quot;não é um workflow&quot;). Se é workflow, os argumentos contra os parâmetros (E21, E4), pela chamada de {mono('check_args_against')}.</>, <>o {mono('ret') } do workflow, ou {mono('T_NULL')} sem {mono(':tipo')}</>],
        ]}
      />
      <P>
        {mono('check_run_object')} confere os campos do objeto de {mono('run')} em ordem: {mono('command')} ({mono('string')}, obrigatório), {mono('flags')} (cabe em {mono('list<string>')}) e {mono('workingDir')} ({mono('string')}). Um campo fora dessa lista é &quot;não aceita o campo&quot;; um repetido é &quot;tem o campo repetido&quot;; um tipo errado dá a
        mensagem do campo; e, ao fim, a falta de {mono('command')} é &quot;sem o campo obrigatório &apos;command&apos;&quot;. O valor de cada campo é avaliado antes de o campo ser julgado, então os erros dos valores também saem. Todos são o E14.
      </P>
      <Why>
        {mono('check_call_or_run') } monta uma {mono('Expr') } de mentira ({mono('fake')}) com os argumentos e a posição do nome do workflow para reaproveitar {mono('check_args_against')}, {mono('eval_args')} e {mono('check_arg_count')}, que trabalham sobre uma {mono('EX_CALL')}. É por isso que o E21 de um {mono('call')} aponta para o nome do workflow.
      </Why>
      <Code lang="flux">
        {`func main() {
  var a, b = run { flags: ["-l"], command: 1, flags: 2, extra: 1, workingDir: 3 };
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 10]:
O erro 'b' não foi tratado.
Erro semântico [linha 2, coluna 44]:
O campo 'command' de 'run' deve ser string, encontrado int.
Erro semântico [linha 2, coluna 54]:
'run' tem o campo 'flags' repetido.
Erro semântico [linha 2, coluna 64]:
'run' não aceita o campo 'extra'.
Erro semântico [linha 2, coluna 79]:
O campo 'workingDir' de 'run' deve ser string, encontrado int.`}
      </Code>
      <P>
        A coluna de cada erro de campo é a do valor dele. A variável de erro {mono('b')} também deu o E9, porque ninguém a tratou. O mesmo {mono('run')} dentro de uma {mono('func')} dá {mono('\'run\' só pode ser usado em workflow ou na main.')} (E18), e nesse caso a variável de erro não vira variável de erro, então não há E9.
      </P>

      <H2 title="Erros: coleta, ordem e relatório" />
      <P>
        Nenhuma conferência escreve na tela. {mono('err(pos, fmt, ...)')} formata a mensagem num {mono('Diag')} do buffer. No fim de {mono('semantic_check')}, o buffer é ordenado por linha, depois coluna, depois ordem de chegada ({mono('by_position')}) e cada erro vai a {mono('report_error')} com a classe
        {mono(' "semântico"')}. Sem {mono('--json')}, {mono('report_error')} escreve em {mono('stderr')} duas linhas ({mono('Erro semântico [linha L, coluna C]:')} e a mensagem) e conta o erro; com {mono('--json')}, grava o erro para o objeto JSON e <strong>não escreve nada</strong> em {mono('stderr')}.
        A mensagem já está formatada, então passa por {mono('"%s"')} e não é lida de novo como formato.
      </P>
      <Code lang="bash">
        {`$ ./flux --json --semantic j.flux | grep -A2 '"errors"'
"errors": [
  {"kind":"semântico","line":2,"column":15,"message":"Tipo incompatível: esperado int, encontrado string."}
],`}
      </Code>
      <P>
        Ver <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink> para o formato completo. Os erros semânticos contam como qualquer outro: o programa é rejeitado e o código de saída é 1.
      </P>
      <Why>
        Os erros vão para um buffer e saem ordenados porque as passadas e os escopos os levantam fora da ordem do arquivo: o E23 e os erros dos globais vêm das passadas 1 e 2, os dos corpos da 3, e o E9 só no fechamento do escopo, mas com a posição de onde a variável de erro foi declarada.
        Ordenar dá ao usuário a lista de cima para baixo no código.
      </Why>
      <Why>
        Um valor que já teve erro tem o tipo {mono('T_ERROR')}, que combina com qualquer tipo, para não gerar uma segunda mensagem em cascata. A maioria das funções {mono('check_*')} devolve {mono('T_ERROR')} depois de levantar um erro, e as seguintes (um operador, um argumento, uma atribuição) o aceitam em silêncio.
      </Why>
      <Why>
        {mono('err') } descarta uma mensagem igual (mesma linha, coluna e texto) a outra já guardada: a mesma mensagem no mesmo lugar não repete. É uma proteção: medido com uma cópia de {mono('sema.c')} instrumentada para avisar quando isso acontece, nenhum dos 141 arquivos {mono('.flux')} de {mono('tests/')} nem os 2 de {mono('docs/exemplos/')} a aciona.
      </Why>
      <Callout kind="nota">
        A mensagem ocupa no máximo 299 caracteres no buffer ({mono('Diag.message')}); no {mono('--json')} o limite do {mono('report_error')} é 1024. Os nomes de tipo de uma mensagem vêm de {mono('tn')}, que alterna entre 4 buffers estáticos de 160 bytes para que duas chamadas na mesma mensagem não pisem uma na outra.
      </Callout>

      <H2 title="Qual função levanta cada erro" />
      <P>
        O catálogo está em <code className="font-mono">docs/ERROS.md</code>, seção 4. Os números E1 a E24 não aparecem no código: cada mensagem é uma chamada de {mono('err')}. Esta tabela liga cada código às funções de {mono('sema.c')} que a chamam (conferida com um {mono('grep')} em {mono('err(')}):
      </P>
      <Table
        head={['Código', 'Função(ões) de sema.c', 'Onde a mensagem aponta']}
        rows={[
          ['E1', <>{mono('check_ident')}, {mono('check_target')}, {mono('check_call')}, {mono('check_call_or_run')}, {mono('check_stmt')} (o operando de {mono('stop if')}); variante &quot;só é declarado depois&quot;: {mono('check_ident')}, {mono('check_target')}</>, 'o nome'],
          ['E2', <>{mono('declare')} (chamada pela passada 1, {mono('check_var')}, {mono('check_func')}, {mono('check_stmt')} no {mono('for')})</>, 'o nome declarado'],
          ['E3', mono('check_ident'), 'o uso'],
          ['E4', <>{mono('expect_assignable')} (chamada por {mono('check_assign_to')}, {mono('check_terminal_call')}, {mono('check_return')}), {mono('check_binary')}, {mono('check_unary')}, {mono('check_ident')} (função ou terminal como valor), {mono('check_field')}, {mono('check_list_literal')}, {mono('check_conversion')}, {mono('check_list_method')}, {mono('check_var')}, {mono('check_assign')}, {mono('check_target')}</>, 'o valor, o operador ou o argumento'],
          ['E5', mono('check_cond'), 'a condição'],
          ['E6', mono('check_target'), 'o nome do alvo'],
          ['E7', <>{mono('count_mismatch')} (chamada por {mono('check_var')} e {mono('check_assign')})</>, 'o comando'],
          ['E8', mono('check_var'), 'o nome'],
          ['E9', <>{mono('scope_pop')} (a marca vem de {mono('make_error_var')}; a baixa, de {mono('check_stmt')})</>, 'onde a variável recebeu o erro'],
          ['E10', <>{mono('check_stmt')} ({mono('ST_BREAK')}, {mono('ST_CONTINUE')})</>, 'o comando'],
          ['E11', <>{mono('check_stmt')} ({mono('ST_ERRACT')})</>, 'o comando'],
          ['E12', mono('check_return'), 'o return'],
          ['E13', mono('value_of'), 'a expressão'],
          ['E14', mono('check_run_object'), 'o valor do campo, ou o objeto (falta de command)'],
          ['E15', <>{mono('check_call')} (workflow sem {mono('call')}), {mono('check_call_or_run')} (func com {mono('call')}, e &quot;não é um workflow&quot;)</>, 'o nome'],
          ['E16', <>{mono('check_stmt')} ({mono('ST_FOR')})</>, 'o iterável'],
          ['E17', <>{mono('check_stmt')} ({mono('ST_ERRACT')}), {mono('check_assign')} (o segundo alvo)</>, 'o operando, ou o alvo'],
          ['E18', mono('check_call_or_run'), <>o {mono('call')} ou {mono('run')}</>],
          ['E19', mono('check_index'), 'o índice, ou a expressão'],
          ['E20', mono('check_func'), 'o nome da função'],
          ['E21', <>{mono('check_arg_count')} (chamada por {mono('check_args_against')}, {mono('check_conversion')}, {mono('check_terminal_call')}, {mono('check_list_method')}), e {mono('check_terminal_call')} para {mono('terminal.input')}</>, 'o nome chamado'],
          ['E22', <>{mono('check_call')} (isso não é função; {mono('terminal')} e variável chamados), {mono('check_method_call')}, {mono('check_terminal_call')}</>, 'o nome ou o método'],
          ['E23', <>{mono('semantic_check')} (passada 2)</>, 'o nome do global'],
          ['E24', <>{mono('check_stmt')} ({mono('ST_EXPR')})</>, 'o comando'],
        ]}
      />

      <H2 title="Funções de sema.c" />
      <P>Todas são {mono('static')}, menos {mono('semantic_check')}. As auxiliares triviais estão numa tabela no fim.</P>
      <H3 title="O ponto de entrada" />
      <Fn name="semantic_check" signature="int semantic_check(Program *program)">
        Roda a análise semântica inteira (as três passadas descritas acima) e devolve quantos erros foram reportados. Parâmetro: a AST, que nunca pode ser nula (o {mono('main')} só chama com um {mono('Program')} válido). Efeitos colaterais: preenche {mono('Expr.type')} em toda a AST;
        escreve as mensagens por {mono('report_error')} (e altera o contador de erros do {mono('main')}); aloca escopos e símbolos na arena. Cria o escopo global, chama {mono('declare_library')}, faz as passadas 1, 2 e 3, sai do escopo global, ordena e imprime. Chamada por {mono('main')}. Erros
        possíveis: todos os E1 a E24.
      </Fn>
      <H3 title="Erros e nomes de tipo" />
      <Fn name="err" signature="static void err(Pos pos, const char *fmt, ...)">
        Guarda um erro no buffer: aumenta o buffer se está cheio (32, dobrando), formata a mensagem com {mono('vsnprintf')}, e só então olha se já existe um erro igual (mesma linha, coluna e texto); se existe, descarta. É a única porta de saída dos erros, chamada por todas as {mono('check_*')}.
      </Fn>
      <Fn name="by_position" signature="static int by_position(const void *a, const void *b)">
        Comparador do {mono('qsort')}: por linha, depois coluna, depois {mono('order')} (a ordem de chegada). O desempate faz a ordenação ser determinística, apesar de o {mono('qsort')} não ser estável.
      </Fn>
      <Fn name="tn" signature="static const char *tn(const Type *t)">
        Atalho para {mono('type_name')} com um buffer estático rotativo (4 buffers de 160 bytes). Devolve o nome do tipo. O rodízio permite usar {mono('tn')} duas vezes na mesma chamada de {mono('err')} ({mono('esperado A, encontrado B')}).
      </Fn>
      <H3 title="Escopos e fluxo" />
      <Fn name="scope_push" signature="static void scope_push(void)">
        Cria um escopo vazio com {mono('ast_alloc')}, com {mono('parent')} no atual, e o torna o atual. Chamada por {mono('semantic_check')} (o global), {mono('check_func')} (os parâmetros), {mono('check_block')} e o {mono('ST_FOR')} de {mono('check_stmt')}.
      </Fn>
      <Fn name="scope_pop" signature="static void scope_pop(void)">
        Fecha o escopo atual: para cada símbolo dele que é variável de erro ({mono('is_err')}) e ainda não foi tratado ({mono('!handled')}), levanta o E9 na posição {mono('err_pos')}; depois volta ao escopo de fora.
      </Fn>
      <Fn name="lookup" signature="static Symbol *lookup(const char *name)">
        Procura {mono('name')} do escopo atual para fora (cada escopo é uma lista, e a busca é linear). Devolve o primeiro símbolo achado, ou nulo. Não levanta erro: quem chama decide (E1, E2...).
      </Fn>
      <Fn name="declare" signature="static Symbol *declare(Name *name, SymKind kind, Type *type)">
        Declara {mono('name')} no escopo atual. Se {mono('lookup')} já acha o nome (em qualquer escopo visível, incluindo os globais e a biblioteca), levanta o E2 e devolve nulo, sem declarar. Senão cria o símbolo ({mono('new_symbol')}), grava a posição de declaração e o põe na frente da lista do escopo. Chamada pela
        passada 1, por {mono('check_var')} (locais), por {mono('check_func')} (parâmetros) e por {mono('check_stmt')} (variável do {mono('for')}).
      </Fn>
      <Fn name="merge" signature="static Flow merge(const Flow *a, const Flow *b)">
        Une dois fluxos depois de um {mono('if')}: se um deles terminou ({mono('dead')}), devolve o outro; senão a interseção ({mono('init')} é 1 só onde os dois são 1) com {mono('dead = 0')}. Percorre os {mono('MAX_SYMS')} índices. Chamada por {mono('check_stmt')}, no {mono('ST_IF')}.
      </Fn>
      <H3 title="Expressões" />
      <Fn name="value_of" signature="static Type *value_of(Expr *e)">
        Como {mono('check_expr')}, mas o valor tem de existir. Se o tipo é {mono('T_VOID')} (uma chamada sem valor: função sem {mono(':tipo')}, {mono('push')}, {mono('remove')}, {mono('terminal.log')}), levanta o E13 ({mono('\'f\' não retorna valor.')}), troca o tipo de {mono('e')} por {mono('T_ERROR')} e o devolve. É a porta de entrada de quase toda subexpressão.
      </Fn>
      <Fn name="callee_name" signature="static const char *callee_name(const Expr *e)">
        O nome de uma expressão para as mensagens: de uma chamada, o do que é chamado (recursivo); de um nome ou de um campo, o texto ({mono('e->text')}); do resto, a palavra {mono('valor')}. Usada em E13, E19 e E22.
      </Fn>
      <Fn name="expect_assignable" signature="static void expect_assignable(Type *to, Expr *e, Type *got)">
        Se {mono('type_assignable(to, got)')} é falso, levanta o E4 ({mono('Tipo incompatível: esperado A, encontrado B.')}) na posição de {mono('e')}. Só dá a mensagem; não calcula tipo nenhum.
      </Fn>
      <Fn name="check_assign_to" signature="static void check_assign_to(Type *to, Expr *e)">
        Confere o valor {mono('e')} contra o tipo esperado {mono('to')} (E4). Se {mono('e')} é um literal de lista e {mono('to')} é lista, confere cada elemento contra {mono('to->elem')} (recursivo) e grava {mono('to')} como tipo do literal; senão, {mono('value_of')} mais {mono('expect_assignable')}.
        Chamada por {mono('check_var')}, {mono('check_assign')}, {mono('check_return')}, {mono('check_args_against')} e {mono('check_list_method')}.
      </Fn>
      <Fn name="check_cond" signature="static Type *check_cond(Expr *e, const char *keyword)">
        Confere a condição de um {mono('if')} ou {mono('while')}: só {mono('bool')}, dinâmico ou erro passam; senão E5 com a palavra {mono('keyword')}. Devolve o tipo achado.
      </Fn>
      <Fn name="check_binary" signature="static Type *check_binary(Expr *e)">
        Tipo de um {mono('EX_BINARY')}, pela tabela de operadores acima, conferindo cada lado com {mono('value_of')}. Devolve {mono('T_ERROR')} sem mensagem se um dos lados já tem erro; o E4 na posição do operador se a combinação não vale.
      </Fn>
      <Fn name="check_unary" signature="static Type *check_unary(Expr *e)">
        Tipo de um {mono('EX_UNARY')}: {mono('-') } aceita {mono('int')}, {mono('float')} ou dinâmico (e devolve o mesmo tipo); {mono('!')} aceita {mono('bool')} ou dinâmico (e devolve {mono('bool')}). Fora disso, E4 (&quot;Operador &apos;-&apos; não aceita string.&quot;).
      </Fn>
      <Fn name="is_terminal" signature="static int is_terminal(const Expr *e)">
        Devolve 1 se {mono('e')} é o nome {mono('terminal')} (um {mono('EX_IDENT')} que o {mono('lookup')} resolve em {mono('SYM_TERMINAL')}), senão 0. Serve a {mono('check_field')} e {mono('check_method_call')} para tratar {mono('terminal.x')} à parte.
      </Fn>
      <Fn name="check_ident" signature="static Type *check_ident(Expr *e)">
        Tipo de uma leitura de nome. Não declarado: E1. Função, workflow ou conversão como valor: E4 (&quot;é uma função, não um valor&quot;); {mono('terminal') } como valor: E4. Global sem tipo ainda: &quot;só é declarado depois deste ponto&quot; (E1 variante). Variável rastreada, num caminho vivo, sem valor ainda: E3 (e marca como iniciada para não repetir).
        Senão, devolve {mono('s->type')}.
      </Fn>
      <Fn name="check_index" signature="static Type *check_index(Expr *e)">
        Tipo de {mono('base[idx]')}. Erro num dos lados: {mono('T_ERROR')}. Base dinâmica: dinâmico. Lista: o índice tem de ser {mono('int')} ou dinâmico (E19, na posição do índice) e o resultado é o tipo do elemento (dinâmico se a lista é {mono('list<null>')}). {mono('object')}: a chave tem de ser {mono('string')} ou dinâmica (E19)
        e o resultado é dinâmico. Qualquer outra base: E19 (&quot;não é uma lista nem um object e não aceita [ ]&quot;).
      </Fn>
      <Fn name="check_field" signature="static Type *check_field(Expr *e)">
        Tipo de {mono('base.campo')}. Se a base é {mono('terminal')}: E4 (&quot;&apos;terminal.x&apos; é uma função, não um valor&quot;). Base com erro: propaga. Base {mono('object')} ou dinâmica: dinâmico. Outra: E4 (esperado object).
      </Fn>
      <Fn name="check_list_literal" signature="static Type *check_list_literal(Expr *e)">
        Tipo de um literal de lista, como descrito na seção de literais: junta os tipos dos elementos, alargando o tipo corrente quando cabe, e levanta o E4 no elemento que não casa. {mono('[]') } é {mono('list<null>')}.
      </Fn>
      <Fn name="check_object_literal" signature="static Type *check_object_literal(Expr *e)">
        Avalia o valor de cada campo com {mono('value_of')} e devolve {mono('T_OBJECT')}.
      </Fn>
      <Fn name="check_arg_count" signature="static void check_arg_count(Expr *call, const char *name, int expected)">
        Levanta o E21 ({mono('\'f\' espera N argumento(s), recebeu M.')}, com singular e plural) na posição da chamada, se o número de argumentos de {mono('call')} é diferente de {mono('expected')}. Só conta; não olha os tipos.
      </Fn>
      <Fn name="eval_args" signature="static void eval_args(Expr *call)">
        Aplica {mono('value_of')} a cada argumento de {mono('call')}, só para conferir (e tipar) o que há dentro. Usada depois de um erro de chamada, para que os erros dos argumentos apareçam mesmo assim.
      </Fn>
      <Fn name="check_args_against" signature="static void check_args_against(Expr *call, const char *name, Param **params, int n)">
        Confere os argumentos de uma chamada contra os {mono('n')} parâmetros: {mono('check_arg_count')} e depois {mono('check_assign_to')} de cada argumento contra o tipo do parâmetro de mesma posição (argumentos a mais só são avaliados). Chamada para {mono('SYM_FUNC')} e para workflows (também via {mono('call')}).
      </Fn>
      <Fn name="check_conversion" signature="static Type *check_conversion(Expr *call, const char *name)">
        Confere uma chamada a {mono('toString')}, {mono('toInt')}, {mono('toFloat')} ou {mono('toBool')}: 1 argumento (E21), e para as três últimas o tipo de entrada da tabela de conversões (E4). Devolve {mono('string')}, {mono('int')}, {mono('float')} ou {mono('bool')}, respectivamente; {mono('T_ERROR')} se não há argumento.
      </Fn>
      <Fn name="check_terminal_call" signature="static Type *check_terminal_call(Expr *call, const char *method)">
        Confere {mono('terminal.método(...)')}: {mono('log')}, {mono('info')}, {mono('warn')} e {mono('error')} (1 argumento qualquer; devolve {mono('T_VOID')}); {mono('input')} (0 ou 1 argumento {mono('string')}; devolve {mono('string')}); outro nome é o E22 na posição do método.
      </Fn>
      <Fn name="check_list_method" signature="static Type *check_list_method(Expr *call, const char *method, Type *base)">
        Confere {mono('length')}, {mono('push')} e {mono('remove')} sobre uma lista ou um valor dinâmico (tabela de métodos acima). {mono('length')} devolve {mono('int')}; {mono('push')} e {mono('remove')} devolvem {mono('T_VOID')}.
      </Fn>
      <Fn name="check_method_call" signature="static Type *check_method_call(Expr *call)">
        Uma chamada cujo lado esquerdo é um campo. Se a base é {mono('terminal')}, delega a {mono('check_terminal_call')}; senão avalia a base e, se é lista ou dinâmica e o método é um dos três, delega a {mono('check_list_method')}; qualquer outro caso é o E22 (&quot;não tem o método&quot;), e os argumentos são avaliados.
      </Fn>
      <Fn name="check_call" signature="static Type *check_call(Expr *call)">
        Tipo de um {mono('EX_CALL')}. Despacha como na tabela de chamadas: método, E22 (não é nome), E1 (nome desconhecido) e, conforme o símbolo, função, workflow (E15), conversão, {mono('terminal')} ou variável (E22).
      </Fn>
      <Fn name="check_expr" signature="static Type *check_expr(Expr *e)">
        O despachante: escolhe a função pelo {mono('ExprKind')}, grava o tipo em {mono('e->type')} e o devolve. Os literais simples não têm função própria; um {mono('EX_OBJECT') } é o caso padrão do {mono('switch')}. Todas as demais funções de expressão voltam aqui, recursivamente.
      </Fn>
      <H3 title="call e run" />
      <Fn name="check_run_object" signature="static void check_run_object(Expr *obj)">
        Confere o objeto de um {mono('run')}: campos {mono('command')}, {mono('flags')}, {mono('workingDir')}, sem repetição nem desconhecido, cada um com o seu tipo, e {mono('command')} obrigatório. Todos os erros são o E14.
      </Fn>
      <Fn name="check_call_or_run" signature="static Type *check_call_or_run(Rhs *r)">
        Confere um {mono('call')} ou {mono('run')} e devolve o tipo do primeiro valor. E18 fora de workflow ou {mono('main')}; para {mono('run')}, {mono('check_run_object')} e {mono('string')}; para {mono('call')}, o que a tabela da seção acima diz, devolvendo o retorno do workflow ou {mono('T_NULL')}. Chamada por {mono('check_var')} e {mono('check_assign')}.
      </Fn>
      <H3 title="Comandos e funções" />
      <Fn name="count_mismatch" signature="static void count_mismatch(Pos pos, int vars, int values)">
        Levanta o E7 ({mono('2 variáveis e 1 valor.')}) com singular e plural, na posição do comando.
      </Fn>
      <Fn name="make_error_var" signature="static void make_error_var(Symbol *s, Pos pos)">
        Marca {mono('s')} como variável de erro ainda não tratada: {mono('is_err = 1')}, {mono('handled = 0')}, {mono('err_pos = pos')}. Chamada por {mono('check_var')} e {mono('check_assign')}, só se {mono('can_use_call_run')}.
      </Fn>
      <Fn name="check_var" signature="static void check_var(Stmt *s, int is_global)">
        Confere um {mono('var')} ou {mono('const')}, local ou global, como na seção de comandos. Levanta E4, E7, E8, e (por {mono('declare')}) E2. Para um global, só completa o símbolo da passada 1.
      </Fn>
      <Fn name="check_target" signature="static Type *check_target(Expr *t, Symbol **sym_out)">
        Confere o alvo de uma atribuição e devolve o tipo esperado. Para um nome, devolve também o símbolo em {mono('*sym_out')} (nulo se há erro, ou se o alvo é campo ou índice). Erros: E1, E4, E6, E1 variante.
      </Fn>
      <Fn name="check_assign" signature="static void check_assign(Stmt *s)">
        Confere um {mono('ST_ASSIGN')}: os alvos, os valores (ou o {mono('call')}/{mono('run')}), a contagem (E7) e a regra do segundo alvo (E17, E4). No fim marca cada nome atribuído como iniciado.
      </Fn>
      <Fn name="check_return" signature="static void check_return(Stmt *s)">
        Confere um {mono('return')} contra a função atual (E12 e E4), como na seção de {mono('return')}.
      </Fn>
      <Fn name="check_stmt" signature="static void check_stmt(Stmt *s)">
        O despachante dos comandos, como na tabela da seção de comandos. Além de chamar as funções específicas, cuida do {mono('ST_EXPR')} (E24), do fluxo de {mono('if')}, {mono('while')} e {mono('for')}, de {mono('loop_depth')}, de {mono('flow.dead')} e do {mono('ST_ERRACT')} (E11, E1, E17 e marcar {mono('handled')}).
      </Fn>
      <Fn name="check_block" signature="static void check_block(Stmt *block)">
        Abre um escopo, confere cada comando do bloco e fecha o escopo (que levanta o E9 dos erros não tratados).
      </Fn>
      <Fn name="check_func" signature="static void check_func(Func *f)">
        Confere o corpo de uma função, workflow ou {mono('main')}: define {mono('cur_func')}, zera {mono('loop_depth')}, {mono('next_flow_id')} e o fluxo; empilha o escopo dos parâmetros e declara cada um (E2 se repetido), já iniciado; confere o bloco; levanta o E20 se faltou retorno; fecha o escopo e volta {mono('cur_func')} a nulo.
      </Fn>
      <Fn name="declare_library" signature="static void declare_library(void)">
        Põe a biblioteca no escopo atual (o global): {mono('terminal')} como {mono('SYM_TERMINAL')} e {mono('toString')}, {mono('toInt')}, {mono('toFloat')}, {mono('toBool')} como {mono('SYM_LIBFN')}, todos com tipo nulo. Os símbolos entram direto na lista, sem passar por {mono('declare')}.
      </Fn>
      <H3 title="Auxiliares triviais" />
      <Table
        head={['Função', 'O que faz']}
        rows={[
          [mono('T(kind)'), <>Atalho de {mono('type_prim')}.</>],
          [mono('is_num(t)'), <>1 se o tipo é {mono('int')} ou {mono('float')}.</>],
          [mono('num_or_dyn(t)'), <>1 se é número ou {mono('T_DYN')}.</>],
          [mono('plural(n, um, varios)'), <>Devolve {mono('um')} se {mono('n')} é 1, senão {mono('varios')}; para as mensagens no plural.</>],
          [mono('new_symbol(name, kind, type)'), <>Aloca um símbolo com {mono('flow_id')} igual a -1.</>],
          [mono('mark_initialized(s)'), <>Põe {mono('flow.init')} em 1 para o símbolo, se ele é rastreado.</>],
          [mono('can_use_call_run()'), <>1 se há função atual e ela é workflow ou {mono('main')}.</>],
          [mono('op_text(op)'), <>O texto do operador para as mensagens (a mesma tabela de {mono('op_name')} em {mono('ast.c')}).</>],
        ]}
      />
    </>
  )
}
