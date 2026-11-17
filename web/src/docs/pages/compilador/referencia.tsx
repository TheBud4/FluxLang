import { Fragment, type ReactNode } from 'react'
import { Callout, Fn, H2, H3, P, PageLink, Table, Why } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

const PAGE_TITLES = {
  'visao-geral': 'Visão geral',
  'mapa-e-build': 'Mapa e build',
  'linha-de-comando': 'Linha de comando',
  arena: 'Arena',
  lexico: 'Léxico',
  parser: 'Parser',
  'modo-panico': 'Modo pânico',
  'arvore-json': 'Árvore e JSON',
  ast: 'AST',
  'tipos-internos': 'Tipos internos',
  semantica: 'Semântica',
  'gerador-c': 'Gerador de C',
  runtime: 'Biblioteca de execução',
  coletor: 'Coletor de lixo',
  'interface-web': 'Interface web',
  documentacao: 'Documentação',
} as const

type Slug = keyof typeof PAGE_TITLES

const link = (slug: Slug) => <PageLink to={`compilador/${slug}`}>{PAGE_TITLES[slug]}</PageLink>

interface Item {
  name: string
  kind: string
  what: ReactNode
  page?: Slug
  sig?: string
  by?: ReactNode
  why?: ReactNode
}

interface SourceFile {
  path: string
  lines: number
  role: ReactNode
  page?: Slug
  items: Item[]
  after?: ReactNode
}

interface Area {
  title: string
  intro: ReactNode
  files: SourceFile[]
}

const NOT_INDEXED = new Set(['protótipo', 'guarda de inclusão'])

const guard = (name: string): Item => ({ name, kind: 'guarda de inclusão', what: 'Impede que o cabeçalho seja incluído duas vezes.' })

const driver: Area = {
  title: 'Driver: src/',
  intro: (
    <>
      Os dois arquivos que ficam na raiz de {mono('src/')} e o cabeçalho comum: quem lê a linha de comando, liga as etapas e formata os erros, e quem serializa tudo para o {mono('--json')}.
    </>
  ),
  files: [
    {
      path: 'src/main.c',
      lines: 230,
      page: 'linha-de-comando',
      role: <>O driver: lê as opções, abre o arquivo, chama as etapas pedidas, formata todos os erros e escolhe o código de saída.</>,
      items: [
        { name: 'report_error', kind: 'função', page: 'linha-de-comando', what: <>Imprime um erro no formato {mono('Erro <categoria> [linha L, coluna C]:')} na saída de erro (ou o grava com {mono('json_record_error')} no modo JSON) e soma um em {mono('error_count')}. Usada pelo lexer, pelo parser e pela semântica.</> },
        { name: 'error_count', kind: 'variável estática', page: 'linha-de-comando', what: <>Quantos erros {mono('report_error')} já contou. Zero no fim quer dizer programa aceito.</> },
        { name: 'help', kind: 'função estática', page: 'linha-de-comando', what: <>Imprime o texto de uso; chamada por {mono('-h')}/{mono('--help')} e depois de uma opção desconhecida.</> },
        { name: 'list_tokens', kind: 'função estática', page: 'linha-de-comando', what: <>O modo {mono('-t')}: chama {mono('yylex')} até o fim e imprime posição e nome de cada token, mais o texto só para identificadores e literais de número e de texto; os {mono('YYerror')} (erros léxicos, já reportados) são pulados.</> },
        { name: 'default_exe_name', kind: 'função estática', page: 'linha-de-comando', what: <>O nome do executável do {mono('--build')} sem {mono('-o')}: o nome do arquivo sem a extensão ({mono('a.out')} sem arquivo), com {mono('.exe')} no alvo Windows.</> },
        { name: 'run_codegen', kind: 'função estática', page: 'linha-de-comando', what: <>{mono('--c')}, {mono('--build')} e {mono('--run')}: escreve o C, chama {mono('compile_c')} e, no {mono('--run')}, {mono('execute_program')}, apagando os temporários.</> },
        { name: 'run', kind: 'função estática', page: 'linha-de-comando', what: <>Lê as opções, abre o arquivo, roda as etapas pedidas e devolve o código de saída.</> },
        { name: 'main', kind: 'função', page: 'linha-de-comando', what: <>Chama {mono('run')}, depois {mono('yylex_destroy')}, fecha o arquivo e libera a arena com {mono('mem_free_all')}.</> },
        { name: 'yyin', kind: 'variável do Flex', page: 'linha-de-comando', what: <>O arquivo que o lexer lê; definida no código gerado pelo Flex e declarada aqui com {mono('extern')}.</> },
        { name: 'yylex_destroy', kind: 'função do Flex', page: 'arena', what: <>Libera os buffers do Flex; o protótipo é escrito aqui porque o cabeçalho do Flex não é incluído.</> },
      ],
    },
    {
      path: 'src/fluxc.h',
      lines: 30,
      role: <>O cabeçalho comum: declara o que o driver, o lexer, o parser, a semântica, o JSON e o gerador usam uns dos outros. Não define nada.</>,
      items: [
        guard('FLUXC_H'),
        { name: 'yylex', kind: 'protótipo', page: 'lexico', what: <>Gerada pelo Flex a partir de {mono('lexer.l')}.</> },
        { name: 'token_name', kind: 'protótipo', page: 'parser', what: <>Definida em {mono('parser.y')}.</> },
        { name: 'semantic_check', kind: 'protótipo', page: 'semantica', what: <>Definida em {mono('sema.c')}. Junto vem a declaração antecipada {mono('struct Program;')}, escrita duas vezes no arquivo (inofensivo).</> },
        { name: 'generate_c', kind: 'protótipo', page: 'gerador-c', what: <>Definida em {mono('codegen_c.c')}, como as quatro seguintes.</> },
        { name: 'compile_c', kind: 'protótipo', page: 'gerador-c', what: <>Definida em {mono('codegen_c.c')}.</> },
        { name: 'execute_program', kind: 'protótipo', page: 'gerador-c', what: <>Definida em {mono('codegen_c.c')}.</> },
        { name: 'set_windows_target', kind: 'protótipo', page: 'gerador-c', what: <>Definida em {mono('codegen_c.c')}.</> },
        { name: 'is_windows_target', kind: 'protótipo', page: 'gerador-c', what: <>Definida em {mono('codegen_c.c')}.</> },
        { name: 'json_enable', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('json.c')}, como as quatro seguintes.</> },
        { name: 'json_enabled', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('json.c')}.</> },
        { name: 'json_record_token', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('json.c')}.</> },
        { name: 'json_record_error', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('json.c')}.</> },
        { name: 'json_print', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('json.c')}.</> },
        { name: 'source_lines', kind: 'protótipo', page: 'lexico', what: <>Definida em {mono('lexer.l')}.</> },
        { name: 'report_error', kind: 'protótipo', page: 'linha-de-comando', what: <>Definida em {mono('main.c')}.</> },
      ],
    },
    {
      path: 'src/json.c',
      lines: 150,
      page: 'arvore-json',
      role: <>O modo {mono('--json')}: guarda tokens e erros durante a análise e, no fim, imprime tudo com a árvore de derivação num objeto JSON.</>,
      items: [
        { name: 'TokenRec', kind: 'typedef struct', page: 'arvore-json', what: <>Um token gravado: {mono('type')}, {mono('text')}, {mono('line')}, {mono('column')}.</> },
        { name: 'ErrorRec', kind: 'typedef struct', page: 'arvore-json', what: <>Um erro gravado: {mono('kind')}, {mono('message')}, {mono('line')}, {mono('column')}.</> },
        { name: 'enabled', kind: 'variável estática', page: 'arvore-json', what: <>1 depois de {mono('json_enable')}.</> },
        { name: 'tokens', kind: 'variável estática', what: <>O vetor de {mono('TokenRec')}, com {mono('token_count')} (quantos há) e {mono('token_cap')} (capacidade).</> },
        { name: 'token_count', kind: 'variável estática', what: <>Quantos tokens foram gravados.</> },
        { name: 'token_cap', kind: 'variável estática', what: <>Capacidade de {mono('tokens')}; dobra em {mono('grow')}.</> },
        { name: 'errors', kind: 'variável estática', what: <>O vetor de {mono('ErrorRec')}, com {mono('error_count_rec')} e {mono('error_cap')}.</> },
        { name: 'error_count_rec', kind: 'variável estática', what: <>Quantos erros foram gravados (o contador do driver é o {mono('error_count')} de {mono('main.c')}).</> },
        { name: 'error_cap', kind: 'variável estática', what: <>Capacidade de {mono('errors')}; dobra em {mono('grow')}.</> },
        { name: 'grow', kind: 'função estática', page: 'arvore-json', what: <>Dobra a capacidade de um vetor cheio (começa em 64) com {mono('mem_grow')}.</> },
        { name: 'json_enable', kind: 'função', page: 'arvore-json', what: <>Liga o modo JSON; chamada por {mono('run')} antes do parser.</> },
        { name: 'json_enabled', kind: 'função', page: 'arvore-json', what: <>Diz se o modo JSON está ligado; {mono('report_error')} consulta.</> },
        { name: 'json_record_token', kind: 'função', page: 'arvore-json', what: <>Grava um token (só com o modo ligado); chamada pela macro {mono('RET')} do lexer.</> },
        { name: 'json_record_error', kind: 'função', page: 'arvore-json', what: <>Grava um erro; chamada por {mono('report_error')} no modo JSON.</> },
        { name: 'put_string', kind: 'função estática', page: 'arvore-json', what: <>Escreve uma string JSON entre aspas, escapando aspas, barra, controles e UTF-8 inválido ({mono('\\ufffd')}).</> },
        { name: 'kind_name', kind: 'função estática', page: 'arvore-json', what: <>O nome JSON de um {mono('NodeKind')}: {mono('rule')}, {mono('token')}, {mono('empty')} ou {mono('error')}.</> },
        { name: 'put_node', kind: 'função estática', page: 'arvore-json', what: <>Escreve um nó da árvore e, recursivamente, os filhos.</> },
        { name: 'json_print', kind: 'função', page: 'arvore-json', what: <>Escreve o objeto final: {mono('accepted')}, {mono('lines')}, {mono('tokens')}, {mono('errors')} e {mono('tree')}.</> },
      ],
    },
  ],
}

