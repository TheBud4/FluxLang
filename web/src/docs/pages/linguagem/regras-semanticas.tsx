import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function RegrasSemanticas() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        As regras semânticas dizem o que um programa bem escrito ainda precisa respeitar: que os nomes existam, que os
        tipos combinem, que uma variável tenha valor antes de ser usada, que uma função retorne em todos os caminhos.
        Elas são verificadas depois do parse, e só rodam quando o programa não tem erro léxico nem sintático. Um
        programa que passa por todas elas é o que o compilador aceita.
      </P>
      <P>
        Cada regra quebrada tem um código de E1 a E25. O compilador junta todos os erros semânticos do programa e os
        imprime ordenados por linha e coluna, no formato {mono('Erro semântico [linha L, coluna C]:')} seguido da
        mensagem. Cada seção abaixo lista os códigos que lhe dizem respeito, e o <PageLink to="linguagem/erros">Catálogo de erros</PageLink> traz
        cada um com exemplo e mensagem.
      </P>
      <Table
        head={['Assunto', 'Códigos']}
        rows={[
          ['Declarações, escopo e nomes', 'E1, E2'],
          ['Inicialização antes do uso', 'E3, E23, E25'],
          ['Inferência de tipo', 'E8'],
          ['Tipos compatíveis, condições e colchetes', 'E4, E5, E16, E19'],
          ['Constantes', 'E6'],
          ['Quantidade de valores', 'E7'],
          ['Chamadas', 'E1, E4, E13, E15, E21, E22'],
          ['Comandos que não fazem nada', 'E24'],
          ['Funções e retorno', 'E12, E13, E18, E20'],
          ['Workflows', 'E12, E15'],
          ['Laços e erros tratáveis', 'E9, E10, E11, E17'],
          [<>O comando {mono('run')}</>, 'E14, E17, E18'],
        ]}
      />
      <H2 title="Declarações, escopo e nomes" />
      <P>
        Um nome só pode ser usado depois de declarado, e precisa estar visível no ponto em que é usado. Usar um nome
        que não existe é o erro E1.
      </P>
      <Code lang="flux">
        {`func main () {
    var total = 0;
    total = contador + 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 13]:
'contador' não foi declarado.`}
      </Code>
      <H3 title="Onde cada nome vale" />
      <P>
        Há três tipos de escopo: o global, o de cada {mono('func')} ou {mono('workflow')} e o de cada bloco entre
        chaves ({mono('if')}, {mono('else')}, {mono('while')} e {mono('for')}). Uma variável existe da declaração até
        o fim do bloco onde foi declarada. A variável do {mono('for')} existe só dentro do laço.
      </P>
      <Code lang="flux">
        {`func main () {
    var l = [1, 2];
    for i in l {
        terminal.log(toString(i));
    }
    terminal.log(toString(i));
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 27]:
'i' não foi declarado.`}
      </Code>
      <H3 title="Sem shadowing" />
      <P>
        É proibido declarar um nome que já está visível, seja no mesmo escopo, seja num escopo externo. Essa proibição
        se chama ausência de shadowing: um nome declarado dentro de um bloco não pode esconder um nome de fora. O erro
        é o E2.
      </P>
      <Code lang="flux">
        {`func main () {
    var x:int = 1;
    var x:int = 2;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 9]:
'x' já foi declarada.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    if (x > 0) {
        var x = 2;
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 13]:
'x' já foi declarada.`}
      </Code>
      <P>
        Blocos irmãos, que não estão um dentro do outro, podem usar o mesmo nome, porque nenhum enxerga o do outro:
      </P>
      <Code lang="flux" example>
        {`func main () {
    var ok = true;
    if (ok) {
        var x = 1;
        terminal.log(toString(x));
    } else {
        var x = 2;
        terminal.log(toString(x));
    }
}`}
      </Code>
      <Code lang="text">
        {`1`}
      </Code>
      <P>
        Os parâmetros de uma função fazem parte do escopo dela, então repetir um nome entre os parâmetros também é E2:
      </P>
      <Code lang="flux">
        {`func f(a:int, a:int) {
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 15]:
'a' já foi declarada.`}
      </Code>
      <H3 title="Nomes globais" />
      <P>
        Os nomes globais ({mono('var')}, {mono('const')}, {mono('func')} e {mono('workflow')} no nível do arquivo) são
        visíveis em todo o arquivo, inclusive dentro de funções escritas antes deles. Por isso, uma variável local não
        pode usar o nome de um global, mesmo que o global seja declarado mais abaixo:
      </P>
      <Code lang="flux">
        {`func f() {
    var g = 1;
}

var g = 2;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
'g' já foi declarada.`}
      </Code>
      <P>
        A exceção é o inicializador de um global, que segue a ordem do arquivo: ele só pode usar globais declarados
        acima. Usar um declarado abaixo é o E1, com uma mensagem própria; uma função chamada pelo inicializador que lê um global de baixo é o E25.
      </P>
      <Code lang="flux">
        {`var a = b;
var b = 1;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 9]:
'b' só é declarado depois deste ponto.`}
      </Code>
      <H3 title="Nomes da biblioteca" />
      <P>
        {mono('terminal')}, {mono('toString')}, {mono('toInt')}, {mono('toFloat')} e {mono('toBool')} já existem no
        escopo global. Por isso não podem ser redeclarados (E2). A lista da biblioteca está em <PageLink to="linguagem/biblioteca">Biblioteca</PageLink>.
      </P>
      <Code lang="flux">
        {`func main () {
    var terminal:int = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
'terminal' já foi declarada.`}
      </Code>
      <H2 title="Inicialização antes do uso" />
      <P>
        Uma variável declarada sem valor, como {mono('var x:int;')}, não tem valor padrão: ela fica não inicializada,
        e usá-la antes de atribuir é o erro E3.
      </P>
      <Code lang="flux">
        {`func main () {
    var idade:int;
    terminal.log(toString(idade));
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 27]:
Variável 'idade' utilizada antes de ser inicializada.`}
      </Code>
      <P>
        Uma variável só conta como inicializada num ponto se foi atribuída em todos os caminhos que chegam até ele. Um {mono('if')} com {mono('else')} em
        que os dois lados atribuem garante. Um {mono('if')} sem {mono('else')}, ou um laço, não garante, porque o
        corpo pode não rodar.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var c = true;
    var x:int;
    if (c) {
        x = 1;
    } else {
        x = 2;
    }
    terminal.log(toString(x));
}`}
      </Code>
      <Code lang="text">
        {`1`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var idade:int;
    var ok = true;
    if (ok) {
        idade = 10;
    }
    terminal.log(toString(idade));
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 7, coluna 27]:
Variável 'idade' utilizada antes de ser inicializada.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x:int;
    var l = [1];
    for i in l {
        x = i;
    }
    terminal.log(toString(x));
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 7, coluna 27]:
Variável 'x' utilizada antes de ser inicializada.`}
      </Code>
      <P>
        Um caminho que termina em {mono('return')}, {mono('break')} ou {mono('continue')} não precisa atribuir, porque
        o programa não chega ao ponto de uso por ele. No exemplo, o {mono('else')} sai da função, então depois do {mono('if')} a
        variável {mono('x')} está inicializada. O código escrito depois de um {mono('return')}, {mono('break')} ou {mono('continue')} é
        permitido: a linguagem não tem erro de código inalcançável.
      </P>
      <Code lang="flux" example>
        {`func f(c:bool) {
    var x:int;
    if (c) {
        x = 1;
    } else {
        return;
    }
    terminal.log(toString(x));
}

func main () {
    f(true);
}`}
      </Code>
      <Code lang="text">
        {`1`}
      </Code>
      <H3 title="Globais sempre têm valor inicial" />
      <P>
        Uma variável global precisa de valor inicial (E23). É por isso que o E3 só existe para variáveis locais.
      </P>
      <P>
        Os globais são calculados na ordem do arquivo, então o inicializador de um global só pode usar globais declarados acima. Isso vale também para as funções que ele chama: se o inicializador chama uma função (direta ou indiretamente) que lê um global
        declarado depois, é o erro E25. Ver <PageLink to="linguagem/erros">Erros</PageLink>.
      </P>
      <Code lang="flux">
        {`var g:int;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 5]:
A variável global 'g' precisa de valor inicial.`}
      </Code>
      <H2 title="Inferência de tipo" />
      <P>
        Em um {mono('var')} ou {mono('const')} sem {mono(':tipo')}, cada variável recebe o tipo do valor
        correspondente. Quando o valor não permite descobrir o tipo, o compilador pede que você o escreva (E8). Isso
        vale para {mono('null')} e {mono('[]')} sozinhos e para o valor de um campo de {mono('object')}, cujo tipo só
        é conhecido na execução.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = null;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
