import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Workflows() {
  return (
    <>
      <H2 title="O que é um workflow" />
      <P>
        Um {mono('workflow')} é a unidade de automação da FluxLang. Ele se declara como uma função, mas devolve sempre
        um par {mono('(resultado, erro)')}: o valor que a tarefa produziu e, se algo deu errado, o texto do erro. Um
        workflow pode executar comandos com {mono('run')} e chamar outros workflows com {mono('call')}, coisas que as{' '}
        <PageLink to="linguagem/funcoes">funções comuns</PageLink> não podem fazer.
      </P>
      <Table
        head={['', 'func', 'workflow']}
        rows={[
          ['Devolve', 'Um valor, ou nenhum', 'Sempre o par (resultado, erro)'],
          ['Como é chamado', mono('f(x)'), mono('call w(x)')],
          [<>Usa {mono('call')} e {mono('run')}</>, 'Não', 'Sim'],
          ['Pode ser recursivo', 'Sim', 'Sim, direta ou indiretamente'],
        ]}
      />

      <H2 title="Declarando um workflow" />
      <P>
        A declaração começa com {mono('workflow')}, o nome e os parâmetros entre parênteses. O tipo do resultado, se
        existir, vem depois dos parâmetros, com dois pontos, como numa função. Os workflows ficam no nível global,
        em qualquer ordem em relação às outras declarações.
      </P>
      <Code lang="flux" example>
        {`workflow dobrar(n:int):int {
    return n * 2, null;
}

workflow avisar() {
    terminal.log("fazendo nada de útil");
}

func main () {
    var r, e = call dobrar(21);
    abort if e;
    terminal.log(r);
    var r2, e2 = call avisar();
    abort if e2;
    terminal.log(r2);
}`}
      </Code>
      <Code lang="text">
        {`42
fazendo nada de útil
null`}
      </Code>
      <P>
        Na {mono('main')}, cada chamada devolve duas variáveis, e o erro de cada uma é tratado com {mono('abort if')}.
        Esse tratamento é obrigatório e é o assunto de{' '}
        <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>

      <H2 title="O retorno (resultado, erro)" />
      <P>
        Um workflow termina com {mono('return resultado, erro;')}, sempre com os dois valores. O resultado tem o tipo
        declarado depois dos parâmetros. O erro é uma {mono('string')} com a mensagem, ou {mono('null')}, que
        significa "sem erro".
      </P>
      <Code lang="flux" example>
        {`workflow dividir(a:int, b:int):int {
    if (b == 0) {
        return null, "divisão por zero";
    }
    return a / b, null;
}

func main () {
    var r, e = call dividir(10, 2);
    abort if e;
    terminal.log(r);
}`}
      </Code>
      <Code lang="text">
        {`5`}
      </Code>
      <P>Um {mono('return')} com um único valor, ou sem valores, não serve num workflow:</P>
      <Code lang="flux">
        {`workflow w():int {
    return 1;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
Workflow deve retornar (resultado, erro).`}
      </Code>

      <H3 title="Sem tipo, o resultado é null" />
      <P>
        Se a declaração não tem {mono(':tipo')}, o resultado é sempre {mono('null')}. Devolver outra coisa como
        resultado é erro de tipo.
      </P>
      <Code lang="flux">
        {`workflow w() {
    return 5, null;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 12]:
Tipo incompatível: esperado null, encontrado int.`}
      </Code>

      <H3 title="O fim natural devolve (null, null)" />
      <P>
        Um workflow não precisa terminar com {mono('return')}. Se a execução chega ao fim do corpo, o retorno
        implícito é {mono('(null, null)')}: resultado {mono('null')} e nenhum erro. Por isso um workflow sem tipo que
        só executa tarefas não precisa de {mono('return')}.
      </P>
      <Code lang="flux" example>
        {`workflow preparar() {
    terminal.log("preparando");
}

func main () {
    var r, e = call preparar();
    abort if e;
    terminal.log(r);
    terminal.log(e);
}`}
      </Code>
      <Code lang="text">
        {`preparando
null
null`}
      </Code>

      <H2 title="Chamando um workflow com call" />
      <P>
        Um workflow só é chamado com {mono('call')}, logo depois do {mono('=')} de um {mono('var')} ou de uma
        atribuição, com duas variáveis à esquerda: a primeira recebe o resultado e a segunda recebe o erro. As regras
        de posição estão em <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>
      <Code lang="flux">
        {`workflow w(x:int):int {
    return x, null;
}

func main () {
    var r, e = w(1);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 5]:
2 variáveis e 1 valor.
Erro semântico [linha 6, coluna 16]:
'w' é um workflow e deve ser chamado com 'call'.`}
      </Code>
      <P>
        O inverso também vale: {mono('call')} só aceita workflows. Para uma função comum, escreva o nome direto.
      </P>
      <Code lang="flux">
        {`func f():int {
    return 1;
}

func main () {
    var r, e = call f();
    abort if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 21]:
'f' é uma função e deve ser chamada sem 'call'.`}
      </Code>
      <P>
        Os argumentos são conferidos como nos de uma função: o número e os tipos precisam bater com os parâmetros.
      </P>
      <Code lang="flux">
        {`workflow w(a:int):string {
    return "a", null;
}

func main () {
    var r, e = call w("x");
    abort if e;
    var r2, e2 = call w();
    abort if e2;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 23]:
Tipo incompatível: esperado int, encontrado string.
Erro semântico [linha 8, coluna 23]:
'w' espera 1 argumento, recebeu 0.`}
      </Code>

      <H3 title="O tipo do resultado recebido" />
      <P>
        A variável que recebe o resultado tem o tipo declarado no workflow. Se o workflow não declara tipo, o
        resultado é {mono('null')}, e a variável só aceita {mono('null')}.
      </P>
      <Code lang="flux">
        {`workflow w():string {
    return "a", null;
}

func main () {
    var r, e = call w();
    abort if e;
    var s:string = r;
    var n:int = r;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 9, coluna 17]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <Code lang="flux">
        {`workflow w() {
}

func main () {
    var r, e = call w();
    abort if e;
    r = 5;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 7, coluna 9]:
Tipo incompatível: esperado null, encontrado int.`}
      </Code>

      <H2 title="Criando o próprio erro" />
      <P>
        Quando algo falha numa regra do próprio workflow, ele cria o erro com {mono('return null, "mensagem";')}. Quem
        chamou recebe essa mensagem na segunda variável.
      </P>
      <Code lang="flux" example>
        {`workflow dividir(a:int, b:int):int {
    if (b == 0) {
        return null, "divisão por zero";
    }
    return a / b, null;
}

func main () {
    var r, e = call dividir(10, 0);
    if (e != null) {
        terminal.log("falhou: " + e);
    }
    proceed if e;
    terminal.log(r);
}`}
      </Code>
      <Code lang="text">
        {`falhou: divisão por zero
null`}
      </Code>
      <P>
        Quem chama decide o que fazer com o erro: parar o programa, encerrar o próprio workflow ou seguir adiante. Os
        três comandos para isso, {mono('abort if')}, {mono('stop if')} e {mono('proceed if')}, estão em{' '}
        <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>

      <H2 title="Workflows que chamam workflows" />
      <P>
        Dentro de um workflow, {mono('call')} chama outros workflows. O comando {mono('stop if erro;')} encerra o
        workflow atual devolvendo {mono('(null, erro)')}, então o erro sobe para quem chamou. Assim, uma falha no
        fundo da cadeia chega até a {mono('main')}, que decide encerrar o programa com {mono('abort if')}.
      </P>
      <Code lang="flux" example>
        {`workflow a():int {
    terminal.log("a chama b");
    var s, e = call b();
    stop if e;
    terminal.log("a terminou");
    return s, null;
}

workflow b():int {
    return null, "falha em b";
}

func main () {
    var r, e = call a();
    abort if e;
    terminal.log("não chega aqui");
}`}
      </Code>
      <Code lang="text">
        {`a chama b
Erro de execução [linha 15]:
falha em b`}
      </Code>
      <P>
        O programa termina com código de saída 1. O {mono('terminal.log')} depois do {mono('stop if')} em{' '}
        {mono('a')} também não executa, porque o {mono('stop if')} encerrou o workflow.
      </P>

      <H2 title="Recursão" />
      <P>
        Um workflow pode chamar a si mesmo, ou chamar outro que o chama de volta. Como numa função, é preciso um caso
        base. O erro de cada chamada interna é tratado, aqui com {mono('stop if')} para subir o erro se ele existir.
      </P>
      <Code lang="flux" example>
        {`workflow contar(n:int):int {
    if (n == 0) {
        return 0, null;
    }
    var r, e = call contar(n - 1);
    stop if e;
    return r + 1, null;
}

func main () {
    var r, e = call contar(3);
    abort if e;
    terminal.log(r);
}`}
      </Code>
      <Code lang="text">
        {`3`}
      </Code>

      <H2 title="Workflows e a função main" />
      <P>
        A {mono('main')} é a única função comum que pode usar {mono('call')} e {mono('run')}, além dos próprios
        workflows. É comum que a {mono('main')} só organize a ordem das chamadas, e que o trabalho de verdade fique em
        workflows pequenos. Os erros devolvidos precisam ser tratados também na {mono('main')}.
      </P>
      <Callout kind="nota">
        Um workflow que usa {mono('run')} executa comandos reais no computador. Veja os exemplos em{' '}
        <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink> e o programa completo em{' '}
        <PageLink to="linguagem/exemplo-integrado">Exemplo integrado</PageLink>.
      </Callout>
      <Table
        head={['Situação', 'Código', 'Mensagem']}
        rows={[
          ['Workflow chamado sem call', 'E15', mono("'w' é um workflow e deve ser chamado com 'call'.")],
          ['call numa função comum', 'E15', mono("'f' é uma função e deve ser chamada sem 'call'.")],
          ['return com um valor só', 'E12', mono('Workflow deve retornar (resultado, erro).')],
          ['Resultado de tipo errado', 'E4', mono('Tipo incompatível: esperado null, encontrado int.')],
        ]}
      />
    </>
  )
}
