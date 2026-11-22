import { Code, Fn, H2, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Documentacao() {
  return (
    <>
      <H2 title="O sistema de documentação" />
      <P>
        Esta documentação é parte da interface: a aba Documentação mostra páginas escritas em TSX, sem gerador de site nem Markdown. O sistema todo mora em {mono('web/src/docs/')} e nasceu sem comentários de
        código, como o resto do projeto agora.
      </P>
      <H2 title="Os arquivos" />
      <Table
        head={['Arquivo', 'O que tem']}
        rows={[
          [mono('types.ts'), <>{mono('DocSection')} ({mono('linguagem')} ou {mono('compilador')}) e {mono('DocPage')}.</>],
          [mono('registry.ts'), <>{mono('SECTIONS')}, {mono('PAGES')}, {mono('findPage')} e {mono('neighbors')}.</>],
          [<>{mono('pages/linguagem/')}, {mono('pages/compilador/')}</>, <>Uma página por arquivo e um {mono('index.ts')} por seção, com a lista na ordem do menu.</>],
          [mono('blocks.tsx'), 'Os blocos com que as páginas são escritas.'],
          [mono('highlight.ts'), 'O realce de código dos blocos Code.'],
          [mono('DocsView.tsx'), 'A tela: barra com Menu e Buscar, menu lateral, página, páginas vizinhas e "Nesta página".'],
          [mono('DocsNav.tsx'), <>{mono('DocsNav')} (a lista de páginas) e {mono('DocsDrawer')} (a mesma lista como gaveta, em telas estreitas).</>],
          [<>{mono('DocsSearch.tsx')}, {mono('searchIndex.ts')}</>, 'O diálogo de busca e o índice.'],
          [mono('DocsToc.tsx'), 'O "Nesta página".'],
          [mono('DocsContext.tsx'), <>{mono('DocsProvider')} e {mono('useDocs')}.</>],
          [<>{mono('useHashRoute.ts')}, {mono('useModal.ts')}, {mono('useOverflowFocus.ts')}</>, 'Os ganchos de rota, de diálogo e de rolagem.'],
        ]}
      />
      <H2 title="DocPage e o registro" />
      <P>
        Uma página é um {mono('DocPage')}: {mono('id')} ({mono('<secao>/<slug>')}), {mono('section')}, {mono('title')}, {mono('summary')} (a linha abaixo do título, que também entra na busca) e {mono('Component')} (uma
        função sem propriedades que devolve o conteúdo). {mono('PAGES')} é a lista da linguagem seguida da do compilador; a ordem dela é a do menu e a das páginas vizinhas. Para acrescentar uma página: criar o
        arquivo em {mono('pages/<secao>/')}, exportando o componente, e pôr a entrada no {mono('index.ts')} da seção, na posição desejada. Esta página, por exemplo, começa assim:
      </P>
      <Code lang="ts">
        {`import { Code, Fn, H2, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Documentacao() {
  return (
    <>
      <H2 title="O sistema de documentação" />
      <P>
        Esta documentação é parte da interface: ...
...`}
      </Code>
      <P>e a entrada dela em {mono('pages/compilador/index.ts')}, logo depois da página da interface web:</P>
      <Code lang="ts">
        {`  {
    id: 'compilador/documentacao',
    section: 'compilador',
    title: 'A documentação do projeto',
    summary: 'O sistema de web/src/docs: DocPage e o registro, a rota #/doc, os blocos, o realce, a busca, o Nesta página, o menu, os diálogos e a regra de que o código não leva comentário.',
    Component: Documentacao,
  },`}
      </Code>
      <Fn name="findPage" signature="export function findPage(id: string): DocPage | undefined">
        A página com aquele {mono('id')}, ou {mono('undefined')}.
      </Fn>
      <Fn name="neighbors" signature="export function neighbors(id: string): { prev?: DocPage; next?: DocPage }">
        A página anterior e a seguinte em {mono('PAGES')}, para os links &quot;Anterior&quot; e &quot;Próxima&quot; no pé da página. A última da linguagem tem como &quot;Próxima&quot; a primeira do compilador.
      </Fn>
      <H2 title="A rota da documentação" />
      <P>
        O endereço decide a tela: {mono('#/doc/<secao>/<slug>')} abre aquela página; {mono('#/doc')} sozinho abre a primeira página (a Introdução da linguagem), e o endereço é
        corrigido para o canônico com {mono('history.replaceState')}, sem criar entrada no histórico. Um {mono('id')} desconhecido também abre a Introdução, mas o endereço não é reescrito e a página
        começa com um aviso que cita o {mono('id')}; qualquer outro endereço é o editor. Os links entre páginas são âncoras comuns ({mono('href="#/doc/..."')}),
        então o botão Voltar do navegador funciona.
      </P>
      <Fn name="useHashRoute" signature="export function useHashRoute(): { view: 'editor' | 'docs'; pageId: string; missing?: string; goDoc(id: string): void; goEditor(): void }">
        Lê {mono('location.hash')}, ouve {mono('hashchange')} e devolve a tela e a página. Lembra a última página vista ({mono('lastId')}): ao voltar do editor para a aba Documentação, {mono('App')} chama{' '}
        {mono('goDoc(pageId)')} e a mesma página reabre. {mono('goDoc')} põe {mono('#/doc/<id>')}; {mono('goEditor')} põe {mono('#/editor')}.
      </Fn>
      <Fn name="parse (interna)" signature="function parse(hash: string, lastId: string): Route">
        Converte o {mono('hash')} em {mono('{ view, pageId, canonical, missing }')}, com as regras do parágrafo acima. {mono('missing')} só existe quando o {mono('id')} pedido não está em {mono('PAGES')}: é o texto pedido, e nesse caso {mono('canonical')} é o próprio endereço, para o {mono('useEffect')} não o reescrever.
      </Fn>
      <H2 title="Os blocos" />
      <P>
        As páginas são escritas só com os blocos de {mono('blocks.tsx')}, que já trazem as classes de tokens, o foco e os rótulos de acessibilidade. Uma página não escreve classes de cor nem HTML solto, salvo o{' '}
        {mono('<code className="font-mono">')} do atalho {mono('mono')} e os SVG dos diagramas (com classes de token como {mono('fill-ink')} e {mono('stroke-line')}).
      </P>
      <Table
        head={['Bloco', 'Propriedades', 'O que gera']}
        rows={[
          [<>{mono('H2')}, {mono('H3')}</>, mono('title'), <>Um título com {mono('id')} tirado do texto e um botão {mono('#')} que leva até ele (visível ao passar o mouse, ou sempre em telas de toque). Os títulos de uma página têm de ser únicos: o {mono('id')} repetido ganha {mono('-2')}, mas o &quot;Nesta página&quot; fica ambíguo.</>],
          [mono('P'), mono('children'), 'Um parágrafo.'],
          [mono('Code'), <>{mono('lang')} ({mono('flux')}, {mono('c')}, {mono('ts')}, {mono('bash')}, {mono('text')}), {mono('example?')}, {mono('children')} (texto)</>, <>Um bloco de código com realce, botão Copiar (anuncia &quot;Copiado&quot; ou &quot;Falha ao copiar&quot; por 2,5 segundos) e, com {mono('example')}, o botão &quot;Abrir no editor&quot;. Tira as quebras de linha do começo e os espaços do fim.</>],
          [mono('Table'), <>{mono('head: string[]')} (únicos), {mono('rows: ReactNode[][]')}</>, 'Uma tabela que rola na horizontal se não couber.'],
          [mono('Callout'), <>{mono('kind')} ({mono('nota')} ou {mono('aviso')}), {mono('children')}</>, 'Uma caixa com borda à esquerda, na cor de info ou de warn.'],
          [mono('Why'), mono('children'), <>Uma caixa &quot;Por quê&quot;: a razão de uma decisão ou uma armadilha, citando o arquivo. É onde vão os porquês que antes eram comentários.</>],
          [mono('Fn'), <>{mono('name')}, {mono('signature')}, {mono('children')}</>, <>A entrada de uma função: nome, assinatura em fonte fixa (rola se for longa) e a descrição. É um {mono('role="group"')} rotulado pelo nome.</>],
          [mono('Diagram'), <>{mono('title')}, {mono('label')}, {mono('children')} (SVG)</>, <>Uma figura com legenda ({mono('title')}); {mono('label')} é a descrição do desenho para leitores de tela ({mono('role="img"')}).</>],
          [mono('PageLink'), <>{mono('to')} (um {mono('id')}), {mono('children')}</>, <>Um link para {mono('#/doc/<to>')}. Um {mono('id')} que não existe cai na primeira página.</>],
        ]}
      />
      <Fn name="slugify" signature="export function slugify(text: string): string">
        O {mono('id')} de um título: tira os acentos (normalização NFD e remoção das marcas combinantes), passa para minúsculas, troca cada sequência de caracteres fora de {mono('a-z0-9')} por um hífen e tira os hífens
        das pontas. &quot;A rota da documentação&quot; vira {mono('a-rota-da-documentacao')}.
      </Fn>
      <Fn name="useHeadingId (interna)" signature="function useHeadingId(title: string): string">
        Reserva um {mono('id')} único na página: usa {mono('useId')} como chave no mapa de {mono('HeadingIdsContext')} (um mapa novo por página, criado em {mono('DocsView')}) e acrescenta {mono('-2')},{' '}
        {mono('-3')}... se o {mono('slug')} já foi pego. Fora do contexto (na montagem do índice de busca), devolve só o {mono('slug')}.
      </Fn>
      <Fn name="scrollProps (interna)" signature="function scrollProps(label: string, tab: 0 | undefined)">
        Com {mono('tab')} 0, devolve {mono('role="region"')}, {mono('aria-label')} e {mono('tabIndex')} 0 para uma área que rola; senão, nada. Usada por Code, Table, Fn e Diagram com {mono('useOverflowFocus')}.
      </Fn>
      <H2 title="O realce de código" />
      <P>
        {mono('highlight.ts')} divide o texto em pedaços com classe ({mono('kw')}, {mono('type')}, {mono('str')}, {mono('num')}, {mono('cmt')}, {mono('fn')}), e {mono('TOKEN_COLOR')} dá a classe de token de cada
        um ({mono('text-accent')}, {mono('text-info')}, {mono('text-ok')}, {mono('text-warn')}, {mono('text-muted')} e negrito). As palavras da FluxLang vêm da gramática do VS Code
        ({mono('fluxlang.tmLanguage.json')}, em {mono('tools/vscode-fluxlang/syntaxes/')}): palavras-chave, declarações, constantes, tipos e as funções da biblioteca (os membros de {mono('terminal')} só são realçados depois de{' '}
        {mono('terminal.')}). Assim a documentação e o editor do VS Code realçam as mesmas palavras. C, TypeScript e bash têm listas fixas; {mono('text')} não é realçado.
      </P>
      <Fn name="highlight" signature="export function highlight(lang: Lang, code: string): Piece[]">
        Percorre o texto da esquerda para a direita: comentário de linha ({mono('//')}, ou {mono('#')} no bash) até o fim da linha; comentário de bloco (exceto bash e texto); texto entre aspas até a aspa de
        fechamento ou o fim da linha, respeitando a barra invertida; número que não segue uma letra; palavra, classificada pelas listas da linguagem. Pedaços vizinhos com a mesma classe são juntados.
      </Fn>
      <Fn name="specFor, libraryWords, wordsOf, endOfString (internas)" signature="function specFor(lang: Lang): Spec  ·  function libraryWords(): { fns: Set<string>; members: Set<string> }  ·  function wordsOf(name: string): Set<string>  ·  function endOfString(code: string, start: number): number">
        {mono('specFor')} dá as palavras, os tipos, os marcadores de comentário e as aspas de cada linguagem. {mono('wordsOf')} e {mono('libraryWords')} tiram as palavras dos grupos {mono('(a|b|c)')} das regras da
        gramática ({mono('libraryWords')} separa as funções soltas dos membros de {mono('terminal')}). {mono('endOfString')} acha o fim de um texto entre aspas.
      </Fn>
      <Fn name="rules, groups, push (internas)" signature="function rules(name: string): GrammarRule[]  ·  function groups(rule: GrammarRule): string[][]  ·  function push(out: Piece[], text: string, cls?: TokenClass): void">
        {mono('rules')} devolve as regras de uma entrada do repositório da gramática (a lista {mono('patterns')}, ou a própria entrada); {mono('groups')} acha os grupos de alternativas {mono('(a|b)')} no{' '}
        {mono('match')} ou no {mono('begin')} de uma regra; {mono('push')} acrescenta um pedaço à saída, juntando-o ao anterior se a classe é a mesma e ignorando texto vazio.
      </Fn>
      <H2 title="A busca" />
      <P>
        A busca não tem índice pronto: na primeira vez que o diálogo abre, {mono('getIndex')} monta o índice renderizando cada página com {mono('renderToStaticMarkup')} (do {mono('react-dom/server')}) dentro de um{' '}
        {mono('DocsProvider')} que não faz nada, e tira o texto do HTML. Por isso tudo o que está numa página, inclusive tabelas, assinaturas e trechos de código, é encontrado, e uma página nova entra na busca sem
        nenhum passo extra. O índice fica guardado até a página do navegador recarregar.
      </P>
      <Fn name="buildIndex" signature="export function buildIndex(pages: DocPage[]): IndexEntry[]">
        Para cada página, {mono('{ id, title, summary, headings, text }')}: {mono('headings')} junta o texto dos títulos {mono('<h2>')} e {mono('<h3>')} do HTML, e {mono('text')} é o resumo seguido do texto da página.
      </Fn>
      <Fn name="getIndex" signature="export function getIndex(): IndexEntry[]">
        {mono('buildIndex(PAGES)')} na primeira chamada; a mesma lista nas seguintes.
      </Fn>
      <Fn name="toText (interna)" signature="function toText(markup: string): string">
        Tira do HTML a barra dos blocos de código (Copiar, Abrir no editor) e todos os botões (os {mono('#')} dos títulos); troca etiquetas de bloco por espaço e apaga as de texto ({mono('span')}, {mono('code')},{' '}
        {mono('a')}, {mono('strong')}, {mono('em')}) sem espaço, para uma palavra partida entre dois elementos continuar inteira; decodifica as entidades HTML e junta os espaços.
      </Fn>
      <Fn name="normalize" signature="export function normalize(s: string): string">
        Tira os acentos e passa para minúsculas: buscar &quot;funcao&quot; acha &quot;função&quot;.
      </Fn>
      <Fn name="search" signature="export function search(index: IndexEntry[], query: string): SearchHit[]">
        Divide a busca em palavras; uma página entra só se tem todas (no título ou no texto). A pontuação soma, por palavra, 20 por ocorrência no título da página, 10 por ocorrência num título de seção, 5 por
        ocorrência no resumo e as ocorrências no texto até 10. O teto do texto impede que uma página longa ganhe só por repetir a palavra; os pesos dos títulos e do resumo põem na frente a página em que o
        assunto é o tema, como o catálogo para {mono('E11')}. Uma palavra com ponto, como {mono('terminal.log')}, soma ainda 5 por ocorrência de cada parte (com mais de dois
        caracteres) num título de seção e 2 no resumo: assim a Biblioteca, que tem a seção &quot;O terminal&quot;, passa à frente das páginas que só usam {mono('terminal.log')} nos exemplos. No empate, vence a densidade: as ocorrências no texto divididas pelo tamanho dele. Devolve as páginas em ordem de pontuação, cada uma com um trecho de até 60 caracteres para cada lado da primeira ocorrência ({mono('snippetOf')}, interna; {mono('count')}, interna, conta ocorrências sem sobreposição).
      </Fn>
      <H2 title="DocsView, o menu, a busca e o Nesta página" />
      <Table
        head={['Componente', 'Propriedades', 'O que faz']}
        rows={[
          [mono('DocsView'), <>{mono('pageId')}, {mono('missing?')}</>, <>A tela da documentação: barra com Menu (só abaixo de {mono('lg')}) e Buscar (com a dica Ctrl K), menu lateral (a partir de {mono('lg')}), o artigo (título, resumo, página, Anterior e Próxima) e o &quot;Nesta página&quot; (a partir de {mono('xl')}, 80 rem). Com {mono('missing')}, um aviso ({mono('Callout')}) acima do título diz que a página pedida não existe. Ao trocar de página, rola para o topo e põe o foco no {mono('h1')}. {mono('Ctrl+K')} ou {mono('Cmd+K')} abre a busca. Com um diálogo aberto, o resto fica {mono('inert')}; ao fechar, o foco volta a quem abriu. O menu fecha sozinho se a janela crescer até {mono('lg')}.</>],
          [mono('DocsNav'), <>{mono('pageId')}, {mono('className?')}, {mono('onNavigate?')}</>, <>A lista de páginas por seção, com {mono('aria-current="page"')} na atual.</>],
          [mono('DocsDrawer'), <>{mono('pageId')}, {mono('onNavigate')}, {mono('onClose')}</>, <>O {mono('DocsNav')} numa gaveta à esquerda ({mono('role="dialog"')}, {mono('aria-modal')}), com botão Fechar e véu que fecha ao clicar. O foco começa no primeiro link.</>],
          [mono('DocsSearch'), <>{mono('onChoose')}, {mono('onClose')}</>, <>O diálogo de busca: um campo {mono('role="combobox"')} com {mono('aria-activedescendant')}, até 8 resultados ({mono('MAX_HITS')}) numa {mono('role="listbox"')}, setas para escolher, Enter para abrir, Esc ou clique fora para fechar, e uma linha {mono('role="status"')} com a contagem.</>],
          [mono('DocsToc'), <>{mono('pageId')}, {mono('scroller')} (a área que rola)</>, <>O &quot;Nesta página&quot;: depois de a página renderizar, lê os {mono('h2')} e {mono('h3')} com {mono('id')} do artigo e marca como atual o último título cujo topo passou da primeira quarta parte da área visível ({mono('BAND')} 0,25, com um {mono('IntersectionObserver')}). Clicar rola até o título e o foca.</>],
          [mono('DocsProvider'), <>{mono('openInEditor')}, {mono('children')}</>, <>Dá às páginas a função de abrir um exemplo no editor; {mono('useDocs')} a lê (e lança se usada fora do provedor).</>],
        ]}
      />
      <Fn name="useModal" signature="export function useModal(ref: RefObject<HTMLElement | null>, onClose: () => void, initial?: string): void">
        Faz de {mono('ref')} um diálogo: ao montar, foca o elemento que casa com o seletor {mono('initial')} (ou o primeiro focável); Esc chama {mono('onClose')}; Tab e Shift+Tab giram dentro do diálogo, e um Tab com o
        foco fora dele o traz de volta. Não devolve o foco ao fechar: isso é de {mono('DocsView')}. Usado por {mono('DocsDrawer')} e {mono('DocsSearch')}.
      </Fn>
      <Fn name="useOverflowFocus" signature="export function useOverflowFocus<T extends HTMLElement>(dep?: unknown): readonly [RefObject<T | null>, 0 | undefined]">
        Devolve uma {mono('ref')} e o {mono('tabIndex')} certo para ela: 0 se o conteúdo transborda (na largura ou na altura), senão nada. Mede de novo quando o elemento ou um filho direto muda de tamanho
        ({mono('ResizeObserver')}) e quando {mono('dep')} muda. Assim uma tabela larga ou um código longo podem ser rolados pelo teclado, e os que cabem não viram paradas inúteis do Tab.
      </Fn>
      <H2 title="A regra: o código não leva comentário" />
      <P>
        No projeto, o código-fonte não leva comentário: a explicação vai na página. O que um comentário dizia sobre o que o código faz virou texto e entradas {mono('Fn')}; todo &quot;porquê&quot; (uma decisão, uma
        armadilha, uma restrição) virou uma caixa {mono('Why')} citando o arquivo. Ficam no código só as diretivas que têm efeito (como {mono('@ts-expect-error')}). Quem muda um arquivo muda a página que o
        documenta no mesmo commit.
      </P>

      <H2 title="Onde a documentação aparece" />
      <P>
        A aba Documentação, a rota por {mono('#/editor')} e {mono('#/doc/...')} e o {mono('DocsProvider')} que {mono('App')} monta estão em <PageLink to="compilador/interface-web">Interface web</PageLink>, junto com os
        tokens de cor de {mono('index.css')} que os blocos usam e as convenções de acessibilidade da interface.
      </P>
    </>
  )
}
