import { Callout, Code, Diagram, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

interface Stage {
  x: number
  y: number
  name: string
  file: string
  out: string
  flag: string
}

const W = 138
const H = 66
const GAP = 34
const COL = (i: number) => 20 + i * (W + GAP)

const STAGES: Stage[] = [
  { x: COL(0), y: 24, name: '1. Léxico', file: 'lexer.l', out: 'texto → tokens', flag: '-t' },
  { x: COL(1), y: 24, name: '2. Sintaxe', file: 'parser.y', out: 'tokens → árvore', flag: '(sem flag)' },
  { x: COL(2), y: 24, name: '3. Árvore', file: 'tree.c, json.c', out: 'imprime a árvore', flag: '--tree, --json' },
  { x: COL(3), y: 24, name: '4. AST', file: 'ast_build.c', out: 'árvore → AST', flag: '--ast' },
  { x: COL(0), y: 170, name: '5. Semântica', file: 'sema.c, types.c', out: 'confere E1 a E24', flag: '--semantic' },
  { x: COL(1), y: 170, name: '6. Gerador de C', file: 'codegen_c.c', out: 'AST → texto C', flag: '--c' },
  { x: COL(2), y: 170, name: '7. gcc', file: 'compile_c()', out: 'C → executável', flag: '--build' },
  { x: COL(3), y: 170, name: '8. Execução', file: 'execute_program()', out: 'roda e apaga', flag: '--run' },
]

function Pipeline() {
  const width = COL(4) - GAP + 20
  const elbowY = 24 + H + 30 + 14
  const arrows: string[] = []
  for (const row of [0, 1]) {
    const y = (row === 0 ? 24 : 170) + H / 2
    for (let i = 0; i < 3; i += 1) {
      const x1 = COL(i) + W
      arrows.push(`M ${x1} ${y} L ${x1 + GAP - 2} ${y}`)
    }
  }
  arrows.push(`M ${COL(3) + W - 12} ${24 + H} L ${COL(3) + W - 12} ${elbowY + 16} L ${COL(0) + W / 2} ${elbowY + 16} L ${COL(0) + W / 2} ${170 - 2}`)
  return (
    <svg viewBox={`0 0 ${width} 270`} width={width} height="270" className="block max-w-none">
      <defs>
        <marker id="seta-visao" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted" />
        </marker>
      </defs>
      {arrows.map((d) => (
        <path key={d} d={d} fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-visao)" />
      ))}
      {STAGES.map((s) => (
        <g key={s.name}>
          <rect x={s.x} y={s.y} width={W} height={H} rx="6" strokeWidth="1.25" className="fill-bg stroke-line" />
          <text x={s.x + 10} y={s.y + 20} fontSize="13" fontWeight="600" className="fill-ink">
            {s.name}
          </text>
          <text x={s.x + 10} y={s.y + 38} fontSize="11" fontFamily="monospace" className="fill-muted">
            {s.file}
          </text>
          <text x={s.x + 10} y={s.y + 55} fontSize="11" className="fill-ink">
            {s.out}
          </text>
          <text x={s.x + W / 2} y={s.y + H + 18} fontSize="12" fontFamily="monospace" textAnchor="middle" className="fill-accent">
            {s.flag}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function VisaoGeral() {
  return (
    <>
      <H2 title="O caminho de um programa" />
      <P>
        O compilador é um único executável, {mono('./flux')}. Ele lê um programa FluxLang, passa-o por uma série de
        etapas e, conforme a opção da linha de comando, para numa delas e mostra o que produziu ou vai até o fim e gera
        e roda um programa de verdade. Todas as etapas vivem no mesmo processo e conversam por estruturas em memória: a
        única coisa que vai para o disco no caminho completo são o arquivo C temporário e o executável.
      </P>
      <Diagram
        title="As oito etapas do ./flux e a opção que para em cada uma"
        label="Fluxograma de oito etapas, em duas linhas: léxico, sintaxe, árvore de derivação e AST na primeira; análise semântica, gerador de C, gcc e execução na segunda. Cada caixa traz o arquivo da etapa e, abaixo, a opção da linha de comando que termina ali."
      >
        <Pipeline />
      </Diagram>
      <P>
        O programa passa por cada etapa nesta ordem. Uma etapa só roda se a anterior terminou sem erro: um erro léxico
        ou sintático impede a AST, um erro semântico impede a geração de C.
      </P>
      <Table
        head={['Etapa', 'Entrada', 'Saída', 'Arquivo', 'Quem chama']}
        rows={[
          [
            'Léxico',
            'Os caracteres do arquivo (ou da entrada padrão), lidos por yyin',
            <>Um token por chamada, com linha e coluna em {mono('yylloc')} e um nó-folha em {mono('yylval.node')}</>,
            mono('src/frontend/lexer.l'),
            <>O parser, ao pedir o próximo token; {mono('list_tokens')} no modo {mono('-t')}</>,
          ],
          [
            'Sintaxe',
            'A sequência de tokens',
            <>A árvore de derivação, guardada em {mono('parse_root')}; os erros sintáticos, por {mono('report_error')}</>,
            mono('src/frontend/parser.y'),
            <>{mono('yyparse()')}, chamado por {mono('run')}</>,
          ],
          [
            'Árvore de derivação',
            <>{mono('parse_root')}</>,
            <>Texto indentado ({mono('--tree')}) ou o objeto JSON ({mono('--json')})</>,
            <>{mono('src/frontend/tree.c')}, {mono('src/json.c')}</>,
            <>{mono('print_tree')} e {mono('json_print')}, chamados por {mono('run')}</>,
          ],
          [
            'AST',
            'A árvore de derivação, sem os nós de fatoração',
            <>Uma {mono('Program')} com as declarações, comandos e expressões</>,
            mono('src/semantic/ast_build.c'),
            <>{mono('build_ast')}, chamado por {mono('run')} só depois de um parse sem erros</>,
          ],
          [
            'Análise semântica',
            <>A {mono('Program')}</>,
            <>Os erros E1 a E24, por {mono('report_error')}, em ordem de posição</>,
            <>{mono('src/semantic/sema.c')}, {mono('src/semantic/types.c')}</>,
            <>{mono('semantic_check')}, chamado por {mono('run')}</>,
          ],
          [
            'Gerador de C',
            <>A {mono('Program')} já conferida</>,
            <>Um programa C completo, com a biblioteca de execução embutida, num {mono('FILE *')}</>,
            <>{mono('src/backend/codegen_c.c')}, {mono('src/backend/runtime/flux_rt.h')}</>,
            <>{mono('generate_c')}, chamado por {mono('run_codegen')}</>,
          ],
          [
            'gcc',
            'O arquivo C temporário',
            'O executável',
            <>{mono('compile_c')}, em {mono('src/backend/codegen_c.c')}</>,
            <>{mono('run_codegen')}</>,
          ],
          [
            'Execução',
            'O executável',
            'A saída do programa FluxLang e o código de saída dele',
            <>{mono('execute_program')}, em {mono('src/backend/codegen_c.c')}</>,
            <>{mono('run_codegen')}, no modo {mono('--run')}</>,
          ],
        ]}
      />
      <P>
        O parser e o lexer são gerados pelo Bison e pelo Flex a partir de {mono('parser.y')} e {mono('lexer.l')}. O
        resto é C escrito à mão. A biblioteca de execução, {mono('flux_rt.h')}, não é compilada junto com o compilador:
        o Makefile a transforma numa string C ({mono('build/runtime_src.c')}), que o gerador copia para dentro de todo
        programa que produz (ver <PageLink to="compilador/mapa-e-build">Mapa do repositório e build</PageLink>).
      </P>

      <H2 title="Onde cada opção para" />
      <P>
        Cada opção da linha de comando escolhe até onde o caminho vai e o que é impresso. A tabela mostra a última
        etapa que roda e a saída. O detalhe de cada opção, as combinações e os códigos de saída estão em{' '}
        <PageLink to="compilador/linha-de-comando">Linha de comando e variáveis de ambiente</PageLink>.
      </P>
      <Table
        head={['Opção', 'Etapas que rodam', 'O que sai']}
        rows={[
          ['(nenhuma)', 'Léxico e sintaxe', <>{mono('Programa aceito.')} ou {mono('Programa rejeitado.')}</>],
          [mono('-t'), 'Só o léxico (o parser nem é chamado)', 'Uma linha por token: posição, nome, texto'],
          [mono('--tree'), 'Léxico e sintaxe', 'A árvore de derivação (se o parser chegou a montá-la), depois a linha de aceito ou rejeitado'],
          [mono('--json'), 'Léxico e sintaxe (mais a semântica se pedida)', 'Só o JSON, na saída padrão'],
          [mono('--ast'), 'Até a AST, sem a semântica', 'A AST, depois a linha de aceito ou rejeitado'],
          [mono('--semantic'), 'Até a análise semântica', <>{mono('Programa aceito.')} ou {mono('Programa rejeitado.')}, com os erros E1 a E24</>],
          [mono('--c'), 'Até o gerador de C (a semântica é ligada)', 'O programa C na saída padrão'],
          [mono('--build'), 'Até o gcc', <>O executável no disco e a linha {mono('Executável gerado: nome')}</>],
          [mono('--run'), 'Todas', 'A saída do programa, e o código de saída dele'],
        ]}
      />
      <Callout kind="nota">
        {mono('--c')}, {mono('--build')} e {mono('--run')} ligam a análise semântica sozinhos: o gerador de C assume um
        programa conferido (tipos e escopos resolvidos), então nunca recebe um que a semântica rejeitaria.
      </Callout>

      <H2 title="Um programa de ponta a ponta" />
      <P>
        O programa abaixo tem uma função, uma chamada e uma impressão. Todos os trechos desta seção são a saída real do{' '}
        {mono('./flux')} sobre ele.
      </P>
      <Code lang="flux">
        {`func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    var x:int = soma(2, 3);
    terminal.log("x = " + toString(x));
}`}
      </Code>
      <H3 title="Léxico e sintaxe" />
      <P>
        Sem opções, o compilador só lê e confere a sintaxe. Com {mono('-t')}, mostra os tokens que o lexer entregou
        (aqui, os seis primeiros de cinquenta):
      </P>
      <Code lang="bash">{`./flux -t soma.flux | head -6`}</Code>
      <Code lang="text">
        {`1:1	FUNC
1:6	IDENTIFIER           soma
1:10	LPAREN
1:11	IDENTIFIER           a
1:12	COLON
1:13	TYPE_INT`}
      </Code>
      <H3 title="Árvore de derivação e AST" />
      <P>
        {mono('--tree')} imprime a árvore que o parser montou, um nó por regra da BNF (as primeiras doze linhas de
        trezentas e seis). {mono('--ast')} imprime a árvore enxuta que sai da conversão: sem os nós de fatoração, só o que a
        semântica e o gerador precisam.
      </P>
      <Code lang="bash">{`./flux --tree soma.flux | head -12`}</Code>
      <Code lang="text">
        {`program
  before_main
    FUNC 'func' 1:1
    after_func
      IDENTIFIER 'soma' 1:6
      function_rest
        LPAREN '(' 1:10
        parameter_list
          parameters
            parameter
              IDENTIFIER 'a' 1:11
              COLON ':' 1:12`}
      </Code>
      <Code lang="bash">{`./flux --ast soma.flux`}</Code>
      <Code lang="text">
        {`Program
  Func soma(a:int, b:int) :int
    Block
      Return
        Binary +
          Ident a
          Ident b
  Func main()
    Block
      Var x :int
        Values
          Call
            Ident soma
            Int 2
            Int 3
      ExprStmt
        Call
          Field log
            Ident terminal
          Binary +
            String "x = "
            Call
              Ident toString
              Ident x
Programa aceito.`}
      </Code>
      <H3 title="Geração de C e execução" />
      <P>
        {mono('--c')} imprime o programa C inteiro: primeiro a biblioteca de execução (mais de mil linhas, igual para
        todo programa), depois o código do programa. Abaixo, só a parte do programa. Cada subexpressão vira um
        temporário ({mono('t0')}, {mono('t1')}, ...), o que fixa a ordem de avaliação da esquerda para a direita, e todo
        valor é um {mono('FxValue')} com etiqueta.
      </P>
      <Code lang="bash">{`./flux --c soma.flux | sed -n '/---------- programa/,$p'`}</Code>
      <Code lang="c">
        {`/* ---------- programa ---------- */


static FxValue f_soma(FxValue v_a, FxValue v_b);
static FxValue f_main(void);

static FxValue f_soma(FxValue v_a, FxValue v_b)
{
  fx_check_stack();
  FX_LINE(2);
  FxValue t0 = v_a;
  FxValue t1 = v_b;
  FxValue t2 = fx_add(t0, t1);
  return t2;
  return fx_null();
}

static FxValue f_main(void)
{
  fx_check_stack();
  FX_LINE(6);
  FxValue t0 = f_soma(fx_int(2), fx_int(3));
  FxValue v_x = t0;
  FX_LINE(7);
  FxValue t2 = v_x;
  FxValue t3 = fx_to_string(t2);
  FxValue t4 = fx_add(fx_str("x = "), t3);
  FxValue t1 = fx_log(t4);
  (void)t1;
  return fx_null();
}

static int fx_program(void) {
  fx_init(__builtin_frame_address(0));
  f_main();
  return 0;
}

int main(void) { return fx_start(fx_program); }`}
      </Code>
      <P>
        {mono('--run')} escreve esse C num arquivo temporário, chama o {mono('gcc')}, executa o resultado e apaga os dois:
      </P>
      <Code lang="bash">{`./flux --run soma.flux`}</Code>
      <Code lang="text">{`x = 5`}</Code>

      <H2 title="O que acompanha o caminho" />
      <P>Alguns módulos não são uma etapa, mas atravessam várias delas.</P>
      <Table
        head={['Módulo', 'Papel', 'Onde está documentado']}
        rows={[
          [
            <>{mono('src/main.c')}, {mono('src/fluxc.h')}</>,
            <>O driver: lê as opções, chama as etapas na ordem, formata todos os erros com {mono('report_error')} e decide o código de saída.</>,
            <PageLink to="compilador/linha-de-comando">Linha de comando e variáveis de ambiente</PageLink>,
          ],
          [
            <>{mono('src/util/mem.c')}</>,
            'A arena de onde sai toda a memória do compilador, liberada de uma vez no fim.',
            <PageLink to="compilador/arena">Arena de memória</PageLink>,
          ],
          [
            <>{mono('src/json.c')}</>,
            <>Guarda tokens e erros durante a análise e imprime tudo como JSON no fim ({mono('--json')}).</>,
            <PageLink to="compilador/arvore-json">Árvore de derivação e JSON</PageLink>,
          ],
          [
            <>{mono('src/backend/runtime/flux_rt.h')}</>,
            'A biblioteca de execução que entra em todo C gerado: valores, operadores, run, terminal e o coletor de lixo.',
            <>
              <PageLink to="compilador/runtime">Biblioteca de execução</PageLink> e{' '}
              <PageLink to="compilador/coletor">Coletor de lixo</PageLink>
            </>,
          ],
          [
            <>{mono('web/')}</>,
            <>A interface gráfica. Não reimplementa nada: roda o {mono('./flux')} por uma API.</>,
            <PageLink to="compilador/interface-web">Interface web</PageLink>,
          ],
        ]}
      />
      <Why>
        {mono('yyparse()')} devolve 0 mesmo quando o modo pânico recuperou erros, então o resultado do parser sozinho não
        diz se o programa é válido. O driver só considera o programa aceito se o parser devolveu 0 e nenhum erro foi
        reportado ({mono('error_count')} igual a zero); a AST, a semântica e o gerador de C só rodam nesse caso. Veja{' '}
        <PageLink to="compilador/modo-panico">Modo pânico</PageLink> e o fluxo de {mono('run')} em{' '}
        <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>.
      </Why>
      <P>
        Cada etapa tem a sua página: <PageLink to="compilador/lexico">Léxico</PageLink>,{' '}
        <PageLink to="compilador/parser">Parser</PageLink>, <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink>,{' '}
        <PageLink to="compilador/ast">AST</PageLink>, <PageLink to="compilador/semantica">Semântica</PageLink> e{' '}
        <PageLink to="compilador/gerador-c">Gerador de C</PageLink>. A <PageLink to="compilador/referencia">referência por arquivo</PageLink> lista
        cada função de cada arquivo.
      </P>
    </>
  )
}