Não é possível inferir o tipo de 'x'; declare o tipo.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var l = [];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
Não é possível inferir o tipo de 'l'; declare o tipo.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var user = { name: "Ana", age: 30 };
    var a = user.age;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 9]:
Não é possível inferir o tipo de 'a'; declare o tipo.`}
      </Code>
      <P>
        Com o tipo declarado, os três casos passam: {mono('var x:string = null;')}, {mono('var l:list<int> = [];')} e {mono('var a:int = user.age;')}.
        Os campos de um {mono('object')} são dinâmicos: atribuir a um campo novo cria o campo, ler um campo ausente
        devolve {mono('null')}, e o tipo de um campo só é conferido na execução (R5). Por isso o valor de um campo não
        serve para inferir o tipo. Os detalhes estão em <PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink>.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var user:object = { name: "Ana" };
    user.idade = 30;
    terminal.log(toString(user.idade));
    terminal.log(toString(user.cidade));
}`}
      </Code>
      <Code lang="text">
        {`30
null`}
      </Code>
      <P>
        Ao receber o resultado de um workflow sem {mono(':tipo')}, a variável só aceita {mono('null')}, porque o
        resultado de um workflow sem tipo é sempre {mono('null')}. O assunto está em <PageLink to="linguagem/workflows">Workflows</PageLink>.
      </P>
      <Code lang="flux">
        {`workflow w() {
}

func main () {
    var r, e = call w();
    proceed if e;
    r = 5;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 7, coluna 9]:
Tipo incompatível: esperado null, encontrado int.`}
      </Code>
      <H2 title="Tipos compatíveis" />
      <P>
        Os valores precisam ter o tipo que o lugar espera. Isso vale na atribuição, na inicialização, nos argumentos
        de uma chamada, no {mono('return')} e nos operandos de um operador. A única conversão implícita é de {mono('int')} para {mono('float')};
        o contrário não existe e pede {mono('toInt')}. O {mono('null')} pode ser atribuído a uma variável de qualquer
        tipo. Uma incompatibilidade é o erro E4.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var f:float = 1;
    var s:string = null;
    terminal.log(toString(f));
    terminal.log(toString(s));
}`}
      </Code>
      <Code lang="text">
        {`1.0
