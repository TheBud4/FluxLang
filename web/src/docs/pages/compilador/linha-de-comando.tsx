import { Callout, Code, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function LinhaDeComando() {
  return (
    <>
      <H2 title="Uso" />
      <Code lang="text">{`./flux [opções] [arquivo.flux]`}</Code>
      <P>
        Sem arquivo, o programa é lido da entrada padrão. As opções são lidas da esquerda para a direita, e um argumento
        que não começa com {mono('-')} é o arquivo (se houver mais de um, vale o último). O traço sozinho ({mono('-')})
        não significa "entrada padrão": é uma opção desconhecida.
      </P>
      <Code lang="bash">
        {`./flux programa.flux
./flux < programa.flux
./flux --run programa.flux`}
      </Code>

      <H2 title="Opções" />
      <Table
        head={['Opção', 'Efeito']}
        rows={[
          [<>{mono('-t')}, {mono('--tokens')}</>, <>Roda só o lexer e imprime um token por linha: {mono('linha:coluna')}, o nome do token e, para identificadores e literais, o texto. Não chama o parser. Continua depois de erros léxicos e sai com 1 se houve algum.</>],
          [mono('--tree'), 'Imprime a árvore de derivação (um nó por regra da BNF), mesmo que o programa tenha erros, e depois a linha de aceito ou rejeitado.'],
          [mono('--json'), <>Imprime só um objeto JSON com os tokens, os erros, o número de linhas e a árvore. Os erros não vão para a saída de erro. Ver <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink>.</>],
          [mono('--ast'), 'Imprime a AST (sem rodar a análise semântica), depois a linha de aceito ou rejeitado. Se o programa tem erros de sintaxe, não há AST.'],
          [mono('--semantic'), <>Roda a análise semântica (E1 a E24). Sem esta opção, só léxico e sintaxe são conferidos.</>],
          [mono('--c'), 'Imprime o programa C gerado, com a biblioteca de execução embutida. Liga a análise semântica.'],
          [mono('--build'), <>Gera o executável via {mono('gcc')} e imprime {mono('Executável gerado: nome')}. Liga a análise semântica.</>],
          [<>{mono('-o')} {mono('nome')}</>, <>Com {mono('--build')}, escolhe o nome do executável. Sem {mono('-o')}, o nome é o do arquivo sem a extensão, na pasta atual ({mono('a.out')} se o programa veio da entrada padrão). Precisa de um valor logo depois: como último argumento, vira "opção desconhecida".</>],
          [mono('--run'), 'Gera um executável temporário, roda e apaga. O código de saída do ./flux é o do programa. Liga a análise semântica.'],
          [mono('--windows'), <>Com {mono('--build')} ou {mono('--run')}: o executável é um {mono('.exe')} de Windows (compilado com {mono('x86_64-w64-mingw32-gcc')}); o {mono('--run')} o executa com o {mono('wine')}. Em qualquer outro modo não tem efeito.</>],
          [<>{mono('-h')}, {mono('--help')}</>, <>Imprime o texto de uso na saída padrão e sai com 0, sem ler mais nada.</>],
        ]}
      />
      <Callout kind="aviso">
        Se o arquivo não tem extensão, o executável de {mono('--build')} ganha o mesmo nome do arquivo e o sobrescreve:{' '}
        {mono('./flux --build prog')} troca o fonte {mono('prog')} por um binário. Use {mono('-o')} ou uma extensão
        {mono('.flux')} nos fontes.
      </Callout>

      <H3 title="Como as opções se combinam" />
      <P>
        Mais de uma opção pode aparecer. O que acontece é decidido por esta ordem fixa em {mono('run')}, e a primeira
        regra que se aplica encerra o programa:
      </P>
      <Table
        head={['Passo', 'Regra']}
        rows={[
          ['1', <>{mono('-h')} imprime a ajuda e sai com 0 na hora; uma opção desconhecida imprime {mono('Opção desconhecida: x')} na saída de erro, depois a ajuda na saída padrão, e sai com 2. Valem mesmo que apareçam depois de outras opções.</>],
          ['2', <>Abre o arquivo; se não consegue, imprime a mensagem do sistema ({mono('perror')}) e sai com 2.</>],
          ['3', <>{mono('-t')} vence tudo: só o lexer roda e as demais opções são ignoradas.</>],
          ['4', <>{mono('--json')} liga o modo JSON antes do parser.</>],
          ['5', <>O parser roda ({mono('yyparse')}). Com {mono('--c')}, {mono('--build')} ou {mono('--run')}, a semântica é ligada.</>],
          ['6', <>Se não houve erro até aqui e há {mono('--ast')} ou semântica, a AST é construída; com semântica, ela é conferida.</>],
          ['7', <>{mono('--json')} imprime o JSON e sai (0 se aceito, 1 se não): vence {mono('--c')}, {mono('--build')}, {mono('--run')}, {mono('--tree')} e {mono('--ast')}, que ficam sem efeito (a semântica, se ligada por eles, ainda roda).</>],
          ['8', <>{mono('--c')}, {mono('--build')} ou {mono('--run')}: gera código. Se mais de uma aparecer, {mono('--c')} vence {mono('--build')}, que vence {mono('--run')}.</>],
          ['9', <>Senão, imprime a árvore ({mono('--tree')}), a AST ({mono('--ast')}) e a linha {mono('Programa aceito.')} ou {mono('Programa rejeitado.')}.</>],
        ]}
      />
      <P>Alguns exemplos, executados de verdade:</P>
      <Code lang="bash">{`./flux --build --run mini.flux`}</Code>
      <Code lang="text">{`Executável gerado: mini`}</Code>
      <Code lang="bash">{`./flux --json --semantic sem.flux | grep -A2 '"errors"'`}</Code>
      <Code lang="text">
        {`"errors": [
  {"kind":"semântico","line":2,"column":17,"message":"Tipo incompatível: esperado int, encontrado string."}
],`}
      </Code>
      <Code lang="bash">{`./flux sem.flux mini.flux`}</Code>
      <Code lang="text">{`Programa aceito.`}</Code>

      <H2 title="Códigos de saída" />
      <Table
        head={['Código', 'Quando']}
        rows={[
          ['0', <>Programa aceito; ajuda; {mono('--c')} ou {mono('--build')} concluídos; ou o programa FluxLang de {mono('--run')} terminou com 0.</>],
          ['1', <>Programa rejeitado (erro léxico, sintático ou semântico), ou {mono('-t')} encontrou erro léxico. Com {mono('--run')}, é também o código de um programa que terminou com erro de execução ou {mono('abort if')}.</>],
          ['2', <>Opção desconhecida, arquivo ilegível ou inexistente, ou memória esgotada ({mono('Memória esgotada.')}, da arena).</>],
          ['3', <>Falha interna da geração: não foi possível criar o arquivo temporário ({mono('mkstemp')}) ou o {mono('gcc')} não compilou o C gerado.</>],
          ['outro', <>Só com {mono('--run')}: o código do programa gerado. Se ele morre por sinal, é 128 mais o número do sinal; se o executável não pôde ser iniciado, 127; se o {mono('fork')} falhou, o {mono('-1')} vira 255.</>],
        ]}
      />
      <P>
        Um programa FluxLang pode terminar com 1, 2 ou 3, e com {mono('--run')} esses valores se misturam com os do
        compilador. Para distinguir, olhe a saída de erro: as mensagens do compilador começam com {mono('Erro')} ou
        {mono(' Programa rejeitado')}, as de execução com {mono('Erro de execução')}.
      </P>
      <Code lang="bash">
        {`./flux --run abort.flux; echo "[código $?]"`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
Índice 3 fora da lista (tamanho 1).
[código 1]`}
      </Code>

      <H2 title="Saída padrão e saída de erro" />
      <Table
        head={['O que', 'Onde']}
        rows={[
          [<>Tokens, árvore, AST, JSON, programa C, {mono('Executável gerado')}</>, 'Saída padrão'],
          [<>{mono('Programa aceito.')} e {mono('Programa rejeitado.')}</>, <>Saída padrão; mas com {mono('--c')}, {mono('--build')} e {mono('--run')}, só {mono('Programa rejeitado.')} existe e vai para a saída de erro.</>],
          [<>{mono('Erro léxico')}, {mono('Erro sintático')}, {mono('Erro semântico')}</>, <>Saída de erro, exceto em {mono('--json')}, onde ficam no JSON e nada vai para a saída de erro.</>],
          [<>Texto de ajuda</>, <>Saída padrão (também depois de uma opção desconhecida).</>],
          [<>{mono('Opção desconhecida')}, erros de arquivo, {mono('Erro interno')}</>, 'Saída de erro'],
        ]}
      />

      <H2 title="Variáveis de ambiente" />
      <P>
        O {mono('./flux')} lê quatro variáveis; o programa gerado lê outras seis quando roda. Como o {mono('--run')}
        herda o ambiente, as do programa funcionam também ali. Com {mono('--build')}, valem quando o executável é rodado.
        Nenhum outro {mono('getenv')} existe em {mono('src/')}.
      </P>
      <H3 title="Lidas pelo compilador" />
      <Table
        head={['Variável', 'Onde é lida', 'Efeito']}
        rows={[
          [mono('FLUX_CC'), mono('compile_c'), <>Troca o compilador de C. Padrão: {mono('gcc')}; com {mono('--windows')}, {mono('x86_64-w64-mingw32-gcc')}. Se definida, vale também para {mono('--windows')}.</>],
          [mono('FLUX_CC_FLAGS'), mono('compile_c'), <>Flags extras para o compilador de C, separadas por espaço (no máximo cerca de 50). Ignoradas com {mono('--windows')}. O {mono('make asan')} as usa para ligar os sanitizadores.</>],
          [mono('FLUX_CC_WARN'), mono('compile_c'), <>Qualquer valor troca {mono('-w')} (sem avisos) por {mono('-Wall')} ao compilar o C gerado, para depurar o gerador.</>],
          [mono('TMPDIR'), mono('run_codegen'), <>Pasta dos arquivos temporários ({mono('fluxXXXXXX')} e {mono('fluxexeXXXXXX')}). Padrão: {mono('/tmp')}.</>],
        ]}
      />
      <P>
        A linha que o {mono('compile_c')} monta é {mono('gcc -x c -O1 -w [-static] [FLUX_CC_FLAGS] -o exe arquivo.c -lm')}.
        O {mono('-static')} só entra com {mono('--windows')}.
      </P>
      <Code lang="bash">{`FLUX_CC=false ./flux --run mini.flux; echo "[código $?]"`}</Code>
      <Code lang="text">
        {`Erro interno: o gcc não conseguiu compilar o C gerado (guardado em /tmp/fluxO3ZcDT).
[código 3]`}
      </Code>
      <H3 title="Lidas pelo programa gerado" />
      <Table
        head={['Variável', 'Efeito']}
        rows={[
          [mono('FLUX_TAGGED'), <>Qualquer valor, até vazio, liga o modo etiquetado: cada impressão sai na saída padrão como um registro: o separador de registro (byte 30), o tipo, o tamanho em bytes, dois pontos e o texto. É o que a interface web lê.</>],
          [mono('FLUX_GC'), <>Só o valor {mono('0')} desliga o coletor de lixo. Qualquer outro valor deixa ligado.</>],
          [mono('FLUX_GC_STRESS'), <>Qualquer valor, até {mono('0')}, faz o coletor rodar a cada alocação (lento; acha bugs do coletor).</>],
          [mono('FLUX_GC_STATS'), <>Qualquer valor imprime na saída de erro, ao sair, {mono('[gc] N coletas, M blocos liberados, K blocos vivos')}.</>],
          [mono('NO_COLOR'), <>Se não vazia, desliga as cores. Vence {mono('FORCE_COLOR')}.</>],
          [mono('FORCE_COLOR'), <>Se não vazia e diferente de {mono('0')}, liga as cores mesmo sem terminal. Sem nenhuma das duas, cada fluxo é colorido só se for um terminal.</>],
        ]}
      />
      <Code lang="bash">{`FORCE_COLOR=1 ./flux --run cores.flux | cat -v`}</Code>
      <Code lang="text">
        {`^[[94mlog^[[0m
^[[36minfo^[[0m
^[[33maviso^[[0m
^[[31merro^[[0m`}
      </Code>
      <Code lang="bash">{`FLUX_TAGGED=1 ./flux --run cores.flux | cat -v`}</Code>
      <Code lang="text">{`^^L3:log^^I4:info^^W5:aviso^^E4:erro`}</Code>
      <Code lang="bash">{`FLUX_GC_STRESS=1 FLUX_GC_STATS=1 ./flux --run gc.flux`}</Code>
      <Code lang="text">
        {`[gc] 40000 coletas, 39997 blocos liberados, 3 blocos vivos
x19999`}
      </Code>
      <P>
        Os detalhes de cada uma estão em <PageLink to="compilador/runtime">Biblioteca de execução</PageLink> e{' '}
        <PageLink to="compilador/coletor">Coletor de lixo</PageLink>.
      </P>
      <H3 title="Definida pelo compilador" />
      <P>
        Com {mono('--run --windows')}, o compilador define {mono('WINEDEBUG=-all')} antes de chamar o {mono('wine')},
        para suprimir as mensagens de depuração dele; um valor já definido por você é respeitado. A interface web, por
        sua vez, roda os programas com {mono('FLUX_TAGGED=1')}. Os testes usam ainda {mono('LC_ALL=C')} e, no {mono('make asan')},{' '}
        {mono('ASAN_OPTIONS')}; o {mono('./flux')} não os lê.
      </P>

      <H2 title="O driver (main.c)" />
      <P>
        {mono('src/main.c')} é o ponto de entrada. Ele não analisa nada: lê as opções, chama as etapas na ordem de{' '}
        <PageLink to="compilador/visao-geral">Visão geral</PageLink> e decide o resultado e o código de saída. Também
        guarda a função que formata todos os erros. {mono('src/fluxc.h')} declara o que o driver, o lexer, o parser e os
        módulos de apoio compartilham.
      </P>
      <H3 title="Estado do módulo" />
      <Table
        head={['Nome', 'O que é']}
        rows={[
          [mono('static int error_count'), <>Quantos erros {mono('report_error')} já registrou. Zero no início. É o que decide, junto com o retorno de {mono('yyparse')}, se o programa foi aceito.</>],
          [mono('extern FILE *yyin'), <>O arquivo que o lexer lê. {mono('run')} o abre com {mono('fopen')}; se ficar nulo, o Flex usa a entrada padrão.</>],
        ]}
      />
      <Fn name="report_error" signature="void report_error(const char *kind, int line, int column, const char *fmt, ...)">
        O formatador único de todas as mensagens do compilador, chamado pelo lexer (erros léxicos), pelo parser (sintáticos
        e S3) e por {mono('semantic_check')} (semânticos). {mono('kind')} é {mono('"léxico"')}, {mono('"sintático"')} ou{' '}
        {mono('"semântico"')}. Fora do modo JSON, descarrega a saída padrão e escreve na saída de erro a linha{' '}
        {mono('Erro <kind> [linha L, coluna C]:')} seguida da mensagem em {mono('printf')} e de uma quebra de linha. No
        modo JSON, formata a mensagem num buffer de 1024 bytes (o que passa disso é cortado), entrega-a a{' '}
        {mono('json_record_error')} e não escreve nada. Nos dois casos incrementa {mono('error_count')}.
      </Fn>
      <Why>
        No modo {mono('--json')} a saída padrão tem de ser só o objeto JSON, porque a interface o lê inteiro; por isso os
        erros são guardados e impressos no fim dentro dele, e nunca vão para a saída de erro.
      </Why>
      <Fn name="help" signature="static void help(void)">
        Imprime o texto de uso na saída padrão. É chamada por {mono('-h')} e {mono('--help')} (saída com 0) e depois de
        uma opção desconhecida (saída com 2).
      </Fn>
      <Fn name="list_tokens" signature="static int list_tokens(void)">
        Implementa {mono('-t')}. Chama {mono('yylex')} até o fim (token 0) e imprime cada token como{' '}
        {mono('%d:%d\\t%-20s %s')}: linha, coluna, nome ({mono('token_name')}) e o texto. Tokens {mono('YYerror')} são
        pulados, porque o lexer já relatou o erro. Devolve 1 se {mono('error_count')} é positivo, senão 0, e esse é o
        código de saída.
      </Fn>
      <Why>
        Só identificadores e literais mostram o texto: nos demais tokens (palavras reservadas, símbolos) o nome já diz
        tudo, e repetir o lexema só poluiria a coluna. Por isso {mono('FUNC')} aparece sozinho e {mono('IDENTIFIER')} vem
        com {mono('soma')}.
      </Why>
      <Fn name="default_exe_name" signature="static char *default_exe_name(const char *file)">
        O nome do executável de {mono('--build')} sem {mono('-o')}: o do arquivo sem o diretório e sem a última extensão
        (um ponto no início do nome não conta), na pasta atual. Sem arquivo (programa da entrada padrão), {mono('a.out')}.
        Com {mono('--windows')}, acrescenta {mono('.exe')} (ou usa {mono('a.exe')}). Aloca na arena.
      </Fn>
      <Fn
        name="run_codegen"
        signature="static int run_codegen(Program *program, int c_mode, int build_mode, const char *outfile, const char *file)"
      >
        Implementa {mono('--c')}, {mono('--build')} e {mono('--run')}. {mono('program')} é nulo se o programa foi
        rejeitado (os erros já foram impressos): imprime {mono('Programa rejeitado.')} na saída de erro e devolve 1. Com{' '}
        {mono('c_mode')}, chama {mono('generate_c')} sobre a saída padrão e devolve 0. Senão: cria o arquivo C temporário
        ({mono('mkstemp')} em {mono('$TMPDIR/fluxXXXXXX')}); escolhe o executável (em {mono('--build')}, {mono('outfile')} ou
        o nome padrão; em {mono('--run')}, um temporário {mono('fluxexeXXXXXX')}, com sufixo {mono('.exe')} no alvo
        Windows); chama {mono('compile_c')}; apaga o C; em {mono('--build')} imprime o nome e devolve 0; em {mono('--run')},
        executa com {mono('execute_program')}, apaga o executável e devolve o código do programa. Falha do {mono('mkstemp')}
        ou do {mono('gcc')} devolve 3; no caso do {mono('gcc')}, o C é mantido e o caminho dele vai na mensagem. Os
        caminhos ficam em buffers de 512 bytes (nomes maiores são cortados).
      </Fn>
      <Why>
        O executável temporário do {mono('--run')} termina em {mono('.exe')} quando o alvo é Windows, porque o{' '}
        {mono('wine')} só executa arquivos com essa extensão.
      </Why>
      <Fn name="run" signature="static int run(int argc, char **argv)">
        O corpo do driver: percorre as opções, abre o arquivo, e aplica a ordem da tabela de combinações acima. Devolve o
        código de saída. Os trechos principais:
      </Fn>
      <Code lang="c">
        {`  if (token_mode)
    return list_tokens();

  if (json_mode)
    json_enable();
  int parsed = yyparse();

  int codegen = c_mode || build_mode || run_mode;
  if (codegen)
    semantic_mode = 1;

  Program *program = NULL;
  if ((ast_mode || semantic_mode) && parsed == 0 && error_count == 0)
    program = build_ast(parse_root);
  if (semantic_mode && program)
    semantic_check(program);
  int accepted = parsed == 0 && error_count == 0;`}
      </Code>
      <Why>
        Com o modo pânico, {mono('yyparse()')} termina com 0 mesmo depois de erros recuperados. Por isso o programa só é
        aceito se, além disso, nenhum erro foi reportado ({mono('error_count')} igual a zero). A conta de{' '}
        {mono('accepted')} é feita depois da semântica, então um erro semântico também rejeita o programa.
      </Why>
      <Why>
        Gerar código exige o programa conferido pela análise semântica: o gerador assume nomes resolvidos e tipos
        corretos. Por isso {mono('--c')}, {mono('--build')} e {mono('--run')} ligam {mono('--semantic')} sozinhos.
      </Why>
      <Why>
        A AST e a análise semântica só rodam depois de um parse sem erros: elas percorrem a árvore de derivação, que com
        erros de sintaxe pode ter trechos descartados (nós {mono('error')}).
      </Why>
      <Fn name="main" signature="int main(int argc, char **argv)">
        Chama {mono('run')} e, antes de devolver o código, libera tudo: {mono('yylex_destroy')} (os buffers do Flex),
        fecha {mono('yyin')} se não for a entrada padrão e {mono('mem_free_all')} (a arena). Devolve o código de{' '}
        {mono('run')}. A declaração {mono('int yylex_destroy(void)')} está no próprio {mono('main.c')}, porque a função
        vem do {mono('lex.yy.c')} gerado e nenhum cabeçalho a declara.
      </Fn>
      <Why>
        Tudo o que o compilador alocou é liberado antes de sair, inclusive o que o Flex guarda, para que o AddressSanitizer
        possa conferir vazamentos de verdade: com tudo liberado, qualquer relato do LeakSanitizer é um vazamento real. Ver{' '}
        <PageLink to="compilador/arena">Arena de memória</PageLink>.
      </Why>

      <H2 title="Declarações compartilhadas (fluxc.h)" />
      <P>
        {mono('src/fluxc.h')} é o cabeçalho de ligação entre o driver, o lexer, o parser e os módulos de apoio. Não
        define nada: só declara as funções que um arquivo expõe aos outros. Quem implementa cada uma:
      </P>
      <Fn name="yylex" signature="int yylex(void)">
        Definida em {mono('lexer.l')}. Devolve o próximo token (0 no fim do arquivo) e preenche {mono('yylloc')} e{' '}
        {mono('yylval.node')}. Chamada pelo parser e por {mono('list_tokens')}. Ver{' '}
        <PageLink to="compilador/lexico">Léxico</PageLink>.
      </Fn>
      <Fn name="token_name" signature="const char *token_name(int tok)">
        Definida em {mono('parser.y')}. O nome do token como o Bison o conhece, por exemplo {mono('"IDENTIFIER"')}. Usada
        por {mono('list_tokens')} e nas mensagens de erro.
      </Fn>
      <Fn name="semantic_check" signature="int semantic_check(struct Program *program)">
        Definida em {mono('sema.c')}. Roda as três passadas da análise semântica, reporta os erros E1 a E24 em ordem de
        posição por {mono('report_error')} e devolve quantos foram. O valor devolvido não é usado por {mono('run')}, que
        lê {mono('error_count')}. Ver <PageLink to="compilador/semantica">Semântica</PageLink>.
      </Fn>
      <Fn name="generate_c" signature="int generate_c(const struct Program *program, FILE *out)">
        Definida em {mono('codegen_c.c')}. Escreve em {mono('out')} o programa C completo: a biblioteca de execução
        embutida e depois o código das declarações. Devolve 0. Ver{' '}
        <PageLink to="compilador/gerador-c">Gerador de C</PageLink>.
      </Fn>
      <Fn name="compile_c" signature="int compile_c(const char *c_path, const char *exe_path)">
        Definida em {mono('codegen_c.c')}. Roda o compilador de C sobre {mono('c_path')} para gerar {mono('exe_path')}, lendo{' '}
        {mono('FLUX_CC')}, {mono('FLUX_CC_FLAGS')} e {mono('FLUX_CC_WARN')}. Devolve o código de saída do compilador (127
        se ele não existe).
      </Fn>
      <Fn name="execute_program" signature="int execute_program(const char *exe_path)">
        Definida em {mono('codegen_c.c')}. Executa o programa gerado (com o {mono('wine')} no alvo Windows) e devolve o
        código de saída dele.
      </Fn>
      <Fn name="set_windows_target" signature="void set_windows_target(void)">
        Definida em {mono('codegen_c.c')}. Liga o alvo Windows (opção {mono('--windows')}); não há como desligar.
      </Fn>
      <Fn name="is_windows_target" signature="int is_windows_target(void)">
        Definida em {mono('codegen_c.c')}. Diz se o alvo Windows está ligado. Usada por {mono('default_exe_name')} e{' '}
        {mono('run_codegen')}.
      </Fn>
      <Fn name="json_enable" signature="void json_enable(void)">
        Definida em {mono('json.c')}. Liga o modo JSON. Chamada por {mono('run')} antes do parser.
      </Fn>
      <Fn name="json_enabled" signature="int json_enabled(void)">
        Definida em {mono('json.c')}. Diz se o modo JSON está ligado. Usada por {mono('report_error')}.
      </Fn>
      <Fn name="json_record_token" signature="void json_record_token(const char *type, const char *text, int line, int column)">
        Definida em {mono('json.c')}. Guarda um token para o JSON final; não faz nada se o modo JSON está desligado.
        Chamada pela macro {mono('RET')} do lexer.
      </Fn>
      <Fn name="json_record_error" signature="void json_record_error(const char *kind, int line, int column, const char *message)">
        Definida em {mono('json.c')}. Guarda um erro para o JSON final. Chamada por {mono('report_error')}.
      </Fn>
      <Fn name="json_print" signature="void json_print(FILE *out, int accepted, int lines)">
        Definida em {mono('json.c')}. Imprime o objeto JSON completo. Chamada por {mono('run')}. Ver{' '}
        <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink>.
      </Fn>
      <Fn name="source_lines" signature="int source_lines(void)">
        Definida em {mono('lexer.l')}. Quantas linhas tem o código lido; só vale depois de ler tudo. Um arquivo vazio tem
        0 linhas, e um que termina em quebra de linha não conta a linha vazia final.
      </Fn>
      <Fn name="report_error (declaração)" signature="void report_error(const char *kind, int line, int column, const char *fmt, ...)">
        Declarada aqui, definida em {mono('main.c')} (descrita acima).
      </Fn>
      <Callout kind="nota">
        {mono('fluxc.h')} declara {mono('struct Program;')} duas vezes (antes de {mono('semantic_check')} e antes de{' '}
        {mono('generate_c')}); a segunda é redundante e inofensiva.
      </Callout>
    </>
  )
}
