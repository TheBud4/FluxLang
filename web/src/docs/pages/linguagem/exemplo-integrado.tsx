import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function ExemploIntegrado() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        Esta página junta tudo o que a documentação apresentou em programas completos. O primeiro é o exemplo
        integrado do README, que coordena dois workflows a partir da {mono('main')}. Depois vêm os dois arquivos de
        exemplo usados no artigo do trabalho: {mono('valido.flux')}, que usa todos os recursos principais da
        linguagem, e {mono('invalido.flux')}, que tem sete erros de propósito, um por linha marcada.
      </P>
      <P>
        Os três têm um botão Abrir no editor, para você ver o realce, as mensagens e a árvore do compilador sobre
        código de verdade.
      </P>
      <Callout kind="aviso">
        Estes programas executam {mono('npm')} e {mono('node')} com {mono('run')}. Sem uma pasta {mono('./backend')} no
        diretório onde o compilador roda, os comandos {mono('npm')} nem chegam a iniciar, e o único comando que de
        fato executa é {mono('node --version')}. Mesmo assim, antes de rodar qualquer programa com {mono('run')} no
        editor, leia o que ele executa.
      </Callout>
      <H2 title="O exemplo integrado" />
      <P>
        O programa testa e compila um projeto Node que fica numa pasta. Ele tem uma constante global, dois workflows
        com {mono('run')}, e uma {mono('main')} que chama os workflows com {mono('call')}, tratando cada erro.
      </P>
      <Code lang="flux" example>
        {`const projectDir:string = "./backend";

workflow testProject(project:string):string {
    var output, err = run {
        command: "npm",
        flags: ["test"],
        workingDir: project,
    };

    if (err != null) {
        terminal.error(err);
        stop if err;
    }

    terminal.info("Testes executados");
    return output, null;
}

workflow buildProject(project:string):string {
    var output, err = run {
        command: "npm",
        flags: ["run", "build"],
        workingDir: project,
    };

    stop if err;
    return output, null;
}

func main () {
    var testResult, testErr = call testProject(projectDir);
    abort if testErr;

    var buildResult, buildErr = call buildProject(projectDir);
    abort if buildErr;

    terminal.info("Workflow finalizado com sucesso");
}`}
      </Code>
      <H3 title="A constante e os parâmetros" />
      <P>
        {mono('projectDir')} é uma constante global, visível em todo o arquivo. Ela é passada como argumento para os
        dois workflows, que a recebem no parâmetro {mono('project')}. Assim a pasta do projeto aparece escrita em um
        único lugar. O tipo {mono(':string')} do workflow é o tipo do resultado, o primeiro valor do par que ele
        retorna.
      </P>
      <H3 title="O workflow testProject" />
      <P>
        O {mono('run')} executa {mono('npm test')} na pasta do projeto. Os três campos do objeto são {mono('command')}, {mono('flags')} e {mono('workingDir')},
        e a vírgula depois do último é permitida. O resultado vai para {mono('output')} (a saída padrão do comando) e
        o erro para {mono('err')}.
      </P>
      <P>
        Em seguida, {mono('if (err != null)')} testa se houve erro. Dentro do bloco, {mono('terminal.error(err)')} imprime
        a mensagem na saída de erro, e {mono('stop if err;')} encerra o workflow devolvendo {mono('(null, err)')} a
        quem o chamou. Tratar o erro dentro de um bloco interno vale como tratamento, porque a regra pede apenas que a
        variável apareça num {mono('stop if')}, {mono('abort if')} ou {mono('proceed if')} antes do fim do bloco onde
        ela foi declarada.
      </P>
      <P>
        Se tudo correu bem, o workflow imprime uma informação e termina com {mono('return output, null;')}: o
        resultado é o texto do {mono('npm test')}, e o erro é {mono('null')}.
      </P>
      <H3 title="O workflow buildProject" />
      <P>
        É parecido, mas o tratamento é mais curto: {mono('stop if err;')} direto, sem imprimir antes. Quando {mono('err')} é {mono('null')},
        o {mono('stop if')} não faz nada, e o fluxo segue para o {mono('return output, null;')}.
      </P>
      <H3 title="A função main" />
      <P>
        A {mono('main')} chama cada workflow com {mono('call')} e recebe sempre dois valores: {mono('var testResult, testErr = call testProject(projectDir);')}.
        Como a {mono('main')} não é um workflow, ela não pode usar {mono('stop if')}. Por isso trata o erro com {mono('abort if testErr;')},
        que escreve a mensagem na saída de erro e encerra o programa com código de saída 1. Os resultados {mono('testResult')} e {mono('buildResult')} não
        são usados depois; o que importa neste exemplo é o tratamento do erro de cada etapa. Se as duas etapas passam,
        o programa chega à última linha e imprime a mensagem de sucesso.
      </P>
      <H3 title="O que acontece ao executar" />
      <P>
        Sem a pasta {mono('./backend')}, o {mono('npm')} não consegue ser iniciado. O erro volta ao {mono('testProject')},
        que o imprime com {mono('terminal.error')}, devolve o erro com {mono('stop if')}, e a {mono('main')} o recebe
        e o encerra com {mono('abort if')}:
      </P>
      <Code lang="text">
        {`comando 'npm' não pôde ser iniciado: ./backend: No such file or directory
Erro de execução [linha 32]:
comando 'npm' não pôde ser iniciado: ./backend: No such file or directory`}
      </Code>
      <P>
        Com um projeto Node de verdade em {mono('./backend')}, o fluxo seria o previsto: os testes rodam, depois o
        build, e o programa termina com {mono('Workflow finalizado com sucesso')}. Se os testes falharem, o erro do {mono('npm')} passa
        pelas mesmas duas etapas, chega à {mono('main')} e encerra o programa.
      </P>
      <Table
        head={['Recurso', 'Onde aparece', 'Página']}
        rows={[
          [
            'Constante global',
            mono('const projectDir'),
            <><PageLink to="linguagem/tipos">Tipos, variáveis e constantes</PageLink></>,
          ],
          [
            'Workflow com resultado e erro',
            <>{mono('testProject')}, {mono('buildProject')}</>,
            <><PageLink to="linguagem/workflows">Workflows</PageLink></>,
          ],
          [
            <>{mono('run')} com os três campos</>,
            mono('run { command, flags, workingDir }'),
            <><PageLink to="linguagem/call-run-erros">call, run e erros</PageLink></>,
          ],
          [
            <>Tratamento com {mono('stop if')} e {mono('abort if')}</>,
            <>dentro dos workflows e na {mono('main')}</>,
            <><PageLink to="linguagem/call-run-erros">call, run e erros</PageLink></>,
          ],
          [
            <>{mono('call')} com dois valores</>,
            mono('var testResult, testErr = call ...'),
            <><PageLink to="linguagem/workflows">Workflows</PageLink></>,
          ],
          [
            <>{mono('terminal.error')} e {mono('terminal.info')}</>,
            'mensagens do programa',
            <><PageLink to="linguagem/biblioteca">Biblioteca</PageLink></>,
          ],
        ]}
      />
      <H2 title="O arquivo valido.flux" />
      <P>
        Este é o programa completo {mono('docs/exemplos/valido.flux')}, mostrado como está no repositório, sem os
        espaços no fim das linhas e com os comentários originais, inclusive os dois do início. Ele roda as etapas de
        um projeto Node, tenta de novo quando uma etapa falha e mostra um resumo no terminal.
      </P>
      <Code lang="flux" example>
        {`// Exemplo válido da FluxLang: roda as etapas de um projeto Node, tenta
// de novo quando uma etapa falha e mostra um resumo no terminal.

const projeto:string = "./backend";
const tentativasMax = 3;

func fatorial(n:int):int {
    if (n <= 1) {
        return 1;
    } else {
        return n * fatorial(n - 1);
    }
}

func taxa(passaram:int, total:int):float {
    return toFloat(passaram) / total;
}

func mostrarResumo(nomes:list<string>) {
    terminal.info("Etapas: " + toString(nomes.length()));
    for nome in nomes {
        terminal.log("- " + nome);
    }
}

// Executa uma etapa e devolve (saída, erro).
workflow executar(etapa:string, dir:string):string {
    var saida, err = run {
        command: "npm",
        flags: ["run", etapa],
        workingDir: dir,
    };
    stop if err;
    return saida, null;
}

// Chama outro workflow e cria um erro próprio.
workflow pipeline(dir:string, etapas:list<string>):int {
    var concluidas:int = 0;
    for etapa in etapas {
        var saida, err = call executar(etapa, dir);
        stop if err;
        terminal.log(saida);
        concluidas = concluidas + 1;
    }
    if (concluidas == 0) {
        return null, "nenhuma etapa executada";
    }
    return concluidas, null;
}

func main () {
    var tentativa:int = 0;
    var concluidas:int;
    var nome, responsavel:string = "api", "Ana";
    var meta, atual:float;
    var sucesso:bool = false;

    meta = 0.75;
    atual = 0;
    concluidas = 0;

    var config:object = {
        nome: nome,
        "max-tentativas": tentativasMax,
    };
    config.responsavel = responsavel;
    var limite:int = config["max-tentativas"];

    var etapas:list<string> = ["lint", "test", "docs"];
    etapas.push("build");
    etapas.push("deploy");
    etapas.remove(2);
    mostrarResumo(etapas);

    var versao, erroVersao = run { command: "node", flags: ["--version"] };
    abort if erroVersao;
    terminal.info("Node " + versao);

    while (!sucesso && tentativa < limite) {
        tentativa = tentativa + 1;
        var total, err = call pipeline(projeto, etapas);
        proceed if err;
        if (err == null) {
            concluidas = total;
            sucesso = true;
        } else {
            terminal.warn("Tentativa " + toString(tentativa) + ": " + err);
        }
    }

    if (sucesso) {
        atual = taxa(concluidas, etapas.length());
        if (atual >= meta) {
            terminal.info("Pipeline de " + nome + " aprovado");
        } else {
            terminal.warn("Pipeline abaixo da meta");
        }
    } else {
        terminal.error("Falhou após " + toString(tentativa) + " tentativas");
    }

    for etapa in etapas {
        if (etapa == "lint") {
            continue;
        }
        if (etapa == "deploy") {
            break;
        }
        terminal.log("Etapa " + etapa + " conferida");
    }

    terminal.log("Ordens possíveis: " + toString(fatorial(etapas.length())));
    terminal.info("Fim do \\"pipeline\\"");
}`}
      </Code>
      <P>
        O arquivo reúne o que o README pede de um exemplo válido: os dois laços, o condicional, declarações únicas e
        em lista com e sem atribuição, os tipos {mono('int')}, {mono('float')}, {mono('string')}, {mono('bool')}, {mono('list')} e {mono('object')},
        workflows, {mono('run')}, {mono('call')} e os três comandos de tratamento de erro.
      </P>
      <Table
        head={['Recurso', 'Onde aparece no arquivo']}
        rows={[
          [<>Laço {mono('for')}</>, <>{mono('mostrarResumo')}, {mono('pipeline')} e o último laço da {mono('main')}</>],
          [<>Laço {mono('while')}</>, <>{mono('while (!sucesso && tentativa < limite)')} na {mono('main')}</>],
          [<>{mono('if')} e {mono('else')}</>, <>em {mono('fatorial')}, {mono('pipeline')} e na {mono('main')}</>],
          [<>{mono('break')} e {mono('continue')}</>, <>o último laço da {mono('main')}</>],
          ['Declaração única, com e sem valor', <>{mono('var tentativa:int = 0;')} e {mono('var concluidas:int;')}</>],
          [
            'Declaração em lista, com e sem valor',
            <>{mono('var nome, responsavel:string = "api", "Ana";')} e {mono('var meta, atual:float;')}</>,
          ],
          ['Inferência de tipo', mono('const tentativasMax = 3;')],
          [
            <>{mono('list')} com métodos</>,
            <>{mono('etapas.push')}, {mono('etapas.remove(2)')} e {mono('nomes.length()')}</>,
          ],
          [
            <>{mono('object')} com chave entre aspas</>,
            <>{mono('"max-tentativas": tentativasMax')}, lido com {mono('config["max-tentativas"]')}</>,
          ],
          ['Recursão', mono('fatorial')],
          ['Conversões', <>{mono('toFloat')} em {mono('taxa')}, {mono('toString')} nas mensagens</>],
          [
            <>{mono('run')}, {mono('call')} e erros</>,
            <>o workflow {mono('executar')} e {mono('pipeline')}, com {mono('stop if')}; na {mono('main')}, {mono('abort if')} e {mono('proceed if')}</>,
          ],
          ['Erro criado pelo programa', <>{mono('return null, "nenhuma etapa executada";')} em {mono('pipeline')}</>],
        ]}
      />
      <H3 title="O que o arquivo imprime" />
      <P>
        Sem uma pasta {mono('./backend')}, cada tentativa do pipeline falha na primeira etapa, e o programa mostra
        isto (a linha com o Node depende da versão instalada na sua máquina):
      </P>
      <Code lang="text">
        {`Etapas: 4
- lint
- test
- build
- deploy
Node v24.19.0

Tentativa 1: comando 'npm' não pôde ser iniciado: ./backend: No such file or directory
Tentativa 2: comando 'npm' não pôde ser iniciado: ./backend: No such file or directory
Tentativa 3: comando 'npm' não pôde ser iniciado: ./backend: No such file or directory
Falhou após 3 tentativas
Etapa test conferida
Etapa build conferida
Ordens possíveis: 24
Fim do "pipeline"`}
      </Code>
      <Callout kind="nota">
        Esta saída foi obtida executando o arquivo num diretório sem {mono('./backend')}. Os avisos das tentativas vão
        para a saída de erro, e o resto para a saída padrão. O compilador atual escreve a mensagem de um comando que
        não pôde ser iniciado como {mono("comando 'npm' não pôde ser iniciado: <motivo>")}, com o motivo vindo do
        sistema operacional; esse texto pode mudar. A versão do Node mostrada também varia de máquina para máquina.
      </Callout>
      <H2 title="O arquivo invalido.flux" />
      <P>
        Este é o {mono('docs/exemplos/invalido.flux')}, também exatamente como está no repositório. Ele tem sete erros
        léxicos e sintáticos, cada um numa linha marcada com um comentário {mono('// erro N')}. É um arquivo rejeitado
        de propósito: abra-o no editor para ver os sete erros realçados.
      </P>
      <Code lang="flux" example>
        {`// Exemplo inválido da FluxLang: sete erros, um em cada linha marcada.

const versao:string;                    // erro 1

func soma(a:int, b:int):int {
    return a + b;
}

workflow build(dir:string):string {
    var saida, err = run {
        command: "npm",
        flags: ["run", "build"],
        workingDir: dir,
    }                                   // erro 2 (falta ';')
    stop if err;
    return saida, null;
}

func main () {
    var total:int = 10 @ 2;             // erro 3
    var 2itens:int = 3;                 // erro 4
    var ativo:bool = true;

    if (ativo) {
        terminal.info("Ativo");
    } else if (total > 5) {             // erro 5
        terminal.warn("Inativo");
    }

    call build("./backend");            // erro 6
    soma(1, 2) = 3;                     // erro 7
}`}
      </Code>
      <P>
        Esta é a saída do compilador para ele:
      </P>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 20]:
