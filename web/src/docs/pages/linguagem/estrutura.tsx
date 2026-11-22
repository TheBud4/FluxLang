import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Estrutura() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        Um arquivo FluxLang é uma sequência de declarações globais: {mono('var')}, {mono('const')}, {mono('func')} e{' '}
        {mono('workflow')}. Elas podem aparecer em qualquer ordem, e entre elas deve existir exatamente uma{' '}
        {mono('func main ()')}, o ponto de entrada do programa.
      </P>
      <P>
        No nível global só há declarações. Comandos soltos (uma atribuição, uma chamada) só existem dentro de funções,
        workflows e blocos.
      </P>
      <Table
        head={['Declaração', 'Forma', 'Papel']}
        rows={[
          [mono('var'), mono('var nome:tipo = valor;'), 'Variável mutável. No nível global, o valor inicial é obrigatório.'],
          [mono('const'), mono('const nome:tipo = valor;'), 'Valor fixo, sempre com valor inicial.'],
          [mono('func'), mono('func nome(parâmetros):tipo { ... }'), 'Cálculo e lógica. Retorna um único valor.'],
          [mono('workflow'), mono('workflow nome(parâmetros):tipo { ... }'), 'Unidade de automação. Retorna o par (resultado, erro).'],
          [mono('func main ()'), mono('func main () { ... }'), 'Ponto de entrada. Sem parâmetros e sem retorno.'],
        ]}
      />

      <H2 title="A função main" />
      <P>
        Todo programa tem exatamente uma {mono('func main ()')}. Ela não recebe parâmetros, não declara tipo de
        retorno e é por onde a execução começa. É nela que os workflows costumam ser coordenados com {mono('call')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    terminal.log("Começou pela main");
}`}
      </Code>
      <Code lang="text">{`Começou pela main`}</Code>
      <P>
        {mono('main')} é uma palavra reservada, e a própria gramática garante que ela existe uma única vez. Por isso,
        os erros abaixo são erros sintáticos, não semânticos.
      </P>
      <H3 title="Sem main" />
      <Code lang="flux">
        {`func saudar() {
    terminal.log("oi");
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 2]:
Token encontrado: fim do arquivo
Esperado: 'var', 'const', 'func' ou 'workflow'`}
      </Code>
      <P>
        A mensagem aparece no fim do arquivo porque é lá que o parser percebe que a {mono('main')} não veio. A posição
        indicada é a do código mostrado acima, sem quebra de linha depois da última chave.
      </P>
      <H3 title="Duas mains" />
      <Code lang="flux">
        {`func main () {
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 4, coluna 6]:
Token encontrado: palavra reservada 'main'
Esperado: identificador`}
      </Code>
      <H3 title="main com parâmetros ou com tipo de retorno" />
      <Code lang="flux">
        {`func main (x:int) {
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 1, coluna 12]:
Token encontrado: identificador 'x'
Esperado: ')'`}
      </Code>
      <Code lang="flux">
        {`func main ():int {
    return 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 1, coluna 13]:
Token encontrado: ':'
Esperado: '{'`}
      </Code>

      <H2 title="Declarações globais em qualquer ordem" />
      <P>
        A {mono('main')} pode vir antes ou depois das outras declarações, e funções, workflows, variáveis e constantes
        podem ser misturados. Os nomes globais valem no arquivo inteiro, então uma função pode usar uma função, um
        workflow ou uma variável declarados mais abaixo.
      </P>
      <Code lang="flux" example>
        {`func main () {
    terminal.log(descricao());
    terminal.log(contador);
}

func descricao():string {
    return titulo + " v" + versao;
}

var contador = 3;
const titulo:string = "Flux";
const versao:string = "1.0";`}
      </Code>
      <Code lang="text">
        {`Flux v1.0
3`}
      </Code>
      <Callout kind="nota">
        A ordem só importa em um ponto: o valor inicial de um global. Ele é calculado de cima para baixo, na ordem do
        arquivo, então só pode usar globais declarados acima dele, e as funções que ele chama também não podem ler um global declarado abaixo (E25). Dentro de funções e workflows não há essa restrição.
      </Callout>
      <Code lang="flux">
        {`var a = b + 1;
var b = 2;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 9]:
'b' só é declarado depois deste ponto.`}
      </Code>
      <Callout kind="aviso">
        Um {mono('var')} global sempre precisa de valor inicial. {mono('var g:int;')} só é aceito dentro de funções e
        blocos.
      </Callout>
      <Code lang="flux">
        {`var g:int;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 1, coluna 5]:
A variável global 'g' precisa de valor inicial.`}
      </Code>
      <P>
        Qualquer comando fora de uma função ou workflow, como uma atribuição no nível global, é erro sintático:
      </P>
      <Code lang="flux">
        {`var total = 0;