null`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var idade:int = "dezessete";
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 21]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var i:int = 1.5;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 17]:
Tipo incompatível: esperado int, encontrado float.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var s = "a" + 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 17]:
Operador '+' não aceita string e int.`}
      </Code>
      <P>
        Os operadores têm as próprias regras de tipo, descritas em <PageLink to="linguagem/operadores">Operadores e precedência</PageLink>.
        A mensagem de um operando inválido diz o operador e os tipos que ele recebeu. As conversões que a linguagem
        oferece estão em <PageLink to="linguagem/biblioteca">Biblioteca</PageLink>.
      </P>
      <H3 title="Condições" />
      <P>
        A condição de um {mono('if')} ou de um {mono('while')} deve ser {mono('bool')}. Não existe valor "verdadeiro"
        ou "falso" por conveniência: um {mono('int')} não serve como condição (E5).
      </P>
      <Code lang="flux">
        {`func main () {
    var total = 3;
    if (total) {
        terminal.log("x");
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 9]:
A condição do 'if' deve ser bool, encontrado int.`}
      </Code>
      <H3 title="O for e a lista" />
      <P>
        Em {mono('for item in lista')}, a expressão depois de {mono('in')} deve ser uma lista, e o tipo de {mono('item')} é
        inferido dela. Qualquer outro tipo é o erro E16.
      </P>
      <Code lang="flux">
        {`func main () {
    for c in "abc" {
        terminal.log(c);
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 14]:
'for' exige uma lista, encontrado string.`}
      </Code>
      <H3 title="Colchetes" />
      <P>
        Em {mono('lista[i]')}, o índice deve ser {mono('int')}. Em {mono('obj[chave]')}, a chave deve ser {mono('string')}.
        Colchetes numa variável que não é lista nem objeto também são erro. Os três casos são o E19.
      </P>
      <Code lang="flux">
        {`func main () {
    var nomes = ["a", "b"];
    var x = nomes["a"];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 19]:
Índice de lista deve ser int, encontrado string.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var user = { name: "Ana" };
    var x = user[0];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 18]:
Chave de object deve ser string, encontrado int.`}
      </Code>
      <H2 title="Constantes" />
      <P>
        Uma {mono('const')} não pode ser reatribuída (E6). A regra é rasa: ela vale para a variável, não para o
        conteúdo. Os elementos de uma lista constante e os campos de um objeto constante podem mudar ({mono('push')}, {mono('remove')}, {mono('l[0] = ...')}, {mono('obj.campo = ...')}).
      </P>
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
      <Code lang="flux" example>
        {`func main () {
    const nomes:list<string> = ["Ana"];
    nomes.push("Bruno");
    nomes[0] = "Carla";
    const user:object = { n: 1 };
    user.n = 2;
    terminal.log(toString(nomes));
    terminal.log(toString(user));
}`}
      </Code>
      <Code lang="text">
        {`["Carla", "Bruno"]
{n: 2}`}
      </Code>
      <H2 title="Quantidade de valores" />
      <P>
        Em declarações e atribuições múltiplas, o número de variáveis deve ser igual ao de valores (E7). {mono('call')} e {mono('run')} produzem
        dois valores, o resultado e o erro, e por isso exigem exatamente duas variáveis. A gramática já garante que
        eles aparecem sozinhos do lado direito do {mono('=')}.
      </P>
      <Code lang="flux">
        {`func main () {
    var a, b:int = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
2 variáveis e 1 valor.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var a:int = 1, 2;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
1 variável e 2 valores.`}
      </Code>
      <H2 title="Chamadas" />
      <P>
        Só se chamam funções, workflows (com {mono('call')}), métodos de lista, as funções de {mono('terminal')} e as
        conversões {mono('toString')}, {mono('toInt')}, {mono('toFloat')} e {mono('toBool')}. O número de argumentos
        deve bater com o de parâmetros (E21), e o tipo de cada um também (E4).
      </P>
      <Code lang="flux">
        {`func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    var r = soma(1);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 13]:
'soma' espera 2 argumentos, recebeu 1.`}
      </Code>
      <Code lang="flux">
        {`func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    var r = soma(1, "2");
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 21]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <P>
        Chamar algo que não é uma função nem um método é o E22. Um método que não existe no valor tem a mesma regra:
      </P>
      <Code lang="flux">
        {`func main () {
    var idade = 3;
    idade.push(1);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 11]:
'idade' não tem o método 'push'.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = 3;
    x();
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 5]:
'x' não é uma função.`}
      </Code>
      <P>
        Workflows e funções se chamam de jeitos diferentes, e trocar os dois é o E15: o workflow exige {mono('call')},
        e a função não aceita. A regra está em <PageLink to="linguagem/workflows">Workflows</PageLink> e em <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>
      <Code lang="flux">
        {`workflow build(x:int):int {
    return x, null;
}