const frontend: Area = {
  title: 'Frente: src/frontend/',
  intro: <>O lexer, o parser e a árvore de derivação. Os nomes que começam com {mono('yy')} (como {mono('yylex')}, {mono('yyparse')}, {mono('yytext')}, {mono('yylval')} e {mono('yylloc')}) vêm do código gerado pelo Flex e pelo Bison em {mono('build/')} e não são listados um a um.</>,
  files: [
    {
      path: 'src/frontend/lexer.l',
      lines: 200,
      page: 'lexico',
      role: <>A especificação do Flex: as regras de cada token e, nas partes em C, a contagem de linha e coluna e duas funções auxiliares.</>,
      items: [
        { name: 'RET', kind: 'macro', page: 'lexico', what: <>Termina toda regra que devolve token: cria a folha com {mono('token_node')}, grava o token para o JSON e devolve o código.</> },
        { name: 'YY_USER_ACTION', kind: 'macro', page: 'lexico', what: <>Roda antes de cada regra: preenche {mono('yylloc')} com a posição atual, zera {mono('yylval.node')} e avança a posição com {mono('next')}.</> },
        { name: 'line', kind: 'variável estática', page: 'lexico', what: <>Linha do próximo caractere, a partir de 1; anda junto com {mono('column')}.</> },
        { name: 'column', kind: 'variável estática', page: 'lexico', what: <>Coluna do próximo caractere, em caracteres (não bytes), a partir de 1.</> },
        { name: 'comment_line', kind: 'variável estática', page: 'lexico', what: <>Onde começou o comentário de bloco aberto, com {mono('comment_column')}, para o erro de comentário não terminado.</> },
        { name: 'comment_column', kind: 'variável estática', page: 'lexico', what: <>A coluna correspondente a {mono('comment_line')}.</> },
        { name: 'DIG, LETTER, ID, UTF8', kind: 'definições do Flex', page: 'lexico', what: <>Os nomes de padrão usados nas regras: dígito, letra, identificador e um caractere UTF-8 de vários bytes. {mono('COMMENT')} é a condição exclusiva do comentário de bloco.</> },
        { name: 'next', kind: 'função estática', page: 'lexico', what: <>Avança {mono('line')} e {mono('column')} sobre um trecho; byte de continuação UTF-8 não conta coluna.</> },
        { name: 'count_chars', kind: 'função estática', page: 'lexico', what: <>Conta os caracteres UTF-8 dos primeiros bytes de um trecho; dá a coluna exata do escape inválido numa string.</> },
        { name: 'source_lines', kind: 'função', page: 'lexico', what: <>Quantas linhas o arquivo tem (0 se vazio), para o campo {mono('lines')} do JSON.</> },
      ],
    },
    {
      path: 'src/frontend/parser.y',
      lines: 540,
      page: 'parser',
      role: <>A gramática do Bison, transcrita da BNF em forma LL(1), com as ações que montam a árvore, a checagem S3 e, no fim, as mensagens de erro sintático.</>,
      items: [
        { name: 'assign_loc', kind: 'variável estática', page: 'parser', what: <>A posição do {mono('=')} da última atribuição, gravada em {mono('assignment_rest')} e usada pela mensagem do S3.</> },
        { name: 'SUFFIX_NONE, SUFFIX_ACCESS, SUFFIX_CALL', kind: 'enum anônimo', page: 'parser', what: <>Os valores do {mono('flag')} de {mono('postfix_rest')}: sem sufixo, acesso ({mono('.campo')} ou {mono('[i]')}) e chamada.</> },
        { name: 'token_name', kind: 'função', page: 'parser', what: <>O nome de um token a partir do código ({mono('yysymbol_name')}); usada pelo {mono('-t')}.</> },
        { name: 'yyerror', kind: 'função', page: 'parser', what: <>Exigida pelo Bison; com {mono('parse.error custom')} as mensagens saem de {mono('yyreport_syntax_error')}.</> },
        { name: 'spelling', kind: 'função estática', page: 'parser', what: <>A grafia de uma palavra reservada ou de um símbolo ({mono('"var"')}, {mono('"=="')}); nulo para os demais.</> },
        { name: 'is_keyword', kind: 'função estática', page: 'parser', what: <>Se o símbolo está entre {mono('VAR')} e {mono('NULL_LITERAL')}, a faixa das palavras reservadas.</> },
        { name: 'expected_name', kind: 'função estática', page: 'parser', what: <>Como um token esperado aparece na mensagem: {mono('identificador')}, {mono('texto')} ou a grafia entre aspas.</> },
        { name: 'found_name', kind: 'função estática', page: 'parser', what: <>Como o token encontrado aparece: com o texto lido, ou {mono('palavra reservada')} e a grafia.</> },
        { name: 'EXPRESSION_START', kind: 'vetor estático', page: 'parser', what: <>Os tokens que começam uma expressão; completos na lista esperada, viram a palavra {mono('expressão')}.</> },
        { name: 'TYPE_START', kind: 'vetor estático', page: 'parser', what: <>Os tokens de tipo; viram a palavra {mono('tipo')}.</> },
        { name: 'COMMAND_KEYWORDS', kind: 'vetor estático', page: 'parser', what: <>As palavras que começam um comando; junto com uma expressão, viram {mono('comando')}.</> },
        { name: 'take_group', kind: 'função estática', page: 'parser', what: <>Se todos os tokens de um grupo estão esperados, tira-os da lista e devolve 1.</> },
        { name: 'yyreport_syntax_error', kind: 'função', page: 'parser', what: <>Monta e reporta a mensagem {mono('Token encontrado')} / {mono('Esperado')} de cada erro sintático.</> },
      ],
    },
    {
      path: 'src/frontend/tree.h',
      lines: 30,
      page: 'arvore-json',
      role: <>O tipo da árvore de derivação e as funções que a constroem e imprimem.</>,
      items: [
        guard('TREE_H'),
        { name: 'NodeKind', kind: 'enum', page: 'arvore-json', what: <>{mono('NODE_RULE')}, {mono('NODE_TOKEN')}, {mono('NODE_EMPTY')} (ε) e {mono('NODE_ERROR')} (o {mono('error')} do modo pânico).</> },
        { name: 'Node', kind: 'typedef struct', page: 'arvore-json', what: <>Um nó: {mono('kind')}, {mono('label')}, {mono('text')}, {mono('line')}, {mono('column')}, {mono('flag')} (checagem S3) e os filhos em lista ({mono('first_child')}, {mono('last_child')}, {mono('next')}).</> },
        { name: 'mknode', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('tree.c')}, como as seguintes.</> },
        { name: 'token_node', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('tree.c')}.</> },
        { name: 'empty_node', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('tree.c')}.</> },
        { name: 'error_node', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('tree.c')}.</> },
        { name: 'parse_root', kind: 'protótipo', page: 'arvore-json', what: <>A declaração {mono('extern')} da raiz; definida em {mono('tree.c')}.</> },
        { name: 'print_tree', kind: 'protótipo', page: 'arvore-json', what: <>Definida em {mono('tree.c')}.</> },
      ],
    },
    {
      path: 'src/frontend/tree.c',
      lines: 75,
      page: 'arvore-json',
      role: <>A construção dos nós da árvore de derivação (chamada pelas ações do parser e pelo lexer) e a impressão do {mono('--tree')}.</>,
      items: [
        { name: 'parse_root', kind: 'variável global', page: 'arvore-json', what: <>A raiz da árvore; a ação de {mono('program')} a grava.</> },
        { name: 'alloc', kind: 'função estática', page: 'arvore-json', what: <>Aloca um nó zerado na arena com o tipo e o rótulo.</> },
        { name: 'mknode', kind: 'função', page: 'arvore-json', what: <>Nó de regra com os {mono('n')} filhos dados (os nulos são pulados); herda a posição do primeiro filho que tem linha.</> },
        { name: 'token_node', kind: 'função', page: 'arvore-json', what: <>Folha de token com cópia do texto e a posição.</> },
        { name: 'empty_node', kind: 'função', page: 'arvore-json', what: <>Folha ε, sem posição.</> },
        { name: 'error_node', kind: 'função', page: 'arvore-json', what: <>Folha {mono('error')} com a posição do erro.</> },
        { name: 'print_node', kind: 'função estática', page: 'arvore-json', what: <>Imprime um nó com recuo de dois espaços por nível e desce nos filhos.</> },
        { name: 'print_tree', kind: 'função', page: 'arvore-json', what: <>O {mono('--tree')}: imprime a árvore a partir da raiz, se houver.</> },
      ],
    },
  ],
}