total = 5;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 1]:
Token encontrado: identificador 'total'
Esperado: 'var', 'const', 'func' ou 'workflow'`}
      </Code>

      <H2 title="Os quatro tipos de declaração" />
      <H3 title="var e const" />
      <P>
        {mono('var')} cria uma variável que pode receber novos valores; {mono('const')} cria um nome que não pode ser
        reatribuído e sempre exige valor inicial. Os detalhes (tipos, inferência, declarações múltiplas) estão em{' '}
        <PageLink to="linguagem/tipos">Tipos, variáveis e constantes</PageLink>.
      </P>
      <H3 title="func" />
      <P>
        Uma {mono('func')} serve para cálculo e lógica. Retorna um único valor, com o tipo declarado depois dos
        parâmetros, ou nenhum valor, se omitir o tipo. Funções não podem usar {mono('call')} nem {mono('run')}. Veja{' '}
        <PageLink to="linguagem/funcoes">Funções</PageLink>.
      </P>
      <H3 title="workflow" />
      <P>
        Um {mono('workflow')} é a unidade de automação. Ele sempre devolve o par (resultado, erro), é chamado
        explicitamente com {mono('call')} e pode usar {mono('run')} para executar comandos. Veja{' '}
        <PageLink to="linguagem/workflows">Workflows</PageLink> e{' '}
        <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>
      <Table
        head={['Característica', 'main', 'func', 'workflow']}
        rows={[
          ['Parâmetros', 'Nenhum', 'Sim', 'Sim'],
          ['Retorno', 'Nenhum', 'Um valor, ou nenhum sem :tipo', 'Sempre o par (resultado, erro)'],
          ['Como é chamado', 'Pelo programa, ao iniciar', 'Pelo nome: f(x)', 'Com call: call w(x)'],
          [<>Pode usar {mono('call')} e {mono('run')}</>, 'Sim', 'Não', 'Sim'],
        ]}
      />

      <H2 title="Comandos, blocos e ponto e vírgula" />
      <P>
        Instruções simples terminam com {mono(';')}: declarações de variável, atribuições, chamadas, {mono('return')},{' '}
        {mono('break')} e {mono('continue')}. Blocos (func, workflow, if, while, for) são cercados por chaves e não
        levam {mono(';')} depois do {mono('}')}. Os espaços em branco e as quebras de linha são ignorados, então a
        indentação é uma questão de estilo.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var total = 0;
    for n in [1, 2, 3] {
        total = total + n;
    }
    terminal.log(total);
}`}
      </Code>
      <Code lang="text">{`6`}</Code>
      <P>
        Esquecer o ponto e vírgula dá um erro sintático que aponta para o token seguinte. Os comentários e as demais
        regras de escrita estão em <PageLink to="linguagem/regras-lexicas">Regras léxicas</PageLink>.
      </P>

      <H2 title="Escopo" />
      <P>
        Escopo é a região do programa em que um nome existe. Na FluxLang há três níveis: o global, o de cada{' '}
        {mono('func')} ou {mono('workflow')} (parâmetros e variáveis locais) e o de cada bloco {mono('{ ... }')} de{' '}
        {mono('if')}, {mono('else')}, {mono('while')} e {mono('for')}. Uma variável existe da sua declaração até o fim
        do bloco onde foi declarada.
      </P>
      <H3 title="Sem shadowing" />
      <P>
        É proibido declarar um nome que já está visível, tanto no mesmo escopo quanto em um escopo externo. Isso vale
        para parâmetros, variáveis locais, globais, funções e workflows.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    if (true) {
        var x = 2;
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 13]:
'x' já foi declarada.`}
      </Code>
      <H3 title="Blocos irmãos podem repetir nomes" />
      <P>
        Dois blocos que não estão um dentro do outro não se enxergam, então podem usar o mesmo nome. A variável de um{' '}
        {mono('for')} existe só dentro do laço.
      </P>
      <Code lang="flux" example>
        {`func main () {
    if (true) {
        var mensagem = "primeiro bloco";
        terminal.log(mensagem);
    }
    if (true) {
        var mensagem = "segundo bloco";
        terminal.log(mensagem);
    }
    for i in [1, 2] {
        terminal.log(i);
    }
    for i in [3, 4] {
        terminal.log(i);
    }
}`}
      </Code>
      <Code lang="text">
        {`primeiro bloco
segundo bloco
1
2
3
4`}
      </Code>
      <Code lang="flux">
        {`func main () {
    for i in [1, 2, 3] {
        terminal.log(i);
    }
    terminal.log(i);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 5, coluna 18]:
'i' não foi declarado.`}
      </Code>
      <H3 title="Globais valem no arquivo inteiro" />
      <P>
        Os nomes globais são visíveis em todo o arquivo, inclusive dentro de funções declaradas antes deles. Por isso,
        uma variável local não pode reutilizar o nome de um global, mesmo que o global apareça mais abaixo.
      </P>
      <Code lang="flux">
        {`func calcular() {
    var limite = 1;
}

var limite = 10;

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
'limite' já foi declarada.`}
      </Code>
      <H3 title="Nomes da biblioteca" />
      <P>
        {mono('terminal')}, {mono('toString')}, {mono('toInt')}, {mono('toFloat')} e {mono('toBool')} já existem no
        escopo global, então também não podem ser redeclarados. Eles não são palavras reservadas: só ficam ocupados.
      </P>
      <Code lang="flux">
        {`func main () {
    var terminal = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
'terminal' já foi declarada.`}
      </Code>
      <P>
        Usar um nome que não foi declarado é o erro E1 ({mono("'total' não foi declarado.")}). O catálogo completo
        está em <PageLink to="linguagem/erros">Catálogo de erros</PageLink>, e as regras de escopo e de inicialização
        em <PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink>.
      </P>
    </>
  )
}