func main () {
    var x = build(1);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 13]:
'build' é um workflow e deve ser chamado com 'call'.`}
      </Code>
      <Code lang="flux">
        {`func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    var r, e = call soma(1, 2);
    abort if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 21]:
'soma' é uma função e deve ser chamada sem 'call'.`}
      </Code>
      <H2 title="Comandos que não fazem nada" />
      <P>
        Uma expressão sozinha só vale como comando se for uma chamada, como {mono('terminal.log(x);')} ou {mono('f();')}.
        Expressões como {mono('x + 1;')} ou {mono('idade;')} não fazem nada e são o erro E24.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    x + 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 5]:
Esta expressão não faz nada: só chamadas podem ser usadas como comando.`}
      </Code>
      <H2 title="Funções e retorno" />
      <P>
        Uma função com {mono(':tipo')} retorna com {mono('return valor;')}, e esse {mono('return')} precisa existir em
        todos os caminhos. Um {mono('if')} com {mono('else')} em que os dois lados retornam garante. Um laço não
        garante, porque o corpo pode não rodar. Um caminho que termina em {mono('break')} ou {mono('continue')} sai do
        laço e também não conta como retorno. A falta de retorno é o E20.
      </P>
      <Code lang="flux" example>
        {`func sinal(x:int):int {
    if (x > 0) {
        return 1;
    } else {
        return 0;
    }
}

func main () {
    terminal.log(toString(sinal(5)));
}`}
      </Code>
      <Code lang="text">
        {`1`}
      </Code>
      <Code lang="flux">
        {`func f(x:int):int {
    if (x > 0) {
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
        {`func f(l:list<int>):int {
    for x in l {
        return x;
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
        Uma função sem {mono(':tipo')} só pode usar {mono('return;')}, sem valor, e a chamada dela não pode ser usada
        como valor. Qualquer outro {mono('return')} é o E12, e usar o resultado de uma função sem retorno é o E13. O {mono('push')} e
        o {mono('remove')} das listas também não devolvem valor.
      </P>
      <Code lang="flux">
        {`func f() {
    return 1;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
A função 'f' não retorna valor.`}
      </Code>
      <Code lang="flux">
        {`func mostrarResumo(n:int) {
    terminal.log(toString(n));
}

func main () {
    var n:int = mostrarResumo(3);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 17]:
'mostrarResumo' não retorna valor.`}
      </Code>
      <P>
        Funções podem ser recursivas, mas não podem usar {mono('call')} nem {mono('run')}: esses dois só valem em
        workflows e na {mono('main')}. A violação é o E18.
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
      <H2 title="Workflows" />
      <P>
        Um workflow retorna com {mono('return resultado, erro;')}. Qualquer {mono('return')} de outra forma é o E12.
        Um workflow só é chamado com {mono('call')}, e {mono('call')} só vale para workflows (E15). Workflows podem
        ser recursivos, direta ou indiretamente.
      </P>
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
      <P>
        O segundo valor do {mono('return')} é o erro, e por isso é uma {mono('string')} (ou {mono('null')}):
      </P>
      <Code lang="flux">
        {`workflow w():int {
    return 1, 2;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 15]:
Tipo incompatível: esperado string, encontrado int.`}
      </Code>
      <H2 title="Laços e erros tratáveis" />
      <P>
        {mono('break')} e {mono('continue')} só valem dentro de um laço (E10), e {mono('stop if')} só vale dentro de
        um workflow (E11).
      </P>
      <Code lang="flux">
        {`func main () {
    break;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
'break' fora de um laço.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var s, e = run { command: "echo" };
    stop if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 5]:
'stop if' só pode ser usado dentro de workflow.`}
      </Code>
      <P>
        Todo erro devolvido por {mono('call')} ou por {mono('run')} precisa ser tratado com {mono('stop if')}, {mono('abort if')} ou {mono('proceed if')},
        inclusive na {mono('main')}. O erro conta como tratado se a variável aparece num desses comandos antes do fim
        do bloco onde foi declarada, mesmo dentro de um bloco interno, como em {mono('if (err != null) { stop if err; }')}.
        Se não for tratado, é o E9.
      </P>
      <Code lang="flux">
        {`func main () {
    var s, e = run { command: "ls" };
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 12]:
O erro 'e' não foi tratado.`}
      </Code>
      <P>
        O operando desses comandos deve ser uma variável de erro, isto é, a segunda variável de um {mono('call')} ou {mono('run')}.
        Qualquer outra variável é o E17.
      </P>
      <Code lang="flux">
        {`func main () {
    var out, err = run { command: "ls" };
    abort if out;
    abort if err;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 14]:
'out' não é uma variável de erro.`}
      </Code>
      <P>
        O assunto completo, com os exemplos executáveis, está em <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>
      <H2 title="O comando run" />
      <P>
        O {mono('run')} usa um objeto com os campos {mono('command')} ({mono('string')}, obrigatório), {mono('flags')} ({mono('list<string>')})
        e {mono('workingDir')} ({mono('string')}). Nenhum campo pode se repetir, e campos desconhecidos são erro
        (E14).
      </P>
      <Code lang="flux">
        {`func main () {
    var s, e = run { flags: ["a"] };
    abort if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 20]:
'run' sem o campo obrigatório 'command'.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var s, e = run { command: "ls", command: "pwd", extra: 1 };
    abort if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 46]:
'run' tem o campo 'command' repetido.
Erro semântico [linha 2, coluna 60]:
'run' não aceita o campo 'extra'.`}
      </Code>
      <P>
        O segundo valor do {mono('run')} precisa ir para uma variável de erro, com a mesma regra do E17:
      </P>
      <Code lang="flux">
        {`func main () {
    var s:string;
    var o = { a: "x" };
    s, o.a = run { command: "echo" };
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 10]:
O segundo valor de 'run' deve ir para uma variável de erro.`}
      </Code>
      <H2 title="Valores null e erros de execução" />
      <P>
        O compilador não consegue prever todo uso de {mono('null')}: os usos inválidos, como ler um campo de um objeto
        que vale {mono('null')}, são detectados só em tempo de execução. O mesmo vale para o tipo de um campo de {mono('object')},
        que é conferido na execução. Fora {mono('run')} e {mono('call')}, que devolvem um erro tratável, todo erro em
        tempo de execução encerra o programa como o {mono('abort')}. Eles têm os códigos R1 a R7 e estão no <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.
      </P>
      <H2 title="Detalhes do compilador atual" />
      <Callout kind="nota">
        As posições dos erros semânticos são uma escolha do compilador atual: a do nome, a do operador ou a do valor
        errado. Um valor que já teve erro não gera uma segunda mensagem, e por isso o E9 também não sai para um {mono('run')} ou {mono('call')} que
        já está fora de lugar. O compilador atual também aceita {mono('terminal.input')} com 0 ou 1 argumento. Essas
        escolhas podem mudar sem que a linguagem mude.
      </Callout>
    </>
  )
}
