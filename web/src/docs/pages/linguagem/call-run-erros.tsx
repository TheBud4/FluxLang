import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function CallRunErros() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        {mono('call')} chama um workflow e {mono('run')} executa um comando do sistema. Os dois devolvem um par{' '}
        {mono('(resultado, erro)')}, e o erro é uma {mono('string')}, ou {mono('null')} quando deu certo. A linguagem
        obriga o programa a decidir o que fazer com cada erro: parar o workflow ({mono('stop if')}), parar o programa (
        {mono('abort if')}) ou seguir adiante ({mono('proceed if')}).
      </P>
      <Callout kind="aviso">
        {mono('run')} executa comandos reais no seu computador, com as suas permissões. Os exemplos executáveis desta
        página usam só {mono('echo')} e {mono('sh')} com comandos inofensivos. Antes de rodar um programa de outra pessoa no
        editor, leia o que os {mono('run')} dele fazem.
      </Callout>

      <H2 title="Onde call e run podem aparecer" />
      <P>
        {mono('call')} e {mono('run')} não são expressões. Eles não aparecem dentro de outras expressões, nem como
        argumento, nem sozinhos como comando. A gramática só os aceita logo depois do {mono('=')} de um {mono('var')}{' '}
        ou de uma atribuição, com duas variáveis à esquerda, uma para o resultado e outra para o erro.
      </P>
      <Table
        head={['Forma', 'Exemplo']}
        rows={[
          [mono('var'), mono('var r, e = call build("backend");')],
          ['Atribuição', mono('r, e = call build("backend");')],
          [<>{mono('var')} com {mono('run')}</>, mono('var saida, erro = run { command: "echo" };')],
          [<>Atribuição com {mono('run')}</>, mono('saida, erro = run { command: "echo" };')],
        ]}
      />
      <P>
        Como qualquer comando simples, a instrução que contém {mono('call')} ou {mono('run')} termina com{' '}
        {mono(';')}, inclusive depois da chave final de um {mono('run')}.
      </P>
      <Code lang="flux" example>
        {`workflow saudar(nome:string):string {
    return "Olá, " + nome, null;
}

func main () {
    var texto, erro = call saudar("Ana");
    abort if erro;
    terminal.log(texto);
    texto, erro = call saudar("Bruno");
    abort if erro;
    terminal.log(texto);
}`}
      </Code>
      <Code lang="text">
        {`Olá, Ana
Olá, Bruno`}
      </Code>

      <H3 title="Usos que não existem" />
      <P>
        Chamar sem receber o par, usar o {mono('call')} dentro de outra expressão ou ficar com uma variável só são
        erros, e as mensagens dizem qual regra foi quebrada:
      </P>
      <Code lang="flux">
        {`workflow w() {
}

func main () {
    call w();
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 5, coluna 5]:
Token encontrado: palavra reservada 'call'
Esperado: comando ou '}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)`}
      </Code>
      <Code lang="flux">
        {`workflow w() {
}

func main () {
    terminal.log(call w());
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 5, coluna 18]:
Token encontrado: palavra reservada 'call'
Esperado: ')' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)`}
      </Code>
      <Code lang="flux">
        {`workflow w() {
}

func main () {
    var r = call w();
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 5, coluna 5]:
1 variável e 2 valores.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { command: "echo" }
    abort if erro;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 5]:
Token encontrado: palavra reservada 'abort'
Esperado: ';'`}
      </Code>

      <H2 title="O comando run" />
      <P>
        {mono('run')} usa a sintaxe de um objeto: {mono('run { campo: valor, ... }')}. Os campos descrevem o comando
        que será executado.
      </P>
      <Table
        head={['Campo', 'Tipo', 'Obrigatório', 'O que é']}
        rows={[
          [mono('command'), mono('string'), 'Sim', 'O programa a executar.'],
          [mono('flags'), mono('list<string>'), 'Não', 'Os argumentos do programa, um por elemento da lista.'],
          [mono('workingDir'), mono('string'), 'Não', 'A pasta onde o comando executa.'],
        ]}
      />
      <P>
        Os campos podem aparecer em qualquer ordem, sem repetição, e a vírgula depois do último é opcional.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var saida, erro = run {
        workingDir: "/tmp",
        command: "echo",
        flags: ["um", "dois"],
    };
    abort if erro;
    terminal.log("[" + saida + "]");
}`}
      </Code>
      <Code lang="text">
        {`[um dois
]`}
      </Code>
      <P>
        O texto devolvido é a saída padrão inteira do comando, inclusive a quebra de linha do final, por isso o{' '}
        {mono(']')} aparece na linha seguinte. O {mono('command')} é o nome do programa, e cada argumento vai em um
        elemento de {mono('flags')}.
      </P>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { flags: ["a"] };
    abort if erro;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 27]:
'run' sem o campo obrigatório 'command'.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { command: "ls", command: "pwd", extra: 1 };
    abort if erro;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 53]:
'run' tem o campo 'command' repetido.
Erro semântico [linha 2, coluna 67]:
'run' não aceita o campo 'extra'.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { command: "ls", flags: "a" };
    abort if erro;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 51]:
O campo 'flags' de 'run' deve ser list<string>, encontrado string.`}
      </Code>

      <H3 title="O que run devolve" />
      <P>
        O par devolvido depende de como o comando terminou:
      </P>
      <Table
        head={['Como o comando terminou', 'Resultado', 'Erro']}
        rows={[
          ['Com código de saída 0', 'A saída padrão', mono('null')],
          ['Com outro código de saída', mono('null'), 'A saída de erro do comando'],
          ['Com outro código e saída de erro vazia', mono('null'), mono("comando 'npm' terminou com código 1")],
          ['Não pôde ser iniciado', mono('null'), 'Uma mensagem de erro (veja a nota abaixo)'],
        ]}
      />
      <Callout kind="nota">
        Quando o comando não pode ser iniciado, o compilador atual monta o erro como{' '}
        {mono("comando 'x' não pôde ser iniciado: <motivo>")}, e o motivo vem do sistema operacional, no idioma dele.
        Esse texto é uma escolha de implementação e pode mudar.
      </Callout>
      <Code lang="flux" example>
        {`func main () {
    var saida, erro = run { command: "sh", flags: ["-c", "exit 3"] };
    proceed if erro;
    terminal.log(saida);
    terminal.log(erro);
    var s2, e2 = run { command: "sh", flags: ["-c", "echo falhou >&2; exit 2"] };
    proceed if e2;
    terminal.log(e2);
}`}
      </Code>
      <Code lang="text">
        {`null
comando 'sh' terminou com código 3
falhou`}
      </Code>

      <H2 title="O erro é texto" />
      <P>
        O erro é sempre uma {mono('string')}, ou {mono('null')}, que significa "sem erro". Por isso um programa pode
        comparar o erro com {mono('null')}, imprimi-lo ou juntá-lo a outro texto antes de decidir o que fazer.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var saida, erro = run { command: "sh", flags: ["-c", "exit 1"] };
    if (erro != null) {
        terminal.log("O comando falhou: " + erro);
    }
    proceed if erro;
}`}
      </Code>
      <Code lang="text">
        {`O comando falhou: comando 'sh' terminou com código 1`}
      </Code>

      <H2 title="Tratando o erro" />
      <P>
        Todo erro vindo de {mono('run')} ou de {mono('call')} deve ser tratado com um destes comandos. Se o erro for{' '}
        {mono('null')}, nenhum deles faz nada.
      </P>
      <Table
        head={['Comando', 'O que faz', 'Onde vale']}
        rows={[
          [mono('stop if erro;'), <>Encerra o workflow atual devolvendo {mono('(null, erro)')}.</>, 'Só dentro de workflow'],
          [
            mono('abort if erro;'),
            'Escreve a mensagem na saída de erro e encerra o programa com código de saída 1.',
            'Em qualquer lugar',
          ],
          [mono('proceed if erro;'), 'Marca o erro como tratado e segue para a próxima instrução.', 'Em qualquer lugar'],
        ]}
      />

      <H3 title="abort if" />
      <P>
        {mono('abort if')} é a saída para erros que o programa não sabe corrigir. A mensagem do erro sai no formato dos
        erros de execução, e o programa termina com código de saída 1.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var saida, erro = run { command: "sh", flags: ["-c", "exit 3"] };
    terminal.log("depois do run");
    abort if erro;
    terminal.log("não chega aqui");
}`}
      </Code>
      <Code lang="text">
        {`depois do run
Erro de execução [linha 4]:
comando 'sh' terminou com código 3`}
      </Code>

      <H3 title="stop if" />
      <P>
        {mono('stop if')} só vale dentro de um workflow. Ele encerra o workflow no ponto em que está e devolve{' '}
        {mono('(null, erro)')} para quem o chamou, que passa a ter um erro para tratar.
      </P>
      <Code lang="flux" example>
        {`workflow tentar() {
    var s, e = run { command: "sh", flags: ["-c", "exit 4"] };
    terminal.log("rodou");
    stop if e;
    terminal.log("não chega aqui");
}

func main () {
    var r, e = call tentar();
    proceed if e;
    terminal.log(e);
    terminal.log(r);
}`}
      </Code>
      <Code lang="text">
        {`rodou
comando 'sh' terminou com código 4
null`}
      </Code>
      <P>Fora de um workflow, {mono('stop if')} é erro:</P>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { command: "echo" };
    if (erro != null) {
        stop if erro;
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 9]:
'stop if' só pode ser usado dentro de workflow.`}
      </Code>

      <H3 title="proceed if" />
      <P>
        {mono('proceed if')} declara que o erro foi visto e que o programa segue. É útil quando a falha não impede o
        resto, ou quando o programa já agiu sobre ela, por exemplo imprimindo a mensagem.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var saida, erro = run { command: "sh", flags: ["-c", "exit 1"] };
    if (erro != null) {
        terminal.log("sem problema, seguindo");
    }
    proceed if erro;
    terminal.log("o programa continua");
}`}
      </Code>
      <Code lang="text">
        {`sem problema, seguindo
o programa continua`}
      </Code>

      <H3 title="O operando precisa ser uma variável de erro" />
      <P>
        O que vem depois de {mono('if')} precisa ser uma variável de erro: a segunda variável que recebeu um{' '}
        {mono('call')} ou um {mono('run')}. Um resultado, um campo ou outra expressão não servem.
      </P>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { command: "echo", flags: ["ok"] };
    abort if erro;
    abort if saida;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 14]:
