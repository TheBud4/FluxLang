import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Tipos() {
  return (
    <>
      <H2 title="Os tipos da linguagem" />
      <P>
        A FluxLang é tipada: toda variável, parâmetro e valor tem um tipo, e o compilador confere os tipos antes de o
        programa rodar. Os tipos são {mono('int')}, {mono('float')}, {mono('string')}, {mono('bool')}, {mono('object')}{' '}
        e {mono('list<tipo>')}. Além deles, {mono('null')} representa a ausência de valor.
      </P>
      <Table
        head={['Tipo', 'O que guarda', 'Literais']}
        rows={[
          [mono('int'), 'Número inteiro de 32 bits, o int do C.', mono('0   42   2147483647')],
          [mono('float'), 'Número real no padrão IEEE.', mono('3.14   0.5   10.0')],
          [mono('string'), 'Texto, sempre entre aspas duplas.', mono('"Olá"   ""   "linha\\n"')],
          [mono('bool'), 'Verdadeiro ou falso.', mono('true   false')],
          [mono('list<tipo>'), 'Sequência de valores do mesmo tipo.', mono('[1, 2, 3]   []')],
          [mono('object'), 'Conjunto de campos, como um JSON.', mono('{ nome: "Ana", idade: 20 }')],
          [mono('null'), 'Ausência de valor.', mono('null')],
        ]}
      />
      <P>
        Listas e objetos têm uma página própria: <PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink>.
      </P>

      <H3 title="int" />
      <P>
        Um {mono('int')} tem 32 bits. O maior literal aceito é {mono('2147483647')}; um literal acima disso é erro
        léxico. O sinal de menos é um operador separado, não parte do literal. Um cálculo cujo resultado sai do
        intervalo encerra o programa com erro de execução, e a divisão ou o resto por zero também.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var maximo:int = 2147483647;
    terminal.log(maximo);
    terminal.log(maximo - 1);
    terminal.log(maximo + 1);
}`}
      </Code>
      <Code lang="text">
        {`2147483647
2147483646
Erro de execução [linha 5]:
Estouro de inteiro.`}
      </Code>

      <H3 title="float" />
      <P>
        Um {mono('float')} exige dígitos dos dois lados do ponto: {mono('3.14')} e {mono('0.5')} são válidos, {mono('5.')}{' '}
        e {mono('.5')} não. Notação científica ({mono('1e10')}) também não existe. O {mono('float')} segue o padrão
        IEEE, então {mono('1.0 / 0.0')} é infinito e {mono('0.0 / 0.0')} é NaN, sem erro de execução. Ao imprimir, o
        valor sai na forma mais curta que volta ao mesmo número, com {mono('.0')} se for inteiro.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var preco:float = 19.9;
    terminal.log(preco);
    terminal.log(preco * 2);
    terminal.log(0.1 + 0.2);
    terminal.log(1.0 / 0.0);
    terminal.log(0.0 / 0.0);
}`}
      </Code>
      <Code lang="text">
        {`19.9
39.8
0.30000000000000004
inf
nan`}
      </Code>

      <H3 title="string" />
      <P>
        Uma {mono('string')} usa apenas aspas duplas e fica numa única linha. Os escapes aceitos são {mono('\\n')},{' '}
        {mono('\\t')}, {mono('\\"')} e {mono('\\\\')}; qualquer outro escape é erro léxico. Strings são valores: atribuir
        uma string a outra variável copia o valor.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var citacao:string = "Ela disse: \\"oi\\"";
    var colunas:string = "nome\\tidade";
    terminal.log(citacao);
    terminal.log(colunas);
    terminal.log("primeira\\nsegunda");
}`}
      </Code>
      <Code lang="text">
        {`Ela disse: "oi"
