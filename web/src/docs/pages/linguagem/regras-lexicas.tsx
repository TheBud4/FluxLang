import { Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function RegrasLexicas() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        Antes de qualquer análise de estrutura ou de tipos, o compilador lê o texto do programa e o divide em
        palavras, números, textos, operadores e símbolos, os tokens. Essa etapa é a análise léxica, e esta página
        reúne as regras dela: como escrever nomes, números, textos e comentários, quais palavras são reservadas e o
        que o analisador léxico faz quando duas leituras são possíveis.
      </P>
      <P>
        Quando o texto não segue essas regras, o erro é léxico e recebe um código de L1 a L6. Cada um aparece nas
        seções abaixo, e o <PageLink to="linguagem/erros">Catálogo de erros</PageLink> reúne todos, com a causa, um
        exemplo e a mensagem.
      </P>
      <Table
        head={['Assunto', 'Regra em uma linha']}
        rows={[
          ['Maiúsculas e minúsculas', 'A linguagem diferencia maiúsculas de minúsculas.'],
          ['Identificadores', <>Começam com letra ou {mono('_')} e continuam com letras, números ou {mono('_')}.</>],
          ['Palavras reservadas', 'São 27 e não servem de nome.'],
          [
            'Números',
            <>Decimais simples; o {mono('float')} exige dígitos dos dois lados do ponto; o {mono('int')} vai até 2147483647.</>,
          ],
          [
            'Textos',
            <>Só aspas duplas, numa única linha, com os escapes {mono('\\n')}, {mono('\\t')}, {mono('\\"')} e {mono('\\\\')}.</>,
          ],
          ['Comentários', <>{mono('// linha')} e {mono('/* bloco */')}, sem aninhamento.</>],
          [
            'Maior casamento',
            <>O analisador léxico sempre forma o token mais longo possível: {mono('list<int>=')} precisa de espaço.</>,
          ],
          [
            <>Espaços e {mono(';')}</>,
            <>Espaços são ignorados fora de textos e comentários; instruções simples terminam com {mono(';')}.</>,
          ],
        ]}
      />
      <H2 title="Maiúsculas e minúsculas" />
      <P>
        A FluxLang diferencia maiúsculas de minúsculas em tudo: {mono('total')} e {mono('Total')} são dois nomes
        diferentes, e as palavras reservadas só valem em minúsculas.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var total = 1;
    var Total = 2;
    terminal.log(toString(total + Total));
}`}
      </Code>
      <Code lang="text">
        {`3`}
      </Code>
      <P>
        {mono('Var')} não é a palavra reservada {mono('var')}. O analisador léxico o entende como um nome qualquer, e
        a falha só aparece adiante, na análise sintática:
      </P>
      <Code lang="flux">
        {`func main () {
    Var x = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 9]:
