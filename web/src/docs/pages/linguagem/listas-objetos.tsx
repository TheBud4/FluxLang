import { Callout, Code, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function ListasObjetos() {
  return (
    <>
      <H2 title="Listas" />
      <P>
        Uma lista guarda uma sequência de valores do mesmo tipo. O tipo é escrito {mono('list<tipo>')}, com o tipo dos
        elementos entre os sinais de menor e maior: {mono('list<int>')}, {mono('list<string>')},{' '}
        {mono('list<list<int>>')}. O primeiro elemento tem índice {mono('0')}.
      </P>
      <H3 title="Literais" />
      <P>
        Um literal de lista usa colchetes, com os elementos separados por vírgula. A vírgula depois do último elemento
        é opcional.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var nomes:list<string> = ["Ana", "Bruno"];
    var notas = [7, 8, 9,];
    var matriz:list<list<int>> = [[1, 2], [3]];
    var vazia:list<int> = [];
    terminal.log(nomes);
    terminal.log(notas);
    terminal.log(matriz);
    terminal.log(vazia);
}`}
      </Code>
      <Code lang="text">
        {`["Ana", "Bruno"]
[7, 8, 9]
[[1, 2], [3]]
[]`}
      </Code>
      <P>
        Uma lista vazia ({mono('[]')}) não revela o tipo dos elementos, então só pode ser usada quando o tipo é
        declarado: {mono('var l:list<int> = [];')}. Sem o tipo, {mono('var l = [];')} é rejeitado (veja{' '}
        <PageLink to="linguagem/tipos">Tipos, variáveis e constantes</PageLink>).
      </P>
      <Callout kind="aviso">
        Ao escrever {mono('list<tipo>')} seguido de {mono('=')}, deixe um espaço: {mono('var l:list<int> = [1];')}. Sem
        o espaço, o lexer lê {mono('>=')} como um operador e a declaração dá erro sintático. Já {mono('list<list<int>>')}{' '}
        funciona sem espaço.
      </Callout>
      <Code lang="flux">
        {`func main () {
    var l:list<int>= [1];
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 19]:
Token encontrado: '>='
Esperado: '>'`}
      </Code>

      <H3 title="Elementos do mesmo tipo" />
      <P>
        Todos os elementos precisam ter o tipo da lista. A única flexibilidade é entre {mono('int')} e {mono('float')}:
        num literal, os dois se unem em {mono('list<float>')}, e uma lista declarada como {mono('list<float>')} aceita
        inteiros, que são convertidos.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var misturada = [1, 2.5];
    var medidas:list<float> = [1, 2];
    terminal.log(misturada);
    terminal.log(medidas);
}`}
      </Code>
      <Code lang="text">
        {`[1.0, 2.5]
[1.0, 2.0]`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var l = [1, "dois"];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 17]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>

      <H3 title="Índices" />
      <P>
        {mono('lista[i]')} lê o elemento da posição {mono('i')}, e {mono('lista[i] = valor;')} troca esse elemento. O
        índice precisa ser {mono('int')}, e o valor atribuído precisa ter o tipo dos elementos. Um índice fora da
        lista (negativo ou maior que o último) encerra o programa com erro de execução.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var nomes:list<string> = ["Ana", "Bruno"];
    nomes[0] = "Andrew";
    terminal.log(nomes[0]);
    var posicao = 1;
    terminal.log(nomes[posicao]);
    terminal.log(nomes[nomes.length() - 1]);
}`}
      </Code>
      <Code lang="text">
        {`Andrew