Token encontrado: ';'
Esperado: '='
Erro sintático [linha 15, coluna 5]:
Token encontrado: palavra reservada 'stop'
Esperado: ';'
Erro léxico [linha 20, coluna 24]:
Caractere não reconhecido: '@'
Erro léxico [linha 21, coluna 9]:
Número malformado: '2itens'
Erro sintático [linha 26, coluna 12]:
Token encontrado: palavra reservada 'if'
Esperado: '{'
Erro sintático [linha 30, coluna 5]:
Token encontrado: palavra reservada 'call'
Esperado: comando ou '}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)
Erro sintático [linha 31, coluna 16]:
Token encontrado: '='
Esperado: ';' (o lado esquerdo não é variável, campo ou índice)`}
      </Code>
      <P>
        Os sete erros são reportados numa única execução, graças à recuperação de erros descrita no <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.
        A primeira versão do compilador, do Trabalho 1, reportava só o erro 1, porque parava no primeiro erro
        encontrado.
      </P>
      <Table
        head={['#', 'Linha:coluna', 'Código', 'Mensagem', 'Causa']}
        rows={[
          [
            '1',
            '3:20',
            'S1',
            <>{mono("Token encontrado: ';'")} e {mono("Esperado: '='")}</>,
            <>Uma {mono('const')} exige valor inicial.</>,
          ],
          [
            '2',
            '15:5',
            'S1',
            <>{mono("Token encontrado: palavra reservada 'stop'")} e {mono("Esperado: ';'")}</>,
            <>Falta o {mono(';')} depois do {mono('}')} do {mono('run')}, na linha 14: a instrução que contém um {mono('run')} termina com {mono(';')}.</>,
          ],
          [
            '3',
            '20:24',
            'L1',
            mono("Caractere não reconhecido: '@'"),
            <>O {mono('@')} não pertence ao alfabeto da linguagem.</>,
          ],
          ['4', '21:9', 'L5', mono("Número malformado: '2itens'"), 'Um identificador não pode começar com dígito.'],
          [
            '5',
            '26:12',
            'S1',
            <>{mono("Token encontrado: palavra reservada 'if'")} e {mono("Esperado: '{'")}</>,
            <>Não existe {mono('else if')}: o {mono('if')} deve ficar dentro do bloco do {mono('else')}.</>,
          ],
          [
            '6',
            '30:5',
            'S1',
            <>{mono("Token encontrado: palavra reservada 'call'")} e {mono("Esperado: comando ou '}'")}, seguido da explicação entre parênteses</>,
            <>Um {mono('call')} não pode ser um comando isolado: o resultado e o erro precisam de duas variáveis, como em {mono('var r, e = call build(...);')}.</>,
          ],
          [
            '7',
            '31:16',
            'S3',
            <>{mono("Token encontrado: '='")} e {mono("Esperado: ';'")}, seguido da explicação entre parênteses</>,
            'Uma chamada de função não pode receber uma atribuição.',
          ],
        ]}
      />
      <P>
        As posições foram conferidas isolando um erro por vez, com os outros seis corrigidos. Para corrigir o arquivo:
        dar um valor à {mono('const')} (erro 1), fechar o {mono('run')} com {mono('};')} (2), tirar o {mono('@')} (3),
        renomear {mono('2itens')} (4), trocar o {mono('else if')} por um {mono('else')} com um {mono('if')} dentro
        (5), receber o {mono('call')} em duas variáveis e tratá-las (6) e atribuir a uma variável em vez de a uma
        chamada (7).
      </P>
      <Callout kind="nota">
        A recuperação do compilador atual é simples e pode gerar erros extras em outros programas; neste arquivo ela
        dá exatamente os sete erros, sem cascata. Os detalhes estão no <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.
      </Callout>
    </>
  )
}