const semantic: Area = {
  title: 'Semântica: src/semantic/',
  intro: <>Os tipos internos, a AST, a conversão da árvore de derivação em AST e a análise semântica.</>,
  files: [
    {
      path: 'src/semantic/types.h',
      lines: 30,
      page: 'tipos-internos',
      role: <>Os tipos que a semântica atribui às expressões.</>,
      items: [
        guard('TYPES_H'),
        { name: 'TypeKind', kind: 'typedef enum', page: 'tipos-internos', what: <>{mono('T_ERROR')}, {mono('T_VOID')}, {mono('T_NULL')}, {mono('T_DYN')}, {mono('T_INT')}, {mono('T_FLOAT')}, {mono('T_BOOL')}, {mono('T_STRING')}, {mono('T_OBJECT')}, {mono('T_LIST')}.</> },
        { name: 'Type', kind: 'typedef struct', page: 'tipos-internos', what: <>{mono('kind')} e, só em listas, {mono('elem')}.</> },
        { name: 'type_prim', kind: 'protótipo', page: 'tipos-internos', what: <>Definida em {mono('types.c')}, como as seguintes.</> },
        { name: 'type_list', kind: 'protótipo', page: 'tipos-internos', what: <>Definida em {mono('types.c')}.</> },
        { name: 'type_equal', kind: 'protótipo', page: 'tipos-internos', what: <>Definida em {mono('types.c')}.</> },
        { name: 'type_assignable', kind: 'protótipo', page: 'tipos-internos', what: <>Definida em {mono('types.c')}.</> },
        { name: 'type_name', kind: 'protótipo', page: 'tipos-internos', what: <>Definida em {mono('types.c')}.</> },
      ],
    },
    {
      path: 'src/semantic/types.c',
      lines: 65,
      page: 'tipos-internos',
      role: <>Os tipos primitivos compartilhados, a igualdade, a compatibilidade e os nomes usados nas mensagens.</>,
      items: [
        { name: 'prims', kind: 'vetor estático', page: 'tipos-internos', what: <>Um {mono('Type')} para cada {mono('TypeKind')}, na ordem do enum; os primitivos nunca são alocados.</> },
        { name: 'type_prim', kind: 'função', page: 'tipos-internos', what: <>O endereço do primitivo em {mono('prims')}.</> },
        { name: 'type_list', kind: 'função', page: 'tipos-internos', what: <>Aloca na arena um {mono('list<elem>')}.</> },
        { name: 'type_equal', kind: 'função', page: 'tipos-internos', what: <>Igualdade estrutural (listas comparam o elemento).</> },
        { name: 'type_assignable', kind: 'função', page: 'tipos-internos', what: <>Se um valor do tipo {mono('from')} pode ir para {mono('to')}: erro e dinâmico aceitam tudo, null vai para qualquer tipo menos nada, int vira float, listas pelo elemento.</> },
        { name: 'type_name', kind: 'função', page: 'tipos-internos', what: <>O nome do tipo para as mensagens ({mono('erro')}, {mono('nada')}, {mono('dinâmico')}, {mono('list<int>')}).</> },
      ],
    },
    {
      path: 'src/semantic/ast.h',
      lines: 130,
      page: 'ast',
      role: <>Os nós da AST enxuta, compartilhados pela semântica e pelo gerador de C.</>,
      items: [
        guard('AST_H'),
        { name: 'Pos', kind: 'typedef struct', page: 'ast', what: <>Linha e coluna.</> },
        { name: 'Name', kind: 'typedef struct', page: 'ast', what: <>Um nome com a posição.</> },
        { name: 'ExprKind', kind: 'typedef enum', page: 'ast', what: <>{mono('EX_INT')}, {mono('EX_FLOAT')}, {mono('EX_STRING')}, {mono('EX_BOOL')}, {mono('EX_NULL')}, {mono('EX_IDENT')}, {mono('EX_UNARY')}, {mono('EX_BINARY')}, {mono('EX_INDEX')}, {mono('EX_FIELD')}, {mono('EX_CALL')}, {mono('EX_LIST')}, {mono('EX_OBJECT')}.</> },
        { name: 'Op', kind: 'typedef enum', page: 'ast', what: <>{mono('OP_OR')}, {mono('OP_AND')}, {mono('OP_EQ')}, {mono('OP_NE')}, {mono('OP_LT')}, {mono('OP_LE')}, {mono('OP_GT')}, {mono('OP_GE')}, {mono('OP_ADD')}, {mono('OP_SUB')}, {mono('OP_MUL')}, {mono('OP_DIV')}, {mono('OP_MOD')} e os unários {mono('OP_NEG')}, {mono('OP_NOT')}.</> },
        { name: 'Expr', kind: 'typedef struct', page: 'ast', what: <>Uma expressão; os campos usados dependem do {mono('kind')}, e {mono('type')} é preenchido pela semântica.</> },
        { name: 'StmtKind', kind: 'typedef enum', page: 'ast', what: <>{mono('ST_VAR')}, {mono('ST_ASSIGN')}, {mono('ST_IF')}, {mono('ST_WHILE')}, {mono('ST_FOR')}, {mono('ST_RETURN')}, {mono('ST_BREAK')}, {mono('ST_CONTINUE')}, {mono('ST_ERRACT')}, {mono('ST_EXPR')}, {mono('ST_BLOCK')}.</> },
        { name: 'ErrAction', kind: 'typedef enum', what: <>{mono('ACT_STOP')}, {mono('ACT_ABORT')}, {mono('ACT_PROCEED')}: a ação de um {mono('stop if')}, {mono('abort if')} ou {mono('proceed if')}.</> },
        { name: 'RhsKind', kind: 'typedef enum', page: 'ast', what: <>{mono('RHS_EXPRS')}, {mono('RHS_CALL')}, {mono('RHS_RUN')}: o lado direito de uma declaração ou atribuição.</> },
        { name: 'Rhs', kind: 'typedef struct', page: 'ast', what: <>Lado direito: lista de expressões, {mono('call')} com argumentos ou {mono('run')} com o objeto.</> },
        { name: 'Stmt', kind: 'typedef struct', page: 'ast', what: <>Um comando; os campos usados dependem do {mono('kind')}.</> },
        { name: 'Param', kind: 'typedef struct', page: 'ast', what: <>Um parâmetro: nome e tipo.</> },
        { name: 'Func', kind: 'typedef struct', page: 'ast', what: <>Função, workflow ou {mono('main')}: nome, parâmetros, tipo de retorno e corpo.</> },
        { name: 'Decl', kind: 'typedef struct', page: 'ast', what: <>Uma declaração global: {mono('var')} ou {mono('func')}, na ordem do arquivo.</> },
        { name: 'Program', kind: 'typedef struct', page: 'ast', what: <>As declarações e o atalho {mono('main')}.</> },
        { name: 'build_ast', kind: 'protótipo', page: 'ast', what: <>Definida em {mono('ast_build.c')}.</> },
        { name: 'ast_print', kind: 'protótipo', page: 'ast', what: <>Definida em {mono('ast.c')}.</> },
        { name: 'ast_alloc', kind: 'protótipo', page: 'ast', what: <>Definida em {mono('ast.c')}.</> },
      ],
    },
    {
      path: 'src/semantic/ast.c',
      lines: 210,
      page: 'ast',
      role: <>A alocação dos nós e a impressão do {mono('--ast')}.</>,
      items: [
        { name: 'ast_alloc', kind: 'função', page: 'ast', what: <>{mono('mem_alloc')} com outro nome; usada pela AST e pela semântica.</> },
        { name: 'op_name', kind: 'função estática', page: 'ast', what: <>O símbolo de um {mono('Op')} para a impressão.</> },
        { name: 'indent', kind: 'função estática', page: 'ast', what: <>Dois espaços por nível.</> },
        { name: 'print_type', kind: 'função estática', page: 'ast', what: <>Imprime um tipo com {mono('type_name')}.</> },
        { name: 'print_exprs', kind: 'função estática', page: 'ast', what: <>Imprime uma lista de expressões no mesmo nível.</> },
        { name: 'print_expr', kind: 'função estática', page: 'ast', what: <>Imprime uma expressão e as subexpressões.</> },
        { name: 'print_rhs', kind: 'função estática', page: 'ast', what: <>Imprime um lado direito ({mono('call')}, {mono('run')} ou valores).</> },
        { name: 'print_block', kind: 'função estática', page: 'ast', what: <>Imprime os comandos de um bloco.</> },
        { name: 'print_stmt', kind: 'função estática', page: 'ast', what: <>Imprime um comando.</> },
        { name: 'print_func', kind: 'função estática', page: 'ast', what: <>Imprime o cabeçalho e o corpo de uma função.</> },
        { name: 'ast_print', kind: 'função', page: 'ast', what: <>O {mono('--ast')}: imprime as declarações na ordem.</> },
      ],
    },
    {
      path: 'src/semantic/ast_build.c',
      lines: 540,
      page: 'ast',
      role: <>A conversão da árvore de derivação (com os nós {mono('*_rest')} da forma LL(1)) na AST.</>,
      items: [
        {
          name: 'kid',
          kind: 'função estática',
          sig: 'static const Node *kid(const Node *n, int i)',
          what: <>O filho de índice {mono('i')} (a partir de 0) de {mono('n')}, ou nulo se não houver tantos.</>,
          by: <>todo o arquivo; é o jeito de andar na árvore de derivação</>,
        },
        {
          name: 'is',
          kind: 'função estática',
          sig: 'static int is(const Node *n, const char *label)',
          what: <>1 se {mono('n')} existe e o rótulo é {mono('label')}; aceita nulo, o que deixa encadear com {mono('kid')} sem conferir antes.</>,
          by: <>todo o arquivo</>,
        },
        {
          name: 'filled',
          kind: 'função estática',
          sig: 'static int filled(const Node *n)',
          what: <>1 se o nó tem filhos e o primeiro não é ε.</>,
          by: <>os laços que percorrem os {mono('*_rest')} e as partes opcionais</>,
          why: <>Nas regras LL(1), uma lista termina num {mono('*_rest')} cujo único filho é ε. Por isso &quot;tem mais um&quot; se escreve {mono('filled(rest)')}, e não {mono('rest != NULL')}: o nó sempre existe.</>,
        },
        {
          name: 'pos_of',
          kind: 'função estática',
          sig: 'static Pos pos_of(const Node *n)',
          what: <>A posição de um nó como {mono('Pos')}.</>,
          by: <>{mono('new_expr')}, {mono('new_stmt')}, {mono('make_name')}, {mono('build_rhs')} e {mono('rhs_from_list')}</>,
        },
        {
          name: 'dup',
          kind: 'função estática',
          sig: 'static char *dup(const char *s)',
          what: <>{mono('mem_strdup')} com nome curto.</>,
          by: <>{mono('build_field')}, {mono('build_primary')}, {mono('build_postfix')} e {mono('make_name')}</>,
        },
        { name: 'has_error_node', kind: 'função estática', page: 'ast', what: <>Se há um nó {mono('error')} na subárvore; com um, {mono('build_ast')} desiste.</> },
        { name: 'Vec', kind: 'typedef struct', page: 'ast', what: <>Vetor que cresce: {mono('v')}, {mono('n')}, {mono('cap')}.</> },
        { name: 'push', kind: 'função estática', page: 'ast', what: <>Acrescenta a um {mono('Vec')}, dobrando a capacidade (começa em 8) com {mono('mem_grow')}.</> },
        { name: 'build_type', kind: 'função estática', page: 'ast', what: <>Nó {mono('type')} para {mono('Type')}.</> },
        {
          name: 'new_expr',
          kind: 'função estática',
          sig: 'static Expr *new_expr(ExprKind kind, const Node *at)',
          what: <>Aloca uma {mono('Expr')} zerada com o tipo e a posição de {mono('at')}.</>,
          by: <>os {mono('build_*')} de expressão</>,
        },
        { name: 'op_from_token', kind: 'função estática', page: 'ast', what: <>Rótulo do token do operador para {mono('Op')}.</> },
        { name: 'build_binary', kind: 'função estática', page: 'ast', what: <>Os níveis binários: monta a cadeia associativa à esquerda a partir dos {mono('*_rest')}.</> },
        { name: 'build_expr_list', kind: 'função estática', page: 'ast', what: <>Uma {mono('expression_list')} para um {mono('Vec')}.</> },
        { name: 'build_args', kind: 'função estática', page: 'ast', what: <>Os argumentos de uma chamada (podem faltar).</> },
        { name: 'build_list', kind: 'função estática', page: 'ast', what: <>Literal de lista.</> },
        { name: 'build_field', kind: 'função estática', page: 'ast', what: <>Um campo de objeto; chave entre aspas perde as aspas.</> },
        { name: 'build_object', kind: 'função estática', page: 'ast', what: <>Literal de objeto.</> },
        { name: 'build_primary', kind: 'função estática', page: 'ast', what: <>Literais, identificador e parênteses.</> },
        { name: 'build_postfix', kind: 'função estática', page: 'ast', what: <>Os sufixos {mono('.campo')}, {mono('[i]')} e {mono('(args)')}, em cadeia.</> },
        { name: 'build_unary', kind: 'função estática', page: 'ast', what: <>{mono('-')} e {mono('!')} prefixos.</> },
        { name: 'build_expr', kind: 'função estática', page: 'ast', what: <>Despacha pelo rótulo do nó de expressão.</> },
        {
          name: 'new_stmt',
          kind: 'função estática',
          sig: 'static Stmt *new_stmt(StmtKind kind, const Node *at)',
          what: <>Aloca um {mono('Stmt')} zerado com o tipo e a posição de {mono('at')}.</>,
          by: <>{mono('build_var')}, {mono('build_const')}, {mono('build_expression_stmt')}, {mono('build_command')} e {mono('build_block')}</>,
        },
        {
          name: 'make_name',
          kind: 'função estática',
          sig: 'static Name make_name(const Node *token)',
          what: <>Um {mono('Name')} com a cópia do texto e a posição do token.</>,
          by: <>{mono('build_rhs')}, {mono('build_names')}, {mono('build_command')}, {mono('build_func')} e {mono('build_ast')} (para a {mono('main')})</>,
        },
        { name: 'build_rhs', kind: 'função estática', page: 'ast', what: <>Um {mono('rhs')} para {mono('Rhs')}: {mono('call')}, {mono('run')} ou valores.</> },
        { name: 'rhs_from_list', kind: 'função estática', page: 'ast', what: <>Uma lista de valores (a de {mono('const')}) para {mono('Rhs')}.</> },
        { name: 'build_names', kind: 'função estática', page: 'ast', what: <>Os nomes de um {mono('var')} ou {mono('const')}.</> },
        { name: 'build_var', kind: 'função estática', page: 'ast', what: <>{mono('var')} para {mono('ST_VAR')}.</> },
        { name: 'build_const', kind: 'função estática', page: 'ast', what: <>{mono('const')} para {mono('ST_VAR')} com {mono('is_const')}.</> },
        { name: 'build_expression_stmt', kind: 'função estática', page: 'ast', what: <>Comando que começa com expressão: chamada solta ou atribuição.</> },
        { name: 'build_command', kind: 'função estática', page: 'ast', what: <>Despacha um comando pelo rótulo.</> },
        { name: 'build_block', kind: 'função estática', page: 'ast', what: <>Um bloco para {mono('ST_BLOCK')}.</> },
        { name: 'build_func', kind: 'função estática', page: 'ast', what: <>Função ou workflow: nome, parâmetros, retorno e corpo.</> },
        { name: 'add_decl', kind: 'função estática', page: 'ast', what: <>Acrescenta um {mono('Decl')} ao vetor de declarações.</> },
        { name: 'add_global', kind: 'função estática', page: 'ast', what: <>Um {mono('global_no_func')}: {mono('var')}, {mono('const')} ou {mono('workflow')}.</> },
        { name: 'build_ast', kind: 'função', page: 'ast', what: <>Percorre {mono('before_main')}, {mono('after_func')} e {mono('after_main')} e devolve o {mono('Program')} (nulo se a árvore tem erro).</> },
      ],
    },
    {
      path: 'src/semantic/sema.c',
      lines: 990,
      page: 'semantica',
      role: <>A análise semântica: as três passadas, a pilha de escopos, a tipagem das expressões, o estado de fluxo e os erros E1 a E24.</>,
      items: [
        { name: 'Diag', kind: 'typedef struct', page: 'semantica', what: <>Um erro guardado: posição, ordem de chegada e a mensagem (até 300 bytes).</> },
        { name: 'diags', kind: 'variável estática', page: 'semantica', what: <>O buffer de erros, com {mono('n_diags')} e {mono('cap_diags')}.</> },
        { name: 'n_diags', kind: 'variável estática', page: 'semantica', what: <>Quantos erros estão no buffer.</> },
        { name: 'cap_diags', kind: 'variável estática', page: 'semantica', what: <>Capacidade do buffer; dobra em {mono('err')}.</> },
        { name: 'err', kind: 'função estática', page: 'semantica', what: <>Guarda um erro, descartando o repetido (mesma posição e mesmo texto).</> },
        { name: 'by_position', kind: 'função estática', page: 'semantica', what: <>Ordem do {mono('qsort')}: linha, coluna e ordem de chegada.</> },
        {
          name: 'T',
          kind: 'função estática',
          sig: 'static Type *T(TypeKind k)',
          what: <>Atalho de uma letra para {mono('type_prim(k)')}.</>,
          by: <>quase toda função {mono('check_*')} que devolve um tipo primitivo</>,
        },
        { name: 'tn', kind: 'função estática', page: 'semantica', what: <>{mono('type_name')} em um de quatro buffers que se revezam, para caber mais de um tipo na mesma mensagem.</> },
        {
          name: 'is_num',
          kind: 'função estática',
          sig: 'static int is_num(const Type *t)',
          what: <>1 para {mono('int')} e {mono('float')}.</>,
          by: <>{mono('num_or_dyn')}, {mono('check_binary')} e {mono('check_unary')}</>,
        },
        {
          name: 'num_or_dyn',
          kind: 'função estática',
          sig: 'static int num_or_dyn(const Type *t)',
          what: <>1 para {mono('int')}, {mono('float')} e dinâmico.</>,
          by: <>{mono('check_binary')}, nos operadores aritméticos e de ordem</>,
        },
        {
          name: 'plural',
          kind: 'função estática',
          sig: 'static const char *plural(int n, const char *one, const char *many)',
          what: <>{mono('one')} quando {mono('n')} é 1, senão {mono('many')}.</>,
          by: <>{mono('check_arg_count')} e {mono('count_mismatch')}</>,
        },
        { name: 'SymKind', kind: 'typedef enum', page: 'semantica', what: <>{mono('SYM_VAR')}, {mono('SYM_FUNC')}, {mono('SYM_WORKFLOW')}, {mono('SYM_LIBFN')} (as conversões) e {mono('SYM_TERMINAL')}.</> },
        { name: 'MAX_SYMS', kind: 'macro', page: 'semantica', what: <>8192: quantas variáveis por função o estado de fluxo acompanha.</> },
        { name: 'Symbol', kind: 'typedef struct', page: 'semantica', what: <>Uma entrada da tabela: nome, tipo, se é constante, o índice no fluxo, o estado de variável de erro e a função ligada.</> },
        { name: 'Scope', kind: 'typedef struct', page: 'semantica', what: <>Um escopo: a lista de símbolos e o escopo pai.</> },
        { name: 'scope', kind: 'variável estática', page: 'semantica', what: <>O escopo atual, topo da pilha.</> },
        { name: 'globals', kind: 'variável estática', page: 'semantica', what: <>O escopo global; atribuída e nunca lida.</> },
        { name: 'next_flow_id', kind: 'variável estática', page: 'semantica', what: <>O próximo índice livre do estado de fluxo; volta a 0 em cada função.</> },
        { name: 'scope_push', kind: 'função estática', page: 'semantica', what: <>Abre um escopo.</> },
        { name: 'scope_pop', kind: 'função estática', page: 'semantica', what: <>Fecha o escopo, reportando variáveis de erro não tratadas.</> },
        { name: 'lookup', kind: 'função estática', page: 'semantica', what: <>Procura um nome do escopo atual até o global.</> },
        {
          name: 'new_symbol',
          kind: 'função estática',
          sig: 'static Symbol *new_symbol(const char *name, SymKind kind, Type *type)',
          what: <>Aloca um símbolo com {mono('flow_id')} -1 (fora do estado de fluxo) e não o põe em escopo nenhum.</>,
          by: <>{mono('declare')} e {mono('declare_library')}</>,
        },
        { name: 'declare', kind: 'função estática', page: 'semantica', what: <>Declara no escopo atual; um nome já visível em qualquer escopo aberto é erro de redeclaração.</> },
        { name: 'Flow', kind: 'typedef struct', page: 'semantica', what: <>O estado de fluxo: um byte de &quot;inicializada&quot; por variável e {mono('dead')} (caminho que já saiu).</> },
        { name: 'flow', kind: 'variável estática', page: 'semantica', what: <>O estado de fluxo no ponto atual.</> },
        { name: 'merge', kind: 'função estática', page: 'semantica', what: <>Junta os dois ramos de um {mono('if')}: inicializada só se nos dois; um ramo morto não conta.</> },
        {
          name: 'mark_initialized',
          kind: 'função estática',
          sig: 'static void mark_initialized(Symbol *s)',
          what: <>Marca a variável como inicializada no fluxo atual; não faz nada se ela não tem índice ({mono('flow_id')} -1, caso dos globais).</>,
          by: <>{mono('check_var')}, {mono('check_assign')}, o {mono('for')} de {mono('check_stmt')} e {mono('check_func')} (parâmetros)</>,
        },
        { name: 'cur_func', kind: 'variável estática', page: 'semantica', what: <>A função sendo conferida; nula nos inicializadores globais.</> },
        { name: 'loop_depth', kind: 'variável estática', page: 'semantica', what: <>Quantos laços envolvem o ponto atual; zero faz {mono('break')} e {mono('continue')} darem erro.</> },
        { name: 'in_global_init', kind: 'variável estática', page: 'semantica', what: <>Ligada durante os inicializadores globais; atribuída e nunca lida.</> },
        {
          name: 'can_use_call_run',
          kind: 'função estática',
          sig: 'static int can_use_call_run(void)',
          what: <>1 dentro de um workflow ou da {mono('main')}.</>,
          by: <>{mono('check_call_or_run')} (o erro de {mono('call')}/{mono('run')} fora do lugar), {mono('check_var')} e {mono('check_assign')}</>,
          why: <>A mesma condição decide se a segunda variável de um {mono('call')} ou {mono('run')} vira variável de erro (que precisa ser tratada). Fora de workflow e de {mono('main')} já houve um erro, e marcá-la geraria um segundo erro, de erro não tratado, sobre o mesmo comando.</>,
        },
        { name: 'value_of', kind: 'função estática', page: 'semantica', what: <>Tipa uma expressão que precisa dar valor; chamada a função sem retorno dá erro.</> },
        { name: 'callee_name', kind: 'função estática', page: 'semantica', what: <>O nome a mostrar numa mensagem sobre uma chamada ou um acesso.</> },
        { name: 'expect_assignable', kind: 'função estática', page: 'semantica', what: <>Reporta tipo incompatível se {mono('type_assignable')} recusa.</> },
        { name: 'check_assign_to', kind: 'função estática', page: 'semantica', what: <>Confere um valor contra o tipo de destino; literal de lista é conferido item a item.</> },
        { name: 'check_cond', kind: 'função estática', page: 'semantica', what: <>Condição de {mono('if')} ou {mono('while')} tem de ser {mono('bool')}.</> },
        {
          name: 'op_text',
          kind: 'função estática',
          sig: 'static const char *op_text(Op op)',
          what: <>O símbolo de um {mono('Op')} para as mensagens (igual ao {mono('op_name')} de {mono('ast.c')}, que é estático lá).</>,
          by: <>{mono('check_binary')} e {mono('check_unary')}</>,
        },
        { name: 'check_binary', kind: 'função estática', page: 'semantica', what: <>Tipos dos operadores binários.</> },
        { name: 'check_unary', kind: 'função estática', page: 'semantica', what: <>Tipos de {mono('-')} e {mono('!')}.</> },
        { name: 'is_terminal', kind: 'função estática', page: 'semantica', what: <>Se a expressão é o identificador {mono('terminal')}.</> },
        { name: 'check_ident', kind: 'função estática', page: 'semantica', what: <>Uso de um nome: existe, é valor, já foi declarado, está inicializado.</> },
        { name: 'check_index', kind: 'função estática', page: 'semantica', what: <>{mono('a[i]')} em lista ou objeto.</> },
        { name: 'check_field', kind: 'função estática', page: 'semantica', what: <>{mono('a.campo')} em objeto.</> },
        { name: 'check_list_literal', kind: 'função estática', page: 'semantica', what: <>O tipo de um literal de lista pelo tipo comum dos itens.</> },
        { name: 'check_object_literal', kind: 'função estática', page: 'semantica', what: <>Tipa os valores; o resultado é {mono('object')}.</> },
        { name: 'check_arg_count', kind: 'função estática', page: 'semantica', what: <>Número de argumentos.</> },
        { name: 'eval_args', kind: 'função estática', page: 'semantica', what: <>Tipa os argumentos sem conferir contra parâmetros.</> },
        { name: 'check_args_against', kind: 'função estática', page: 'semantica', what: <>Argumentos contra os parâmetros de uma função ou workflow.</> },
        { name: 'check_conversion', kind: 'função estática', page: 'semantica', what: <>{mono('toString')}, {mono('toInt')}, {mono('toFloat')}, {mono('toBool')}.</> },
        { name: 'check_terminal_call', kind: 'função estática', page: 'semantica', what: <>{mono('terminal.log')}, {mono('info')}, {mono('warn')}, {mono('error')} e {mono('input')}.</> },
        { name: 'check_list_method', kind: 'função estática', page: 'semantica', what: <>{mono('length')}, {mono('push')} e {mono('remove')}.</> },
        { name: 'check_method_call', kind: 'função estática', page: 'semantica', what: <>Chamada com ponto: {mono('terminal')} ou método de lista.</> },
        { name: 'check_call', kind: 'função estática', page: 'semantica', what: <>Uma chamada, pelo tipo do símbolo chamado.</> },
        { name: 'check_expr', kind: 'função estática', page: 'semantica', what: <>Despacha pelo {mono('kind')} e grava o tipo em {mono('e->type')}.</> },
        { name: 'check_run_object', kind: 'função estática', page: 'semantica', what: <>Os campos do objeto de {mono('run')}: {mono('command')}, {mono('flags')}, {mono('workingDir')}.</> },
        { name: 'check_call_or_run', kind: 'função estática', page: 'semantica', what: <>O lado direito {mono('call')} ou {mono('run')}; devolve o tipo do resultado.</> },
        { name: 'count_mismatch', kind: 'função estática', page: 'semantica', what: <>A mensagem de quantidade de variáveis e de valores diferente.</> },
        { name: 'make_error_var', kind: 'função estática', page: 'semantica', what: <>Marca a variável como de erro, ainda não tratada.</> },
        { name: 'check_var', kind: 'função estática', page: 'semantica', what: <>Declaração {mono('var')} ou {mono('const')}, local ou global.</> },
        { name: 'check_target', kind: 'função estática', page: 'semantica', what: <>Um alvo de atribuição.</> },
        { name: 'check_assign', kind: 'função estática', page: 'semantica', what: <>Atribuição simples, múltipla ou de {mono('call')}/{mono('run')}.</> },
        { name: 'check_return', kind: 'função estática', page: 'semantica', what: <>{mono('return')} contra o tipo da função ou do workflow.</> },
        { name: 'check_stmt', kind: 'função estática', page: 'semantica', what: <>Um comando, com o fluxo dos ramos e laços.</> },
        { name: 'check_block', kind: 'função estática', page: 'semantica', what: <>Um bloco num escopo novo.</> },
        { name: 'check_func', kind: 'função estática', page: 'semantica', what: <>O corpo de uma função: declara os parâmetros, confere o bloco e, no fim, o E20 (retorno em todos os caminhos).</> },
        { name: 'declare_library', kind: 'função estática', page: 'semantica', what: <>Põe {mono('terminal')} e as quatro conversões no escopo global.</> },
        { name: 'semantic_check', kind: 'função', page: 'semantica', what: <>As três passadas; ordena e reporta os erros e devolve quantos foram.</> },
      ],
    },
  ],
}

