import { Callout, Code, Diagram, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

interface Cell {
  label: string
  note: string
  x: number
  width: number
}

const CELLS: Cell[] = [
  { label: 'tag', note: 'FxTag, 4 bytes', x: 10, width: 130 },
  { label: 'preenchimento', note: '4 bytes', x: 140, width: 130 },
  { label: 'as (a união)', note: '8 bytes: i, f, b, s, l ou o', x: 270, width: 300 },
]

function ValueDiagram() {
  return (
    <svg viewBox="0 0 590 150" width="590" height="150" className="block max-w-none">
      <text x="10" y="18" fontSize="13" fontWeight="600" className="fill-ink">
        FxValue: 16 bytes
      </text>
      {CELLS.map((c, i) => (
        <g key={c.label}>
          <rect x={c.x} y="30" width={c.width} height="44" strokeWidth="1.25" className={i === 2 ? 'fill-panel stroke-accent' : 'fill-bg stroke-line'} />
          <text x={c.x + 10} y="50" fontSize="13" fontWeight="600" fontFamily="monospace" className="fill-ink">
            {c.label}
          </text>
          <text x={c.x + 10} y="66" fontSize="11" className="fill-muted">
            {c.note}
          </text>
        </g>
      ))}
      <text x="10" y="104" fontSize="12" fontFamily="monospace" className="fill-ink">
        FX_INT: as.i (int32_t)   FX_FLOAT: as.f (double)   FX_BOOL: as.b (0 ou 1)
      </text>
      <text x="10" y="124" fontSize="12" fontFamily="monospace" className="fill-ink">
        FX_STRING: as.s (const char *)   FX_LIST: as.l (FxList *)   FX_OBJECT: as.o (FxObj *)
      </text>
      <text x="10" y="144" fontSize="11" className="fill-muted">
        FX_NULL não usa a união: o construtor a zera.
      </text>
    </svg>
  )
}

export function Runtime() {
  return (
    <>
      <H2 title="O papel da biblioteca de execução" />
      <P>
        {mono('src/backend/runtime/flux_rt.h')} é a biblioteca que todo programa gerado usa. O <PageLink to="compilador/gerador-c">gerador de C</PageLink> só escreve chamadas a ela ({mono('fx_add(a, b)')},{' '}
        {mono('fx_index(l, i)')}, {mono('fx_log(x)')}, ...) e o cabeçalho, copiado inteiro para dentro do arquivo gerado, faz o trabalho de verdade: os valores, os operadores, as conferências de tipo, os erros de
        execução R1 a R7, o {mono('terminal')}, o {mono('run')}, a entrada do programa e o <PageLink to="compilador/coletor">coletor de lixo</PageLink>. É um arquivo só, em C, sem {mono('.c')} correspondente e sem
        biblioteca externa além da do sistema.
      </P>
      <Table
        head={['', 'Detalhe']}
        rows={[
          ['Quem a embute', <>O Makefile transforma o cabeçalho em {mono('build/runtime_src.c')}; {mono('generate_c')} escreve esse texto no começo de cada programa gerado (<PageLink to="compilador/gerador-c">Gerador de C</PageLink>).</>],
          ['Quem a chama', <>O código C gerado: {mono('fx_init')}, {mono('fx_start')}, {mono('FX_LINE')}, {mono('fx_check_stack')} e todas as {mono('fx_*')} das expressões e dos comandos.</>],
          ['Entrada', <>Valores {mono('FxValue')}, as variáveis de ambiente {mono('FLUX_TAGGED')}, {mono('FLUX_GC')}, {mono('FLUX_GC_STRESS')}, {mono('FLUX_GC_STATS')}, {mono('NO_COLOR')} e {mono('FORCE_COLOR')}, e a entrada padrão do programa.</>],
          ['Saída', <>Texto na saída padrão e na de erro, o código de saída do processo (0, 1 ou 2) e, no {mono('run')}, os processos filhos.</>],
          ['Depende de', <>A biblioteca C padrão em todo lugar; {mono('fork')}, {mono('execvp')}, {mono('poll')}, {mono('waitpid')}, {mono('getrlimit')} no POSIX; {mono('CreateProcess')}, {mono('CreateThread')} e outras da API do Windows no Windows.</>],
          ['O que não tem', <>Nenhuma função fora do arquivo: tudo é {mono('static')}. Nenhuma thread extra no POSIX. Nenhuma liberação manual: a memória do programa é do coletor.</>],
        ]}
      />
      <H3 title="Como entra no programa" />
      <P>
        O arquivo gerado tem uma constante de texto com o cabeçalho inteiro: no Makefile, um {mono('sed')} protege cada barra invertida e cada aspa dupla, põe aspas no começo de cada linha e {mono('\\n"')} no fim.
        Por isso o texto do cabeçalho tem de continuar sendo C válido linha a linha depois da transformação: qualquer {mono('\\n')}, {mono('\\x1e')}, {mono('\\033')} ou string de {mono('asm')} dentro dele só
        sobrevive porque a barra é dobrada ao embutir. A mecânica do Makefile e a do {mono('fputs')} estão em <PageLink to="compilador/mapa-e-build">Mapa do repositório e build</PageLink>.
      </P>
      <Fn name="FX_FN" signature="#define FX_FN static __attribute__((unused))">
        Marca toda função da biblioteca. {mono('static')} porque o arquivo gerado é uma unidade só e nada é exportado; {mono('unused')} porque um programa pequeno não usa a maior parte das funções, e o
        compilador de C não deve avisar das que ficaram sem uso (os avisos ficam desligados no {mono('gcc')} de qualquer jeito, salvo com {mono('FLUX_CC_WARN=1')}).
      </Fn>
      <Fn name="fx_isatty" signature="#define fx_isatty _isatty (Windows)  |  #define fx_isatty isatty (POSIX)">
        O mesmo nome para a pergunta &quot;este descritor é um terminal?&quot; nos dois sistemas. Só {mono('fx_use_color')} o usa.
      </Fn>
      <Fn name="__USE_MINGW_ANSI_STDIO" signature="#define __USE_MINGW_ANSI_STDIO 1  (só no Windows, se ainda não definido)">
        Liga, no MinGW, o {mono('printf')} do padrão C, para {mono('%zu')} e {mono('%lld')} saírem certos.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: a definição existe para o {mono('printf')} do MinGW entender {mono('%zu')} e {mono('%lld')} direito. A biblioteca usa {mono('%zu')} em {mono('fx_emit')} (o tamanho do registro
        etiquetado) e em {mono('fx_gc_report')}, e a linha vem antes de qualquer {mono('#include')}. Duas afirmações da nota que havia no código não foram verificadas aqui: que, sem a definição, o MinGW pode cair
        no {mono('printf')} da biblioteca da Microsoft, que em versões antigas não conhece esses formatos; e que o cabeçalho do MinGW lê a definição no momento em que é incluído (daí a posição antes dos{' '}
        {mono('#include')}). Também não verificado: o efeito da ausência da definição (a suíte do {mono('wine')} passa com ela).
      </Why>

      <H2 title="FxValue: a representação dos valores" />
      <P>
        Todo valor da linguagem, em qualquer ponto da execução, é um {mono('FxValue')}: uma etiqueta ({mono('FxTag')}) e uma união com o conteúdo. Uma variável {mono('int')}, uma lista, um campo de objeto e o
        resultado de uma soma têm o mesmo tipo em C.
      </P>
      <Code lang="c">
        {`typedef enum { FX_NULL, FX_INT, FX_FLOAT, FX_BOOL, FX_STRING, FX_LIST, FX_OBJECT } FxTag;

typedef struct FxList FxList;
typedef struct FxObj FxObj;

typedef struct {
  FxTag tag;
  union {
    int32_t i;
    double f;
    int b;
    const char *s;
    FxList *l;
    FxObj *o;
  } as;
} FxValue;`}
      </Code>
      <Diagram
        title="O FxValue na memória (sizeof é 16 numa máquina de 64 bits, medido)"
        label="Três caixas lado a lado: tag com 4 bytes, preenchimento de 4 bytes e a união as com 8 bytes. Abaixo, qual campo da união cada etiqueta usa."
      >
        <ValueDiagram />
      </Diagram>
      <Why>
        {mono('flux_rt.h')}: como {mono('null')} vale para qualquer tipo e o valor de um campo de {mono('object')} é dinâmico (decisão D1), um tipo único com etiqueta evita casos especiais. Os operadores
        conferem as etiquetas e dão os erros R1 a R6; o gerador não precisa de um tipo C por tipo da linguagem, só de {mono('FxValue')}.
      </Why>
      <Table
        head={['Etiqueta', 'Campo da união', 'Tipo da linguagem', 'Construtor']}
        rows={[
          [mono('FX_NULL'), 'nenhum', mono('null'), mono('fx_null()')],
          [mono('FX_INT'), <>{mono('i')}, {mono('int32_t')}</>, mono('int'), mono('fx_int(i)')],
          [mono('FX_FLOAT'), <>{mono('f')}, {mono('double')}</>, mono('float'), mono('fx_float(f)')],
          [mono('FX_BOOL'), <>{mono('b')}, {mono('int')} (0 ou 1)</>, mono('bool'), mono('fx_bool(b)')],
          [mono('FX_STRING'), <>{mono('s')}, ponteiro para bytes terminados em zero</>, mono('string'), mono('fx_str(s)')],
          [mono('FX_LIST'), <>{mono('l')}, {mono('FxList *')}</>, mono('list<tipo>'), mono('fx_new_list()')],
          [mono('FX_OBJECT'), <>{mono('o')}, {mono('FxObj *')}</>, mono('object'), mono('fx_new_object()')],
        ]}
      />
      <H3 title="Lista, objeto e par: o que mora no heap" />
      <P>
        Um inteiro, um float, um bool e o {mono('null')} cabem dentro do {mono('FxValue')} e são copiados por valor. Texto, lista e objeto ficam no heap, e o {mono('FxValue')} só guarda o ponteiro. Para lista e
        objeto isso é a semântica da linguagem: são referências (decisão D2), então {mono('var b = a;')} não copia, e passar a uma função também não.
      </P>
      <Why>
        {mono('flux_rt.h')}: {mono('FxList')} e {mono('FxObj')} ficam no heap e o {mono('FxValue')} só guarda o ponteiro (decisão D2: lista e objeto são referências). Nada é liberado pelo programa: ele roda e
        termina. O que o texto do cabeçalho original dizia sobre &quot;nada é liberado&quot; hoje tem uma ressalva: o <PageLink to="compilador/coletor">coletor de lixo</PageLink> libera, durante a execução, o
        que ninguém mais alcança.
      </Why>
      <Code lang="c">
        {`struct FxList {
  int n, cap;
  FxValue *v;
};

struct FxObj {
  int n, cap;
  const char **keys;
  FxValue *vals;
};

typedef struct {
  FxValue result, error;
} FxPair;`}
      </Code>
      <Table
        head={['Estrutura', 'Campos', 'Invariantes']}
        rows={[
          [mono('FxList'), <>{mono('n')} elementos usados, {mono('cap')} espaço do buffer, {mono('v')} o buffer de {mono('FxValue')}.</>, <>{mono('n <= cap')}. O buffer cresce de 4 e dobra; as vagas depois do último elemento valem {mono('null')}.</>],
          [mono('FxObj'), <>{mono('n')} campos, {mono('cap')} espaço, {mono('keys')} as chaves e {mono('vals')} os valores, em dois vetores paralelos.</>, <>Ordem de inserção; chaves sem repetição (a busca é linear com {mono('strcmp')}). As chaves não são copiadas: são o texto que veio do código (literal) ou um texto do heap.</>],
          [mono('FxPair'), <>{mono('result')} e {mono('error')}.</>, <>É o retorno de um workflow, de um {mono('call')} e de um {mono('run')}. Fora disso o gerador só usa {mono('FxValue')}.</>],
        ]}
      />

      <H2 title="Construtores e acessos básicos" />
      <Fn name="fx_null" signature="FX_FN FxValue fx_null(void)">
        Devolve o {mono('null')}: etiqueta {mono('FX_NULL')} e união zerada. É o retorno de qualquer função que não devolve valor, e o que o {mono('terminal.log')} e os outros devolvem.
      </Fn>
      <Fn name="fx_int" signature="FX_FN FxValue fx_int(int32_t i)">
        Um {mono('FX_INT')} com {mono('as.i = i')}. Os literais inteiros do código viram {mono('fx_int(5)')} direto, sem temporário.
      </Fn>
      <Fn name="fx_float" signature="FX_FN FxValue fx_float(double f)">
        Um {mono('FX_FLOAT')} com {mono('as.f = f')}.
      </Fn>
      <Fn name="fx_bool" signature="FX_FN FxValue fx_bool(int b)">
        Um {mono('FX_BOOL')} com {mono('as.b = (b != 0)')}: qualquer valor diferente de zero vira 1.
      </Fn>
      <Fn name="fx_str" signature="FX_FN FxValue fx_str(const char *s)">
        Um {mono('FX_STRING')} que aponta para {mono('s')}, sem copiar. O texto é um literal do programa (não é bloco do coletor) ou um bloco criado por {mono('fx_alloc')}, {mono('fx_concat')} ou {mono('fx_dup_printf')}.
      </Fn>
      <Fn name="fx_new_list" signature="FX_FN FxValue fx_new_list(void)">
        Cria uma lista vazia: aloca um {mono('FxList')} zerado (bloco do tipo {mono('FXB_LIST')}) e devolve um {mono('FX_LIST')} para ele. O literal {mono('[a, b]')} vira {mono('fx_new_list()')} e uma
        chamada de {mono('fx_list_add')} por elemento. Pode disparar uma coleta de lixo.
      </Fn>
      <Fn name="fx_new_object" signature="FX_FN FxValue fx_new_object(void)">
        Cria um objeto vazio: aloca um {mono('FxObj')} zerado (bloco {mono('FXB_OBJ')}). O literal {mono('{ k: v }')} vira {mono('fx_new_object()')} e um {mono('fx_obj_set')} por campo. Pode disparar uma coleta.
      </Fn>
      <Fn name="fx_pair" signature="FX_FN FxPair fx_pair(FxValue result, FxValue error)">
        Monta o {mono('FxPair')}. O gerador a usa no {mono('return r, e;')} de um workflow, no fim natural dele ({mono('fx_pair(fx_null(), fx_null())')}) e no {mono('stop if')}; a biblioteca, no resultado de{' '}
        {mono('run')}.
      </Fn>
      <Fn name="FX_LINE" signature="#define FX_LINE(n) (fx_line = (n))">
        Grava em {mono('fx_line')}, uma variável global, a linha do comando que vai rodar. O gerador emite {mono('FX_LINE(n)')} antes de cada comando (e antes de cada inicializador global), a cada volta de um{' '}
        {mono('while')} antes da condição, e de novo logo depois de cada chamada de func do usuário e de cada {mono('call')}, com a linha do comando que chamou. É de onde {mono('fx_die')} tira o número da linha
        da mensagem.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: {mono('fx_line')} é uma variável só, e a função chamada a muda a cada comando dela. Por isso quem chama a grava de novo quando a chamada volta: o que vem depois da chamada no
        mesmo comando dá o erro com a linha desse comando. Medido, com {mono('var x = f(f(2)) + 1 / z;')} na linha 10 e o último comando de {mono('f')} na linha 6: a divisão por zero sai com{' '}
        {mono('[linha 10]')} (antes da correção saía {mono('[linha 6]')}). Um erro dentro da função chamada continua com a linha dela, porque a restauração só acontece na volta. Os detalhes estão em{' '}
        <PageLink to="compilador/gerador-c">Gerador de C</PageLink>, na seção de comandos.
      </Why>

      <H2 title="Listas, objetos e índices" />
      <P>
        As funções desta seção implementam {mono('l[i]')}, {mono('o.campo')}, {mono('o["chave"]')}, as atribuições a eles e os três métodos de lista. Os erros que podem levantar são o R2 (índice fora
        da lista), o R3 (a base é {mono('null')}) e o R5 (a base ou o índice têm outra etiqueta); todos vêm de {mono('fx_index_of')}, {mono('fx_as_list_ptr')}, {mono('fx_as_obj_ptr')} e {mono('fx_type_err')}.
      </P>
      <Fn name="fx_list_add" signature="FX_FN void fx_list_add(FxValue list, FxValue v)">
        Acrescenta {mono('v')} ao fim da lista (que já tem de ser uma lista: não confere a etiqueta). Se o buffer está cheio, cria um bloco novo do dobro do tamanho (4 na primeira vez), copia os elementos e
        troca o ponteiro; o buffer velho vira lixo para o coletor. Chamada por {mono('fx_push')} e pelo literal de lista.
      </Fn>
      <Fn name="fx_as_list_ptr" signature="FX_FN FxList *fx_as_list_ptr(FxValue v)">
        Devolve o {mono('FxList *')} de {mono('v')}, ou dá o erro R5 (&quot;Esperado list, encontrado ...&quot;; R3 se for {mono('null')}) se a etiqueta não for {mono('FX_LIST')}.
      </Fn>
      <Fn name="fx_as_obj_ptr" signature="FX_FN FxObj *fx_as_obj_ptr(FxValue v)">
        O mesmo para {mono('FX_OBJECT')}: devolve o {mono('FxObj *')} ou dá R5 (R3 com {mono('null')}).
      </Fn>
      <Fn name="fx_obj_find" signature="FX_FN int fx_obj_find(const FxObj *o, const char *key)">
        Procura {mono('key')} nas chaves do objeto, em ordem, com {mono('strcmp')}. Devolve a posição ou -1. A busca é linear: um objeto não tem índice. É usada também por {mono('fx_run')} para ler os campos do
        pedido.
      </Fn>
      <Fn name="fx_obj_put" signature="FX_FN void fx_obj_put(FxObj *o, const char *key, FxValue v)">
        Grava o campo. Se a chave já existe, troca o valor; se não, cria o campo no fim (o vetor de chaves e o de valores crescem juntos, de 4 e dobrando, cada um num bloco novo, e os velhos viram lixo).
      </Fn>
      <Why>
        {mono('flux_rt.h')}: atribuir a um campo que não existe cria o campo (e ler um campo que não existe devolve {mono('null')}, ver {mono('fx_field')}). É o comportamento de objeto dinâmico, como JSON, que a
        linguagem escolheu; a biblioteca só o implementa assim em {mono('fx_obj_put')}.
      </Why>
      <Fn name="fx_obj_set" signature="FX_FN void fx_obj_set(FxValue obj, const char *key, FxValue v)">
        {mono('fx_obj_put')} sobre o objeto de um {mono('FxValue')}, sem conferir a etiqueta. O literal de objeto usa essa função: o objeto acabou de ser criado por {mono('fx_new_object')}.
      </Fn>
      <Fn name="fx_field" signature="FX_FN FxValue fx_field(FxValue base, const char *key)">
        Lê {mono('base.key')}. {mono('base')} tem de ser um objeto (senão R5, ou R3 com {mono('null')}). Um campo que não existe dá {mono('null')}, sem erro.
      </Fn>
      <Fn name="fx_set_field" signature="FX_FN void fx_set_field(FxValue base, const char *key, FxValue v)">
        {mono('base.key = v')}: confere que {mono('base')} é um objeto e chama {mono('fx_obj_put')}.
      </Fn>
      <Fn name="fx_index_of" signature="FX_FN int32_t fx_index_of(FxValue idx, const FxList *l)">
        Valida um índice de lista: {mono('idx')} tem de ser {mono('int')} (R5 com outra etiqueta, R3 com {mono('null')}) e estar entre 0 e {mono('l->n - 1')}; senão o R2, com a mensagem{' '}
        {mono('Índice 5 fora da lista (tamanho 2).')} Devolve o índice. Chamada por {mono('fx_index')}, {mono('fx_set_index')} e {mono('fx_remove')}.
      </Fn>
      <Fn name="fx_index" signature="FX_FN FxValue fx_index(FxValue base, FxValue idx)">
        {mono('base[idx]')}. Se {mono('base')} é uma lista, devolve o elemento ({mono('fx_index_of')} valida o índice). Se é um objeto, {mono('idx')} tem de ser texto e o resultado é {mono('fx_field')}. Qualquer outra
        etiqueta dá R5 com &quot;list ou object&quot; (R3 se for {mono('null')}).
      </Fn>
      <Fn name="fx_set_index" signature="FX_FN void fx_set_index(FxValue base, FxValue idx, FxValue v)">
        {mono('base[idx] = v')}: lista (índice validado) ou objeto (chave de texto, {mono('fx_obj_put')}). Qualquer outra etiqueta dá R5 ou R3.
      </Fn>
      <Fn name="fx_length" signature="FX_FN FxValue fx_length(FxValue l)">
        {mono('l.length()')}: confere a lista e devolve {mono('fx_int(n)')}.
      </Fn>
      <Fn name="fx_push" signature="FX_FN FxValue fx_push(FxValue l, FxValue v)">
        {mono('l.push(v)')}: confere que {mono('l')} é lista, chama {mono('fx_list_add')} e devolve {mono('null')} (o método não devolve valor).
      </Fn>
      <Fn name="fx_remove" signature="FX_FN FxValue fx_remove(FxValue list, FxValue idx)">
        {mono('l.remove(i)')}: valida o índice com {mono('fx_index_of')}, desloca os elementos seguintes uma posição para trás com {mono('memmove')}, diminui {mono('n')} e devolve {mono('null')}.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: depois de remover, a vaga que sobrou no fim do buffer recebe {mono('null')}. O coletor varre o buffer inteiro, até {mono('cap')}, e uma vaga com o valor antigo seguraria viva uma
        lista, um objeto ou um texto que o programa já esqueceu.
      </Why>
      <Fn name="fx_for_list" signature="FX_FN FxList *fx_for_list(FxValue v)">
        O {mono('for item in lista')}: confere que o valor é uma lista e devolve o {mono('FxList *')}. O gerador percorre {mono('l->v[i]')} com um {mono('for')} de C e relê {mono('l->n')} a cada volta, então uma
        lista que muda durante o laço é percorrida até o tamanho novo.
      </Fn>

      <H2 title="Conferência de tipo na execução: fx_as_*" />
      <P>
        O valor de um campo de objeto é dinâmico: a linguagem só descobre o tipo na execução. Quando esse valor vai para uma variável ou um parâmetro com tipo declarado, o gerador o passa por uma função{' '}
        {mono('fx_as_')} que confere a etiqueta (o erro R5). As seis funções têm a mesma forma: devolvem o próprio valor se a etiqueta serve, e chamam {mono('fx_type_err')} se não.
      </P>
      <Why>
        {mono('flux_rt.h')}: {mono('null')} passa em todas as conferências, porque {mono('null')} vale para qualquer tipo. E {mono('fx_as_float')} aceita também {mono('int')} e o promove a {mono('float')}: é a
        única conversão implícita da linguagem. Medido: com {mono('var o = {a: 1};')}, {mono('var f: float = o.a;')} roda sem erro e {mono('f / 2')} dá {mono('0.5')}.
      </Why>
      <Fn name="fx_as_int" signature="FX_FN FxValue fx_as_int(FxValue v)">
        Devolve {mono('v')} se a etiqueta é {mono('FX_INT')} ou {mono('FX_NULL')}; senão R5 (&quot;Esperado int, encontrado ...&quot;).
      </Fn>
      <Fn name="fx_as_bool" signature="FX_FN FxValue fx_as_bool(FxValue v)">
        O mesmo para {mono('FX_BOOL')}.
      </Fn>
      <Fn name="fx_as_string" signature="FX_FN FxValue fx_as_string(FxValue v)">
        O mesmo para {mono('FX_STRING')}.
      </Fn>
      <Fn name="fx_as_list" signature="FX_FN FxValue fx_as_list(FxValue v)">
        O mesmo para {mono('FX_LIST')}. Não confunda com {mono('fx_as_list_ptr')}, que devolve o ponteiro.
      </Fn>
      <Fn name="fx_as_object" signature="FX_FN FxValue fx_as_object(FxValue v)">
        O mesmo para {mono('FX_OBJECT')}.
      </Fn>
      <Fn name="fx_as_float" signature="FX_FN FxValue fx_as_float(FxValue v)">
        Se a etiqueta é {mono('FX_INT')}, devolve o {mono('double')} correspondente como {mono('FX_FLOAT')}; se é {mono('FX_FLOAT')} ou {mono('FX_NULL')}, devolve {mono('v')}; senão R5.
      </Fn>

      <H2 title="Operadores" />
      <P>
        Cada operador da linguagem é uma função que recebe dois {mono('FxValue')} (um, nos unários) e devolve outro. Primeiro confere as etiquetas: {mono('null')} em qualquer operando numérico dá R3, e uma
        etiqueta que o operador não aceita dá R5. A tabela resume o que cada um faz.
      </P>
      <Table
        head={['Operador', 'Função', 'Aceita', 'Resultado e erros']}
        rows={[
          [mono('+'), mono('fx_add'), <>{mono('string')} com {mono('string')}; ou dois números</>, <>Texto: concatena num bloco novo. Números: {mono('int')} com {mono('int')} dá {mono('int')} (R6 se estoura); se um é {mono('float')}, o resultado é {mono('float')}. Texto com outro tipo: R5; com {mono('null')}: R3.</>],
          [<>{mono('-')}, {mono('*')}</>, <>{mono('fx_sub')}, {mono('fx_mul')}</>, 'dois números', <>Como a soma, sem texto. R6 em {mono('int')} que estoura.</>],
          [mono('/'), mono('fx_div'), 'dois números', <>{mono('int')} por {mono('int')}: divisão inteira, truncada para zero (7 / 2 é 3, -7 / 2 é -3); divisor 0 é R4; {mono('INT32_MIN / -1')} é R6. Com algum {mono('float')}: IEEE, {mono('x / 0.0')} dá {mono('inf')} sem erro.</>],
          [mono('%'), mono('fx_mod'), <>só {mono('int')}</>, <>Resto de C (-7 % 3 é -1). Divisor 0 é R4. Divisor -1 dá 0 sem calcular. Um {mono('float')} é R5.</>],
          [mono('- (unário)'), mono('fx_neg'), 'um número', <>{mono('-INT32_MIN')} é R6. {mono('float')} só troca o sinal.</>],
          [<>{mono('<')}, {mono('<=')}, {mono('>')}, {mono('>=')}</>, <>{mono('fx_lt')}, {mono('fx_le')}, {mono('fx_gt')}, {mono('fx_ge')}</>, 'dois números', <>{mono('bool')}. {mono('int')} e {mono('float')} se comparam promovendo o {mono('int')}. Com {mono('nan')} os quatro dão {mono('false')}.</>],
          [<>{mono('==')}, {mono('!=')}</>, <>{mono('fx_eq')}, {mono('fx_ne')}</>, 'qualquer par', <>{mono('bool')}. Ver as regras abaixo; nunca dá erro.</>],
          [mono('!'), mono('fx_not'), <>só {mono('bool')}</>, <>Nega. Não há valor verdadeiro ou falso: {mono('!1')} é R5.</>],
        ]}
      />
      <Code lang="c">
        {`FX_FN FxValue fx_add(FxValue a, FxValue b) {
  if (a.tag == FX_STRING && b.tag == FX_STRING)
    return fx_str(fx_concat(a.as.s, b.as.s));
  if (a.tag == FX_STRING || b.tag == FX_STRING) {
    if (a.tag == FX_NULL || b.tag == FX_NULL)
      fx_null_use();
    fx_type_err("string", a.tag == FX_STRING ? b : a);
  }
  fx_need_nums(a, b);
  if (a.tag == FX_INT && b.tag == FX_INT) {
    int32_t r;
    if (__builtin_add_overflow(a.as.i, b.as.i, &r))
      fx_die("Estouro de inteiro.");
    return fx_int(r);
  }
  return fx_float(fx_num(a) + fx_num(b));
}`}
      </Code>
      <P>
        O estouro de {mono('int')} (R6) é detectado com {mono('__builtin_add_overflow')}, {mono('__builtin_sub_overflow')} e {mono('__builtin_mul_overflow')}, extensões do {mono('gcc')} e do {mono('clang')}
        que devolvem verdadeiro se o resultado de 32 bits não cabe. O resultado em {mono('int32_t')} nunca dá a volta em silêncio: a decisão D7 da linguagem é que estouro é erro.
      </P>
      <H3 title="Igualdade" />
      <P>
        {mono('fx_equal')} decide {mono('==')} e {mono('!=')} sem nunca dar erro, em ordem: (1) se um lado é {mono('null')}, são iguais só se os dois são {mono('null')}; (2) dois números se comparam como
        números, {mono('int')} com {mono('int')} por inteiros e os demais como {mono('double')}, então {mono('1 == 1.0')} é verdadeiro (decisão D6) e {mono('nan == nan')} é falso; (3) etiquetas diferentes são
        diferentes; (4) {mono('bool')} por valor, texto por conteúdo ({mono('strcmp')}), lista e objeto por identidade (o mesmo ponteiro). A análise semântica impede {mono('list == list')} no código, mas um valor de campo de
        objeto é dinâmico e pode chegar até aqui. Medido: com {mono('o = { x: [1], y: [1] }')}, {mono('o.x == o.y')} é {mono('false')} e {mono('o.x == o.x')} é {mono('true')}.
      </P>
      <H3 title="Funções dos operadores" />
      <Fn name="fx_is_num" signature="FX_FN int fx_is_num(FxValue v)">
        Verdadeiro se a etiqueta é {mono('FX_INT')} ou {mono('FX_FLOAT')}.
      </Fn>
      <Fn name="fx_num" signature="FX_FN double fx_num(FxValue v)">
        O valor numérico de um {mono('int')} ou {mono('float')} como {mono('double')}. Não confere a etiqueta: só vale depois de {mono('fx_is_num')} ou {mono('fx_need_nums')}.
      </Fn>
      <Fn name="fx_need_nums" signature="FX_FN void fx_need_nums(FxValue a, FxValue b)">
        Confere os dois operandos de um operador numérico: se algum é {mono('null')}, R3; se algum não é número, R5 com &quot;int ou float&quot;. Não devolve nada: só volta se os dois servem.
      </Fn>
      <Fn name="fx_concat" signature="FX_FN const char *fx_concat(const char *a, const char *b)">
        Junta dois textos num bloco novo de {mono('strlen(a) + strlen(b) + 1')} bytes, criado por {mono('fx_alloc')} (pode disparar uma coleta, e os dois textos de entrada têm de continuar alcançáveis; eles estão
        nos argumentos, na pilha).
      </Fn>
      <Fn name="fx_add" signature="FX_FN FxValue fx_add(FxValue a, FxValue b)">
        O {mono('+')}: concatenação de dois textos, ou soma numérica, conforme a tabela e o trecho acima. Texto com número é R5 (&quot;Esperado string, encontrado int&quot;): a linguagem não converte sozinha, é preciso
        {mono('toString')}.
      </Fn>
      <Fn name="fx_sub" signature="FX_FN FxValue fx_sub(FxValue a, FxValue b)">
        O {mono('-')}: {mono('fx_need_nums')}, depois subtração de {mono('int')} com R6 ou de {mono('double')}.
      </Fn>
      <Fn name="fx_mul" signature="FX_FN FxValue fx_mul(FxValue a, FxValue b)">
        O {mono('*')}: o mesmo, com {mono('__builtin_mul_overflow')}.
      </Fn>
      <Fn name="fx_div" signature="FX_FN FxValue fx_div(FxValue a, FxValue b)">
        O {mono('/')}. Para dois {mono('int')}: R4 se o divisor é 0 (&quot;Divisão por zero.&quot;), R6 se {mono('a')} é {mono('INT32_MIN')} e {mono('b')} é -1, senão {mono('a / b')} de C. Se algum é {mono('float')},
        divisão de {mono('double')} pelo IEEE: {mono('1.0 / 0.0')} é {mono('inf')}, {mono('0.0 / 0.0')} é {mono('nan')}.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: o R4 vale só para a divisão inteira. {mono('float')} segue o IEEE: {mono('x / 0.0')} é infinito. A tabela de erros da linguagem (ERROS.md) diz &quot;divisão inteira por zero&quot; por isso. E
        {mono('INT32_MIN / -1')} é tratado à parte como R6 porque, em C, essa divisão é comportamento indefinido (em x86 ela trava o processo).
      </Why>
      <Fn name="fx_mod" signature="FX_FN FxValue fx_mod(FxValue a, FxValue b)">
        O {mono('%')}: os dois têm de ser {mono('int')} (R3 com {mono('null')}, R5 com outro tipo). Divisor 0 é R4, com a mesma mensagem da divisão. Se o divisor é -1 o resultado é 0 sem calcular.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: com divisor -1 a função devolve 0 direto, sem fazer {mono('a % b')}. {mono('INT32_MIN % -1')} em C também é indefinido (a mesma instrução de divisão do processador), e o resto de qualquer
        número por -1 é 0 de qualquer jeito.
      </Why>
      <Fn name="fx_neg" signature="FX_FN FxValue fx_neg(FxValue a)">
        O {mono('-')} unário. {mono('int')}: R6 se for {mono('INT32_MIN')} (o oposto não cabe), senão o oposto. {mono('float')}: o oposto. Outra etiqueta: R5, ou R3 com {mono('null')}.
      </Fn>
      <Fn name="fx_cond" signature="FX_FN int fx_cond(FxValue v)">
        Devolve o booleano de C de uma condição ({mono('if')}, {mono('while')}, {mono('&&')}, {mono('||')}, {mono('!')}). Só {mono('bool')} serve: qualquer outra etiqueta é R5 (&quot;Esperado bool, ...&quot;).
      </Fn>
      <Why>
        {mono('flux_rt.h')}: uma condição tem de ser {mono('bool')}, sem valor verdadeiro ou falso. Um campo dinâmico usado como condição é conferido aqui; medido, com {mono('p = { v: 1 }')}, {mono('if (p.v)')} dá
        &quot;Esperado bool, encontrado int.&quot;
      </Why>
      <Fn name="fx_not" signature="FX_FN FxValue fx_not(FxValue v)">
        {mono('fx_bool(!fx_cond(v))')}.
      </Fn>
      <Fn name="fx_order" signature="FX_FN int fx_order(FxValue a, FxValue b, int *unordered)">
        A comparação de ordem por baixo de {mono('<')}, {mono('<=')}, {mono('>')} e {mono('>=')}: {mono('fx_need_nums')}, depois devolve um valor menor, igual ou maior que zero. Dois {mono('int')} se comparam como
        inteiros; os demais como {mono('double')}, promovendo o {mono('int')}. Se algum {mono('double')} é {mono('nan')}, põe {mono('*unordered = 1')} e devolve 0.
      </Fn>
      <Fn name="fx_lt" signature="FX_FN FxValue fx_lt(FxValue a, FxValue b)">
        {mono('a < b')}: verdadeiro se há ordem e o resultado de {mono('fx_order')} é negativo. {mono('fx_le')}, {mono('fx_gt')} e {mono('fx_ge')} são iguais, com {mono('<= 0')}, {mono('> 0')} e {mono('>= 0')}. Os quatro
        dão {mono('false')} se {mono('unordered')}.
      </Fn>
      <Fn name="fx_equal" signature="FX_FN int fx_equal(FxValue a, FxValue b)">
        A igualdade de C (0 ou 1) pelas quatro regras da seção &quot;Igualdade&quot;. Nunca falha. Chamada por {mono('fx_eq')} e {mono('fx_ne')}.
      </Fn>
      <Fn name="fx_eq" signature="FX_FN FxValue fx_eq(FxValue a, FxValue b)">
        {mono('fx_bool(fx_equal(a, b))')}. {mono('fx_ne')} é a negação.
      </Fn>

      <H2 title="Texto: toString e a formatação dos valores" />
      <P>
        Tudo o que a biblioteca imprime ou converte para texto passa por {mono('fx_repr')}. Um {mono('int')} sai em decimal; {mono('bool')} como {mono('true') } ou {mono('false')}; {mono('null')} como {mono('null')}; um texto
        como ele é (e entre aspas dentro de lista ou objeto); uma lista como {mono('[1, 2]')} e um objeto como {mono('{a: 1}')}, com os campos na ordem em que foram criados. Um {mono('float')} usa {mono('fx_fmt_float')}.
      </P>
      <H3 title="Float: a forma mais curta que volta ao mesmo número" />
      <P>
        {mono('fx_fmt_float')} formata com {mono('snprintf')} em 15 dígitos significativos e confere, com {mono('strtod')}, se o texto volta ao mesmo {mono('double')}; se não, tenta 16 e depois 17. Se o resultado não tem
        ponto nem expoente, acrescenta {mono('.0')}. {mono('nan')}, {mono('inf')} e {mono('-inf')} são escritos à mão. Medido:
      </P>
      <Table
        head={['Expressão', 'Saída', 'Por quê']}
        rows={[
          [mono('3.0'), mono('3.0'), 'inteiro: ganha .0'],
          [mono('0.1 + 0.2'), mono('0.30000000000000004'), 'precisa de 17 dígitos para voltar ao mesmo número'],
          [mono('0.1 + 0.7'), mono('0.7999999999999999'), 'precisa de 16'],
          [mono('100.0 * 1000000000000.0'), mono('100000000000000.0'), 'sem expoente, ganha .0'],
          [mono('123456789012345678.0'), mono('1.2345678901234568e+17'), 'tem expoente: não ganha .0'],
          [mono('0.000001'), mono('1e-06'), 'o expoente de duas casas é o do snprintf'],
          [mono('1.0 / 0.0'), mono('inf'), 'IEEE'],
          [mono('0.0 / 0.0'), mono('nan'), 'IEEE'],
        ]}
      />
      <H3 title="Funções de texto e formatação" />
      <Callout kind="aviso">
        {mono('fx_repr')} não escapa as aspas de dentro de um texto: com {mono('o.s')} valendo {mono('a"b')}, {mono('terminal.log([o.s])')} escreve {mono('["a"b"]')}. É a saída de depuração, não um formato que
        se leia de volta.
      </Callout>
      <Fn name="fx_dup_printf" signature="FX_FN const char *fx_dup_printf(const char *fmt, ...)">
        Um {mono('sprintf')} que devolve o texto num bloco novo do coletor: mede o tamanho com {mono('vsnprintf(NULL, 0, ...)')}, aloca com {mono('fx_alloc')} e formata. Base de {mono('fx_repr')},
        {mono('fx_fmt_float')} e das mensagens de {mono('run')}.
      </Fn>
      <Fn name="fx_fmt_float" signature="FX_FN const char *fx_fmt_float(double f)">
        O texto de um {mono('float')}, como na seção acima. Usa um buffer local de 40 bytes e devolve um bloco do coletor (ou um literal, para {mono('nan')} e {mono('inf')}).
      </Fn>
      <Fn name="fx_repr" signature="FX_FN const char *fx_repr(FxValue v, int quote)">
        O texto de qualquer valor. {mono('quote')} só importa para {mono('FX_STRING')}: com 1, o texto sai entre aspas duplas (dentro de listas e objetos, e nas mensagens de erro); com 0, como é. Listas e objetos
        são montados elemento por elemento, cada passo um bloco novo, então o custo cresce com o quadrado do tamanho. É recursiva e não chama {mono('fx_check_stack')}: um objeto que contém a si mesmo
        ({mono('o.me = o;')}) faz a impressão recursar até estourar a pilha do C. Medido: o programa morre com falha de segmentação (código 139), sem o erro R7, e o que ainda estava no buffer da saída padrão se perde.
      </Fn>
      <Fn name="fx_to_string" signature="FX_FN FxValue fx_to_string(FxValue v)">
        {mono('toString(v)')}: {mono('fx_str(fx_repr(v, 0))')}. Aceita qualquer valor, inclusive {mono('null')} (dá o texto {mono('null')}).
      </Fn>

      <H2 title="Conversões: toInt, toFloat e toBool" />
      <Table
        head={['Função', 'Aceita', 'Regra', 'Erros']}
        rows={[
          [mono('toInt(v)'), <>{mono('int')}, {mono('float')}, {mono('string')}</>, <>{mono('float')}: trunca para zero. Texto: {mono('strtol')} em base 10, aceita espaço no começo e sinal; o texto todo tem de ser consumido.</>, <>R1 se o texto é vazio ou tem sobra, se o float é {mono('nan')} ou fora de 32 bits, se o inteiro de texto não cabe em 32 bits. R3 com {mono('null')}; R5 com os outros tipos.</>],
          [mono('toFloat(v)'), <>{mono('float')}, {mono('int')}, {mono('string')}</>, <>Texto: {mono('strtod')}, o texto todo consumido.</>, <>R1 se o texto é vazio, tem sobra ou estoura o {mono('double')}. R3, R5 como acima.</>],
          [mono('toBool(v)'), <>{mono('bool')}, {mono('string')}</>, <>Só os textos exatos {mono('true')} e {mono('false')}.</>, <>R1 para qualquer outro texto (&quot;TRUE&quot; também). R3, R5.</>],
        ]}
      />
      <P>
        Medido: {mono('toInt("+5")')} dá 5, {mono('toInt(" 7")')} dá 7, {mono('toInt(2147483647.9)')} dá 2147483647, {mono('toInt("2147483648")')} é R1, {mono('toFloat("1e3")')} dá 1000.0 e{' '}
        {mono('toFloat("0x10")')} dá 16.0 (o {mono('strtod')} aceita hexadecimal, {mono('inf')} e {mono('nan')}; as conversões não filtram nada além do que a função de C recusa).
      </P>
      <Fn name="fx_cannot_convert" signature="FX_FN void fx_cannot_convert(FxValue v, const char *to)">
        O R1: encerra com {mono('Não é possível converter %s para %s.')}, com o valor por {mono('fx_repr(v, 1)')} (texto entre aspas) e o nome do tipo destino. Não retorna.
      </Fn>
      <Fn name="fx_to_int" signature="FX_FN FxValue fx_to_int(FxValue v)">
        {mono('toInt')}. Segue a tabela acima. Para o float, a conta de limite é {mono('f >= 2147483648.0 || f <= -2147483649.0')}: assim 2147483647.9 e -2147483648.5 truncam para um {mono('int32_t')} válido.
      </Fn>
      <Fn name="fx_to_float" signature="FX_FN FxValue fx_to_float(FxValue v)">
        {mono('toFloat')}. Um {mono('int')} vira {mono('double')}; um {mono('float')} volta como está; um texto passa por {mono('strtod')}.
      </Fn>
      <Fn name="fx_to_bool" signature="FX_FN FxValue fx_to_bool(FxValue v)">
        {mono('toBool')}. Um {mono('bool')} volta como está; os textos {mono('true')} e {mono('false')} viram o booleano; qualquer outro texto é R1.
      </Fn>

      <H2 title="terminal: impressão, entrada e cores" />
      <P>
        {mono('terminal.log')} e {mono('info')} escrevem na saída padrão; {mono('warn')} e {mono('error')}, na de erro; todos sem prefixo e aceitando qualquer tipo (o valor passa por {mono('fx_repr(v, 0)')}), e todos devolvem{' '}
        {mono('null')}. O mesmo código C serve a três situações, escolhidas pelo ambiente: saída normal, saída colorida e saída etiquetada.
      </P>
      <H3 title="Cores por tipo de impressão" />
      <P>
        Cada impressão carrega uma letra de tipo ({mono('L')} log, {mono('I')} info, {mono('W')} warn, {mono('E')} error, {mono('F')} erro de execução). Na saída normal, {mono('fx_print')} escreve o texto entre a
        sequência ANSI da cor do tipo e a de reinício, mas só se o fluxo pedir cor. {mono('fx_use_color')} decide, por fluxo (1 para a saída padrão, 2 para a de erro): {mono('NO_COLOR')} com algum valor desliga; senão{' '}
        {mono('FORCE_COLOR')} com algum valor diferente de {mono('0')} liga; senão, liga se o descritor é um terminal.
      </P>
      <Table
        head={['Tipo', 'Quem', 'Fluxo', 'Cor (sequência ANSI)']}
        rows={[
          [mono('L'), mono('terminal.log'), 'saída padrão (1)', <>azul claro, {mono('ESC[94m')}</>],
          [mono('I'), mono('terminal.info'), 'saída padrão (1)', <>ciano, {mono('ESC[36m')}</>],
          [mono('W'), mono('terminal.warn'), 'saída de erro (2)', <>amarelo, {mono('ESC[33m')}</>],
          [mono('E'), mono('terminal.error'), 'saída de erro (2)', <>vermelho, {mono('ESC[31m')}</>],
          [mono('F'), 'erro de execução (e abort if)', 'saída de erro (2)', <>vermelho em negrito, {mono('ESC[1;31m')}</>],
        ]}
      />
      <Why>
        {mono('flux_rt.h')}: as cores só aparecem quando a saída é um terminal ({mono('isatty')}), como os outros programas fazem; redirecionar para um arquivo ou um pipe continua sem cor, e por isso os testes
        comparam texto limpo. {mono('NO_COLOR')} desliga e {mono('FORCE_COLOR')} liga mesmo sem terminal, a convenção usada por outras ferramentas.
      </Why>
      <Why>
        {mono('flux_rt.h')}: cada fluxo é decidido sozinho, pelo próprio descritor. Medido, com um programa que imprime os quatro tipos e um erro: com a saída padrão num terminal e a de erro num arquivo, as duas
        primeiras linhas saíram com {mono('ESC[94m')} e {mono('ESC[36m')} e o arquivo recebeu {mono('um aviso')}, {mono('um erro')} e a mensagem de erro sem nenhuma sequência.
      </Why>
      <Why>
        {mono('flux_rt.h')}: as cores são as mesmas da interface web (log azul, info ciano, warn amarelo, error vermelho, o erro de execução vermelho em negrito).
      </Why>
      <Code lang="c">
        {`FX_FN int fx_use_color(int fd) {
  const char *no = getenv("NO_COLOR");
  if (no && no[0])
    return 0;
  const char *force = getenv("FORCE_COLOR");
  if (force && force[0] && strcmp(force, "0") != 0)
    return 1;
  return fx_isatty(fd);
}`}
      </Code>
      <P>
        Executado de verdade, com o programa de {mono('tests/exec_color/todos_os_tipos.flux')} e {mono('FORCE_COLOR=1')}, visto com {mono('cat -v')} ({mono('^[')} é o byte ESC):
      </P>
      <Code lang="text">
        {`^[[94mum log^[[0m
^[[36muma info^[[0m
^[[33mum aviso^[[0m
^[[31mum erro^[[0m
^[[1;31mErro de execução [linha 7]:
Divisão por zero.^[[0m`}
      </Code>
      <H3 title="Saída etiquetada (FLUX_TAGGED)" />
      <P>
        Com {mono('FLUX_TAGGED')} no ambiente (qualquer valor, até vazio), nada é colorido e nenhuma impressão do programa vai para a saída de erro: toda impressão sai na saída padrão, na ordem em que aconteceu, como um registro
        {' '}{mono('fx_emit')}: o byte 30 (o separador de registro, {mono('\\x1e')}), a letra do tipo, o tamanho do texto em bytes em decimal, dois pontos e o texto, sem terminador. É o formato que a interface
        web lê (o {mono('parseTagged')} de {mono('web/server/run-program.ts')}), para colorir cada linha pelo tipo sem mudar o formato do programa no terminal.
      </P>
      <Table
        head={['Letra', 'O que é']}
        rows={[
          [mono('L'), <>{mono('terminal.log')}</>],
          [mono('I'), <>{mono('terminal.info')}</>],
          [mono('W'), <>{mono('terminal.warn')} (na saída padrão, neste modo)</>],
          [mono('E'), <>{mono('terminal.error')} (na saída padrão, neste modo)</>],
          [mono('F'), <>O erro de execução, com o cabeçalho e a mensagem num registro só: {mono('Erro de execução [linha N]:')}, uma quebra de linha e o texto.</>],
          [mono('P'), <>O prompt do {mono('terminal.input')}, se o prompt for um texto.</>],
          [mono('A'), <>A resposta que o {mono('terminal.input')} leu.</>],
        ]}
      />
      <P>Com o programa abaixo e a entrada {mono('Ana')}, o fluxo tal como saiu, com {mono('od -c')} (o byte 30 aparece como {mono('036')}); o tamanho conta bytes, então {mono('olá')}, com acento, tem 4:</P>
      <Code lang="flux" example>
        {`func main () {
  terminal.log("olá");
  terminal.warn("cuidado");
  var nome = terminal.input("Nome: ");
  terminal.info("oi " + nome);
  var z = 0;
  terminal.log(1 / z);
}`}
      </Code>
      <Code lang="text">
        {`036 L 4 : o l 303 241
036 W 7 : c u i d a d o
036 P 6 : N o m e : (espaço)
036 A 3 : A n a
036 I 6 : o i (espaço) A n a
036 F 48 : (os 48 bytes de: Erro de execução [linha 7], quebra de linha, Divisão por zero.)`}
      </Code>
      <Callout kind="nota">
        O trecho acima é o {mono('od -c')} da saída reescrito para caber, com os bytes agrupados por registro. A saída do programa não tem quebra de linha entre os registros: o tamanho é que delimita o texto, e por
        isso um texto com {mono('\\n')} dentro (como o do registro {mono('F')}) não confunde quem lê. O teste {mono('tests/exec_tagged/')} confere os registros (o separador aparece como {mono('<RS>')}).
      </Callout>
      <Why>
        {mono('flux_rt.h')}: os tamanhos do modo etiquetado são em bytes, e no Windows a saída de texto converteria cada {mono('\\n')} em {mono('\\r\\n')}, contando um byte a mais por quebra e quebrando o formato. Por isso,
        no Windows, {mono('fx_init')} põe a saída padrão e a de erro em modo binário quando o modo etiquetado está ligado.
      </Why>
      <H3 title="Funções do terminal" />
      <Fn name="fx_use_color" signature="FX_FN int fx_use_color(int fd)">
        Diz se o descritor {mono('fd')} (1 ou 2) deve receber cor: {mono('NO_COLOR')} não vazia dá 0; {mono('FORCE_COLOR')} não vazia e diferente de {mono('0')} dá 1; senão {mono('fx_isatty(fd)')}. Chamada por{' '}
        {mono('fx_print')} e {mono('fx_die')}.
      </Fn>
      <Fn name="fx_color_of" signature="FX_FN const char *fx_color_of(char kind)">
        A sequência ANSI de abertura do tipo: {mono('L')} {mono('ESC[94m')}, {mono('I')} {mono('ESC[36m')}, {mono('W')} {mono('ESC[33m')}, {mono('E')} {mono('ESC[31m')}; qualquer outra letra (o {mono('F')}), {mono('ESC[1;31m')}. O
        reinício, {mono('ESC[0m')}, vem escrito direto nos {mono('fprintf')}.
      </Fn>
      <Fn name="fx_emit" signature="FX_FN void fx_emit(char kind, const char *text)">
        Escreve um registro do modo etiquetado na saída padrão: o byte 30, {mono('kind')}, {mono('strlen(text)')} em decimal, dois pontos e os bytes do texto. Não termina com quebra de linha e não esvazia o buffer;
        quem precisa dos dados já ({mono('fx_die')}, {mono('fx_input')}) chama {mono('fflush')}.
      </Fn>
      <Fn name="fx_print" signature="FX_FN FxValue fx_print(char kind, int to_stderr, FxValue v)">
        A impressão por baixo de {mono('log')}, {mono('info')}, {mono('warn')} e {mono('error')}. Converte {mono('v')} com {mono('fx_repr(v, 0)')}. No modo etiquetado, escreve um registro e devolve. Senão, escolhe o fluxo
        ({mono('stderr')} se {mono('to_stderr')}), e nesse caso esvazia a saída padrão antes (a ordem entre as duas fica certa quando vão para o mesmo lugar), decide a cor do fluxo e escreve o texto, entre as
        sequências se houver cor, com um {mono('\\n')} no fim. Devolve {mono('null')}.
      </Fn>
      <Fn name="fx_log" signature="FX_FN FxValue fx_log(FxValue v)">
        {mono('terminal.log')}: {mono('fx_print(\'L\', 0, v)')}. Saída padrão.
      </Fn>
      <Fn name="fx_info" signature="FX_FN FxValue fx_info(FxValue v)">
        {mono('terminal.info')}: tipo {mono('I')}, saída padrão.
      </Fn>
      <Fn name="fx_warn" signature="FX_FN FxValue fx_warn(FxValue v)">
        {mono('terminal.warn')}: tipo {mono('W')}, saída de erro.
      </Fn>
      <Fn name="fx_error" signature="FX_FN FxValue fx_error(FxValue v)">
        {mono('terminal.error')}: tipo {mono('E')}, saída de erro.
      </Fn>
      <Fn name="fx_input" signature="FX_FN FxValue fx_input(FxValue prompt)">
        {mono('terminal.input(prompt)')}. Se o prompt é um texto, escreve-o (puro, sem cor, ou como registro {mono('P')}) e esvazia a saída; se é {mono('null')}, não escreve nada; outro tipo é R5. Lê da entrada padrão com{' '}
        {mono('getchar')} até a quebra de linha ou o fim da entrada, sem a quebra, num buffer que dobra de tamanho. No fim da entrada, devolve o que leu até ali, que é o texto vazio se nada veio. No modo etiquetado,
        emite também um registro {mono('A')} com a resposta. Não tira um {mono('\\r')} de uma linha que termine em {mono('\\r\\n')} num sistema POSIX.
      </Fn>
      <Fn name="fx_abort" signature="FX_FN void fx_abort(FxValue e)">
        O {mono('abort if e;')} quando {mono('e')} não é {mono('null')}: {mono('fx_die("%s", fx_repr(e, 0))')}. O formato é o dos erros de execução, com a mensagem de {mono('e')}, e o código de saída é 1.
      </Fn>

      <H2 title="run: executar um comando" />
      <P>
        {mono('run { command: ..., flags: [...], workingDir: ... }')} vira uma chamada a {mono('fx_run')}, que devolve um {mono('FxPair')}: no sucesso, {mono('(saída padrão do comando, null)')}; no erro,{' '}
        {mono('(null, mensagem)')}. O comando é executado direto, sem shell: {mono('command')} é o programa e cada item de {mono('flags')} é um argumento (e não precisa de aspas nem de escape). A parte que muda de
        sistema é {mono('fx_run_process')}; o resto é comum.
      </P>
      <Table
        head={['Situação', 'Resultado do run']}
        rows={[
          ['Saiu com código 0', <>{mono('(saída padrão inteira, null)')}. Inclui a quebra de linha final: {mono('echo oi')} dá {mono('oi\\n')}. A saída de erro do comando, se houve, é descartada. Medido.</>],
          ['Saiu com código diferente de 0, com algo na saída de erro', <>{mono('(null, saída de erro sem as quebras de linha do fim)')}.</>],
          ['Saiu com código diferente de 0, saída de erro vazia', <>{mono('(null, "comando \'x\' terminou com código N")')}.</>],
          ['Morto por sinal (só POSIX)', <>{mono('(null, "comando \'x\' terminou pelo sinal N")')}. Medido com {mono('kill -9')}: sinal 9.</>],
          ['Não pôde iniciar (programa inexistente)', <>{mono('(null, "comando \'x\' não pôde ser iniciado: motivo")')}; o motivo é o texto do sistema ({mono('No such file or directory')} no Linux).</>],
          ['Diretório de trabalho inexistente', <>Igual, com o diretório: {mono('comando \'pwd\' não pôde ser iniciado: /nao/existe: No such file or directory')}. Medido.</>],
          ['Pedido malformado', <>Erro fatal R5 ({mono('command')} que não é texto, {mono('flags')} que não é lista de textos, {mono('workingDir')} que não é texto). Sem {mono('command')} no pedido: erro fatal com {mono('\'run\' sem o campo obrigatório \'command\'.')}, mas a análise semântica (E14) já recusa isso antes.</>],
        ]}
      />
      <Callout kind="nota">
        A entrada padrão do comando é a do próprio programa: medido, {mono('run { command: "cat" }')} com {mono('entrada do pai')} no pipe devolveu esse texto. Um erro de início do comando no Linux chega pela saída
        de erro do processo filho (o filho escreve a mensagem e sai com 127), então ele aparece como a mensagem de erro do {mono('run')} e não como um {mono('terminou com código 127')}.
      </Callout>
      <Fn name="fx_run" signature="FX_FN FxPair fx_run(FxValue spec)">
        Confere o pedido e chama {mono('fx_run_process')}. {mono('spec')} tem de ser um objeto (R5 senão). Lê {mono('command')} (obrigatório, texto), {mono('flags')} (opcional; {mono('null') } vale como ausente; lista de
        textos) e {mono('workingDir')} (opcional, texto), com {mono('fx_obj_find')}. Monta o vetor {mono('argv')} de ponteiros (o {mono('command')} e os {mono('flags')}, nesta ordem, sem copiar os textos) num bloco de
        {mono('fx_alloc')} e chama {mono('fx_run_process(command, argv, n_flags + 1, dir)')}. Erros: R5 e o caso do {mono('command')} ausente, acima.
      </Fn>
      <Fn name="fx_run_result" signature="FX_FN FxPair fx_run_result(const char *command, char *out, char *err, size_t err_len, int exited, int code)">
        Transforma o que um comando terminado produziu no {mono('FxPair')} da tabela acima. Se {mono('exited')} e {mono('code == 0')}: {mono('(out, null)')}. Senão tira os {mono('\\n')} e {mono('\\r')} do fim de{' '}
        {mono('err')} (altera o buffer) e, se sobrou texto, é o erro; se não, a frase com o código (se {mono('exited')}) ou com o sinal. Comum aos dois sistemas.
      </Fn>
      <Code lang="c">
        {`FX_FN FxPair fx_run_result(const char *command, char *out, char *err, size_t err_len, int exited,
                           int code) {
  if (exited && code == 0)
    return fx_pair(fx_str(out), fx_null());
  while (err_len > 0 && (err[err_len - 1] == '\\n' || err[err_len - 1] == '\\r'))
    err[--err_len] = '\\0';
  if (err_len > 0)
    return fx_pair(fx_null(), fx_str(err));
  if (exited)
    return fx_pair(fx_null(), fx_str(fx_dup_printf("comando '%s' terminou com código %d", command, code)));
  return fx_pair(fx_null(), fx_str(fx_dup_printf("comando '%s' terminou pelo sinal %d", command, code)));
}`}
      </Code>
      <Fn name="fx_run_room" signature="FX_FN void fx_run_room(char **buf, size_t *cap, size_t len, size_t need)">
        Garante que o buffer de leitura de um fluxo tem espaço para mais {mono('need')} bytes e o zero final: se não, cria um bloco novo de {mono('2 * cap + need')} bytes, copia o conteúdo e troca o ponteiro e a capacidade
        pelos parâmetros de saída. Chamada nos dois sistemas a cada leitura.
      </Fn>
      <H3 title="No POSIX: fork, execvp e poll" />
      <P>
        {mono('fx_run_process')} cria dois pipes (saída padrão e saída de erro), esvazia os buffers do próprio programa (para o que ele já escreveu sair antes) e dá {mono('fork')}. O filho liga as pontas de escrita
        dos pipes aos descritores 1 e 2, fecha as quatro pontas dos pipes, entra no diretório de trabalho se houver um ({mono('chdir')}) e chama {mono('execvp')} com {mono('argv[0]')} e o vetor. Se o {mono('chdir')} ou o
        {mono('execvp')} falham, o filho escreve a mensagem na saída de erro e sai com {mono('_exit(127)')}. O pai fecha as pontas de escrita e lê os dois pipes em um laço de {mono('poll')} (sem prazo), em pedaços de
        128 bytes, até os dois chegarem ao fim. Só então espera o filho com {mono('waitpid')}, repetindo se for interrompido por um sinal, e chama {mono('fx_run_result')} com o código ({mono('WEXITSTATUS')}) ou o sinal
        ({mono('WTERMSIG')}).
      </P>
      <Why>
        {mono('flux_rt.h')}: os dois pipes são lidos juntos, com {mono('poll')}, e não um depois do outro, para que um comando que escreve muito na saída de erro não trave com o pipe cheio enquanto o programa espera pela
        saída padrão. O laço do {mono('poll')} ignora {mono('EINTR')} pelo mesmo motivo do {mono('waitpid')}: um sinal que chega no meio não pode abandonar a leitura.
      </Why>
      <Fn name="fx_run_process (POSIX)" signature="FX_FN FxPair fx_run_process(const char *command, char **argv, int argc, const char *dir)">
        A versão do Linux e do macOS (o macOS nunca foi testado). Faz o que a seção acima descreve. Se {mono('pipe')} falha, devolve {mono('(null, "não foi possível criar os pipes do comando")')}; se {mono('fork')}
        falha, {mono('(null, "comando ... não pôde ser iniciado: ...")')} com o {mono('strerror')}. {mono('argc')} não é usado (o vetor de ponteiros não leva um {mono('NULL')} no fim: a lista vem do {mono('fx_run')}
        com {mono('n_flags + 2')} posições zeradas pelo {mono('calloc')}, então o último é {mono('NULL')} de fato). {mono('command')} só entra nas mensagens.
      </Fn>
      <H3 title="No Windows: CreateProcess, GetExitCodeProcess e Sleep" />
      <P>
        O Windows não tem {mono('fork') } nem {mono('poll')}, e a linha de comando do processo é um texto só. {mono('fx_run_process')} (a versão do Windows) monta esse texto com {mono('fx_win_quote')} em cada argumento,
        cria dois pipes herdáveis ({mono('CreatePipe')}) e desliga a herança das pontas de leitura, liga as de escrita à saída padrão e de erro do filho (e a entrada padrão é a do programa), esvazia os buffers e chama{' '}
        {mono('CreateProcessA')} (o {mono('command')} é procurado no {mono('PATH')} e o {mono('.exe')} é implícito). Depois lê os dois pipes sem travar: a cada passo, {mono('PeekNamedPipe')} diz quanto já chegou em cada um e só
        esse tanto, no máximo 4096 bytes, é lido com {mono('ReadFile')}; se nada chegou em nenhum, {mono('Sleep(1)')}; um pipe cujo {mono('PeekNamedPipe')} falha é o que o filho fechou. Por fim espera o processo e pega o
        código com {mono('GetExitCodeProcess')}. Como o Windows não tem sinais, o resultado é sempre &quot;saiu&quot;, com o código.
      </P>
      <Why>
        {mono('flux_rt.h')}: no Windows, {mono('run')} não usa shell, então os comandos internos do {mono('cmd')}, como {mono('echo')}, não existem como programas e precisam de {mono('cmd /c')}: {mono('command: "cmd", flags: ["/c", "echo oi"]')}.
        Medido com o {mono('wine')}: o programa de {mono('tests/exec_windows/run_com_cmd.flux')} faz assim, e um {mono('command')} que não existe volta com a mensagem do sistema no idioma dele ({mono('File not found.')}
        com {mono('LC_ALL=C')}).
      </Why>
      <Why>
        {mono('flux_rt.h')}: o {mono('CreateProcessA')} pode alterar o texto da linha de comando que recebe, por isso a biblioteca passa uma cópia num bloco próprio ({mono('mutable_line')}) e não o texto original.
      </Why>
      <Why>
        {mono('flux_rt.h')}: só as pontas de escrita dos pipes passam ao filho: a biblioteca tira a herança das pontas de leitura com {mono('SetHandleInformation')}. O pai fecha as suas cópias das pontas de escrita
        logo depois do {mono('CreateProcessA')}, e é por isso que o laço de leitura vê o fim quando o filho fecha as dele ({mono('PeekNamedPipe')} falha).
      </Why>
      <Fn name="fx_run_process (Windows)" signature="FX_FN FxPair fx_run_process(const char *command, char **argv, int argc, const char *dir)">
        A versão do Windows, como descrita acima. Devolve {mono('(null, "não foi possível criar os pipes do comando")')} se {mono('CreatePipe')} falha, e se {mono('CreateProcessA')} falha,{' '}
        {mono('(null, "comando ... não pôde ser iniciado: <mensagem do sistema>")')} com {mono('fx_win_message(GetLastError())')}. Fecha todos os handles. Chama {mono('fx_run_result')} com {mono('exited')} sempre 1.
      </Fn>
      <Fn name="fx_win_message" signature="FX_FN const char *fx_win_message(DWORD code)">
        Só no Windows. O texto do sistema para um código de erro ({mono('FormatMessageA')}, em um buffer de 256 bytes), sem espaços e quebras de linha no fim; se o sistema não tem texto, {mono('erro N do sistema')}.
      </Fn>
      <Fn name="fx_win_quote" signature="FX_FN const char *fx_win_quote(const char *arg)">
        Só no Windows. Prepara um argumento para a linha de comando: se é não vazio e sem espaço, tabulação, quebra de linha, tabulação vertical nem aspas, volta como está; senão vai entre aspas duplas, com as regras do{' '}
        {mono('CommandLineToArgvW')}: uma sequência de barras invertidas antes de uma aspa é dobrada e a aspa ganha mais uma barra, e as barras do fim, antes da aspa que fecha, são dobradas.
      </Fn>

      <H2 title="Erros de execução R1 a R7" />
      <P>
        Todo erro fatal passa por {mono('fx_die')}, que escreve a mensagem e encerra o processo com código 1 (em qualquer sistema). O texto tem sempre o formato {mono('Erro de execução [linha N]:')}, uma quebra de
        linha e a mensagem; o {mono('abort if')} usa o mesmo formato. Só o {mono('run')} e o {mono('call')} têm erro tratável (devolvido no par); o resto encerra o programa.
      </P>
      <Table
        head={['Código', 'Quem levanta', 'Quando', 'Mensagem']}
        rows={[
          ['R1', mono('fx_cannot_convert'), <>{mono('toInt')}, {mono('toFloat') } e {mono('toBool')} com um valor que a conversão não aceita (texto que não é número, float fora de 32 bits, {mono('nan')})</>, mono('Não é possível converter "abc" para int.')],
          ['R2', mono('fx_index_of'), <>Índice de lista menor que 0 ou maior ou igual ao tamanho, em {mono('l[i]')}, {mono('l[i] = v')} e {mono('remove')}</>, mono('Índice 5 fora da lista (tamanho 2).')],
          ['R3', mono('fx_null_use'), <>Operador numérico, conversão, acesso a campo ou índice com {mono('null')}; chega por {mono('fx_type_err')} e {mono('fx_need_nums')}</>, mono('Uso de valor null.')],
          ['R4', mono('fx_div'), <>Dois {mono('int')} com divisor 0, em {mono('/')} e em {mono('%')} ({mono('fx_mod')})</>, mono('Divisão por zero.')],
          ['R5', mono('fx_type_err'), <>Etiqueta diferente da que o lugar exige: {mono('fx_as_*')}, operadores, {mono('fx_cond')}, base de índice ou de campo</>, mono('Esperado int, encontrado string.')],
          ['R6', <>{mono('fx_add')}, {mono('fx_sub')}, {mono('fx_mul')}, {mono('fx_div')}, {mono('fx_neg')}</>, <>{mono('int')} que estoura na soma, subtração, multiplicação, {mono('INT32_MIN / -1') } ou {mono('-INT32_MIN')}</>, mono('Estouro de inteiro.')],
          ['R7', mono('fx_check_stack'), 'A pilha usada passou do limite, no começo de uma função', mono('Estouro de pilha: recursão profunda demais.')],
        ]}
      />
      <P>
        Medido, cada um dos casos de {mono('tests/exec/erro_R*.flux')} rodado com {mono('./flux --run')}: as sete mensagens acima saem exatamente assim, com o código de saída 1. Por exemplo o R2:
      </P>
      <Code lang="text">
        {`2
Erro de execução [linha 4]:
Índice 5 fora da lista (tamanho 2).`}
      </Code>
      <Callout kind="nota">
        Há um oitavo encerramento que não é R1 a R7: {mono('fx_no_memory')}, quando {mono('malloc') } ou {mono('calloc')} falham. Escreve {mono('Memória esgotada.')} sem o cabeçalho de erro de execução, na saída de erro
        (mesmo no modo etiquetado) e sai com código 2.
      </Callout>
      <Fn name="fx_die" signature="FX_FN void fx_die(const char *fmt, ...)">
        O erro fatal, com formato de {mono('printf')}. Formata a mensagem num buffer de {mono('malloc')} (se faltar memória, usa o texto fixo {mono('erro de execução')}). No modo etiquetado, escreve um registro {mono('F')} com{' '}
        {mono('Erro de execução [linha N]:')} e a mensagem juntos, esvazia a saída e sai com 1. Senão, esvazia a saída padrão, decide a cor do fluxo 2 e escreve o cabeçalho e a mensagem na saída de erro, em
        vermelho em negrito se houver cor, e sai com 1. Não retorna. A linha vem de {mono('fx_line')} (ver {mono('FX_LINE')}).
      </Fn>
      <Why>
        {mono('flux_rt.h')}: {mono('fx_die')} usa {mono('malloc') } e não os blocos do coletor para montar a mensagem: um erro fatal não deve disparar uma coleta de lixo no meio de um estado já quebrado. (O motivo não está
        escrito no código; é a leitura do fato de ele chamar {mono('malloc')} direto.)
      </Why>
      <Fn name="fx_tag_name" signature="FX_FN const char *fx_tag_name(FxTag t)">
        O nome de uma etiqueta para as mensagens: {mono('null')}, {mono('int')}, {mono('float')}, {mono('bool')}, {mono('string')}, {mono('list')} e, para qualquer outra, {mono('object')}.
      </Fn>
      <Fn name="fx_null_use" signature="FX_FN void fx_null_use(void)">
        O R3: {mono('fx_die("Uso de valor null.")')}. Não retorna.
      </Fn>
      <Fn name="fx_type_err" signature="FX_FN void fx_type_err(const char *expected, FxValue got)">
        O R5 e, se {mono('got')} é {mono('null')}, o R3: chama {mono('fx_null_use')} nesse caso; senão {mono('fx_die("Esperado %s, encontrado %s.", expected, fx_tag_name(got.tag))')}. Não retorna. É a função de que
        todas as conferências de etiqueta dependem.
      </Fn>
      <Fn name="fx_no_memory" signature="FX_FN void fx_no_memory(void)">
        Escreve {mono('Memória esgotada.')} na saída de erro e sai com 2. Chamada quando uma alocação do coletor ou um buffer interno do coletor falha.
      </Fn>
      <Fn name="fx_check_stack" signature="FX_FN void fx_check_stack(void)">
        O R7. Compara o endereço do quadro atual ({mono('__builtin_frame_address(0)')}) com a base da pilha guardada por {mono('fx_init')}; se a diferença passa de {mono('fx_stack_limit')}, chama {mono('fx_die')} com a
        mensagem de estouro de pilha. O gerador a emite como primeiro comando de cada função e de cada workflow.
      </Fn>
      <Code lang="c">
        {`FX_FN void fx_check_stack(void) {
  const char *here = __builtin_frame_address(0);
  if ((size_t)(fx_stack_base - here) > fx_stack_limit)
    fx_die("Estouro de pilha: recursão profunda demais.");
}`}
      </Code>
      <Why>
        {mono('flux_rt.h')}: uma recursão sem fim estouraria a pilha do processo e o programa morreria com uma falha de segmentação. Cada função confere, ao entrar, quanto da pilha já usou e, perto
        do limite, encerra com um erro de execução claro. Medido: {mono('func sem_fim (n:int):int { return 1 + sem_fim(n + 1); }')} termina com {mono('Estouro de pilha: recursão profunda demais.')} e código 1, no Linux e no{' '}
        {mono('wine')}.
      </Why>
      <Callout kind="aviso">
        A recursão do teste tem de ser {mono('1 + sem_fim(n + 1)')}, e não {mono('return sem_fim(n + 1)')}: com otimização, o {mono('clang')} transforma recursão de cauda em laço e a pilha nunca estoura (a nota está em
        AGENTS.md, &quot;Armadilhas&quot;). O R7 só confere funções da linguagem; a recursão de {mono('fx_repr')} sobre listas aninhadas demais não passa por {mono('fx_check_stack')}.
      </Callout>

      <H2 title="A entrada do programa: fx_init, fx_start e main" />
      <P>
        O gerador termina o arquivo com {mono('fx_program')} e um {mono('main')} de uma linha. Reproduzido de um programa real (o da seção de exemplo de <PageLink to="compilador/gerador-c">Gerador de C</PageLink>, com um
        global {mono('total')}):
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
        A ordem: {mono('main')} chama {mono('fx_start')}, que roda {mono('fx_program')} (no Windows, numa thread nova). {mono('fx_program')} chama {mono('fx_init')} com o endereço do próprio quadro, registra cada global como raiz do
        coletor, calcula os inicializadores dos globais na ordem do arquivo e chama {mono('f_main')}. Se tudo termina, devolve 0 e esse é o código de saída do processo; um erro fatal chama {mono('exit')} com 1 de dentro de
        qualquer ponto.
      </P>
      <Fn name="fx_init" signature="FX_FN void fx_init(const void *stack_base)">
        Prepara a execução; é a primeira chamada de {mono('fx_program')}. Lê o ambiente: {mono('fx_tagged')} é verdadeiro se {mono('FLUX_TAGGED')} existe (qualquer valor); {mono('fx_gc_disabled')} é verdadeiro se{' '}
        {mono('FLUX_GC')} vale exatamente {mono('0')}; {mono('fx_gc_stress')} é verdadeiro se {mono('FLUX_GC_STRESS')} existe (qualquer valor, até {mono('0')}); se {mono('FLUX_GC_STATS')} existe, registra{' '}
        {mono('fx_gc_report')} com {mono('atexit')}. Depois a parte do sistema: no POSIX, o tamanho da pilha é o limite de {mono('RLIMIT_STACK')} ({mono('getrlimit')}), ou 8 MiB se for ilimitado ou o {mono('getrlimit')}
        falhar; no Windows, o da thread, que {mono('GetCurrentThreadStackLimits')} informa, e mais duas coisas descritas abaixo. Por fim, {mono('fx_stack_limit')} é o tamanho menos 256 KiB (a margem), ou metade dele se
        a pilha tiver 512 KiB ou menos, e {mono('fx_stack_base')} guarda {mono('stack_base')}.
      </Fn>
      <Why>
        {mono('flux_rt.h')}: o console do Windows 10 ou mais novo só entende as cores ANSI quando o {mono('ENABLE_VIRTUAL_TERMINAL_PROCESSING')} está ligado; {mono('fx_init')} liga essa opção ({mono('0x0004')}) no
        console da saída padrão e no da de erro, se forem consoles. Sem isso, as sequências de cor apareceriam como texto.
      </Why>
      <Why>
        {mono('flux_rt.h')}: no Windows, o programa roda numa thread de pilha grande. A pilha padrão de uma thread do Windows, de 1 a 2 MB, não aguentaria recursões que no Linux (8 MB) funcionam. A thread reserva 64 MB (só
        reserva, o sistema não os usa até a pilha crescer), e o limite do R7 sai do tamanho real da pilha, lido de dentro da thread.
      </Why>
      <Fn name="fx_start" signature="FX_FN int fx_start(int (*program)(void))">
        Roda o programa e devolve o código dele. No POSIX é só {mono('return program()')}: o programa roda na thread principal, com a pilha do processo. No Windows, cria uma thread com{' '}
        {mono('CreateThread')}, com 64 MiB de pilha e {mono('STACK_SIZE_PARAM_IS_A_RESERVATION')}, nela roda {mono('program')} (por {mono('fx_thread_main')}), espera com {mono('WaitForSingleObject')} e devolve o código que a
        thread guardou; se {mono('CreateThread')} falha, roda o programa na thread atual.
      </Fn>
      <Code lang="c">
        {`FX_FN int fx_start(int (*program)(void)) {
  FxStart start = {program, 0};
  HANDLE thread = CreateThread(NULL, (SIZE_T)64 << 20, fx_thread_main, &start,
                               STACK_SIZE_PARAM_IS_A_RESERVATION, NULL);
  if (!thread)
    return program();
  WaitForSingleObject(thread, INFINITE);
  CloseHandle(thread);
  return start.code;
}`}
      </Code>
      <Fn name="fx_thread_main" signature="FX_FN DWORD WINAPI fx_thread_main(LPVOID arg)">
        Só no Windows. O corpo da thread: lê o {mono('FxStart')} (o ponteiro para o programa e o campo {mono('code')}), chama {mono('program()')} e guarda o retorno em {mono('start->code')}.
      </Fn>

      <H2 title="POSIX e Windows: o que o #ifdef muda" />
      <P>
        O mesmo arquivo serve aos dois. O compilador do Windows é o {mono('x86_64-w64-mingw32-gcc')} (opção {mono('--windows')} do {mono('./flux')}), que define {mono('_WIN32')}. Os blocos {mono('#ifdef _WIN32')} da
        biblioteca são estes:
      </P>
      <Table
        head={['Onde', 'No Windows', 'No POSIX']}
        rows={[
          ['Começo do arquivo', <>{mono('__USE_MINGW_ANSI_STDIO')} ligado.</>, 'nada.'],
          ['Cabeçalhos e fx_isatty', <>{mono('io.h')}, {mono('windows.h')}, {mono('fx_isatty')} é {mono('_isatty')}.</>, <>{mono('poll.h')}, {mono('sys/resource.h')}, {mono('sys/wait.h')}, {mono('unistd.h')}; {mono('fx_isatty')} é {mono('isatty')}.</>],
          [mono('fx_init'), <>Tamanho da pilha pela thread; modo binário se etiquetado; console com cores ANSI.</>, <>Tamanho da pilha pelo {mono('getrlimit')}.</>],
          [mono('fx_start'), <>Thread de 64 MiB (com {mono('fx_thread_main')} e {mono('FxStart')}).</>, <>Chama o programa direto.</>],
          [<>{mono('run')}: {mono('fx_run_process')}</>, <>{mono('CreateProcessA')}, {mono('PeekNamedPipe')}, {mono('Sleep')}; mais {mono('fx_win_quote')} e {mono('fx_win_message')}.</>, <>{mono('fork')}, {mono('execvp')}, {mono('poll')}, {mono('waitpid')}.</>],
          [<>{mono('fx_gc_collect')}</>, <>Além dos registradores gerais, salva {mono('xmm6')} a {mono('xmm15')} (ver a página do <PageLink to="compilador/coletor">coletor</PageLink>).</>, 'só os registradores gerais.'],
        ]}
      />
      <Callout kind="nota">
        Com o {mono('wine')}, medido: o {mono('.exe')} escreve {mono('\\r\\n')} no lugar de {mono('\\n')} (a saída de texto do Windows). Um {mono('echo oi')} do {mono('cmd')}, que já termina em {mono('\\r\\n')}, e o
        {mono('terminal.log')} depois dele resultam em {mono('oi\\r\\r\\n\\r\\n')}: o {mono('\\n')} que o {mono('log')} escreve vira {mono('\\r\\n')}, e o {mono('\\r\\n')} que veio do comando ganha um {mono('\\r')} a mais.
        A suíte tira os {mono('\\r')} antes de comparar. Fora o {mono('run')}, o texto sai igual nos dois sistemas.
      </Callout>
      <Why>
        AGENTS.md: só o programa gerado roda no Windows; o {mono('flux')} e a interface web exigem Linux ou macOS (no Windows, via WSL). Por isso os blocos {mono('#ifdef _WIN32')} acima existem só na biblioteca
        de execução, e não no compilador.
      </Why>

      <H2 title="O que está em outras páginas" />
      <P>
        As funções do coletor de lixo ({mono('fx_alloc')}, {mono('fx_gc_alloc')}, {mono('fx_gc_root')}, {mono('fx_gc_collect')}, {mono('fx_gc_find')} e as demais) estão na página{' '}
        <PageLink to="compilador/coletor">Coletor de lixo</PageLink>. O código C que o gerador escreve para cada construção está em <PageLink to="compilador/gerador-c">Gerador de C</PageLink>, e as variáveis de ambiente
        que a biblioteca lê estão também em <PageLink to="compilador/linha-de-comando">Linha de comando e variáveis de ambiente</PageLink>. A referência por arquivo, com todas as funções de todos os módulos em ordem
        alfabética, fica na <PageLink to="compilador/referencia">Referência</PageLink>.
      </P>
    </>
  )
}
