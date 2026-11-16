import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Erros() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        O compilador reconhece quatro famílias de erros. As três primeiras são erros de compilação: impedem que o
        programa seja aceito e são encontrados antes de ele rodar. A última acontece com o programa rodando.
      </P>
      <Table
        head={['Família', 'Códigos', 'Etapa', 'Quando é detectado']}
        rows={[
          ['Léxico', 'L1 a L6', 'Análise léxica', 'Ao formar os tokens'],
          ['Sintático', 'S1 a S3', 'Análise sintática', 'Ao validar a sequência de tokens contra a gramática'],
          ['Semântico', 'E1 a E24', 'Análise semântica', 'Depois de um parse sem erros, percorrendo o programa'],
          ['Execução', 'R1 a R7', 'O programa rodando', <>Quando o programa executa ({mono('./flux --run')})</>],
        ]}
      />
      <P>
        Cada código tem a sua seção abaixo, com o título no formato {mono('E12: nome')}, a causa, o formato exato da
        mensagem, um programa pequeno que o provoca e a saída que o compilador imprimiu para ele. Um programa com erro
        de compilação é rejeitado, e o compilador termina com código de saída 1. Programa aceito termina com 0, e
        arquivo ilegível ou uso errado da linha de comando com 2.
      </P>
      <Callout kind="nota">
        Nos exemplos, a saída mostrada é a das mensagens de erro. Além delas, o compilador escreve {mono('Programa rejeitado.')} (ou {mono('Programa aceito.')})
        numa linha à parte, que foi omitida para não repetir. Os exemplos de erro de compilação são programas
        completos, com a {mono('main')}, para que você possa copiá-los.
      </Callout>
      <Table
        head={['Código', 'Erro', 'Seção']}
        rows={[
          ['L1', 'Caractere não reconhecido', 'Erros léxicos'],
          ['L2', 'String não terminada', 'Erros léxicos'],
          ['L3', 'Sequência de escape inválida', 'Erros léxicos'],
          ['L4', 'Comentário de bloco não terminado', 'Erros léxicos'],
          ['L5', 'Número malformado', 'Erros léxicos'],
          ['L6', <>Inteiro fora do intervalo do {mono('int')}</>, 'Erros léxicos'],
          ['S1', 'Token inesperado', 'Erros sintáticos'],
          ['S2', 'Fim de arquivo inesperado', 'Erros sintáticos'],
          ['S3', 'Alvo de atribuição inválido', 'Erros sintáticos'],
          [
            'E1 a E24',
            <>Nomes, tipos, inicialização, funções, workflows, {mono('call')}, {mono('run')} e tratamento de erros</>,
            'Erros semânticos',
          ],
          [
            'R1 a R7',
            <>Conversão, lista, {mono('null')}, divisão por zero, tipo de campo, estouro de {mono('int')}, estouro de pilha</>,
            'Erros de execução',
          ],
        ]}
      />
      <P>
        As regras que geram esses erros estão em <PageLink to="linguagem/regras-lexicas">Regras léxicas</PageLink> e <PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink>.
      </P>
      <H2 title="Formato das mensagens" />
      <P>
        Todo erro de compilação começa com uma linha {mono('Erro <categoria> [linha L, coluna C]:')} e traz a mensagem
        na linha seguinte. A categoria é {mono('léxico')}, {mono('sintático')} ou {mono('semântico')}.
      </P>
      <Code lang="text">
        {`Erro léxico [linha 24, coluna 24]:
Caractere não reconhecido: '@'

Erro sintático [linha 7, coluna 20]:
Token encontrado: ';'
Esperado: '='

Erro semântico [linha 12, coluna 5]:
Variável 'idade' utilizada antes de ser inicializada.`}
      </Code>
      <P>
        Os erros de execução usam {mono('Erro de execução [linha L]:')}, só com a linha, e estão na seção Erros de
        execução.
      </P>
      <H3 title="Token encontrado e Esperado" />
      <P>
        Todo erro sintático cita o token que o compilador encontrou e o que ele esperava naquele ponto. Para a
        mensagem ficar em português, os tokens aparecem assim:
      </P>
      <Table
        head={['Token', 'Como aparece na mensagem']}
        rows={[
          [
            'Operadores e pontuação',
            <>O próprio símbolo, entre aspas: {mono("';'")}, {mono("'='")}, {mono("'{'")}, {mono("'>='")}</>,
          ],
          ['Palavras reservadas', mono("palavra reservada 'if'")],
          ['Identificadores', mono("identificador 'total'")],
          ['Literais numéricos', <>{mono('número inteiro 10')} e {mono('número real 3.14')}</>],
          ['Literais de texto', mono('texto "abc"')],
          ['Fim da entrada', mono('fim do arquivo')],
        ]}
      />
      <P>
        Quando mais de um token é aceito naquele ponto, todos são listados, com {mono('ou')} antes do último: {mono("Esperado: '=' ou ':'")}.
        As palavras reservadas esperadas aparecem só entre aspas, como {mono("Esperado: 'if'")}.
      </P>
      <Code lang="flux">
        {`func main () {
    var x;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 10]:
Token encontrado: ';'
Esperado: '=' ou ':'`}
      </Code>
      <H3 title="Expressão, tipo e comando" />
      <P>
        Quando todos os tokens que podem iniciar uma expressão, um tipo ou um comando são aceitos, a lista longa vira
        uma palavra só: {mono('expressão')}, {mono('tipo')} ou {mono('comando')}.
      </P>
      <Code lang="flux">
        {`func main () {
    var x: = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 12]:
Token encontrado: '='
Esperado: tipo`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x:int = ;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 17]:
Token encontrado: ';'
Esperado: expressão, 'call' ou 'run'`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = 1;`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 15]:
Token encontrado: fim do arquivo
Esperado: comando ou '}'`}
      </Code>
      <H3 title="Por que um ; esquecido não lista todos os operadores" />
      <P>
        Onde a gramática admite uma parte opcional, como a lista de parâmetros, o compilador segue o caminho de "nada"
        e aponta o próximo token realmente obrigatório. Por isso um {mono(';')} esquecido dá {mono("Esperado: ';'")},
        e não uma lista com todos os operadores que poderiam continuar a expressão.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    x = 2
    var y = 3;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 4, coluna 5]:
Token encontrado: palavra reservada 'var'
Esperado: ';'`}
      </Code>
      <P>
        Pela mesma regra, {mono('call')} e {mono('run')} fora do lugar geram só o próximo token obrigatório. Como isso
        sozinho não explica o erro, quando o token encontrado é {mono('call')} ou {mono('run')}, a mensagem ganha a
        explicação entre parênteses:
      </P>
      <Code lang="flux">
        {`workflow build(x:int) {
}

func main () {
    var x = 1;
    call build(x);
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 6, coluna 5]:
Token encontrado: palavra reservada 'call'
Esperado: comando ou '}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)`}
      </Code>
      <H3 title="Posições" />
      <P>
        A linha e a coluna começam em 1. As colunas contam caracteres, e uma tabulação conta como uma coluna. Num erro
        sintático, a posição é a do token encontrado. Nos erros semânticos, a posição é a do nome, a do operador ou a
        do valor errado. Os erros semânticos de um programa saem todos juntos, ordenados por linha e coluna.
      </P>
      <H2 title="Erros léxicos" />
      <P>
        Erros léxicos acontecem quando o texto do programa não forma tokens válidos. As regras estão em <PageLink to="linguagem/regras-lexicas">Regras léxicas</PageLink>.
        Depois de um erro léxico o compilador descarta o trecho inválido e continua lendo, então vários podem aparecer
        numa execução.
      </P>
      <H3 title="L1: caractere não reconhecido" />
      <P>
        Acontece quando o programa tem um caractere que não pertence à linguagem fora de um texto ou de um comentário.
        A mensagem é {mono("Caractere não reconhecido: '<caractere>'")}.
      </P>
      <Code lang="flux">
        {`func main () {
    var total:int = 10 @ 2;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 24]:
Caractere não reconhecido: '@'`}
      </Code>
      <P>
        Os casos mais comuns são {mono('#')}, {mono('$')}, as aspas simples e {mono('&')} ou {mono('|')} sozinhos, que
        só existem como {mono('&&')} e {mono('||')}. Aspas simples geram um erro para cada aspa:
      </P>
      <Code lang="flux">
        {`func main () {
    var c = 'a';
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 13]:
Caractere não reconhecido: '''
Erro léxico [linha 2, coluna 15]:
Caractere não reconhecido: '''`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var b = true & false;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 18]:
Caractere não reconhecido: '&'`}
      </Code>
      <P>
        Letras acentuadas fora de textos e comentários também são L1, um erro por caractere:
      </P>
      <Code lang="flux">
        {`func main () {
    var ação:int = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 10]:
