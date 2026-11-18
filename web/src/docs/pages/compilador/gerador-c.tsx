import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

interface Part {
  title: string
  note: string
  by: string
}

const PARTS: Part[] = [
  { title: 'Comentário de abertura', note: 'uma linha: Gerado pelo compilador FluxLang', by: 'fputs' },
  { title: 'Biblioteca de execução', note: 'flux_runtime_source, pouco mais de mil linhas', by: 'fputs(flux_runtime_source)' },
  { title: 'Separador do programa', note: 'a linha ---------- programa ----------', by: 'fputs' },
  { title: 'Globais', note: 'static FxValue v_nome;, um por nome', by: 'fprintf' },
  { title: 'Protótipos', note: 'um por func, workflow e main', by: 'signature(f, 1)' },
  { title: 'Corpos', note: 'f_nome, w_nome e f_main, na ordem do arquivo', by: 'gen_func' },
  { title: 'fx_program e main', note: 'inicializa e chama f_main', by: 'emit e fputs' },
]

function LayoutDiagram() {
  return (
    <svg viewBox="0 0 770 366" width="770" height="366" className="block max-w-none">
      {PARTS.map((p, i) => {
        const y = 8 + i * 50
        return (
          <g key={p.title}>
            <rect x="10" y={y} width="420" height="40" rx="6" strokeWidth="1.25" className={i === 1 ? 'fill-panel stroke-accent' : 'fill-bg stroke-line'} />
            <text x="22" y={y + 17} fontSize="13" fontWeight="600" className="fill-ink">
              {p.title}
            </text>
            <text x="22" y={y + 33} fontSize="11" className="fill-muted">
              {p.note}
            </text>
            <text x="450" y={y + 25} fontSize="12" fontFamily="monospace" className="fill-ink">
              {p.by}
            </text>
          </g>
        )
      })}
      <text x="450" y="362" fontSize="11" className="fill-muted">
        tudo em generate_c, de cima para baixo
      </text>
    </svg>
  )
}

