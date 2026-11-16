import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

function ArenaDiagram() {
  const chunks = [
    { x: 150, label: 'bloco 3 (grande)', used: 150, size: 150, note: 'pedido maior que 256 KiB' },
    { x: 340, label: 'bloco 2', used: 80, size: 150, note: '256 KiB' },
    { x: 530, label: 'bloco 1', used: 150, size: 150, note: '256 KiB, cheio' },
  ]
  return (
    <svg viewBox="0 0 720 150" width="720" height="150" className="block max-w-none">
      <defs>
        <marker id="seta-arena" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted" />
        </marker>
      </defs>
      <rect x="10" y="40" width="100" height="40" rx="6" strokeWidth="1.25" className="fill-bg stroke-accent" />
      <text x="60" y="64" fontSize="13" fontFamily="monospace" textAnchor="middle" className="fill-ink">
        chunks
      </text>
      <path d="M 110 60 L 148 60" fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-arena)" />
      {chunks.map((c, i) => (
        <g key={c.label}>
          <rect x={c.x} y="30" width={c.size} height="60" rx="4" strokeWidth="1.25" className="fill-bg stroke-line" />
          <rect x={c.x} y="30" width="30" height="60" rx="4" strokeWidth="1" className="fill-line stroke-line" />
          <rect x={c.x + 34} y="36" width={Math.max(c.used - 42, 0)} height="48" rx="2" className="fill-accent" opacity="0.35" />
          <text x={c.x + 15} y="64" fontSize="10" textAnchor="middle" className="fill-ink">
            hdr
          </text>
          <text x={c.x + c.size / 2} y="110" fontSize="12" fontWeight="600" textAnchor="middle" className="fill-ink">
            {c.label}
          </text>
          <text x={c.x + c.size / 2} y="128" fontSize="11" textAnchor="middle" className="fill-muted">
            {c.note}
          </text>
          {i < chunks.length - 1 && (
            <path d={`M ${c.x + c.size} 60 L ${c.x + c.size + 38} 60`} fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-arena)" />
          )}
        </g>
      ))}
    </svg>
  )
}

