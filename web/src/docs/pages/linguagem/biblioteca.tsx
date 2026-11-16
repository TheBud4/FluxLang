import { Callout, Code, Fn, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Biblioteca() {
  return (
    <>
      <H2 title="O que já vem pronto" />
      <P>
        A FluxLang tem uma biblioteca pequena, sempre disponível, sem nada para importar. Ela é formada por cinco nomes
        globais pré-declarados, mais os métodos das listas.
      </P>
      <Table
        head={['Nome', 'O que é', 'Para que serve']}
        rows={[
          [mono('terminal'), 'Conjunto de funções', <>Entrada e saída: {mono('log')}, {mono('info')}, {mono('warn')}, {mono('error')} e {mono('input')}.</>],
          [mono('toString'), 'Função', 'Converte qualquer valor em texto.'],
          [mono('toInt'), 'Função', <>Converte {mono('string')} ou {mono('float')} em {mono('int')}.</>],
          [mono('toFloat'), 'Função', <>Converte {mono('string')} ou {mono('int')} em {mono('float')}.</>],
          [mono('toBool'), 'Função', <>Converte {mono('"true"')} e {mono('"false"')} em {mono('bool')}.</>],
        ]}
      />
      <P>
        Esses nomes existem no escopo global desde o início do programa. Por isso um programa não pode declarar uma
        variável, uma constante, uma função ou um workflow com um deles: é o erro de nome já em uso. Eles não são
        palavras reservadas, só ficam ocupados.
      </P>
      <Code lang="flux">
        {`func main () {
    var terminal = 1;
    var toInt = 2;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
'terminal' já foi declarada.
Erro semântico [linha 3, coluna 9]:
'toInt' já foi declarada.`}
      </Code>
      <P>
        A regra de escopo está em <PageLink to="linguagem/estrutura">Estrutura do programa</PageLink>.
      </P>

      <H2 title="O terminal" />
      <P>
        {mono('terminal')} concentra a entrada e a saída do programa. As quatro funções de saída aceitam um valor de
        qualquer tipo e o imprimem como o {mono('toString')} faria; {mono('input')} lê uma linha e devolve sempre uma{' '}
        {mono('string')}.
      </P>
      <Fn name="terminal.log" signature="terminal.log(valor)">
        Imprime o valor e uma quebra de linha. É a saída comum do programa.
      </Fn>
      <Fn name="terminal.info" signature="terminal.info(valor)">
        Imprime o valor como uma informação.
      </Fn>
      <Fn name="terminal.warn" signature="terminal.warn(valor)">
        Imprime o valor como um aviso.
      </Fn>
      <Fn name="terminal.error" signature="terminal.error(valor)">
        Imprime o valor como um erro. Não encerra o programa: para isso, use {mono('abort if')}.
      </Fn>
      <Fn name="terminal.input" signature="terminal.input(texto): string">
        Mostra o texto como pergunta, lê uma linha da entrada e devolve o que foi digitado, sempre como{' '}
        {mono('string')}.
      </Fn>
      <Code lang="flux" example>
        {`func main () {
    terminal.log("log: o texto comum");
    terminal.info("info: uma informação");
    terminal.warn("warn: um aviso");
    terminal.error("error: um erro");
}`}
      </Code>
      <Code lang="text">
        {`log: o texto comum
info: uma informação
warn: um aviso
error: um erro`}
      </Code>
      <Callout kind="nota">
        Nas regras escritas da linguagem, as quatro funções diferem só pela intenção. O compilador atual envia{' '}
        {mono('log')} e {mono('info')} para a saída padrão e {mono('warn')} e {mono('error')} para a saída de erro,
        sem prefixo. Quando a saída é um terminal, ele também as pinta por tipo: {mono('log')} em azul,{' '}
        {mono('info')} em ciano, {mono('warn')} em amarelo e {mono('error')} em vermelho. A interface web faz o mesmo.
        Essas escolhas são de implementação e podem mudar.
      </Callout>

      <H3 title="Como os valores são impressos" />
      <P>
        Qualquer valor pode ser impresso. O texto é o que {mono('toString')} produziria para ele.
      </P>
      <Table
        head={['Valor', 'Aparece como']}
        rows={[
          [<>{mono('string')}</>, 'O próprio texto, sem aspas'],
          [<>{mono('int')}</>, mono('42')],
          [<>{mono('float')}</>, <>A forma mais curta que volta ao mesmo número, com {mono('.0')} se for inteiro: {mono('3.0')}, {mono('0.5')}</>],
          [<>{mono('bool')}</>, <>{mono('true')} ou {mono('false')}</>],
          [mono('null'), mono('null')],
          [<>{mono('list')}</>, <>{mono('[1, 2]')}, com as strings entre aspas: {mono('["a", "b"]')}</>],
          [<>{mono('object')}</>, <>{mono('{a: 1, b: "x"}')}, com as strings entre aspas</>],
        ]}
      />
      <Code lang="flux" example>
        {`func main () {
    terminal.log("texto");
    terminal.log(42);
    terminal.log(3.0);
    terminal.log(0.1 + 0.2);
    terminal.log(true);
    terminal.log(null);
    terminal.log(["a", "b"]);
    terminal.log([1, 2.5]);
    terminal.log({ a: 1, b: "x" });
    terminal.log("duas\\nlinhas");
}`}
      </Code>
      <Code lang="text">
        {`texto
42
3.0
0.30000000000000004
true
null
["a", "b"]
[1.0, 2.5]
{a: 1, b: "x"}
duas
linhas`}
      </Code>
      <P>
        A quantidade de argumentos é conferida como em qualquer chamada: cada função de saída recebe exatamente um
        valor.
      </P>
      <Code lang="flux">
        {`func main () {
    terminal.log(1, 2);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 14]:
'terminal.log' espera 1 argumento, recebeu 2.`}
      </Code>

      <H3 title="Lendo a entrada com terminal.input" />
      <P>
        {mono('terminal.input')} sempre devolve {mono('string')}. Para ler um número, combine com uma conversão, como
        em {mono('toInt(terminal.input("Idade: "))')}. Guardar a resposta direto numa variável numérica é erro de tipo.
      </P>
      <Code lang="flux">
        {`func main () {
    var idade:int = terminal.input("Idade: ");
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 30]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <Code lang="flux" example>
        {`func main () {
    var nome:string = terminal.input("Nome: ");
    var idade:int = toInt(terminal.input("Idade: "));
    terminal.log("Olá " + nome);
    terminal.log("Ano que vem: " + toString(idade + 1));
}`}
      </Code>
      <P>
        No editor da interface, a entrada é digitada no campo de entrada, uma linha para cada chamada de{' '}
        {mono('terminal.input')}. Na linha de comando, a entrada vem do teclado ou de um pipe. Com um pipe, o que seria
        digitado não aparece na saída, então as perguntas ficam coladas:
      </P>
      <Code lang="bash">
        {`printf 'Ana\\n17\\n' | ./flux --run entrada.flux`}
      </Code>
      <Code lang="text">
        {`Nome: Idade: Olá Ana
Ano que vem: 18`}
      </Code>
      <Callout kind="nota">
        O compilador atual aceita {mono('terminal.input')} com ou sem o texto da pergunta, e devolve a string vazia quando
        a entrada acabou. Nenhum dos dois comportamentos está nas regras escritas da linguagem.
      </Callout>

      <H2 title="Conversões" />
      <P>
        Não há conversão implícita para {mono('string')}, e a única conversão implícita entre números é de{' '}
        {mono('int')} para {mono('float')}. Para todo o resto, use as quatro funções de conversão. O tipo da entrada é
        conferido na compilação, e a possibilidade de converter o valor é conferida na execução.
      </P>
      <Fn name="toString" signature="toString(valor): string">
        Aceita qualquer tipo e devolve o mesmo texto que {mono('terminal.log')} imprimiria. É a forma de juntar números
        a textos: {mono('"Idade: " + toString(idade)')}.
      </Fn>
      <Fn name="toInt" signature="toInt(valor): int">
        Aceita {mono('string')} ou {mono('float')}. Um {mono('float')} é truncado, não arredondado:{' '}
        {mono('toInt(2.99)')} é {mono('2')} e {mono('toInt(-2.99)')} é {mono('-2')}.
      </Fn>
      <Fn name="toFloat" signature="toFloat(valor): float">
        Aceita {mono('string')} ou {mono('int')}.
      </Fn>
      <Fn name="toBool" signature="toBool(valor): bool">
        Aceita {mono('string')}, e só os textos {mono('"true"')} e {mono('"false"')}.
      </Fn>
      <Code lang="flux" example>
        {`func main () {
    var idade:int = 17;
    terminal.log("Idade: " + toString(idade));
    terminal.log(toString(["a", "b"]));
    terminal.log(toString(null));
    terminal.log(toInt("42") + 1);
    terminal.log(toInt(2.99));
    terminal.log(toFloat("2.5") * 2);
    terminal.log(toFloat(7));
    terminal.log(toBool("false") || toBool("true"));
}`}
      </Code>
      <Code lang="text">
        {`Idade: 17
["a", "b"]
null
43
2
5.0
7.0
true`}
      </Code>

      <H3 title="Quando a conversão falha" />
      <P>
        Há dois tipos de falha. Uma entrada de tipo que a função não aceita é erro de tipo na compilação:
      </P>
      <Code lang="flux">
        {`func main () {
    terminal.log(toInt(true));
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 24]:
Tipo incompatível: esperado string ou float, encontrado bool.`}
      </Code>
      <P>
        Uma entrada do tipo certo, mas impossível de converter, como {mono('toInt("abc")')} ou {mono('toBool("sim")')},
        encerra o programa com erro de execução (R1):
      </P>
      <Code lang="flux" example>
        {`func main () {
    terminal.log("antes");
    terminal.log(toBool("sim"));
    terminal.log("depois");
}`}
      </Code>
      <Code lang="text">
        {`antes
Erro de execução [linha 3]:
Não é possível converter "sim" para bool.`}
      </Code>

      <H2 title="Métodos de lista" />
      <P>
        As listas têm três métodos, chamados com ponto. Eles não são nomes globais, e só existem em valores do tipo{' '}
        {mono('list')}.
      </P>
      <Table
        head={['Método', 'O que faz', 'Devolve']}
        rows={[
          [mono('lista.length()'), 'Conta os elementos.', mono('int')],
          [mono('lista.push(valor)'), 'Adiciona o valor no fim.', 'Nada: só como comando'],
          [mono('lista.remove(índice)'), 'Remove a posição indicada.', 'Nada: só como comando'],
        ]}
      />
      <P>
        Eles estão detalhados, com exemplos, em <PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink>.
      </P>

      <H2 title="O que pode ser chamado" />
      <P>
        Só se chamam funções, workflows (com {mono('call')}), métodos de lista, as funções de {mono('terminal')} e as
        conversões. Chamar um método que não existe, ou usar uma função como se fosse um valor, é erro.
      </P>
      <Code lang="flux">
        {`func main () {
    terminal.foo("x");
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 14]:
'terminal' não tem o método 'foo'.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var f = terminal.log;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 22]:
Tipo incompatível: 'terminal.log' é uma função, não um valor.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = toString(1, 2);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 13]:
'toString' espera 1 argumento, recebeu 2.`}
      </Code>
    </>
  )
}