nome	idade
primeira
segunda`}
      </Code>
      <P>
        Para juntar strings use {mono('+')}. Não há conversão implícita de números para texto; veja{' '}
        <PageLink to="linguagem/operadores">Operadores e precedência</PageLink> e a seção sobre conversões abaixo.
      </P>

      <H3 title="bool" />
      <P>
        Um {mono('bool')} vale {mono('true')} ou {mono('false')}. Condições de {mono('if')} e {mono('while')} precisam
        ser {mono('bool')}: não existe valor "verdadeiro" ou "falso" para números ou textos.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var ativo:bool = true;
    var pausado = !ativo;
    terminal.log(ativo);
    terminal.log(pausado);
    terminal.log(ativo && pausado);
}`}
      </Code>
      <Code lang="text">
        {`true
false
false`}
      </Code>

      <H2 title="null" />
      <P>
        {mono('null')} é a ausência de valor. Ele pode ser atribuído a uma variável de qualquer tipo, e comparado com{' '}
        {mono('==')} e {mono('!=')} com qualquer valor. Usá-lo em uma operação que precisa de um valor de verdade (somar
        um {mono('null')}, por exemplo) é detectado só na execução e encerra o programa com o erro Uso de valor null.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var nome:string = null;
    if (nome == null) {
        terminal.log("sem nome");
    }
    nome = "Ana";
    terminal.log(nome != null);
}`}
      </Code>
      <Code lang="text">
        {`sem nome
true`}
      </Code>
      <Code lang="flux" example>
        {`func main () {
    var quantidade:int = null;
    terminal.log(quantidade);
    terminal.log(quantidade + 1);
}`}
      </Code>
      <Code lang="text">
        {`null
Erro de execução [linha 4]:
Uso de valor null.`}
      </Code>
      <P>
        O erro de uma operação que falha em {mono('run')} ou {mono('call')} também usa {mono('null')}, para dizer "sem
        erro"; isso é tratado em <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>

      <H2 title="Declarando variáveis" />
      <P>
        Uma variável é declarada com {mono('var')}, com o tipo depois do nome, separado por dois pontos, e um valor
        inicial depois do {mono('=')}. A forma geral é:
      </P>
      <Code lang="text">{`var nome:tipo = valor;`}</Code>
      <Code lang="flux" example>
        {`func main () {
    var nome:string = "Andrew";
    var idade:int = 17;
    var nota:float = 8.5;
    var ativo:bool = true;
    terminal.log(nome + " tem " + toString(idade) + " anos");
    terminal.log(nota);
    terminal.log(ativo);
}`}
      </Code>
      <Code lang="text">
        {`Andrew tem 17 anos
8.5
true`}
      </Code>
      <H3 title="Declaração sem valor inicial" />
      <P>
        Dentro de funções, workflows e blocos, o valor inicial pode ser omitido: {mono('var idade:int;')}. A variável
        existe, mas não tem valor (não há valor padrão), e usá-la antes de atribuir é erro. O compilador acompanha o
        fluxo do programa: a variável só conta como inicializada num ponto se foi atribuída em todos os caminhos até
        ele.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var desconto:int;
    var cliente_vip = true;
    if (cliente_vip) {
        desconto = 20;
    } else {
        desconto = 5;
    }
    terminal.log(desconto);
}`}
      </Code>
      <Code lang="text">{`20`}</Code>
      <P>
        Um {mono('if')} com {mono('else')} em que os dois lados atribuem garante a inicialização. Um {mono('if')} sem{' '}
        {mono('else')}, ou um laço, não:
      </P>
      <Code lang="flux">
        {`func main () {
    var desconto:int;
    if (true) {
        desconto = 20;
    }
    terminal.log(desconto);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 18]:
Variável 'desconto' utilizada antes de ser inicializada.`}
      </Code>
      <P>
        Um caminho que termina em {mono('return')}, {mono('break')} ou {mono('continue')} não precisa atribuir, então{' '}
        {mono('if (c) { x = 1; } else { return; }')} deixa {mono('x')} inicializada depois. Um {mono('var')} global
        sempre precisa de valor inicial.
      </P>
      <H3 title="Declarações múltiplas" />
      <P>
        Vários nomes podem ser declarados de uma vez, com ou sem valor inicial. O {mono(':tipo')} vale para todos os
        nomes, e a quantidade de valores deve ser igual à de variáveis. As atribuições múltiplas seguem a mesma forma, e
        todos os valores da direita são calculados antes de qualquer atribuição, o que permite trocar dois valores.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var nome, telefone:string = "Andrew", "99999";
    var x, y:int;
    x, y = 1, 2;
    nome, telefone = "Carlos", "88888";
    terminal.log(nome + " " + telefone);
    terminal.log(x + y);
    x, y = y, x;
    terminal.log(x);
    terminal.log(y);
}`}
      </Code>
      <Code lang="text">
        {`Carlos 88888
