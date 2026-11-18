import { Callout, Code, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function MapaEBuild() {
  return (
    <>
      <H2 title="Mapa do repositório" />
      <P>
        O código do compilador está em {mono('src/')}, dividido por função. A interface web, os testes, a extensão do
        editor e os documentos ficam em pastas próprias na raiz. Tudo o que o {mono('make')} gera vai para{' '}
        {mono('build/')}, e o executável final é {mono('./flux')}.
      </P>
      <Table
        head={['Caminho', 'Conteúdo']}
        rows={[
          [mono('src/'), <>O driver: {mono('main.c')} (opções, {mono('report_error')}, o fluxo de aceitar ou rejeitar), {mono('json.c')} (saída {mono('--json')}) e {mono('fluxc.h')} (declarações compartilhadas).</>],
          [mono('src/frontend/'), <>{mono('lexer.l')} (Flex), {mono('parser.y')} (Bison), {mono('tree.c')} e {mono('tree.h')}: análise léxica e sintática e a árvore de derivação.</>],
          [mono('src/semantic/'), <>{mono('types.c')}, {mono('ast.c')}, {mono('ast_build.c')}, {mono('sema.c')} e os cabeçalhos: tipos, AST e análise semântica.</>],
          [mono('src/backend/'), <>{mono('codegen_c.c')}: o gerador de C e a chamada ao {mono('gcc')}.</>],
          [mono('src/backend/runtime/'), <>{mono('flux_rt.h')}: a biblioteca de execução (valores, operadores, {mono('run')}, {mono('terminal')}, coletor de lixo), embutida em todo C gerado.</>],
          [mono('src/util/'), <>{mono('mem.c')} e {mono('mem.h')}: a arena de memória do compilador.</>],
          [mono('web/'), <>A interface web (Vite, React, Tailwind): {mono('src/')} com o código da tela e {mono('server/')} com o plugin que roda o {mono('./flux')}.</>],
          [mono('tests/'), <>Os casos de teste, uma pasta por tipo de verificação, e {mono('run.sh')}, que roda todos.</>],
          [mono('tools/vscode-fluxlang/'), 'A extensão do VS Code com o realce de sintaxe da FluxLang (a mesma gramática de cores alimenta os trechos de código destas páginas).'],
          [mono('docs/'), <>{mono('BNF.txt')}, {mono('ERROS.md')}, {mono('TAREFAS.md')}, {mono('ENUNCIADO.md')}, {mono('exemplos/')} ({mono('valido.flux')} e {mono('invalido.flux')}), {mono('specs/')} (desenho da interface) e {mono('entregas/')} (artigo e slides).</>],
          [mono('build/'), <>Gerado: {mono('lex.yy.c')}, {mono('parser.tab.c')}, {mono('parser.tab.h')}, {mono('runtime_src.c')} e os objetos {mono('.o')}. Não vai para o controle de versão.</>],
          [mono('flux'), <>O executável do compilador, gerado na raiz. Também fora do controle de versão.</>],
          [mono('Makefile'), 'As regras de construção, de teste e de análise com sanitizadores.'],
          [mono('README.md'), 'A especificação da linguagem; a seção 9 descreve a implementação.'],
        ]}
      />
      <P>
        Cada pasta de {mono('src/')} tem páginas próprias neste manual:{' '}
        <PageLink to="compilador/lexico">Léxico</PageLink>, <PageLink to="compilador/parser">Parser</PageLink>,{' '}
        <PageLink to="compilador/ast">AST</PageLink>, <PageLink to="compilador/semantica">Semântica</PageLink>,{' '}
        <PageLink to="compilador/gerador-c">Gerador de C</PageLink>, <PageLink to="compilador/runtime">Biblioteca de execução</PageLink> e{' '}
        <PageLink to="compilador/arena">Arena de memória</PageLink>. O caminho completo de um programa está em{' '}
        <PageLink to="compilador/visao-geral">Visão geral</PageLink>.
      </P>

      <H2 title="Dependências" />
      <P>
        Para construir o compilador são necessários quatro programas. As demais ferramentas são opcionais e só ligam
        partes da verificação.
      </P>
      <Table
        head={['Ferramenta', 'Versão', 'Para quê']}
        rows={[
          [mono('gcc'), 'Qualquer recente (o desenvolvimento usa o 16)', <>Compila o compilador e, em tempo de execução, o C que ele gera. O {mono('clang')} também serve para o C gerado (ver {mono('FLUX_CC')}).</>],
          [mono('flex'), 'Qualquer 2.6 (o desenvolvimento usa o 2.6.4)', <>Gera {mono('build/lex.yy.c')} a partir de {mono('lexer.l')}.</>],
          [mono('bison'), '3.6 ou mais (o desenvolvimento usa o 3.8.2)', <>Gera {mono('build/parser.tab.c')} e {mono('parser.tab.h')}. A versão mínima vem de {mono('parse.error custom')} e {mono('yyreport_syntax_error')}, usados nas mensagens de erro sintático.</>],
          [mono('make'), 'GNU make 4.3 ou mais (o desenvolvimento usa o 4.4.1)', <>As regras usam alvos agrupados ({mono('&:')}), que o make 4.3 introduziu.</>],
          [<>{mono('libasan')} e {mono('libubsan')}</>, 'Opcional', <>Necessárias para {mono('make asan')} (no Fedora: {mono('sudo dnf install libasan libubsan')}).</>],
          [<>{mono('mingw64-gcc')} e {mono('wine')}</>, 'Opcional', <>Geram e rodam o {mono('.exe')} de {mono('--windows')}. Sem eles, as passadas de Windows de {mono('make test')} são puladas com um aviso.</>],
          [mono('bear'), 'Opcional', <>Só para {mono('make bear')}, que gera {mono('compile_commands.json')} para o clangd.</>],
          [<>{mono('node')} 20 ou mais e {mono('npm')}</>, 'Opcional', <>Só para a interface web ({mono('make web')}) e para estas páginas.</>],
        ]}
      />
      <Callout kind="nota">
        O {mono('./flux')} roda em Linux e, a princípio, em macOS (nunca testado lá). No Windows, só o programa gerado
        roda; o compilador e a interface exigem o WSL.
      </Callout>

      <H2 title="Comandos do make" />
      <Table
        head={['Comando', 'O que faz']}
        rows={[
          [mono('make'), <>Gera {mono('./flux')}: bison, flex, a conversão de {mono('flux_rt.h')}, a compilação de cada {mono('.c')} e a ligação.</>],
          [mono('make test'), <>Constrói e roda {mono('bash tests/run.sh')} sobre todos os casos. Leva alguns minutos.</>],
          [mono('make clean'), <>Apaga {mono('build/*')} e {mono('flux')}.</>],
          [mono('make asan'), <>Recompila o compilador e roda os testes com AddressSanitizer, UBSan e LeakSanitizer ligados, e no fim restaura o build normal.</>],
          [mono('make web'), <>Constrói o {mono('flux')}, instala as dependências de {mono('web/')} e sobe a interface em {mono('http://127.0.0.1:5173')}.</>],
          [mono('make bear'), <>Recompila tudo com {mono('make -B all')} sob o {mono('bear')}, que grava {mono('compile_commands.json')}.</>],
        ]}
      />
      <P>
        A saída de um {mono('make')} depois de um {mono('make clean')} mostra as etapas na ordem em que acontecem (aqui
        sem a maioria das linhas {mono('gcc -c')}, que se repetem para cada arquivo):
      </P>
      <Code lang="bash">{`make clean && make`}</Code>
      <Code lang="text">
        {`bison -d -o build/parser.tab.c src/frontend/parser.y
gcc -Wall -g -Isrc -Isrc/frontend -Isrc/semantic -Isrc/backend -Isrc/util -Ibuild -c -o build/parser.tab.o build/parser.tab.c
flex -o build/lex.yy.c src/frontend/lexer.l
gcc -Wall -g -Isrc -Isrc/frontend -Isrc/semantic -Isrc/backend -Isrc/util -Ibuild -c -o build/lex.yy.o build/lex.yy.c
gcc -Wall -g -Isrc -Isrc/frontend -Isrc/semantic -Isrc/backend -Isrc/util -Ibuild -c -o build/main.o src/main.c
...
{ echo 'const char flux_runtime_source[] ='; \\
  sed -e 's/\\\\/\\\\\\\\/g' -e 's/"/\\\\"/g' -e 's/^/"/' -e 's/$/\\\\n"/' src/backend/runtime/flux_rt.h; \\
  echo ';'; } > build/runtime_src.c
gcc -Wall -g -Isrc -Isrc/frontend -Isrc/semantic -Isrc/backend -Isrc/util -Ibuild -c -o build/runtime_src.o build/runtime_src.c
gcc -Wall -g -Isrc -Isrc/frontend -Isrc/semantic -Isrc/backend -Isrc/util -Ibuild -c -o build/mem.o src/util/mem.c
gcc -Wall -g -Isrc -Isrc/frontend -Isrc/semantic -Isrc/backend -Isrc/util -Ibuild -o flux build/parser.tab.o build/lex.yy.o build/main.o build/tree.o build/json.o build/types.o build/ast.o build/ast_build.o build/sema.o build/codegen_c.o build/runtime_src.o build/mem.o`}
      </Code>
      <P>
        Os avisos do compilador ({mono('-Wall')}) valem para o código do projeto; o {mono('gcc')} que compila o C
        gerado de cada programa FluxLang roda com os avisos desligados (ver{' '}
        <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>).
      </P>

      <H2 title="A mecânica do Makefile" />
      <H3 title="Pastas, vpath e -I" />
      <P>
        O Makefile declara as cinco pastas de código numa variável, {mono('SRCDIRS')}, e a usa de duas formas. Primeiro,
        cada pasta vira uma opção {mono('-I')} do compilador (mais {mono('-Ibuild')}, para os cabeçalhos gerados), então
        qualquer arquivo escreve {mono('#include "tree.h"')} ou {mono('#include "mem.h"')} sem caminho. Segundo, a diretiva{' '}
        {mono('vpath %.c $(SRCDIRS)')} manda o make procurar cada {mono('.c')} nessas pastas.
      </P>
      <Code lang="text">
        {`CC       = gcc
SRCDIRS  = src src/frontend src/semantic src/backend src/util
INCLUDES = $(addprefix -I,$(SRCDIRS)) -Ibuild
CFLAGS   = -Wall -g $(INCLUDES)

vpath %.c $(SRCDIRS)`}
      </Code>
      <H3 title="Objetos planos em build/" />
      <P>
        A regra de compilação é uma só para todas as pastas: um objeto {mono('build/nome.o')} vem de um {mono('nome.c')}{' '}
        achado pelo {mono('vpath')}. Assim, o objeto de {mono('src/semantic/sema.c')} é {mono('build/sema.o')}, sem
        subpasta.
      </P>
      <Why>
        Os objetos ficam todos direto em {mono('build/')}, sem espelhar as pastas de {mono('src/')}, e o {mono('vpath')}{' '}
        escolhe o {mono('.c')} pelo nome. Por isso, os nomes de arquivo precisam ser únicos em todo o {mono('src/')}:
        dois {mono('util.c')} em pastas diferentes dariam o mesmo {mono('build/util.o')}, e o make usaria só o primeiro
        achado pelo {mono('vpath')}. Ao criar um arquivo novo em qualquer subpasta, confira que o nome não existe em
        outra, e acrescente o objeto à lista {mono('OBJS')}.
      </Why>
      <Code lang="text">
        {`OBJS = build/parser.tab.o build/lex.yy.o build/main.o build/tree.o build/json.o \\
       build/types.o build/ast.o build/ast_build.o build/sema.o \\
       build/codegen_c.o build/runtime_src.o build/mem.o

flux: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

build/%.o: build/%.c build/parser.tab.h $(HEADERS)
	$(CC) $(CFLAGS) -c -o $@ $<

build/%.o: %.c build/parser.tab.h $(HEADERS) | build
	$(CC) $(CFLAGS) -c -o $@ $<`}
      </Code>
      <P>
        Existem duas regras de padrão porque há duas origens de {mono('.c')}: a primeira compila os arquivos gerados que
        já estão em {mono('build/')} ({mono('parser.tab.c')}, {mono('lex.yy.c')}, {mono('runtime_src.c')}); a segunda,
        os escritos à mão, achados pelo {mono('vpath')}. A segunda tem {mono('| build')}, um pré-requisito de ordem
        apenas: garante que a pasta exista sem recompilar tudo quando o carimbo de data dela muda.
      </P>
      <H3 title="Cabeçalhos" />
      <P>
        A variável {mono('HEADERS')} lista os cinco cabeçalhos do projeto ({mono('fluxc.h')}, {mono('tree.h')},{' '}
        {mono('ast.h')}, {mono('types.h')} e {mono('mem.h')}). Todo objeto depende de todos eles, e de{' '}
        {mono('build/parser.tab.h')}: mexer em qualquer cabeçalho recompila tudo. Não há dependência por arquivo; o
        projeto é pequeno o bastante para o custo não importar.
      </P>
      <H3 title="Parser, lexer e a biblioteca de execução" />
      <P>Os três arquivos gerados têm cada um a sua regra:</P>
      <Code lang="text">
        {`build/parser.tab.c build/parser.tab.h &: src/frontend/parser.y src/frontend/tree.h | build
	bison -d -o build/parser.tab.c src/frontend/parser.y

build/lex.yy.c: src/frontend/lexer.l build/parser.tab.h | build
	flex -o build/lex.yy.c src/frontend/lexer.l

build/runtime_src.c: src/backend/runtime/flux_rt.h | build
	{ echo 'const char flux_runtime_source[] ='; \\
	  sed -e 's/\\\\/\\\\\\\\/g' -e 's/"/\\\\"/g' -e 's/^/"/' -e 's/$$/\\\\n"/' $<; \\
	  echo ';'; } > $@`}
      </Code>
      <P>
        O {mono('&:')} da primeira regra é um alvo agrupado: uma só execução do {mono('bison')} produz o {mono('.c')} e
        o {mono('.h')}, e o make sabe disso. Sem o agrupamento, o make trataria os dois como regras independentes e, num
        build paralelo, poderia rodar o bison duas vezes ao mesmo tempo. O lexer depende de {mono('parser.tab.h')} porque o Flex precisa dos números dos tokens que o Bison
        define.
      </P>
      <Why>
        A biblioteca de execução, {mono('src/backend/runtime/flux_rt.h')}, é um cabeçalho C normal no repositório, mas o
        programa C que o compilador gera precisa ser um arquivo único que o {mono('gcc')} compile sozinho. A regra de{' '}
        {mono('build/runtime_src.c')} resolve isso: o {mono('sed')} troca cada {mono('\\')} por {mono('\\\\')}, cada{' '}
        {mono('"')} por {mono('\\"')}, abre aspas no começo de cada linha e fecha com {mono('\\n"')} no fim. O resultado
        é {mono('const char flux_runtime_source[] = "linha 1\\n" "linha 2\\n" ... ;')}, uma string C que{' '}
        {mono('generate_c')} copia com {mono('fputs')} para o início de todo programa. Não há {mono('.o')} da biblioteca
        nem nenhum arquivo para levar junto: o {mono('.c')} gerado compila sozinho em qualquer lugar com um compilador de
        C. A ordem das substituições importa: as barras vêm primeiro, senão as barras acrescentadas às aspas seriam
        dobradas de novo.
      </Why>
      <P>
        O gerador acessa a string pela declaração {mono('extern const char flux_runtime_source[]')} em{' '}
        {mono('codegen_c.c')}. Detalhes em <PageLink to="compilador/gerador-c">Gerador de C</PageLink> e em{' '}
        <PageLink to="compilador/runtime">Biblioteca de execução</PageLink>.
      </P>
      <H3 title="make asan" />
      <P>
        O alvo {mono('asan')} constrói o compilador com sanitizadores e roda a suíte com os programas gerados também
        sanitizados. Ele faz, nesta ordem: {mono('make clean')}; o {mono('flux')} com {mono('CFLAGS')} trocadas para{' '}
        {mono('-Wall -g -fsanitize=address,undefined -fno-omit-frame-pointer')}; a suíte com {mono('FLUX_CC_FLAGS')}{' '}
        passando os mesmos sanitizadores ao {mono('gcc')} que compila o C gerado e com{' '}
        {mono('ASAN_OPTIONS=detect_stack_use_after_return=0')}; e por fim {mono('make clean')} e {mono('make flux')}, tenha
        a suíte passado ou não, devolvendo o status dela.
      </P>
      <Why>
        O {mono('detect_stack_use_after_return')} do AddressSanitizer fica desligado porque, ligado, ele move as
        variáveis locais para uma pilha falsa. O coletor de lixo dos programas gerados varre a pilha do C de forma
        conservadora, procurando ponteiros, e não enxerga essa pilha falsa: ele liberaria blocos ainda em uso. Os outros
        detectores (estouro de limite, uso depois de liberar, comportamento indefinido e vazamento) continuam ligados.
        Ver <PageLink to="compilador/coletor">Coletor de lixo</PageLink>.
      </Why>
      <Why>
        O {mono('make asan')} restaura o build normal no fim, mesmo quando o build sanitizado ou os testes falham. Sem
        isso, uma falha deixaria um {mono('./flux')} sanitizado (lento, com outra {mono('CFLAGS')}) no lugar do normal, e
        o próximo {mono('make')} consideraria os objetos sanitizados atualizados.
      </Why>
      <Callout kind="aviso">
        O build com sanitizadores é um build à parte, e a regra apaga {mono('build/')} no começo e no fim. Se você
        interromper o {mono('make asan')} no meio (Ctrl+C), rode {mono('make clean && make')} antes de continuar.
      </Callout>

      <H2 title="Os testes (tests/run.sh)" />
      <P>
        {mono('tests/run.sh')} é um script de Bash que roda cada caso, compara a saída com um arquivo esperado e
        imprime o resultado. Ele muda para a raiz do repositório sozinho, então roda de qualquer pasta, e pede um{' '}
        {mono('./flux')} já construído (o {mono('make test')} garante isso).
      </P>
      <H3 title="Como um caso é verificado" />
      <P>
        Um caso é um arquivo {mono('X.flux')} numa pasta de {mono('tests/')}. A pasta decide a opção do {mono('./flux')}.
        O script roda {mono('./flux <opção> X.flux')} com a saída padrão e a de erro juntas, anexa uma linha{' '}
        {mono('[código N]')} com o código de saída e compara tudo, byte a byte, com {mono('X.out')}. Se existir{' '}
        {mono('X.in')}, ele vira a entrada padrão do programa; senão a entrada é {mono('/dev/null')}, e{' '}
        {mono('terminal.input')} devolve a string vazia.
      </P>
      <Code lang="bash">{`cat tests/sintatico/abort_sem_if.flux`}</Code>
      <Code lang="flux">
        {`func main () {
abort err;
}`}
      </Code>
      <Code lang="bash">{`cat tests/sintatico/abort_sem_if.out`}</Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 7]:
Token encontrado: identificador 'err'
Esperado: 'if'
Programa rejeitado.
[código 1]`}
      </Code>
      <P>
        Cada caso imprime uma linha: {mono('ok')}, {mono('FALHOU')} (seguida do {mono('diff')}), {mono('SEM .out')} (o
        arquivo esperado não existe), {mono('GERADO')} (com {mono('--generate')}) ou {mono('pulado')} (uma passada que
        precisa de ferramenta que falta). A última linha é o total, e o script sai com código diferente de zero se
        algum caso falhou:
      </P>
      <Code lang="text">{`276 passaram, 0 falharam.`}</Code>
      <H3 title="As passadas" />
      <P>
        O script percorre quinze passadas, na ordem abaixo. A coluna "Casos" é a quantidade de arquivos {mono('.flux')}{' '}
        na pasta.
      </P>
      <Table
        head={['Passada', 'Pasta', 'Roda', 'O que confere', 'Casos']}
        rows={[
          ['lexico', mono('tests/lexico/'), mono('./flux -t'), 'Os tokens e os erros léxicos L1 a L6, com linha e coluna.', '19'],
          ['sintatico', mono('tests/sintatico/'), mono('./flux'), 'As mensagens de erro sintático S1 a S3, o modo pânico e o "aceito" ou "rejeitado".', '50'],
          ['arvore', mono('tests/arvore/'), mono('./flux --tree'), 'A árvore de derivação, mais a linha de aceito ou rejeitado.', '4'],
          ['json', mono('tests/json/'), mono('./flux --json'), 'O objeto JSON de tokens, erros e árvore.', '3'],
          ['ast', mono('tests/ast/'), mono('./flux --ast'), 'A AST.', '2'],
          ['semantico', mono('tests/semantico/'), mono('./flux --semantic'), 'Um caso por regra E1 a E24 e casos de borda.', '36'],
          ['exec', mono('tests/exec/'), mono('./flux --run'), 'Programas que rodam: a saída, os erros de execução R1 a R7 e o código de saída.', '39'],
          ['exec_tagged', mono('tests/exec_tagged/'), mono('FLUX_TAGGED=1 ./flux --run'), <>A saída etiquetada que a interface lê (o separador {mono('\\x1e')} aparece como {mono('<RS>')}).</>, '2'],
          ['exec_color', mono('tests/exec_color/'), mono('FORCE_COLOR=1 ./flux --run'), <>As cores ANSI (o byte {mono('ESC')} aparece como {mono('<ESC>')}).</>, '1'],
          ['exec_nocolor', mono('tests/exec_nocolor/'), mono('FORCE_COLOR=1 NO_COLOR=1 ./flux --run'), <>{mono('NO_COLOR')} vence {mono('FORCE_COLOR')}: nenhuma cor.</>, '1'],
          ['exec_gc', mono('tests/exec/'), mono('FLUX_GC_STRESS=1 ./flux --run'), <>Os mesmos casos de {mono('exec')}, com o coletor rodando a cada alocação, e a saída tem de ser idêntica.</>, '39'],
          ['exec_win', mono('tests/exec/'), mono('./flux --run --windows'), <>Os mesmos casos de {mono('exec')} como {mono('.exe')} no {mono('wine')}, menos dois que chamam comandos POSIX.</>, '37'],
          ['exec_win_gc', mono('tests/exec/'), mono('FLUX_GC_STRESS=1 ./flux --run --windows'), 'O mesmo, com o coletor em estresse.', '37'],
          ['exec_windows', mono('tests/exec_windows/'), mono('./flux --run --windows'), <>Programas que chamam comandos do Windows (via {mono('cmd /c')}).</>, '1'],
          ['cli', mono('tests/cli/'), mono('bash X.sh'), <>Scripts de {mono('bash')} que montam os próprios arquivos temporários e conferem a linha de comando e os limites: o {mono('--build')} que não sobrescreve o fonte, o {mono('--windows')} que ignora {mono('FLUX_CC')}, 5000 operandos encadeados e 8200 variáveis locais. Cada um tem um {mono('.sh')} e um {mono('.out')}.</>, '5'],
        ]}
      />
      <P>
        A soma é 276 casos: 157 das dez primeiras passadas, mais 39 de {mono('exec_gc')}, 37 de {mono('exec_win')}, 37 de{' '}
        {mono('exec_win_gc')}, 1 de {mono('exec_windows')} e 5 de {mono('cli')}. As três passadas que precisam de Windows só rodam se o{' '}
        {mono('x86_64-w64-mingw32-gcc')} e o {mono('wine')} existirem; senão o script imprime{' '}
        {mono('pulado  exec_win (precisa de mingw64-gcc e wine)')} e continua, e o total fica menor.
      </P>
      <H3 title="Detalhes do script" />
      <Why>
        As passadas {mono('exec_win')} e {mono('exec_win_gc')} pulam os casos {mono('workflows_e_run')} e{' '}
        {mono('erro_abort')}, listados em {mono('windows_skip')}: eles chamam comandos do POSIX ({mono('echo')},{' '}
        {mono('sh')}, {mono('false')}, {mono('pwd')}), que não existem num {mono('.exe')} do Windows. Os casos que
        usam comandos do Windows ficam em {mono('exec_windows')}.
      </Why>
      <Why>
        Nas passadas de Windows, o script roda com {mono('LC_ALL=C')} para que as mensagens do sistema saiam em inglês,
        remove o CR ({mono('\\r')}) que o Windows põe nas quebras de linha e filtra as linhas de ruído do Mesa
        ({mono('MESA|pci id')}) que o {mono('wine')} imprime. A primeira execução do {mono('wine')} cria o prefixo dele e
        leva uns sete segundos.
      </Why>
      <Why>
        Testes de estouro de pilha e de laço infinito deixam executáveis órfãos quando o processo-pai morre por tempo
        esgotado. Os executáveis temporários do {mono('--run')} se chamam {mono('fluxexeXXXXXX')} em {mono('/tmp')}: se
        a suíte for interrompida, procure com {mono('pgrep -f /tmp/fluxexe')} e mate o que sobrou.
      </Why>
      <H3 title="Rodar um caso só e criar casos novos" />
      <P>
        O script não tem opção para um caso isolado. Para rodar um, repita o que o script faz e compare à mão:
      </P>
      <Code lang="bash">
        {`diff <(./flux tests/sintatico/abort_sem_if.flux 2>&1 </dev/null; echo "[código $?]") \\
     tests/sintatico/abort_sem_if.out && echo igual`}
      </Code>
      <Code lang="text">{`igual`}</Code>
      <P>
        Um caso de {mono('tests/cli/')} roda sozinho com {mono('bash tests/cli/X.sh')}, da raiz do repositório, e a saída
        é comparada com o {mono('X.out')}.
      </P>
      <P>
        Para criar um caso, escreva o {mono('.flux')} na pasta certa e rode {mono('bash tests/run.sh --generate')}. Essa
        opção cria só os {mono('.out')} que faltam (nunca regrava os existentes) e imprime{' '}
        {mono('GERADO  tests/.../X.out (confira se está certo!)')}.
      </P>
      <Why>
        O {mono('--generate')} grava o que o compilador imprimiu, certo ou errado: um bug do compilador viraria
        "esperado". Por isso cada {mono('.out')} gerado precisa ser lido e conferido à mão antes de entrar no
        repositório. Além disso, o {mono('--generate')} roda a suíte inteira, inclusive as passadas de Windows e de
        estresse do coletor, então demora o mesmo que um {mono('make test')}.
      </Why>
      <Callout kind="nota">
        Para conferir o C gerado com outro compilador, defina {mono('FLUX_CC')}: {mono('FLUX_CC=clang bash tests/run.sh')}.
        As passadas de Windows ignoram {mono('FLUX_CC')} e usam sempre o {mono('mingw')}; só as nativas trocam de
        compilador. O {mono('clang')} já mostrou um erro do coletor que o {mono('gcc')} escondia; ver{' '}
        <PageLink to="compilador/coletor">Coletor de lixo</PageLink>.
      </Callout>
    </>
  )
}