const backend: Area = {
  title: 'Gerador: src/backend/',
  intro: <>O gerador de C e a chamada do {mono('gcc')}. A biblioteca de execução, que fica em {mono('src/backend/runtime/')}, tem a sua própria seção abaixo.</>,
  files: [
    {
      path: 'src/backend/codegen_c.c',
      lines: 530,
      page: 'gerador-c',
      role: <>Escreve o programa em C a partir da AST tipada, chama o {mono('gcc')} e roda o executável.</>,
      items: [
        { name: 'flux_runtime_source', kind: 'variável externa', page: 'mapa-e-build', what: <>O texto de {mono('flux_rt.h')} como string C; definida em {mono('build/runtime_src.c')}, gerado pelo Makefile.</> },
        { name: 'out', kind: 'variável estática', page: 'gerador-c', what: <>O arquivo de saída.</> },
        { name: 'depth', kind: 'variável estática', page: 'gerador-c', what: <>O recuo atual, em passos de dois espaços.</> },
        { name: 'next_tmp', kind: 'variável estática', page: 'gerador-c', what: <>O número do próximo temporário; volta a 0 em cada função.</> },
        { name: 'prog', kind: 'variável estática', page: 'gerador-c', what: <>O programa sendo gerado.</> },
        { name: 'cur_func', kind: 'variável estática', page: 'gerador-c', what: <>A função sendo gerada (para o {mono('return')}).</> },
        { name: 'emit', kind: 'função estática', page: 'gerador-c', what: <>Escreve uma linha recuada.</> },
        { name: 'fstr', kind: 'função estática', page: 'gerador-c', what: <>Formata uma string na arena.</> },
        {
          name: 'new_tmp',
          kind: 'função estática',
          sig: 'static char *new_tmp(void)',
          what: <>O nome do próximo temporário ({mono('t0')}, {mono('t1')}...), tirado de {mono('next_tmp')}.</>,
          by: <>{mono('expr')}, {mono('gen_binary')}, {mono('gen_call')}, {mono('gen_pair')} e o {mono('for')} de {mono('gen_stmt')}</>,
        },
        { name: 'find_func', kind: 'função estática', page: 'gerador-c', what: <>Acha uma função ou workflow pelo nome (fora a {mono('main')}).</> },
        { name: 'float_literal', kind: 'função estática', page: 'gerador-c', what: <>Um {mono('double')} escrito com 17 dígitos e sempre com ponto ou expoente.</> },
        { name: 'convert', kind: 'função estática', page: 'gerador-c', what: <>Gera o valor e, quando o destino pede, a conversão ({mono('fx_to_float')} ou um {mono('fx_as_*')}).</> },
        {
          name: 'binary_fn',
          kind: 'função estática',
          sig: 'static const char *binary_fn(Op op)',
          what: <>O nome da função da biblioteca de um operador binário: {mono('fx_add')}, {mono('fx_sub')}, {mono('fx_mul')}, {mono('fx_div')}, {mono('fx_mod')}, {mono('fx_lt')}, {mono('fx_le')}, {mono('fx_gt')}, {mono('fx_ge')}, {mono('fx_eq')} e, no caso padrão, {mono('fx_ne')}.</>,
          by: <>{mono('gen_binary')}</>,
          why: <>O caso padrão cobre {mono('OP_NE')} e qualquer outro valor. {mono('OP_AND')} e {mono('OP_OR')} nunca chegam aqui ({mono('gen_binary')} os gera com curto-circuito antes), nem os unários {mono('OP_NEG')} e {mono('OP_NOT')} (gerados em {mono('expr')}). Um operador novo precisa de um caso aqui; sem ele, viraria {mono('fx_ne')} sem aviso.</>,
        },
        { name: 'gen_binary', kind: 'função estática', page: 'gerador-c', what: <>Operador binário; {mono('&&')} e {mono('||')} com curto-circuito.</> },
        {
          name: 'join_args',
          kind: 'função estática',
          sig: 'static char *join_args(char **args, int n)',
          what: <>Junta {mono('n')} textos separados por vírgula e espaço, numa string nova da arena.</>,
          by: <>{mono('gen_call')} (chamada de função) e {mono('gen_pair')} (chamada de workflow)</>,
        },
        { name: 'gen_call', kind: 'função estática', page: 'gerador-c', what: <>Chamadas: conversões, funções, {mono('terminal')} e métodos de lista.</> },
        { name: 'expr', kind: 'função estática', page: 'gerador-c', what: <>Gera uma expressão e devolve o texto C do valor (literal ou temporário).</> },
        { name: 'gen_pair', kind: 'função estática', page: 'gerador-c', what: <>{mono('call')} ou {mono('run')}: um {mono('FxPair')} temporário.</> },
        { name: 'gen_var', kind: 'função estática', page: 'gerador-c', what: <>Declaração {mono('var')}/{mono('const')}, local ou global.</> },
        { name: 'assign_to', kind: 'função estática', page: 'gerador-c', what: <>Atribui a um nome, a um campo ou a um índice.</> },
        { name: 'gen_assign', kind: 'função estática', page: 'gerador-c', what: <>Atribuição; os valores são todos calculados antes de qualquer atribuição.</> },
        { name: 'gen_block', kind: 'função estática', page: 'gerador-c', what: <>Um bloco entre chaves.</> },
        { name: 'gen_return', kind: 'função estática', page: 'gerador-c', what: <>{mono('return')} de função ou de workflow.</> },
        { name: 'gen_stmt', kind: 'função estática', page: 'gerador-c', what: <>Um comando, precedido de {mono('FX_LINE')} (fora blocos, {mono('break')} e {mono('continue')}).</> },
        { name: 'signature', kind: 'função estática', page: 'gerador-c', what: <>A assinatura C de uma função ({mono('f_nome')}) ou workflow ({mono('w_nome')}).</> },
        { name: 'gen_func', kind: 'função estática', page: 'gerador-c', what: <>Uma função inteira, com {mono('fx_check_stack')} na entrada.</> },
        { name: 'generate_c', kind: 'função', page: 'gerador-c', what: <>O arquivo C inteiro: a biblioteca, os globais, as funções e {mono('fx_program')}.</> },
        { name: 'windows_target', kind: 'variável estática', page: 'gerador-c', what: <>1 com {mono('--windows')}.</> },
        { name: 'set_windows_target', kind: 'função', page: 'gerador-c', what: <>Liga {mono('windows_target')}.</> },
        { name: 'is_windows_target', kind: 'função', page: 'gerador-c', what: <>Lê {mono('windows_target')}.</> },
        { name: 'run_program', kind: 'função estática', page: 'gerador-c', what: <>{mono('fork')} e {mono('execvp')}; devolve o código de saída (128 mais o sinal, se morto por sinal).</> },
        { name: 'compile_c', kind: 'função', page: 'gerador-c', what: <>Chama o {mono('gcc')} (ou {mono('FLUX_CC')}, ou o {mono('mingw')} no alvo Windows).</> },
        { name: 'execute_program', kind: 'função', page: 'gerador-c', what: <>Roda o executável (pelo {mono('wine')} no alvo Windows).</> },
      ],
      after: (
        <Callout kind="nota">
          O C gerado tem nomes que não existem em nenhum fonte: {mono('fx_program')} (a função que inicializa e chama {mono('f_main')}), {mono('f_<nome>')} para funções, {mono('w_<nome>')} para
          workflows, {mono('v_<nome>')} para variáveis, {mono('t<N>')} para temporários e {mono('i_t<N>')} para o contador de um {mono('for')}. Estão descritos no{' '}
          {link('gerador-c')}.
        </Callout>
      ),
    },
  ],
}