export function GeradorC() {
  return (
    <>
      <H2 title="O papel do gerador de C" />
      <P>
        {mono('src/backend/codegen_c.c')} é a última etapa própria do compilador. Percorre a AST já conferida pela análise semântica e escreve um programa C que usa a biblioteca de execução
        ({mono('src/backend/runtime/flux_rt.h')}), copiada para dentro do próprio arquivo gerado: o resultado compila sozinho com o {mono('gcc')}. O mesmo arquivo cuida de chamar o {mono('gcc')} e de
        executar o programa, para as opções {mono('--c')}, {mono('--build')} e {mono('--run')}.
      </P>
      <Table
        head={['', 'Detalhe']}
        rows={[
          ['Entrada', <>O {mono('Program')} da AST (ver <PageLink to="compilador/ast">AST</PageLink>) com os campos {mono('Expr.type')} preenchidos pela <PageLink to="compilador/semantica">análise semântica</PageLink>, e um {mono('FILE *')}.</>],
          ['Chamada', <>{mono('run_codegen')}, em {mono('main.c')}, depois que o programa foi aceito. Com {mono('--c')}, o {mono('FILE *')} é a saída padrão; nas outras duas, um arquivo temporário. Ver <PageLink to="compilador/linha-de-comando">Linha de comando</PageLink>.</>],
          ['Saída', <>O texto do programa C em {mono('file')}. {mono('generate_c')} devolve sempre 0. Depois, {mono('compile_c')} produz o executável e {mono('execute_program')} o roda.</>],
          ['Depende de', <>{mono('ast.h')}, {mono('fluxc.h')}, {mono('mem.h')} (a <PageLink to="compilador/arena">arena</PageLink>), do símbolo {mono('flux_runtime_source')} (de {mono('build/runtime_src.c')}) e, para o {mono('gcc')}, de {mono('fork')}, {mono('execvp')} e {mono('waitpid')}.</>],
          ['Funções públicas', <>{mono('generate_c')}, {mono('compile_c')}, {mono('execute_program')}, {mono('set_windows_target')} e {mono('is_windows_target')}. O resto é {mono('static')}.</>],
        ]}
      />
      <Callout kind="nota">
        O gerador confia na análise semântica: ele não confere se um nome existe, se o número de argumentos está certo nem se o tipo combina. {mono('main')} só chama o gerador com um programa que passou por{' '}
        {mono('semantic_check')} sem erros; por isso {mono('--c')}, {mono('--build')} e {mono('--run')} ligam a análise semântica sozinhos. A biblioteca de execução está na página{' '}
        <PageLink to="compilador/runtime">Biblioteca de execução</PageLink>.
      </Callout>

      <H2 title="As duas ideias do gerador" />
      <H3 title="Todo valor é um FxValue" />
      <P>
        Todo valor da FluxLang, de um inteiro a uma lista, vira um {mono('FxValue')} em C: uma etiqueta ({mono('FX_NULL')}, {mono('FX_INT')}, {mono('FX_FLOAT')}, {mono('FX_BOOL')}, {mono('FX_STRING')},{' '}
        {mono('FX_LIST')}, {mono('FX_OBJECT')}) e um valor. Variáveis, parâmetros, retornos e temporários têm todos o tipo {mono('FxValue')}; só um workflow devolve um {mono('FxPair')} (resultado e erro).
        Os operadores e as conferências de tipo em tempo de execução ficam na biblioteca ({mono('fx_add')}, {mono('fx_index')}, {mono('fx_cond')} e as demais).
      </P>
      <Why>
        {mono('codegen_c.c')}: o tipo estático da AST só decide as conversões do gerador: de {mono('int')} para {mono('float')} e a conferência de um valor dinâmico (campo de{' '}
        {mono('object')}) contra o tipo esperado, que dá o erro de execução R5. Todo o resto o {mono('FxValue')} resolve na execução; é por isso que o gerador não precisa de um tipo C diferente para cada tipo
        da linguagem.
      </Why>
      <H3 title="Ordem de avaliação: um temporário por subexpressão" />
      <P>
        O C não define em que ordem os argumentos de uma chamada são calculados. A FluxLang define: da esquerda para a direita. Para isso o gerador nunca escreve uma expressão aninhada em C: cada subexpressão
        é calculada numa linha própria, que guarda o resultado num temporário ({mono('t0')}, {mono('t1')}, ...), na ordem em que o código aparece. {mono('expr')} emite essas linhas e devolve o nome do temporário;
        quem a chamou usa o nome numa linha seguinte. As únicas exceções são os literais simples (inteiro, float, texto, bool, {mono('null')}), que não têm efeito colateral e voltam como um construtor pronto,
        como {mono('fx_int(1)')}.
      </P>
      <Why>
        {mono('codegen_c.c')}: sem os temporários, {mono('f(a(), b())')} em C poderia chamar {mono('b')} antes de {mono('a')}, e a saída de um programa mudaria de um compilador de C para outro. Com eles, cada chamada
        ocupa uma linha, e a ordem das linhas é a ordem do código. O teste {mono('tests/exec/ordem_de_avaliacao.flux')} confere isso.
      </Why>
      <Why>
        {mono('codegen_c.c')}: um nome de variável também é copiado para um temporário ({mono('FxValue t1 = v_x;')}). Uma chamada mais à direita pode mudar a variável, e o valor lido tem de ser o de antes da
        chamada. Medido, com um global {mono('c')} que uma função {mono('inc')} aumenta de 1: {mono('c + inc()')} dá {mono('1')} (0 mais 1), porque {mono('c')} foi lido antes de {mono('inc()')} rodar.
      </Why>
      <Code lang="c">
        {`  FxValue t1 = v_c;
  FxValue t2 = f_inc();
  FX_LINE(7);
  FxValue t3 = fx_add(t1, t2);`}
      </Code>
      <P>
        O {mono('FX_LINE(7);')} depois de {mono('f_inc()')} devolve ao programa a linha do comando que fez a chamada; a seção de comandos explica por quê.
      </P>
      <P>
        Os números dos temporários seguem a ordem em que foram pedidos, não a ordem em que as linhas saem: em {mono('terminal.log(x)')}, o temporário do resultado ({mono('t0')}) é pedido antes do
        do argumento ({mono('t1')}), então a linha de {mono('t1')} vem primeiro no arquivo. O contador volta a zero no início de cada função, e os nomes não se repetem dentro de uma função, então nenhum
        temporário esconde outro.
      </P>

      <H2 title="O programa C gerado" />
      <P>
        {mono('generate_c')} escreve o arquivo de cima para baixo, em sete partes, sempre nesta ordem.
      </P>
      <Diagram
        title="As sete partes do arquivo C gerado e a chamada que escreve cada uma"
        label="Sete caixas empilhadas: comentário de abertura, biblioteca de execução (destacada), separador do programa, globais, protótipos, corpos das funções, e fx_program com main. À direita de cada caixa, o nome da chamada de generate_c que a escreve."
      >
        <LayoutDiagram />
      </Diagram>
      <H3 title="A biblioteca embutida" />
      <P>
        A biblioteca está num arquivo de cabeçalho, {mono('src/backend/runtime/flux_rt.h')}. O Makefile a transforma em {mono('build/runtime_src.c')}: um arquivo C com uma única constante,{' '}
        {mono('const char flux_runtime_source[]')}, em que cada linha do cabeçalho virou um literal de texto (com {mono('\\')} e {mono('"')} protegidos e um {mono('\\n')} no fim). Os literais vizinhos se juntam
        em um só texto. O {mono('codegen_c.c')} declara essa constante como {mono('extern')}, e {mono('generate_c')} a escreve inteira com {mono('fputs')}. Como o resultado cabe num arquivo só, o executável
        não depende de nenhum outro arquivo do projeto. O arquivo do Makefile está em <PageLink to="compilador/mapa-e-build">Mapa do repositório e build</PageLink>.
      </P>
      <P>
        O começo do arquivo gerado: a linha de abertura e as primeiras linhas da biblioteca:
      </P>
      <Code lang="c">
        {`/* Gerado pelo compilador FluxLang (./flux --c). Compila sozinho com o gcc. */

#ifdef _WIN32
#ifndef __USE_MINGW_ANSI_STDIO
#define __USE_MINGW_ANSI_STDIO 1
#endif
#endif`}
      </Code>
      <P>
        Dali em diante vem o resto da biblioteca, que tem pouco mais de mil linhas no total (o programa pequeno da seção de exemplo gera um arquivo só um pouco maior, e a biblioteca é quase todo ele). As partes do programa começam no separador. Este é o trecho
        real, do separador aos protótipos, para o exemplo da seção seguinte:
      </P>
      <Code lang="c">
        {`/* ---------- programa ---------- */

static FxValue v_total;

static FxValue f_dobra(FxValue v_n);
static FxPair w_checa(FxValue v_n);
static FxPair w_dupla(FxValue v_n);
static FxValue f_main(void);`}
      </Code>

      <H2 title="O estado do módulo" />
      <P>
        O gerador guarda seu estado em variáveis estáticas do arquivo. {mono('generate_c')} roda uma vez por processo, e quem a chama a reinicia a cada chamada ({mono('out')}, {mono('prog')} e {mono('depth')}).
      </P>
      <Table
        head={['Variável', 'Tipo', 'Papel e invariantes']}
        rows={[
          [mono('out'), mono('FILE *'), <>O arquivo de saída. {mono('generate_c')} o define na entrada; {mono('emit')} e {mono('signature')} escrevem nele.</>],
          [mono('depth'), mono('int'), <>O nível de recuo, em passos de dois espaços. Vale 0 no nível do arquivo, sobe em {mono('gen_block')}, nos laços e no corpo das funções, e desce na mesma conta. Dentro de {mono('fx_program')} vale 1.</>],
          [mono('next_tmp'), mono('int'), <>O próximo número de temporário. Volta a 0 no início de {mono('gen_func')} e antes de {mono('fx_program')}; só cresce. Por isso nenhum nome de temporário se repete dentro de uma função.</>],
          [mono('prog'), mono('const Program *'), <>O programa que está sendo gerado; {mono('find_func')} o percorre para achar uma função pelo nome.</>],
          [mono('cur_func'), mono('const Func *'), <>A função cujo corpo está sendo gerado; {mono('gen_return')} o lê para saber se é workflow e qual o tipo de retorno. É nula fora de {mono('gen_func')}.</>],
          [mono('cur_line'), mono('int'), <>A linha do comando sendo gerado. {mono('gen_stmt')} a grava (e o laço dos globais em {mono('generate_c')}); {mono('gen_call')} e {mono('gen_pair')} a leem para o {mono('FX_LINE')} depois da chamada.</>],
          [mono('windows_target'), mono('int'), <>1 se o alvo é Windows (opção {mono('--windows')}). Só {mono('set_windows_target')} o liga; não há como desligar. Lida por {mono('compile_c')}, {mono('execute_program')} e, de fora, por {mono('main.c')}.</>],
        ]}
      />
      <P>
        Não há rótulos de laço: {mono('break')} e {mono('continue')} da FluxLang viram os do C, que já agem sobre o laço mais interno, como na linguagem.
      </P>

      <H2 title="Nomes: de FluxLang para C" />
      <P>
        Todo nome do usuário ganha um prefixo, que diz o que ele é e o separa de tudo o que a biblioteca define (todos os nomes dela começam por {mono('fx_')}).
      </P>
      <Table
        head={['FluxLang', 'C', 'Exemplo']}
        rows={[
          ['Variável, constante ou parâmetro', mono('v_nome'), <>{mono('var soma')} vira {mono('v_soma')}</>],
          ['func (e a main)', mono('f_nome'), <>{mono('dobra')} vira {mono('f_dobra')}; a {mono('main')} vira {mono('f_main')}</>],
          ['workflow', mono('w_nome'), <>{mono('checa')} vira {mono('w_checa')}</>],
          ['Temporário', mono('tN'), <>{mono('t0')}, {mono('t1')}, ...</>],
          ['Índice do laço for', mono('i_tN'), <>{mono('i_t2')}, do temporário que guarda a lista</>],
        ]}
      />
      <P>
        Os identificadores da FluxLang só têm letras ASCII, dígitos e sublinhado ({mono('[A-Za-z_]')} e dígitos), então o nome de C resultante é sempre válido. Uma variável chamada {mono('t0')} vira {mono('v_t0')}, que
        não choca com o temporário {mono('t0')}. Os escapes de texto são os mesmos nas duas linguagens (a análise léxica só aceita {mono('\\n')}, {mono('\\t')}, {mono('\\"')} e {mono('\\\\')}), então o texto de um literal
        vai para o C sem conversão.
      </P>
      <Why>
        {mono('codegen_c.c')}: o literal de texto sai como veio ({mono('fx_str(e->text)')}), com as aspas e os escapes, porque os escapes aceitos pela linguagem são os do C. Um escape inválido já foi barrado
        pela análise léxica (erro L3), então o gerador nunca vê um.
      </Why>

      <H2 title="Expressões" />
      <P>
        {mono('expr')} é o despachante: escolhe pelo {mono('ExprKind')} o que escrever, emite as linhas que calculam o valor e devolve o nome do temporário (ou o construtor de um literal). A tabela mostra o C de
        cada forma; as letras são os nomes devolvidos pelas subexpressões.
      </P>
      <Table
        head={['Forma da AST', 'C gerado']}
        rows={[
          [mono('EX_INT'), <>{mono('fx_int(5)')}, sem temporário.</>],
          [mono('EX_FLOAT'), <>{mono('fx_float(0.10000000000000001)')}, sem temporário. O número sai com 17 dígitos significativos e, se não tem ponto nem expoente, ganha {mono('.0')} ({mono('fx_float(2.0)')}).</>],
          [mono('EX_STRING'), <>{mono('fx_str("a\\tb")')}, sem temporário.</>],
          [mono('EX_BOOL'), <>{mono('fx_bool(1)')} ou {mono('fx_bool(0)')}.</>],
          [mono('EX_NULL'), <>{mono('fx_null()')}.</>],
          [mono('EX_IDENT'), <>{mono('FxValue t1 = v_x;')}, uma cópia.</>],
          [mono('EX_UNARY'), <>{mono('FxValue t = fx_neg(a);')} ou {mono('fx_not(a)')}. O {mono('-5')} é a negação de {mono('5')}: {mono('fx_neg(fx_int(5))')}.</>],
          [mono('EX_BINARY'), <>{mono('FxValue t = fx_add(a, b);')}: {mono('fx_add')}, {mono('fx_sub')}, {mono('fx_mul')}, {mono('fx_div')}, {mono('fx_mod')}, {mono('fx_lt')}, {mono('fx_le')}, {mono('fx_gt')}, {mono('fx_ge')}, {mono('fx_eq')}, {mono('fx_ne')}. Os operandos antes, na ordem.</>],
          [<>{mono('&&')} e {mono('||')}</>, <>Um {mono('if')}, como na seção abaixo.</>],
          [mono('EX_INDEX'), <>{mono('FxValue t = fx_index(a, b);')}.</>],
          [mono('EX_FIELD'), <>{mono('FxValue t = fx_field(a, "nome");')}.</>],
          [mono('EX_CALL'), <>Ver a seção de chamadas.</>],
          [mono('EX_LIST'), <>{mono('fx_new_list()')} e um {mono('fx_list_add')} por elemento, na ordem.</>],
          [mono('EX_OBJECT'), <>{mono('fx_new_object()')} e um {mono('fx_obj_set')} por campo, na ordem.</>],
        ]}
      />
      <H3 title="&& e || viram if" />
      <P>
        Para o curto-circuito, o operando da direita só pode ser calculado se for preciso, então {mono('gen_binary')} escreve um {mono('if')}. O resultado é sempre um bool: cada lado passa por {mono('fx_cond')},
        que dá o erro de execução se o valor não for bool. No {mono('&&')} o lado direito roda se o esquerdo deu verdadeiro; no {mono('||')}, se deu falso.
      </P>
      <Code lang="flux">
        {`var a = marca("a", false) && marca("b", true);
var c = marca("c", true) || marca("d", true);`}
      </Code>
      <Code lang="c">
        {`  FxValue t0 = f_marca(fx_str("a"), fx_bool(0));
  FX_LINE(6);
  FxValue t1 = fx_bool(fx_cond(t0));
  if (t1.as.b) {
    FxValue t2 = f_marca(fx_str("b"), fx_bool(1));
    FX_LINE(6);
    t1 = fx_bool(fx_cond(t2));
  }
  FxValue v_a = t1;
  FX_LINE(7);
  FxValue t3 = f_marca(fx_str("c"), fx_bool(1));
  FX_LINE(7);
  FxValue t4 = fx_bool(fx_cond(t3));
  if (!t4.as.b) {
    FxValue t5 = f_marca(fx_str("d"), fx_bool(1));
    FX_LINE(7);
    t4 = fx_bool(fx_cond(t5));
  }
  FxValue v_c = t4;`}
      </Code>
      <Why>
        {mono('codegen_c.c')}: {mono('&&')} e {mono('||')} viram {mono('if')} para dar o curto-circuito: com um operador de C, o lado direito de uma chamada de função rodaria sempre que o compilador de C quisesse.
        Os temporários do lado direito ficam dentro das chaves do {mono('if')}; só o resultado ({mono('t1')}, {mono('t4')}) é usado depois.
      </Why>
      <H3 title="Conversões: int para float e valor dinâmico" />
      <P>
        Onde a linguagem espera um tipo, {mono('convert')} calcula a expressão e {mono('coerce')} ajusta o valor ao tipo esperado. Há dois casos. Um {mono('int')} onde se espera {mono('float')} vira {mono('fx_to_float(v)')}. Um valor
        de tipo dinâmico (o campo de um {mono('object')}, cujo tipo só se sabe na execução) onde se espera {mono('int')}, {mono('float')}, {mono('bool')}, {mono('string')}, {mono('list')} ou {mono('object')} passa por{' '}
        {mono('fx_as_int')}, {mono('fx_as_float')} e as outras da família {mono('fx_as_')}, que dão o erro R5 se a etiqueta for outra. Há duas exceções: {mono('null')} passa em todas, e {mono('fx_as_float')} aceita também um {mono('int')} e o promove a {mono('float')}. Medido: com {mono('var o = {a: 1};')}, {mono('var f: float = o.a;')} roda sem erro e {mono('f / 2')} dá {mono('0.5')}. Nos demais casos o valor passa sem mudança.
      </P>
      <P>
        A conversão é usada onde há um tipo esperado conhecido: o valor de um {mono('var')} com tipo declarado, o lado direito de uma atribuição (o tipo do alvo), cada argumento de uma chamada (o tipo do
        parâmetro), o {mono('return')} (o tipo de retorno), o elemento de um literal de lista, o argumento de {mono('push')} (o tipo do elemento da lista) e o resultado de um {mono('call')} que vai para um
        alvo já declarado (o tipo do alvo, comparado com o tipo de retorno do workflow). Não é usada nos operandos de operadores, nas
        condições, nos índices, nos valores de um literal de {mono('object')} nem nos argumentos de {mono('terminal.*')} e das conversões: a biblioteca resolve esses casos na execução.
      </P>
      <Code lang="c">
        {`  FX_LINE(5);
  FxValue t0 = fx_new_list();
  fx_list_add(t0, fx_to_float(fx_int(1)));
  fx_list_add(t0, fx_float(2.5));
  FxValue v_xs = t0;
  FX_LINE(6);
  FxValue t1 = v_xs;
  FxValue t2 = fx_push(t1, fx_to_float(fx_int(3)));
  (void)t2;
  FX_LINE(7);
  FxValue t3 = fx_new_object();
  fx_obj_set(t3, "v", fx_float(1.5));
  FxValue v_o = t3;
  FX_LINE(8);
  FxValue t4 = v_o;
  FxValue t5 = fx_field(t4, "v");
  FxValue v_f = fx_as_float(t5);`}
      </Code>
      <P>
        O trecho acima vem de {mono('var xs:list<float> = [1, 2.5]')}, {mono('xs.push(3)')}, {mono('var o = { v: 1.5 }')} e {mono('var f:float = o.v')}: o {mono('1')} da lista e o {mono('3')} do {mono('push')} viram float, e o campo
        {' '}{mono('v')} do objeto é conferido contra {mono('float')} na execução.
      </P>
      <H3 title="Chamadas" />
      <P>
        {mono('gen_call')} trata três casos pelo que está à esquerda do parêntese: as quatro conversões, as funções do usuário e as ações de {mono('terminal')} e de lista, em sete formas no total.
      </P>
      <Table
        head={['Chamada', 'C gerado']}
        rows={[
          [<>{mono('toString')}, {mono('toInt')}, {mono('toFloat')}, {mono('toBool')}</>, <>{mono('FxValue t = fx_to_string(a);')} (e {mono('fx_to_int')}, {mono('fx_to_float')}, {mono('fx_to_bool')}). O argumento não passa por {mono('convert')}.</>],
          [<>Uma func do usuário</>, <>{mono('FxValue t = f_nome(a1, a2);')}, com cada argumento convertido para o tipo do parâmetro, seguido de {mono('FX_LINE(n);')} com a linha do comando que chamou. A {mono('main') } nunca é chamável.</>],
          [mono('terminal.log(x)'), <>{mono('FxValue t = fx_log(a);')}; também {mono('fx_info')}, {mono('fx_warn')} e {mono('fx_error')}.</>],
          [mono('terminal.input(p)'), <>{mono('FxValue t = fx_input(a);')}; sem argumento, a mensagem é {mono('fx_null()')}.</>],
          [mono('lista.length()'), <>{mono('FxValue t = fx_length(b);')}.</>],
          [mono('lista.push(v)'), <>{mono('FxValue t = fx_push(b, v);')}, com {mono('v')} convertido para o tipo do elemento da lista (sem conversão se o tipo da lista é dinâmico).</>],
          [mono('lista.remove(i)'), <>{mono('FxValue t = fx_remove(b, i);')}.</>],
        ]}
      />
      <P>
        Uma chamada usada como comando também vira um temporário, seguido de {mono('(void)t;')}, para o C não reclamar de valor não usado. Um workflow nunca passa por {mono('gen_call')}: ele só é chamado por{' '}
        {mono('call')}, que é outra construção (seção de comandos).
      </P>

      <H2 title="Comandos" />
      <P>
        {mono('gen_stmt')} escreve primeiro {mono('FX_LINE(n);')}, com a linha do comando, e depois o C do comando. Só {mono('ST_BLOCK')}, {mono('break')} e {mono('continue')} ficam sem essa linha, e no{' '}
        {mono('while')} ela vai para dentro do laço, antes da condição. É o {mono('FX_LINE')} que faz o erro de execução dizer em que linha da FluxLang aconteceu (por exemplo {mono('Erro de execução [linha 4]:')}).
        A linha do comando fica também em {mono('cur_line')}, e o gerador repete {mono('FX_LINE(n);')} logo depois de cada chamada de func do usuário e de cada {mono('call')}.
      </P>
      <Why>
        {mono('codegen_c.c')}: {mono('fx_line')} é uma variável só, e a função chamada a muda a cada comando dela. Sem o {mono('FX_LINE')} depois da chamada, o que vem depois dela no mesmo comando (uma divisão,
        uma atribuição a um índice) daria o erro com a linha do último comando da função chamada. Medido, em {mono('tests/exec/linha_do_erro_depois_da_funcao.flux')}: {mono('var x = f(f(2)) + 1 / z;')} na linha 10, com o
        último comando de {mono('f')} na linha 6, dava {mono('[linha 6]')} e agora dá {mono('[linha 10]')}. A linha é restaurada por quem chama, e não pela função que retorna: assim um erro dentro da função
        chamada continua com a linha dela ({mono('tests/exec/linha_do_erro_dentro_da_funcao.flux')}), e não é preciso guardar a linha em cada {mono('return')} e no {mono('stop if')}.
      </Why>
      <Why>
        {mono('codegen_c.c')}: no {mono('while')}, o {mono('FX_LINE')} fica dentro do {mono('for (;;)')} porque a condição roda de novo a cada volta, depois do último comando do corpo. Fora do laço, um erro na
        condição da segunda volta em diante sairia com a linha do fim do corpo ({mono('tests/exec/linha_do_erro_na_condicao_do_while.flux')}).
      </Why>
      <Table
        head={['Comando', 'C gerado']}
        rows={[
          [mono('ST_VAR'), <>Para cada nome, {mono('FxValue v_x = valor;')}. Sem valor, {mono('FxValue v_x = fx_null();')}. Num global, só a atribuição {mono('v_x = valor;')} (a declaração está no topo do arquivo).</>],
          [mono('ST_ASSIGN'), <>A base e o índice de cada alvo primeiro, depois os valores, depois um {mono('v_x = valor;')}, {mono('fx_set_field(base, "campo", valor)')} ou {mono('fx_set_index(base, indice, valor)')} por alvo.</>],
          [mono('ST_EXPR'), <>A expressão e {mono('(void)t;')}.</>],
          [mono('ST_BLOCK'), <>{mono('{ ... }')}, com recuo.</>],
          [mono('ST_IF'), <>A condição em temporários, {mono('if (fx_cond(t))')}, o bloco; se há {mono('else')}, {mono('else')} e o bloco. Não existe {mono('else if')}: o {mono('else')} é sempre seguido de um bloco.</>],
          [mono('ST_WHILE'), <>{mono('for (;;) {')}, {mono('FX_LINE(n);')}, a condição, {mono('if (!fx_cond(t)) break;')}, o bloco.</>],
          [mono('ST_FOR'), <>Um bloco com {mono('FxList *l = fx_for_list(lista);')} e um {mono('for')} de C sobre {mono('l->v[i]')}.</>],
          [mono('ST_RETURN'), <>Ver a seção de retorno.</>],
          [mono('ST_BREAK'), <>{mono('break;')}</>],
          [mono('ST_CONTINUE'), <>{mono('continue;')}</>],
          [<>{mono('ST_ERRACT')}, {mono('stop if')}</>, <>{mono('if (v_e.tag != FX_NULL) return fx_pair(fx_null(), v_e);')}</>],
          [<>{mono('ST_ERRACT')}, {mono('abort if')}</>, <>{mono('if (v_e.tag != FX_NULL) fx_abort(v_e);')}</>],
          [<>{mono('ST_ERRACT')}, {mono('proceed if')}</>, <>Só um comentário C: {mono('/* proceed if e: o erro conta como tratado */')}.</>],
        ]}
      />
      <H3 title="Variáveis e atribuições" />
      <Why>
        {mono('codegen_c.c')}: no {mono('var')} sem valor ({mono('var x:int;')}) a variável é criada com {mono('fx_null()')}. Ela só ganha valor numa atribuição, e a análise semântica garante (erro E3) que
        ninguém a lê antes.
      </Why>
      <Why>
        {mono('codegen_c.c')}: no {mono('var')} com vários valores, todos os valores são calculados antes de qualquer variável ser criada. Nenhum valor enxerga uma variável do mesmo comando.
      </Why>
      <Why>
        {mono('codegen_c.c')}: na atribuição, todos os valores do lado direito são calculados antes de qualquer atribuição. Por isso {mono('a, b = b, a')} troca os valores: o C gerado lê {mono('v_b')} e {mono('v_a')} em
        temporários antes de escrever.
      </Why>
      <Code lang="c">
        {`  FX_LINE(16);
  FxValue t16 = v_q;
  FxValue t17 = v_p;
  v_p = t16;
  v_q = t17;`}
      </Code>
      <Why>
        {mono('codegen_c.c')}: o alvo de uma atribuição ({mono('base')} e {mono('indice')} de {mono('l[i] = v')}, a base de {mono('o.campo = v')}) é calculado antes do valor, porque o alvo está à esquerda e a
        ordem da linguagem é da esquerda para a direita. {mono('place_of')} guarda a base e o índice em temporários, {mono('gen_assign')} calcula os valores e {mono('store')} escreve. Medido, em{' '}
        {mono('tests/exec/ordem_do_alvo.flux')}, com {mono('l[v("indice", 1)] = v("valor", 99);')}, em que {mono('v')} escreve o nome que recebe: a saída é {mono('indice')} e depois {mono('valor')} (antes da
        correção era o contrário). Vale para alvos encadeados ({mono('m[i][j] = v')}, {mono('o.campo[i] = v')}), para vários alvos (todos os alvos, depois todos os valores) e para o {mono('call')}.
      </Why>
      <Code lang="c">
        {`  FX_LINE(7);
  FxValue t1 = v_l;
  FxValue t2 = f_v(fx_str("indice"), fx_int(1));
  FX_LINE(7);
  FxValue t3 = f_v(fx_str("valor"), fx_int(99));
  FX_LINE(7);
  fx_set_index(t1, t2, t3);`}
      </Code>
      <Callout kind="nota">
        Como o índice de cada alvo é calculado antes de qualquer atribuição do comando, {mono('i, l[i] = 2, 50')} grava em {mono('l')} na posição do {mono('i')} de antes do comando, e não na posição 2. É o
        mesmo que acontece com os valores: nenhuma parte do comando enxerga uma atribuição feita por ele.
      </Callout>
      <Why>
        {mono('codegen_c.c')}: numa atribuição por {mono('call')} (por exemplo {mono('q, e = call w()')}, com {mono('q')} do tipo {mono('float')} e o workflow devolvendo {mono('int')}), o resultado passa por{' '}
        {mono('coerce')} com o tipo de retorno do workflow e o tipo do alvo, como uma atribuição comum: a única conversão implícita da linguagem, de {mono('int')} para {mono('float')}, vale em toda atribuição.
        Medido, em {mono('tests/exec/call_converte_para_float.flux')}: {mono('q / 2')} dá {mono('0.5')} e {mono('toString(q)')} dá {mono('1.0')} (antes, {mono('0')} e {mono('1')}). O erro é sempre texto e vai
        sem conversão. No {mono('var r, e = call w();')} não há o que converter: sem tipo declarado, {mono('r')} recebe o tipo de retorno; com tipo, ele vale para os dois nomes e tem de aceitar o erro, que
        é {mono('string')}.
      </Why>
      <Code lang="c">
        {`  FX_LINE(10);
  FxPair t0 = w_um();
  FX_LINE(10);
  v_q = fx_to_float(t0.result);
  v_e = t0.error;`}
      </Code>
      <H3 title="Condições e laços" />
      <Why>
        {mono('codegen_c.c')}: no {mono('while')}, a condição é escrita dentro do {mono('for (;;)')}, e não antes dele, porque ela tem de ser recalculada a cada volta. Como o C gerado tem os temporários da condição
        dentro do laço, e um {mono('continue')} volta ao início dele, a condição é reavaliada.
      </Why>
      <Code lang="flux">
        {`while (k < 3) {
  k = k + 1;
  if (k == 2) { continue; }
  if (k == 3) { break; }
}`}
      </Code>
      <Code lang="c">
        {`  for (;;) {
    FX_LINE(19);
    FxValue t19 = v_k;
    FxValue t20 = fx_lt(t19, fx_int(3));
    if (!fx_cond(t20)) break;
    {
      FX_LINE(20);
      FxValue t21 = v_k;
      FxValue t22 = fx_add(t21, fx_int(1));
      v_k = t22;
      FX_LINE(21);
      FxValue t23 = v_k;
      FxValue t24 = fx_eq(t23, fx_int(2));
      if (fx_cond(t24))
      {
        continue;
      }
      FX_LINE(22);
      FxValue t25 = v_k;
      FxValue t26 = fx_eq(t25, fx_int(3));
      if (fx_cond(t26))
      {
        break;
      }
    }
  }`}
      </Code>
      <P>
        O {mono('for')} da linguagem ({mono('for x in lista')}) copia o ponteiro da lista para um temporário com {mono('fx_for_list')} e percorre com um índice de C. O limite {mono('l->n')} é lido a cada volta: um elemento
        acrescentado no meio do laço também é visitado. Medido, com {mono('m = [1, 2]')} e {mono('m.push(3)')} dentro do laço enquanto {mono('x < 3')}: o laço visitou 1, 2, 3 e 3.
      </P>
      <Code lang="c">
        {`  {
    FxValue t1 = v_xs;
    FxList *t2 = fx_for_list(t1);
    for (int i_t2 = 0; i_t2 < t2->n; i_t2++) {
      FxValue v_x = t2->v[i_t2];
      {
        FX_LINE(18);
        FxValue t3 = v_soma;
        FxValue t4 = v_x;
        FxValue t5 = f_dobra(t4);
        FX_LINE(18);
        FxValue t6 = fx_add(t3, t5);
        v_soma = t6;
      }
    }
  }`}
      </Code>
      <P>
        O bloco externo existe para o temporário da lista e o índice não vazarem. A variável do laço fica dentro do {mono('for')} de C, e o corpo ganha mais um bloco.
      </P>
      <H3 title="Retorno" />
      <P>
        Numa func, {mono('return valor;')} vira {mono('return v;')} com o valor convertido para o tipo de retorno, e {mono('return;')} vira {mono('return fx_null();')}. Num workflow, {mono('return resultado, erro;')} vira
        {' '}{mono('return fx_pair(resultado, erro);')}, com o resultado convertido e o erro como veio. Todo corpo termina, depois do último comando, com um retorno de reserva: {mono('return fx_null();')} na func e
        {' '}{mono('return fx_pair(fx_null(), fx_null());')} no workflow.
      </P>
      <Why>
        {mono('codegen_c.c')}: o retorno de reserva no fim do corpo existe porque uma func sem {mono(':tipo')} (ou um workflow sem {mono(':tipo')}) pode acabar sem um {mono('return')}. A func então devolve {mono('null')} e o
        workflow devolve {mono('(null, null)')}: nenhum resultado e nenhum erro. Quando o corpo já terminou num {mono('return')}, o retorno de reserva é código morto que o {mono('gcc')} descarta; ele aparece no
        arquivo gerado logo depois do {mono('return')} real.
      </Why>
      <H3 title="call, run e as ações sobre o erro" />
      <P>
        {mono('call')} e {mono('run')} devolvem um par. {mono('gen_pair')} guarda o par num temporário do tipo {mono('FxPair')} e o comando de quem chamou separa as duas metades: {mono('t.result')} e {mono('t.error')}.
        O {mono('call') } chama {mono('w_nome(args)')} com os argumentos convertidos para o tipo dos parâmetros. O {mono('run')} calcula o objeto de opções ({mono('command')}, {mono('flags')}, {mono('workingDir')}) como
        um literal de {mono('object')} e o passa para {mono('fx_run')}.
      </P>
      <Code lang="flux">
        {`var r, e = call dupla(soma);
abort if e;`}
      </Code>
      <Code lang="c">
        {`  FX_LINE(20);
  FxValue t8 = v_soma;
  FxPair t7 = w_dupla(t8);
  FX_LINE(20);
  FxValue v_r = t7.result;
  FxValue v_e = t7.error;
  FX_LINE(21);
  if (v_e.tag != FX_NULL) fx_abort(v_e);`}
      </Code>
      <P>
        O par do {mono('call')} ganha o número de temporário antes dos argumentos ({mono('t7')}, e o argumento é {mono('t8')}). O {mono('stop if e')} num workflow devolve o erro como resultado do workflow:{' '}
        {mono('return fx_pair(fx_null(), v_e);')}, a mesma linha de retorno de um {mono('return null, erro;')}. O {mono('abort if e')} chama {mono('fx_abort')}, que encerra o programa com a mensagem do erro. O{' '}
        {mono('proceed if e')} não gera código além do comentário: a marca de &quot;tratado&quot; é só da análise semântica.
      </P>
      <Code lang="c">
        {`  FX_LINE(6);
  FxValue t8 = fx_new_object();
  fx_obj_set(t8, "command", fx_str("echo"));
  FxValue t9 = fx_new_list();
  fx_list_add(t9, fx_str("oi"));
  fx_obj_set(t8, "flags", t9);
  FxPair t7 = fx_run(t8);
  FxValue v_out = t7.result;
  FxValue v_err = t7.error;
  FX_LINE(7);
  /* proceed if err: o erro conta como tratado */
  return fx_null();`}
      </Code>

      <H2 title="Funções, globais e o main gerado" />
      <P>
        Cada func e cada workflow vira uma função C {mono('static')}. Uma func devolve {mono('FxValue')}; um workflow devolve {mono('FxPair')}. Os parâmetros são {mono('FxValue v_nome')}, ou {mono('void')} se não há. O
        corpo começa com {mono('fx_check_stack();')} (a conferência de pilha do erro R7), seguida de um {mono('FX_LINE')} e do C de cada comando.
      </P>
      <Code lang="c">
        {`static FxPair w_dupla(FxValue v_n)
{
  fx_check_stack();
  FX_LINE(10);
  FxValue t1 = v_n;
  FxPair t0 = w_checa(t1);
  FX_LINE(10);
  FxValue v_r = t0.result;
  FxValue v_e = t0.error;
  FX_LINE(11);
  if (v_e.tag != FX_NULL) return fx_pair(fx_null(), v_e);
  FX_LINE(12);
  FxValue t2 = v_r;
  FxValue t3 = fx_mul(t2, fx_int(2));
  return fx_pair(t3, fx_null());
  return fx_pair(fx_null(), fx_null());
}`}
      </Code>
      <Why>
        {mono('codegen_c.c')}: os protótipos de todas as funções vêm antes de qualquer corpo porque na FluxLang a ordem das funções é livre: uma função pode chamar outra declarada mais abaixo no arquivo.
      </Why>
      <P>
        Os globais viram uma declaração {mono('static FxValue v_nome;')} no topo, sem valor (o C zera as variáveis estáticas, e a etiqueta zero é {mono('FX_NULL')}). O valor inicial é atribuído no começo do programa,
        dentro de {mono('fx_program')}, que o gerador escreve depois dos corpos:
      </P>
      <Code lang="c">
        {`static int fx_program(void) {
  fx_init(__builtin_frame_address(0));
  fx_gc_root(&v_total);
  FX_LINE(1);
  v_total = fx_int(10);
  f_main();
  return 0;
}

int main(void) { return fx_start(fx_program); }`}
      </Code>
      <P>
        A ordem dentro de {mono('fx_program')} é: {mono('fx_init')} com o endereço do quadro de pilha (o início da pilha, para a conferência de pilha e para o coletor); um {mono('fx_gc_root(&v_x)')} por global;
        a inicialização de cada global, na ordem do arquivo, cada uma com o seu {mono('FX_LINE')}; a chamada de {mono('f_main()')}; {mono('return 0')}. O {mono('main')} de C só entrega {mono('fx_program')} a{' '}
        {mono('fx_start')}, da biblioteca (no Windows ela roda o programa numa thread de pilha maior). Um erro de execução ou um {mono('abort if')} encerra o processo antes de chegar no {mono('return 0')}.
      </P>
      <Why>
        {mono('codegen_c.c')}: os globais são raízes do coletor de lixo ({mono('fx_gc_root')}). O coletor acha o que está vivo a partir das raízes e da pilha; uma variável global não está na pilha, então sem o registro um
        valor guardado só nela seria liberado.
      </Why>
      <Why>
        {mono('codegen_c.c')}: os globais são inicializados na ordem do arquivo, dentro do {mono('main')} gerado, antes de {mono('f_main')}. Cada inicializador é calculado com os temporários de {mono('fx_program')}, que
        usa um só contador para todos.
      </Why>
      <Callout kind="aviso">
        A ordem do arquivo vale também para as funções chamadas num inicializador: elas veem os globais declarados depois como {mono('null')}. Medido: com {mono('var a = dobra(1);')} antes de {mono('var b = 5;')}, e {mono('dobra')}{' '}
        multiplicando por {mono('b')}, o programa termina com o erro de execução {mono('Uso de valor null.')} (linha da função), código 1. A análise semântica não barra isso: o uso de uma função num inicializador é permitido.
      </Callout>

      <H2 title="Do C ao executável: o gcc" />
      <P>
        Com {mono('--build')} e {mono('--run')}, {mono('run_codegen')} (em {mono('main.c')}) escreve o C num arquivo temporário e chama {mono('compile_c')}. Os arquivos temporários, o nome do executável, a variável{' '}
        {mono('TMPDIR')} e a tabela das variáveis {mono('FLUX_CC')}, {mono('FLUX_CC_FLAGS')} e {mono('FLUX_CC_WARN')} estão em{' '}
        <PageLink to="compilador/linha-de-comando">Linha de comando e variáveis de ambiente</PageLink>; aqui está o que o {mono('compile_c')} faz com elas.
      </P>
      <H3 title="A linha do compilador de C" />
      <P>
        {mono('compile_c')} monta um vetor de argumentos e o entrega a {mono('run_program')}: o programa de C, {mono('-x c')} (a entrada é C mesmo sem a extensão {mono('.c')}), {mono('-O1')}, {mono('-w')} (ou {mono('-Wall')}),
        {' '}{mono('-static')} (só no Windows), as flags extras, {mono('-o')} com o executável, o arquivo C e {mono('-lm')} (a biblioteca matemática). Medido, com o programa de exemplo e o {mono('FLUX_CC=echo')}, que escreve
        os argumentos em vez de compilar:
      </P>
      <Code lang="bash">
        {`FLUX_CC=echo FLUX_CC_FLAGS="-g -fsanitize=address" ./flux --build -o mini mini.flux
-x c -O1 -w -g -fsanitize=address -o mini /tmp/fluxTEl1Rk -lm
Executável gerado: mini`}
      </Code>
      <P>
        O mesmo, com o alvo Windows (que não usa as flags extras) e os avisos ligados:
      </P>
      <Code lang="bash">
        {`FLUX_CC=echo FLUX_CC_WARN=1 ./flux --build --windows mini.flux
-x c -O1 -Wall -static -o mini.exe /tmp/fluxxXnCwd -lm
Executável gerado: mini.exe`}
      </Code>
      <Why>
        {mono('codegen_c.c')}: os avisos do {mono('gcc')} ficam desligados ({mono('-w')}) porque falam do C gerado, e não da FluxLang; o usuário não pode agir sobre eles. {mono('FLUX_CC_WARN')} os liga
        ({mono('-Wall')}), para depurar o gerador, e {mono('FLUX_CC')} troca o compilador. Medido: qualquer valor liga os avisos, até {mono('FLUX_CC_WARN=0')}, porque só se confere se a variável existe.
      </Why>
      <Why>
        {mono('codegen_c.c')}: o {mono('-static')} do alvo Windows faz o {mono('.exe')} levar junto a libgcc e a winpthreads: ele roda sem DLLs soltas ao lado.
      </Why>
      <Why>
        {mono('codegen_c.c')}: {mono('FLUX_CC_FLAGS')} traz flags extras para o {mono('gcc')} (por exemplo {mono('-fsanitize=address')}, no {mono('make asan')}), separadas por espaço, sem aspas. Elas não valem para
        {' '}{mono('--windows')}: são flags do compilador deste computador, e o MinGW não tem as bibliotecas dos sanitizadores. O limite do vetor deixa passar no máximo 51 flags extras.
      </Why>
      <Callout kind="nota">
        Como {mono('run_program')} usa {mono('execvp')}, o valor de {mono('FLUX_CC')} é só o nome de um programa, achado no {mono('PATH')}; argumentos ali não funcionam. Medido: {mono('FLUX_CC="gcc -O2"')} dá a
        mensagem {mono('gcc -O2: No such file or directory')}, o código 127 (o status do processo filho; o {mono('flux')} em si sai com 3, o que {mono('run_codegen')} devolve) e o erro {mono('Erro interno: o gcc não conseguiu compilar o C gerado')} (o C é mantido e o caminho vai na mensagem). Para flags, use{' '}
        {mono('FLUX_CC_FLAGS')}.
      </Callout>
      <H3 title="Executar o programa e o wine" />
      <P>
        {mono('execute_program')} roda o executável e devolve o código de saída. No Linux, o programa é executado direto. No alvo Windows, é executado pelo {mono('wine')}, e a variável {mono('WINEDEBUG')} é
        definida como {mono('-all')} antes, para o {mono('wine')} não misturar mensagens de depuração à saída do programa. Se o usuário já definiu {mono('WINEDEBUG')}, o valor dele é mantido.
      </P>
      <Why>
        {mono('codegen_c.c')}: no alvo Windows ({mono('--windows')}) o executável é um {mono('.exe')}, feito com o {mono('x86_64-w64-mingw32-gcc')}, ligado estaticamente, e rodado pelo {mono('wine')} no {mono('--run')}.
        Um {mono('.exe')} roda no Linux pelo {mono('wine')}, e o {mono('execute_program')} define {mono('WINEDEBUG=-all')} para rodá-lo sem as mensagens de depuração do {mono('wine')}.
      </Why>

      <H2 title="Exemplo: um programa pequeno e o C gerado" />
      <P>
        O programa abaixo tem um global, uma func, dois workflows e a {mono('main')}, com um {mono('for')}, um {mono('call')} e um {mono('abort if')}. Rodando com {mono('./flux --run')}, ele escreve {mono('34')}:
        a soma dobrada de 1, 2 e 3 é 12, o workflow dobra para 24, e o global soma 10.
      </P>
      <Code lang="flux" example>
        {`var total = 10;
func dobra (n:int):int {
  return n * 2;
}
workflow checa (n:int):int {
  if (n < 0) { return null, "negativo"; }
  return n, null;
}
workflow dupla (n:int):int {
  var r, e = call checa(n);
  stop if e;
  return r * 2, null;
}
func main () {
  var xs = [1, 2, 3];
  var soma = 0;
  for x in xs {
    soma = soma + dobra(x);
  }
  var r, e = call dupla(soma);
  abort if e;
  terminal.log(toString(r + total));
}`}
      </Code>
      <P>
        Com {mono('./flux --c')} o resultado passa de mil linhas, das quais a seção do programa são as últimas cento e poucas. As seções acima mostraram os trechos: o separador e os protótipos, o {mono('w_dupla')}, o laço do
        {' '}{mono('f_main')} e o final com {mono('fx_program')}. A {mono('f_dobra')}, a menor função, é assim:
      </P>
      <Code lang="c">
        {`static FxValue f_dobra(FxValue v_n)
{
  fx_check_stack();
  FX_LINE(3);
  FxValue t0 = v_n;
  FxValue t1 = fx_mul(t0, fx_int(2));
  return t1;
  return fx_null();
}`}
      </Code>
      <P>
        E o início do {mono('f_main')}, com um literal de lista e a declaração de {mono('soma')}:
      </P>
      <Code lang="c">
        {`static FxValue f_main(void)
{
  fx_check_stack();
  FX_LINE(15);
  FxValue t0 = fx_new_list();
  fx_list_add(t0, fx_int(1));
  fx_list_add(t0, fx_int(2));
  fx_list_add(t0, fx_int(3));
  FxValue v_xs = t0;
  FX_LINE(16);
  FxValue v_soma = fx_int(0);`}
      </Code>
      <P>
        Um {mono('if')} com {mono('else')} e um {mono('var')} sem valor, também gerados de verdade:
      </P>
      <Code lang="c">
        {`  FX_LINE(3);
  FxValue t0 = v_n;
  FxValue t1 = fx_eq(t0, fx_int(1));
  if (fx_cond(t1))
  {
    FX_LINE(3);
    FxValue t2 = fx_log(fx_str("um"));
    (void)t2;
  }
  else
  {
    FX_LINE(4);
    FxValue t3 = fx_log(fx_str("outro"));
    (void)t3;
  }`}
      </Code>

      <H2 title="Funções de codegen_c.c" />
      <H3 title="As públicas" />
      <Fn name="generate_c" signature="int generate_c(const Program *program, FILE *file)">
        Escreve em {mono('file')} o programa C completo, nesta ordem: o comentário de abertura; a biblioteca de execução ({mono('flux_runtime_source')}); o separador; as declarações dos globais; os protótipos de
        todas as funções (func, workflow e main); o corpo de cada uma ({mono('gen_func')}); e {mono('fx_program')} com o {mono('main')} de C. Define {mono('out')}, {mono('prog')} e zera {mono('depth')}. No
        {' '}{mono('fx_program')}, zera {mono('next_tmp')}, escreve {mono('fx_init')}, um {mono('fx_gc_root')} por global, a inicialização de cada global com {mono('gen_var')} (com o recuo em 1) e a chamada
        {' '}{mono('f_main()')}. Devolve sempre 0. Chamada só por {mono('run_codegen')}; não dá erro próprio, apenas as falhas de escrita do {mono('FILE *')}, que ela não confere.
      </Fn>
      <Fn name="compile_c" signature="int compile_c(const char *c_path, const char *exe_path)">
        Roda o compilador de C sobre {mono('c_path')} para gerar {mono('exe_path')}. Escolhe o programa ({mono('FLUX_CC')}, ou {mono('x86_64-w64-mingw32-gcc')} no alvo Windows, ou {mono('gcc')}), liga
        {' '}{mono('-w')} ou {mono('-Wall')} ({mono('FLUX_CC_WARN')}), acrescenta {mono('-static')} no Windows e as flags de {mono('FLUX_CC_FLAGS')} (cortadas em espaços com {mono('strtok')} sobre uma cópia, ignoradas no
        Windows, no máximo 51), e termina com {mono('-o exe_path c_path -lm')}. Devolve o código de {mono('run_program')}: o do compilador, 127 se o programa não pôde ser executado, 128 mais o sinal se ele
        morreu por sinal, ou -1 se o {mono('fork')} falhou. {mono('run_codegen')} trata qualquer valor diferente de 0 como falha.
      </Fn>
      <Fn name="execute_program" signature="int execute_program(const char *exe_path)">
        Executa o executável gerado e devolve o código de saída dele. No Linux, o próprio {mono('exe_path')}; no alvo Windows, {mono('wine exe_path')}, depois de {mono('setenv("WINEDEBUG", "-all", 0)')} (o último argumento
        0 não sobrescreve um valor que o usuário já tenha posto). O código vira o código de saída do {mono('flux')} em {mono('--run')}: 0 é sucesso, 1 é um erro de execução ou um {mono('abort if')}, 127 se o
        programa não pôde ser iniciado.
      </Fn>
      <Fn name="set_windows_target" signature="void set_windows_target(void)">
        Liga o alvo Windows. Chamada por {mono('main')} ao ler {mono('--windows')}; não há como desligar.
      </Fn>
      <Fn name="is_windows_target" signature="int is_windows_target(void)">
        Diz se o alvo Windows está ligado. Chamada por {mono('main.c')} ({mono('default_exe_name')} e {mono('run_codegen')}).
      </Fn>
      <H3 title="Saída e auxiliares" />
      <Fn name="emit" signature="static void emit(const char *fmt, ...)">
        Escreve uma linha em {mono('out')}: {mono('depth')} vezes dois espaços, o texto formatado (como o {mono('printf')}) e uma quebra de linha. É o que todo o gerador usa, exceto {mono('signature')} e as partes
        fixas de {mono('generate_c')}, que escrevem direto.
      </Fn>
      <Fn name="fstr" signature="static char *fstr(const char *fmt, ...)">
        Uma string formatada, alocada na arena com {mono('mem_alloc')} (duas passadas de {mono('vsnprintf')}: uma para medir, outra para escrever). Usada para montar os nomes e as expressões C que
        {' '}{mono('expr')} devolve.
      </Fn>
      <Why>
        {mono('codegen_c.c')}: as strings de {mono('fstr')} nunca são liberadas uma a uma. O gerador roda uma vez por processo, então a memória fica na arena do compilador e só é devolvida quando o processo
        termina ({mono('mem_free_all')}, em {mono('main')}).
      </Why>
      <Fn name="find_func" signature="static const Func *find_func(const char *name)">
        Acha pelo nome a func ou o workflow chamado, percorrendo {mono('prog->decls')}. A {mono('main') } é ignorada (não pode ser chamada). Devolve nulo se não há; as duas funções que a usam
        ({mono('gen_call')} e {mono('gen_pair')}) leem o resultado sem conferir, porque a análise semântica garante que o nome existe.
      </Fn>
      <Fn name="float_literal" signature="static char *float_literal(double d)">
        O texto de um literal float em C: {mono('%.17g')} (o suficiente para o valor voltar idêntico), mais {mono('.0')} se o resultado não tem ponto, {mono('e')} nem {mono('E')}, para o C ler um double e não um
        inteiro.
      </Fn>
      <Fn name="coerce" signature="static char *coerce(char *v, const Type *from, const Type *target)">
        Ajusta o valor C {mono('v')}, do tipo {mono('from')}, ao tipo {mono('target')}, como na seção de conversões: {mono('fx_to_float(v)')} de {mono('int')} para {mono('float')}, um {mono('fx_as_*')} para um valor
        dinâmico. Se não há tipo esperado ({mono('target')} nulo), ou se {mono('from')} é desconhecido ou de erro, devolve {mono('v')} sem mudança. Não emite linha: devolve a expressão C. Usada por{' '}
        {mono('convert')} e, no resultado de um {mono('call')}, por {mono('gen_assign')}.
      </Fn>
      <Fn name="convert" signature="static char *convert(Expr *e, const Type *target)">
        Calcula {mono('e')} (com {mono('expr')}) e passa o resultado por {mono('coerce')} com o tipo da expressão e {mono('target')}. Devolve o nome ou a expressão C do resultado.
      </Fn>
      <Fn name="gen_binary" signature="static char *gen_binary(Expr *e)">
        Gera um operador binário. {mono('&&')} e {mono('||')}: o {mono('if')} da seção correspondente. Os demais: calcula o lado esquerdo, depois o direito, e emite um temporário com a função de {mono('binary_fn')}.
        Devolve o nome do temporário.
      </Fn>
      <Code lang="c">
        {`static char *gen_binary(Expr *e) {
  if (e->op == OP_AND || e->op == OP_OR) {
    char *left = expr(e->a);
    char *t = new_tmp();
    emit("FxValue %s = fx_bool(fx_cond(%s));", t, left);
    emit(e->op == OP_AND ? "if (%s.as.b) {" : "if (!%s.as.b) {", t);
    depth++;
    char *right = expr(e->b);
    emit("%s = fx_bool(fx_cond(%s));", t, right);
    depth--;
    emit("}");
    return t;
  }
  char *a = expr(e->a);
  char *b = expr(e->b);
  char *t = new_tmp();
  emit("FxValue %s = %s(%s, %s);", t, binary_fn(e->op), a, b);
  return t;
}`}
      </Code>
      <Fn name="gen_call" signature="static char *gen_call(Expr *c)">
        Gera uma chamada, como na tabela de chamadas: as quatro funções de conversão da biblioteca; uma func do usuário (com os argumentos convertidos para o tipo dos parâmetros, achado por
        {' '}{mono('find_func')}); os métodos de {mono('terminal')} ({mono('input')} com a mensagem opcional e {mono('log')}, {mono('info')}, {mono('warn')} e {mono('error')}, que viram {mono('fx_log')} e as outras); e os
        métodos de lista ({mono('length')}, {mono('push')} e {mono('remove')}). Devolve o nome do temporário com o resultado. Os argumentos são calculados na ordem, antes da linha da chamada. Depois da chamada
        de uma func do usuário, emite {mono('FX_LINE(cur_line);')}.
      </Fn>
      <Fn name="expr" signature="static char *expr(Expr *e)">
        O despachante das expressões, como na tabela de expressões. Os literais simples voltam como um construtor ({mono('fx_int(5)')}); toda outra forma emite uma ou mais linhas e devolve o temporário. O caso padrão
        do {mono('switch')} é o {mono('EX_OBJECT')}. É declarada antes das outras funções ({mono('static char *expr(Expr *e);')}) porque {mono('convert')}, {mono('gen_binary')} e {mono('gen_call')} a chamam
        e ela as chama.
      </Fn>
      <H3 title="Funções dos comandos" />
      <Fn name="gen_pair" signature="static char *gen_pair(Rhs *r)">
        Gera o lado direito de um {mono('call')} ou {mono('run')} e devolve o temporário que guarda o {mono('FxPair')}. Para {mono('run')}: {mono('fx_run(spec)')} sobre o objeto de opções. Para {mono('call')}:{' '}
        {mono('w_nome(args)')}, com os argumentos convertidos, seguido de {mono('FX_LINE(cur_line);')}. O número do temporário do par é pedido antes do dos argumentos.
      </Fn>
      <Fn name="gen_var" signature="static void gen_var(Stmt *s, int global)">
        Gera um {mono('var')} ou {mono('const')}. Sem valor: cada nome recebe {mono('fx_null()')}. Com valores: calcula todos (convertidos para o tipo declarado, se há) e depois emite uma declaração por nome; com
        {' '}{mono('call')} ou {mono('run')}: emite {mono('t.result')} para o primeiro nome e {mono('t.error')} para o segundo. Com {mono('global')} igual a 1, emite só a atribuição, sem o tipo {mono('FxValue')}, porque o
        global já foi declarado no topo do arquivo.
      </Fn>
      <Fn name="place_of" signature="static Place place_of(Expr *target)">
        Calcula a parte de um alvo que é expressão e devolve um {mono('Place')} ({mono('target')}, {mono('base')}, {mono('idx')}): nada para um nome; a base para um campo; a base e depois o índice para um
        índice, cada um num temporário. Chamada para todos os alvos antes de qualquer valor.
      </Fn>
      <Fn name="store" signature="static void store(Place p, const char *value)">
        Escreve o valor {mono('value')} (um temporário ou uma expressão) no lugar {mono('p')}: {mono('v_x = value;')} para um nome, {mono('fx_set_field(base, "campo", value)')} para um campo e
        {' '}{mono('fx_set_index(base, indice, value)')} para um índice, com a base e o índice que {mono('place_of')} já calculou.
      </Fn>
      <Fn name="gen_assign" signature="static void gen_assign(Stmt *s)">
        Gera uma atribuição. Primeiro {mono('place_of')} de cada alvo, na ordem. Com valores: calcula todos (convertidos para o tipo do alvo correspondente) e só então grava um a um com {mono('store')}. Com{' '}
        {mono('call')} ou {mono('run')}: o par, {mono('store')} do {mono('.result')} no primeiro alvo (pelo {mono('coerce')} com o tipo de retorno do workflow e o tipo do alvo) e do {mono('.error')} no segundo.
      </Fn>
      <Fn name="gen_block" signature="static void gen_block(Stmt *block)">
        Escreve {mono('{')}, sobe o recuo, gera cada comando do bloco, desce o recuo e escreve {mono('}')}.
      </Fn>
      <Fn name="gen_return" signature="static void gen_return(Stmt *s)">
        Gera um {mono('return') } pela função atual ({mono('cur_func')}), como na seção de retorno: no workflow, {mono('fx_pair(resultado, erro)')}; na func com valor, o valor convertido; sem valor,
        {' '}{mono('fx_null()')}.
      </Fn>
      <Fn name="gen_stmt" signature="static void gen_stmt(Stmt *s)">
        O despachante dos comandos, como na tabela de comandos. Grava a linha em {mono('cur_line')} e emite {mono('FX_LINE(n);')} (exceto para bloco, {mono('break')} e {mono('continue')}; no {mono('while')}, dentro do
        laço) e depois o C do comando. É declarada antes de
        {' '}{mono('gen_pair')} e das outras ({mono('static void gen_stmt(Stmt *s);')}) porque {mono('gen_block')} a chama e ela chama {mono('gen_block')}.
      </Fn>
      <H3 title="Funções e execução" />
      <Fn name="signature" signature="static void signature(const Func *f, int with_semicolon)">
        Escreve a linha de declaração de uma função: {mono('static FxValue f_nome(FxValue v_a, ...)')} ou {mono('static FxPair w_nome(...)')}, com {mono('void')} se não há parâmetros, e um {mono(';')} no fim se
        {' '}{mono('with_semicolon')} (o protótipo). Escreve direto em {mono('out')}, sem recuo.
      </Fn>
      <Fn name="gen_func" signature="static void gen_func(const Func *f)">
        Gera o corpo de uma função: define {mono('cur_func')}, zera {mono('next_tmp')}, escreve a assinatura, {mono('{')}, {mono('fx_check_stack();')}, cada comando do corpo, o retorno de reserva e {mono('}')},
        com uma linha em branco depois. Volta {mono('cur_func')} a nulo.
      </Fn>
      <Fn name="run_program" signature="static int run_program(char *const argv[])">
        Executa {mono('argv')} e devolve o código de saída. O filho faz {mono('execvp')}; se não consegue, escreve a mensagem do sistema e sai com 127. O pai espera com {mono('waitpid')}. Devolve o código do
        filho, 128 mais o número do sinal se ele morreu por um, ou -1 se o {mono('fork')} falhou. Usada por {mono('compile_c')} e {mono('execute_program')}.
      </Fn>
      <H3 title="Auxiliares triviais" />
      <Table
        head={['Função', 'O que faz']}
        rows={[
          [mono('new_tmp()'), <>Devolve {mono('"tN"')} com o próximo número de {mono('next_tmp')}, que cresce.</>],
          [mono('binary_fn(op)'), <>O nome da função da biblioteca de cada operador binário ({mono('fx_add')}, ..., {mono('fx_ne')} para o resto).</>],
          [mono('join_args(args, n)'), <>Junta os {mono('n')} nomes de argumentos separados por {mono(', ')}.</>],
        ]}
      />
    </>
  )
}