export function Arena() {
  return (
    <>
      <H2 title="O papel da arena" />
      <P>
        Tudo o que o compilador aloca durante uma execução, a árvore de derivação, a AST, as tabelas da análise
        semântica, os textos dos tokens, os nomes dos símbolos e os registros do JSON, vem de uma arena: blocos grandes
        dos quais se vão tirando pedaços e que são liberados todos de uma vez no fim, por {mono('mem_free_all')}. Nada
        é liberado individualmente.
      </P>
      <Why>
        Como nada é liberado um a um, não há vazamento nem {mono('free')} duplicado para errar, e nenhuma estrutura precisa
        saber quem é o dono dela. Isso só é possível porque o compilador roda uma vez por arquivo e termina: a memória
        que cresce até o fim da execução nunca vira problema.
      </Why>
      <P>
        O módulo é {mono('src/util/mem.c')}, com a interface em {mono('src/util/mem.h')}. O driver libera a arena no
        fim de {mono('main')} (ver <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>); quem aloca são
        o lexer ({mono('token_node')}), o parser, {mono('ast.c')} e {mono('ast_build.c')}, {mono('types.c')},{' '}
        {mono('sema.c')}, {mono('json.c')}, {mono('codegen_c.c')} e {mono('main.c')}.
      </P>
      <Callout kind="aviso">
        Em {mono('src/')}, nunca chame {mono('malloc')}, {mono('calloc')}, {mono('realloc')} nem {mono('strdup')} diretamente:
        use {mono('mem_alloc')}, {mono('mem_strdup')} e {mono('mem_grow')}. A única exceção é o próprio {mono('mem.c')}, que
        obtém os blocos com {mono('calloc')}. A biblioteca de execução ({mono('flux_rt.h')}) não conta: ela é copiada para
        o programa gerado e tem o seu próprio coletor de lixo.
      </Callout>

      <H2 title="Como a arena é organizada" />
      <P>
        A arena é uma lista encadeada de blocos ({mono('Chunk')}). A variável global {mono('chunks')} aponta sempre para o
        bloco mais recente. Cada bloco tem um cabeçalho com o ponteiro para o bloco anterior, quantos bytes já foram
        usados e o tamanho dos dados, seguido da área de dados. Um pedido é atendido empurrando o contador {mono('used')}.
      </P>
      <Diagram
        title="A lista de blocos da arena; a parte colorida é a já usada"
        label="A variável chunks aponta para o bloco 3, o mais recente, que aponta para o bloco 2, que aponta para o bloco 1. Cada bloco tem um cabeçalho e uma área de dados, preenchida até o contador used."
      >
        <ArenaDiagram />
      </Diagram>
      <Table
        head={['Nome', 'Valor ou tipo', 'Papel']}
        rows={[
          [mono('CHUNK_SIZE'), mono('256 * 1024'), 'Tamanho padrão da área de dados de um bloco (256 KiB).'],
          [mono('Chunk'), <>{mono('struct')} com {mono('next')}, {mono('used')}, {mono('size')}</>, <>{mono('next')}: o bloco anterior (ou nulo); {mono('used')}: bytes já entregues; {mono('size')}: bytes da área de dados. Alinhado a 16 bytes, o que o torna um cabeçalho de 32 bytes.</>],
          [mono('static Chunk *chunks'), mono('NULL'), 'O bloco mais recente. É o único em que se tenta alocar.'],
        ]}
      />
      <H3 title="Invariantes" />
      <P>
        Todo pedido é arredondado para múltiplo de 16 bytes, então todo ponteiro devolvido é alinhado a 16 (o suficiente
        para qualquer tipo do compilador, inclusive {mono('double')} e {mono('long long')}). A área de dados começa logo
        depois do cabeçalho de 32 bytes, que mantém o alinhamento. Só o bloco do topo recebe alocações: se um pedido não
        cabe nele, um bloco novo é criado e vira o topo, e o espaço que sobrou no bloco antigo nunca mais é usado.
      </P>
      <Why>
        Os blocos vêm de {mono('calloc')} (e não de {mono('malloc')}), então a arena nasce zerada. Como nenhum pedaço é
        devolvido nem reaproveitado, todo ponteiro que {mono('mem_alloc')} entrega aponta para bytes zerados: o código do
        compilador pode contar com ponteiros nulos e contadores em zero em estruturas recém-alocadas sem inicializá-las.
      </Why>

      <H2 title="Funções" />
      <Fn name="mem_alloc" signature="void *mem_alloc(size_t size)">
        Entrega um pedaço de pelo menos {mono('size')} bytes, zerado e alinhado a 16. Arredonda {mono('size')} para cima
        até múltiplo de 16 (e um pedido de 0 bytes vira 16). Se não há bloco ou o bloco do topo não tem espaço, cria um
        novo com {mono('calloc')}, de tamanho {mono('CHUNK_SIZE')} ou, se o pedido for maior, do tamanho do pedido (um
        bloco só para ele), e o põe no topo da lista. Devolve o endereço logo depois do cabeçalho mais o {mono('used')}
        atual e avança o {mono('used')}. Se o {mono('calloc')} falha, imprime {mono('Memória esgotada.')} na saída de
        erro e termina o processo com código 2; nunca devolve nulo. Chamada por todo o compilador, direto ou por{' '}
        {mono('mem_strdup')} e {mono('mem_grow')}.
      </Fn>
      <Fn name="mem_strdup" signature="char *mem_strdup(const char *s)">
        Copia a string {mono('s')} (com o terminador nulo) para a arena e devolve a cópia. Substitui o {mono('strdup')}
        do C. Usada para guardar o texto de cada token, os campos dos registros do JSON, o nome padrão do executável e a cópia de {mono('FLUX_CC_FLAGS')}.
      </Fn>
      <Fn name="mem_grow" signature="void *mem_grow(void *old, size_t old_size, size_t new_size)">
        Cresce um vetor: aloca um bloco novo de {mono('new_size')} bytes e copia para ele o menor entre {mono('old_size')} e{' '}
        {mono('new_size')} bytes de {mono('old')}. Se {mono('old')} é nulo, não copia nada (é a primeira alocação do
        vetor). O bloco antigo continua na arena, sem uso: como não existe liberação individual, crescer um vetor várias
        vezes deixa para trás os tamanhos anteriores. Usada pelos vetores de {mono('ast_build.c')}, pelos
        diagnósticos de {mono('sema.c')} e pelas listas do {mono('json.c')}, que dobram a capacidade a cada vez, então o
        desperdício total fica abaixo do tamanho final.
      </Fn>
      <Why>
        O bloco antigo de um {mono('mem_grow')} fica na arena e não é liberado: não há como devolver um pedaço isolado.
        A alternativa, um {mono('realloc')} de verdade, exigiria uma lista de pedaços livres e quebraria a regra de que
        tudo some junto no fim. Como os vetores dobram de tamanho, a soma dos tamanhos anteriores nunca passa do tamanho
        atual.
      </Why>
      <Fn name="mem_free_all" signature="void mem_free_all(void)">
        Libera todos os blocos, do mais recente ao mais antigo, e deixa a lista vazia. Todo ponteiro obtido da arena
        deixa de ser válido. Chamada uma única vez, por {mono('main')}, depois de {mono('yylex_destroy')}. Como zera{' '}
        {mono('chunks')}, a arena pode ser usada de novo depois.
      </Fn>
      <Fn name="die_no_memory" signature="static void die_no_memory(void)">
        Escreve {mono('Memória esgotada.')} na saída de erro e chama {mono('exit(2)')}. O código 2 é o mesmo de opção
        desconhecida e de arquivo ilegível. Não libera a arena: o sistema devolve a memória ao terminar.
      </Fn>

      <H2 title="Liberação no fim e o LeakSanitizer" />
      <P>
        {mono('main')} chama {mono('mem_free_all')} no fim, depois de {mono('yylex_destroy')}, que libera os buffers que o
        Flex guarda (esses vêm de {mono('malloc')} dentro do código gerado pelo Flex, e o Bison também usa {mono('malloc')} para
        crescer a pilha dele: são a exceção à regra, porque não passam pelo nosso código).
      </P>
      <Why>
        O {mono('make asan')} roda o compilador com o LeakSanitizer ligado. O {mono('main')} libera tudo no fim para que
        qualquer relato do LeakSanitizer seja um vazamento real, e não memória que o compilador mantinha de propósito
        até sair. Uma chamada direta a {mono('malloc')} em {mono('src/')} sem o {mono('free')} correspondente é exatamente o
        que o {mono('make asan')} acusa; por isso a regra de usar sempre {mono('mem_alloc')}.
      </Why>
      <Callout kind="nota">
        Na prática, o LeakSanitizer só relata blocos inalcançáveis, e os blocos da arena continuam alcançáveis pela
        variável global {mono('chunks')} mesmo sem o {mono('mem_free_all')}. Conferido num build de teste: sem a chamada, o
        {mono('make asan')} não reclama; já um {mono('malloc')} perdido de {mono('main')} é apontado na hora. Ou seja, o
        que o LeakSanitizer protege de verdade é o código que usa {mono('malloc')} fora da arena, e a liberação final deixa
        a arena igualmente arrumada.
      </Callout>
      <P>
        O LeakSanitizer não vê a memória dos programas FluxLang gerados: eles têm o próprio coletor de lixo. Ver{' '}
        <PageLink to="compilador/coletor">Coletor de lixo</PageLink> e, para o {mono('make asan')},{' '}
        <PageLink to="compilador/mapa-e-build">Mapa e build</PageLink>.
      </P>

      <H2 title="Limites" />
      <Table
        head={['Situação', 'O que acontece']}
        rows={[
          ['Pedido de 0 bytes', <>Devolve um pedaço de 16 bytes.</>],
          [<>Pedido maior que {mono('CHUNK_SIZE')}</>, <>Ganha um bloco só dele, do tamanho do pedido, que vira o topo. O bloco que era o topo deixa de receber alocações, mesmo com espaço livre.</>],
          ['Memória esgotada', <>{mono('Memória esgotada.')} e saída com código 2, sem liberar nada.</>],
          ['Pedido gigantesco', <>O arredondamento e a soma com o tamanho do cabeçalho não conferem estouro de {mono('size_t')}; um pedido perto do máximo daria um bloco pequeno demais. Não acontece no compilador, onde nenhum pedido passa de alguns megabytes.</>],
        ]}
      />
      <Code lang="c">
        {`void *mem_alloc(size_t size) {
  size = (size + 15) & ~(size_t)15;
  if (size == 0)
    size = 16;
  if (!chunks || chunks->used + size > chunks->size) {
    size_t chunk_size = size > CHUNK_SIZE ? size : CHUNK_SIZE;
    Chunk *c = calloc(1, sizeof(Chunk) + chunk_size);
    if (!c)
      die_no_memory();
    c->size = chunk_size;
    c->next = chunks;
    chunks = c;
  }
  void *p = (char *)(chunks + 1) + chunks->used;
  chunks->used += size;
  return p;
}`}
      </Code>
    </>
  )
}