const runtime: Area = {
  title: 'Biblioteca de execução: flux_rt.h',
  intro: (
    <>
      {mono('src/backend/runtime/flux_rt.h')} vai inteiro para dentro de cada programa gerado. Toda função dele é declarada com {mono('FX_FN')} ({mono('static')} e marcada como possivelmente sem uso), então
      só existe no programa gerado; o compilador não a chama. As do coletor estão em {link('coletor')}; as demais, em {link('runtime')}.
    </>
  ),
  files: [
    {
      path: 'src/backend/runtime/flux_rt.h',
      lines: 1140,
      page: 'runtime',
      role: <>Os valores, os operadores, as conversões, o {mono('terminal')}, o {mono('run')}, o coletor de lixo e a entrada do programa.</>,
      items: [
        { name: '__USE_MINGW_ANSI_STDIO', kind: 'macro', page: 'runtime', what: <>Definida no Windows antes dos {mono('#include')}, para o {mono('printf')} do MinGW entender os formatos de {mono('size_t')} e {mono('long long')}.</> },
        { name: 'fx_isatty', kind: 'macro', page: 'runtime', what: <>{mono('_isatty')} no Windows, {mono('isatty')} no POSIX.</> },
        { name: 'FX_FN', kind: 'macro', page: 'runtime', what: <>{mono('static __attribute__((unused))')}: o prefixo de toda função da biblioteca.</> },
        { name: 'FxTag', kind: 'typedef enum', page: 'runtime', what: <>{mono('FX_NULL')}, {mono('FX_INT')}, {mono('FX_FLOAT')}, {mono('FX_BOOL')}, {mono('FX_STRING')}, {mono('FX_LIST')}, {mono('FX_OBJECT')}.</> },
        { name: 'FxValue', kind: 'typedef struct', page: 'runtime', what: <>Um valor: a etiqueta e a união {mono('as')} ({mono('i')}, {mono('f')}, {mono('b')}, {mono('s')}, {mono('l')}, {mono('o')}).</> },
        { name: 'FxList', kind: 'typedef struct', page: 'runtime', what: <>{mono('n')}, {mono('cap')} e o vetor {mono('v')}.</> },
        { name: 'FxObj', kind: 'typedef struct', page: 'runtime', what: <>{mono('n')}, {mono('cap')}, {mono('keys')} e {mono('vals')}, em ordem de inserção.</> },
        { name: 'FxPair', kind: 'typedef struct', page: 'runtime', what: <>{mono('result')} e {mono('error')}: o retorno de workflow e de {mono('run')}.</> },
        { name: 'fx_line', kind: 'variável estática', page: 'runtime', what: <>A linha FluxLang em execução, para os erros.</> },
        { name: 'FX_LINE', kind: 'macro', page: 'runtime', what: <>Grava {mono('fx_line')}; o gerador a põe antes de cada comando.</> },
        { name: 'fx_tagged', kind: 'variável estática', page: 'runtime', what: <>1 com {mono('FLUX_TAGGED')}: saída etiquetada para a interface web.</> },
        { name: 'fx_use_color', kind: 'função', page: 'runtime', what: <>Se usa cor num descritor: {mono('NO_COLOR')}, {mono('FORCE_COLOR')} e depois se é terminal.</> },
        { name: 'fx_color_of', kind: 'função', page: 'runtime', what: <>A sequência ANSI de cada tipo de impressão.</> },
        { name: 'fx_emit', kind: 'função', page: 'runtime', what: <>Escreve um registro etiquetado na saída padrão.</> },
        { name: 'fx_die', kind: 'função', page: 'runtime', what: <>Erro de execução: mensagem com a linha e saída com código 1.</> },
        { name: 'fx_tag_name', kind: 'função', page: 'runtime', what: <>O nome de uma etiqueta para as mensagens.</> },
        { name: 'fx_null_use', kind: 'função', page: 'runtime', what: <>O erro de uso de {mono('null')}.</> },
        { name: 'fx_type_err', kind: 'função', page: 'runtime', what: <>O erro de tipo (ou de {mono('null')}, se o valor é nulo).</> },
        { name: 'fx_stack_base', kind: 'variável estática', page: 'runtime', what: <>O topo da pilha na entrada do programa; também o limite da varredura do coletor.</> },
        { name: 'fx_stack_limit', kind: 'variável estática', page: 'runtime', what: <>Quanto da pilha o programa pode usar antes do erro de recursão.</> },
        { name: 'fx_check_stack', kind: 'função', page: 'runtime', what: <>Na entrada de cada função gerada: erro se a pilha passou do limite.</> },
        { name: 'FxBlockKind', kind: 'typedef enum', page: 'coletor', what: <>{mono('FXB_RAW')}, {mono('FXB_LIST')}, {mono('FXB_VALUES')}, {mono('FXB_OBJ')}, {mono('FXB_KEYS')}: o que há num bloco, para saber o que seguir.</> },
        { name: 'FxBlock', kind: 'typedef struct', page: 'coletor', what: <>O cabeçalho de cada bloco do coletor: próximo, tamanho, tipo e marca.</> },
        { name: 'fx_blocks', kind: 'variável estática', page: 'coletor', what: <>A lista de todos os blocos.</> },
        { name: 'fx_block_count', kind: 'variável estática', page: 'coletor', what: <>Quantos blocos há.</> },
        { name: 'fx_gc_since', kind: 'variável estática', page: 'coletor', what: <>Bytes alocados desde a última coleta.</> },
        { name: 'fx_gc_threshold', kind: 'variável estática', page: 'coletor', what: <>Quando coletar; ao menos 4 MiB.</> },
        { name: 'fx_gc_disabled', kind: 'variável estática', page: 'coletor', what: <>1 com {mono('FLUX_GC=0')}.</> },
        { name: 'fx_gc_stress', kind: 'variável estática', page: 'coletor', what: <>1 com {mono('FLUX_GC_STRESS')}: coleta a cada alocação.</> },
        { name: 'fx_gc_runs', kind: 'variável estática', page: 'coletor', what: <>Quantas coletas houve (para {mono('FLUX_GC_STATS')}).</> },
        { name: 'fx_gc_freed', kind: 'variável estática', page: 'coletor', what: <>Quantos blocos foram liberados.</> },
        { name: 'fx_roots', kind: 'variável estática', page: 'coletor', what: <>As raízes registradas (os globais), com {mono('fx_n_roots')} e {mono('fx_cap_roots')}.</> },
        { name: 'fx_n_roots', kind: 'variável estática', page: 'coletor', what: <>Quantas raízes há.</> },
        { name: 'fx_cap_roots', kind: 'variável estática', page: 'coletor', what: <>Capacidade de {mono('fx_roots')}.</> },
        { name: 'fx_gc_sorted', kind: 'variável estática', page: 'coletor', what: <>Os blocos ordenados por endereço durante uma coleta, com {mono('fx_gc_n')}.</> },
        { name: 'fx_gc_n', kind: 'variável estática', page: 'coletor', what: <>Quantos há em {mono('fx_gc_sorted')}.</> },
        { name: 'fx_gc_todo', kind: 'variável estática', page: 'coletor', what: <>A pilha de blocos marcados a seguir, com {mono('fx_gc_todo_n')} e {mono('fx_gc_todo_cap')}.</> },
        { name: 'fx_gc_todo_n', kind: 'variável estática', page: 'coletor', what: <>Quantos estão em {mono('fx_gc_todo')}.</> },
        { name: 'fx_gc_todo_cap', kind: 'variável estática', page: 'coletor', what: <>Capacidade de {mono('fx_gc_todo')}.</> },
        { name: 'fx_no_memory', kind: 'função', page: 'runtime', what: <>{mono('Memória esgotada.')} e saída com código 2.</> },
        { name: 'fx_gc_root', kind: 'função', page: 'coletor', what: <>Registra o endereço de um global como raiz.</> },
        { name: 'fx_block_cmp', kind: 'função', page: 'coletor', what: <>Ordem por endereço, para o {mono('qsort')}.</> },
        { name: 'fx_gc_find', kind: 'função', page: 'coletor', what: <>Busca binária: o bloco que contém um endereço, ou nulo.</> },
        { name: 'fx_gc_mark_ptr', kind: 'função', page: 'coletor', what: <>Marca o bloco de um ponteiro e o empilha para seguir.</> },
        { name: 'fx_gc_mark_value', kind: 'função', page: 'coletor', what: <>Marca o que um valor aponta (string, lista ou objeto).</> },
        { name: 'fx_gc_trace', kind: 'função', page: 'coletor', what: <>Segue os ponteiros de um bloco marcado, conforme o tipo.</> },
        { name: 'fx_gc_scan_range', kind: 'função', page: 'coletor', what: <>Varre uma faixa de memória palavra a palavra (a pilha).</> },
        { name: 'fx_gc_collect', kind: 'função', page: 'coletor', what: <>Uma coleta: salva registradores, marca a partir das raízes e da pilha, varre e recalcula o limite.</> },
        { name: 'fx_gc_alloc', kind: 'função', page: 'coletor', what: <>Aloca um bloco zerado, coletando antes se passou do limite.</> },
        { name: 'fx_alloc', kind: 'função', page: 'coletor', what: <>Bloco {mono('FXB_RAW')} (texto, buffers).</> },
        { name: 'fx_gc_report', kind: 'função', page: 'coletor', what: <>Com {mono('FLUX_GC_STATS')}, imprime as contas na saída de erro no fim.</> },
        { name: 'fx_init', kind: 'função', page: 'runtime', what: <>Lê as variáveis de ambiente, prepara a saída no Windows e calcula o limite da pilha.</> },
        { name: 'FxStart', kind: 'typedef struct', page: 'runtime', what: <>Só no Windows: o programa a rodar e o código que ele devolve.</> },
        { name: 'fx_thread_main', kind: 'função', page: 'runtime', what: <>Só no Windows: o corpo da thread que roda o programa.</> },
        { name: 'fx_start', kind: 'função', page: 'runtime', what: <>Roda {mono('fx_program')}; no Windows, numa thread de pilha de 64 MiB.</> },
        { name: 'fx_null', kind: 'função', page: 'runtime', what: <>O valor {mono('null')}.</> },
        { name: 'fx_int', kind: 'função', page: 'runtime', what: <>Um {mono('int')}.</> },
        { name: 'fx_float', kind: 'função', page: 'runtime', what: <>Um {mono('float')}.</> },
        { name: 'fx_bool', kind: 'função', page: 'runtime', what: <>Um {mono('bool')} (0 ou 1).</> },
        { name: 'fx_str', kind: 'função', page: 'runtime', what: <>Uma {mono('string')} (sem copiar).</> },
        { name: 'fx_new_list', kind: 'função', page: 'runtime', what: <>Lista vazia.</> },
        { name: 'fx_new_object', kind: 'função', page: 'runtime', what: <>Objeto vazio.</> },
        { name: 'fx_pair', kind: 'função', page: 'runtime', what: <>Um {mono('FxPair')}.</> },
        { name: 'fx_list_add', kind: 'função', page: 'runtime', what: <>Acrescenta a uma lista, dobrando o vetor (começa em 4).</> },
        { name: 'fx_as_list_ptr', kind: 'função', page: 'runtime', what: <>O {mono('FxList')} de um valor, ou erro de tipo.</> },
        { name: 'fx_as_obj_ptr', kind: 'função', page: 'runtime', what: <>O {mono('FxObj')} de um valor, ou erro de tipo.</> },
        { name: 'fx_obj_find', kind: 'função', page: 'runtime', what: <>O índice de uma chave, ou -1.</> },
        { name: 'fx_obj_put', kind: 'função', page: 'runtime', what: <>Grava uma chave (substitui ou acrescenta no fim).</> },
        { name: 'fx_obj_set', kind: 'função', page: 'runtime', what: <>{mono('fx_obj_put')} num objeto literal recém-criado.</> },
        { name: 'fx_field', kind: 'função', page: 'runtime', what: <>{mono('o.campo')}; campo que falta dá {mono('null')}.</> },
        { name: 'fx_set_field', kind: 'função', page: 'runtime', what: <>{mono('o.campo = v')}.</> },
        { name: 'fx_index_of', kind: 'função', page: 'runtime', what: <>Confere um índice de lista (inteiro e dentro do tamanho).</> },
        { name: 'fx_index', kind: 'função', page: 'runtime', what: <>{mono('a[i]')} em lista ou objeto.</> },
        { name: 'fx_set_index', kind: 'função', page: 'runtime', what: <>{mono('a[i] = v')}.</> },
        { name: 'fx_length', kind: 'função', page: 'runtime', what: <>{mono('lista.length()')}.</> },
        { name: 'fx_push', kind: 'função', page: 'runtime', what: <>{mono('lista.push(v)')}.</> },
        { name: 'fx_remove', kind: 'função', page: 'runtime', what: <>{mono('lista.remove(i)')}.</> },
        { name: 'fx_for_list', kind: 'função', page: 'runtime', what: <>A lista de um {mono('for')}, ou erro de tipo.</> },
        { name: 'fx_as_int', kind: 'função', page: 'runtime', what: <>Confere que um valor dinâmico é {mono('int')} (ou {mono('null')}); as irmãs {mono('fx_as_bool')}, {mono('fx_as_string')}, {mono('fx_as_list')}, {mono('fx_as_object')} fazem o mesmo.</> },
        { name: 'fx_as_bool', kind: 'função', page: 'runtime', what: <>Confere {mono('bool')}.</> },
        { name: 'fx_as_string', kind: 'função', page: 'runtime', what: <>Confere {mono('string')}.</> },
        { name: 'fx_as_list', kind: 'função', page: 'runtime', what: <>Confere {mono('list')}.</> },
        { name: 'fx_as_object', kind: 'função', page: 'runtime', what: <>Confere {mono('object')}.</> },
        { name: 'fx_as_float', kind: 'função', page: 'runtime', what: <>Confere {mono('float')}, promovendo {mono('int')}.</> },
        { name: 'fx_is_num', kind: 'função', page: 'runtime', what: <>Se é {mono('int')} ou {mono('float')}.</> },
        { name: 'fx_num', kind: 'função', page: 'runtime', what: <>O número como {mono('double')}.</> },
        { name: 'fx_need_nums', kind: 'função', page: 'runtime', what: <>Erro se algum dos dois não é número.</> },
        { name: 'fx_concat', kind: 'função', page: 'runtime', what: <>Junta duas strings num bloco novo.</> },
        { name: 'fx_add', kind: 'função', page: 'runtime', what: <>{mono('+')}: soma ou concatenação, com conferência de estouro.</> },
        { name: 'fx_sub', kind: 'função', page: 'runtime', what: <>{mono('-')} binário.</> },
        { name: 'fx_mul', kind: 'função', page: 'runtime', what: <>{mono('*')}.</> },
        { name: 'fx_div', kind: 'função', page: 'runtime', what: <>{mono('/')}: entre inteiros, divisão inteira com erro de divisão por zero e de estouro; com {mono('float')}, divisão real.</> },
        { name: 'fx_mod', kind: 'função', page: 'runtime', what: <>{mono('%')}: só inteiros.</> },
        { name: 'fx_neg', kind: 'função', page: 'runtime', what: <>{mono('-')} unário.</> },
        { name: 'fx_cond', kind: 'função', page: 'runtime', what: <>O {mono('bool')} de uma condição, ou erro de tipo.</> },
        { name: 'fx_not', kind: 'função', page: 'runtime', what: <>{mono('!')}.</> },
        { name: 'fx_order', kind: 'função', page: 'runtime', what: <>Compara dois números; avisa quando não há ordem ({mono('nan')}).</> },
        { name: 'fx_lt', kind: 'função', page: 'runtime', what: <>{mono('<')}; {mono('fx_le')}, {mono('fx_gt')} e {mono('fx_ge')} são {mono('<=')}, {mono('>')} e {mono('>=')}.</> },
        { name: 'fx_le', kind: 'função', page: 'runtime', what: <>{mono('<=')}.</> },
        { name: 'fx_gt', kind: 'função', page: 'runtime', what: <>{mono('>')}.</> },
        { name: 'fx_ge', kind: 'função', page: 'runtime', what: <>{mono('>=')}.</> },
        { name: 'fx_equal', kind: 'função', page: 'runtime', what: <>Igualdade em C (0 ou 1); nunca falha.</> },
        { name: 'fx_eq', kind: 'função', page: 'runtime', what: <>{mono('==')}.</> },
        { name: 'fx_ne', kind: 'função', page: 'runtime', what: <>{mono('!=')}.</> },
        { name: 'fx_dup_printf', kind: 'função', page: 'runtime', what: <>Formata uma string num bloco novo.</> },
        { name: 'fx_fmt_float', kind: 'função', page: 'runtime', what: <>A forma mais curta (15 a 17 dígitos) que volta ao mesmo número.</> },
        { name: 'fx_repr', kind: 'função', page: 'runtime', what: <>O texto de um valor; strings dentro de lista ou objeto vão entre aspas.</> },
        { name: 'fx_to_string', kind: 'função', page: 'runtime', what: <>{mono('toString')}.</> },
        { name: 'fx_cannot_convert', kind: 'função', page: 'runtime', what: <>O erro de conversão impossível.</> },
        { name: 'fx_to_int', kind: 'função', page: 'runtime', what: <>{mono('toInt')}.</> },
        { name: 'fx_to_float', kind: 'função', page: 'runtime', what: <>{mono('toFloat')} (e a promoção de {mono('int')} feita pelo gerador).</> },
        { name: 'fx_to_bool', kind: 'função', page: 'runtime', what: <>{mono('toBool')}.</> },
        { name: 'fx_print', kind: 'função', page: 'runtime', what: <>A impressão comum de {mono('log')}, {mono('info')}, {mono('warn')} e {mono('error')}.</> },
        { name: 'fx_log', kind: 'função', page: 'runtime', what: <>{mono('terminal.log')}.</> },
        { name: 'fx_info', kind: 'função', page: 'runtime', what: <>{mono('terminal.info')}.</> },
        { name: 'fx_warn', kind: 'função', page: 'runtime', what: <>{mono('terminal.warn')} (na saída de erro, fora do modo etiquetado).</> },
        { name: 'fx_error', kind: 'função', page: 'runtime', what: <>{mono('terminal.error')} (na saída de erro, fora do modo etiquetado).</> },
        { name: 'fx_input', kind: 'função', page: 'runtime', what: <>{mono('terminal.input')}: lê uma linha.</> },
        { name: 'fx_abort', kind: 'função', page: 'runtime', what: <>{mono('abort if')}: termina com o texto do erro.</> },
        { name: 'fx_run_result', kind: 'função', page: 'runtime', what: <>O par de {mono('run')} a partir do código de saída e das saídas capturadas.</> },
        { name: 'fx_run_room', kind: 'função', page: 'runtime', what: <>Garante espaço num buffer de captura.</> },
        { name: 'fx_win_message', kind: 'função', page: 'runtime', what: <>Só no Windows: o texto de um código de erro do sistema.</> },
        { name: 'fx_win_quote', kind: 'função', page: 'runtime', what: <>Só no Windows: um argumento entre aspas pelas regras da linha de comando.</> },
        { name: 'fx_run_process', kind: 'função', page: 'runtime', what: <>Roda o comando e captura as saídas (duas versões: POSIX e Windows).</> },
        { name: 'fx_run', kind: 'função', page: 'runtime', what: <>{mono('run')}: lê {mono('command')}, {mono('flags')} e {mono('workingDir')} do objeto e chama {mono('fx_run_process')}.</> },
      ],
    },
  ],
}

