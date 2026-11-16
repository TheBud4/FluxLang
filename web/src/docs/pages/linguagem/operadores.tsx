import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Operadores() {
  return (
    <>
      <H2 title="Expressões" />
      <P>
        Uma expressão calcula um valor. Ela pode ser um literal ({mono('42')}, {mono('"texto"')}, {mono('true')},{' '}
        {mono('[1, 2]')}), o nome de uma variável, uma chamada ({mono('soma(1, 2)')}), um acesso ({mono('user.name')},{' '}
        {mono('lista[0]')}) ou o resultado de operadores aplicados a outras expressões. Parênteses agrupam uma
        expressão e mudam a ordem natural de cálculo.
      </P>
      <P>
        Uma atribuição ({mono('x = 1')}) não é uma expressão: ela é um comando e não pode aparecer dentro de uma
        condição ou de uma conta. Também não existem {mono('++')}, {mono('--')} nem operadores como {mono('+=')}.
      </P>

      <H2 title="Precedência" />
      <P>
        A precedência decide qual operador age primeiro quando uma expressão tem vários. A tabela vai da menor para a
        maior precedência: os operadores das linhas de baixo são aplicados antes dos de cima.
      </P>
      <Table
        head={['Nível', 'Operadores', 'Descrição']}
        rows={[
          ['1', mono('||'), 'OU lógico'],
          ['2', mono('&&'), 'E lógico'],
          ['3', mono('==   !='), 'Igualdade e diferença'],
          ['4', mono('<   >   <=   >='), 'Comparação de ordem'],
          [
            '5',
            mono('+   -'),
            <>Soma e subtração. O {mono('+')} também concatena strings.</>,
          ],
          ['6', mono('*   /   %'), 'Multiplicação, divisão e resto'],
          ['7', mono('!   -'), 'Unários: negação lógica e menos'],
          ['8', mono('.campo   [índice ou chave]   (argumentos)'), 'Acesso a campo, índice e chamada'],
        ]}
      />
      <P>
        Os operadores binários dos níveis 1 a 6 agrupam da esquerda para a direita: {mono('10 - 2 - 3')} é{' '}
        {mono('(10 - 2) - 3')}. Os unários agrupam da direita para a esquerda, então {mono('!!x')} e {mono('- -3')}
        funcionam. As comparações de ordem ({mono('<')}, {mono('>')}, {mono('<=')}, {mono('>=')}) não se encadeiam: {mono('1 < 2 < 3')} compara o {mono('bool')} {mono('true')} com o{' '}
        {mono('int')} {mono('3')} e é erro de tipo.
      </P>
      <Code lang="flux" example>
        {`func main () {
    terminal.log(2 + 3 * 4);
    terminal.log((2 + 3) * 4);
    terminal.log(10 - 4 - 3);
    terminal.log(10 - (4 - 3));
    terminal.log(-2 * -2);
    terminal.log(1 + 2 < 2 * 2);
    terminal.log(true || false && false);
    terminal.log((true || false) && false);
    terminal.log(!false == true);
    terminal.log(1 < 2 == 2 < 3);
}`}
      </Code>
      <Code lang="text">
        {`14
20
3
9
4
true
true
false
true
true`}
      </Code>
      <P>Lendo alguns casos:</P>
      <Table
        head={['Expressão', 'Agrupamento', 'Resultado']}
        rows={[
          [mono('2 + 3 * 4'), mono('2 + (3 * 4)'), mono('14')],
          [mono('1 + 2 < 2 * 2'), mono('(1 + 2) < (2 * 2)'), mono('true')],
          [mono('true || false && false'), mono('true || (false && false)'), mono('true')],
          [mono('!false == true'), mono('(!false) == true'), mono('true')],
          [mono('1 < 2 == 2 < 3'), mono('(1 < 2) == (2 < 3)'), mono('true')],
          [mono('-2 * -2'), mono('(-2) * (-2)'), mono('4')],
        ]}
      />
      <H3 title="O nível 8: acesso, índice e chamada" />
      <P>
        O nível mais forte agrupa o que vem colado a um valor: {mono('.campo')}, {mono('[índice]')} e{' '}
        {mono('(argumentos)')}. Eles se combinam e são aplicados antes de qualquer operador, por isso{' '}
        {mono('-lista.length()')} é o menos aplicado ao tamanho da lista, e {mono('config.servidor.porta + 1')} soma 1 ao
        valor do campo.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var lista = [4, 5, 6];
    var config:object = { servidor: { porta: 8080 } };
    terminal.log(-lista.length());
    terminal.log(lista[1] * 2);
    terminal.log(config.servidor.porta + 1);
    terminal.log(!(lista.length() > 5));
}`}
      </Code>
      <Code lang="text">
        {`-3
10
8081
true`}
      </Code>

      <H2 title="Operadores aritméticos" />
      <P>
        {mono('+')}, {mono('-')}, {mono('*')} e {mono('/')} aceitam {mono('int')} ou {mono('float')}. O resultado é{' '}
        {mono('float')} se um dos lados for {mono('float')}; senão é {mono('int')}. O {mono('%')} (resto) só aceita{' '}
        {mono('int')}. O {mono('-')} também pode ser unário, com o mesmo tipo do operando.
      </P>
      <Table
        head={['Operadores', 'Operandos', 'Resultado']}
        rows={[
          [mono('+   -   *   /'), <>{mono('int')} ou {mono('float')}</>, <>{mono('float')} se um lado for {mono('float')}; senão {mono('int')}</>],
          [mono('%'), mono('int'), mono('int')],
          [<>{mono('-')} unário</>, <>{mono('int')} ou {mono('float')}</>, 'o mesmo tipo do operando'],
        ]}
      />
      <H3 title="Divisão inteira" />
      <P>
        {mono('int / int')} é divisão inteira, como em C: o resultado é truncado em direção a zero, e o {mono('%')} dá
        o resto com o sinal do dividendo. Para obter uma divisão com casas decimais, faça com que um dos lados seja{' '}
        {mono('float')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    terminal.log(7 / 2);
    terminal.log(7 % 3);
    terminal.log(-7 / 2);
    terminal.log(-7 % 3);
    terminal.log(7 / 2.0);
    terminal.log(7 / 2 * 2);
    terminal.log(7 / 2.0 * 2);
}`}
      </Code>
      <Code lang="text">
        {`3
1
-3
-1
3.5
6
7.0`}
      </Code>
      <H3 title="int e float juntos" />
      <P>
        A única conversão implícita da linguagem é de {mono('int')} para {mono('float')}. Numa conta que mistura os
        dois, o {mono('int')} é promovido e o resultado é {mono('float')}. O mesmo vale ao atribuir um {mono('int')} a
        uma variável {mono('float')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var inteiro = 5;
    var real:float = inteiro;
    terminal.log(1 + 2.5);
    terminal.log(inteiro / 2);
    terminal.log(real / 2);
    terminal.log(2 * 1.5);
}`}
      </Code>
      <Code lang="text">
        {`3.5
