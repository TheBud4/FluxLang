import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

function NodeLinksDiagram() {
  const kids = [
    { x: 40, label: 'filho 1' },
    { x: 220, label: 'filho 2' },
    { x: 400, label: 'filho 3' },
  ]
  return (
    <svg viewBox="0 0 560 190" width="560" height="190" className="block max-w-none">
      <defs>
        <marker id="seta-no" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted" />
        </marker>
      </defs>
      <rect x="200" y="10" width="160" height="44" rx="6" strokeWidth="1.25" className="fill-bg stroke-accent" />
      <text x="280" y="30" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-ink">
        or_expr (NODE_RULE)
      </text>
      <text x="280" y="46" fontSize="11" fontFamily="monospace" textAnchor="middle" className="fill-muted">
        first_child, last_child
      </text>
      {kids.map((k, i) => (
        <g key={k.label}>
          <rect x={k.x} y="110" width="120" height="44" rx="6" strokeWidth="1.25" className="fill-bg stroke-line" />
          <text x={k.x + 60} y="130" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-ink">
            {k.label}
          </text>
          <text x={k.x + 60} y="146" fontSize="11" fontFamily="monospace" textAnchor="middle" className="fill-muted">
            next
          </text>
          {i < kids.length - 1 && (
            <path d={`M ${k.x + 120} 132 L ${k.x + 178} 132`} fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-no)" />
          )}
        </g>
      ))}
      <path d="M 250 54 L 100 108" fill="none" strokeWidth="1.5" className="stroke-accent" markerEnd="url(#seta-no)" />
      <path d="M 310 54 L 450 108" fill="none" strokeWidth="1.5" strokeDasharray="5 4" className="stroke-accent" markerEnd="url(#seta-no)" />
      <text x="146" y="78" fontSize="11" fontFamily="monospace" className="fill-accent">
        first_child
      </text>
      <text x="392" y="78" fontSize="11" fontFamily="monospace" className="fill-accent">
        last_child
      </text>
      <text x="460" y="178" fontSize="11" className="fill-muted">
        o último next é nulo
      </text>
    </svg>
  )
}