Caractere não reconhecido: 'ç'
Erro léxico [linha 2, coluna 11]:
Caractere não reconhecido: 'ã'`}
      </Code>
      <P>
        Caracteres de controle e bytes que não formam UTF-8 válido, como num arquivo salvo em Latin-1, aparecem pelo
        código, por exemplo {mono('Caractere não reconhecido: código 233')}.
      </P>
      <H3 title="L2: string não terminada" />
      <P>
        Acontece quando a linha termina, ou o arquivo acaba, antes da aspa que fecha um texto. A mensagem é {mono('String não terminada')},
        e a posição é a da aspa que abriu o texto.
      </P>
      <Code lang="flux">
        {`func main () {
    terminal.log("abc);
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 18]:
String não terminada`}
      </Code>
      <H3 title="L3: sequência de escape inválida" />
      <P>
        Acontece quando um texto tem uma barra invertida seguida de algo diferente de {mono('n')}, {mono('t')}, {mono('"')} ou {mono('\\')}.
        A mensagem é {mono("Sequência de escape inválida: '\\<letra>'")}, e a posição é a da barra.
      </P>
      <Code lang="flux">
        {`func main () {
    terminal.log("C:\\pasta");
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 21]:
Sequência de escape inválida: '\\p'`}
      </Code>
      <H3 title="L4: comentário de bloco não terminado" />
      <P>
        Acontece quando um {mono('/*')} não tem o {mono('*/')} correspondente até o fim do arquivo. A mensagem é {mono('Comentário de bloco não terminado')},
        e a posição é a do {mono('/*')}.
      </P>
      <Code lang="flux">
        {`func main () {
    terminal.log("oi");
    /* comentário sem fim
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 3, coluna 5]:
Comentário de bloco não terminado`}
      </Code>
      <H3 title="L5: número malformado" />
      <P>
        Acontece quando um número é seguido de letra ({mono('2itens')}, {mono('1e10')}, {mono('0xFF')}, {mono('3.14abc')})
        ou termina com um ponto sem dígitos ({mono('5.')}). A mensagem é {mono("Número malformado: '<trecho>'")}, e o
        trecho inclui o número e as letras coladas a ele.
      </P>
      <Code lang="flux">
        {`func main () {
    var 2itens:int = 3;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 9]:
Número malformado: '2itens'`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var a = 1e10;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 13]:
Número malformado: '1e10'`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var a = 5.;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 13]:
Número malformado: '5.'`}
      </Code>
      <H3 title="L6: inteiro fora do intervalo" />
      <P>
        Acontece quando um literal inteiro passa de 2147483647, o maior {mono('int')} de 32 bits. A mensagem é {mono("Número inteiro fora do intervalo: '<número>'")}.
        Como o {mono('-')} é um token separado, o literal {mono('-2147483648')} também cai aqui, já que {mono('2147483648')} sozinho
        passa do limite.
      </P>
      <Code lang="flux">
        {`func main () {
    var n:int = 99999999999;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 17]:
Número inteiro fora do intervalo: '99999999999'`}
      </Code>
      <H2 title="Erros sintáticos" />
      <P>
        Erros sintáticos acontecem quando a sequência de tokens não segue a gramática. Eles só aparecem depois que o
        texto foi lido sem erro léxico, e todos usam o formato {mono('Token encontrado')} e {mono('Esperado')},
        descrito acima.
      </P>
      <H3 title="S1: token inesperado" />
      <P>
        É o erro mais comum: o compilador encontrou um token onde a gramática não admite. A mensagem é {mono('Token encontrado: X')} e {mono('Esperado: Y')},
        com os tokens escritos como na tabela da seção anterior.
      </P>
      <Code lang="flux">
        {`func main () {
    const v:string;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 19]:
Token encontrado: ';'
Esperado: '='`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    if x > 5 {
        x = 2;
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 8]:
Token encontrado: identificador 'x'
Esperado: '('`}
      </Code>
      <H3 title="Situações comuns de S1" />
      <P>
        A tabela mostra os enganos que mais geram S1. Cada linha foi executada com o compilador, e as colunas são as
        duas linhas da mensagem.
      </P>
      <Table
        head={['Situação', 'Trecho', 'Encontrado', 'Esperado']}
        rows={[
          [<>{mono('const')} sem valor</>, mono('const v:string;'), mono("';'"), mono("'='")],
          [<>{mono('var')} sem tipo e sem valor</>, mono('var x;'), mono("';'"), mono("'=' ou ':'")],
          [<>Falta {mono(';')}</>, mono('x = 1 (e na linha seguinte) y = 2;'), mono("identificador 'y'"), mono("';'")],
          ['Condição sem parênteses', mono('if x > 5 {'), mono("identificador 'x'"), mono("'('")],
          [<>{mono('else if')} (não existe)</>, mono('} else if (x) {'), mono("palavra reservada 'if'"), mono("'{'")],
          ['Corpo sem chaves', mono('while (x) x = x - 1;'), mono("identificador 'x'"), mono("'{'")],
          [
            'Comando fora de função',
            mono('x = 1; (no nível global)'),
            mono("identificador 'x'"),
            mono("'var', 'const', 'func' ou 'workflow'"),
          ],
          [
            <>{mono('main')} ausente</>,
            <>{mono('arquivo só com ')}var{mono(', ')}func{mono(' e ')}workflow``</>,
            mono('fim do arquivo'),
            mono("'var', 'const', 'func' ou 'workflow'"),
          ],
          [
            <>{mono('main')} repetida</>,
            mono('func main () { } (a segunda)'),
            mono("palavra reservada 'main'"),
            mono('identificador'),
          ],
          [<>{mono('main')} com parâmetros</>, mono('func main (x:int) {'), mono("identificador 'x'"), mono("')'")],
          [<>{mono('main')} com tipo de retorno</>, mono('func main ():int {'), mono("':'"), mono("'{'")],
          [
            <>{mono('call')} como comando isolado</>,
            mono('call build(x);'),
            mono("palavra reservada 'call'"),
            mono("comando ou '}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)"),
          ],
          [
            <>{mono('call')} dentro de expressão</>,
            mono('terminal.log(call f());'),
            mono("palavra reservada 'call'"),
            mono("')' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)"),
          ],
          [<>{mono('abort')} sem {mono('if')}</>, mono('abort err;'), mono("identificador 'err'"), mono("'if'")],
          ['Erro que não é identificador simples', mono('stop if r.err;'), mono("'.'"), mono("';'")],
          [<>{mono('>=')} colado no tipo</>, mono('var l:list<int>= [1];'), mono("'>='"), mono("'>'")],
          ['Tipo de retorno antes dos parâmetros', mono('func soma:int (a:int)'), mono("':'"), mono("'('")],
          ['Valor faltando', mono('var x:int = ;'), mono("';'"), mono("expressão, 'call' ou 'run'")],
          ['Tipo faltando', mono('var x: = 1;'), mono("'='"), mono('tipo')],
          [
            'Palavra reservada como nome',
            mono('var list:int;'),
            mono("palavra reservada 'list'"),
            mono('identificador'),
          ],
        ]}
      />
      <H3 title="S2: fim de arquivo inesperado" />
      <P>
        Acontece quando o arquivo acaba com um bloco ainda aberto, em geral por falta de uma chave {mono('}')}. É um
        S1 em que o token encontrado é {mono('fim do arquivo')}. A mensagem é {mono('Token encontrado: fim do arquivo')} e {mono("Esperado: comando ou '}'")},
        e a posição é a do fim do arquivo.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 1;`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 15]:
Token encontrado: fim do arquivo
Esperado: comando ou '}'`}
      </Code>
      <P>
        Um arquivo sem nenhuma declaração, ou sem {mono('main')}, também termina antes da hora e pede {mono("'var', 'const', 'func' ou 'workflow'")}:
      </P>
      <Code lang="flux">
        {`var x = 1;

func soma(a:int):int {
    return a;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 5, coluna 2]:
Token encontrado: fim do arquivo
Esperado: 'var', 'const', 'func' ou 'workflow'`}
      </Code>
      <H3 title="S3: alvo de atribuição inválido" />
      <P>
        Acontece quando o lado esquerdo de uma atribuição não pode receber um valor. O que decide é o último sufixo do
        alvo: {mono('x')}, {mono('obj.a')}, {mono('l[0]')} e {mono('f().x')} são aceitos; {mono('f()')}, {mono('(x)')}, {mono('a + b')} e {mono('10')} são
        S3. A mensagem é {mono("Token encontrado: '='")} e {mono("Esperado: ';' (o lado esquerdo não é variável, campo ou índice)")}.
        A posição é a do {mono('=')}, também na atribuição múltipla.
      </P>
      <Code lang="flux">
        {`func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    soma(1, 2) = 3;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 6, coluna 16]:
Token encontrado: '='
Esperado: ';' (o lado esquerdo não é variável, campo ou índice)`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var a = 1;
    var b = 2;
    (a) = 3;
    a + b = 3;
    10 = a;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 4, coluna 9]:
Token encontrado: '='
Esperado: ';' (o lado esquerdo não é variável, campo ou índice)
Erro sintático [linha 5, coluna 11]:
Token encontrado: '='
Esperado: ';' (o lado esquerdo não é variável, campo ou índice)
Erro sintático [linha 6, coluna 8]:
Token encontrado: '='
Esperado: ';' (o lado esquerdo não é variável, campo ou índice)`}
      </Code>
      <P>
        Na atribuição múltipla, cada alvo é conferido:
      </P>
      <Code lang="flux">
        {`func f() {
}

func main () {
    var a = 1;
    a, f() = 1, 2;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 6, coluna 12]:
Token encontrado: '='
Esperado: ';' (o lado esquerdo não é variável, campo ou índice)`}
      </Code>
      <H2 title="Erros semânticos" />
      <P>
        Erros semânticos são verificados só depois de um parse sem erros: um programa com erro léxico ou sintático
        mostra apenas esses, mesmo que também tenha erros de tipo.
      </P>
      <Code lang="flux">
        {`func main () {
    var a:int = 10 @ 2;
    var b:int = "x";
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 20]:
Caractere não reconhecido: '@'`}
      </Code>
      <P>
        Quando o parse passa, todos os erros semânticos são coletados e impressos ordenados por linha e coluna. As
        regras que os geram, com mais exemplos de programas que funcionam, estão em <PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink>.
        Alguns códigos têm mais de uma mensagem, para dizer exatamente o que deu errado, e as variantes aparecem em
        cada seção.
      </P>
      <H3 title="E1: nome não declarado" />
      <P>
        Acontece quando o programa usa um nome que não foi declarado, seja variável, constante, função ou workflow. A
        mensagem é {mono("'<nome>' não foi declarado.")}
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
      <Code lang="flux">
        {`func main () {
    somar(1, 2);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
'somar' não foi declarado.`}
      </Code>
      <P>
        Há uma variante para os inicializadores de globais, que seguem a ordem do arquivo: {mono("'<nome>' só é declarado depois deste ponto.")}
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
      <H3 title="E2: nome já declarado" />
      <P>
        Acontece quando se declara um nome que já está visível: no mesmo escopo, num escopo externo (não há
        shadowing), entre os parâmetros, ou um nome da biblioteca como {mono('terminal')}. Também vale para uma
        variável local com o nome de um global declarado mais abaixo. A mensagem é {mono("'<nome>' já foi declarada.")}
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
      <Code lang="flux">
        {`func main () {
    var terminal:int = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 9]:
'terminal' já foi declarada.`}
      </Code>
      <H3 title="E3: uso antes de inicializar" />
      <P>
        Acontece quando uma variável sem valor é lida antes de receber um, ou quando só foi atribuída em parte dos
        caminhos que levam ao uso (um {mono('if')} sem {mono('else')}, um laço). A mensagem é {mono("Variável '<nome>' utilizada antes de ser inicializada.")}
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
      <H3 title="E4: tipos incompatíveis" />
      <P>
        Acontece quando o tipo de um valor não é o que o lugar espera: numa atribuição, numa inicialização, num
        argumento, num {mono('return')}, num elemento de lista ou num operador. A mensagem de atribuição, argumento e {mono('return')} é {mono('Tipo incompatível: esperado <tipo>, encontrado <tipo>.')},
        e a de operador é {mono("Operador '<op>' não aceita <tipos>.")}
      </P>
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
    var s = "a" + 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 17]:
Operador '+' não aceita string e int.`}
      </Code>
      <P>
        As variantes: um operador unário ({mono("Operador '-' não aceita string.")}), o uso de uma função como se
        fosse um valor ({mono("'soma' é uma função, não um valor.")}, também para {mono('terminal.log')}), e os
        argumentos e elementos de uma lista, que são conferidos um a um.
      </P>
      <Code lang="flux">
        {`func main () {
    var s = -"a";
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 13]:
Operador '-' não aceita string.`}
      </Code>
      <Code lang="flux">
        {`func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    var f = soma;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 6, coluna 13]:
Tipo incompatível: 'soma' é uma função, não um valor.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var m:list<int> = [1, "a"];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 27]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <P>
        As conversões {mono('toInt')}, {mono('toFloat')} e {mono('toBool')} só aceitam as entradas descritas em <PageLink to="linguagem/biblioteca">Biblioteca</PageLink>;
        outro tipo de argumento também é E4:
      </P>
      <Code lang="flux">
        {`func main () {
    var t = toInt(true);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 19]:
Tipo incompatível: esperado string ou float, encontrado bool.`}
      </Code>
      <H3 title="E5: condição que não é bool" />
      <P>
        Acontece quando a condição de um {mono('if')} ou de um {mono('while')} não é {mono('bool')}. A mensagem é {mono("A condição do 'if' deve ser bool, encontrado <tipo>.")},
        com {mono("'while'")} no lugar quando for o caso.
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
      <Code lang="flux">
        {`func main () {
    var n = 3;
    while (n) {
        n = n - 1;
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 12]:
A condição do 'while' deve ser bool, encontrado int.`}
      </Code>
      <H3 title="E6: reatribuição de const" />
      <P>
        Acontece quando se atribui a uma constante. A mensagem é {mono("'<nome>' é constante e não pode ser reatribuída.")} Mudar
        o conteúdo de uma lista ou de um objeto constante é permitido.
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
      <H3 title="E7: quantidade de valores diferente" />
      <P>
        Acontece quando o número de variáveis de uma declaração ou atribuição é diferente do de valores. Como {mono('call')} e {mono('run')} produzem
        dois valores, exigem duas variáveis. A mensagem é {mono('<n> variáveis e <m> valores.')}, no plural ou no
        singular conforme o número.
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
      <H3 title="E8: tipo impossível de inferir" />
      <P>
        Acontece quando um {mono('var')} ou {mono('const')} sem {mono(':tipo')} recebe um valor de que o compilador
        não consegue descobrir o tipo: {mono('null')}, {mono('[]')} ou um campo de {mono('object')}. A mensagem é {mono("Não é possível inferir o tipo de '<nome>'; declare o tipo.")}
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
      <H3 title="E9: erro não tratado" />
      <P>
        Acontece quando o erro de um {mono('call')} ou {mono('run')} não é tratado com {mono('stop if')}, {mono('abort if')} ou {mono('proceed if')} até
        o fim do bloco onde foi declarado (tratar num bloco interno vale). A mensagem é {mono("O erro '<nome>' não foi tratado.")}
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
      <H3 title="E10: break ou continue fora de laço" />
      <P>
        Acontece quando {mono('break')} ou {mono('continue')} aparece fora de um {mono('while')} ou {mono('for')}. A
        mensagem é {mono("'break' fora de um laço.")}, ou {mono("'continue' fora de um laço.")}
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
    continue;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
'continue' fora de um laço.`}
      </Code>
      <H3 title="E11: stop if fora de workflow" />
      <P>
        Acontece quando {mono('stop if')} é usado numa {mono('func')} ou na {mono('main')}. Nelas, use {mono('abort if')} ou {mono('proceed if')}.
        A mensagem é {mono("'stop if' só pode ser usado dentro de workflow.")}
      </P>
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
      <H3 title="E12: return incompatível" />
      <P>
        Acontece quando o {mono('return')} não combina com o que o bloco declara: uma {mono('func')} sem tipo que
        retorna valor, um {mono('return;')} sem valor numa {mono('func')} com tipo, um workflow que não retorna o par {mono('(resultado, erro)')}.
        A mensagem principal é {mono('Workflow deve retornar (resultado, erro).')}, e as variantes dizem o que falta.
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
        {`func g():int {
    return;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
A função 'g' deve retornar um valor int.`}
      </Code>
      <Code lang="flux">
        {`func g():int {
    return "a";
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 12]:
Tipo incompatível: esperado int, encontrado string.`}
      </Code>
      <P>
        A variante {mono("A função '<nome>' não retorna valor.")} também vale para a {mono('main')}. Um valor do tipo
        errado no {mono('return')} é um E4.
      </P>
      <H3 title="E13: valor de função sem retorno" />
      <P>
        Acontece quando se usa como valor a chamada de uma função sem tipo de retorno, ou de {mono('push')} ou {mono('remove')}.
        A mensagem é {mono("'<nome>' não retorna valor.")}
      </P>
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
      <Code lang="flux">
        {`func main () {
    var nomes = ["a"];
    var x = nomes.push("b");
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 19]:
'push' não retorna valor.`}
      </Code>
      <H3 title="E14: campos de run" />
      <P>
        Acontece quando o objeto do {mono('run')} não segue as regras: falta o campo {mono('command')}, um campo se
        repete, há um campo desconhecido ou o tipo de um campo está errado. As mensagens são {mono("'run' sem o campo obrigatório 'command'.")}, {mono("'run' tem o campo '<nome>' repetido.")}, {mono("'run' não aceita o campo '<nome>'.")} e {mono("O campo '<nome>' de 'run' deve ser <tipo>, encontrado <tipo>.")}
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
      <Code lang="flux">
        {`func main () {
    var s, e = run { command: "ls", flags: "a" };
    abort if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 44]:
O campo 'flags' de 'run' deve ser list<string>, encontrado string.`}
      </Code>
      <H3 title="E15: uso errado de call" />
      <P>
        Acontece quando se troca o jeito de chamar: um workflow chamado sem {mono('call')}, ou uma função chamada com {mono('call')},
        ou um {mono('call')} sobre algo que não é workflow. A mensagem é {mono("'<nome>' é um workflow e deve ser chamado com 'call'.")} ou
        uma das variantes abaixo.
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
      <Code lang="flux">
        {`func main () {
    var x = 1;
    var r, e = call x(1);
    abort if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 21]:
'x' não é um workflow.`}
      </Code>
      <H3 title="E16: for sobre algo que não é lista" />
      <P>
        Acontece quando a expressão depois de {mono('in')} não é uma lista. A mensagem é {mono("'for' exige uma lista, encontrado <tipo>.")}
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
      <H3 title="E17: operando que não é variável de erro" />
      <P>
        Acontece quando o operando de {mono('stop if')}, {mono('abort if')} ou {mono('proceed if')} não é a variável
        de erro de um {mono('call')} ou {mono('run')}, ou quando o segundo valor de um {mono('run')} vai para algo que
        não é variável de erro. A mensagem é {mono("'<nome>' não é uma variável de erro.")} ou {mono("O segundo valor de 'run' deve ir para uma variável de erro.")}
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
      <H3 title="E18: call ou run dentro de func" />
      <P>
        Acontece quando {mono('call')} ou {mono('run')} é usado dentro de uma {mono('func')}. Eles só valem em
        workflows e na {mono('main')}. A mensagem é {mono("'run' só pode ser usado em workflow ou na main.")}, ou {mono("'call' só pode ...")}.
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
      <Code lang="flux">
        {`workflow w() {
}

func f() {
    var r, e = call w();
    abort if e;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 5, coluna 16]:
'call' só pode ser usado em workflow ou na main.
Erro semântico [linha 6, coluna 14]:
'e' não é uma variável de erro.`}
      </Code>
      <Callout kind="nota">
        No segundo exemplo, o {mono('abort if e;')} também gera um erro, porque o compilador atual não trata {mono('e')} como
        variável de erro quando o {mono('call')} está fora do lugar. Trocando a {mono('func')} por um workflow, os
        dois erros somem. O compilador atual não tenta evitar esse tipo de erro em cascata.
      </Callout>
      <H3 title="E19: colchetes com tipo errado" />
      <P>
        Acontece quando o índice de uma lista não é {mono('int')}, a chave de um objeto não é {mono('string')}, ou os
        colchetes são aplicados a algo que não é lista nem objeto. As mensagens são {mono('Índice de lista deve ser int, encontrado <tipo>.')}, {mono('Chave de object deve ser string, encontrado <tipo>.')} e {mono("'<nome>' não é uma lista nem um object e não aceita [ ].")}
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
      <Code lang="flux">
        {`func main () {
    var idade = 3;
    var x = idade[0];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 18]:
'idade' não é uma lista nem um object e não aceita [ ].`}
      </Code>
      <H3 title="E20: func sem return em todos os caminhos" />
      <P>
        Acontece quando uma {mono('func')} com {mono(':tipo')} tem algum caminho que termina sem {mono('return')}. Um
        laço não garante o retorno, e um caminho que termina em {mono('break')} ou {mono('continue')} também não
        conta. A mensagem é {mono("A função '<nome>' deve retornar <tipo> em todos os caminhos.")}, apontando o nome
        da função.
      </P>
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
      <H3 title="E21: número de argumentos errado" />
      <P>
        Acontece quando uma chamada tem mais ou menos argumentos do que os parâmetros. A mensagem é {mono("'<nome>' espera <n> argumentos, recebeu <m>.")}
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
      <H3 title="E22: chamada de algo que não é função" />
      <P>
        Acontece quando o programa chama algo que não é uma função nem um método: uma variável comum, um método que
        não existe ou o campo de um objeto. As mensagens são {mono("'<nome>' não tem o método '<método>'.")}, {mono("'<nome>' não é uma função.")} e {mono('Isso não é uma função e não pode ser chamado.')}
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
    terminal.foo();
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 14]:
'terminal' não tem o método 'foo'.`}
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
      <Code lang="flux">
        {`func main () {
    var l = [1];
    l[0]();
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 6]:
Isso não é uma função e não pode ser chamado.`}
      </Code>
      <H3 title="E23: var global sem valor inicial" />
      <P>
        Acontece quando uma {mono('var')} no nível global é declarada sem valor. A mensagem é {mono("A variável global '<nome>' precisa de valor inicial.")}
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
      <H3 title="E24: expressão solta como comando" />
      <P>
        Acontece quando uma expressão que não é chamada é escrita como comando. A mensagem é {mono('Esta expressão não faz nada: só chamadas podem ser usadas como comando.')}
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
      <Code lang="flux">
        {`func main () {
    var l = [1];
    l[0];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 5]:
Esta expressão não faz nada: só chamadas podem ser usadas como comando.`}
      </Code>
      <H2 title="Erros de execução" />
      <P>
        Os erros de execução só aparecem quando o programa é executado ({mono('./flux --run')}). São de dois tipos.
      </P>
      <P>
        Os erros tratáveis são os únicos que o programa consegue tratar: só {mono('run')} e {mono('call')} devolvem
        erro, no par {mono('(resultado, erro)')}, e ele deve ser tratado com {mono('stop if')}, {mono('abort if')} ou {mono('proceed if')} (E9).
        O {mono('run')} devolve erro quando o comando não pode ser iniciado ou termina com código de saída diferente
        de 0. Nesse caso, o par é {mono('(null, saída de erro do comando)')}; se a saída de erro vier vazia, o erro é {mono("comando 'npm' terminou com código 1")}.
      </P>
      <P>
        Os erros fatais são todos os outros. Eles encerram o programa como o {mono('abort')}, com a mensagem na saída
        de erro e código de saída 1, e não há como tratá-los. O formato é uma linha de cabeçalho, só com a linha do
        programa, e a mensagem:
      </P>
      <Code lang="flux">
        {`func main () {
    var s, e = run { command: "sh", flags: ["-c", "exit 3"] };
    abort if e;
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
comando 'sh' terminou com código 3`}
      </Code>
      <P>
        O {mono('abort if')} usa o mesmo formato, com a mensagem do erro no lugar da mensagem da tabela. Tudo que o
        programa imprimiu antes do erro continua na saída.
      </P>
      <H3 title="R1: conversão impossível" />
      <P>
        Acontece quando {mono('toInt')}, {mono('toFloat')} ou {mono('toBool')} recebem um texto que não pode ser
        convertido. A mensagem é {mono('Não é possível converter "<texto>" para <tipo>.')}
      </P>
      <Code lang="flux">
        {`func main () {
    var n = toInt("abc");
    terminal.log(toString(n));
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 2]:
Não é possível converter "abc" para int.`}
      </Code>
      <H3 title="R2: índice fora da lista" />
      <P>
        Acontece quando o índice de uma lista é negativo ou maior ou igual ao tamanho dela. A mensagem é {mono('Índice <i> fora da lista (tamanho <n>).')}
      </P>
      <Code lang="flux">
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
      <H3 title="R3: uso inválido de null" />
      <P>
        Acontece quando o programa usa um valor {mono('null')} onde o valor é necessário: ler um campo ou chamar um
        método de algo que vale {mono('null')}, ou usar {mono('null')} num operador. A mensagem é {mono('Uso de valor null.')}
      </P>
      <Code lang="flux">
        {`func main () {
    var user:object = null;
    terminal.log(toString(user.name));
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
Uso de valor null.`}
      </Code>
      <H3 title="R4: divisão por zero" />
      <P>
        Acontece na divisão inteira ou no resto inteiro por zero ({mono('/')} e {mono('%')} com {mono('int')}). A
        mensagem é {mono('Divisão por zero.')} A divisão de {mono('float')} segue o padrão IEEE e não é um erro.
      </P>
      <Code lang="flux">
        {`func main () {
    var zero = 0;
    terminal.log(toString(10 / zero));
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
Divisão por zero.`}
      </Code>
      <H3 title="R5: campo com tipo diferente do esperado" />
      <P>
        Acontece quando o valor de um campo de {mono('object')} não tem o tipo que o programa espera dele. O tipo de
        um campo só é conferido na execução. A mensagem é {mono('Esperado <tipo>, encontrado <tipo>.')}
      </P>
      <Code lang="flux">
        {`func main () {
    var user = { name: "Ana" };
    var n:int = user.name;
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
Esperado int, encontrado string.`}
      </Code>
      <H3 title="R6: estouro de int" />
      <P>
        Acontece quando uma conta com {mono('int')} passa dos 32 bits: {mono('2147483647 + 1')}, ou negar o menor {mono('int')}.
        A mensagem é {mono('Estouro de inteiro.')}
      </P>
      <Code lang="flux">
        {`func main () {
    var maximo = 2147483647;
    terminal.log(toString(maximo + 1));
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 3]:
Estouro de inteiro.`}
      </Code>
      <H3 title="R7: estouro de pilha" />
      <P>
        Acontece quando uma recursão não termina ou é funda demais. A mensagem é {mono('Estouro de pilha: recursão profunda demais.')}
      </P>
      <Code lang="flux">
        {`func f(n:int):int {
    return f(n + 1);
}

func main () {
    terminal.log(toString(f(0)));
}`}
      </Code>
      <Code lang="text">
        {`Erro de execução [linha 2]:
Estouro de pilha: recursão profunda demais.`}
      </Code>
      <H2 title="Recuperação de erros" />
      <P>
        O compilador não para no primeiro erro léxico ou sintático: ele entra em modo pânico, descarta tokens até um
        ponto seguro e continua, para mostrar vários erros de uma vez. O exemplo abaixo tem um erro léxico e dois
        sintáticos, e os três são reportados.
      </P>
      <Code lang="flux">
        {`func main () {
    var a:int = 10 @ 2;
    var b = 3
    var c = 4;
    c = 5
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 20]:
Caractere não reconhecido: '@'
Erro sintático [linha 4, coluna 5]:
Token encontrado: palavra reservada 'var'
Esperado: ';'
Erro sintático [linha 6, coluna 1]:
Token encontrado: '}'
Esperado: ';'`}
      </Code>
      <P>
        A regra da recuperação é a seguinte: ao achar um erro dentro de um comando, o compilador descarta tokens até o
        próximo {mono(';')}, que é consumido, ou até um {mono('{')}, caso em que o bloco é lido inteiro. Num erro
        léxico, o trecho inválido é descartado sem uma segunda mensagem. Um erro de atribuição inválida (S3) só
        reporta, porque o comando já tinha terminado. O arquivo {mono('docs/exemplos/invalido.flux')}, mostrado em <PageLink to="linguagem/exemplo-integrado">Exemplo integrado</PageLink>,
        tem sete erros, e os sete são reportados, sem erros em cascata.
      </P>
      <H3 title="Erros em cascata" />
      <P>
        A recuperação é simples, e por isso um erro pode gerar outros que na verdade não existem. O caso típico é um {mono(';')} esquecido
        antes de um {mono('}')}: o compilador descarta a chave que fecha o bloco, e a função seguinte passa a ser lida
        como se estivesse dentro da anterior.
      </P>
      <Code lang="flux">
        {`func f() {
    var a = 1
}

func g() {
    var c = 3;
}

func main () {
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 1]:
Token encontrado: '}'
Esperado: ';'
Erro sintático [linha 9, coluna 1]:
Token encontrado: palavra reservada 'func'
Esperado: comando ou '}'
Erro sintático [linha 10, coluna 2]:
Token encontrado: fim do arquivo
Esperado: comando ou '}'`}
      </Code>
      <P>
        Só o primeiro erro é real. Corrigido o {mono(';')}, os outros dois desaparecem. Vale o mesmo para uma chave {mono('}')} esquecida
        no fim de uma função: a seguinte é lida como parte dela.
      </P>
      <Callout kind="nota">
        Um refinamento da recuperação foi tentado e medido em 3.950 programas obtidos por mutação de um programa
        válido, e reportou mais erros que a versão simples em todos os tipos de mutação. Por isso o compilador atual
        mantém a versão simples, e os erros em cascata são uma limitação conhecida. Ao corrigir um programa, trate
        sempre o primeiro erro e recompile.
      </Callout>
    </>
  )
}