const util: Area = {
  title: 'Utilitários: src/util/',
  intro: <>A arena de memória do compilador.</>,
  files: [
    {
      path: 'src/util/mem.h',
      lines: 10,
      page: 'arena',
      role: <>A interface da arena.</>,
      items: [
        guard('MEM_H'),
        { name: 'mem_alloc', kind: 'protótipo', page: 'arena', what: <>Definida em {mono('mem.c')}, como as seguintes.</> },
        { name: 'mem_strdup', kind: 'protótipo', page: 'arena', what: <>Definida em {mono('mem.c')}.</> },
        { name: 'mem_grow', kind: 'protótipo', page: 'arena', what: <>Definida em {mono('mem.c')}.</> },
        { name: 'mem_free_all', kind: 'protótipo', page: 'arena', what: <>Definida em {mono('mem.c')}.</> },
      ],
    },
    {
      path: 'src/util/mem.c',
      lines: 60,
      page: 'arena',
      role: <>O alocador de arena: blocos grandes, pedaços alinhados a 16 bytes, liberação de tudo de uma vez.</>,
      items: [
        { name: 'CHUNK_SIZE', kind: 'macro', page: 'arena', what: <>256 KiB, o tamanho padrão de um bloco.</> },
        { name: 'Chunk', kind: 'typedef struct', page: 'arena', what: <>O cabeçalho de um bloco: anterior, usado e tamanho.</> },
        { name: 'chunks', kind: 'variável estática', page: 'arena', what: <>O bloco mais recente, o único que recebe alocações.</> },
        { name: 'die_no_memory', kind: 'função estática', page: 'arena', what: <>{mono('Memória esgotada.')} e saída com código 2.</> },
        { name: 'mem_alloc', kind: 'função', page: 'arena', what: <>Um pedaço zerado e alinhado; nunca devolve nulo.</> },
        { name: 'mem_strdup', kind: 'função', page: 'arena', what: <>Cópia de uma string na arena.</> },
        { name: 'mem_grow', kind: 'função', page: 'arena', what: <>Cresce um vetor copiando para um pedaço novo; o antigo fica na arena.</> },
        { name: 'mem_free_all', kind: 'função', page: 'arena', what: <>Libera todos os blocos no fim de {mono('main')}.</> },
      ],
    },
  ],
}