Token encontrado: identificador 'x'
Esperado: ';'`}
      </Code>
      <H2 title="Identificadores" />
      <P>
        Um identificador é o nome de uma variável, constante, função, workflow ou parâmetro. Ele começa com uma letra
        ou com {mono('_')} e continua com letras, números ou {mono('_')}. Só valem as letras do alfabeto sem acento: {mono('ação')} não
        é um identificador válido.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var _x = 1;
    var valor_2 = 2;
    var Nome = "Ana";
    terminal.log(toString(_x + valor_2));
}`}
      </Code>
      <Code lang="text">
        {`3`}
      </Code>
      <P>
        Um nome que começa com número é lido como um número seguido de letras, e isso é o erro léxico L5 (veja a seção
        Números). Uma palavra reservada não pode ser usada como nome; a mensagem pede um identificador:
      </P>
      <Code lang="flux">
        {`func main () {
    var list:int;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 9]:
Token encontrado: palavra reservada 'list'
Esperado: identificador`}
      </Code>
      <P>
        Os nomes da biblioteca ({mono('terminal')}, {mono('toString')}, {mono('toInt')}, {mono('toFloat')} e {mono('toBool')})
        não são palavras reservadas, mas já existem no escopo global e por isso não podem ser redeclarados. A regra
        está em <PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink> e a biblioteca em <PageLink to="linguagem/biblioteca">Biblioteca</PageLink>.
      </P>
      <H2 title="Palavras reservadas" />
      <P>
        São 27 palavras. Elas têm um papel fixo na linguagem e não podem ser usadas como nome de variável, constante,
        função, workflow ou parâmetro.
      </P>
      <Table
        head={['Grupo', 'Palavras']}
        rows={[
          ['Declarações', <>{mono('var')}, {mono('const')}, {mono('func')}, {mono('workflow')}, {mono('main')}</>],
          [
            'Tipos',
            <>{mono('int')}, {mono('float')}, {mono('string')}, {mono('bool')}, {mono('object')}, {mono('list')}</>,
          ],
          [
            'Controle de fluxo',
            <>{mono('if')}, {mono('else')}, {mono('while')}, {mono('for')}, {mono('in')}, {mono('break')}, {mono('continue')}, {mono('return')}</>,
          ],
          ['Chamadas e erros', <>{mono('call')}, {mono('run')}, {mono('stop')}, {mono('abort')}, {mono('proceed')}</>],
          ['Valores', <>{mono('true')}, {mono('false')}, {mono('null')}</>],
        ]}
      />
      <P>
        Elas só valem em minúsculas. Em mensagens de erro sintático, uma palavra reservada aparece como {mono("palavra reservada 'if'")}.
      </P>
      <H2 title="Números" />
      <P>
        Os números usam o formato decimal simples. Um {mono('int')} são dígitos ({mono('42')}) e um {mono('float')} tem
        dígitos dos dois lados do ponto ({mono('3.14')}). Não existe notação científica nem hexadecimal. Os literais
        inteiros vão até 2147483647, o maior {mono('int')} de 32 bits.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var a = 2147483647;
    var b = 3.14;
    var c = 0.5;
    var n = -5;
    terminal.log(toString(a));
    terminal.log(toString(b));
    terminal.log(toString(c));
    terminal.log(toString(n));
}`}
      </Code>
      <Code lang="text">
        {`2147483647
3.14
0.5
-5`}
      </Code>
      <H3 title="O sinal de menos" />
      <P>
        O {mono('-')} é sempre um token separado, que também funciona como operador unário. Por isso {mono('-5')} é o
        operador {mono('-')} aplicado ao literal {mono('5')}. Isso tem uma consequência: o menor {mono('int')},
        -2147483648, não pode ser escrito como literal, porque o {mono('2147483648')} sozinho já passa do limite (L6).
      </P>
      <Code lang="flux">
        {`func main () {
    var n:int = -2147483648;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 18]:
Número inteiro fora do intervalo: '2147483648'`}
      </Code>
      <H3 title="Números malformados" />
      <P>
        Um número, inteiro ou real, seguido de letra, e um ponto sem dígitos depois dele, são o erro léxico L5. O
        compilador não tenta adivinhar: aponta o trecho inteiro.
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
      <Table
        head={['Escrito', 'Por que é malformado', 'Mensagem']}
        rows={[
          [mono('5.'), 'Falta o dígito depois do ponto', mono("Número malformado: '5.'")],
          [mono('1e10'), 'Sem notação científica', mono("Número malformado: '1e10'")],
          [mono('0xFF'), 'Sem hexadecimal', mono("Número malformado: '0xFF'")],
          [mono('3.14abc'), 'Letras coladas ao número', mono("Número malformado: '3.14abc'")],
          [mono('2itens'), 'Nome começando com dígito', mono("Número malformado: '2itens'")],
        ]}
      />
      <P>
        O {mono('.5')}, sem dígito antes do ponto, não é um erro léxico: o analisador léxico entrega um {mono('.')} e
        um {mono('5')}, e quem o rejeita é a análise sintática.
      </P>
      <Code lang="flux">
        {`func main () {
    var a = .5;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 13]:
Token encontrado: '.'
Esperado: expressão, 'call' ou 'run'`}
      </Code>
      <H3 title="Inteiro fora do intervalo" />
      <P>
        Um literal inteiro acima de 2147483647 é o erro L6.
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
      <H2 title="Textos e escapes" />
      <P>
        Um texto ({mono('string')}) é escrito entre aspas duplas, numa única linha. As aspas simples não existem na
        linguagem. Dentro do texto valem quatro escapes:
      </P>
      <Table
        head={['Escape', 'Significado']}
        rows={[
          [mono('\\n'), 'Quebra de linha'],
          [mono('\\t'), 'Tabulação'],
          [mono('\\"'), 'Aspas duplas'],
          [mono('\\\\'), 'Uma barra invertida'],
        ]}
      />
      <Code lang="flux" example>
        {`func main () {
    terminal.log("tab:\\tfim");
    terminal.log("aspas: \\"oi\\"");
    terminal.log("barra: \\\\");
    terminal.log("linha1\\nlinha2");
}`}
      </Code>
      <Code lang="text">
        {`tab:	fim
aspas: "oi"
barra: \\
linha1
linha2`}
      </Code>
      <P>
        Letras acentuadas são aceitas dentro de textos e de comentários ({mono('"Olá"')}); fora deles, são o erro L1.
      </P>
      <H3 title="Escape inválido" />
      <P>
        Qualquer outra barra invertida, como a de um caminho do Windows, é o erro L3. A mensagem aponta a barra:
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
      <H3 title="Texto que não fecha" />
      <P>
        O texto não pode continuar na linha seguinte. Se a linha acabar antes da aspa de fechamento, é o erro L2,
        apontando a aspa que abriu o texto:
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
      <P>
        Por isso um texto escrito em duas linhas gera dois erros: a aspa final da segunda linha abre um texto novo,
        que também não fecha.
      </P>
      <Code lang="flux">
        {`func main () {
    terminal.log("linha 1
    linha 2");
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 18]:
String não terminada
Erro léxico [linha 3, coluna 12]:
String não terminada`}
      </Code>
      <H3 title="Aspas simples" />
      <P>
        Não há aspas simples nem tipo de caractere: cada aspa simples é o erro L1.
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
      <H2 title="Comentários" />
      <P>
        Há dois tipos, e nenhum muda o programa. O comentário de linha começa em {mono('//')} e vai até o fim da
        linha. O comentário de bloco fica entre {mono('/*')} e {mono('*/')} e pode ocupar várias linhas.
      </P>
      <Code lang="flux" example>
        {`func main () {
    // um comentário de linha
    /* um comentário
       de bloco */
    terminal.log("ok"); // depois do código
}`}
      </Code>
      <Code lang="text">
        {`ok`}
      </Code>
      <P>
        Os comentários de bloco não se aninham: o primeiro {mono('*/')} fecha o comentário, e o resto do texto volta a
        ser código.
      </P>
      <Code lang="flux">
        {`func main () {
    /* a /* b */ c */
    var x = 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 21]:
Token encontrado: '/'
Esperado: expressão`}
      </Code>
      <P>
        Um comentário de bloco que nunca fecha é o erro L4, e a mensagem aponta onde ele abriu:
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
      <H2 title="O maior casamento" />
      <P>
        Quando duas leituras são possíveis, o analisador léxico escolhe sempre o token mais longo. Isso atinge a
        declaração de uma lista logo antes do {mono('=')}: em {mono('list<int>=')}, o {mono('>=')} (maior ou igual) é
        mais longo que o {mono('>')}, e o compilador o entende como operador, não como o fim do tipo.
      </P>
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
      <P>
        A correção é um espaço antes do {mono('=')}:
      </P>
      <Code lang="flux" example>
        {`func main () {
    var l:list<int> = [1, 2];
    terminal.log(toString(l));
}`}
      </Code>
      <Code lang="text">
        {`[1, 2]`}
      </Code>
      <P>
        Já {mono('list<list<int>>')} funciona, porque {mono('>>')} não é um operador da linguagem e o analisador
        léxico devolve dois {mono('>')} separados.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var l:list<list<int>> = [[1], [2, 3]];
    terminal.log(toString(l));
}`}
      </Code>
      <Code lang="text">
        {`[[1], [2, 3]]`}
      </Code>
      <P>
        Os operadores de dois caracteres são {mono('==')}, {mono('!=')}, {mono('<=')}, {mono('>=')}, {mono('&&')} e {mono('||')}.
        Os símbolos {mono('&')} e {mono('|')} sozinhos não existem e são o erro L1:
      </P>
      <Code lang="flux">
        {`func main () {
    var a = true | false;
}`}
      </Code>
      <Code lang="text">
        {`Erro léxico [linha 2, coluna 18]:
Caractere não reconhecido: '|'`}
      </Code>
      <H2 title="Espaços, quebras de linha e ponto e vírgula" />
      <P>
        Espaços, tabulações e quebras de linha são ignorados fora de textos e comentários: onde cabe um espaço, cabem
        vários, e o programa pode ser escrito numa linha só.
      </P>
      <Code lang="flux" example>
        {`func main () { var a = 1; terminal.log(toString(a)); }`}
      </Code>
      <Code lang="text">
        {`1`}
      </Code>
      <P>
        As instruções simples terminam com {mono(';')}: declarações, atribuições, chamadas, {mono('return')}, {mono('break')}, {mono('continue')}, {mono('stop if')}, {mono('abort if')} e {mono('proceed if')}.
        Os blocos ({mono('if')}, {mono('while')}, {mono('for')}, {mono('func')} e {mono('workflow')}) não levam {mono(';')} depois
        da chave final.
      </P>
      <H2 title="Posição dos erros léxicos" />
      <P>
        Todo erro léxico informa a linha e a coluna em {mono('Erro léxico [linha L, coluna C]:')}. A posição é o
        início do trecho lido, com duas exceções: o L2 e o L4 apontam onde o texto ou o comentário abriu (a aspa ou o {mono('/*')}),
        e o L3 aponta para a barra do escape inválido. As colunas contam caracteres, e uma tabulação conta como uma
        coluna.
      </P>
      <P>
        Depois de um erro léxico, o compilador descarta o trecho inválido e continua a leitura, então um programa pode
        mostrar vários erros léxicos de uma vez. Como o programa só passa para a análise sintática quando o texto é
        todo válido, os erros de estrutura aparecem depois de corrigidos os léxicos. A recuperação está descrita em <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.
      </P>
      <H2 title="Resumo dos erros léxicos" />
      <Table
        head={['Código', 'Causa', 'Mensagem']}
        rows={[
          ['L1', 'Caractere que não pertence à linguagem', mono("Caractere não reconhecido: '@'")],
          ['L2', 'Texto sem aspa de fechamento na linha', mono("String não terminada")],
          [
            'L3',
            <>Escape diferente de {mono('\\n')}, {mono('\\t')}, {mono('\\"')} e {mono('\\\\')}</>,
            mono("Sequência de escape inválida: '\\p'"),
          ],
          ['L4', <>Comentário {mono('/*')} sem {mono('*/')}</>, mono("Comentário de bloco não terminado")],
          ['L5', <>Número seguido de letra, ou {mono('5.')}</>, mono("Número malformado: '2itens'")],
          ['L6', 'Inteiro acima de 2147483647', mono("Número inteiro fora do intervalo: '99999999999'")],
        ]}
      />
      <P>
        Cada código tem a sua seção, com exemplo e saída completa, no <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.
      </P>
    </>
  )
}