Bruno
Bruno`}
      </Code>
      <Code lang="flux" example>
        {`func main () {
    var nomes:list<string> = ["Ana", "Bruno"];
    terminal.log(nomes[5]);
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
Índice 5 fora da lista (tamanho 2).`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var nomes:list<string> = ["Ana", "Bruno"];
    terminal.log(nomes["a"]);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 24]:
Índice de lista deve ser int, encontrado string.`}
      </Code>

      <H3 title="Os três métodos" />
      <P>Uma lista tem três métodos, chamados com ponto:</P>
      <Fn name="length" signature="lista.length(): int">
        Devolve o número de elementos. Uma lista vazia tem tamanho {mono('0')}, e o último índice válido é{' '}
        {mono('length() - 1')}.
      </Fn>
      <Fn name="push" signature="lista.push(valor)">
        Adiciona {mono('valor')} no fim da lista. O valor precisa ter o tipo dos elementos. Não devolve valor.
      </Fn>
      <Fn name="remove" signature="lista.remove(índice)">
        Remove o elemento da posição {mono('índice')}, e os seguintes andam uma posição para trás. O índice precisa ser{' '}
        {mono('int')} e estar dentro da lista. Não devolve valor.
      </Fn>
      <Code lang="flux" example>
        {`func main () {
    var nomes:list<string> = ["Ana", "Bruno"];
    nomes.push("Carlos");
    terminal.log(nomes);
    nomes.remove(1);
    terminal.log(nomes);
    var total:int = nomes.length();
    terminal.log(total);
}`}
      </Code>
      <Code lang="text">
        {`["Ana", "Bruno", "Carlos"]
["Ana", "Carlos"]
2`}
      </Code>
      <P>
        {mono('push')} e {mono('remove')} não devolvem valor, então só podem ser usados como comando. Usá-los onde um
        valor é esperado é erro:
      </P>
      <Code lang="flux">
        {`func main () {
    var l = [1];
    var x = l.push(2);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 15]:
'push' não retorna valor.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var l = [1, 2];
    l.push("tres");
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 12]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>

      <H3 title="Percorrendo uma lista" />
      <P>
        O comando {mono('for item in lista')} visita cada elemento, e o tipo de {mono('item')} vem do tipo da lista.
        Ele é descrito em <PageLink to="linguagem/controle-de-fluxo">Controle de fluxo</PageLink>.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var nomes:list<string> = ["Ana", "Bruno"];
    for nome in nomes {
        terminal.log("Olá, " + nome);
    }
}`}
      </Code>
      <Code lang="text">
        {`Olá, Ana
Olá, Bruno`}
      </Code>
      <H3 title="Listas e null" />
      <P>
        Uma variável de lista pode valer {mono('null')}, e a comparação com {mono('null')} é a única comparação
        permitida entre listas: duas listas não podem ser comparadas com {mono('==')}. Chamar um método de uma lista{' '}
        {mono('null')} é um erro de execução.
      </P>
      <Code lang="flux">
        {`func main () {
    var a = [1];
    var b = [1];
    terminal.log(a == b);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 20]:
Operador '==' não aceita list<int> e list<int>.`}
      </Code>

      <H2 title="Objetos" />
      <P>
        Um {mono('object')} agrupa dados por campos, como um JSON. Cada campo tem um nome e um valor, e o valor pode
        ser de qualquer tipo, inclusive listas e outros objetos.
      </P>
      <H3 title="Literais e acesso" />
      <P>
        O literal usa chaves, com pares {mono('chave: valor')} separados por vírgula (a vírgula final é opcional).
        As chaves são identificadores ou strings; use string quando o nome tem caracteres que um identificador não
        aceita, como o hífen de {mono('"Content-Type"')}. O acesso é por ponto ({mono('user.name')}) ou por colchetes
        com uma string ({mono('headers["Content-Type"]')}); os colchetes também aceitam uma variável do tipo{' '}
        {mono('string')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var user:object = {
        name: "Andrew",
        age: 17,
        active: true,
    };
    var headers:object = { "Content-Type": "application/json" };
    var campo = "name";
    terminal.log(user.name);
    terminal.log(user["age"]);
    terminal.log(user[campo]);
    terminal.log(headers["Content-Type"]);
    terminal.log(user);
}`}
      </Code>
      <Code lang="text">
        {`Andrew