3
2
1`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var a, b:int = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
2 variáveis e 1 valor.`}
      </Code>

      <H2 title="Inferência de tipo" />
      <P>
        Em {mono('var')} e {mono('const')}, o {mono(':tipo')} pode ser omitido quando há valor inicial: cada variável
        recebe o tipo do valor correspondente. Nas declarações múltiplas, cada nome recebe o tipo do seu valor.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var total = 10;
    var preco = 2.5;
    var titulo = "Relatório";
    var pronto = false;
    var notas = [7, 8, 9];
    var a, b = 1, "x";
    terminal.log(total + 1);
    terminal.log(preco * 2);
    terminal.log(titulo);
    terminal.log(pronto);
    terminal.log(notas.length());
    terminal.log(a);
    terminal.log(b);
}`}
      </Code>
      <Code lang="text">
        {`11
5.0
Relatório
false
3
1
x`}
      </Code>
      <P>
        O tipo inferido é fixo: {mono('var total = 10;')} cria um {mono('int')} e uma atribuição posterior de outro tipo é
        erro. Em contrapartida, o compilador recusa a inferência quando o valor não revela um tipo:
      </P>
      <Table
        head={['Declaração', 'Por quê não funciona']}
        rows={[
          [mono('var x;'), 'Sem tipo e sem valor. É erro sintático.'],
          [mono('var x = null;'), 'null sozinho não indica um tipo.'],
          [mono('var l = [];'), 'Uma lista vazia não indica o tipo dos elementos.'],
          [mono('var x = user.age;'), 'O valor de um campo de object só é conhecido na execução.'],
        ]}
      />
      <Code lang="flux">
        {`func main () {
    var x = null;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
Não é possível inferir o tipo de 'x'; declare o tipo.`}
      </Code>
      <P>A solução é escrever o tipo:</P>
      <Code lang="flux" example>
        {`func main () {
    var x:int = null;
    var l:list<string> = [];
    var user:object = { age: 17 };
    var idade:int = user.age;
    l.push("primeiro");
    terminal.log(x);
    terminal.log(l);
    terminal.log(idade);
}`}
      </Code>
      <Code lang="text">
        {`null
["primeiro"]
17`}
      </Code>
      <P>
        Quando um {mono('var')} recebe o resultado de um {mono('call')} de workflow sem {mono(':tipo')}, a variável só
        aceita {mono('null')}; isso é visto em <PageLink to="linguagem/workflows">Workflows</PageLink>. Já em{' '}
        {mono('var saida, err = run { command: "ls" };')} as duas variáveis são {mono('string')} (o erro é uma string
        ou {mono('null')}); veja <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>

      <H2 title="Constantes" />
      <P>
        {mono('const')} declara um nome com valor fixo. O valor inicial é obrigatório, o {mono(':tipo')} é opcional
        (como em {mono('var')}) e o nome não pode ser reatribuído.
      </P>
      <Code lang="flux" example>
        {`const versao:string = "1.0";
const limite = 3;

func main () {
    terminal.log(versao);
    terminal.log(limite * 2);
}`}
      </Code>
      <Code lang="text">
        {`1.0
6`}
      </Code>
      <Code lang="flux">
        {`const versao:string = "1.0";

func main () {
    versao = "2.0";
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 5]:
'versao' é constante e não pode ser reatribuída.`}
      </Code>
      <Code lang="flux">
        {`const versao:string;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 1, coluna 20]:
Token encontrado: ';'
Esperado: '='`}
      </Code>
      <H3 title="const é raso" />
      <P>
        A constante não pode ser reatribuída, mas o conteúdo de uma lista ou de um objeto constante pode mudar: campos
        de um {mono('object')} e elementos de uma {mono('list')} (com {mono('push')}, {mono('remove')} e{' '}
        {mono('lista[0] = ...')}).
      </P>
      <Code lang="flux" example>
        {`const nomes:list<string> = ["Ana"];
