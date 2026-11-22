import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

function LexerCall() {
  const boxes = [
    { x: 10, y: 55, w: 150, title: 'casa o padrão', line1: 'o prefixo mais longo;', line2: 'empate: a regra de cima' },
    { x: 200, y: 55, w: 170, title: 'YY_USER_ACTION', line1: 'yylloc, yylval = NULL,', line2: 'avança line e column' },
  ]
  const outs = [
    { y: 8, title: 'ignora', line1: 'espaço e comentário:', line2: 'lê o próximo lexema' },
    { y: 78, title: 'RET(T)', line1: 'folha, registro JSON,', line2: 'return T' },
    { y: 148, title: 'report_error', line1: 'mensagem, sem folha,', line2: 'return YYerror' },
  ]
  return (
    <svg viewBox="0 0 720 220" width="720" height="220" className="block max-w-none">
      <defs>
        <marker id="seta-lexico" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted" />
        </marker>
      </defs>
      {boxes.map((b) => (
        <g key={b.title}>
          <rect x={b.x} y={b.y} width={b.w} height="64" rx="6" strokeWidth="1.25" className="fill-bg stroke-line" />
          <text x={b.x + b.w / 2} y={b.y + 22} fontSize="12" fontWeight="600" fontFamily="monospace" textAnchor="middle" className="fill-ink">
            {b.title}
          </text>
          <text x={b.x + b.w / 2} y={b.y + 40} fontSize="11" textAnchor="middle" className="fill-muted">
            {b.line1}
          </text>
          <text x={b.x + b.w / 2} y={b.y + 54} fontSize="11" textAnchor="middle" className="fill-muted">
            {b.line2}
          </text>
        </g>
      ))}
      <path d="M 160 87 L 198 87" fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-lexico)" />
      {outs.map((o) => (
        <g key={o.title}>
          <path d={`M 370 87 C 410 87 410 ${o.y + 32} 448 ${o.y + 32}`} fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-lexico)" />
          <rect x="450" y={o.y} width="260" height="64" rx="6" strokeWidth="1.25" className="fill-bg stroke-accent" />
          <text x="580" y={o.y + 22} fontSize="12" fontWeight="600" fontFamily="monospace" textAnchor="middle" className="fill-ink">
            {o.title}
          </text>
          <text x="580" y={o.y + 40} fontSize="11" textAnchor="middle" className="fill-muted">
            {o.line1}
          </text>
          <text x="580" y={o.y + 54} fontSize="11" textAnchor="middle" className="fill-muted">
            {o.line2}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function Lexico() {
  return (
    <>
      <H2 title="O papel do léxico" />
      <P>
        O analisador léxico transforma o texto do programa numa sequência de tokens. Ele está em {mono('src/frontend/lexer.l')},
        uma especificação do Flex: o Flex lê o arquivo e gera {mono('build/lex.yy.c')}, que contém a função {mono('yylex')}.
        Cada chamada de {mono('yylex')} lê o próximo lexema do texto e devolve um número inteiro, o código do token. O
        parser ({mono('yyparse')}) chama {mono('yylex')} sempre que precisa do próximo token; a opção {mono('-t')} do{' '}
        {mono('./flux')} chama {mono('yylex')} num laço, sem parser (ver{' '}
        <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>).
      </P>
      <P>
        Junto com o código do token, {mono('yylex')} deixa duas coisas em variáveis globais que o parser lê:{' '}
        {mono('yylval.node')}, uma folha da árvore de derivação com o nome do token, o lexema e a posição, e{' '}
        {mono('yylloc')}, a posição do lexema (linha e coluna de onde ele começa). O código devolvido é 0 no fim do
        arquivo (o {mono('$end')} do Bison), o próprio código do token quando há um token, e {mono('YYerror')} (256)
        quando o lexema é um erro léxico.
      </P>
      <Diagram
        title="O que acontece em cada chamada de yylex"
        label="Fluxo de uma chamada de yylex: o Flex casa o padrão mais longo, executa YY_USER_ACTION, que atualiza a posição, e depois a ação do padrão faz uma de três coisas: ignora o lexema e lê o próximo, devolve um token com RET, ou reporta um erro léxico e devolve YYerror."
      >
        <LexerCall />
      </Diagram>

      <H2 title="Estrutura do arquivo" />
      <P>
        Um arquivo do Flex tem três partes separadas por linhas com {mono('%%')}. Aqui:
      </P>
      <Table
        head={['Parte', 'Conteúdo em lexer.l']}
        rows={[
          [
            'Definições (antes do primeiro %%)',
            <>
              O bloco {mono('%{ ... %}')}, copiado sem mudança para {mono('lex.yy.c')}: os {mono('#include')}s
              (entre eles {mono('parser.tab.h')}, que traz os códigos dos tokens e o tipo de {mono('yylloc')}), as variáveis {mono('line')},{' '}
              {mono('column')}, {mono('comment_line')} e {mono('comment_column')}, e as macros {mono('RET')} e{' '}
              {mono('YY_USER_ACTION')}. Depois, {mono('%option noyywrap nounput noinput')} (sem {mono('yywrap')}: o fim
              do arquivo encerra a leitura; sem {mono('yyunput')} e {mono('yyinput')}, que o lexer não usa), a condição
              de início exclusiva {mono('%x COMMENT')} e os padrões com nome {mono('DIG')}, {mono('LETTER')},{' '}
              {mono('ID')} e {mono('UTF8')}.
            </>,
          ],
          [
            'Regras (entre os dois %%)',
            <>
              Pares {mono('padrão { ação }')}. A ordem importa, ver "Como o Flex escolhe a regra".
            </>,
          ],
          [
            'Código C (depois do segundo %%)',
            <>
              As funções {mono('next')}, {mono('count_chars')} e {mono('source_lines')}, copiadas para o fim de{' '}
              {mono('lex.yy.c')}.
            </>,
          ],
        ]}
      />
      <Table
        head={['Nome', 'Tipo e valor inicial', 'Papel']}
        rows={[
          [mono('line'), <>{mono('static int')}, 1</>, 'Linha do próximo caractere a ser lido (começa em 1).'],
          [mono('column'), <>{mono('static int')}, 1</>, 'Coluna do próximo caractere, contada em caracteres e não em bytes (começa em 1).'],
          [mono('comment_line'), <>{mono('static int')}</>, <>Linha onde o comentário de bloco aberto começou (para o erro L4).</>],
          [mono('comment_column'), <>{mono('static int')}</>, <>Coluna onde o comentário de bloco aberto começou.</>],
          [mono('COMMENT'), <>condição de início exclusiva</>, <>Estado do lexer dentro de um comentário de bloco: só as três regras de {mono('<COMMENT>')} valem.</>],
          [mono('DIG'), mono('[0-9]'), 'Um dígito.'],
          [mono('LETTER'), mono('[A-Za-z_]'), 'Uma letra ASCII ou o sublinhado.'],
          [mono('ID'), mono('{LETTER}({LETTER}|{DIG})*'), 'Um identificador.'],
          [mono('UTF8'), <>os três formatos de sequência UTF-8 de 2, 3 e 4 bytes</>, <>Um caractere UTF-8 válido além do ASCII; só é usado na regra do erro L1.</>],
        ]}
      />

      <H2 title="Posição: YY_USER_ACTION, next e count_chars" />
      <P>
        O lexer controla a linha e a coluna por conta própria, em vez de usar a contagem pronta do Flex. O Flex executa a
        macro {mono('YY_USER_ACTION')} antes da ação de toda regra que casa um lexema, e é ali que a posição é gravada:
      </P>
      <Code lang="c">
        {String.raw`#define YY_USER_ACTION                                  \
    yylloc.first_line = yylloc.last_line = line;       \
    yylloc.first_column = column;                       \
    yylval.node = NULL;                                      \
    next(yytext, yyleng);`}
      </Code>
      <P>
        A ordem dos passos é o que faz a conta certa: primeiro {mono('yylloc')} recebe a linha e a coluna atuais
        (o início do lexema), depois {mono('yylval.node')} é zerado, e só então {mono('next')} anda pelos bytes do
        lexema e avança {mono('line')} e {mono('column')} para o lexema seguinte. Só o início é guardado: o campo{' '}
        {mono('last_line')} recebe a mesma linha do início (mesmo num comentário de várias linhas) e{' '}
        {mono('last_column')} nunca é escrito. O parser e as mensagens de erro usam só {mono('first_line')} e{' '}
        {mono('first_column')}.
      </P>
      <Fn name="YY_USER_ACTION" signature="#define YY_USER_ACTION">
        Macro que o Flex insere no começo da ação de cada regra. Grava o início do lexema em {mono('yylloc')}, zera{' '}
        {mono('yylval.node')} (todo lexema que não é devolvido como token, como espaços, comentários e erros, deixa o
        valor semântico nulo) e chama {mono('next')} com o texto do lexema. Roda também para os pedaços de um comentário
        de bloco, por isso as linhas dentro dele são contadas. Não roda nas duas regras {mono('<<EOF>>')}: o Flex
        trata o fim do arquivo à parte, e por isso a regra do fim do arquivo grava a posição sozinha.
      </Fn>
      <Fn name="next" signature="static void next(const char *s, int n)">
        Avança a posição pelos {mono('n')} bytes de {mono('s')}. Para cada byte: se é {mono("'\\n'")}, incrementa{' '}
        {mono('line')} e volta {mono('column')} para 1; se não é um byte de continuação do UTF-8 (os que têm os dois
        bits altos {mono('10')}), incrementa {mono('column')}. Chamada só por {mono('YY_USER_ACTION')}. Consequência:
        a coluna conta caracteres, então {mono('ç')} vale uma coluna e não duas; uma tabulação e o {mono("'\\r'")} de um
        fim de linha do Windows também valem uma coluna cada; e um byte solto que não forma UTF-8 válido (um arquivo
        em Latin-1) também vale uma.
      </Fn>
      <Fn name="count_chars" signature="static int count_chars(const char *s, int n)">
        Conta quantos caracteres UTF-8 há nos primeiros {mono('n')} bytes de {mono('s')} (os bytes que não são de
        continuação). Só a regra das strings a usa, para achar a coluna da barra de um escape inválido dentro de uma
        string com acentos.
      </Fn>
      <Fn name="source_lines" signature="int source_lines(void)">
        Devolve o número de linhas do programa lido, para o campo {mono('lines')} do {mono('--json')} (chamada por{' '}
        {mono('main')}, depois do parse). Vale 0 para um arquivo vazio; se o texto termina em {mono("'\\n'")}, vale{' '}
        {mono('line - 1')}; senão vale {mono('line')}. Declarada em {mono('fluxc.h')}.
      </Fn>
      <Why>
        {mono('source_lines')} é chamada depois de ler tudo: nesse momento {mono('line')} é a linha onde a entrada
        terminou. Se o código acaba em {mono("'\\n'")}, o fim está na coluna 1 de uma linha que não tem nada, e essa
        linha não deve ser contada. Medido: arquivo vazio dá 0, {mono('a')} dá 1, {mono('a')} seguido de uma quebra
        dá 1 e {mono('a')} seguido de duas quebras dá 2.
      </Why>

      <H2 title="Tokens: a macro RET e os nomes" />
      <Code lang="c">
        {String.raw`#define RET(t) do { \
    yylval.node = token_node(#t, yytext, yylloc.first_line, yylloc.first_column); \
    json_record_token(#t, yytext, yylloc.first_line, yylloc.first_column); \
    return t; \
} while (0)`}
      </Code>
      <Fn name="RET" signature="#define RET(t)">
        Termina a ação de uma regra que produz um token {mono('t')} (um dos nomes de {mono('%token')} do parser). Faz três
        coisas, nesta ordem: cria a folha da árvore com {mono('token_node')}, usando como nome o texto do próprio
        argumento (o {mono('#t')} do pré-processador, então {mono('RET(VAR)')} dá a folha de nome {mono('"VAR"')}) e o
        lexema em {mono('yytext')} na posição de {mono('yylloc')}; registra o token para o {mono('--json')} com{' '}
        {mono('json_record_token')} (que não faz nada se o {mono('--json')} não foi pedido); e devolve o código do token.
        Todo token legítimo passa por aqui, e só eles: espaços, comentários e erros léxicos não geram folha nem registro.
      </Fn>
      <Why>
        A folha criada por {mono('RET')} vai em {mono('yylval.node')} e é o valor semântico do token no parser: é ela que
        vira folha da árvore de derivação quando a regra do parser empilha os filhos. O nome é o do token na BNF porque{' '}
        {mono('#t')} usa o mesmo identificador do {mono('%token')}, sem tabela de tradução. Os detalhes do nó estão em{' '}
        <PageLink to="compilador/arvore-json">Árvore e JSON</PageLink>.
      </Why>

      <H2 title="Como o Flex escolhe a regra" />
      <P>
        Em cada posição, o Flex escolhe a regra cujo padrão casa o texto mais longo; se duas regras casam o mesmo
        comprimento, vence a que aparece primeiro no arquivo. Por isso a ordem das regras de {mono('lexer.l')} é
        parte do comportamento:
      </P>
      <Table
        head={['Ordem', 'Regras', 'Por que nesta posição']}
        rows={[
          ['1', 'Espaços, comentário de linha, abertura de comentário de bloco, as três regras de COMMENT', 'Descartam texto antes de qualquer outra coisa.'],
          ['2', 'Palavras reservadas, palavras de tipo, true, false, null', <>Antes de {mono('{ID}')}: {mono('while')} casa tanto a palavra reservada quanto o identificador, com o mesmo comprimento, e vence a regra de cima.</>],
          ['3', 'Números (float, inteiro, malformado)', <>Os malformados são mais longos que o inteiro quando há ponto ou letra depois dos dígitos, e por isso vencem.</>],
          ['4', 'Strings (fechada e não terminada)', 'A fechada é mais longa quando há a segunda aspa; a não terminada é a que sobra.'],
          ['5', 'Operadores e pontuação', <>Cada operador de dois caracteres ({mono('==')}, {mono('<=')}...) é mais longo que o de um e vence pelo comprimento.</>],
          ['6', 'IDENTIFIER', 'Depois das palavras reservadas.'],
          ['7', <>{mono('<<EOF>>')}</>, 'Fim do arquivo.'],
          ['8', 'Erros L1: caractere não reconhecido (UTF-8 ou ASCII visível; e o resto)', <>As últimas, para pegar só o que nenhuma outra aceita: um {mono('a')} sozinho casa {mono('{ID}')} e a regra de L1 com o mesmo comprimento, e vence {mono('{ID}')}, que está acima.</>],
        ]}
      />

      <H2 title="Os tokens" />
      <P>
        O lexer produz 56 tokens, exatamente os de {mono('%token')} do parser. Os nomes e a escrita no programa:
      </P>
      <Table
        head={['Grupo', 'Tokens (nome: escrita)']}
        rows={[
          ['Palavras reservadas (18)', <>{mono('VAR var, CONST const, FUNC func, WORKFLOW workflow, MAIN main, RETURN return, IF if, ELSE else, WHILE while, FOR for, IN in, BREAK break, CONTINUE continue, CALL call, RUN run, STOP stop, ABORT abort, PROCEED proceed')}</>],
          ['Palavras de tipo (6)', <>{mono('TYPE_INT int, TYPE_FLOAT float, TYPE_STRING string, TYPE_BOOL bool, TYPE_OBJECT object, TYPE_LIST list')}</>],
          ['Literais fixos (3)', <>{mono('TRUE true, FALSE false, NULL_LITERAL null')}</>],
          ['Literais com valor (3)', <>{mono('INT_LITERAL, FLOAT_LITERAL, STRING_LITERAL')}</>],
          ['Identificador (1)', mono('IDENTIFIER')],
          ['Operadores (15)', <>{mono('ASSIGN =, EQUAL ==, NOT_EQUAL !=, LOWER_THAN <, LOWER_THAN_EQUAL <=, GREATER_THAN >, GREATER_THAN_EQUAL >=, PLUS +, MINUS -, MUL *, DIV /, MOD %, AND &&, OR ||, NOT !')}</>],
          ['Pontuação (10)', <>{mono('LPAREN (, RPAREN ), LBRACE {, RBRACE }, LBRACKET [, RBRACKET ], COMMA ,, COLON :, SEMICOLON ;, DOT .')}</>],
        ]}
      />
      <H3 title="Palavras reservadas e identificadores" />
      <P>
        Uma palavra reservada só é reconhecida quando o lexema inteiro é a palavra: {mono('iffy')} é um identificador,
        porque o padrão do identificador casa quatro letras e o de {mono('if')} só duas. {mono('main')} é uma palavra
        reservada ({mono('MAIN')}), e por isso não pode ser nome de variável. Os nomes da biblioteca ({mono('terminal')},{' '}
        {mono('log')}, {mono('length')}, {mono('command')}...) não são reservados: são identificadores comuns.
      </P>
      <Code lang="text">
        {`$ cat k.flux
iffy if main mainx
$ ./flux -t k.flux
1:1	IDENTIFIER           iffy
1:6	IF
1:9	MAIN
1:14	IDENTIFIER           mainx`}
      </Code>

      <H2 title="Números" />
      <P>
        Um inteiro são dígitos; um real são dígitos, um ponto e dígitos. As regras, em ordem:
      </P>
      <Table
        head={['Padrão', 'Resultado']}
        rows={[
          [mono('{DIG}+"."{DIG}+'), <>{mono('FLOAT_LITERAL')} (3.5)</>],
          [mono('{DIG}+'), <>Converte com {mono('strtol')}; se estourou o {mono('long')} (erro {mono('ERANGE')}) ou passa de {mono('INT_MAX')} (2147483647), é o erro L6; senão é {mono('INT_LITERAL')}.</>],
          [<>{mono('{DIG}+"."')}, {mono('{DIG}+{LETTER}...')} e {mono('{DIG}+"."{DIG}+{LETTER}...')}</>, <>Três padrões numa só ação: o erro L5, número malformado. O lexema inteiro, até onde o padrão alcança, é o texto da mensagem.</>],
        ]}
      />
      <P>
        Medido com {mono('-t')}: {mono('5.')}, {mono('2itens')}, {mono('3.14abc')}, {mono('1e10')} e {mono('0xFF')} dão{' '}
        {mono('Número malformado')} com o lexema inteiro; {mono('99999999999')} e {mono('2147483648')} dão{' '}
        {mono('Número inteiro fora do intervalo')}; {mono('2147483647')} é aceito. O ponto sozinho seguido de dígitos não
        é erro léxico: {mono('.5')} vira {mono('DOT')} e {mono('INT_LITERAL')}, e é o parser que o rejeita. Como o{' '}
        {mono('-')} é um operador à parte, {mono('-2147483648')} é {mono('MINUS')} seguido do inteiro 2147483648, que
        cai em L6.
      </P>

      <H2 title="Strings e escapes" />
      <P>
        Uma string é aspas, zero ou mais caracteres e aspas, na mesma linha. Dentro dela, qualquer byte vale (os acentos
        passam inteiros) menos aspas, barra invertida e quebra de linha; a barra invertida precisa ser seguida de algum
        caractere. São duas regras:
      </P>
      <Code lang="text">
        {String.raw`\"([^"\\\n]|\\[^\n])*\"       string fechada: confere os escapes na ação
\"([^"\\\n]|\\[^\n])*\\?       string que não fechou: erro L2`}
      </Code>
      <P>
        A regra da string fechada só confere o formato; a ação então percorre o lexema à procura de uma barra invertida e
        aceita apenas {mono('\\n')}, {mono('\\t')}, {mono('\\"')} e {mono('\\\\')}. Se a barra é seguida de outra coisa,
        é o erro L3: a mensagem mostra a barra e o caractere seguinte (incluindo os bytes extras, se ele for UTF-8) e a
        posição é a da barra, calculada como a coluna do início da string mais {mono('count_chars')} dos bytes até a
        barra. A segunda regra, que casa a string sem a aspa final (e uma barra invertida solta no fim da linha), é o erro
        L2 e aponta para a aspa que abriu.
      </P>
      <P>Medido (posições conferidas, colunas contam caracteres):</P>
      <Code lang="text">
        {String.raw`$ cat s.flux
"ação" "çç\q"
$ ./flux -t s.flux
1:1	STRING_LITERAL       "ação"
Erro léxico [linha 1, coluna 11]:
Sequência de escape inválida: '\q'`}
      </Code>

      <H2 title="Comentários" />
      <P>
        O comentário de linha é uma regra de uma linha, {mono('"//"[^\\n]*')}, que ignora tudo até o fim da linha. O de
        bloco usa a condição de início exclusiva {mono('COMMENT')}:
      </P>
      <Code lang="text">
        {String.raw`"/*" {
    comment_line = yylloc.first_line;
    comment_column = yylloc.first_column;
    BEGIN(COMMENT);
}
<COMMENT>"*/"       { BEGIN(INITIAL); }
<COMMENT>[^*]+|"*"  { }
<COMMENT><<EOF>> {
    report_error("léxico", comment_line, comment_column,
                 "Comentário de bloco não terminado");
    BEGIN(INITIAL);
    return YYerror;
}`}
      </Code>
      <P>
        A abertura {mono('/*')} guarda onde o comentário começou e entra em {mono('COMMENT')}. Como a condição é exclusiva,
        nenhuma regra fora dela vale lá dentro: palavras, aspas e símbolos são só texto do comentário. Lá dentro, a regra
        de um asterisco isolado ou de qualquer sequência sem asterisco consome o conteúdo, e {mono('*/')} fecha. Não existe
        aninhamento: o primeiro {mono('*/')} fecha o comentário, e o texto {mono('/* a /* b */ c */')} produz o
        identificador {mono('c')} seguido de {mono('MUL')} e {mono('DIV')} (conferido com {mono('-t')}). O fim do arquivo dentro de um comentário é o erro L4,
        com a posição da abertura (e não a do fim do arquivo).
      </P>
      <Callout kind="nota">
        {mono('lexer.l')} contém os textos {mono('"//"')} e {mono('"/*"')} como padrões do Flex. Eles são código, não comentário: ao
        mexer no arquivo (ou em qualquer ferramenta que remova comentários), confira que continuam lá.
      </Callout>

      <H2 title="Operadores, pontuação e o casamento mais longo" />
      <P>
        Cada operador e cada sinal de pontuação tem uma regra de texto fixo. Como o Flex fica sempre com o casamento mais
        longo, dois caracteres seguidos que formam um operador de dois caracteres são lidos como ele. A consequência
        que aparece nos programas é o tipo de lista seguido de igual:
      </P>
      <Code lang="text">
        {`$ cat b.flux
var l:list<int>= [1];
$ ./flux -t b.flux
1:1	VAR
1:5	IDENTIFIER           l
1:6	COLON
1:7	TYPE_LIST
1:11	LOWER_THAN
1:12	TYPE_INT
1:15	GREATER_THAN_EQUAL
1:18	LBRACKET
1:19	INT_LITERAL          1
1:20	RBRACKET
1:21	SEMICOLON
$ ./flux b.flux
Erro sintático [linha 1, coluna 15]:
Token encontrado: '>='
Esperado: '>'
Erro sintático [linha 2, coluna 1]:
Token encontrado: fim do arquivo
Esperado: 'var', 'const', 'func' ou 'workflow'
Programa rejeitado.`}
      </Code>
      <P>
        Escreva {mono('list<int> = [1]')}, com espaço. O contrário também vale: {mono('>>')} não é um operador, então{' '}
        {mono('list<list<int>>')} dá dois {mono('GREATER_THAN')} e funciona. Os caracteres {mono('&')} e {mono('|')} só
        existem em {mono('&&')} e {mono('||')}; sozinhos são o erro L1.
      </P>

      <H2 title="Fim do arquivo e caracteres não reconhecidos" />
      <Fn name="regra do fim do arquivo" signature="<<EOF>> { ... return 0; }">
        Grava em {mono('yylloc')} a linha e a coluna onde a entrada acabou (o Flex não executa {mono('YY_USER_ACTION')} para
        esta regra) e devolve 0. É a posição que o parser usa na mensagem {mono('Token encontrado: fim do arquivo')}. O fim
        do arquivo dentro de um comentário de bloco não passa por aqui: tem a regra própria de {mono('COMMENT')}.
      </Fn>
      <P>
        As duas últimas regras são o erro L1. A primeira casa um caractere UTF-8 válido de 2, 3 ou 4 bytes ou um caractere
        ASCII visível (de {mono('!')} a {mono('~')}) e mostra o próprio caractere: {mono("Caractere não reconhecido: '@'")},{' '}
        {mono("'ç'")}. A última, um ponto (qualquer byte restante), pega o que não é texto: caracteres de controle como o
        avanço de página, e bytes que não formam UTF-8 (um arquivo em Latin-1); a mensagem mostra o código do byte, como
        em {mono('Caractere não reconhecido: código 231')}. Letras com acento fora de strings e comentários são o caso
        mais comum: {mono('ação')} dá um erro para {mono('ç')} e outro para {mono('ã')}, com o {mono('a')} e o{' '}
        {mono('o')} lidos como identificadores soltos.
      </P>

      <H2 title="Os erros léxicos L1 a L6" />
      <Table
        head={['Código', 'Erro', 'Onde nasce', 'Posição da mensagem', 'Texto da mensagem']}
        rows={[
          ['L1', 'Caractere não reconhecido', 'As duas últimas regras', 'O caractere', <>{mono("Caractere não reconhecido: '@'")} ou {mono('... código 231')}</>],
          ['L2', 'String não terminada', 'A regra da string sem aspa final', 'A aspa que abriu', mono('String não terminada')],
          ['L3', 'Escape inválido', 'Ação da string fechada', 'A barra invertida', mono("Sequência de escape inválida: '\\q'")],
          ['L4', 'Comentário de bloco não terminado', 'Fim do arquivo em COMMENT', 'O /* que abriu', mono('Comentário de bloco não terminado')],
          ['L5', 'Número malformado', 'Os três padrões malformados', 'O início do número', mono("Número malformado: '2itens'")],
          ['L6', 'Inteiro fora do intervalo', 'Ação do inteiro', 'O início do número', mono("Número inteiro fora do intervalo: '99999999999'")],
        ]}
      />
      <H3 title="Como o erro chega ao parser" />
      <P>
        Todo erro léxico faz as mesmas duas coisas: chama {mono('report_error')} com a classe {mono('"léxico"')}, a posição
        e a mensagem (formato e contagem em <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>), e
        devolve {mono('YYerror')} em vez de um token. O texto do lexema já foi consumido pelo Flex, então a leitura
        continua logo depois dele. Nenhuma folha é criada e o token não entra no {mono('--json')}.
      </P>
      <Why>
        O parser trata {mono('YYerror')} como um erro já reportado: o Bison vai direto para a recuperação, sem chamar{' '}
        {mono('yyreport_syntax_error')}, então não há uma segunda mensagem para o mesmo problema. Ver{' '}
        <PageLink to="compilador/modo-panico">Modo pânico</PageLink>. No modo {mono('-t')} (sem parser), {mono('list_tokens')} só
        pula esses valores e segue lendo: o resultado mostra todos os tokens e todos os erros léxicos do arquivo, e o
        código de saída é 1.
      </Why>
      <Code lang="text">
        {`$ cat e5.flux
x = 5. + 2itens;
$ ./flux -t e5.flux
1:1	IDENTIFIER           x
1:3	ASSIGN
Erro léxico [linha 1, coluna 5]:
Número malformado: '5.'
1:8	PLUS
Erro léxico [linha 1, coluna 10]:
Número malformado: '2itens'
1:16	SEMICOLON
$ echo $?
1`}
      </Code>

      <H2 title="Os tokens no -t e no --json" />
      <P>
        Os dois modos leem os mesmos tokens, de caminhos diferentes. O {mono('-t')} ({mono('list_tokens')} em {mono('main.c')})
        chama {mono('yylex')} até o código 0 e imprime a posição, o nome do token (por {mono('token_name')}, definida no
        parser) e, só para identificadores e literais, o texto. O {mono('--json')} liga {mono('json_enable')} antes do
        parse; {mono('RET')} registra cada token por {mono('json_record_token')}, e o JSON leva a posição, o nome e o texto
        de todos os tokens (inclusive o de palavras reservadas e de símbolos). Os erros entram pelo {mono('report_error')}.
        Espaços, comentários, erros e o fim do arquivo não são tokens do JSON.
      </P>
      <Code lang="text">
        {`$ cat j.flux
var a = 1;
$ ./flux --json j.flux
"tokens": [
  {"line":1,"column":1,"type":"VAR","text":"var"},
  {"line":1,"column":5,"type":"IDENTIFIER","text":"a"},
  {"line":1,"column":7,"type":"ASSIGN","text":"="},
  {"line":1,"column":9,"type":"INT_LITERAL","text":"1"},
  {"line":1,"column":10,"type":"SEMICOLON","text":";"}
],`}
      </Code>
      <Fn name="yylex" signature="int yylex(void)">
        Função gerada pelo Flex a partir das regras de {mono('lexer.l')}: lê o próximo lexema da entrada ({mono('yyin')},
        que {mono('main')} aponta para o arquivo ou para a entrada padrão) e devolve o código do token, 0 no fim do
        arquivo ou {mono('YYerror')}. Efeitos: atualiza {mono('yylloc')}, {mono('yylval.node')}, {mono('line')} e{' '}
        {mono('column')}, aloca a folha na arena, registra o token no JSON e pode imprimir um erro léxico. Declarada em{' '}
        {mono('fluxc.h')}; chamada pelo parser e por {mono('list_tokens')}. Os buffers internos são liberados por{' '}
        {mono('yylex_destroy')} no fim de {mono('main')}.
      </Fn>
      <P>
        O próximo estágio é o <PageLink to="compilador/parser">parser</PageLink>.
      </P>
    </>
  )
}