17
Andrew
application/json
{name: "Andrew", age: 17, active: true}`}
      </Code>
      <P>
        Objetos podem conter outros objetos e listas, e o acesso se encadeia: {mono('config.servidor.porta')},{' '}
        {mono('config.tags[0]')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var config:object = {
        servidor: { host: "localhost", porta: 8080 },
        tags: ["a", "b"],
    };
    config.servidor.porta = 9090;
    config.tags.push("c");
    terminal.log(config.servidor.host);
    terminal.log(config.tags[2]);
    terminal.log(config);
}`}
      </Code>
      <Code lang="text">
        {`localhost
c
{servidor: {host: "localhost", porta: 9090}, tags: ["a", "b", "c"]}`}
      </Code>
      <H3 title="Campos dinâmicos" />
      <P>
        Os campos de um objeto são dinâmicos: o compilador não conhece o tipo de {mono('user.age')}, e o tipo real é
        conferido quando o programa roda. Isso traz três regras:
      </P>
      <Table
        head={['Situação', 'O que acontece']}
        rows={[
          ['Atribuir a um campo que não existe', 'Cria o campo.'],
          ['Ler um campo que não existe', <>Devolve {mono('null')}.</>],
          ['Atribuir a um campo que existe', 'Troca o valor, e o novo valor pode ter outro tipo.'],
        ]}
      />
      <Code lang="flux" example>
        {`func main () {
    var user:object = { name: "Andrew", age: 17 };
    user.name = "Carlos";
    user.city = "Curitiba";
    if (user.phone == null) {
        terminal.log("Sem telefone");
    }
    terminal.log(user);
    var headers:object = { "Content-Type": "application/json" };
    headers["Authorization"] = "Bearer abc";
    terminal.log(headers);
}`}
      </Code>
      <Code lang="text">
        {`Sem telefone
{name: "Carlos", age: 17, city: "Curitiba"}
{Content-Type: "application/json", Authorization: "Bearer abc"}`}
      </Code>
      <H3 title="Valores dinâmicos" />
      <P>
        Um valor lido de um campo é dinâmico: serve onde qualquer tipo é esperado (em operadores, condições e
        argumentos), o resultado de uma operação com ele também é dinâmico, e o compilador confere o tipo real na
        execução. Por isso um valor de campo não permite inferir o tipo de uma variável:
      </P>
      <Code lang="flux">
        {`func main () {
    var user:object = { age: 17 };
    var x = user.age;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 9]:
Não é possível inferir o tipo de 'x'; declare o tipo.`}
      </Code>
      <P>Declare o tipo, e a conferência passa para a execução:</P>
      <Code lang="flux" example>
        {`func main () {
    var user:object = { name: "Ana", age: 17 };
    var x:int = user.age;
    var proximo:int = user.age + 1;
    terminal.log(x);
    terminal.log(proximo);
    if (user.age > 10) {
        terminal.log("maior que 10");
    }
}`}
      </Code>
      <Code lang="text">
        {`17
18
maior que 10`}
      </Code>
      <Code lang="flux" example>
        {`func main () {
    var user:object = { name: "Ana" };
    var n:int = user.name;
    terminal.log(n);
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
Esperado int, encontrado string.`}
      </Code>
      <P>
        O mesmo vale para uma condição: {mono('if (user.ativo)')} compila, mas o campo precisa valer {mono('true')} ou{' '}
        {mono('false')} na hora. Se o campo não existir, o valor é {mono('null')} e o programa termina com o erro de
        uso de {mono('null')}. Atribuir a um campo de um campo que não existe também termina com esse erro, porque o
        objeto intermediário não é criado:
      </P>
      <Code lang="flux" example>
        {`func main () {
    var cfg:object = {};
    cfg.servidor.porta = 80;
}`}
      </Code>
      <Code lang="text">{`Erro de execução [linha 3]:
Uso de valor null.`}</Code>
      <Why>
        O modelo de objetos dinâmicos prepara o terreno para HTTP, em que respostas e cabeçalhos são objetos. Formas
        tipadas ({mono('object{name:string}')}) podem vir depois, sem quebrar o código existente.
      </Why>
      <H3 title="Objetos e comparações" />
      <P>
        Como as listas, dois objetos não podem ser comparados com {mono('==')}: só a comparação com {mono('null')} é
        aceita. Uma variável de objeto pode valer {mono('null')}.
      </P>

      <H2 title="Listas e objetos são referências" />
      <P>
        {mono('list')} e {mono('object')} são referências: {mono('var b = a;')} não copia a lista nem o objeto, só faz
        {' '}{mono('b')} apontar para o mesmo conteúdo que {mono('a')}. Passar um deles a uma função também não copia.
        Mudar o conteúdo por um nome é visível pelo outro. Os tipos {mono('int')}, {mono('float')}, {mono('bool')} e{' '}
        {mono('string')} são por valor: a cópia é independente.
      </P>
      <Code lang="flux" example>
        {`func acrescenta(lista:list<int>, perfil:object, numero:int) {
    lista.push(99);
    perfil.visto = true;
    numero = 0;
}

func main () {
    var a = [1];
    var b = a;
    b.push(2);
    terminal.log(a);

    var x = 1;
    var y = x;
    y = 5;
    terminal.log(x);

    var dono:object = { n: 1 };
    var alias = dono;
    alias.n = 9;
    terminal.log(dono.n);

    var n = 7;
    acrescenta(a, dono, n);
    terminal.log(a);
    terminal.log(dono.visto);
    terminal.log(n);
}`}
      </Code>
      <Code lang="text">
        {`[1, 2]
1
9
[1, 2, 99]
true
7`}
      </Code>
      <P>
        Atribuir uma lista nova a {mono('b')} (com {mono('b = [9];')}) troca para onde {mono('b')} aponta e não altera{' '}
        {mono('a')}. O que é compartilhado é o conteúdo, não o nome. Em uma {mono('const')}, a variável não pode ser
        reatribuída, mas o conteúdo pode mudar (veja <PageLink to="linguagem/tipos">Tipos</PageLink>).
      </P>
      <Table
        head={['Tipo', 'Como é copiado']}
        rows={[
          [mono('int, float, bool, string'), 'Por valor: uma cópia independente.'],
          [mono('list, object'), 'Por referência: os dois nomes compartilham o mesmo conteúdo.'],
        ]}
      />
    </>
  )
}
