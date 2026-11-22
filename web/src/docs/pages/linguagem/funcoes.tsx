import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Funcoes() {
  return (
    <>
      <H2 title="O que é uma função" />
      <P>
        Uma {mono('func')} agrupa um trecho de código com um nome, para ser usado várias vezes. Funções servem para
        cálculo e lógica: elas recebem parâmetros, devolvem no máximo um valor e podem ser chamadas pelo nome. As
        tarefas de automação, que executam comandos e podem falhar, ficam nos{' '}
        <PageLink to="linguagem/workflows">workflows</PageLink>, e por isso uma função não pode usar {mono('call')} nem{' '}
        {mono('run')}.
      </P>

      <H2 title="Declarando uma função" />
      <P>
        A declaração começa com {mono('func')}, o nome, os parâmetros entre parênteses e, se a função devolve um
        valor, o tipo dele depois de dois pontos. As funções ficam no nível global, em qualquer ordem em relação às
        outras declarações.
      </P>
      <Table
        head={['Parte', 'Exemplo', 'Observação']}
        rows={[
          ['Nome', mono('soma'), 'Um identificador que ainda não está em uso.'],
          ['Parâmetros', mono('(a:int, b:int)'), 'Cada um com nome e tipo, separados por vírgula. A lista pode ser vazia.'],
          ['Tipo de retorno', mono(':int'), 'Vem depois dos parâmetros. Sem ele, a função não devolve valor.'],
          ['Corpo', mono('{ return a + b; }'), 'Um bloco de comandos.'],
        ]}
      />
      <Code lang="flux" example>
        {`func soma(a:int, b:int):int {
    return a + b;
}

func saudacao(nome:string):string {
    return "Olá, " + nome + "!";
}

func main () {
    terminal.log(soma(2, 3));
    terminal.log(saudacao("Ana"));
    terminal.log(soma(soma(1, 2), 4));
}`}
      </Code>
      <Code lang="text">
        {`5
Olá, Ana!
7`}
      </Code>
      <P>
        O tipo de retorno vem depois dos parênteses. Escrevê-lo antes é erro de sintaxe, e um parâmetro sem tipo
        também:
      </P>
      <Code lang="flux">
        {`func soma:int (a:int, b:int) {
    return a + b;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 1, coluna 10]:
Token encontrado: ':'
Esperado: '('`}
      </Code>
      <Code lang="flux">
        {`func dobro(n) {
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 1, coluna 13]:
Token encontrado: ')'
Esperado: ':'`}
      </Code>

      <H2 title="Parâmetros e argumentos" />
      <P>
        Os parâmetros são variáveis locais da função. Ao chamar, o número e os tipos dos argumentos precisam bater com
        os dos parâmetros.
      </P>
      <Code lang="flux">
        {`func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    terminal.log(soma(1));
    terminal.log(soma(1, "a"));
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 18]:
'soma' espera 2 argumentos, recebeu 1.
Erro semântico [linha 7, coluna 26]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <P>
        Como em qualquer declaração, os nomes dos parâmetros não podem repetir um nome já visível: dois parâmetros com
        o mesmo nome, ou um parâmetro e uma variável local com o mesmo nome, são erro de redeclaração.
      </P>
      <Code lang="flux">
        {`func f(a:int) {
    var a = 1;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
'a' já foi declarada.`}
      </Code>
      <Callout kind="nota">
        Pelas regras escritas da linguagem, a única conversão implícita é de {mono('int')} para {mono('float')}, em
        operadores e atribuições. O compilador atual também aceita um {mono('int')} onde um parâmetro {mono('float')} é
        esperado, mas isso não é uma garantia da linguagem. Veja{' '}
        <PageLink to="linguagem/tipos">Tipos, variáveis e constantes</PageLink>.
      </Callout>

      <H3 title="Valores e referências" />
      <P>
        {mono('int')}, {mono('float')}, {mono('bool')} e {mono('string')} são passados por valor: mudar o parâmetro
        dentro da função não altera a variável de quem chamou. {mono('list')} e {mono('object')} são referências:
        a função recebe o mesmo objeto, então mudá-lo dentro dela muda o original.
      </P>
      <Code lang="flux" example>
        {`func acrescentar(l:list<int>, v:int) {
    l.push(v);
}

func dobrar(n:int) {
    n = n * 2;
}

func main () {
    var nums:list<int> = [1];
    acrescentar(nums, 2);
    terminal.log(nums);
    var x = 5;
    dobrar(x);
    terminal.log(x);
}`}
      </Code>
      <Code lang="text">
        {`[1, 2]
5`}
      </Code>

      <H2 title="O valor de retorno" />
      <P>
        Uma função com {mono(':tipo')} devolve um único valor, com {mono('return valor;')}. O valor precisa ter o tipo
        declarado, e o {mono('return')} encerra a função na hora.
      </P>
      <Code lang="flux">
        {`func f(a:int):int {
    return "x";
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 12]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <Code lang="flux">
        {`func f(a:int):int {
    return;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
A função 'f' deve retornar um valor int.`}
      </Code>

      <H3 title="return em todos os caminhos" />
      <P>
        Uma função com tipo de retorno precisa chegar a um {mono('return valor;')} em todos os caminhos possíveis. Um{' '}
        {mono('if')} com {mono('else')} em que os dois lados retornam garante o retorno. Um {mono('if')} sem{' '}
        {mono('else')} não garante, e um laço também não. Um
        caminho que termina em {mono('break')} ou {mono('continue')} sai do laço e não conta como retorno.
      </P>
      <Code lang="flux" example>
        {`func sinal(n:int):string {
    if (n > 0) {
        return "positivo";
    } else {
        if (n < 0) {
            return "negativo";
        } else {
            return "zero";
        }
    }
}

func main () {
    terminal.log(sinal(3));
    terminal.log(sinal(-1));
    terminal.log(sinal(0));
}`}
      </Code>
      <Code lang="text">
        {`positivo
negativo
zero`}
      </Code>
      <Code lang="flux">
        {`func f(n:int):int {
    if (n > 0) {
        return 1;
    }
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 6]:
A função 'f' deve retornar int em todos os caminhos.`}
      </Code>
      <Code lang="flux">
        {`func f(n:int):int {
    while (true) {
        return 1;
    }
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 6]:
A função 'f' deve retornar int em todos os caminhos.`}
      </Code>
      <P>
        Código escrito depois de um {mono('return')} é permitido: a linguagem não tem erro de código inalcançável.
      </P>

      <H2 title="Funções sem tipo de retorno" />
      <P>
        Sem {mono(':tipo')}, a função não devolve valor, como a {mono('main')}. Ela pode terminar no fim do corpo ou
        com {mono('return;')}, e só essa forma de {mono('return')} é permitida. Como não há valor, a chamada só pode ser
        usada como comando, nunca onde um valor é esperado.
      </P>
      <Code lang="flux" example>
        {`func mostrar(titulo:string, valor:int) {
    terminal.log(titulo + ": " + toString(valor));
    return;
}

func main () {
    mostrar("total", 10);
    mostrar("itens", 3);
}`}
      </Code>
      <Code lang="text">
        {`total: 10
itens: 3`}
      </Code>
      <Code lang="flux">
        {`func mostrar(x:int) {
    terminal.log(x);
}

func main () {
    var r = mostrar(1);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 13]:
'mostrar' não retorna valor.`}
      </Code>
      <Code lang="flux">
        {`func mostrar(x:int) {
    return x;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
A função 'mostrar' não retorna valor.`}
      </Code>
      <P>
        Uma função com tipo de retorno pode ser chamada como comando, descartando o valor devolvido. Mas, ao contrário
        de um workflow, não há um erro para tratar: o resultado é um valor comum.
      </P>

      <H2 title="Recursão" />
      <P>
        Uma função pode chamar a si mesma. Como todos os nomes globais valem no arquivo inteiro, duas funções também
        podem chamar uma à outra, seja qual for a ordem em que foram declaradas. Toda recursão precisa de um caso base
        que encerre as chamadas.
      </P>
      <Code lang="flux" example>
        {`func fatorial(n:int):int {
    if (n <= 1) {
        return 1;
    }
    return n * fatorial(n - 1);
}

func ehPar(n:int):bool {
    if (n == 0) {
        return true;
    }
    return ehImpar(n - 1);
}

func ehImpar(n:int):bool {
    if (n == 0) {
        return false;
    }
    return ehPar(n - 1);
}

func main () {
    terminal.log(fatorial(5));
    terminal.log(ehPar(10));
    terminal.log(ehImpar(10));
}`}
      </Code>
      <Code lang="text">
        {`120
true
false`}
      </Code>
      <P>
        Uma recursão sem fim, ou funda demais, encerra o programa com o erro de execução R7:
      </P>
      <Code lang="flux" example>
        {`func f(n:int):int {
    return f(n + 1);
}

func main () {
    terminal.log("começa");
    terminal.log(f(0));
}`}
      </Code>
      <Code lang="text">
        {`começa
Erro de execução [linha 2]:
Estouro de pilha: recursão profunda demais.`}
      </Code>

      <H2 title="Funções não usam call nem run" />
      <P>
        {mono('call')} e {mono('run')} só podem ser usados em workflows e na {mono('main')}. Dentro de uma função comum
        eles são erro, e a função também não pode chamar um workflow.
      </P>
      <Code lang="flux">
        {`func f() {
    var r, e = run { command: "ls" };
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 16]:
'run' só pode ser usado em workflow ou na main.`}
      </Code>
      <P>
        O sentido inverso é livre: um workflow ou a {mono('main')} chamam funções pelo nome, sem {mono('call')}. Usar{' '}
        {mono('call')} para chamar uma função, ou chamar um workflow sem {mono('call')}, também é erro; isso é visto em{' '}
        <PageLink to="linguagem/workflows">Workflows</PageLink>.
      </P>
      <Table
        head={['Situação', 'Código', 'Mensagem']}
        rows={[
          ['Argumentos a menos ou a mais', 'E21', mono("'soma' espera 2 argumentos, recebeu 1.")],
          ['Falta return em algum caminho', 'E20', mono("A função 'f' deve retornar int em todos os caminhos.")],
          ['return de tipo errado', 'E4', mono('Tipo incompatível: esperado int, encontrado string.')],
          ['Chamada sem valor usada como valor', 'E13', mono("'mostrar' não retorna valor.")],
          ['call ou run dentro de func', 'E18', mono("'run' só pode ser usado em workflow ou na main.")],
        ]}
      />
      <P>
        Todos os códigos estão no <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.
      </P>
    </>
  )
}
