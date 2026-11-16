import { Callout, Code, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function TiposInternos() {
  return (
    <>
      <H2 title="O papel do módulo" />
      <P>
        {mono('src/semantic/types.h')} e {mono('src/semantic/types.c')} definem como o compilador representa um tipo da
        FluxLang depois do parser: uma enumeração {mono('TypeKind')}, o struct {mono('Type')} e cinco funções. Não há análise nenhuma aqui; o módulo só
        guarda tipos, compara e escreve nomes. Quem o usa:
      </P>
      <Table
        head={['Quem', 'O que usa']}
        rows={[
          [<>{mono('ast.h')}</>, <>Inclui {mono('types.h')}: o campo {mono('Expr.type')} (preenchido pela análise semântica), os tipos escritos de {mono('Stmt.declared')}, {mono('Param.type')} e {mono('Func.ret')}.</>],
          [<>{mono('ast_build.c')}</>, <>{mono('build_type')} monta o tipo escrito no código com {mono('type_prim')} (os cinco primitivos) e {mono('type_list')} (o {mono('list<T>')}). Ver <PageLink to="compilador/ast">AST</PageLink>.</>],
          [<>{mono('sema.c')}</>, <>O maior cliente: {mono('type_prim')} (pelo atalho {mono('T')}), {mono('type_list')}, {mono('type_assignable')} e {mono('type_name')} (pelo atalho {mono('tn')}). Ver <PageLink to="compilador/semantica">Análise semântica</PageLink>.</>],
          [<>{mono('ast.c')}</>, <>{mono('type_name')} para escrever o tipo declarado na saída de {mono('--ast')}.</>],
          [<>{mono('codegen_c.c')}</>, <>Não chama nenhuma função do módulo; lê {mono('Expr.type->kind')} e {mono('->elem')} direto (para converter {mono('int')} em {mono('float')} e conferir um valor dinâmico na execução).</>],
        ]}
      />
      <Callout kind="nota">
        {mono('type_equal')} é pública, mas só é chamada de dentro de {mono('types.c')} ({mono('type_assignable')} e ela mesma). {mono('sema.c')} nunca compara dois
        tipos por igualdade: pergunta sempre se um valor <em>cabe</em> num lugar, com {mono('type_assignable')}.
      </Callout>

      <H2 title="TypeKind e Type" />
      <P>
        Um tipo é um {mono('Type')}: o {mono('kind')} (um valor de {mono('TypeKind')}) e, só para listas, o {mono('elem')}, o tipo dos elementos.
        {mono('list<list<int>>')} é um {mono('Type')} de kind {mono('T_LIST')} cujo {mono('elem')} é outro {mono('T_LIST')} cujo {mono('elem')} é {mono('T_INT')}.
      </P>
      <Table
        head={['TypeKind', 'Nome impresso', 'O que representa']}
        rows={[
          [mono('T_ERROR'), mono('erro'), 'O tipo de uma expressão que já teve um erro semântico. Serve com qualquer tipo, para não gerar uma segunda mensagem em cascata.'],
          [mono('T_VOID'), mono('nada'), <>O &quot;tipo&quot; de uma chamada que não devolve valor: uma {mono('func')} sem {mono(':tipo')}, {mono('push')}, {mono('remove')} e {mono('terminal.log/info/warn/error')}.</>],
          [mono('T_NULL'), mono('null'), <>O tipo do valor {mono('null')}, do resultado de um workflow sem {mono(':tipo')} e do elemento do literal {mono('[]')} (que é um {mono('list<null>')}).</>],
          [mono('T_DYN'), mono('dinâmico'), <>O valor de um campo de {mono('object')} (decisão D1): combina com qualquer tipo e só é conferido na execução.</>],
          [mono('T_INT'), mono('int'), 'Escrito pelo usuário.'],
          [mono('T_FLOAT'), mono('float'), 'Escrito pelo usuário.'],
          [mono('T_BOOL'), mono('bool'), 'Escrito pelo usuário.'],
          [mono('T_STRING'), mono('string'), 'Escrito pelo usuário.'],
          [mono('T_OBJECT'), mono('object'), 'Escrito pelo usuário.'],
          [mono('T_LIST'), mono('list<T>'), <>Escrito pelo usuário; o único com {mono('elem')}.</>],
        ]}
      />
      <P>Os seis tipos que o usuário escreve são {mono('int')}, {mono('float')}, {mono('bool')}, {mono('string')}, {mono('object')} e {mono('list<T>')}; os quatro primeiros da tabela só existem dentro do compilador.</P>
      <Why>
        {mono('T_ERROR')} existe para que um erro gere uma única mensagem. Quando uma subexpressão falha, a análise semântica dá a ela o tipo {mono('T_ERROR')}; as
        regras de compatibilidade e dos operadores o aceitam com qualquer outro tipo e devolvem {mono('T_ERROR')} sem escrever nada. Sem ele, {mono('var x:int = y + 1;')} com {mono('y')} não declarado
        daria o E1 e mais um E4 por cima.
      </Why>
      <Why>
        {mono('T_DYN')} existe porque os campos de um {mono('object')} não têm tipo declarado (decisão D1). O compilador não sabe o que {mono('o.idade')} é; então o valor é
        &quot;dinâmico&quot; e passa em qualquer conferência. O gerador de C insere a conferência de verdade na execução (o erro R5). Ver{' '}
        <PageLink to="compilador/gerador-c">Gerador de C</PageLink>.
      </Why>
      <Why>
        {mono('T_VOID')} existe para que uma chamada sem resultado seja um tipo, e não um caso especial: {mono('check_call')} devolve {mono('T_VOID')} e é
        {mono('value_of')} que, quando o valor é exigido, transforma isso no E13. Como todo lugar que usa um valor passa por {mono('value_of')}, o nome {mono('nada')} nunca chega a
        uma mensagem.
      </Why>
      <Why>
        {mono('T_NULL')} tem dois papéis: o valor {mono('null')} (que cabe em qualquer tipo menos {mono('T_VOID')}) e o marcador do literal {mono('[]')}, um {mono('list<null>')}
        que cabe em qualquer lista. Por isso {mono('var x = null;')} e {mono('var l = [];')} são o E8: não há tipo a inferir.
      </Why>

      <H3 title="Instâncias compartilhadas e a ordem da enumeração" />
      <P>
        Os tipos que não são lista são instâncias únicas: uma tabela estática {mono('prims')}, com um {mono('Type')} por {mono('TypeKind')}, é indexada pelo próprio valor da enumeração, e
        {mono('type_prim(kind)')} devolve {mono('&prims[kind]')}. Não aloca nada. Já cada {mono('type_list')} aloca um {mono('Type')} novo na arena (ver{' '}
        <PageLink to="compilador/arena">Arena de memória</PageLink>), que nunca é liberado; duas listas {mono('list<int>')} são, portanto, dois ponteiros diferentes, e a única comparação correta é
        pela estrutura ({mono('type_equal')}), nunca por ponteiro.
      </P>
      <Why>
        A tabela {mono('prims')} é escrita na ordem exata de {mono('TypeKind')}: a posição é o índice. Acrescentar ou reordenar um valor da enumeração sem mexer na tabela faria
        {' '}{mono('type_prim(T_INT)')} devolver o tipo de outro kind, sem nenhum aviso do compilador. A entrada de {mono('T_LIST')} na tabela existe só para fechar o índice; seu {mono('elem')} é
        nulo, e usá-la com {mono('type_prim(T_LIST)')} no lugar de {mono('type_list')} derrubaria {mono('type_equal')}, {mono('type_assignable')} e {mono('type_name')}.
      </Why>
      <Why>
        O {mono('elem')} só vale em {mono('T_LIST')} (nos demais é nulo). As três funções que andam pela estrutura ({mono('type_equal')}, {mono('type_assignable')}, {mono('type_name')}) só
        seguem o {mono('elem')} depois de ver que o kind é {mono('T_LIST')}, e é essa a invariante que mantém o acesso seguro.
      </Why>

      <H2 title="Funções de types.c" />
      <Fn name="type_prim" signature="Type *type_prim(TypeKind kind)">
        Devolve a instância compartilhada do tipo de kind {mono('kind')}, {mono('&prims[kind]')}. Não aloca e nunca falha. O resultado não pode ser alterado, porque é compartilhado por todo o
        programa. Chamada por {mono('build_type')} (os cinco primitivos escritos), pelo atalho {mono('T')} de {mono('sema.c')} (inclusive para os internos {mono('T_ERROR')}, {mono('T_VOID')}, {mono('T_NULL')} e {mono('T_DYN')}).
        Só vale para os kinds que não são lista.
      </Fn>
      <Fn name="type_list" signature="Type *type_list(Type *elem)">
        Aloca (com {mono('mem_alloc')}) um {mono('Type')} de kind {mono('T_LIST')} com o {mono('elem')} dado e o devolve. O {mono('elem')} é guardado por ponteiro, sem cópia, então a lista aponta para
        o mesmo tipo que o chamador passou. Chamada por {mono('build_type')} (um {mono('list<T>')} escrito, recursivamente) e por {mono('check_list_literal')} (o tipo de um literal de lista, inclusive o
        {mono('list<null>')} do {mono('[]')}), e por {mono('check_run_object')}, que monta um {mono('list<string>')} só para perguntar se o valor de {mono('flags')} cabe nele.
      </Fn>
      <Fn name="type_equal" signature="int type_equal(const Type *a, const Type *b)">
        Devolve 1 se os dois tipos são idênticos, 0 se não. Os kinds têm de ser iguais, e, se são listas, os {mono('elem')} também (recursivo). Não tem exceções: {mono('int')} e {mono('float')} são
        diferentes, {mono('list<null>')} é diferente de {mono('list<int>')}, e {mono('T_DYN')} só é igual a {mono('T_DYN')}. Os dois ponteiros não podem ser nulos.
      </Fn>
      <Fn name="type_assignable" signature="int type_assignable(const Type *to, const Type *from)">
        Responde se um valor do tipo {mono('from')} pode ir para um lugar do tipo {mono('to')} (variável, parâmetro, retorno, elemento de lista). Devolve 1 ou 0. A ordem dos parâmetros importa: a relação não é simétrica
        ({mono('float')} aceita {mono('int')}, e {mono('int')} não aceita {mono('float')}). As regras são testadas nesta ordem, e a primeira que casa decide:
      </Fn>
      <Table
        head={['Ordem', 'Regra', 'Resultado', 'Exemplo']}
        rows={[
          ['1', <>{mono('to')} ou {mono('from')} é {mono('T_ERROR')}</>, 'cabe (o erro já foi reportado)', <>{mono('var x:int = naoexiste;')}: um E1 e nenhum E4</>],
          ['2', <>{mono('to')} ou {mono('from')} é {mono('T_DYN')}</>, 'cabe', <>{mono('var n:int = o.idade;')}</>],
          ['3', <>{mono('from')} é {mono('T_NULL')}</>, <>cabe em tudo, menos em {mono('T_VOID')}</>, <>{mono('var s:string = null;')}</>],
          ['4', <>{mono('to')} é {mono('float')} e {mono('from')} é {mono('int')}</>, 'cabe (promoção)', <>{mono('var f:float = 1;')}</>],
          ['5', <>os dois são {mono('T_LIST')}, e {mono('from')} é {mono('list<null>')}</>, 'cabe (o literal [])', <>{mono('var l:list<int> = [];')}</>],
          ['6', <>os dois são {mono('T_LIST')} (outros casos)</>, <>cabe se {mono('type_equal')} dos elementos, ou se um dos elementos é {mono('T_DYN')}</>, <>{mono('list<float>')} não aceita {mono('list<int>')}</>],
          ['7', 'qualquer outro caso', <>cabe se os kinds são iguais</>, <>{mono('string')} só aceita {mono('string')}</>],
        ]}
      />
      <Why>
        {mono('int')} vira {mono('float')} na raiz, mas {mono('list<int>')} não vira {mono('list<float>')}. A promoção só vale para um valor isolado: a regra 4 é testada antes da 6, e a 6 não promove os
        elementos. Quem compensa é a análise semântica, que confere um literal de lista elemento a elemento ({mono('check_assign_to')}); uma variável que já é {mono('list<int>')} continua sem caber em
        {' '}{mono('list<float>')}.
      </Why>
      <Fn name="type_name" signature="const char *type_name(const Type *t, char *buf, int size)">
        Escreve o nome do tipo em {mono('buf')} (de {mono('size')} bytes) com {mono('snprintf')} e devolve o próprio {mono('buf')}. Os nomes são os da tabela acima ({mono('int')}, {mono('string')}, {mono('null')}, {mono('nada')},{' '}
        {mono('erro')}, {mono('dinâmico')}) e, para lista, {mono('list<elemento>')}, escrevendo o elemento primeiro numa área local de 128 bytes (recursivo). Se não cabe, o {mono('snprintf')} trunca, sem estourar. É a
        função que dá o texto de &quot;esperado X, encontrado Y&quot;. Chamada por {mono('tn')} em {mono('sema.c')} e por {mono('print_type')} em {mono('ast.c')}.
      </Fn>

      <H2 title="Como os tipos aparecem nas mensagens de erro" />
      <P>
        Quase toda mensagem de tipo é montada com {mono('tn(tipo)')}, o atalho de {mono('sema.c')} para {mono('type_name')}, em dois formatos: {mono('Tipo incompatível: esperado A, encontrado B.')} (para valores)
        e {mono('Operador \'+\' não aceita A e B.')} (para operadores). O que vai em A e B é o resultado de {mono('type_name')}. Este programa e esta saída foram executados com o compilador:
      </P>
      <Code lang="flux">
        {`func main() {
  var a:int = "x";
  var b:list<list<int>> = 1;
  var c:int = [];
  var d:list<int> = [1];
  var e:list<float> = d;
  var f:list<float> = [1, 2];
  var g:float = 1;
  var h = null + 1;
  var i:list<string> = [1, "a"];
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 15]:
Tipo incompatível: esperado int, encontrado string.
Erro semântico [linha 3, coluna 27]:
Tipo incompatível: esperado list<list<int>>, encontrado int.
Erro semântico [linha 4, coluna 15]:
Tipo incompatível: esperado int, encontrado list<null>.
Erro semântico [linha 6, coluna 23]:
Tipo incompatível: esperado list<float>, encontrado list<int>.
Erro semântico [linha 9, coluna 16]:
Operador '+' não aceita null e int.
Erro semântico [linha 10, coluna 25]:
Tipo incompatível: esperado string, encontrado int.`}
      </Code>
      <P>
        As linhas 7 e 8 passam: {mono('[1, 2]')} é conferido elemento a elemento contra {mono('list<float>')} (cada {mono('int')} vira {mono('float')}), e {mono('int')} cabe em {mono('float')}. A linha 6 não passa: {mono('d')} já é um
        {' '}{mono('list<int>')} e a regra 6 não promove os elementos. Na linha 4, o literal vazio aparece como {mono('list<null>')}. A linha 10 mostra que o erro de um literal de lista cai no elemento errado, não na lista.
      </P>
      <P>
        Os nomes {mono('erro')} e {mono('nada')} nunca aparecem sozinhos numa mensagem: um valor {mono('T_ERROR')} silencia as regras, e {mono('T_VOID')} é cortado por {mono('value_of')} (E13) antes de qualquer comparação.
        O nome {mono('dinâmico')} pode aparecer, por exemplo em {mono('Operador \'+\' não aceita dinâmico e bool.')} (com {mono('o.a + true')}) e dentro de uma lista: {mono('var l = [o.a];')} é um {mono('list<dinâmico>')}, e
        {' '}{mono('var x:int = l;')} diz {mono('esperado int, encontrado list<dinâmico>')}.
      </P>
    </>
  )
}