'saida' não é uma variável de erro.`}
      </Code>
      <Code lang="flux">
        {`workflow w():int {
    return 1, null;
}

func main () {
    var r, e = call w();
    stop if r.err;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 7, coluna 14]:
Token encontrado: '.'
Esperado: ';'`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { command: "echo" };
    abort erro;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 11]:
Token encontrado: identificador 'erro'
Esperado: 'if'`}
      </Code>

      <H2 title="Todo erro precisa ser tratado" />
      <P>
        O compilador confere que o erro de cada {mono('call')} e de cada {mono('run')} é tratado. O erro conta como
        tratado se a variável aparece num destes comandos antes do fim do bloco onde foi declarada, mesmo dentro de um
        bloco interno. Deixar um erro sem tratamento é erro de compilação.
      </P>
      <Code lang="flux">
        {`func main () {
    var saida, erro = run { command: "echo" };
    terminal.log(saida);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 16]:
O erro 'erro' não foi tratado.`}
      </Code>
      <P>
        Tratar o erro dentro de um {mono('if')} vale, porque o {mono('if')} está dentro do bloco onde a variável foi
        declarada:
      </P>
      <Code lang="flux" example>
        {`func main () {
    var saida, erro = run { command: "echo", flags: ["ok"] };
    if (erro != null) {
        terminal.error(erro);
        abort if erro;
    }
    terminal.log(saida);
}`}
      </Code>
      <Code lang="text">
        {`ok`}
      </Code>
      <P>
        Mas um erro declarado dentro de um bloco precisa ser tratado nesse mesmo bloco:
      </P>
      <Code lang="flux">
        {`func main () {
    for i in [1, 2] {
        var saida, erro = run { command: "echo" };
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 20]:
O erro 'erro' não foi tratado.`}
      </Code>
      <P>
        Cada {mono('call')} ou {mono('run')} gera um erro novo, também quando o resultado vai para variáveis que já
        existem. Uma variável de erro reaproveitada precisa de um novo tratamento depois de cada atribuição:
      </P>
      <Code lang="flux" example>
        {`func main () {
    var a, e = run { command: "echo", flags: ["primeiro"] };
    abort if e;
    a, e = run { command: "echo", flags: ["segundo"] };
    abort if e;
    terminal.log(a);
}`}
      </Code>
      <Code lang="text">
        {`segundo`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var a, e = run { command: "echo", flags: ["primeiro"] };
    abort if e;
    a, e = run { command: "echo", flags: ["segundo"] };
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 8]:
O erro 'e' não foi tratado.`}
      </Code>

      <H2 title="Criando o próprio erro" />
      <P>
        Um workflow cria um erro seu com {mono('return null, "mensagem";')}. Para quem chamou, esse erro é igual ao de
        um {mono('run')} que falhou: uma {mono('string')} que precisa ser tratada. O exemplo está em{' '}
        <PageLink to="linguagem/workflows">Workflows</PageLink>.
      </P>

      <H2 title="Erros de execução" />
      <P>
        Só {mono('run')} e {mono('call')} devolvem erros tratáveis. Todos os outros erros que acontecem enquanto o
        programa roda são fatais: encerram o programa como o {mono('abort')}, com a mensagem na saída de erro e código
        de saída 1, e não há como tratá-los. Eles recebem os códigos R1 a R7.
      </P>
      <Table
        head={['Código', 'Causa', 'Mensagem']}
        rows={[
          ['R1', <>Conversão impossível, como {mono('toInt("abc")')}</>, mono('Não é possível converter "abc" para int.')],
          ['R2', 'Índice fora da lista', mono('Índice 5 fora da lista (tamanho 2).')],
          ['R3', <>Uso inválido de {mono('null')}</>, mono('Uso de valor null.')],
          ['R4', 'Divisão inteira ou resto por zero', mono('Divisão por zero.')],
          ['R5', 'Valor de campo com tipo diferente do esperado', mono('Esperado int, encontrado string.')],
          [
            'R6',
            <>Estouro do {mono('int')} de 32 bits, como {mono('2147483647 + 1')}</>,
            mono('Estouro de inteiro.'),
          ],
          ['R7', 'Recursão sem fim ou funda demais', mono('Estouro de pilha: recursão profunda demais.')],
        ]}
      />
      <Code lang="flux" example>
        {`func main () {
    var nomes = ["Ana", "Bruno"];
    terminal.log(nomes[0]);
    terminal.log(nomes[5]);
    terminal.log("não chega aqui");
}`}
      </Code>
      <Code lang="text">
        {`Ana
Erro de execução [linha 4]:
Índice 5 fora da lista (tamanho 2).`}
      </Code>
      <P>
        Cada um deles, com exemplo e mensagem, está no <PageLink to="linguagem/erros">Catálogo de erros</PageLink>. Os
        erros de compilação que cercam {mono('call')}, {mono('run')} e os comandos de tratamento são os códigos E9, E11,
        E14, E15, E17 e E18, e as regras estão em{' '}
        <PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink>.
      </P>
    </>
  )
}