2
2.5
3.0`}
      </Code>
      <H3 title="Estouro e divisão por zero" />
      <P>
        O {mono('int')} tem 32 bits. Um resultado fora do intervalo ({mono('2147483647 + 1')}, por exemplo) encerra o
        programa com o erro de execução Estouro de inteiro. A divisão e o resto de inteiros por zero também encerram o
        programa. O {mono('float')} segue o padrão IEEE: dividir por zero dá infinito ou NaN, sem erro.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var zero = 0;
    var fzero = 0.0;
    terminal.log(1.0 / fzero);
    terminal.log(-1.0 / fzero);
    terminal.log(10 / zero);
}`}
      </Code>
      <Code lang="text">
        {`inf
-inf
Erro de execução [linha 6]:
Divisão por zero.`}
      </Code>

      <H2 title="Concatenação de strings" />
      <P>
        O {mono('+')} também junta duas strings. Só funciona entre {mono('string')} e {mono('string')}: não há
        conversão implícita para texto, então um número precisa passar por {mono('toString')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var nome = "Ana";
    var idade = 17;
    terminal.log("Olá, " + nome + "!");
    terminal.log("Idade: " + toString(idade));
    var linha = "a";
    linha = linha + "b";
    terminal.log(linha);
}`}
      </Code>
      <Code lang="text">
        {`Olá, Ana!
Idade: 17
ab`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var idade = 17;
    terminal.log("Idade: " + idade);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 28]:
Operador '+' não aceita string e int.`}
      </Code>

      <H2 title="Operadores de comparação" />
      <H3 title="Ordem: < > <= >=" />
      <P>
        Os quatro operadores de ordem aceitam {mono('int')} ou {mono('float')} (que podem ser misturados) e devolvem{' '}
        {mono('bool')}. Strings e booleanos não têm ordem: {mono('"a" < "b"')} é erro de tipo.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var n = 5;
    terminal.log(n > 3 && n < 10);
    terminal.log(n <= 5);
    terminal.log(n >= 6);
    terminal.log(2.5 > 2);
}`}
      </Code>
      <Code lang="text">
        {`true
true
false
true`}
      </Code>
      <Code lang="flux">
        {`func main () {
    terminal.log("a" < "b");
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 22]:
Operador '<' não aceita string e string.`}
      </Code>
      <H3 title="Igualdade: == e !=" />
      <P>
        {mono('==')} e {mono('!=')} comparam dois valores do mesmo tipo, ou qualquer valor com {mono('null')}. Existem
        duas particularidades:
      </P>
      <Table
        head={['Caso', 'Regra']}
        rows={[
          [<>{mono('int')} com {mono('float')}</>, <>O {mono('int')} é promovido: {mono('1 == 1.0')} é {mono('true')}.</>],
          [<>{mono('list')} e {mono('object')}</>, <>Só podem ser comparados com {mono('null')}. Duas listas ou dois objetos não se comparam.</>],
          [<>Qualquer valor e {mono('null')}</>, <>Sempre permitido. É a forma de testar ausência de valor.</>],
        ]}
      />
      <Code lang="flux" example>
        {`func main () {
    var nome:string = null;
    var lista = [1, 2];
    terminal.log(1 == 1.0);
    terminal.log(3 / 2 == 1.5);
    terminal.log("ab" == "ab");
    terminal.log(true != false);
    terminal.log(nome == null);
    terminal.log(lista != null);
    terminal.log(1 == null);
}`}
      </Code>
      <Code lang="text">
        {`true
