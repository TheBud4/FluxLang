import { Callout, Code, Diagram, Fn, H2, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

interface Step {
  title: string
  note: string
  fn: string
}

const STEPS: Step[] = [
  { title: '1. Contar', note: 'cada alocação soma bytes em fx_gc_since', fn: 'fx_gc_alloc' },
  { title: '2. Decidir', note: 'fx_gc_since passou do limite, ou o estresse está ligado', fn: 'fx_gc_alloc' },
  { title: '3. Salvar os registradores', note: 'uma cópia no quadro da coleta, para a pilha os mostrar', fn: 'fx_gc_collect' },
  { title: '4. Ordenar os blocos', note: 'um vetor por endereço, para achar o bloco de um ponteiro', fn: 'fx_gc_collect' },
  { title: '5. Marcar as raízes', note: 'os globais registrados e a pilha do C, de forma conservadora', fn: 'fx_gc_mark_value, fx_gc_scan_range' },
  { title: '6. Rastrear', note: 'os ponteiros dentro de listas e objetos, pelo tipo do bloco', fn: 'fx_gc_trace' },
  { title: '7. Varrer', note: 'libera os blocos sem marca e ajusta o limite', fn: 'fx_gc_collect' },
]

function CycleDiagram() {
  return (
    <svg viewBox="0 0 770 366" width="770" height="366" className="block max-w-none">
      {STEPS.map((s, i) => {
        const y = 8 + i * 50
        return (
          <g key={s.title}>
            <rect x="10" y={y} width="460" height="40" rx="6" strokeWidth="1.25" className={i === 4 ? 'fill-panel stroke-accent' : 'fill-bg stroke-line'} />
            <text x="22" y={y + 17} fontSize="13" fontWeight="600" className="fill-ink">
              {s.title}
            </text>
            <text x="22" y={y + 33} fontSize="11" className="fill-muted">
              {s.note}
            </text>
            <text x="490" y={y + 25} fontSize="12" fontFamily="monospace" className="fill-ink">
              {s.fn}
            </text>
          </g>
        )
      })}
      <text x="490" y="362" fontSize="11" className="fill-muted">
        os passos 3 a 7 são fx_gc_collect
      </text>
    </svg>
  )
}

interface Piece {
  label: string
  note: string
  x: number
  width: number
}

const BLOCK: Piece[] = [
  { label: 'next', note: '8 bytes', x: 10, width: 110 },
  { label: 'size', note: '8 bytes', x: 120, width: 110 },
  { label: 'kind, mark', note: '1 + 1, e o resto', x: 230, width: 130 },
  { label: 'conteúdo', note: 'size bytes, zerados', x: 360, width: 330 },
]

function BlockDiagram() {
  return (
    <svg viewBox="0 0 710 130" width="710" height="130" className="block max-w-none">
      <text x="10" y="18" fontSize="13" fontWeight="600" className="fill-ink">
        Um bloco do coletor: cabeçalho de 32 bytes e o conteúdo logo depois
      </text>
      {BLOCK.map((p, i) => (
        <g key={p.label}>
          <rect x={p.x} y="30" width={p.width} height="44" strokeWidth="1.25" className={i === 3 ? 'fill-panel stroke-accent' : 'fill-bg stroke-line'} />
          <text x={p.x + 10} y="50" fontSize="13" fontWeight="600" fontFamily="monospace" className="fill-ink">
            {p.label}
          </text>
          <text x={p.x + 10} y="66" fontSize="11" className="fill-muted">
            {p.note}
          </text>
        </g>
      ))}
      <text x="10" y="98" fontSize="11" className="fill-muted">
        ponteiro para o cabeçalho (b)
      </text>
      <text x="360" y="98" fontSize="11" className="fill-muted">
        ponteiro para o conteúdo (b + 1), o que as funções da biblioteca devolvem
      </text>
      <text x="10" y="118" fontSize="11" className="fill-muted">
        fx_gc_find aceita os dois, e qualquer endereço entre eles e o fim do conteúdo
      </text>
    </svg>
  )
}

export function Coletor() {
  return (
    <>
      <H2 title="O papel do coletor de lixo" />
      <P>
        Um programa que concatena textos num laço cresceria sem limite se ninguém liberasse nada. O coletor de lixo da <PageLink to="compilador/runtime">biblioteca de execução</PageLink> libera, durante a
        execução, os blocos de memória que o programa não alcança mais. É um coletor de marca e varre, conservador, que mora em {mono('src/backend/runtime/flux_rt.h')} e vai dentro de todo programa gerado: não há
        biblioteca à parte nem chamada de liberação no código gerado.
      </P>
      <Table
        head={['', 'Detalhe']}
        rows={[
          ['Quem aloca', <>Toda criação de texto, lista ou objeto da biblioteca: {mono('fx_concat')}, {mono('fx_dup_printf')}, {mono('fx_new_list')}, {mono('fx_new_object')}, o crescimento dos buffers de lista e de objeto, {mono('fx_input')} e as leituras do {mono('run')}.</>],
          ['Quem liga', <>{mono('fx_init')} lê as variáveis de ambiente; o gerador emite {mono('fx_gc_root')} para cada global em {mono('fx_program')}.</>],
          ['Quando roda', <>Dentro de uma alocação, antes de ela acontecer, se os bytes alocados desde a última coleta passaram do limite (4 MiB no começo), ou a cada alocação em estresse. Nunca em outro ponto.</>],
          ['O que acha vivo', <>O que os globais registrados apontam e o que qualquer palavra da pilha do C ou dos registradores salvos parece apontar, mais, a partir daí, os ponteiros dentro de listas e objetos.</>],
          ['Depende de', <>{mono('calloc')}, {mono('free')}, {mono('malloc')}, {mono('realloc')} e {mono('qsort')} da biblioteca C; do endereço-base da pilha que {mono('fx_init')} recebe; de assembly em linha para x86-64.</>],
          ['Depende do compilador', <>Atributos do {mono('gcc')} e do {mono('clang')}: {mono('noinline')}, {mono('no_sanitize_address')}, {mono('aligned')} e {mono('__builtin_unwind_init')}.</>],
        ]}
      />
      <P>
        O efeito, medido com um laço de 3 milhões de concatenações ({mono('s = "item " + toString(i);')}, dois blocos por volta): com o coletor, o programa usou cerca de 9 MB e 0,63 s; com{' '}
        {mono('FLUX_GC=0')}, cerca de 330 MB e 0,43 s. O ERROS.md traz os mesmos números (&quot;cerca de 9 MB contra 330 MB, e cerca de 30% mais tempo&quot;; nesta medida o tempo subiu mais, 46%).
      </P>
      <Diagram
        title="O ciclo de uma coleta, da contagem de bytes à varredura"
        label="Sete caixas empilhadas: contar, decidir, salvar os registradores, ordenar os blocos, marcar as raízes (destacada), rastrear e varrer. À direita de cada caixa, a função que faz o passo."
      >
        <CycleDiagram />
      </Diagram>

      <H2 title="Blocos e a contabilidade do heap" />
      <P>
        Todo bloco que a biblioteca aloca tem um cabeçalho {mono('FxBlock')} seguido do conteúdo, e entra numa lista ligada global. O ponteiro que a biblioteca usa (o de um texto, o de um {mono('FxList')}) é o do
        conteúdo, logo depois do cabeçalho.
      </P>
      <Code lang="c">
        {`typedef enum { FXB_RAW, FXB_LIST, FXB_VALUES, FXB_OBJ, FXB_KEYS } FxBlockKind;

typedef struct FxBlock {
  struct FxBlock *next;
  size_t size;
  unsigned char kind, mark;
} __attribute__((aligned(16))) FxBlock;`}
      </Code>
      <Diagram
        title="Um bloco: o cabeçalho FxBlock, de 32 bytes (medido), e o conteúdo"
        label="Quatro caixas lado a lado: next, size, kind e mark, e o conteúdo. Abaixo, o ponteiro para o cabeçalho e o ponteiro para o conteúdo."
      >
        <BlockDiagram />
      </Diagram>
      <Table
        head={['Tipo do bloco', 'O que é', 'O que o coletor faz com ele']}
        rows={[
          [mono('FXB_RAW'), <>Bytes sem ponteiros: textos, buffers de leitura de {mono('input')} e de {mono('run')}, o vetor {mono('argv')}.</>, 'nada: não há ponteiros dentro.'],
          [mono('FXB_LIST'), <>O {mono('FxList')}.</>, <>Marca o buffer {mono('v')}.</>],
          [mono('FXB_VALUES'), <>Um vetor de {mono('FxValue')}: o buffer de uma lista ou os valores de um objeto.</>, <>Percorre os {mono('size / sizeof(FxValue)')} elementos e marca o que cada um aponta.</>],
          [mono('FXB_OBJ'), <>O {mono('FxObj')}.</>, <>Marca o vetor de chaves e o de valores.</>],
          [mono('FXB_KEYS'), <>O vetor de chaves de um objeto.</>, <>Marca cada chave (um texto do heap, ou um literal, que não é bloco e é ignorado).</>],
        ]}
      />
      <Table
        head={['Variável (static)', 'Papel']}
        rows={[
          [mono('fx_blocks'), 'a cabeça da lista de todos os blocos vivos; o bloco novo entra na frente.'],
          [mono('fx_block_count'), 'quantos blocos há na lista.'],
          [mono('fx_gc_since'), 'bytes alocados desde a última coleta (conteúdo mais cabeçalho).'],
          [mono('fx_gc_threshold'), <>o limite: coleta-se quando {mono('fx_gc_since')} o alcança. Começa em 4 MiB.</>],
          [<>{mono('fx_gc_disabled')}, {mono('fx_gc_stress')}</>, <>os modos de ambiente ({mono('FLUX_GC=0')} e {mono('FLUX_GC_STRESS')}).</>],
          [<>{mono('fx_gc_runs')}, {mono('fx_gc_freed')}</>, <>contadores para {mono('FLUX_GC_STATS')}: coletas feitas e blocos liberados no total.</>],
          [<>{mono('fx_roots')}, {mono('fx_n_roots')}, {mono('fx_cap_roots')}</>, <>o vetor das raízes registradas, com {mono('realloc')}: ponteiros para as variáveis globais ({mono('FxValue *')}).</>],
          [<>{mono('fx_gc_sorted')}, {mono('fx_gc_n')}</>, <>só durante uma coleta: todos os blocos, ordenados por endereço.</>],
          [<>{mono('fx_gc_todo')}, {mono('fx_gc_todo_n')}, {mono('fx_gc_todo_cap')}</>, <>só durante uma coleta: a pilha de blocos marcados que faltam rastrear.</>],
        ]}
      />
      <Code lang="c">
        {`static FxBlock *fx_blocks;
static size_t fx_block_count;
static size_t fx_gc_since;
static size_t fx_gc_threshold = 4u << 20;
static int fx_gc_disabled, fx_gc_stress;
static size_t fx_gc_runs, fx_gc_freed;

static FxValue **fx_roots;
static size_t fx_n_roots, fx_cap_roots;

static FxBlock **fx_gc_sorted;
static size_t fx_gc_n;
static FxBlock **fx_gc_todo;
static size_t fx_gc_todo_n, fx_gc_todo_cap;`}
      </Code>
      <Why>
        {mono('flux_rt.h')}: todo bloco que a biblioteca aloca (textos, listas, objetos e os buffers deles) entra numa lista, com um tipo. O tipo é o que deixa o coletor saber, sem ajuda do código gerado, quais
        palavras de um bloco são ponteiros (um texto não tem nenhum; um vetor de {mono('FxValue')} tem um em cada elemento que for texto, lista ou objeto).
      </Why>
      <Fn name="fx_gc_alloc" signature="FX_FN void *fx_gc_alloc(size_t n, FxBlockKind kind)">
        O ponto único de alocação. Se o coletor não está desligado e ({mono('fx_gc_stress')} ou {mono('fx_gc_since >= fx_gc_threshold')}), chama {mono('fx_gc_collect')} primeiro. Depois aloca com{' '}
        {mono('calloc(1, sizeof(FxBlock) + size)')}, em que {mono('size')} é {mono('n')} (ou 1, se for 0), grava {mono('size')} e {mono('kind')}, põe o bloco na frente de {mono('fx_blocks')}, soma o tamanho a{' '}
        {mono('fx_block_count')} e a {mono('fx_gc_since')}, e devolve o endereço do conteúdo ({mono('b + 1')}). O conteúdo vem zerado. Sem memória, {mono('fx_no_memory')}.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: a coleta vem antes de alocar, e não depois: o bloco novo nunca é coletado antes de ser usado. Se a coleta viesse depois, o endereço devolvido ainda não estaria em nenhuma
        variável, e o bloco recém-criado seria tido como lixo.
      </Why>
      <Code lang="c">
        {`FX_FN void *fx_gc_alloc(size_t n, FxBlockKind kind) {
  if (!fx_gc_disabled && (fx_gc_stress || fx_gc_since >= fx_gc_threshold))
    fx_gc_collect();
  size_t size = n ? n : 1;
  FxBlock *b = calloc(1, sizeof *b + size);
  if (!b)
    fx_no_memory();
  b->size = size;
  b->kind = (unsigned char)kind;
  b->next = fx_blocks;
  fx_blocks = b;
  fx_block_count++;
  fx_gc_since += size + sizeof *b;
  return b + 1;
}`}
      </Code>
      <Fn name="fx_alloc" signature="FX_FN void *fx_alloc(size_t n)">
        {mono('fx_gc_alloc(n, FXB_RAW)')}: bytes sem ponteiros, para textos e buffers de leitura. É o que {mono('fx_concat')}, {mono('fx_dup_printf')}, {mono('fx_input')} e o {mono('run')} usam.
      </Fn>
      <Fn name="fx_gc_report" signature="FX_FN void fx_gc_report(void)">
        Escreve na saída de erro {mono('[gc] N coletas, M blocos liberados, K blocos vivos')}, com {mono('fx_gc_runs')}, {mono('fx_gc_freed')} e {mono('fx_block_count')}. Registrada com {mono('atexit')} por{' '}
        {mono('fx_init')} se {mono('FLUX_GC_STATS')} existe; roda quando o programa termina pelo {mono('exit')}.
      </Fn>

      <H2 title="As raízes: de onde a busca começa" />
      <P>
        Há duas fontes de raízes. A primeira são as variáveis globais do programa: o gerador emite uma chamada {mono('fx_gc_root(&v_nome)')} para cada uma, no começo de {mono('fx_program')}. A segunda é a pilha do C,
        que guarda as variáveis locais, os parâmetros e os temporários {mono('t0')}, {mono('t1')}, ... do código gerado, mais os registradores salvos.
      </P>
      <Why>
        {mono('flux_rt.h')}: a pilha é varrida de forma conservadora: qualquer palavra que aponte para dentro de um bloco o mantém vivo. Assim o código gerado não precisa registrar cada temporário nem cada
        variável local como raiz; só os globais, que moram em memória estática e não na pilha, precisam ser registrados.
      </Why>
      <Fn name="fx_gc_root" signature="FX_FN void fx_gc_root(FxValue *slot)">
        Registra {mono('slot')} (o endereço de uma variável global) como raiz: o que ela guarda não é lixo. Acrescenta ao vetor {mono('fx_roots')}, que começa em 16 posições e dobra com {mono('realloc')}. O vetor
        é de {mono('malloc')}, não do coletor, e nunca é liberado. Sem memória, {mono('fx_no_memory')}. Chamada pelo código gerado, uma vez por nome global, antes de qualquer inicializador.
      </Fn>

      <H2 title="Varredura conservadora e fx_gc_find" />
      <P>
        Em vez de saber quais palavras da pilha são ponteiros, o coletor trata toda palavra alinhada como um possível ponteiro e pergunta a {mono('fx_gc_find')} se ela cai dentro de algum bloco. Se cair, o bloco
        está vivo; se não (um inteiro, um literal, o endereço de uma variável da pilha), a palavra é ignorada. Um inteiro que por acaso lembra um endereço de bloco mantém esse bloco vivo à toa: é o preço do
        método.
      </P>
      <Fn name="fx_gc_scan_range" signature="FX_FN void fx_gc_scan_range(const char *lo, const char *hi)">
        Varre {mono('[lo, hi)')} uma palavra de 8 bytes por vez: arredonda {mono('lo')} para cima ao múltiplo de 8 e, enquanto uma palavra inteira cabe antes de {mono('hi')}, passa o valor dela a{' '}
        {mono('fx_gc_mark_ptr')}. Declarada {mono('noinline')} e {mono('no_sanitize_address')}.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: {mono('fx_gc_scan_range')} fica fora do AddressSanitizer ({mono('no_sanitize_address')}) porque lê a pilha inteira, inclusive o que o sanitizador marcou como proibido (as regiões
        de proteção em volta de cada variável local). Com a instrumentação ligada, essa leitura seria acusada como erro.
      </Why>
      <Fn name="fx_gc_find" signature="FX_FN FxBlock *fx_gc_find(const void *p)">
        Acha o bloco que contém o endereço {mono('p')}, ou {mono('NULL')}. Faz uma busca binária em {mono('fx_gc_sorted')} pelo último bloco cujo endereço é menor ou igual a {mono('p')} e confere se {mono('p')} está
        entre o início do cabeçalho e o fim do conteúdo ({mono('(char *)(b + 1) + size')}). Só vale durante uma coleta, quando {mono('fx_gc_sorted')} existe.
      </Fn>
      <Code lang="c">
        {`FX_FN FxBlock *fx_gc_find(const void *p) {
  size_t lo = 0, hi = fx_gc_n;
  while (lo < hi) {
    size_t mid = (lo + hi) / 2;
    if ((const void *)fx_gc_sorted[mid] <= p)
      lo = mid + 1;
    else
      hi = mid;
  }
  if (lo == 0)
    return NULL;
  FxBlock *b = fx_gc_sorted[lo - 1];
  const char *end = (const char *)(b + 1) + b->size;
  return ((const char *)p >= (const char *)b && (const char *)p < end) ? b : NULL;
}`}
      </Code>
      <Why>
        {mono('flux_rt.h')}: vale um ponteiro para o meio do conteúdo e também um ponteiro para o cabeçalho. Com otimização, o compilador pode guardar só o endereço que o {mono('calloc')} devolveu (o cabeçalho) e
        recalcular o do conteúdo na hora de usar; um bloco cujo único ponteiro vivo é o do cabeçalho não pode ser tido como morto. O {mono('gcc')} escondeu esse erro; o {mono('clang')} o mostrou (AGENTS.md,
        &quot;Armadilhas&quot;).
      </Why>
      <Callout kind="nota">
        Medido: tirei de {mono('fx_gc_find')} a aceitação do cabeçalho (a conta passou a ser {mono('p >= (char *)(b + 1)')}) no C gerado de seis casos de {mono('tests/exec')} e rodei com {mono('FLUX_GC_STRESS=1')}.
        Com o {mono('clang')} 22 em {mono('-O1')} e {mono('-O2')}, três falharam ({mono('gc_integridade')}, {mono('textos')} e {mono('objetos')}); com o {mono('gcc')} 16, em {mono('-O1')} e {mono('-O2')}, todos passaram. É o
        comportamento que o AGENTS.md e a nota que havia no código descrevem.
      </Callout>
      <Fn name="fx_block_cmp" signature="FX_FN int fx_block_cmp(const void *a, const void *b)">
        O comparador do {mono('qsort')} sobre o vetor de ponteiros para bloco: ordena por endereço, devolvendo {mono('(x > y) - (x < y)')}.
      </Fn>
      <Fn name="fx_gc_mark_ptr" signature="FX_FN void fx_gc_mark_ptr(const void *p)">
        Marca o bloco que contém {mono('p')}, se houver e ainda não estiver marcado: {mono('NULL') } e endereços fora de qualquer bloco são ignorados. Ao marcar, empilha o bloco em {mono('fx_gc_todo')} (que
        cresce de 256 e dobra com {mono('realloc')}) para o rastreamento depois. Como o rastreamento usa essa pilha explícita e não recursão, a profundidade de listas aninhadas não consome a pilha do C durante a coleta.
      </Fn>
      <Fn name="fx_gc_mark_value" signature="FX_FN void fx_gc_mark_value(const FxValue *v)">
        Se {mono('v')} é um texto, uma lista ou um objeto, chama {mono('fx_gc_mark_ptr')} com o ponteiro dele; os demais valores (inteiros, floats, bools, {mono('null')}) não apontam para nada.
      </Fn>
      <Fn name="fx_gc_trace" signature="FX_FN void fx_gc_trace(FxBlock *b)">
        Marca o que um bloco já marcado guarda, conforme o tipo, na tabela da seção &quot;Blocos&quot;. Para {mono('FXB_VALUES')} e {mono('FXB_KEYS')} percorre o bloco inteiro (até {mono('cap')}, não até {mono('n')}); as
        vagas sem uso valem {mono('null')} (o {mono('calloc') } zera, e o {mono('remove')} limpa a que sobrou), então não seguram nada.
      </Fn>

      <H2 title="Salvando os registradores" />
      <P>
        Um ponteiro vivo pode estar só num registrador que o C preserva entre chamadas (os registradores &quot;callee-saved&quot;), e não em memória. Quando {mono('fx_gc_collect')} começa, ela copia esses registradores
        para variáveis locais do próprio quadro, que a varredura da pilha enxerga. Em x86-64 isso é assembly em linha; em outras arquiteturas, {mono('__builtin_unwind_init()')}.
      </P>
      <Code lang="c">
        {`  uintptr_t saved[16] __attribute__((aligned(16))) = {0};
#if defined(__x86_64__) && defined(_WIN32)
  uintptr_t saved_xmm[20] __attribute__((aligned(16))) = {0};
  __asm__ volatile("movups %%xmm6, 0(%0)\\n\\tmovups %%xmm7, 16(%0)\\n\\tmovups %%xmm8, 32(%0)\\n\\t"
                   "movups %%xmm9, 48(%0)\\n\\tmovups %%xmm10, 64(%0)\\n\\tmovups %%xmm11, 80(%0)\\n\\t"
                   "movups %%xmm12, 96(%0)\\n\\tmovups %%xmm13, 112(%0)\\n\\tmovups %%xmm14, 128(%0)\\n\\t"
                   "movups %%xmm15, 144(%0)"
                   : : "c"(saved_xmm) : "memory");
#endif
#if defined(__x86_64__)
  __asm__ volatile("movq %%rbx, 0(%0)\\n\\tmovq %%rbp, 8(%0)\\n\\tmovq %%r12, 16(%0)\\n\\t"
                   "movq %%r13, 24(%0)\\n\\tmovq %%r14, 32(%0)\\n\\tmovq %%r15, 40(%0)\\n\\t"
                   "movq %%rdi, 48(%0)\\n\\tmovq %%rsi, 56(%0)"
                   : : "c"(saved) : "memory");
#else
  __builtin_unwind_init();
#endif`}
      </Code>
      <Table
        head={['Registradores', 'Onde são salvos', 'Quando']}
        rows={[
          [<>{mono('rbx')}, {mono('rbp')}, {mono('r12')} a {mono('r15')}</>, <>{mono('saved[0..5]')}</>, 'sempre em x86-64 (callee-saved em SysV e em Windows x64).'],
          [<>{mono('rdi')}, {mono('rsi')}</>, <>{mono('saved[6..7]')}</>, <>sempre em x86-64; só no Windows x64 são callee-saved, no SysV a cópia é inofensiva.</>],
          [<>{mono('xmm6')} a {mono('xmm15')}</>, <>{mono('saved_xmm')}, 16 bytes cada</>, <>só no Windows x64 (callee-saved lá). Um {mono('FxValue')} de 16 bytes pode estar num registrador {mono('xmm')}.</>],
          ['os demais', 'não precisam', <>x86-64: os de uso geral que sobram são caller-saved, e o chamador já os guardou na pilha, onde a varredura os vê. Outras arquiteturas: {mono('__builtin_unwind_init')} faz o equivalente.</>],
        ]}
      />
      <Why>
        {mono('flux_rt.h')}: a nota que havia no código dizia que o {mono('__builtin_unwind_init')} faz esse salvamento no {mono('gcc')}, mas não no {mono('clang')}, e que por isso o x86-64 tem o assembly próprio e
        o {mono('__builtin_unwind_init')} ficou só no {mono('#else')}, para as outras arquiteturas. Medido: trocar o assembly por {mono('__builtin_unwind_init()')} nos mesmos quatro casos e rodar com {mono('FLUX_GC_STRESS=1')}
        passou com o {mono('clang')} 22 e com o {mono('gcc')} 16, em {mono('-O1')} e {mono('-O2')}, então a falha que motivou o assembly não se reproduziu aqui. O assembly continua correto e não custa nada; mas o
        caminho de outras arquiteturas ({mono('__builtin_unwind_init')} com o {mono('clang')}) é o que a nota que havia no código dizia ser insuficiente, e nunca foi testado (o macOS em Apple Silicon cairia nele).
      </Why>
      <Why>
        {mono('flux_rt.h')}: no Windows x64, além dos registradores gerais, são preservados {mono('rdi')}, {mono('rsi')} e {mono('xmm6')} a {mono('xmm15')}, e um valor de 16 bytes ({mono('FxValue')}) pode estar num{' '}
        {mono('xmm')}; por isso há o segundo bloco de assembly, e {mono('saved_xmm')} entra no cálculo do início da varredura. Confirmado no assembly gerado pelo {mono('x86_64-w64-mingw32-gcc')}: aparece o{' '}
        {mono('movups %xmm6, (%rax)')}; o {mono('gcc')} do Linux não gera essa instrução.
      </Why>
      <Why>
        {mono('flux_rt.h')}: o {mono('rcx')} faz o papel de ponteiro nos dois blocos ({mono('"c"(saved)')}) porque nenhuma convenção de chamada o preserva: os demais registradores saem intactos, e o compilador não precisa
        pegar um deles emprestado para guardar o endereço do vetor antes de salvá-lo.
      </Why>

      <H2 title="A coleta: marcar e varrer" />
      <Fn name="fx_gc_collect" signature="FX_FN void fx_gc_collect(void)">
        Uma coleta completa, na ordem: (1) salva os registradores, como acima; (2) soma 1 a {mono('fx_gc_runs')}; (3) copia a lista de blocos para um vetor ({mono('malloc')}) e o ordena por endereço com{' '}
        {mono('qsort')}; (4) zera a pilha de rastreamento; (5) marca as raízes registradas; (6) calcula o menor endereço a varrer, o menor entre uma variável local ({mono('here')}, só para dar um endereço no quadro atual),{' '}
        {mono('saved')} e, no Windows, {mono('saved_xmm')}, e varre dali até a base da pilha mais 64 bytes; (7) rastreia, desempilhando {mono('fx_gc_todo')} até esvaziar; (8) percorre a lista de blocos, tirando e
        liberando com {mono('free')} os sem marca, limpando a marca dos outros e somando quantos e quantos bytes sobraram; (9) {mono('fx_block_count')} passa a ser o número de blocos vivos, {mono('fx_gc_since')} volta a zero
        e o limite passa a ser o maior entre os bytes vivos e 4 MiB; (10) libera o vetor ordenado. Declarada {mono('noinline')}.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: {mono('fx_gc_collect')} é {mono('noinline')}. O código não explica por quê; a leitura é que ela precisa de um quadro só dela, abaixo do de quem pediu a coleta: é nesse quadro que os registradores
        são copiados e de onde sai o endereço {mono('here')}, e a varredura vai desse ponto até a base. Fundida no chamador, o início da varredura dependeria de como o compilador arruma o quadro dele.
      </Why>
      <Why>
        {mono('flux_rt.h')}: o próximo limite cresce com o que está vivo ({mono('live_bytes')}, no mínimo 4 MiB), então o custo da coleta fica proporcional ao trabalho do programa. Se o limite fosse fixo, um
        programa com muita coisa viva coletaria o tempo todo, e cada coleta percorreria tudo de novo sem liberar quase nada.
      </Why>
      <Code lang="c">
        {`  size_t live_bytes = 0, live = 0;
  FxBlock **link = &fx_blocks;
  while (*link) {
    FxBlock *b = *link;
    if (b->mark) {
      b->mark = 0;
      live++;
      live_bytes += b->size + sizeof *b;
      link = &b->next;
    } else {
      *link = b->next;
      free(b);
      fx_gc_freed++;
    }
  }
  fx_block_count = live;
  fx_gc_since = 0;
  fx_gc_threshold = live_bytes > (4u << 20) ? live_bytes : (4u << 20);`}
      </Code>
      <Callout kind="nota">
        O {mono('+ 64')} no limite alto da varredura ({mono('fx_stack_base + 64')}) não tem explicação no código. O que o código mostra é que {mono('fx_stack_base')} é o endereço do quadro de {mono('fx_program')}, e a
        varredura é de endereços baixos para altos: os 64 bytes passam um pouco do endereço-base, para cobrir o resto do quadro de {mono('fx_program')}, onde ficam seus temporários. Esta é uma leitura, não um fato
        escrito na fonte.
      </Callout>

      <H2 title="Variáveis de ambiente para depurar" />
      <Table
        head={['Variável', 'Efeito', 'Valor que conta']}
        rows={[
          [mono('FLUX_GC=0'), <>Desliga o coletor: {mono('fx_gc_alloc') } nunca coleta.</>, <>Só o texto exato {mono('0')}.</>],
          [mono('FLUX_GC_STRESS=1'), <>Coleta a cada alocação. Acha erros do coletor (um bloco liberado cedo demais aparece como saída diferente ou falha); é lento.</>, <>Qualquer valor, até {mono('0')}, até vazio.</>],
          [mono('FLUX_GC_STATS=1'), <>Imprime as contagens, na saída de erro, ao sair.</>, 'Qualquer valor.'],
        ]}
      />
      <Why>
        {mono('flux_rt.h')}: as três variáveis existem para depurar e testar o coletor. {mono('FLUX_GC=0')} serve para descobrir se um erro vem do coletor (o programa se comporta igual sem ele?); {mono('FLUX_GC_STRESS=1')}
        antecipa todo erro de coleta para o início da execução, porque cada alocação vira uma coleta; {mono('FLUX_GC_STATS=1')} mostra quanto o coletor trabalhou.
      </Why>
      <P>Uma execução real, com um programa que cria dois blocos por volta, 100 mil vezes, e guarda uma lista num global:</P>
      <Code lang="flux" example>
        {`var guardada = [1, 2, 3];
func main () {
  var s = "";
  var i = 0;
  while (i < 100000) {
    s = toString(i) + "x";
    i = i + 1;
  }
  terminal.log(s);
  terminal.log(guardada);
}`}
      </Code>
      <Code lang="text">
        {`FLUX_GC_STATS=1:
[gc] 1 coletas, 109515 blocos liberados, 90494 blocos vivos
99999x
[1, 2, 3]

FLUX_GC=0 FLUX_GC_STATS=1:
[gc] 0 coletas, 0 blocos liberados, 200009 blocos vivos
99999x
[1, 2, 3]

2000 voltas em vez de 100000, FLUX_GC_STRESS=1 FLUX_GC_STATS=1:
[gc] 4009 coletas, 4003 blocos liberados, 6 blocos vivos
1999x
[1, 2, 3]`}
      </Code>
      <P>
        Lendo: com o limite de 4 MiB houve só uma coleta, depois de uns 110 mil blocos; os blocos que restam vivos no fim são os criados depois dela (o texto mais recente, a lista global e o que o programa ainda
        alcançava). Com o coletor desligado, os 200 mil blocos ficam. No estresse, cada uma das 4009 alocações coletou, e no fim só 6 blocos estavam vivos. O número de coletas é o de alocações porque cada alocação
        coleta antes de acontecer. A linha {mono('[gc]')} sai na saída de erro, por isso aparece antes do texto do programa quando a saída padrão está em pipe.
      </P>

      <H2 title="Os testes de estresse, o AddressSanitizer e o clang" />
      <P>
        O {mono('tests/run.sh')} repete os programas de {mono('tests/exec')} com {mono('FLUX_GC_STRESS=1')} e exige a mesma saída que a passada normal: com o coletor rodando a cada alocação, nada pode mudar. A passada se
        repete no Windows ({mono('.exe')} sob o {mono('wine')}), normal e em estresse. Mexeu em qualquer alocação da biblioteca? Rode o {mono('exec')} em estresse e o {mono('make asan')} (AGENTS.md).
      </P>
      <Why>
        {mono('flux_rt.h')} e AGENTS.md: o coletor é conservador, então ele aceita ponteiros para o meio de um bloco e para o cabeçalho; e o teste com mais de um compilador importa: o {mono('gcc')} escondeu o erro do
        cabeçalho e o {mono('clang')} o mostrou. {mono('FLUX_CC=clang bash tests/run.sh')} roda a suíte com ele.
      </Why>
      <Why>
        AGENTS.md e Makefile: o {mono('use-after-return')} do AddressSanitizer move variáveis locais para uma pilha falsa que o coletor não varre; por isso o {mono('make asan')} o desliga
        ({mono('ASAN_OPTIONS=detect_stack_use_after_return=0')}). A opção equivalente do {mono('clang')}, {mono('-fsanitize-address-use-after-return=never')}, não existe no {mono('gcc')}. Medido, com o C gerado de{' '}
        {mono('gc_integridade')} e de {mono('textos')} compilados com {mono('gcc -fsanitize=address,undefined')} e {mono('FLUX_GC_STRESS=1')}: com {mono('detect_stack_use_after_return=0')} o programa roda e imprime a
        saída normal; com a opção ligada ({mono('=1')}) ele morre com {mono('SEGV')} na primeira coleta. A causa provável é a base da pilha ser tomada numa pilha falsa; não investiguei além disso.
      </Why>
      <Callout kind="aviso">
        {mono('make asan')} não foi rodado inteiro nesta tarefa (leva minutos e exige {mono('libasan')} e {mono('libubsan')}); só as duas medidas acima, com o {mono('gcc')}. No {mono('clang')}, compilei {mono('textos')} com{' '}
        {mono('-fsanitize=address -fsanitize-address-use-after-return=never')} e o programa rodou em estresse com a saída certa.
      </Callout>

      <H2 title="Limitações conhecidas" />
      <Table
        head={['Limitação', 'Consequência']}
        rows={[
          ['Retenção conservadora', <>Uma palavra da pilha que parece um endereço de bloco, mesmo sendo um inteiro, mantém o bloco vivo. Memória pode ficar presa até a palavra sumir da pilha.</>],
          ['Sem compactação', <>Os blocos não se movem (um coletor conservador não poderia mover um bloco que talvez seja só um inteiro na pilha); o {mono('free')} devolve a memória ao {mono('malloc')}, e a fragmentação fica com ele.</>],
          ['Coleta que para tudo', <>Uma coleta é completa e síncrona; o custo de uma coleta é o de ordenar todos os blocos ({mono('qsort')}, proporcional a {mono('n log n')}) mais a varredura.</>],
          ['Uma thread', <>A biblioteca nunca cria threads (no Windows, a única thread extra é a do próprio programa). O coletor não é seguro para threads.</>],
          ['Ciclos de ponteiros', <>Não são problema: o marcador não segue o mesmo bloco duas vezes. Mas imprimir uma estrutura cíclica ({mono('o.me = o;')}) estoura a pilha do C em {mono('fx_repr')}, ver a página da <PageLink to="compilador/runtime">biblioteca</PageLink>.</>],
          ['Estruturas de dados da biblioteca', <>As raízes, o vetor ordenado e a pilha de rastreamento são de {mono('malloc')} e {mono('realloc')}, fora do coletor, e a mensagem de {mono('fx_die') } também.</>],
          ['Arquiteturas fora do x86-64', <>Usam {mono('__builtin_unwind_init')}, que a nota que havia no código dizia não bastar no {mono('clang')}. Nunca testado (AGENTS.md: macOS nunca foi testado).</>],
        ]}
      />
      <P>
        O código gerado e o resto da biblioteca estão em <PageLink to="compilador/gerador-c">Gerador de C</PageLink> e <PageLink to="compilador/runtime">Biblioteca de execução</PageLink>. As variáveis de ambiente
        estão também em <PageLink to="compilador/linha-de-comando">Linha de comando e variáveis de ambiente</PageLink>.
      </P>
    </>
  )
}
