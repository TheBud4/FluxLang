import { Callout, Code, Diagram, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

function RecoverySteps() {
  const steps = [
    { title: '1. Erro', l1: 'token inválido;', l2: 'imprime a mensagem' },
    { title: '2. Desempilha', l1: 'até um estado que', l2: 'aceita error' },
    { title: '3. Descarta', l1: 'tokens até a regra', l2: 'aceitar ; ou {' },
    { title: '4. Reduz', l1: 'a regra de erro,', l2: 'nó error, yyerrok' },
    { title: '5. Segue', l1: 'no próximo comando', l2: 'ou item global' },
  ]
  const w = 132
  const gap = 14
  return (
    <svg viewBox="0 0 730 110" width="730" height="110" className="block max-w-none">
      <defs>
        <marker id="seta-panico" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted" />
        </marker>
      </defs>
      {steps.map((s, i) => {
        const x = 10 + i * (w + gap)
        return (
          <g key={s.title}>
            <rect x={x} y="20" width={w} height="70" rx="6" strokeWidth="1.25" className="fill-bg stroke-line" />
            <text x={x + w / 2} y="44" fontSize="12" fontWeight="600" textAnchor="middle" className="fill-ink">
              {s.title}
            </text>
            <text x={x + w / 2} y="62" fontSize="10" textAnchor="middle" className="fill-muted">
              {s.l1}
            </text>
            <text x={x + w / 2} y="76" fontSize="10" textAnchor="middle" className="fill-muted">
              {s.l2}
            </text>
            {i < steps.length - 1 && (
              <path d={`M ${x + w} 55 L ${x + w + gap - 2} 55`} fill="none" strokeWidth="1.5" className="stroke-muted" markerEnd="url(#seta-panico)" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function ModoPanico() {
  return (
    <>
      <H2 title="O que é o modo pânico aqui" />
      <P>
        Quando o parser encontra um erro de sintaxe, ele não precisa parar: o modo pânico descarta o trecho que não faz sentido,
        volta a um ponto conhecido e segue lendo, para reportar também os erros que vêm depois. Sem ele, o compilador só mostraria
        o primeiro erro (era assim no Trabalho 1). A recuperação está inteira em {mono('src/frontend/parser.y')}, em cinco
        alternativas que usam o token especial {mono('error')} do Bison, mais o que o próprio Bison faz quando a sua pilha tem um
        estado que aceita esse token.
      </P>
      <P>
        É um modo pânico simples, decisão registrada no AGENTS.md. Ele não tenta adivinhar o que o programador queria: descarta até um
        ponto de sincronização fixo.
      </P>
      <Why>
        As alternativas com {mono('error')} são um ponto de recuperação por construção, como no código feito em sala (JavaCC), onde o
        {mono('try/catch')} marca a construção e o {mono('consumeUntil')} descarta tokens: aqui, a regra com {mono('error')} faz o papel do{' '}
        {mono('catch')}, e descartar tokens até o que a regra aceita faz o papel do {mono('consumeUntil')}. O parser continua em Bison
        porque o enunciado não exige um parser escrito à mão.
      </Why>
      <Diagram
        title="Os cinco passos de uma recuperação"
        label="Cinco caixas em sequência: o erro é detectado e a mensagem é impressa; o parser desempilha estados até um que aceita o token error; descarta tokens até um que a regra aceita, ponto e vírgula ou abre chaves; reduz a regra de erro, cria o nó error e chama yyerrok; segue no próximo comando ou item global."
      >
        <RecoverySteps />
      </Diagram>

      <H2 title="As cinco regras com error" />
      <Table
        head={['Regra', 'Onde recupera', 'Descarta até', 'Nó criado']}
        rows={[
          [mono('command: error SEMICOLON'), 'Num ponto onde um comando poderia começar (logo depois de { ou de outro comando)', <>um {mono(';')}, que é consumido</>, <>{mono('command')} com os filhos {mono('error')} e {mono('SEMICOLON')}</>],
          [mono('command: error block'), 'O mesmo ponto', <>um {mono('{')}, e lê o bloco {mono('{ ... }')} inteiro</>, <>{mono('command')} com os filhos {mono('error')} e {mono('block')}</>],
          [mono('global_no_func: error SEMICOLON'), 'No nível global, antes da main ou depois dela', <>um {mono(';')}</>, <>{mono('global_no_func')} com {mono('error')} e {mono('SEMICOLON')}</>],
          [mono('global_no_func: error block'), 'O mesmo ponto', <>um {mono('{')} e o bloco inteiro</>, <>{mono('global_no_func')} com {mono('error')} e {mono('block')}</>],
          [mono('after_func: MAIN error block after_main'), <>Dentro do cabeçalho de {mono('func main')} (depois de {mono('main')}), por exemplo {mono('func main (x:int) {')}</>, <>o {mono('{')} do corpo, que é lido como bloco; depois segue {mono('after_main')}</>, <>{mono('after_func')} com {mono('MAIN')}, {mono('error')}, {mono('block')} e {mono('after_main')}</>],
        ]}
      />
      <P>
        Todas as cinco ações chamam {mono('yyerrok')} depois de montar o nó. Um erro que não está em um desses pontos faz o Bison desempilhar até o mais próximo. Por exemplo, no cabeçalho de uma função comum,{' '}
        {mono('func f(a:) { }')} (erro no {mono(')')}), o Bison desempilha até o nível global, descarta o {mono(')')} e lê o {mono('{ }')} como bloco:
        a árvore tem um {mono('global_no_func')} com os filhos {mono('error')} (1:1) e {mono('block')}, e o {mono('func main')} seguinte é lido normalmente.
      </P>

      <H2 title="O que o Bison faz, passo a passo" />
      <H3 title="Quando o erro é detectado" />
      <P>
        O Bison guarda um contador de recuperação, {mono('yyerrstatus')}. Quando o token atual não serve e o contador é 0, ele
        chama {mono('yyreport_syntax_error')}, que imprime a mensagem (ver <PageLink to="compilador/parser">Parser</PageLink>), e
        põe o contador em 3. Se o contador já está acima de 0, o erro é ignorado em silêncio e só continua a recuperação.
      </P>
      <H3 title="Desempilhar, deslocar error, descartar" />
      <P>
        O Bison então desempilha estados e símbolos até achar um estado que sabe deslocar o token {mono('error')}: o começo de um
        comando, o começo de um item global ou o ponto logo depois de {mono('main')}. Os símbolos desempilhados somem, e o que já
        estava montado para eles nunca chega à árvore. Em seguida empilha {mono('error')} e olha o token em que o erro apareceu: se
        a regra aceita esse token (por exemplo, um {mono(';')} que era justamente o problema), a recuperação termina na hora; se não,
        o token é descartado, sem mensagem, e o próximo é lido. Isso repete até um token aceito. Se o fim do arquivo chega e a regra
        não o aceita, o Bison abandona o parse ({mono('yyparse')} devolve 1).
      </P>
      <Why>
        Os dois pontos de chegada são {mono(';')} e {mono('{')}. O {mono(';')} fecha o comando quebrado e deixa o parser no próximo. O{' '}
        {mono('{')} serve para os comandos que terminam em bloco: a regra {mono('error block')} lê o bloco inteiro, com as chaves
        balanceadas, o que evita erros em cascata. Sem isso, em {mono('else if (...) { }')} ou em {mono('if x > 5 { }')} o parser pararia no{' '}
        {mono('}')} do {mono('if')}, que fecharia o bloco da função, e tudo depois dele seria lido de forma errada.
      </Why>
      <Code lang="text">
        {`$ cat tests/sintatico/panico_chaves_balanceadas.flux
func main () {
if x > 5 { var a = 1; }
var b = 2;
}
$ ./flux tests/sintatico/panico_chaves_balanceadas.flux
Erro sintático [linha 2, coluna 4]:
Token encontrado: identificador 'x'
Esperado: '('
Programa rejeitado.`}
      </Code>
      <H3 title="yyerrok e a mensagem seguinte" />
      <Why>
        {mono('yyerrok')} volta a permitir mensagens. Sem ele, o Bison só reportaria o próximo erro depois de 3 tokens lidos com sucesso,
        e os erros próximos demais seriam engolidos. Medido numa cópia do compilador sem {mono('yyerrok')} (a original não foi mexida), para
        o programa abaixo:
      </Why>
      <Code lang="text">
        {`func main () {
    x = ;
    ;
}

com yyerrok (o compilador atual):
Erro sintático [linha 2, coluna 9]:
Token encontrado: ';'
Esperado: expressão, 'call' ou 'run'
Erro sintático [linha 3, coluna 5]:
Token encontrado: ';'
Esperado: comando ou '}'

sem yyerrok:
Erro sintático [linha 2, coluna 9]:
Token encontrado: ';'
Esperado: expressão, 'call' ou 'run'`}
      </Code>
      <P>
        Nos erros do {mono('invalido.flux')} a diferença não aparece, porque eles estão longe uns dos outros: a conta só afeta erros a
        menos de três tokens de distância.
      </P>

      <H2 title="Erro léxico no modo pânico" />
      <P>
        Quando o lexer devolve {mono('YYerror')} (erro léxico), o Bison vai direto para a recuperação, sem chamar{' '}
        {mono('yyreport_syntax_error')} e sem guardar o token de erro como lookahead. O lexer já imprimiu a mensagem, então não há uma
        segunda para o mesmo problema. O resto é igual: desempilha até um estado que aceita {mono('error')}, descarta e fecha em {mono(';')}
        ou bloco.
      </P>
      <Code lang="text">
        {`$ cat tests/sintatico/panico_lexico.flux
func main () {
var a = 1 @ 2;
var b = 3 $ 4;
}
$ ./flux tests/sintatico/panico_lexico.flux
Erro léxico [linha 2, coluna 11]:
Caractere não reconhecido: '@'
Erro léxico [linha 3, coluna 11]:
Caractere não reconhecido: '$'
Programa rejeitado.`}
      </Code>

      <H2 title="O que sai na árvore e no código de saída" />
      <P>
        O nó {mono('error')} guarda onde começou o trecho descartado: a posição do primeiro símbolo que o Bison desempilhou (o mais à
        esquerda), ou a do token do erro se nada foi desempilhado. Os tokens descartados não aparecem na árvore, nem os símbolos
        desempilhados; só o {mono(';')} ou o bloco que fechou a recuperação. Um trecho de {mono('--tree')} para um corpo com{' '}
        {mono('1 +;')}:
      </P>
      <Code lang="text">
        {`        commands
          command
            error 3:5
            SEMICOLON ';' 3:8
          commands
            command
              variable_declaration`}
      </Code>
      <P>
        No {mono('--json')}, o nó é {mono('{"kind":"error","label":"error","line":3,"column":5}')}. A mensagem aponta para o {mono(';')} (3:8,
        onde o parser parou), o nó {mono('error')} para o início do trecho (3:5): são posições diferentes de propósito.
      </P>
      <H3 title="Código de saída e programa rejeitado" />
      <P>
        Depois de uma recuperação bem-sucedida, {mono('yyparse')} devolve 0: para o Bison, o parse terminou. Quem rejeita o programa é{' '}
        {mono('main')}, que soma os erros contados por {mono('report_error')} e só aceita se o parse devolveu 0 e a conta é zero. Então o programa fica
        rejeitado, o código de saída é 1, e a árvore (com os nós {mono('error')}) ainda é impressa e entra no JSON. Se a recuperação não
        consegue seguir (o fim do arquivo chega durante ela), {mono('yyparse')} devolve 1, a raiz {mono('program')} nunca é montada, o{' '}
        {mono('--tree')} não imprime árvore e o JSON tem {mono('"tree": null')}. Ver{' '}
        <PageLink to="compilador/visao-geral">Visão geral</PageLink> e <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>.
      </P>

      <H2 title="O exemplo inválido de ponta a ponta" />
      <P>
        {mono('docs/exemplos/invalido.flux')} tem sete erros (o catálogo está na seção 5 de {mono('docs/ERROS.md')}). Com o modo pânico, o
        compilador reporta os sete, sem erro em cascata.
      </P>
      <Code lang="text">
        {`$ ./flux docs/exemplos/invalido.flux
Erro sintático [linha 3, coluna 20]:
Token encontrado: ';'
Esperado: '='
Erro sintático [linha 15, coluna 5]:
Token encontrado: palavra reservada 'stop'
Esperado: ';'
Erro léxico [linha 20, coluna 24]:
Caractere não reconhecido: '@'
Erro léxico [linha 21, coluna 9]:
Número malformado: '2itens'
Erro sintático [linha 26, coluna 12]:
Token encontrado: palavra reservada 'if'
Esperado: '{'
Erro sintático [linha 30, coluna 5]:
Token encontrado: palavra reservada 'call'
Esperado: comando ou '}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)
Erro sintático [linha 31, coluna 16]:
Token encontrado: '='
Esperado: ';' (o lado esquerdo não é variável, campo ou índice)
Programa rejeitado.`}
      </Code>
      <P>
        O que cada recuperação fez, conferido com {mono('./flux --tree')} (as posições dos nós {mono('error')} e dos fechamentos):
      </P>
      <Table
        head={['#', 'Mensagem', 'Regra que recuperou', 'Nó error', 'O que foi descartado e como fechou']}
        rows={[
          ['1', '3:20, ";" no lugar de "="', mono('global_no_func: error SEMICOLON'), '3:1', <>Foi desempilhado o {mono('const versao:string')} inteiro; o {mono(';')} do erro já era o que a regra aceita e fechou (3:20).</>],
          ['2', '15:5, "stop" no lugar de ";"', mono('command: error SEMICOLON'), '10:5', <>Foi desempilhado o {mono('var saida, err = run {...}')} inteiro; descartou {mono('stop if err')}; fechou no {mono(';')} de 15:16. O comando {mono('stop if err;')} não está na árvore.</>],
          ['3', '20:24, "@" (L1)', mono('command: error SEMICOLON'), '20:5', <>O erro léxico veio como {mono('YYerror')}; desempilhou o {mono('var total:int = 10')}; descartou {mono('2')}; fechou em 20:27.</>],
          ['4', '21:9, "2itens" (L5)', mono('command: error SEMICOLON'), '21:5', <>Desempilhou o {mono('var')}; descartou {mono(':int = 3')}; fechou em 21:23.</>],
          ['5', '26:12, "if" no lugar de "{"', mono('command: error block'), '24:5', <>Desempilhou o comando {mono('if (ativo) {...} else')} (o {mono('if')} anterior some da árvore); descartou {mono('if (total > 5)')}; leu o bloco que abre em 26:27 e fecha em 28:5.</>],
          ['6', '30:5, "call" no ponto de um comando', mono('command: error SEMICOLON'), '30:5', <>Nada foi desempilhado; descartou {mono('call build("./backend")')}; fechou em 30:28.</>],
          ['7', '31:16, "=" (S3)', 'nenhuma', '-', <>Só reportado por {mono('command_expression')}: o comando já terminou, não há recuperação nem nó {mono('error')}.</>],
        ]}
      />
      <P>
        A árvore sai com seis nós {mono('error')} (os seis de cima), o {mono('--json')} traz sete erros, 140 tokens e a árvore (não nula), e o
        código de saída é 1.
      </P>

      <H2 title="Dentro de um corpo de função" />
      <P>
        Os erros de sintaxe dentro de um corpo se recuperam no {mono(';')} do próprio comando. Medido, com o erro numa {mono('main')} com outros comandos
        antes e depois:
      </P>
      <Table
        head={['Comando com erro', 'Mensagem', 'Árvore']}
        rows={[
          [mono('1 +;'), <>{mono("Token encontrado: ';'")}, {mono('Esperado: expressão')}</>, 'sim, com o nó error'],
          [mono('x = ;'), <>{mono("Token encontrado: ';'")}, {mono("Esperado: expressão, 'call' ou 'run'")}</>, 'sim'],
          [mono('return 1 1;'), <>{mono('Token encontrado: número inteiro 1')}, {mono("Esperado: ';'")}</>, 'sim'],
        ]}
      />
      <P>
        Cada um dá exatamente uma mensagem e uma árvore. O comando seguinte ({mono('var b:int = 2;')}) volta a ser lido normalmente.
      </P>
      <Callout kind="nota">
        O compilador atual, quando recebe esses mesmos comandos <strong>fora de uma função</strong>, no nível global do arquivo, dá duas mensagens
        e {mono('"tree": null')}: o primeiro token do comando já é o erro (o nível global só aceita {mono('var')}, {mono('const')}, {mono('func')} e{' '}
        {mono('workflow')}), a regra {mono('global_no_func: error SEMICOLON')} recupera até o {mono(';')}, e depois disso o arquivo acaba sem
        {mono('func main')}. O fim do arquivo é então outro erro (o mesmo texto, {mono("Esperado: 'var', 'const', 'func' ou 'workflow'")}), e ele
        não pode ser recuperado: o Bison abandona o parse, a raiz não é montada e o JSON fica com {mono('"tree": null')}. Com uma {mono('func main')}{' '}
        depois do comando solto, sai uma só mensagem e a árvore.
      </Callout>
      <Code lang="text">
        {`$ cat g.flux
1 +;
$ ./flux g.flux
Erro sintático [linha 1, coluna 1]:
Token encontrado: número inteiro 1
Esperado: 'var', 'const', 'func' ou 'workflow'
Erro sintático [linha 2, coluna 1]:
Token encontrado: fim do arquivo
Esperado: 'var', 'const', 'func' ou 'workflow'
Programa rejeitado.`}
      </Code>

      <H2 title="A cascata de erros" />
      <P>
        A versão simples só ressincroniza em {mono(';')} e em blocos {mono('{ }')}. Um {mono('}')} ou um {mono(';')} esquecido, ou um bloco que fica aberto, faz o
        parser engolir o que vem depois, e aparecem erros extras. Os casos medidos:
      </P>
      <Code lang="text">
        {`$ cat cs.flux
func main () {
    x = 1 +
}
func f () { }
$ ./flux cs.flux
Erro sintático [linha 3, coluna 1]:
Token encontrado: '}'
Esperado: expressão
Erro sintático [linha 5, coluna 1]:
Token encontrado: fim do arquivo
Esperado: comando ou '}'
Programa rejeitado.`}
      </Code>
      <P>
        O {mono('x = 1 +')} sem {mono(';')} faz o erro aparecer no {mono('}')} da função. O {mono('}')} é descartado (não é um {mono(';')} nem um {mono('{')}), e o
        {mono('func f ()')} também; o {mono('{ }')} de {mono('f')} fecha a recuperação como se fosse o bloco do comando quebrado. A função {mono('main')}
        continua aberta, e o fim do arquivo vira o segundo erro. Se não há nada depois do {mono('}')}, o parse acaba em silêncio no fim do arquivo (o
        contador de recuperação ainda está em 3) e a saída tem uma só mensagem, com {mono('"tree": null')}.
      </P>
      <Code lang="text">
        {`$ cat c.flux
func main () {
    if (true) {
        var a = 1;

}
func f () { }
$ ./flux c.flux
Erro sintático [linha 6, coluna 1]:
Token encontrado: palavra reservada 'func'
Esperado: comando ou '}'
Erro sintático [linha 7, coluna 1]:
Token encontrado: fim do arquivo
Esperado: comando ou '}'
Programa rejeitado.`}
      </Code>
      <P>
        Um bloco sem o {mono('}')} final tem o mesmo efeito: o {mono('func')} seguinte vira um erro dentro do bloco.
      </P>
      <Why>
        Foi tentado um refinamento e medido em 14/11/2026: um filtro de tokens entre o lexer e o parser, que entregava um {mono(';')} falso antes do
        token verdadeiro e os {mono('}')} que faltavam ao achar {mono('func')}. Ele resolvia os dois casos acima, mas, em 3.950 programas obtidos por
        mutação de um programa válido, reportou mais erros que a versão simples em todos os tipos de mutação: esquecer um token, 983 erros da versão
        simples contra 1.180 do filtro; repetir um token, 932 contra 1.253; trocar por palavra reservada, 1.029 contra 2.251. Retomar em palavra de comando
        ou em {mono('}')} falha quando o erro está dentro de uma expressão com chaves, como um literal de objeto ({mono('run { command: "npm", ... }')}):
        o resto do objeto passa a ser lido como comandos, e o {mono('}')} do objeto fecha o bloco errado. Restringir a retomada a {mono('}')} e a{' '}
        {mono('func')}/{mono('workflow')} também não ajudou. Por isso a versão simples, regras {mono('error')} mais bloco lido inteiro, foi mantida.
      </Why>
      <Callout kind="nota">
        O texto do catálogo de erros (seção 6 de {mono('docs/ERROS.md')}) descreve os pontos de sincronização ideais: retomar em {mono('}')}, nas palavras
        que iniciam um comando e voltar ao nível global em {mono('func')} e {mono('workflow')}. A versão simples do parser <strong>não faz</strong> isso;
        o que ela faz é o que está descrito nesta página.
      </Callout>
      <P>
        Para o texto de cada erro, ver <PageLink to="linguagem/erros">Catálogo de erros</PageLink>. O próximo estágio depois de um parse sem erros é a{' '}
        <PageLink to="compilador/ast">AST</PageLink>.
      </P>
    </>
  )
}