const server: Area = {
  title: 'Servidor da interface: web/server/',
  intro: <>O plugin do Vite que dá à interface as rotas {mono('/api/compile')} e {mono('/api/run')}, e a configuração do Vite que o carrega.</>,
  files: [
    {
      path: 'web/server/flux-api.ts',
      lines: 130,
      page: 'interface-web',
      role: <>As duas rotas: {mono('/api/compile')} roda {mono('./flux --json')}, {mono('/api/run')} confere a origem e chama {mono('runProgram')}.</>,
      items: [
        { name: 'MAX_BYTES', kind: 'constante', page: 'interface-web', what: <>1 MiB, o maior corpo aceito.</> },
        { name: 'TIMEOUT_MS', kind: 'constante', page: 'interface-web', what: <>5 segundos para o {mono('./flux --json')}.</> },
        { name: 'sendJson', kind: 'função', page: 'interface-web', what: <>Responde com JSON (texto pronto ou objeto), se ainda não respondeu.</> },
        { name: 'fail', kind: 'constante (função)', page: 'interface-web', what: <>Responde {mono('{ error }')} com o código dado.</> },
        { name: 'readBody', kind: 'função', page: 'interface-web', what: <>Lê o corpo até o limite; acima dele responde 413 e devolve nulo.</> },
        { name: 'isTrustedRunRequest', kind: 'função', page: 'interface-web', what: <>Host local, cabeçalho {mono('X-Flux-Run')} igual a 1 e cabeçalho {mono('Origin')} ausente ou igual a {mono('http://')} mais o host: só então o Executar roda.</> },
        { name: 'fluxApi', kind: 'função exportada', page: 'interface-web', what: <>O plugin: resolve o caminho do {mono('./flux')} e instala {mono('handler')} (que despacha para {mono('compile')} ou {mono('run')}) no servidor de desenvolvimento e no de prévia.</> },
      ],
    },
    {
      path: 'web/server/run-program.ts',
      lines: 170,
      page: 'interface-web',
      role: <>O Executar: compila com {mono('--build')} numa pasta temporária, roda com {mono('FLUX_TAGGED=1')} e traduz a saída etiquetada.</>,
      items: [
        { name: 'OUTPUT_LIMIT', kind: 'constante', page: 'interface-web', what: <>1 MiB por saída capturada.</> },
        { name: 'BUILD_TIMEOUT_MS', kind: 'constante', page: 'interface-web', what: <>30 segundos para compilar.</> },
        { name: 'RUN_TIMEOUT_MS', kind: 'constante', page: 'interface-web', what: <>10 segundos para rodar.</> },
        { name: 'OutputKind', kind: 'tipo exportado', page: 'interface-web', what: <>Os tipos de linha de saída; o mesmo de {mono('lib/types.ts')}, repetido aqui.</> },
        { name: 'OutputLine', kind: 'interface exportada', page: 'interface-web', what: <>{mono('kind')} e {mono('text')}.</> },
        { name: 'RunResult', kind: 'interface exportada', page: 'interface-web', what: <>A resposta de {mono('/api/run')}.</> },
        { name: 'Exec', kind: 'interface', page: 'interface-web', what: <>O resultado de {mono('exec')}: código, sinal, saídas, estouro de tempo e corte.</> },
        { name: 'KINDS', kind: 'constante', page: 'interface-web', what: <>Letra da etiqueta para {mono('OutputKind')}.</> },
        { name: 'parseTagged', kind: 'função exportada', page: 'interface-web', what: <>Lê os registros etiquetados; texto solto vira {mono('raw')}.</> },
        { name: 'exec', kind: 'função', page: 'interface-web', what: <>Roda um processo em grupo próprio, com limite de tempo e de saída.</> },
        { name: 'runProgram', kind: 'função exportada', page: 'interface-web', what: <>O caminho todo: compila, roda, junta as saídas e apaga a pasta.</> },
      ],
    },
    {
      path: 'web/vite.config.ts',
      lines: 15,
      page: 'interface-web',
      role: <>A configuração do Vite: React, Tailwind e {mono('fluxApi')}, servidor em {mono('127.0.0.1')}.</>,
      items: [
        { name: 'repoRoot', kind: 'constante', page: 'interface-web', what: <>A raiz do repositório, liberada para o Vite servir os exemplos de {mono('docs/exemplos/')}.</> },
      ],
    },
  ],
}