export function ArvoreJson() {
  return (
    <>
      <H2 title="O papel do módulo" />
      <P>
        Depois que o parser aceita (ou recupera) o programa, o que existe é uma <strong>árvore de derivação</strong>: um nó por regra
        da BNF, uma folha por token e uma folha especial para cada produção vazia. Três arquivos cuidam dela:{' '}
        {mono('src/frontend/tree.h')} (o tipo {mono('Node')} e as funções que constroem a árvore), {mono('src/frontend/tree.c')} (a
        implementação e o {mono('print_tree')}, que atende ao {mono('--tree')}) e {mono('src/json.c')} (o {mono('json_print')}, que
        atende ao {mono('--json')}).
      </P>
      <Table
        head={['Quem', 'O que faz com a árvore']}
        rows={[
          [<>{mono('lexer.l')}</>, <>Cria uma folha por token com {mono('token_node')}, dentro da macro {mono('RET')}, e registra o mesmo token para o JSON com {mono('json_record_token')}. Ver <PageLink to="compilador/lexico">Analisador léxico</PageLink>.</>],
          [<>{mono('parser.y')}</>, <>Monta os nós de regra com {mono('mknode')}, as folhas ε com {mono('empty_node')} e os trechos descartados com {mono('error_node')}; a regra {mono('program')} grava a raiz em {mono('parse_root')}. Ver <PageLink to="compilador/parser">Parser</PageLink>.</>],
          [<>{mono('main.c')}</>, <>Chama {mono('json_enable')} antes do {mono('yyparse')}, e depois {mono('print_tree')} (com {mono('--tree')}), {mono('json_print')} (com {mono('--json')}) ou {mono('build_ast')} (com {mono('--ast')}, {mono('--semantic')} e a geração de código). Ver <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>.</>],
          [<>{mono('ast_build.c')}</>, <>Lê a árvore e a converte na AST. Ver <PageLink to="compilador/ast">AST</PageLink>.</>],
          [<>A interface web</>, <>Recebe a árvore em JSON e a desenha. Ver "O contrato com a interface web", mais abaixo.</>],
        ]}
      />
      <Why>
        A árvore nunca é liberada: o compilador roda uma vez por arquivo, então os nós vêm da arena e somem todos juntos no fim do
        programa, com {mono('mem_free_all')}. Por isso nenhum código da árvore tem {mono('free')}. Ver{' '}
        <PageLink to="compilador/arena">Arena de memória</PageLink>.
      </Why>

      <H2 title="O tipo Node" />
      <P>
        Todo elemento da árvore é um {mono('Node')}. O desenho é o de uma árvore de filhos encadeados: o pai guarda o primeiro e o
        último filho, e cada filho guarda o próximo irmão. Não há vetor de filhos nem contador, por isso o número de filhos de um nó
        não precisa ser conhecido de antemão.
      </P>
      <Table
        head={['Campo', 'Tipo', 'Significado']}
        rows={[
          [mono('kind'), mono('enum NodeKind'), 'O que o nó é: regra, token, produção vazia ou trecho de erro (tabela abaixo).'],
          [mono('label'), mono('const char *'), <>Em regra: o nome do não terminal na BNF ({mono('"or_expr"')}). Em token: o nome do token ({mono('"IDENTIFIER"')}). No ε: {mono('"ε"')}. No erro: {mono('"error"')}. Não é copiado: aponta para um literal de texto do chamador, que vive o programa inteiro.</>],
          [mono('text'), mono('char *'), <>Só nos tokens: o lexema, copiado para a arena. Nos demais, nulo.</>],
          [<>{mono('line')}, {mono('column')}</>, mono('int'), <>Onde o nó começa (linha e coluna a partir de 1). Vale 0 quando não há token na posição, como no ε e em um nó cujos filhos são só ε.</>],
          [mono('flag'), mono('int'), <>Marca de uso interno do parser, para a checagem S3 (alvo de atribuição inválido). O {mono('mknode')} deixa em 0; só as ações do {mono('parser.y')} escrevem nele. Nem a impressão, nem o JSON, nem a AST o usam. Ver "A checagem S3 e o campo flag" em <PageLink to="compilador/parser">Parser</PageLink>.</>],
          [<>{mono('first_child')}, {mono('last_child')}</>, mono('struct Node *'), <>O primeiro e o último filho (nulos em folhas). O {mono('last_child')} é usado pelo {mono('mknode')}, para anexar um filho em tempo constante, e pelo {mono('ast_build.c')}, para pegar o filho final de um {mono('postfix_rest')} sem percorrer a lista.</>],
          [mono('next'), mono('struct Node *'), 'O próximo irmão, ou nulo no último filho.'],
        ]}
      />
      <Diagram
        title="Os campos de ligação: o pai aponta para o primeiro e o último filho, os filhos se ligam por next"
        label="Um nó or_expr com first_child apontando para o filho 1 e last_child apontando para o filho 3. O filho 1 aponta por next para o filho 2, que aponta por next para o filho 3."
      >
        <NodeLinksDiagram />
      </Diagram>
      <Table
        head={['NodeKind', 'Quem cria', 'label', 'Campos usados']}
        rows={[
          [mono('NODE_RULE'), mono('mknode'), 'nome do não terminal', <>filhos; posição do primeiro filho que tem posição</>],
          [mono('NODE_TOKEN'), mono('token_node'), 'nome do token', <>{mono('text')} e posição</>],
          [mono('NODE_EMPTY'), mono('empty_node'), mono('"ε"'), 'nenhum (posição 0)'],
          [mono('NODE_ERROR'), mono('error_node'), mono('"error"'), <>só a posição (do começo do trecho descartado)</>],
        ]}
      />
      <Why>
        Os nós vêm de {mono('mem_alloc')}, que entrega memória zerada. O {mono('alloc')} de {mono('tree.c')} só grava {mono('kind')} e{' '}
        {mono('label')}: {mono('text')}, {mono('line')}, {mono('column')}, {mono('flag')} e os ponteiros já nascem em zero. É isso que
        faz um nó de regra sem filho com posição ter linha 0, e o {mono('flag')} começar em 0 em toda ação do parser que não o escreve.
      </Why>
      <P>
        A árvore é fiel à gramática: tem também os nós {mono('*_rest')} e {mono('*_after_comma')} criados na fatoração LL(1), e cada
        produção vazia deixa uma folha {mono('ε')}. Quem a exibe pode colapsar os {mono('*_rest')}: a interface web faz isso, a
        impressão do {mono('--tree')} não. Um programa de uma linha, {mono('var a = 1;')}, mais um {mono('main')} vazio, gera 54 nós, e
        só o literal {mono('1')} atravessa 11 não terminais, de {mono('expression_list')} até {mono('primary')}, mais um ε por cada
        um dos {mono('*_rest')} do caminho.
      </P>

      <H2 title="Funções da árvore" />
      <Fn name="mknode" signature="Node *mknode(const char *label, int n, ...)">
        Cria um nó de regra de nome {mono('label')} e lhe anexa os {mono('n')} filhos seguintes, que são argumentos variádicos do tipo{' '}
        {mono('Node *')} e entram na ordem em que aparecem. Um argumento nulo é pulado (não vira filho, mas conta no {mono('n')}). A
        posição do nó é a do primeiro filho cuja linha não é 0: o laço copia {mono('line')} e {mono('column')} do filho quando o nó
        ainda tem linha 0, então filhos ε, que têm linha 0, não decidem a posição. Se nenhum filho tem posição, o nó fica com linha 0.
        Toda ação do {mono('parser.y')} é uma chamada a esta função.
      </Fn>
      <Fn name="token_node" signature="Node *token_node(const char *label, const char *text, int line, int column)">
        Cria a folha de um token: {mono('NODE_TOKEN')}, com o nome do token em {mono('label')}, uma cópia do lexema (feita com{' '}
        {mono('mem_strdup')}) em {mono('text')} e a posição dada. É chamada só pela macro {mono('RET')} do lexer, que passa o nome do
        token por stringificação ({mono('#t')}) e a posição de {mono('yylloc')}. A cópia é necessária porque o Flex reaproveita o
        buffer de {mono('yytext')} a cada token.
      </Fn>
      <Fn name="empty_node" signature="Node *empty_node(void)">
        Cria a folha ε: {mono('NODE_EMPTY')} com {mono('label')} {mono('"ε"')} e posição 0. Chamada pelas regras vazias do{' '}
        {mono('parser.y')}, sempre como único filho de um nó {mono('*_rest')} (ou de outro não terminal que pode ser vazio, como{' '}
        {mono('commands')}).
      </Fn>
      <Fn name="error_node" signature="Node *error_node(int line, int column)">
        Cria um nó {mono('NODE_ERROR')} de {mono('label')} {mono('"error"')} na posição dada. É o filho que o modo pânico deixa no lugar do
        trecho descartado, e o {mono('parser.y')} lhe passa a posição do símbolo {mono('error')} ({mono('@k.first_line')},{' '}
        {mono('@k.first_column')}). Ver <PageLink to="compilador/modo-panico">Modo pânico</PageLink>. A existência de um nó de erro é
        o que faz o {mono('build_ast')} recusar a árvore.
      </Fn>
      <Fn name="print_tree" signature="void print_tree(const Node *root, FILE *out)">
        Imprime a árvore indentada em {mono('out')}, um nó por linha, partindo de {mono('root')}. Com {mono('root')} nulo, não imprime nada
        (é o caso em que nenhuma regra {mono('program')} fechou). Chamada por {mono('main')} com {mono('parse_root')} e {mono('stdout')}, só
        no modo {mono('--tree')}. O formato está em "A opção --tree".
      </Fn>
      <Fn name="parse_root" signature="extern Node *parse_root">
        Variável global, declarada em {mono('tree.h')} e definida em {mono('tree.c')}. Guarda a raiz da última análise, o nó{' '}
        {mono('program')}, que a ação da regra inicial grava. Fica nula se a regra {mono('program')} nunca foi reduzida (erro sintático logo
        no início, ou a pilha do Bison esgotada). É lida por {mono('print_tree')}, {mono('json_print')} e {mono('build_ast')}.
      </Fn>
      <Fn name="alloc" signature="static Node *alloc(enum NodeKind kind, const char *label)">
        Aloca um {mono('Node')} da arena, grava {mono('kind')} e {mono('label')} e o devolve; o resto fica zerado. As quatro funções de
        criação passam por ela.
      </Fn>
      <Fn name="print_node" signature="static void print_node(const Node *node, int depth, FILE *out)">
        Imprime um nó e, recursivamente, os filhos, com {mono('depth + 1')}. Escreve dois espaços de recuo por nível de profundidade. O
        formato da linha depende do tipo: token mostra {mono("LABEL 'texto' linha:coluna")}, erro mostra {mono('error linha:coluna')}, e regra
        ou ε mostram só o {mono('label')}. A recursão tem a profundidade da árvore, que o limite da pilha do Bison mantém pequena.
      </Fn>

      <H2 title="A opção --tree" />
      <P>
        {mono('./flux --tree arquivo.flux')} faz a análise normal e, antes de dizer se aceitou, imprime a árvore em {mono('stdout')}. Os erros
        de sintaxe, se houver, saem em {mono('stderr')} durante a análise (portanto antes da árvore) e a árvore mostra o programa
        recuperado, com os nós {mono('error')}. O programa abaixo é o menor que existe, um {mono('main')} vazio; a saída é a real.
      </P>
      <Code lang="text">
        {`$ ./flux --tree m.flux
program
  before_main
    FUNC 'func' 1:1
    after_func
      MAIN 'main' 1:6
      LPAREN '(' 1:10
      RPAREN ')' 1:11
      block
        LBRACE '{' 1:13
        commands
          ε
        RBRACE '}' 1:15
      after_main
        ε
Programa aceito.`}
      </Code>
      <P>
        Cada nível de profundidade são dois espaços. As folhas de token mostram o nome do token, o lexema entre aspas simples e a posição{' '}
        {mono('linha:coluna')}; os nós de regra e o ε mostram só o nome. Num programa com expressão aparece a cadeia de precedência da
        BNF. Este é o trecho, recuado como na saída real de {mono('var a = x + y + z;')} dentro de {mono('main')}, da regra{' '}
        {mono('additive_expr')} em diante (os operandos {mono('y')} e {mono('z')} estão abreviados em uma linha): o primeiro operando fica no
        filho de {mono('additive_expr')} e os demais se aninham em {mono('additive_rest')}, um dentro do outro.
      </P>
      <Code lang="text">
        {`                              additive_expr
                                multiplicative_expr
                                  unary_expr
                                    postfix_expr
                                      primary
                                        IDENTIFIER 'x' 2:11
                                      postfix_rest
                                        ε
                                  multiplicative_rest
                                    ε
                                additive_rest
                                  additive_op
                                    PLUS '+' 2:13
                                  multiplicative_expr
                                    ...  (y, 2:15)
                                  additive_rest
                                    additive_op
                                      PLUS '+' 2:17
                                    multiplicative_expr
                                      ...  (z, 2:19)
                                    additive_rest
                                      ε`}
      </Code>
      <P>
        Com um erro recuperado pelo modo pânico, o nó de erro aparece no lugar do trecho descartado, com a posição de onde ele começa. É a
        árvore real de um {mono('main')} com a linha {mono('var x = ;')} (falta o valor; a mensagem de erro foi para {mono('stderr')}):
      </P>
      <Code lang="text">
        {`program
  before_main
    FUNC 'func' 1:1
    after_func
      MAIN 'main' 1:6
      LPAREN '(' 1:10
      RPAREN ')' 1:11
      block
        LBRACE '{' 1:13
        commands
          command
            error 2:3
            SEMICOLON ';' 2:11
          commands
            ε
        RBRACE '}' 3:1
      after_main
        ε
Programa rejeitado.`}
      </Code>
      <Callout kind="nota">
        Se a análise termina sem fechar a regra {mono('program')}, como num arquivo vazio ou que começa por {mono('}')}, {mono('parse_root')}{' '}
        fica nulo: o {mono('--tree')} não imprime nenhuma linha de árvore e só diz {mono('Programa rejeitado.')}. As opções {mono('--tree')} e{' '}
        {mono('--ast')} podem vir juntas: a árvore sai primeiro, depois a AST, depois a linha de aceito ou rejeitado.
      </Callout>

      <H2 title="A saída --json" />
      <P>
        {mono('./flux --json')} não imprime a árvore em texto nem a linha {mono('Programa aceito.')}: escreve em {mono('stdout')} um único
        objeto JSON com tudo o que a interface precisa, e o código de saída continua sendo 0 (aceito) ou 1 (rejeitado). As mensagens de
        erro não vão para {mono('stderr')}: viram itens do campo {mono('errors')}. A interface chama {mono('./flux --json')} (ou{' '}
        {mono('--json --semantic')}, quando a análise semântica está ligada) e lê o resultado.
      </P>
      <Table
        head={['Chave', 'Tipo', 'Conteúdo']}
        rows={[
          [mono('accepted'), mono('true | false'), <>Verdadeiro quando o {mono('yyparse')} devolveu 0 e nenhum erro foi relatado (léxico, sintático e, com {mono('--semantic')}, semântico).</>],
          [mono('lines'), mono('int'), <>O número de linhas do código, calculado por {mono('source_lines()')}: 0 para entrada vazia, e uma última linha terminada em quebra de linha não conta uma linha a mais.</>],
          [mono('tokens'), mono('array'), <>Um objeto por token, na ordem em que o lexer os devolveu: {mono('line')}, {mono('column')}, {mono('type')} (o nome do token, {mono('"FUNC"')}) e {mono('text')} (o lexema; nas strings, com as aspas). Espaços, comentários, o fim do arquivo e os caracteres com erro léxico não entram.</>],
          [mono('errors'), mono('array'), <>Um objeto por erro, na ordem em que foram relatados: {mono('kind')} ({mono('"léxico"')}, {mono('"sintático"')} ou {mono('"semântico"')}), {mono('line')}, {mono('column')} e {mono('message')} (o texto de várias linhas das mensagens, com {mono('\\n')}).</>],
          [mono('tree'), mono('objeto | null'), <>A raiz da árvore de derivação, ou {mono('null')} se a regra {mono('program')} nunca fechou.</>],
        ]}
      />
      <P>
        Cada nó da árvore em JSON é um objeto com as chaves a seguir, nesta ordem, e só as que se aplicam:
      </P>
      <Table
        head={['Chave', 'Quando aparece', 'Valor']}
        rows={[
          [mono('kind'), 'sempre', <>{mono('"rule"')}, {mono('"token"')}, {mono('"empty"')} ou {mono('"error"')}, de acordo com o {mono('NodeKind')}.</>],
          [mono('label'), 'sempre', <>O {mono('label')} do {mono('Node')}.</>],
          [mono('text'), <>se o nó tem {mono('text')} (tokens)</>, 'O lexema.'],
          [<>{mono('line')}, {mono('column')}</>, <>se a linha não é 0</>, 'A posição. Faltam no ε e nas regras que só têm ε.'],
          [mono('children'), 'se há filhos', <>Um vetor com os filhos, na ordem. Folhas não têm a chave.</>],
        ]}
      />
      <P>
        O {mono('flag')} e os ponteiros não saem no JSON. O exemplo a seguir é a saída real para o {mono('main')} vazio (a árvore é uma linha só,
        que a página rola na horizontal):
      </P>
      <Code lang="text">
        {`$ ./flux --json m.flux
{
"accepted": true,
"lines": 1,
"tokens": [
  {"line":1,"column":1,"type":"FUNC","text":"func"},
  {"line":1,"column":6,"type":"MAIN","text":"main"},
  {"line":1,"column":10,"type":"LPAREN","text":"("},
  {"line":1,"column":11,"type":"RPAREN","text":")"},
  {"line":1,"column":13,"type":"LBRACE","text":"{"},
  {"line":1,"column":15,"type":"RBRACE","text":"}"}
],
"errors": [],
"tree": {"kind":"rule","label":"program","line":1,"column":1,"children":[{"kind":"rule","label":"before_main","line":1,"column":1,"children":[{"kind":"token","label":"FUNC","text":"func","line":1,"column":1},{"kind":"rule","label":"after_func","line":1,"column":6,"children":[{"kind":"token","label":"MAIN","text":"main","line":1,"column":6},{"kind":"token","label":"LPAREN","text":"(","line":1,"column":10},{"kind":"token","label":"RPAREN","text":")","line":1,"column":11},{"kind":"rule","label":"block","line":1,"column":13,"children":[{"kind":"token","label":"LBRACE","text":"{","line":1,"column":13},{"kind":"rule","label":"commands","children":[{"kind":"empty","label":"ε"}]},{"kind":"token","label":"RBRACE","text":"}","line":1,"column":15}]},{"kind":"rule","label":"after_main","children":[{"kind":"empty","label":"ε"}]}]}]}]}
}`}
      </Code>
      <Why>
        O {mono('json_print')} escreve as chaves do objeto em linhas separadas e um token ou erro por linha, e deixa a árvore, que é grande, numa
        linha só. A forma não é a mais compacta nem a mais legível: é a que torna a saída fácil de comparar com {mono('diff')}, que é como
        os casos de {mono('tests/json/')} são conferidos.
      </Why>
      <P>
        Quando há erros, eles ficam em {mono('errors')} e o resto continua preenchido. Este é o campo {mono('errors')} real de um programa com
        os três tipos de problema de análise (um caractere desconhecido, um valor que falta e uma atribuição a algo que não é variável), de{' '}
        {mono('tests/json/erros.flux')}:
      </P>
      <Code lang="text">
        {`"errors": [
  {"kind":"léxico","line":2,"column":13,"message":"Caractere não reconhecido: '@'"},
  {"kind":"sintático","line":3,"column":11,"message":"Token encontrado: ';'\\nEsperado: expressão, 'call' ou 'run'"},
  {"kind":"sintático","line":4,"column":7,"message":"Token encontrado: '='\\nEsperado: ';' (o lado esquerdo não é variável, campo ou índice)"}
],`}
      </Code>
      <P>
        Note que o {mono('@')} não aparece em {mono('tokens')}: o lexer relata o erro e devolve {mono('YYerror')} sem passar pela macro {mono('RET')}.
      </P>

      <H3 title="Como os tokens e os erros são registrados" />
      <P>
        Os tokens e os erros são anotados durante a análise e só impressos no fim, por {mono('json_print')}. O {mono('json.c')} mantém duas
        listas em variáveis estáticas, uma de {mono('TokenRec')} e outra de {mono('ErrorRec')} (cada uma com o vetor, o contador e a capacidade), e a árvore
        é lida direto de {mono('parse_root')}.
      </P>
      <Table
        head={['Estrutura', 'Campos']}
        rows={[
          [mono('TokenRec'), <>{mono('char *type, *text')} e {mono('int line, column')}.</>],
          [mono('ErrorRec'), <>{mono('char *kind, *message')} e {mono('int line, column')}.</>],
          [mono('static int enabled'), <>Ligada por {mono('json_enable')}. Enquanto está em 0, {mono('json_record_token')} não grava nada, de modo que o lexer pode chamá-la sempre.</>],
        ]}
      />
      <Table
        head={['Quem registra', 'Onde', 'Como']}
        rows={[
          ['Token', <>macro {mono('RET')} do {mono('lexer.l')}</>, <>{mono('json_record_token')} com o nome do token, o {mono('yytext')} e a posição, junto com a criação da folha. Só os tokens devolvidos ao parser são registrados.</>],
          ['Erro léxico, sintático e semântico', <>{mono('report_error')} em {mono('main.c')}</>, <>Com o JSON ligado, formata a mensagem (num buffer de 1024 bytes), chama {mono('json_record_error')} e <strong>não escreve nada em stderr</strong>. Sem o JSON, escreve em stderr. Nos dois casos incrementa o contador de erros.</>],
        ]}
      />
      <Why>
        {mono('report_error')} não escreve em {mono('stderr')} no modo {mono('--json')} porque a saída tem de ser um único documento JSON em{' '}
        {mono('stdout')} que um programa lê sem filtrar: uma mensagem solta misturaria texto comum ao canal que a interface lê, e a mesma
        informação já está em {mono('errors')}.
      </Why>
      <P>
        Os erros semânticos entram como {mono('"semântico"')}, mas só quando a análise semântica foi pedida ({mono('--semantic')}); sem a flag, o{' '}
        {mono('--json')} só relata erros léxicos e sintáticos. O programa abaixo tem um tipo errado, e a diferença é visível em {mono('accepted')}:
      </P>
      <Code lang="text">
        {`$ cat e4.flux
func main() {
  var x: int = "a";
}
$ ./flux --json e4.flux | grep accepted
"accepted": true,
$ ./flux --json --semantic e4.flux | grep -A1 '"errors"'
"errors": [
  {"kind":"semântico","line":2,"column":16,"message":"Tipo incompatível: esperado int, encontrado string."}`}
      </Code>
      <P>
        A opção {mono('-t')} vence {mono('--json')}: com as duas, o programa lista os tokens em texto e termina antes de ligar o JSON.
      </P>

      <H2 title="Funções do json.c" />
      <P>
        Os protótipos das funções {mono('json_*')} abaixo estão declarados em {mono('src/fluxc.h')}, o cabeçalho do driver que o lexer, o
        {' '}{mono('main.c')} e o próprio {mono('json.c')} incluem, e não em {mono('tree.h')}.
      </P>
      <Fn name="json_enable" signature="void json_enable(void)">
        Liga o registro: põe {mono('enabled')} em 1. Chamada por {mono('main')} antes do {mono('yyparse')}, só com {mono('--json')}.
      </Fn>
      <Fn name="json_enabled" signature="int json_enabled(void)">
        Diz se o modo JSON está ligado. É o que o {mono('report_error')} consulta para escolher entre gravar o erro no registro ou escrever em{' '}
        {mono('stderr')}.
      </Fn>
      <Fn name="json_record_token" signature="void json_record_token(const char *type, const char *text, int line, int column)">
        Acrescenta um token ao vetor, se o modo JSON está ligado; se não, retorna sem fazer nada. Copia {mono('type')} e {mono('text')} para a
        arena com {mono('mem_strdup')} (o {mono('yytext')} é reaproveitado pelo Flex). O vetor cresce por {mono('grow')}. Chamada pela macro{' '}
        {mono('RET')} a cada token entregue ao parser.
      </Fn>
      <Fn name="json_record_error" signature="void json_record_error(const char *kind, int line, int column, const char *message)">
        Acrescenta um erro ao vetor, copiando {mono('kind')} e {mono('message')}. Não consulta {mono('enabled')}: só o {mono('report_error')}{' '}
        a chama, e só no modo JSON.
      </Fn>
      <Fn name="json_print" signature="void json_print(FILE *out, int accepted, int lines)">
        Escreve o objeto JSON inteiro em {mono('out')}. Imprime as cinco chaves na ordem {mono('accepted')}, {mono('lines')}, {mono('tokens')},{' '}
        {mono('errors')}, {mono('tree')}; cada token e cada erro vão em uma linha, separados por vírgula e quebra de linha, e uma lista vazia
        sai como {mono('[]')}. A árvore vem de {mono('put_node')} aplicado a {mono('parse_root')}, ou {mono('null')} se ela é nula. Termina com
        uma quebra de linha. Chamada por {mono('main')} depois da análise (e da análise semântica, se pedida), com o {mono('accepted')} e o{' '}
        {mono('source_lines()')} já calculados.
      </Fn>
      <Fn name="grow" signature="static void *grow(void *array, int count, int *cap, size_t size)">
        Garante espaço para mais um elemento: se {mono('count')} ainda é menor que a capacidade, devolve o mesmo vetor; senão dobra a
        capacidade (64 na primeira vez) com {mono('mem_grow')} e atualiza {mono('*cap')}. O vetor antigo fica na arena. Serve às duas listas.
      </Fn>
      <Fn name="put_string" signature="static void put_string(FILE *out, const char *s)">
        Escreve {mono('s')} entre aspas, aplicando os escapes do JSON. Percorre a string byte a byte, com as regras da tabela da próxima seção.
        Usada em todo texto que sai: {mono('label')}, {mono('text')}, {mono('type')}, {mono('kind')} e {mono('message')}.
      </Fn>
      <Fn name="kind_name" signature="static const char *kind_name(enum NodeKind kind)">
        Traduz o {mono('NodeKind')} para o texto do campo {mono('kind')}: {mono('"rule"')}, {mono('"token"')}, {mono('"empty"')} e, para o
        restante, {mono('"error"')}.
      </Fn>
      <Fn name="put_node" signature="static void put_node(FILE *out, const Node *node)">
        Escreve um nó como objeto JSON e, recursivamente, os filhos. Respeita a ordem e as condições da tabela das chaves do nó:{' '}
        {mono('text')} só se existe, a posição só se a linha não é 0, {mono('children')} só se há filho. Não emite espaços nem quebras de linha.
        A profundidade da recursão é a da árvore, limitada pela pilha do Bison.
      </Fn>

      <H2 title="Escape de strings" />
      <P>
        A tabela mostra o que o {mono('put_string')} faz com cada byte do texto. Os casos de controle e UTF-8 foram conferidos com um
        programa de teste contendo uma tabulação, um {mono('ç')}, um byte {mono('0xFF')} e um byte {mono('0x01')} dentro de uma string.
      </P>
      <Table
        head={['Byte ou sequência', 'Sai como']}
        rows={[
          [<>{mono('"')} e {mono('\\')}</>, <>{mono('\\"')} e {mono('\\\\')}</>],
          ['quebra de linha', mono('\\n')],
          ['tabulação', mono('\\t')],
          [<>qualquer outro byte menor que {mono('0x20')} (inclusive o retorno de carro)</>, <>{mono('\\u')} e quatro dígitos hexadecimais minúsculos, como {mono('\\u0001')} e {mono('\\u000d')}</>],
          [<>ASCII de {mono('0x20')} a {mono('0x7F')}</>, 'sem alteração (a barra / não é escapada)'],
          ['sequência UTF-8 bem formada de 2 a 4 bytes', <>sem alteração: o {mono('ç')} sai como está</>],
          ['byte que não abre uma sequência válida, ou sequência com continuação errada', <>{mono('\\ufffd')} (o caractere de substituição), consumindo só aquele byte</>],
        ]}
      />
      <Why>
        Bytes que não formam UTF-8 válido viram {mono('\\ufffd')} porque uma string FluxLang pode ter qualquer byte que o lexer aceite, e um JSON com UTF-8
        inválido não seria lido pelo {mono('JSON.parse')} da interface. Trocar o byte por {mono('U+FFFD')} mantém o documento válido e perde só aquele
        byte.
      </Why>
      <Callout kind="aviso">
        A validação é só estrutural: confere a faixa do primeiro byte e os bytes de continuação, mas não rejeita sequências com representação
        mais longa que o necessário nem os pontos reservados a pares substitutos. Conferido: os bytes {mono('E0 80 80')} e {mono('ED A0 80')} dentro de
        uma string saem sem alteração, enquanto {mono('C0 80')} vira dois {mono('\\ufffd')}. Na prática isso só importa para um arquivo com UTF-8
        malformado de propósito.
      </Callout>

      <H2 title="Limites" />
      <Table
        head={['Situação', 'O que acontece']}
        rows={[
          [
            'Expressão muito longa',
            <>A árvore tem profundidade proporcional ao número de operandos, porque os {mono('*_rest')} são recursivos à direita e a pilha do Bison tem limite de 10000 posições. Conferido com {mono('1 + 1 + ... + 1')}: até 4995 operandos o programa é aceito; com 5000, a pilha do Bison esgota e a análise é rejeitada com um erro sintático em português ({mono('Programa grande ou aninhado demais: o analisador esgotou a pilha (expressão encadeada longa demais).')}).</>,
          ],
          [
            <>Pilha do Bison esgotada com {mono('--json')}</>,
            <>O JSON sai com {mono('"accepted": false')}, {mono('"tree": null')} e um erro em {mono('errors')} (a mensagem acima, na posição do último token lido). Antes o Bison só escrevia {mono('memory exhausted')} em {mono('stderr')}, o JSON saía com {mono('"errors": []')} e a interface mostrava a rejeição sem mensagem.</>,
          ],
          [
            'Mensagem de erro longa',
            <>No modo JSON, {mono('report_error')} formata a mensagem num buffer de 1024 bytes e a trunca se passar disso.</>,
          ],
          [
            'Tamanho da árvore',
            <>Sem limite próprio: cada nó é um pedido à arena e nada é liberado. Um {mono('var a = 1;')} gera 40 nós. A saída de 4995 operandos chega a cerca de 4,3 MB de JSON.</>,
          ],
          [
            'Entrada vazia',
            <>{mono('"lines": 0')}, {mono('"tokens": []')} e {mono('"tree": null')}, com um erro sintático de fim do arquivo.</>,
          ],
        ]}
      />

      <H2 title="O contrato com a interface web" />
      <P>
        O formato do {mono('--json')} é um contrato: a interface o lê como está, sem validar, e {mono('web/src/lib/types.ts')} é o espelho TypeScript
        dele. Mudar uma chave ou o sentido de um campo em {mono('json.c')} obriga a mudar esse arquivo e quem o usa.
      </P>
      <Table
        head={['Saída do compilador', 'Tipo em types.ts', 'Onde a interface usa']}
        rows={[
          [<>objeto raiz</>, mono('CompileResult'), <>{mono('accepted')}, {mono('lines')}, {mono('tokens')}, {mono('errors')}, {mono('tree')}.</>],
          [<>item de {mono('tokens')}</>, mono('Token'), 'A lista de tokens; um clique leva o editor à posição.'],
          [<>item de {mono('errors')}</>, mono('CompileError'), <>A lista de erros e o realce das linhas com erro; {mono('kind')} é a união {mono("'léxico' | 'sintático' | 'semântico'")}.</>],
          [<>nó da árvore</>, mono('TreeNode'), <>A árvore sintática. {mono('NodeKind')} é {mono("'rule' | 'token' | 'empty' | 'error'")}; {mono('text')}, {mono('line')}, {mono('column')} e {mono('children')} são opcionais, como no JSON.</>],
        ]}
      />
      <P>
        O servidor de desenvolvimento ({mono('web/server/flux-api.ts')}) roda o {mono('./flux --json')} (e {mono('--semantic')} com{' '}
        {mono('?semantic=1')}), considera o resultado válido quando o código de saída é 0 ou 1 e há texto em {mono('stdout')}, e repassa esse texto como
        está. Um {mono('accepted')} falso com código 1 não é falha do servidor: é um programa rejeitado, e o JSON está inteiro.
      </P>
      <P>
        A árvore em JSON é a fiel, com os {mono('*_rest')} e os ε. O arquivo {mono('web/src/lib/tree.ts')} tem a versão compacta que a interface mostra:{' '}
        {mono('collapseRest')} tira os nós cujo nome termina em {mono('_rest')} ou {mono('_after_comma')}, sobe os filhos deles para o pai e esconde as
        folhas ε, e {mono('countNodes')} dá o total que aparece no título do painel. O {mono('flag')} não sai no JSON: a interface só recebe o que o {mono('put_node')} escreve.
      </P>
      <Callout kind="nota">
        O botão Executar não usa o {mono('--json')}: tem outro caminho, o {mono('/api/run')}. Ver{' '}
        <PageLink to="compilador/interface-web">A interface web</PageLink>. A mesma árvore alimenta ainda a AST, descrita em{' '}
        <PageLink to="compilador/ast">AST</PageLink>.
      </Callout>
    </>
  )
}
