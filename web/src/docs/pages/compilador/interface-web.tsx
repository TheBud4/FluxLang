import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

interface Box {
  col: number
  row: number
  name: string
  detail: string
}

const BW = 150
const BH = 58
const BGAP = 28
const bx = (col: number) => 16 + col * (BW + BGAP)
const by = (row: number) => 20 + row * 100

const BOXES: Box[] = [
  { col: 0, row: 0, name: 'Navegador', detail: 'useCompile' },
  { col: 1, row: 0, name: 'flux-api.ts', detail: 'compile' },
  { col: 2, row: 0, name: './flux --json', detail: '(--semantic)' },
  { col: 0, row: 1, name: 'Navegador', detail: 'useRun + X-Flux-Run' },
  { col: 1, row: 1, name: 'flux-api.ts', detail: 'run: Host e Origin' },
  { col: 2, row: 1, name: 'run-program.ts', detail: 'flux --build -o' },
  { col: 3, row: 1, name: 'executável', detail: 'FLUX_TAGGED=1' },
]

function Caminho() {
  const width = bx(4) - BGAP + 16
  const arrows: string[] = []
  for (const row of [0, 1]) {
    const last = row === 0 ? 2 : 3
    const y = by(row) + BH / 2
    for (let col = 0; col < last; col += 1) {
      const x1 = bx(col) + BW
      arrows.push(`M ${x1} ${y} L ${x1 + BGAP - 2} ${y}`)
    }
  }
  return (
    <svg viewBox={`0 0 ${width} 190`} width={width} height="190" className="block max-w-none">
      <defs>
        <marker id="seta-web" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted" />
        </marker>
      </defs>
      {arrows.map((d) => (
        <path key={d} d={d} fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-web)" />
      ))}
      <text x={bx(1)} y={by(0) - 6} fontSize="11" fontFamily="monospace" className="fill-accent">
        POST /api/compile
      </text>
      <text x={bx(1)} y={by(1) - 6} fontSize="11" fontFamily="monospace" className="fill-accent">
        POST /api/run
      </text>
      {BOXES.map((b) => (
        <g key={`${b.row}-${b.col}`}>
          <rect x={bx(b.col)} y={by(b.row)} width={BW} height={BH} rx="6" strokeWidth="1.25" className="fill-bg stroke-line" />
          <text x={bx(b.col) + 10} y={by(b.row) + 23} fontSize="13" fontWeight="600" className="fill-ink">
            {b.name}
          </text>
          <text x={bx(b.col) + 10} y={by(b.row) + 42} fontSize="11" fontFamily="monospace" className="fill-muted">
            {b.detail}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function InterfaceWeb() {
  return (
    <>
      <H2 title="O que é a interface web" />
      <P>
        A pasta {mono('web/')} tem a interface gráfica do compilador: um projeto Vite com React 19, Tailwind 4 e TypeScript. Ela não reimplementa nada da linguagem. O servidor de desenvolvimento do
        Vite ganha duas rotas, dadas por um plugin próprio ({mono('web/server/flux-api.ts')}): {mono('POST /api/compile')} passa o código para {mono('./flux --json')} e devolve o JSON, e{' '}
        {mono('POST /api/run')} compila o programa com {mono('flux --build')} e o executa de verdade, devolvendo a saída. Tudo o que a tela mostra (tokens, árvore, erros, saída) vem do mesmo binário{' '}
        {mono('./flux')} da linha de comando.
      </P>
      <Diagram
        title="As duas rotas: compilar (em cima) e executar (embaixo)"
        label="Duas filas de caixas. Em cima: o navegador, pelo useCompile, manda POST /api/compile para flux-api.ts, que roda ./flux --json, com --semantic se pedido. Embaixo: o navegador, pelo useRun com o cabeçalho X-Flux-Run, manda POST /api/run para flux-api.ts, que confere Host e Origin e chama run-program.ts; este compila com flux --build -o e roda o executável com FLUX_TAGGED=1."
      >
        <Caminho />
      </Diagram>
      <Table
        head={['Aspecto', 'Como é']}
        rows={[
          ['Quem a abre', <>O usuário, com {mono('make web')}, no endereço {mono('http://127.0.0.1:5173')}.</>],
          ['Entrada', <>O código digitado ou aberto de um arquivo, a chave &quot;Análise semântica&quot; e, ao executar, o texto do campo &quot;Entrada do programa&quot;.</>],
          ['Saída', <>Os painéis Código, Tokens, Árvore sintática, Erros e Saída, e a aba Documentação (esta documentação).</>],
          ['Depende de', <>O binário {mono('./flux')} na raiz do repositório (o servidor avisa se ele não existe), o {mono('gcc')} para executar e o Node 20 ou mais novo com o npm.</>],
          ['O que não faz', <>Não salva arquivos no servidor, não tem login e não é para uso fora do próprio computador. O {mono('flux')} e a interface exigem Linux ou macOS (no Windows, via WSL).</>],
        ]}
      />

      <H2 title="Como rodar" />
      <Code lang="bash">{`make web`}</Code>
      <P>
        O alvo {mono('web')} do Makefile depende de {mono('flux')} (compila o compilador se preciso), roda {mono('npm --prefix web install')} e depois {mono('npm --prefix web run dev')}, que sobe o Vite
        em {mono('127.0.0.1')}, porta 5173. Se a porta estiver ocupada, o Vite tenta a seguinte; medido, com uma instância já rodando, a segunda imprimiu{' '}
        {mono('Port 5173 is in use, trying another one...')} e subiu em {mono('http://127.0.0.1:5174/')}. Os scripts de {mono('web/package.json')}:
      </P>
      <Table
        head={['Script', 'Comando', 'Para quê']}
        rows={[
          [mono('dev'), mono('vite'), 'Servidor de desenvolvimento com recarga automática e as rotas da API.'],
          [mono('build'), mono('tsc -b && vite build'), <>Confere os tipos e gera a versão final em {mono('web/dist/')} (ignorada pelo git).</>],
          [mono('preview'), mono('vite preview'), <>Serve o {mono('dist/')} em {mono('127.0.0.1')}, porta 4173, com as mesmas rotas da API.</>],
          [mono('typecheck'), mono('tsc -b'), 'Só a conferência de tipos.'],
        ]}
      />
      <H3 title="vite.config.ts" />
      <P>
        Liga três plugins: o do React, o do Tailwind e {mono('fluxApi()')}. O servidor escuta só em {mono('127.0.0.1')} (porta 5173) e o {mono('preview')} também (porta 4173). A opção{' '}
        {mono('server.fs.allow')} recebe a raiz do repositório, calculada com {mono("fileURLToPath(new URL('..', import.meta.url))")}.
      </P>
      <Code lang="ts">
        {`const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss(), fluxApi()],
  server: { host: '127.0.0.1', port: 5173, fs: { allow: [repoRoot] } },
  preview: { host: '127.0.0.1', port: 4173 },
})`}
      </Code>
      <Why>
        {mono('vite.config.ts')}: a interface importa arquivos que moram fora de {mono('web/')}: os exemplos {mono('docs/exemplos/valido.flux')} e {mono('invalido.flux')} (com {mono('?raw')}, como texto, em{' '}
        {mono('App.tsx')}) e a gramática de realce {mono('fluxlang.tmLanguage.json')}, de {mono('tools/vscode-fluxlang/syntaxes/')} (em {mono('docs/highlight.ts')}). O Vite só serve arquivos da pasta do projeto, então a raiz
        do repositório tem de estar em {mono('fs.allow')}. Assim os botões de exemplo carregam sempre a versão atual dos arquivos da linguagem, sem cópia.
      </Why>
      <H3 title="index.html, main.tsx e tsconfig.json" />
      <P>
        {mono('index.html')} declara {mono('lang="pt-BR"')}, o título {mono('FluxLang Compiler')}, um ícone vazio ({mono('href="data:,"')}, para o navegador não pedir um {mono('favicon.ico')} que não existe) e o{' '}
        {mono('div#root')}. {mono('src/main.tsx')} importa {mono('index.css')} e monta {mono('App')} dentro de {mono('StrictMode')} com {mono('createRoot')}. O {mono('tsconfig.json')} é estrito
        ({mono('strict')}, {mono('noUnusedLocals')}, {mono('noUnusedParameters')}), não emite nada ({mono('noEmit')}) e cobre {mono('src')}, {mono('server')} e {mono('vite.config.ts')}: o servidor também é
        conferido pelo {mono('tsc -b')}.
      </P>

      <H2 title="O servidor: flux-api.ts" />
      <P>
        O plugin do Vite que dá as duas rotas. Ele registra o mesmo middleware no servidor de desenvolvimento ({mono('configureServer')}) e no de {mono('preview')} ({mono('configurePreviewServer')}), então as duas
        formas de abrir a interface têm a API. Constantes:
      </P>
      <Table
        head={['Nome', 'Valor', 'Uso']}
        rows={[
          [mono('MAX_BYTES'), '1 MiB (1024 * 1024)', <>Tamanho máximo do corpo de qualquer pedido: o código em {mono('/api/compile')} e o JSON inteiro (código e entrada) em {mono('/api/run')}.</>],
          [mono('TIMEOUT_MS'), '5000', <>Tempo máximo do {mono('./flux --json')} em {mono('/api/compile')}.</>],
        ]}
      />
      <H3 title="As rotas e as respostas" />
      <P>
        O middleware olha o começo do caminho: o que começa com {mono('/api/run')} vai para a execução, o que começa com {mono('/api/compile')} vai para a compilação e o resto segue para o Vite. Como a comparação é
        só de prefixo, {mono('/api/runner')} também cai na rota de execução (medido: 403, a mesma recusa). Qualquer método que não seja {mono('POST')} recebe 405. Todas as respostas são JSON; os erros têm a forma{' '}
        {mono('{"error": "mensagem"}')}.
      </P>
      <Table
        head={['Código', 'Rota', 'Quando', 'Mensagem']}
        rows={[
          ['200', mono('/api/compile'), <>O {mono('flux')} terminou com 0 (aceito) ou 1 (rejeitado) e escreveu algo na saída padrão.</>, <>O JSON do {mono('--json')}, repassado como veio.</>],
          ['200', mono('/api/run'), <>A execução terminou (com qualquer resultado: aceito, rejeitado, tempo esgotado).</>, <>Um {mono('RunResult')} (ver abaixo).</>],
          ['400', mono('/api/run'), 'O corpo não é JSON.', <>{mono('O pedido de execução deve ser um JSON com "source" e "stdin".')}</>],
          ['400', mono('/api/run'), <>{mono('source')} não é texto, ou {mono('stdin')} existe e não é texto.</>, <>A mesma frase, terminada em {mono('em texto.')}</>],
          ['403', mono('/api/run'), 'O pedido não passou na conferência de segurança.', mono('Pedido de execução recusado: só a interface local pode executar programas.')],
          ['405', 'as duas', <>Método diferente de {mono('POST')}.</>, mono('Use POST.')],
          ['413', 'as duas', 'O corpo passou de 1 MiB.', mono('Código grande demais (máximo de 1 MB).')],
          ['500', mono('/api/compile'), <>O {mono('flux')} não pôde ser iniciado, ou terminou com outro código, ou sem saída.</>, <>{mono('Não foi possível executar o compilador: ...')}, o texto da saída de erro, ou {mono('O compilador terminou com código N.')}</>],
          ['500', mono('/api/run'), <>{mono('runProgram')} lançou uma exceção (por exemplo, sem permissão para criar a pasta temporária).</>, 'A mensagem da exceção.'],
          ['503', 'as duas', <>O arquivo {mono('../flux')} não existe.</>, mono('O compilador ./flux não foi encontrado. Rode `make` na raiz do projeto.')],
          ['504', mono('/api/compile'), <>O {mono('flux')} passou de 5 segundos (o processo é morto com {mono('SIGKILL')}).</>, mono('O compilador demorou mais de 5 segundos.')],
        ]}
      />
      <P>Executado com o servidor de desenvolvimento rodando ({mono('ok.flux')} é um {mono('main')} com um {mono('terminal.log("oi")')}; a saída foi cortada depois do décimo token):</P>
      <Code lang="bash">{`curl -s -X POST --data-binary @ok.flux http://127.0.0.1:5173/api/compile`}</Code>
      <Code lang="text">
        {`{
"accepted": true,
"lines": 3,
"tokens": [
  {"line":1,"column":1,"type":"FUNC","text":"func"},
  {"line":1,"column":6,"type":"MAIN","text":"main"},
  ...`}
      </Code>
      <P>
        Com {mono('?semantic=1')}, o servidor passa {mono('--json --semantic')} e os erros E1 a E24 entram na lista. Medido com {mono('var x: int = "a";')}: sem o parâmetro, {mono('"accepted": true')} e{' '}
        {mono('"errors": []')}; com ele, {mono('"accepted": false')} e um erro de {mono('"kind":"semântico"')}, {mono('Tipo incompatível: esperado int, encontrado string.')} O formato do JSON está em{' '}
        <PageLink to="compilador/arvore-json">Árvore de derivação e JSON</PageLink>.
      </P>
      <Why>
        {mono('flux-api.ts')}: o código de saída 1 não é falha do servidor. O {mono('flux --json')} sai com 0 se o programa foi aceito e com 1 se foi rejeitado, e nos dois casos escreve o JSON completo na saída
        padrão. Por isso os dois códigos viram 200 com o JSON, e só outro código (ou nenhuma saída) vira 500.
      </Why>
      <Why>
        {mono('flux-api.ts')}: a entrada padrão do {mono('flux')} ganha um tratador de erro vazio porque o compilador pode terminar e fechar a entrada antes de o servidor acabar de escrever o código (por exemplo,
        depois de um erro grave no começo). Sem o tratador, a escrita num cano fechado ({mono('EPIPE')}) viraria uma exceção não tratada no processo do Vite.
      </Why>
      <H3 title="Como o caminho do compilador é resolvido" />
      <P>
        No gancho {mono('configResolved')}, o plugin guarda {mono("path.resolve(config.root, '../flux')")}: a raiz do Vite é a pasta {mono('web/')} (o {mono('npm --prefix web')} roda lá), então o caminho é o{' '}
        {mono('./flux')} da raiz do repositório. A existência do arquivo é conferida a cada pedido com {mono('existsSync')}, e não uma vez na partida: dá para rodar {mono('make')} com a interface aberta, e o
        pedido seguinte já encontra o binário.
      </P>
      <H3 title="Segurança do Executar" />
      <P>
        {mono('/api/run')} executa o programa recebido neste computador, e um programa FluxLang pode rodar qualquer comando com {mono('run')}. O servidor escuta só em {mono('127.0.0.1')}, mas isso não basta: qualquer
        página aberta no navegador pode tentar um {mono('POST')} para {mono('http://127.0.0.1:5173')}. Por isso {mono('isTrustedRunRequest')} exige três coisas antes de ler o corpo:
      </P>
      <Code lang="ts">
        {`function isTrustedRunRequest(req: IncomingMessage): boolean {
  const host = req.headers.host ?? ''
  if (!/^(127\\.0\\.0\\.1|localhost)(:\\d+)?$/.test(host)) return false
  if (req.headers['x-flux-run'] !== '1') return false
  const origin = req.headers.origin
  return origin === undefined || origin === \`http://\${host}\`
}`}
      </Code>
      <Why>
        {mono('flux-api.ts')}: o {mono('Host')} tem de ser {mono('127.0.0.1')} ou {mono('localhost')} (com qualquer porta) contra o DNS rebinding: um domínio de fora que passa a apontar para{' '}
        {mono('127.0.0.1')} faria o navegador mandar o pedido para cá com o {mono('Host')} desse domínio.
      </Why>
      <Why>
        {mono('flux-api.ts')}: o cabeçalho próprio {mono('X-Flux-Run: 1')} existe porque o navegador não deixa um site mandar um cabeçalho personalizado para outra origem sem um pré-voo CORS ({mono('OPTIONS')}). Um
        formulário ou um {mono('fetch')} simples de outro site não consegue incluí-lo.
      </Why>
      <Why>
        {mono('flux-api.ts')}: se o navegador manda um {mono('Origin')}, ele tem de ser exatamente {mono('http://')} mais o {mono('Host')}. Pedidos sem {mono('Origin')} (como os do {mono('curl')}) passam: não vêm
        de uma página. Esta é a conferência que de fato fecha a porta para páginas servidas em outra porta do próprio computador (ver a medição abaixo).
      </Why>
      <P>Medido com {mono('curl')} contra o servidor de desenvolvimento, todos com um corpo válido:</P>
      <Table
        head={['Pedido', 'Resultado']}
        rows={[
          [<>Sem {mono('X-Flux-Run')}</>, '403, a mensagem de recusa'],
          [<>{mono('X-Flux-Run: true')} (valor diferente de 1)</>, '403'],
          [<>{mono('X-Flux-Run: 1')}, sem {mono('Origin')}</>, <>200 e o {mono('RunResult')}</>],
          [<>{mono('X-Flux-Run: 1')} e {mono('Origin: http://127.0.0.1:5173')}</>, '200'],
          [<>{mono('X-Flux-Run: 1')} e {mono('Origin: http://evil.example')}</>, '403'],
          [<>{mono('X-Flux-Run: 1')} e {mono('Origin: http://localhost:3000')} (outra porta)</>, '403'],
          [<>{mono('X-Flux-Run: 1')} e {mono('Origin: http://localhost:5173')} com {mono('Host')} 127.0.0.1 (nomes diferentes)</>, '403'],
          [<>{mono('X-Flux-Run: 1')} e {mono('Host: localhost:5173')}</>, '200'],
          [<>{mono('Host: evil.example:5173')}, em qualquer rota (inclusive {mono('/api/compile')})</>, <>403 do próprio Vite, antes do plugin: {mono('To allow this host, add "evil.example" to `server.allowedHosts`...')}</>],
          [<>{mono('OPTIONS')} de pré-voo com {mono('Origin: http://evil.example')}</>, <>204 sem {mono('Access-Control-Allow-Origin')}: o navegador não manda o {mono('POST')}.</>],
          [<>{mono('OPTIONS')} de pré-voo com {mono('Origin: http://localhost:3000')}</>, <>204 com {mono('Access-Control-Allow-Origin: http://localhost:3000')}: o CORS padrão do Vite aceita origens locais.</>],
        ]}
      />
      <P>
        As duas últimas linhas mostram as camadas do Vite que existem além do plugin: a lista de {mono('Host')} permitidos ({mono('server.allowedHosts')}, que já barra um {mono('Host')} de fora antes da API) e o
        CORS padrão, que responde ao pré-voo de qualquer origem em {mono('localhost')} ou {mono('127.0.0.1')}. Uma página servida em outra porta local passaria pelo pré-voo e mandaria o cabeçalho; é a conferência de{' '}
        {mono('Origin')} do plugin que a recusa.
      </P>
      <Callout kind="aviso">
        Não relaxe nenhuma das três conferências (AGENTS.md, &quot;Armadilhas&quot;). Executar roda comandos de verdade com as permissões de quem abriu a interface. Use-a só no próprio computador e não a exponha na
        rede.
      </Callout>
      <H3 title="Funções de flux-api.ts" />
      <Fn name="sendJson" signature="function sendJson(res: ServerResponse, status: number, body: unknown): void">
        Responde com {mono('status')} e {mono('Content-Type: application/json; charset=utf-8')}. Se {mono('body')} já é texto (o JSON que o {mono('flux')} escreveu), manda como está; senão,{' '}
        {mono('JSON.stringify')}. Não faz nada se os cabeçalhos já foram enviados: protege contra uma segunda resposta (o tempo esgotado e o fim do processo podem acontecer quase juntos).
      </Fn>
      <Fn name="fail" signature="const fail = (res: ServerResponse, status: number, error: string) => void">
        Atalho para {mono('sendJson(res, status, { error })')}.
      </Fn>
      <Fn name="readBody" signature="function readBody(req: IncomingMessage, res: ServerResponse): Promise<Buffer | null>">
        Junta os pedaços do corpo num {mono('Buffer')}. Se o total passa de {mono('MAX_BYTES')}, responde 413, destrói o pedido e resolve com {mono('null')}; se o pedido dá erro, também {mono('null')}. Quem chama só
        segue se recebeu um {mono('Buffer')}. Medido: um corpo de 1,1 MB em {mono('/api/compile')} recebeu 413.
      </Fn>
      <Fn name="isTrustedRunRequest" signature="function isTrustedRunRequest(req: IncomingMessage): boolean">
        As três conferências da seção anterior, na ordem {mono('Host')}, {mono('X-Flux-Run')}, {mono('Origin')}. Só lê cabeçalhos; é chamada por {mono('run')} antes de ler o corpo.
      </Fn>
      <Fn name="fluxApi" signature="export function fluxApi(): Plugin">
        Cria o plugin ({mono("name: 'flux-api'")}). Guarda o caminho do compilador em {mono('configResolved')} e registra {mono('handler')} nos dois servidores. Chamada em {mono('vite.config.ts')}. As funções
        abaixo são internas a ela.
      </Fn>
      <Fn name="compile (interna)" signature="const compile = async (req: IncomingMessage, res: ServerResponse) => Promise<void>">
        Lê o corpo (413), confere o binário (503), lê {mono('semantic')} da URL e roda {mono('spawn(fluxPath, ["--json"] ou ["--json", "--semantic"])')} com o código na entrada padrão. Junta a saída padrão e a de
        erro; um temporizador de 5 segundos mata o processo e responde 504. No fim do processo, 200 com o JSON se o código é 0 ou 1 e houve saída; senão 500 com a saída de erro ou o código. Um erro ao iniciar o
        processo vira 500.
      </Fn>
      <Fn name="run (interna)" signature="const run = async (req: IncomingMessage, res: ServerResponse) => Promise<void>">
        Na ordem: {mono('isTrustedRunRequest')} (403), {mono('readBody')} (413), o binário (503), {mono('JSON.parse')} (400), os tipos de {mono('source')} e {mono('stdin')} (400). Depois{' '}
        {mono("runProgram(fluxPath, source, stdin ?? '')")}: o resultado vai com 200, e uma exceção vira 500 com a mensagem.
      </Fn>
      <Fn name="handler (interna)" signature="const handler: Connect.NextHandleFunction = (req, res, next) => void">
        O middleware: escolhe a rota pelo prefixo da URL, passa adiante ({mono('next()')}) o que não é da API, responde 405 a métodos que não são {mono('POST')} e chama a rota sem esperar ({mono('void')}).
      </Fn>

      <H2 title="Executar: run-program.ts" />
      <P>
        {mono('runProgram')} é o que o botão Executar faz no servidor: compila o código para um executável numa pasta temporária, roda esse executável com a entrada do campo &quot;Entrada do programa&quot; e
        devolve a saída já separada por tipo. Constantes:
      </P>
      <Table
        head={['Nome', 'Valor', 'Uso']}
        rows={[
          [mono('OUTPUT_LIMIT'), '1 MiB', 'Quanto se guarda de cada fluxo (saída padrão e de erro), separadamente.'],
          [mono('BUILD_TIMEOUT_MS'), '30 000', <>Tempo máximo do {mono('flux --build')} (análise e {mono('gcc')}).</>],
          [mono('RUN_TIMEOUT_MS'), '10 000', 'Tempo máximo do programa.'],
          [mono('KINDS'), 'L, I, W, E, F, P, A', <>Mapa da letra do registro etiquetado para o tipo da linha: {mono('log')}, {mono('info')}, {mono('warn')}, {mono('error')}, {mono('fatal')}, {mono('prompt')}, {mono('answer')}.</>],
        ]}
      />
      <H3 title="Os tipos da resposta" />
      <Table
        head={['Tipo', 'Campos']}
        rows={[
          [mono('OutputKind'), <>{mono('log')}, {mono('info')}, {mono('warn')}, {mono('error')} (as quatro do {mono('terminal')}), {mono('fatal')} (erro de execução ou {mono('abort if')}), {mono('prompt')} e {mono('answer')} (o prompt e a resposta do {mono('terminal.input')}), {mono('raw')} (texto fora de registro) e {mono('stderr')} (algo que o programa escreveu na saída de erro; não deveria haver, porque no modo etiquetado {mono('warn')}, {mono('error')} e o erro de execução também vão para a saída padrão; é, por exemplo, uma falha do sistema).</>],
          [mono('OutputLine'), <>{mono('kind: OutputKind')} e {mono('text: string')}.</>],
          [mono('RunResult'), <>{mono('status')}: {mono('ok')} (o programa rodou, com qualquer código de saída), {mono('rejected')} (não passou na análise), {mono('internal-error')} (o compilador falhou ou demorou) ou {mono('timeout')}; {mono('exitCode')} ({mono('null')} se não rodou ou morreu por sinal); {mono('output')}; {mono('truncated')}; {mono('message')} opcional: as mensagens do compilador se rejeitado, o motivo se erro interno ou sinal.</>],
          [<>{mono('Exec')} (interno)</>, <>O resultado de {mono('exec')}: {mono('code')}, {mono('signal')}, {mono('stdout')} e {mono('stderr')} ({mono('Buffer')}), {mono('timedOut')} e {mono('truncated')}.</>],
        ]}
      />
      <H3 title="O caminho de um pedido de execução" />
      <Table
        head={['Passo', 'O que acontece']}
        rows={[
          ['1', <>Cria uma pasta nova com {mono("mkdtemp(path.join(tmpdir(), 'flux-web-'))")}; o executável será {mono('<pasta>/programa')}.</>],
          ['2', <>Roda {mono('flux --build -o <pasta>/programa')} com o código na entrada padrão (30 segundos). O {mono('--build')} já liga a análise semântica.</>],
          ['3', <>Tempo esgotado: {mono('internal-error')} com {mono('A compilação demorou mais de 30 segundos.')} Código 1: {mono('rejected')}, com a saída de erro do compilador (as mensagens e {mono('Programa rejeitado.')}). Outro código diferente de 0: {mono('internal-error')} com a saída de erro ou {mono('O compilador terminou com código N.')}</>],
          ['4', <>Roda o executável, com o texto do campo como entrada padrão e {mono('FLUX_TAGGED=1')} somado ao ambiente do servidor (10 segundos).</>],
          ['5', <>{mono('parseTagged')} lê a saída padrão; se a saída de erro não está vazia (não deveria: no modo etiquetado as impressões do programa vão para a saída padrão; o relatório do coletor com {mono('FLUX_GC_STATS')} definida no ambiente do servidor vai para a saída de erro, e também uma falha do sistema), ela vira uma última linha {mono('stderr')}.</>],
          ['6', <>Monta o {mono('RunResult')}: {mono('timeout')} se o tempo esgotou, senão {mono('ok')}; {mono('message')} diz o sinal se o programa morreu por um.</>],
          ['7', <>No {mono('finally')}, apaga a pasta com {mono('rm(dir, { recursive: true, force: true })')}, mesmo se algo falhou. Medido: depois dos testes desta página não sobrou nenhuma pasta {mono('flux-web-*')}.</>],
        ]}
      />
      <P>Um pedido real, com um programa que pede um nome, imprime, avisa e divide por zero, e a resposta como veio:</P>
      <Code lang="flux" example>
        {`func main () {
  var nome = terminal.input("Nome: ");
  terminal.info("oi " + nome);
  terminal.warn("cuidado");
  var z = 0;
  terminal.log(1 / z);
}`}
      </Code>
      <Code lang="bash">{`curl -s -X POST -H 'X-Flux-Run: 1' -d @in.json http://127.0.0.1:5173/api/run`}</Code>
      <Code lang="text">
        {`{"status":"ok","exitCode":1,"output":[{"kind":"prompt","text":"Nome: "},{"kind":"answer","text":"Ana"},{"kind":"info","text":"oi Ana"},{"kind":"warn","text":"cuidado"},{"kind":"fatal","text":"Erro de execução [linha 6]:\\nDivisão por zero."}],"truncated":false}`}
      </Code>
      <P>
        ({mono('in.json')} tem {mono('source')} com o programa acima e {mono('stdin')} igual a {mono('"Ana\\n"')}.) O erro de execução não é uma falha da rota: o programa rodou e saiu com 1, então o status é{' '}
        {mono('ok')}. Um programa rejeitado ({mono('var x: int = "a";')} no {mono('main')}) responde:
      </P>
      <Code lang="text">
        {`{"exitCode":null,"output":[],"truncated":false,"status":"rejected","message":"Erro semântico [linha 1, coluna 29]:\\nTipo incompatível: esperado int, encontrado string.\\nPrograma rejeitado."}`}
      </Code>
      <Why>
        {mono('run-program.ts')}: o programa roda com {mono('FLUX_TAGGED=1')} para cada impressão sair marcada com o tipo de quem a fez. Assim a interface colore {mono('log')}, {mono('info')}, {mono('warn')},{' '}
        {mono('error')} e o erro de execução sem adivinhar pelo texto, e recebe tudo em ordem num único fluxo (no modo etiquetado, {mono('warn')} e {mono('error')} também vão para a saída padrão).
      </Why>
      <Why>
        {mono('run-program.ts')}: o texto do campo de entrada vai inteiro para a entrada padrão, e cada {mono('terminal.input')} lê uma linha. Não há terminal interativo: o programa roda de uma vez. Medido: com a
        entrada {mono('x')} e dois {mono('terminal.input')}, o primeiro leu {mono('x')} e o segundo, sem linhas restantes, devolveu o texto vazio.
      </Why>
      <Why>
        {mono('run-program.ts')}: o código vem do navegador e o programa roda neste computador com os comandos que pedir em {mono('run')}. Por isso {mono('runProgram')} não confere nada sozinho: quem o chama
        tem de ter conferido que o pedido veio da própria interface ({mono('isTrustedRunRequest')} em {mono('flux-api.ts')}).
      </Why>
      <H3 title="O formato etiquetado e parseTagged" />
      <P>
        Com {mono('FLUX_TAGGED')}, a biblioteca de execução escreve cada impressão como um registro: o byte 30 ({mono('\\x1e')}, separador de registro), a letra do tipo, o tamanho do texto em bytes em decimal,
        dois pontos e o texto, sem terminador. O lado que escreve está em <PageLink to="compilador/runtime">Biblioteca de execução</PageLink>. {mono('parseTagged')} desfaz isso:
      </P>
      <Code lang="ts">
        {`export function parseTagged(buf: Buffer): OutputLine[] {
  const lines: OutputLine[] = []
  let i = 0
  while (i < buf.length) {
    if (buf[i] !== 0x1e) {
      const next = buf.indexOf(0x1e, i)
      const end = next < 0 ? buf.length : next
      lines.push({ kind: 'raw', text: buf.subarray(i, end).toString('utf8') })
      i = end
      continue
    }
    const kind = KINDS[String.fromCharCode(buf[i + 1])]
    const colon = buf.indexOf(0x3a, i + 2)
    const size = colon < 0 ? NaN : Number(buf.subarray(i + 2, colon).toString('ascii'))
    if (!kind || !Number.isInteger(size) || size < 0) {
      i += 1
      continue
    }
    const start = colon + 1
    lines.push({ kind, text: buf.subarray(start, Math.min(start + size, buf.length)).toString('utf8') })
    i = start + size
  }
  return lines
}`}
      </Code>
      <Why>
        {mono('run-program.ts')}: o tamanho é contado em bytes, e o texto é cortado do {mono('Buffer')} antes de virar texto. Por isso o texto pode ter qualquer coisa, inclusive quebras de linha (o registro{' '}
        {mono('F')} tem uma) e letras acentuadas, sem confundir o leitor.
      </Why>
      <Why>
        {mono('run-program.ts')}: texto fora de um registro não deveria existir, mas, se aparecer, vira uma linha {mono('raw')} em vez de se perder. Um registro malformado (letra desconhecida, sem dois pontos,
        tamanho que não é inteiro) faz o leitor pular só o byte separador e continuar; o resto do registro aparece então como {mono('raw')}.
      </Why>
      <H3 title="Tempo, tamanho e processos" />
      <P>
        {mono('exec')} inicia cada processo com {mono('detached: true')}, o que o torna líder de um grupo de processos novo. No tempo esgotado, mata o grupo inteiro com {mono('process.kill(-pid, "SIGKILL")')} (o
        sinal negativo vai para o grupo); se isso falhar, mata só o processo. A saída é guardada até 1 MiB por fluxo, e o que passa disso é lido e descartado, marcando {mono('truncated')}.
      </P>
      <Why>
        {mono('run-program.ts')}: o grupo de processos existe para o tempo esgotado matar também os comandos que o programa FluxLang disparou com {mono('run')}. Medido: um programa que roda{' '}
        {mono('sh -c "echo filho; sleep 30"')} voltou com {mono('timeout')} em 10 segundos, e não sobrou nenhum processo {mono('sleep')}.
      </Why>
      <Why>
        {mono('run-program.ts')}: depois do limite a saída continua sendo lida, só não é guardada. Se o servidor parasse de ler, o cano encheria, o programa travaria na escrita e só sairia pelo tempo esgotado.
        Medido: um programa que imprime 200 000 vezes {mono('0123456789')} voltou com {mono('ok')}, {mono('truncated: true')} e 69 905 linhas (1 MiB dividido pelos 15 bytes de cada registro), e a tela mostra{' '}
        &quot;A saída passou de 1 MB e foi cortada.&quot;
      </Why>
      <P>Outros dois casos medidos, que a tela mostra como estão:</P>
      <Table
        head={['Programa', 'Resposta']}
        rows={[
          [<>{mono('terminal.log("antes");')} seguido de {mono('while (true) { }')}</>, <>{mono('timeout')} com {mono('output')} vazio: o {mono('antes')} ainda estava no buffer da biblioteca C (a saída é um cano, não um terminal) e se perdeu com o {mono('SIGKILL')}.</>],
          [<>Um objeto que contém a si mesmo, impresso ({mono('o.me = o; terminal.log(o);')})</>, <>{mono('ok')}, {mono('exitCode: null')} e {mono('message')} {mono('O programa foi encerrado pelo sinal SIGSEGV.')} (o estouro de pilha descrito em <PageLink to="compilador/runtime">Biblioteca de execução</PageLink>).</>],
        ]}
      />
      <H3 title="Funções de run-program.ts" />
      <Fn name="parseTagged" signature="export function parseTagged(buf: Buffer): OutputLine[]">
        Converte a saída etiquetada numa lista de linhas com tipo, como no trecho acima. Não lança: registros malformados são pulados byte a byte, e um registro cortado no fim (pelo limite de 1 MiB) fica com o texto
        que chegou. Chamada só por {mono('runProgram')}.
      </Fn>
      <Fn name="exec" signature="function exec(command: string, args: string[], opts: { input?: string; timeoutMs: number; env?: NodeJS.ProcessEnv }): Promise<Exec>">
        Roda um comando e resolve (nunca rejeita) com o {mono('Exec')}. A entrada padrão é {mono('ignore')} se {mono('input')} não foi dado, ou um cano que recebe {mono('input')} e é fechado (o programa vê o fim da
        entrada depois do texto). O ambiente é {mono('opts.env')} ou o do servidor. Um erro ao iniciar ({mono('ENOENT')}, por exemplo) vai para a saída de erro do resultado, com {mono('code')} e {mono('signal')}{' '}
        {mono('null')}. Chamada duas vezes por {mono('runProgram')}.
      </Fn>
      <Fn name="collect (interna a exec)" signature="const collect = (name: 'stdout' | 'stderr') => (chunk: Buffer) => void">
        Guarda o pedaço que cabe em {mono('OUTPUT_LIMIT')} para aquele fluxo e marca {mono('truncated')} se sobrou alguma coisa.
      </Fn>
      <Fn name="finish (interna a exec)" signature="const finish = (code: number | null, signal: string | null) => void">
        Cancela o temporizador e resolve com os fluxos juntados. Ligada ao evento {mono('close')} do processo e chamada também no {mono('error')}.
      </Fn>
      <Fn name="runProgram" signature="export async function runProgram(fluxPath: string, source: string, stdin = ''): Promise<RunResult>">
        Os sete passos da tabela acima. {mono('fluxPath')} é o caminho absoluto do {mono('flux')}; {mono('source')}, o código; {mono('stdin')}, o texto do campo de entrada. Só lança se a pasta temporária não puder ser
        criada ou apagada; todo o resto vira um {mono('RunResult')}. Chamada pela rota {mono('run')} de {mono('flux-api.ts')}.
      </Fn>

      <H2 title="O front-end" />
      <H3 title="App.tsx: o estado e as duas telas" />
      <P>
        {mono('App')} é o único dono do estado da tela; os componentes só recebem valores e funções. A barra de topo é sempre visível; abaixo dela há a tela do editor ({mono('main')}, escondida com{' '}
        {mono('hidden')} na documentação, para não perder o estado) ou a documentação. A tela é escolhida pelo endereço: {mono('#/editor')} (ou qualquer outro) é o editor, {mono('#/doc/...')} é a documentação
        (ver <PageLink to="compilador/documentacao">A documentação do projeto</PageLink>).
      </P>
      <Table
        head={['Estado', 'Começa com', 'Para quê']}
        rows={[
          [mono('source'), <>o texto de {mono('invalido.flux')}</>, 'O código no editor.'],
          [mono('focus'), mono('null'), <>O último pedido de &quot;ir até&quot; ({mono('Focus')}) para o editor.</>],
          [mono('hideRest'), mono('false'), <>A caixa &quot;ocultar *_rest&quot; da árvore.</>],
          [mono('semantic'), mono('true'), <>A chave &quot;Análise semântica&quot;: vira {mono('?semantic=1')}.</>],
          [mono('stdin'), 'texto vazio', 'O campo "Entrada do programa".'],
          [mono('expand'), mono('{ key: 0, all: true }'), <>Os botões Expandir e Recolher da árvore: cada clique soma 1 em {mono('key')} e põe {mono('all')}.</>],
          [<>{mono('result')}, {mono('loading')}, {mono('failure')}</>, <>de {mono('useCompile')}</>, 'O último JSON, se há um pedido em curso e a falha do servidor.'],
          [mono('runState'), <>de {mono('useRun')}</>, 'A fase da execução e o resultado.'],
          [<>{mono('view')}, {mono('pageId')}</>, <>de {mono('useHashRoute')}</>, 'A tela atual e a página da documentação.'],
        ]}
      />
      <P>
        Valores derivados: {mono('usesInput')} testa o código com {mono('/\\bterminal\\s*\\.\\s*input\\b/')} e decide se o campo de entrada aparece (o teste é textual: um {mono('terminal.input')} dentro de um
        comentário também o mostra); {mono('errorLines')} é o conjunto das linhas dos erros, para o editor realçar. {mono('SAMPLES')} são os dois exemplos, com os rótulos &quot;Exemplo válido&quot; e
        &quot;Exemplo inválido&quot;. Uma falha do servidor aparece numa faixa com {mono('role="alert"')} acima dos painéis, só na tela do editor.
      </P>
      <P>
        Os painéis ficam numa grade: em telas a partir de {mono('lg')} (64 rem), três colunas (Código, Tokens, Árvore) e uma segunda faixa de altura fixa com Erros (ocupando duas colunas) e Saída; abaixo
        disso, um painel embaixo do outro, cada um com altura própria. Na documentação, {mono('App')} põe {mono('DocsView')} dentro de {mono('DocsProvider')}, cujo {mono('openInEditor')} troca o código e volta ao
        editor (o botão &quot;Abrir no editor&quot; dos exemplos desta documentação).
      </P>
      <Fn name="App" signature="export default function App(): JSX.Element">
        O componente raiz, montado por {mono('main.tsx')}. Guarda o estado da tabela acima e liga os componentes: {mono('TopBar')}, os cinco {mono('Panel')} e {mono('DocsView')}.
      </Fn>
      <Fn name="goTo (interna a App)" signature="const goTo = (line: number, column: number, length?: number) => void">
        Cria um {mono('Focus')} novo com {mono('nonce: Date.now()')}. É o {mono('onSelect')} de tokens, árvore e erros.
      </Fn>
      <H3 title="TopBar" />
      <P>
        A barra de topo. Mostra o nome &quot;FluxLang&quot; (um {mono('h1')} no editor; um parágrafo na documentação, que tem o próprio {mono('h1')}), as abas Editor e Documentação e, só no editor, os botões e o
        resultado. As abas seguem o padrão de abas da ARIA: {mono('role="tablist"')}, {mono('aria-selected')}, só a aba ativa com {mono('tabIndex')} 0, e as setas, {mono('Home')} e {mono('End')} trocam de aba e
        movem o foco (num {mono('requestAnimationFrame')}, depois de a troca renderizar). O resultado fica numa região {mono('role="status"')} com {mono('aria-live="polite"')}: o selo &quot;Programa aceito&quot; ou
        &quot;Programa rejeitado&quot; e &quot;N linhas · E erros · T tokens&quot;; antes do primeiro resultado, &quot;Compilando...&quot; (ou &quot;Sem resultado&quot;, se o primeiro pedido falhou).
      </P>
      <Table
        head={['Propriedade', 'Tipo', 'Uso']}
        rows={[
          [mono('result'), mono('CompileResult | null'), 'O selo e as contagens.'],
          [mono('loading'), mono('boolean'), '"Compilando..." quando ainda não há resultado.'],
          [mono('onOpenFile'), mono('(name: string, text: string) => void'), 'Chamada com o arquivo escolhido em "Abrir arquivo".'],
          [mono('onCompile'), mono('() => void'), 'O botão Compilar.'],
          [<>{mono('samples')}, {mono('onSample')}</>, <>{mono('{ label, text }[]')}, {mono('(text) => void')}</>, 'Um botão por exemplo.'],
          [<>{mono('semantic')}, {mono('onSemantic')}</>, <>{mono('boolean')}, {mono('(on) => void')}</>, 'A caixa "Análise semântica".'],
          [<>{mono('running')}, {mono('onRun')}</>, <>{mono('boolean')}, {mono('() => void')}</>, 'O botão Executar, desligado e com o texto "Executando..." durante a execução.'],
          [<>{mono('view')}, {mono('onView')}</>, <>{mono("'editor' | 'docs'")}, {mono('(view) => void')}</>, 'As abas.'],
        ]}
      />
      <Fn name="handleFile (interna a TopBar)" signature="async function handleFile(file: File | undefined): Promise<void>">
        Lê o arquivo com {mono('file.text()')}, chama {mono('onOpenFile')} e limpa o valor do {mono('input')} de arquivo. O {mono('input')} aceita {mono('.flux')}, {mono('.txt')} e {mono('text/plain')} e fica
        escondido ({mono('sr-only')}); o rótulo &quot;Abrir arquivo&quot; é que parece um botão.
      </Fn>
      <Why>
        {mono('TopBar.tsx')}: o valor do {mono('input')} de arquivo é limpo depois de cada leitura porque o navegador só dispara {mono('change')} se o arquivo escolhido mudar. Sem isso, abrir de novo o mesmo arquivo
        (depois de editá-lo fora) não faria nada.
      </Why>
      <Fn name="handleTabKey (interna a TopBar)" signature="function handleTabKey(e: React.KeyboardEvent<HTMLButtonElement>): void">
        Seta para a direita ou para a esquerda (circular), {mono('Home')} e {mono('End')}: escolhe a aba, chama {mono('onView')} e foca o botão {mono('tab-<id>')}. Outras teclas passam.
      </Fn>
      <H3 title="Editor" />
      <P>
        Um {mono('textarea')} sem quebra de linha ({mono('wrap="off"')}, {mono('spellCheck')} desligado) com fundo transparente, sobre uma camada de faixas que pintam as linhas com erro, e uma calha de números à
        esquerda. A calha e as faixas acompanham a rolagem do {mono('textarea')}: o evento {mono('scroll')} guarda {mono('scrollTop')}, a calha é deslocada com {mono('translateY')} e cada faixa é posicionada em{' '}
        {mono('PADDING + (linha - 1) * LINE_HEIGHT - scrollTop')}. Os números das linhas com erro saem em negrito, na cor de erro.
      </P>
      <Table
        head={['Propriedade', 'Tipo', 'Uso']}
        rows={[
          [mono('value'), mono('string'), 'O código.'],
          [mono('onChange'), mono('(value: string) => void'), 'Cada tecla.'],
          [mono('errorLines'), mono('ReadonlySet<number>'), 'As linhas (a partir de 1) a realçar.'],
          [mono('focus'), mono('Focus | null'), 'O pedido de seleção (ver o efeito abaixo).'],
        ]}
      />
      <Why>
        {mono('Editor.tsx')}: um {mono('textarea')} não colore linhas sozinho, então o realce é uma camada à parte, atrás do texto, com a rolagem sincronizada à mão. O editor fica simples (sem biblioteca de editor) e
        o texto continua sendo um campo de formulário comum, com desfazer, colar e seleção do navegador.
      </Why>
      <Why>
        {mono('Editor.tsx')}: {mono('LINE_HEIGHT')} (20) e {mono('PADDING')} (8), em pixels, têm de bater com as classes {mono('leading-5')} (1,25 rem) e {mono('p-2')} (0,5 rem) do {mono('textarea')}: a calha e as
        faixas são posicionadas com esses números. Mudar a fonte ou o espaçamento do editor sem mudar as constantes desalinha o realce.
      </Why>
      <P>
        O efeito de foco roda a cada {mono('Focus')} novo (clique num erro, token ou nó): calcula o deslocamento da linha pedida (limitada às linhas existentes); com {mono('length')}, seleciona{' '}
        {mono('length')} caracteres a partir da coluna; sem ele, seleciona a linha inteira. Depois foca o {mono('textarea')} sem rolar ({mono('preventScroll')}), aplica {mono('setSelectionRange')} e rola para deixar a
        linha no meio. A coluna do {mono('flux')} conta caracteres (medido: em {mono('var s = "olá"; var x')}, o {mono(';')} depois do texto está na coluna 29, cinco depois da aspa de abertura), e o tamanho dos
        tokens é contado em pontos de código ({mono('[...text].length')}), então acentos não deslocam a seleção.
      </P>
      <Fn name="Editor" signature="export function Editor({ value, onChange, errorLines, focus }: EditorProps): JSX.Element">
        O componente descrito acima. O número de linhas vem de {mono("value.split('\\n').length")}.
      </Fn>
      <H3 title="TokenList e ErrorList" />
      <Table
        head={['Componente', 'Propriedades', 'O que mostra']}
        rows={[
          [mono('TokenList'), <>{mono('tokens: Token[]')}, {mono('onSelect(line, column, length)')}</>, <>Um botão por token, numa grade de três colunas: {mono('linha:coluna')}, o tipo (na cor de destaque) e o texto. Clicar seleciona o token no editor, com o tamanho do texto. Sem tokens: &quot;Nenhum token reconhecido.&quot;</>],
          [mono('ErrorList'), <>{mono('errors: CompileError[]')}, {mono('onSelect(line, column)')}</>, <>Um botão por erro: o tipo ({mono('léxico')}, {mono('sintático')} ou {mono('semântico')}) com {mono('linha:coluna')}, e a mensagem com as quebras de linha preservadas ({mono('whitespace-pre-wrap')}). Clicar seleciona a linha inteira (não há tamanho). Sem erros: &quot;Nenhum erro.&quot;</>],
        ]}
      />
      <H3 title="TreeView" />
      <P>
        A árvore de derivação do JSON, com nós recolhíveis. Cada nó tem um botão de abrir e fechar ({mono('aria-expanded')}, rótulo &quot;Expandir&quot; ou &quot;Recolher&quot;) se tem filhos, e um botão com o
        rótulo, o texto (para tokens) e {mono('linha:coluna')}. A cor depende do tipo do nó: {mono('error')} em vermelho e negrito, {mono('token')} na cor de destaque, {mono('empty')} (ε) apagado e em itálico. Nós sem
        posição (as folhas ε e as regras que só derivam ε) têm o botão desligado; tokens selecionam o próprio texto, regras selecionam a linha.
      </P>
      <Table
        head={['Propriedade', 'Tipo', 'Uso']}
        rows={[
          [mono('root'), mono('TreeNode | null'), <>A raiz do JSON. {mono('null')} (erro grave de sintaxe) mostra &quot;Sem árvore: nenhuma regra foi concluída.&quot;</>],
          [mono('hideRest'), mono('boolean'), <>Mostra a árvore compacta de {mono('collapseRest')}. A árvore fiel à gramática continua no {mono('--json')}; a opção é só da tela.</>],
          [<>{mono('expandKey')}, {mono('expandAll')}</>, <>{mono('number')}, {mono('boolean')}</>, 'O último pedido de Expandir ou Recolher tudo.'],
          [mono('onSelect'), mono('(line, column, length?) => void'), 'Clique num nó.'],
        ]}
      />
      <P>
        Sem nenhum pedido de Expandir ou Recolher ({mono('expandKey')} 0), cada nó nasce aberto se a profundidade é menor que {mono('INITIAL_DEPTH')} (4), para a primeira tela mostrar o começo da árvore sem abrir
        milhares de nós. Depois de um pedido, todos nascem com {mono('expandAll')}.
      </P>
      <Why>
        {mono('TreeView.tsx')}: Expandir tudo e Recolher tudo funcionam trocando a {mono('key')} da lista ({mono('expandKey')} e {mono('hideRest')}). Uma {mono('key')} nova faz o React descartar e recriar todos os
        nós, e cada um nasce com o estado pedido. Assim nenhum nó precisa ouvir uma ordem global; o custo é perder os ajustes feitos à mão, o que é o efeito desejado desses botões.
      </Why>
      <Fn name="TreeView" signature="export function TreeView({ root, hideRest, expandKey, expandAll, onSelect }: TreeViewProps): JSX.Element">
        Calcula as raízes ({mono('[root]')}, ou a lista de {mono('collapseRest(root)')}) e desenha um {mono('Node')} para cada.
      </Fn>
      <Fn name="Node (interna)" signature="function Node({ node, depth, expandAll, expandKey, onSelect }: NodeProps): JSX.Element">
        Um nó e, se aberto, os filhos, recursivamente. Guarda {mono('open')} no próprio estado.
      </Fn>
      <H3 title="Panel e InputBox" />
      <Table
        head={['Componente', 'Propriedades', 'O que faz']}
        rows={[
          [mono('Panel'), <>{mono('title')}, {mono('actions?')} (controles à direita do título), {mono('className?')}, {mono('children')}</>, <>A moldura de um painel: um {mono('section')} com o título num {mono('h2')} fixo em cima e um corpo que rola sozinho. O corpo é uma {mono('role="region"')} com {mono('aria-label')} igual ao título e {mono('tabIndex')} 0.</>],
          [mono('InputBox'), <>{mono('value')}, {mono('onChange')}</>, <>O campo &quot;Entrada do programa (uma linha para cada terminal.input)&quot;: um {mono('textarea')} de três linhas, redimensionável na vertical. Só aparece quando {mono('usesInput')} é verdadeiro.</>],
        ]}
      />
      <Why>
        {mono('Panel.tsx')}: o corpo do painel rola, então tem de ser alcançável pelo teclado: com {mono('tabIndex')} 0 ele entra na ordem do Tab, e as setas rolam o conteúdo. A {mono('region')} com o título como
        nome faz o leitor de tela anunciar qual painel recebeu o foco.
      </Why>
      <Why>
        {mono('InputBox.tsx')}: a página não é um terminal interativo; o programa roda de uma vez com esse texto como entrada padrão, uma linha para cada {mono('terminal.input')}, na ordem. Quando as linhas acabam,
        o {mono('terminal.input')} devolve o texto vazio (medido, ver &quot;O caminho de um pedido de execução&quot;). AGENTS.md registra isso como escolha ainda não confirmada pelo usuário (mudável).
      </Why>
      <H3 title="OutputPanel" />
      <P>
        Mostra o {mono('RunState')}: antes de executar, um texto que lembra que o programa roda neste computador, inclusive os comandos de {mono('run')}; durante, &quot;Executando...&quot;; uma falha da rota, em
        vermelho. Com o resultado: um título (&quot;Terminou com código N&quot;, em verde só se o status é {mono('ok')} e o código é 0; &quot;Interrompido: passou de 10 segundos&quot;; &quot;Não executou: o programa tem
        erros&quot;, seguido das mensagens; &quot;Erro interno do compilador&quot;), a mensagem extra se houver, uma linha por saída, &quot;(sem saída)&quot; e o aviso de corte.
      </P>
      <Table
        head={['Tipo', 'Rótulo na tela', 'Cor (token)']}
        rows={[
          [mono('log'), mono('log'), mono('text-accent')],
          [mono('info'), mono('info'), mono('text-info')],
          [mono('warn'), mono('warn'), mono('text-warn')],
          [mono('error'), mono('error'), mono('text-bad')],
          [mono('fatal'), mono('fatal'), <>{mono('text-bad')} em negrito</>],
          [mono('prompt'), mono('input'), <>{mono('text-muted')}, com a resposta em negrito na mesma linha</>],
          [mono('answer'), mono('entrada'), <>{mono('text-ink')} (só se não veio logo depois de um prompt)</>],
          [mono('raw'), mono('saída'), mono('text-ink')],
          [mono('stderr'), mono('stderr'), mono('text-bad')],
        ]}
      />
      <Why>
        {mono('OutputPanel.tsx')}: cada linha leva o nome do tipo escrito ao lado, além da cor. A cor nunca é a única pista (um critério de acessibilidade: quem não distingue as cores ainda lê o tipo).
      </Why>
      <Why>
        {mono('OutputPanel.tsx')}: quando chega um resultado, o painel rola até o fim, como um terminal: é lá que aparece o erro de execução ou o aviso de corte.
      </Why>
      <Fn name="OutputPanel" signature="export function OutputPanel({ state }: { state: RunState }): JSX.Element">
        O painel acima. O resultado fica numa região {mono('role="status"')} com {mono('aria-live="polite"')}, para o leitor de tela anunciar o fim da execução.
      </Fn>
      <Fn name="rows (interna)" signature="function rows(lines: OutputLine[]): Row[]">
        Junta cada {mono('prompt')} com o {mono('answer')} que vem logo depois numa linha só ({mono('Row')} com o campo {mono('answer')}), como num terminal, onde a resposta aparece ao lado da pergunta. As demais
        linhas passam como estão.
      </Fn>
      <H3 title="lib/types.ts: o contrato com o --json" />
      <P>
        Os tipos que o front-end espera do servidor. {mono('CompileResult')}, {mono('Token')}, {mono('CompileError')} e {mono('TreeNode')} espelham à mão o objeto que {mono('json.c')} escreve (ver{' '}
        <PageLink to="compilador/arvore-json">Árvore de derivação e JSON</PageLink>); {mono('OutputKind')}, {mono('OutputLine')} e {mono('RunResult')} repetem os de {mono('run-program.ts')}. Não há geração automática:
        mudar o formato no C ou no servidor exige mudar este arquivo.
      </P>
      <Table
        head={['Tipo', 'Campos']}
        rows={[
          [mono('NodeKind'), <>{mono('rule')}, {mono('token')}, {mono('empty')} (ε) ou {mono('error')} (trecho descartado pelo modo pânico).</>],
          [mono('TreeNode'), <>{mono('kind')}, {mono('label')}; opcionais {mono('text')}, {mono('line')}, {mono('column')} e {mono('children')} (só existe se há filhos).</>],
          [mono('Token'), <>{mono('line')}, {mono('column')}, {mono('type')} (o nome do token), {mono('text')}.</>],
          [mono('CompileError'), <>{mono('kind')} ({mono('léxico')}, {mono('sintático')} ou {mono('semântico')}), {mono('line')}, {mono('column')}, {mono('message')}.</>],
          [mono('CompileResult'), <>{mono('accepted')}, {mono('lines')}, {mono('tokens')}, {mono('errors')}, {mono('tree')} ({mono('null')} quando o parser não montou a raiz).</>],
          [<>{mono('OutputKind')}, {mono('OutputLine')}, {mono('RunResult')}</>, <>Iguais aos de {mono('run-program.ts')}.</>],
          [mono('Focus'), <>{mono('line')}, {mono('column')}, {mono('length?')} (quantos caracteres selecionar; sem ele, a linha inteira) e {mono('nonce')}.</>],
        ]}
      />
      <Why>
        {mono('types.ts')}: {mono('Focus.nonce')} muda a cada pedido para que clicar duas vezes no mesmo erro funcione (a nota que havia no código dizia isso). Hoje {mono('goTo')} já cria um objeto novo a cada
        clique, e o efeito do editor compara a dependência por identidade, então ele rodaria de novo mesmo sem o campo; o {mono('nonce')} garante que dois pedidos para o mesmo lugar nunca são valores iguais,
        mesmo que alguém passe a comparar por conteúdo.
      </Why>
      <H3 title="lib/tree.ts" />
      <Fn name="isRestNode" signature="export const isRestNode = (node: TreeNode): boolean">
        Verdadeiro para uma regra cujo nome termina em {mono('_rest')} ou {mono('_after_comma')}.
      </Fn>
      <Why>
        {mono('tree.ts')}: esses são os não-terminais criados na fatoração LL(1) da gramática para tirar a recursão à esquerda ({mono('or_rest')}, {mono('expression_list_rest')}, {mono('list_after_comma')}...). Eles
        existem por causa da forma da gramática, não da linguagem, e alongam a árvore. Ver <PageLink to="compilador/parser">Parser</PageLink>.
      </Why>
      <Fn name="collapseRest" signature="export function collapseRest(node: TreeNode): TreeNode[]">
        A árvore compacta: tira as folhas ε, tira os nós {mono('*_rest')} e sobe os filhos deles para o pai (então um {mono('or_expr')} fica com {mono('and_expr OR and_expr ...')} em fila). Devolve uma lista porque um
        nó removido pode virar vários irmãos (ou nenhum). Não altera a árvore original: cria nós novos.
      </Fn>
      <Fn name="countNodes" signature="export function countNodes(node: TreeNode): number">
        Conta os nós, recursivamente, para o título &quot;Árvore sintática (N nós)&quot;. Conta a árvore fiel, mesmo com {mono('hideRest')}.
      </Fn>
      <H3 title="lib/useCompile.ts" />
      <Fn name="useCompile" signature="export function useCompile(source: string, semantic: boolean): { result, loading, failure, compileNow }">
        Compila {mono('source')} chamando {mono('POST /api/compile')} (com {mono('?semantic=1')} se pedido), corpo {mono('text/plain')}. A primeira compilação é imediata; depois, cada mudança de {mono('source')} ou{' '}
        {mono('semantic')} recompila 400 ms depois da última (o temporizador anterior é cancelado). {mono('compileNow')} compila na hora (o botão Compilar). Com sucesso, guarda o resultado e limpa{' '}
        {mono('failure')}; com erro (resposta não 2xx, rede, JSON inválido), guarda a mensagem em {mono('failure')} e mantém o último resultado. {mono('failure')} é falha do servidor ou do compilador, não erro do
        programa.
      </Fn>
      <Why>
        {mono('useCompile.ts')}: cada pedido novo aborta o anterior com {mono('AbortController')}, e a resposta de um pedido abortado é ignorada. Sem isso, uma resposta lenta de um texto antigo podia chegar depois
        da do texto atual e sobrescrevê-la.
      </Why>
      <H3 title="lib/useRun.ts" />
      <Fn name="useRun" signature="export function useRun(): { state: RunState; run: (source: string, stdin: string) => Promise<void> }">
        Executa pelo servidor: {mono('POST /api/run')} com {mono('{ source, stdin }')} em JSON e o cabeçalho {mono('X-Flux-Run: 1')}. {mono('RunState')} é {mono('idle')}, {mono('running')},{' '}
        {mono('done')} (com o {mono('RunResult')}) ou {mono('failed')} (com a mensagem do erro da rota). Como em {mono('useCompile')}, um pedido novo aborta o anterior.
      </Fn>
      <Why>
        {mono('useRun.ts')}: o cabeçalho {mono('X-Flux-Run')} é o que o servidor exige para aceitar a execução, e um outro site aberto no navegador não consegue enviá-lo (ver &quot;Segurança do Executar&quot;).
      </Why>

      <H2 title="Aparência: os tokens de index.css" />
      <P>
        {mono('web/src/index.css')} importa o Tailwind e define as cores num bloco {mono('@theme')}. Cada {mono('--color-x')} vira as classes {mono('bg-x')}, {mono('text-x')}, {mono('border-x')} e as demais do
        Tailwind, e os componentes usam só essas classes: nenhum valor de cor solto. O tema escuro redefine as mesmas variáveis em {mono(':root')} dentro de {mono('@media (prefers-color-scheme: dark)')}, então segue
        o sistema operacional, sem botão. {mono('html')} declara {mono('color-scheme: light dark')} (barras de rolagem e campos nativos acompanham) e {mono('body')} usa {mono('--color-bg')}, {mono('--color-ink')} e a fonte
        sem serifa.
      </P>
      <Table
        head={['Token', 'Papel']}
        rows={[
          [mono('--color-bg'), 'Fundo da página, das calhas e do item em foco ou passado o mouse.'],
          [mono('--color-panel'), 'Fundo dos painéis, barras e diálogos.'],
          [mono('--color-line'), 'Bordas e divisórias.'],
          [mono('--color-ink'), 'Texto principal.'],
          [mono('--color-muted'), 'Texto secundário, números de linha, rótulos.'],
          [mono('--color-accent'), 'Destaque: aba ativa, botão Executar, contornos de foco, links, tokens e log.'],
          [mono('--color-ok'), 'Programa aceito, código de saída 0, strings no realce de código.'],
          [mono('--color-bad'), 'Erros: linhas realçadas, mensagens, nós de erro, error e fatal.'],
          [mono('--color-warn'), 'warn e números no realce.'],
          [mono('--color-info'), 'info, tipos no realce e as caixas de nota.'],
          [mono('--color-scrim'), 'O véu atrás do menu e da busca da documentação.'],
          [<>{mono('--font-sans')}, {mono('--font-mono')}</>, 'As pilhas de fontes do sistema (sem fonte baixada).'],
        ]}
      />
      <Why>
        {mono('index.css')}: os componentes só usam as classes dos tokens ({mono('bg-panel')}, {mono('text-ink')}, {mono('border-line')}, {mono('text-bad')}...), então o tema escuro é só trocar os valores das
        variáveis, sem tocar em nenhum componente.
      </Why>
      <Why>
        {mono('index.css')}: a classe {mono('.font-mono')} desliga as ligaduras ({mono('font-variant-ligatures: none')}). O código tem de aparecer como foi digitado: uma fonte com ligaduras desenharia{' '}
        {mono('<=')}, {mono('->')} ou {mono('!=')} como um símbolo só, numa tela que mostra o código e os tokens de um compilador.
      </Why>

      <H2 title="Acessibilidade" />
      <Table
        head={['Convenção', 'Onde']}
        rows={[
          ['Áreas que rolam entram na ordem do Tab', <>O corpo de cada {mono('Panel')} ({mono('tabIndex')} 0, {mono('role="region"')}); na documentação, só quando o conteúdo de fato transborda ({mono('useOverflowFocus')}).</>],
          ['Alvos de pelo menos 24 por 24 pixels', <>Botões e caixas com {mono('min-h-6')} ou {mono('size-6')} (1,5 rem): abas, botões pequenos da árvore, linhas de tokens, caixas de marcar.</>],
          ['Foco visível', <>{mono('focus-visible:outline-2')} na cor de destaque nos botões, links, abas, regiões que rolam e campos. As exceções, hoje: o {mono('textarea')} do editor, que usa {mono('outline-none')} (ali o foco aparece só pelo cursor de texto), e as duas caixas de marcar (Análise semântica, na barra de cima, e ocultar *_rest, no painel da árvore em {mono('App.tsx')}; classe {mono('size-6 accent-accent')}), que usam o anel de foco padrão do navegador.</>],
          ['Mudanças anunciadas', <>O resultado da compilação e o da execução em {mono('role="status"')} com {mono('aria-live="polite"')}; a falha do servidor em {mono('role="alert"')}.</>],
          ['Um só h1 por tela', <>&quot;FluxLang&quot; é {mono('h1')} no editor e parágrafo na documentação, que tem o título da página como {mono('h1')}; os painéis usam {mono('h2')}.</>],
          ['Cor nunca sozinha', 'O tipo de cada linha de saída é escrito ao lado; erros têm o tipo escrito; o selo diz "aceito" ou "rejeitado".'],
          ['Teclado em componentes compostos', 'As abas com setas, Home e End; a busca com setas e Enter; os diálogos com Esc e o Tab preso dentro.'],
          ['Cores só por tokens', <>Para o tema escuro funcionar e o contraste ser conferido num só lugar ({mono('index.css')}).</>],
        ]}
      />
      <P>
        Os portões de design usados neste projeto: depois de mudar a tela, AGENTS.md pede um retrato do DOM e os portões {mono('verify_states')}, {mono('axe_audit')} (claro e escuro),{' '}
        {mono('verify_target_size')} e {mono('verify_keyboard')}. As páginas desta documentação passam também por {mono('lint_hardcodes.py')} (nenhuma cor, tamanho ou tempo solto) e {mono('check_no_emoji.py')}.
      </P>

      <H2 title="A documentação (web/src/docs)" />
      <P>
        A aba Documentação mostra páginas escritas em TSX, que moram em {mono('web/src/docs/')}. O sistema ({mono('DocPage')} e o registro, a rota {mono('#/doc/...')}, os blocos, o realce de código, a busca, o
        &quot;Nesta página&quot;, o menu, os diálogos, {mono('useModal')} e {mono('useOverflowFocus')}) e a regra de que o código não leva comentário estão em{' '}
        <PageLink to="compilador/documentacao">A documentação do projeto</PageLink>.
      </P>

      <H2 title="O que está em outras páginas" />
      <P>
        O formato exato do {mono('--json')} está em <PageLink to="compilador/arvore-json">Árvore de derivação e JSON</PageLink>; a saída etiquetada, as cores e o {mono('terminal.input')} do lado do programa, em{' '}
        <PageLink to="compilador/runtime">Biblioteca de execução</PageLink>; as opções {mono('--json')}, {mono('--semantic')} e {mono('--build')} do {mono('./flux')}, em{' '}
        <PageLink to="compilador/linha-de-comando">Linha de comando e variáveis de ambiente</PageLink>; o alvo {mono('make web')} no Makefile, em <PageLink to="compilador/mapa-e-build">Mapa do repositório e build</PageLink>.
      </P>
    </>
  )
}