const webApp: Area = {
  title: 'Aplicação web: web/src/',
  intro: <>O front-end da interface (fora a documentação, que tem a seção seguinte).</>,
  files: [
    {
      path: 'web/src/main.tsx',
      lines: 10,
      page: 'interface-web',
      role: <>Monta {mono('App')} em {mono('StrictMode')} no elemento {mono('#root')} e importa {mono('index.css')}. Não define nomes.</>,
      items: [],
    },
    {
      path: 'web/src/index.css',
      lines: 50,
      page: 'interface-web',
      role: <>Os tokens de cor e de fonte ({mono('--color-bg')}, {mono('--color-ink')}, {mono('--color-accent')} e os demais), com os valores do tema escuro em {mono('prefers-color-scheme: dark')}.</>,
      items: [],
    },
    {
      path: 'web/src/App.tsx',
      lines: 130,
      page: 'interface-web',
      role: <>O componente raiz: o estado da tela, os cinco painéis do editor e a troca entre editor e documentação.</>,
      items: [
        { name: 'SAMPLES', kind: 'constante', page: 'interface-web', what: <>Os dois exemplos de {mono('docs/exemplos/')} dos botões da barra.</> },
        { name: 'checkbox', kind: 'constante', what: <>As classes da caixa de marcar ocultar *_rest.</> },
        { name: 'smallButton', kind: 'constante', what: <>As classes dos botões Expandir e Recolher do painel da árvore.</> },
        { name: 'App', kind: 'componente (exportação padrão)', page: 'interface-web', what: <>Guarda código, foco, opções e entrada, e liga {mono('useCompile')}, {mono('useRun')} e {mono('useHashRoute')} aos componentes.</> },
      ],
    },
    {
      path: 'web/src/components/Editor.tsx',
      lines: 70,
      page: 'interface-web',
      role: <>O editor: um {mono('textarea')} com a coluna de números de linha e as faixas das linhas com erro.</>,
      items: [
        { name: 'LINE_HEIGHT', kind: 'constante', page: 'interface-web', what: <>20, a altura de uma linha, para posicionar faixas e rolagem.</> },
        { name: 'PADDING', kind: 'constante', page: 'interface-web', what: <>8, o recuo interno do {mono('textarea')}.</> },
        { name: 'EditorProps', kind: 'interface', page: 'interface-web', what: <>{mono('value')}, {mono('onChange')}, {mono('errorLines')}, {mono('focus')}.</> },
        { name: 'Editor', kind: 'componente', page: 'interface-web', what: <>Seleciona o trecho de {mono('focus')} e rola até ele quando o foco muda.</> },
      ],
    },
    {
      path: 'web/src/components/TokenList.tsx',
      lines: 30,
      page: 'interface-web',
      role: <>A lista de tokens do painel Tokens.</>,
      items: [
        { name: 'TokenListProps', kind: 'interface', what: <>{mono('tokens')} e {mono('onSelect(line, column, length)')}.</> },
        { name: 'TokenList', kind: 'componente', page: 'interface-web', what: <>Um botão por token; clicar seleciona o token no editor.</> },
      ],
    },
    {
      path: 'web/src/components/ErrorList.tsx',
      lines: 30,
      page: 'interface-web',
      role: <>A lista de erros do painel Erros.</>,
      items: [
        { name: 'ErrorListProps', kind: 'interface', what: <>{mono('errors')} e {mono('onSelect(line, column)')}.</> },
        { name: 'ErrorList', kind: 'componente', page: 'interface-web', what: <>Um botão por erro; clicar seleciona a linha no editor.</> },
      ],
    },
    {
      path: 'web/src/components/TreeView.tsx',
      lines: 95,
      page: 'interface-web',
      role: <>A árvore de derivação do painel Árvore sintática.</>,
      items: [
        { name: 'TreeViewProps', kind: 'interface', page: 'interface-web', what: <>{mono('root')}, {mono('hideRest')}, {mono('expandKey')}, {mono('expandAll')}, {mono('onSelect')}.</> },
        { name: 'TreeView', kind: 'componente', page: 'interface-web', what: <>A raiz (ou as raízes, com os {mono('*_rest')} ocultos).</> },
        { name: 'NodeProps', kind: 'interface', page: 'interface-web', what: <>As propriedades de um nó.</> },
        { name: 'INITIAL_DEPTH', kind: 'constante', page: 'interface-web', what: <>4: os nós abaixo desta profundidade começam recolhidos.</> },
        { name: 'Node', kind: 'componente', page: 'interface-web', what: <>Um nó, com o botão de abrir e o de selecionar no editor.</> },
      ],
    },
    {
      path: 'web/src/components/Panel.tsx',
      lines: 30,
      page: 'interface-web',
      role: <>A moldura comum dos painéis.</>,
      items: [
        { name: 'PanelProps', kind: 'interface', what: <>{mono('title')}, {mono('actions')}, {mono('className')}, {mono('children')}.</> },
        { name: 'Panel', kind: 'componente', page: 'interface-web', what: <>Título em cima e corpo que rola, como região focável.</> },
      ],
    },
    {
      path: 'web/src/components/InputBox.tsx',
      lines: 25,
      page: 'interface-web',
      role: <>O campo da entrada do programa (o que {mono('terminal.input')} vai ler).</>,
      items: [
        { name: 'InputBoxProps', kind: 'interface', what: <>{mono('value')} e {mono('onChange')}.</> },
        { name: 'InputBox', kind: 'componente', page: 'interface-web', what: <>Um {mono('textarea')} de três linhas com rótulo.</> },
      ],
    },
    {
      path: 'web/src/components/OutputPanel.tsx',
      lines: 90,
      page: 'interface-web',
      role: <>O painel Saída: o resultado do Executar.</>,
      items: [
        { name: 'KIND', kind: 'constante', what: <>Para cada {mono('OutputKind')}, o rótulo da coluna da esquerda e a classe de cor.</> },
        { name: 'note', kind: 'constante', what: <>As classes das notas pequenas do painel ({mono('(sem saída)')}, saída cortada, mensagem).</> },
        { name: 'Row', kind: 'interface', page: 'interface-web', what: <>Uma linha mostrada: tipo, texto e, para um {mono('prompt')}, a resposta.</> },
        { name: 'rows', kind: 'função', page: 'interface-web', what: <>Junta cada {mono('prompt')} com o {mono('answer')} que vem logo depois numa linha só.</> },
        { name: 'OutputPanel', kind: 'componente', page: 'interface-web', what: <>Mostra a fase da execução, o título do resultado e as linhas.</> },
      ],
    },
    {
      path: 'web/src/components/TopBar.tsx',
      lines: 150,
      page: 'interface-web',
      role: <>A barra de cima: as abas Editor e Documentação, os botões, a caixa da análise semântica e o resumo.</>,
      items: [
        { name: 'TopBarProps', kind: 'interface', what: <>O resultado, os estados e as funções que a barra chama.</> },
        { name: 'TABS', kind: 'constante', what: <>As duas abas, {mono('editor')} e {mono('docs')}, na ordem.</> },
        { name: 'button', kind: 'constante', what: <>As classes dos botões comuns da barra.</> },
        { name: 'TopBar', kind: 'componente', page: 'interface-web', what: <>A barra; as abas se movem com as setas, Home e End.</> },
      ],
    },
    {
      path: 'web/src/lib/types.ts',
      lines: 55,
      page: 'interface-web',
      role: <>Os tipos do contrato com o {mono('--json')} e com {mono('/api/run')}.</>,
      items: [
        { name: 'NodeKind', kind: 'tipo', page: 'arvore-json', what: <>{mono('rule')}, {mono('token')}, {mono('empty')}, {mono('error')}.</> },
        { name: 'TreeNode', kind: 'interface', page: 'interface-web', what: <>Um nó do JSON.</> },
        { name: 'Token', kind: 'interface', page: 'interface-web', what: <>Um token do JSON.</> },
        { name: 'CompileError', kind: 'interface', page: 'interface-web', what: <>Um erro do JSON.</> },
        { name: 'CompileResult', kind: 'interface', page: 'interface-web', what: <>O objeto do {mono('--json')}.</> },
        { name: 'OutputKind', kind: 'tipo', page: 'interface-web', what: <>Os tipos de linha de saída.</> },
        { name: 'OutputLine', kind: 'interface', page: 'interface-web', what: <>Uma linha de saída.</> },
        { name: 'RunResult', kind: 'interface', page: 'interface-web', what: <>A resposta de {mono('/api/run')}.</> },
        { name: 'Focus', kind: 'interface', page: 'interface-web', what: <>O que selecionar no editor; {mono('nonce')} faz o mesmo ponto valer de novo.</> },
      ],
    },
    {
      path: 'web/src/lib/tree.ts',
      lines: 15,
      page: 'interface-web',
      role: <>As funções da árvore usadas pelo painel.</>,
      items: [
        { name: 'isRestNode', kind: 'constante (função)', page: 'interface-web', what: <>Regra terminada em {mono('_rest')} ou {mono('_after_comma')}.</> },
        { name: 'collapseRest', kind: 'função', page: 'interface-web', what: <>Tira os nós ε e sobe os filhos dos {mono('*_rest')}.</> },
        { name: 'countNodes', kind: 'função', page: 'interface-web', what: <>Conta os nós (o número no título do painel).</> },
      ],
    },
    {
      path: 'web/src/lib/useCompile.ts',
      lines: 45,
      page: 'interface-web',
      role: <>O gancho que compila o código a cada mudança.</>,
      items: [
        { name: 'DEBOUNCE_MS', kind: 'constante', what: <>400: a espera depois da última mudança antes de compilar.</> },
        { name: 'State', kind: 'interface', what: <>{mono('result')}, {mono('loading')} e {mono('failure')}.</> },
        { name: 'useCompile', kind: 'gancho', page: 'interface-web', what: <>Chama {mono('/api/compile')} (cancelando o pedido anterior) e devolve o estado e {mono('compileNow')}.</> },
      ],
    },
    {
      path: 'web/src/lib/useRun.ts',
      lines: 35,
      page: 'interface-web',
      role: <>O gancho do Executar.</>,
      items: [
        { name: 'RunState', kind: 'tipo exportado', page: 'interface-web', what: <>{mono('idle')}, {mono('running')}, {mono('done')} com o resultado, {mono('failed')} com a mensagem.</> },
        { name: 'useRun', kind: 'gancho', page: 'interface-web', what: <>Chama {mono('/api/run')} com o cabeçalho {mono('X-Flux-Run')} e devolve o estado e {mono('run')}.</> },
      ],
    },
  ],
}

const AREAS: Area[] = [driver, frontend, semantic, backend, runtime, util, server, webApp]

const baseName = (path: string) => path.slice(path.lastIndexOf('/') + 1)

function PageCell({ item }: { item: Item }) {
  if (item.page) return link(item.page)
  return <span className="text-muted">só aqui</span>
}

function FileSection({ file }: { file: SourceFile }) {
  const rows = file.items.filter((i) => !i.sig)
  const local = file.items.filter((i) => i.sig)
  return (
    <>
      <H3 title={file.path.startsWith('web/src/') ? file.path.slice('web/src/'.length) : file.path} />
      <P>
        {file.path.startsWith('web/src/') && <>{mono(file.path)}. </>}
        {file.role} Cerca de {file.lines} linhas.{file.page && <> Página: {link(file.page)}.</>}
      </P>
      {rows.length > 0 && (
        <Table head={['Nome', 'Tipo', 'O que é', 'Página']} rows={rows.map((i) => [mono(i.name), i.kind, i.what, <PageCell key={i.name} item={i} />])} />
      )}
      {local.map((i) => (
        <Fragment key={i.name}>
          <Fn name={i.name} signature={i.sig ?? ''}>
            {i.what} Quem chama: {i.by}.
          </Fn>
          {i.why && <Why>{i.why}</Why>}
        </Fragment>
      ))}
      {file.after}
    </>
  )
}

interface IndexEntry {
  name: string
  file: string
  page?: Slug
}

function buildIndex(): [string, IndexEntry[]][] {
  const entries: IndexEntry[] = []
  for (const area of AREAS)
    for (const file of area.files)
      for (const item of file.items)
        if (!NOT_INDEXED.has(item.kind))
          for (const name of item.name.split(', ')) entries.push({ name, file: baseName(file.path), page: item.page ?? file.page })
  entries.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()) || a.file.localeCompare(b.file))
  const groups = new Map<string, IndexEntry[]>()
  for (const e of entries) {
    const first = e.name[0].toUpperCase()
    const key = /[A-Z]/.test(first) ? first : '_'
    groups.set(key, [...(groups.get(key) ?? []), e])
  }
  return [...groups.entries()]
}

function NameIndex() {
  return (
    <Table
      head={['Inicial', 'Nomes, arquivos e páginas']}
      rows={buildIndex().map(([letter, list]) => [
        letter,
        <span key={letter}>
          {list.map((e, i) => (
            <Fragment key={`${e.name}-${e.file}`}>
              {i > 0 && ', '}
              {mono(e.name)} <span className="text-muted">{e.file}</span>
              {e.page && <> <span className="whitespace-nowrap">({link(e.page)})</span></>}
            </Fragment>
          ))}
        </span>,
      ])}
    />
  )
}

function FilesTable() {
  return (
    <Table
      head={['Arquivo', 'Tamanho', 'Papel', 'Página']}
      rows={[
        ...AREAS.flatMap((area) =>
          area.files.map((f) => [mono(f.path), `cerca de ${f.lines} linhas`, f.role, f.page ? link(f.page) : <span key={f.path} className="text-muted">só aqui</span>]),
        ),
        [mono('web/src/docs/'), 'cerca de 1.140 linhas fora as páginas', 'O sistema da documentação e as páginas, como esta.', link('documentacao')],
      ]}
    />
  )
}

export function Referencia() {
  return (
    <>
      <H2 title="Como usar esta página" />
      <P>
        Uma consulta rápida: cada arquivo do compilador e da interface com tudo o que ele define, funções, estruturas, enumerações, macros, variáveis globais e componentes, e a página que explica cada
        um em detalhe. O que já tem explicação completa noutra página aparece numa linha da tabela do arquivo, com o link. As funções auxiliares que nenhuma outra página explica aparecem num quadro
        próprio, depois da tabela, com a assinatura, o que fazem e quem as chama. Os demais nomes que só esta página cobre (variáveis, constantes e tipos pequenos) ficam na tabela, numa linha só,
        marcados como só aqui.
      </P>
      <P>
        Para achar onde um nome mora, use o índice no fim da página (nome, arquivo e página) ou a busca da documentação. As constantes de uma enumeração aparecem na linha do tipo dela; os protótipos dos
        cabeçalhos aparecem na seção do cabeçalho, mas o índice aponta para o arquivo que define.
      </P>

      <H2 title="Todos os arquivos" />
      <P>Os tamanhos são os de hoje, arredondados.</P>
      <FilesTable />

      {AREAS.map((area) => (
        <Fragment key={area.title}>
          <H2 title={area.title} />
          <P>{area.intro}</P>
          {area.files.map((f) => (
            <FileSection key={f.path} file={f} />
          ))}
        </Fragment>
      ))}

      <H2 title="Documentação: web/src/docs/" />
      <P>
        Os arquivos do sistema da documentação ({mono('types.ts')}, {mono('registry.ts')}, {mono('blocks.tsx')}, {mono('highlight.ts')}, {mono('searchIndex.ts')}, {mono('DocsView.tsx')},{' '}
        {mono('DocsNav.tsx')}, {mono('DocsSearch.tsx')}, {mono('DocsToc.tsx')}, {mono('DocsContext.tsx')}, {mono('useHashRoute.ts')}, {mono('useModal.ts')}, {mono('useOverflowFocus.ts')}) e as
        páginas estão descritos em {link('documentacao')}, com o que cada um define.
      </P>

      <H2 title="Índice de nomes" />
      <P>Em ordem alfabética, com o arquivo em que cada nome aparece nesta página e a página que o explica. Quase sempre é o arquivo que define o nome; as exceções são {mono('yyin')} e {mono('yylex_destroy')}, só declarados em {mono('main.c')}, e {mono('flux_runtime_source')}, só declarado em {mono('codegen_c.c')} (a linha de cada um diz onde é definido). Nomes iguais em arquivos diferentes aparecem uma vez para cada arquivo.</P>
      <NameIndex />
    </>
  )
}