false
true
true
true
true
false`}
      </Code>
      <Code lang="flux">
        {`func main () {
    terminal.log(1 == "1");
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 20]:
Operador '==' não aceita int e string.`}
      </Code>

      <H2 title="Operadores lógicos" />
      <P>
        {mono('&&')} (e), {mono('||')} (ou) e {mono('!')} (não) só aceitam {mono('bool')} e devolvem {mono('bool')}.
        Não há valores "verdadeiros" ou "falsos": um número ou um texto não serve como condição. Os símbolos {mono('&')}{' '}
        e {mono('|')} sozinhos não existem e são erro léxico.
      </P>
      <P>
        Os operandos são avaliados da esquerda para a direita.
      </P>
      <Callout kind="nota">
        O compilador atual avalia o lado direito de {mono('&&')} e {mono('||')} só quando necessário (curto-circuito):
        quando o lado esquerdo já decide o resultado, o direito nem é executado. Isso não está nas regras escritas da
        linguagem, então não o trate como garantia. O exemplo abaixo mostra o que o compilador faz hoje.
      </Callout>
      <Code lang="flux" example>
        {`func avaliar(texto:string):bool {
    terminal.log(texto);
    return true;
}

func main () {
    var n = 0;
    terminal.log(false && avaliar("direita do &&"));
    terminal.log(true || avaliar("direita do ||"));
    terminal.log(true && avaliar("avaliada"));
    terminal.log(n != 0 && 10 / n > 1);
}`}
      </Code>
      <Code lang="text">
        {`false
true
avaliada
true
false`}
      </Code>
      <Code lang="flux">
        {`func main () {
    terminal.log(1 && true);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 20]:
Operador '&&' não aceita int e bool.`}
      </Code>

      <H2 title="Tipos aceitos pelos operadores" />
      <Table
        head={['Operadores', 'Operandos', 'Resultado']}
        rows={[
          [
            mono('+   -   *   /'),
            <>{mono('int')} ou {mono('float')}</>,
            <>
              {mono('float')} se um dos lados for {mono('float')}; senão {mono('int')} ({mono('7 / 2')} é {mono('3')})
            </>,
          ],
          [mono('+'), <>{mono('string')} e {mono('string')}</>, mono('string')],
          [mono('%'), mono('int'), mono('int')],
          [<>{mono('-')} unário</>, <>{mono('int')} ou {mono('float')}</>, 'o mesmo tipo'],
          [mono('<   >   <=   >='), <>{mono('int')} ou {mono('float')}</>, mono('bool')],
          [
            mono('==   !='),
            <>
              dois valores do mesmo tipo ({mono('int')} e {mono('float')} também, promovendo o {mono('int')}), ou qualquer
              valor e {mono('null')}; {mono('list')} e {mono('object')} só com {mono('null')}
            </>,
            mono('bool'),
          ],
          [mono('&&   ||   !'), mono('bool'), mono('bool')],
        ]}
      />
      <Callout kind="nota">
        Um valor lido de um campo de objeto é dinâmico: serve em qualquer operador, e o compilador só confere o tipo
        real na execução. {mono('user.age * 2')} compila, e falha na hora de rodar se o campo não for número. Veja{' '}
        <PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink>.
      </Callout>

      <H2 title="Erros comuns" />
      <P>
        Quando os tipos não combinam, o compilador diz qual operador e quais tipos encontrou. Os mais comuns:
      </P>
      <Table
        head={['Expressão', 'Mensagem']}
        rows={[
          [mono('"a" + 1'), mono("Operador '+' não aceita string e int.")],
          [mono('true + 1'), mono("Operador '+' não aceita bool e int.")],
          [mono('7.5 % 2'), mono("Operador '%' não aceita float e int.")],
          [mono('!1'), mono("Operador '!' não aceita int.")],
          [mono('-"a"'), mono("Operador '-' não aceita string.")],
          [mono('[1] == [1]'), mono("Operador '==' não aceita list<int> e list<int>.")],
        ]}
      />
      <P>
        As regras gerais de tipos estão em <PageLink to="linguagem/tipos">Tipos, variáveis e constantes</PageLink>. As
        condições de {mono('if')} e {mono('while')}, que precisam ser {mono('bool')}, estão em{' '}
        <PageLink to="linguagem/controle-de-fluxo">Controle de fluxo</PageLink>.
      </P>
    </>
  )
}