const config:object = { modo: "teste" };

func main () {
    nomes.push("Bruno");
    nomes[0] = "Carla";
    config.modo = "producao";
    config.novo = true;
    terminal.log(nomes);
    terminal.log(config);
}`}
      </Code>
      <Code lang="text">
        {`["Carla", "Bruno"]
{modo: "producao", novo: true}`}
      </Code>

      <H2 title="Conversões de tipo" />
      <H3 title="Conversão implícita" />
      <P>
        A única conversão implícita é de {mono('int')} para {mono('float')}. Pelas regras da linguagem, ela acontece
        em operadores ({mono('1 + 2.5')} é {mono('float')}) e em atribuições ({mono('var f:float = 3;')}). O caminho
        inverso não existe: um {mono('float')} nunca vira {mono('int')} sozinho, e nenhum valor vira {mono('string')}{' '}
        sozinho.
      </P>
      <Callout kind="nota">
        O compilador atual também promove {mono('int')} para {mono('float')} em argumentos de função, no{' '}
        {mono('return')} de uma função declarada com {mono(':float')} e nos elementos de um literal de lista. Isso não
        faz parte das regras escritas da linguagem, então não conte com esse comportamento como garantia. O exemplo a
        seguir o usa só para mostrar o que o compilador faz hoje.
      </Callout>
      <Code lang="flux" example>
        {`func metade(x:float):float {
    return x / 2;
}

func main () {
    var f:float = 3;
    var total = 1 + 2.5;
    var medidas:list<float> = [1, 2.5];
    terminal.log(f);
    terminal.log(total);
    terminal.log(medidas);
    terminal.log(metade(7));
}`}
      </Code>
      <Code lang="text">
        {`3.0
3.5
[1.0, 2.5]
3.5`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var i:int = 2.5;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 17]:
Tipo incompatível: esperado int, encontrado float.`}
      </Code>
      <H3 title="Conversão explícita" />
      <P>
        Para os outros casos, use as funções de conversão da <PageLink to="linguagem/biblioteca">Biblioteca</PageLink>:
      </P>
      <Table
        head={['Função', 'Aceita', 'Resultado']}
        rows={[
          [mono('toString(x)'), 'Qualquer tipo', <>{mono('string')} com o mesmo texto que {mono('terminal.log')} imprimiria.</>],
          [mono('toInt(x)'), <>{mono('string')} ou {mono('float')}</>, <>{mono('int')}. O {mono('float')} é truncado: {mono('toInt(2.99)')} é {mono('2')}.</>],
          [mono('toFloat(x)'), <>{mono('string')} ou {mono('int')}</>, <>{mono('float')}.</>],
          [mono('toBool(x)'), <>{mono('string')}</>, <>{mono('bool')}. Só aceita {mono('"true"')} e {mono('"false"')}.</>],
        ]}
      />
      <Code lang="flux" example>
        {`func main () {
    var idade:int = 17;
    terminal.log("Idade: " + toString(idade));
    terminal.log(toInt("42") + 1);
    terminal.log(toInt(2.99));
    terminal.log(toInt(-2.99));
    terminal.log(toFloat("2.5") * 2);
    terminal.log(toFloat(7));
    terminal.log(toBool("true") && true);
}`}
      </Code>
      <Code lang="text">
        {`Idade: 17
43
2
-2
5.0
7.0
true`}
      </Code>
      <P>
        Uma entrada de tipo errado é erro de tipo na compilação. Uma entrada do tipo certo, mas impossível de
        converter, encerra o programa com erro de execução:
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
      <Code lang="flux" example>
        {`func main () {
    terminal.log("antes");
    terminal.log(toInt("abc"));
    terminal.log("depois");
}`}
      </Code>
      <Code lang="text">
        {`antes
Erro de execução [linha 3]:
Não é possível converter "abc" para int.`}
      </Code>
      <Callout kind="nota">
        {mono('terminal.input')} sempre devolve {mono('string')}. Para ler um número, combine com a conversão:{' '}
        {mono('var idade:int = toInt(terminal.input("Idade: "));')}.
      </Callout>
    </>
  )
}
