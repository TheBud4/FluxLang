# AGENTS.md — FluxLang

Guia para agentes de IA que trabalham neste repositório. Leia este arquivo
inteiro antes de qualquer ação.

## O que é

FluxLang é uma linguagem tipada e pequena, voltada à **automação de tarefas
e workflows**, criada junto com o seu compilador. É o trabalho da
disciplina de Compiladores de um grupo de até 4 pessoas. Os enunciados estão
em `docs/ENUNCIADO.md`.

| Entrega | Data | O que pede |
|---|---|---|
| Trabalho 1 | 01/10/2026 | Artigo SBC (compiladores, análises léxica/sintática/semântica, BNF, exemplo válido e inválido com a definição dos erros); lexer + parser com mensagens em português citando token encontrado e esperado; mínimo de 2 laços, 1 condicional, declarações únicas e em lista com e sem valor, 3 tipos; entrada padrão; apresentação |
| Trabalho 2 | 26/11/2026 | Leitura de arquivo, interface gráfica (código, contagem de linhas, tokens, aceito/rejeitado, erros, árvore sintática), modo pânico, AST; apresentação mostrando a transformação para LL(1), o modo pânico e a interface |
| Extras | — | Realce das linhas com erro; geração de código C + `gcc` |

Implementação: C, lexer em Flex, parser em GNU Bison 3.6+, binário
`./flux`. Lexer e parser do T1 prontos: erros L1–L6, mensagens
sintáticas em português (`parse.error custom`, `yyreport_syntax_error` no
fim do `src/parser.y`), checagem S3 nas ações (campo `flag` dos nós),
modo `-t`/`--tokens`, árvore de derivação (`--tree`, `src/tree.c`: um nó
por não-terminal da BNF, inclusive `*_rest`, mais folhas de token, ε e
`error`), `--json` (`src/json.c`: tokens, erros e árvore; formato no
README, seção 9). `make test` roda `tests/lexico/` (com `-t`),
`tests/sintatico/`, `tests/arvore/` (com `--tree`) e `tests/json/` (`tests/run.sh`; `--generate` cria os
`.out` que faltam, que devem ser conferidos à mão).

## Mapa do repositório

| Caminho | Papel | Quem edita |
|---|---|---|
| `README.md` | Especificação da linguagem (seções 1–10, Gramática, Escopo da v1, Em aberto) | Agente, com revisão do usuário |
| `docs/ERROS.md` | Catálogo de erros: formato, léxicos L1–L6, sintáticos S1–S3, semânticos E1–E22, exemplo inválido, modo pânico, execução R1–R5 | Agente, com revisão do usuário |
| `docs/BNF.txt` | Gramática LL(1), escrita pelo usuário | **Só o usuário** (ver regras) |
| `docs/exemplos/valido.flux` / `invalido.flux` | Exemplos do artigo (o inválido tem 7 erros, descritos na seção 5 do ERROS.md) | Agente, com revisão do usuário |
| `docs/TAREFAS.md` | Checklist passo a passo até as entregas | Agente e usuário |
| `docs/ENUNCIADO.md` | Texto original dos Trabalhos 1 e 2 | Ninguém (texto da disciplina) |

## Regras de trabalho

1. **O usuário decide o design da linguagem.** O agente orienta: pergunta,
   compara alternativas, explica consequências, recomenda e registra. Nunca
   introduza uma escolha de linguagem nova sem perguntar. Mudanças
   mecânicas (propagar uma decisão já tomada, links, erros de digitação,
   fatoração LL(1)) podem ser feitas direto.
2. **`docs/BNF.txt` é somente leitura.** A única escrita permitida é
   adicionar linhas de comentário no formato
   `;; [erro]: ...` (problema) ou `;; [pendente]: ...` (dica ou decisão
   que falta escrever). Depois que o usuário corrige, o agente valida e o
   usuário remove o comentário. Nunca altere outras linhas.
3. **Não use a pasta `Old/` como referência.** Ela era a primeira versão,
   feita com muita IA, e foi removida em aec8c3c; as regras de lá foram
   substituídas. O único arquivo que valia virou `docs/ENUNCIADO.md`.
4. **Toda mudança na gramática deve continuar LL(1).** Confira à mão os
   conflitos FIRST/FIRST e FIRST/FOLLOW e reporte-os.
5. **Consistência entre arquivos.** Uma decisão tomada precisa aparecer em
   README, ERROS.md, exemplos e (como `[pendente]`) na BNF. Os links do
   README usam o prefixo `docs/`; os do ERROS.md são relativos a `docs/`.
6. **Idioma:** documentação e mensagens do compilador em português; a
   BNF usa nomes de não-terminais em inglês (`<before_main>`,
   `<commands>`, `<return_type>`...).
7. **Git:** nunca adicione `Co-Authored-By` nem qualquer atribuição a IA
   nas mensagens de commit. Só commite quando o usuário pedir. `build/`,
   `flux` e `compile_commands.json` estão no `.gitignore` (commit eeff661),
   mas continuam versionados, então todo `make` altera arquivos rastreados.
   Decisão pendente do usuário: tirá-los do controle de versão
   (`git rm --cached`) ou voltar a versioná-los de propósito.

## Estado atual (03/10/2026)

- Trabalho 1 entregue em 01/10. O parser continua em Bison (decisão de
  14/11: o enunciado não exige parser escrito à mão). O modo pânico
  simples está pronto (regras `error` em `command`, `global_no_func` e
  `after_func`): o `invalido.flux` dá os 7 erros sem cascata. Falta
  retomar em `}`/palavras de comando e em `func`/`workflow` (ver ERROS.md,
  seção 6). A árvore de derivação (`--tree`) e o `--json` estão prontos. Próximo passo: a interface web.
- README e ERROS.md revisados e coerentes com as decisões abaixo. Os
  blocos `.flux` do README passam pela gramática.
- A BNF está completa (seções 0–6) e é LL(1): 71 não-terminais, sem
  conflitos FIRST/FIRST ou FIRST/FOLLOW, sem recursão à esquerda (conferido
  por uma tabela preditiva independente e pelo Bison).
  Não há comentários `[erro]`/`[pendente]` abertos.
- Os exemplos foram escritos pelo agente. O commit f22850e tirou uma linha
  de comentário do `invalido.flux`; as posições da seção 5 do ERROS.md
  foram reconferidas com o `flux` em 02/10 (o erro 1 está em 3:20). Os
  casos `tests/sintatico/invalido_erroN.flux` ainda usam a versão antiga,
  com uma linha a mais (pendência do usuário em `docs/TAREFAS.md`).
- Pendentes para o T2: a seção da interface gráfica no README e a
  demonstração da transformação para LL(1). O histórico git tem o antes e
  o depois reais da BNF (7c94f9c → e9a06e3).
- Auditoria do projeto (02/10): os pendentes estão em `docs/TAREFAS.md`.
- Lexer e parser implementados e testados: 57 casos (`tests/lexico/`: 19,
  cobrindo os 56 tokens e L1–L6; `tests/sintatico/`: 38, com cada linha da
  seção 3 do ERROS.md, os 7 erros do `invalido.flux` isolados, variações
  do S3 e programas válidos). Os 7 erros saem nas posições da seção 5.
- Próximos passos: `docs/TAREFAS.md`.

## Plano até o T2

Compilador completo (front, middle, back end; alvo x86-64; sem transpilar
para C). Até 26/11: modo pânico no Bison, árvore de
derivação, `--json` e interface web.

## A linguagem em uma página

Detalhes e exemplos no README; mensagens e códigos no ERROS.md.

**Programa:** `var`, `const`, `func` e `workflow` globais em qualquer
ordem, mais exatamente uma `func main () { }`, sem parâmetros e sem tipo.
`main` é palavra reservada, e a unicidade é garantida pela gramática.

**Tipos:** `int`, `float`, `string`, `bool`, `object`, `list<tipo>`
(homogênea, índice a partir de 0); `null` é a ausência de valor e pode
ir para qualquer tipo.

**Declarações:** `var a, b:int = 1, 2;`. O `:tipo` vale para todos os
nomes; com valor inicial, pode ser omitido (inferência), tanto em `var`
quanto em `const`. `const` exige valor e é raso (o conteúdo de `object`/
`list` pode mudar). `var x;`, `var x = null;` e `var x = [];` são
inválidos. Existem atribuições múltiplas (`a, b = 1, 2;`).

**Funções:** `func f(a:int):int { }` retorna um único valor, com `return`
obrigatório em todos os caminhos. Sem `:tipo`, não retorna valor (só
`return;`). Podem ser recursivas. **Não podem usar `call` nem `run`.**

**Workflows:** `workflow w(p:string):string { }` retorna o par
`(resultado, erro)` com `return r, e;`. Sem `:tipo`, o resultado é sempre
`null`. O fim natural devolve `(null, null)`. São chamados só com `call` e
podem ser recursivos.

**`call` e `run`:** não são expressões. A gramática só os aceita logo
depois do `=` de um `var` ou de uma atribuição, sozinhos e com duas
variáveis: `var r, e = call w(x);`, `r, e = run { command: "ls" };`. O
`run` usa sintaxe de objeto: `command` (string, obrigatório), `flags`
(`list<string>`) e `workingDir` (string). Ele devolve
`(saída padrão, null)`; se o comando não inicia ou sai com código ≠ 0,
devolve `(null, saída de erro)` ou `(null, "comando 'x' terminou com código N")`.

**Erros:** o erro é uma `string`, e `null` significa "sem erro". Todo erro
de `call`/`run` deve ser tratado antes do fim do bloco onde foi declarado
(vale um bloco interno) com:
- `stop if e;`: devolve `(null, e)`; só dentro de workflow;
- `abort if e;`: imprime na saída de erro e encerra com código 1;
- `proceed if e;`: marca como tratado e segue.

Nada acontece se `e` for `null`. O operando precisa ser uma variável de
erro (a segunda variável de um `call`/`run`). Um workflow cria um erro
próprio com `return null, "mensagem";`. Os outros erros de execução
(conversão impossível, índice fora da lista, uso de `null`, divisão
inteira por zero, tipo errado de campo) são fatais: R1–R5.

**Controle de fluxo:** `if (cond) { } else { }` sem `else if` (o `else`
é seguido de bloco); `while (cond) { }`; `for item in lista { }`, sem
parênteses; `break;` e `continue;`. Condições devem ser `bool`. Todo
bloco `{ }` cria escopo; a variável do `for` vive só no laço.

**Escopo:** é proibido declarar um nome já visível (não há shadowing).
Blocos irmãos podem reutilizar nomes. Os nomes da biblioteca (`terminal`,
`toString`, `toInt`, `toFloat`, `toBool`) são globais pré-declarados. Uma
variável sem valor precisa ser atribuída em todos os caminhos antes do
uso (regra do Java).

**Operadores:** 8 níveis de precedência (seção 3 do README). A única
conversão implícita é `int` → `float`. `int / int` é divisão inteira.
`+` concatena só `string + string` (use `toString`). `%` só com `int`. `==`
e `!=` funcionam entre valores do mesmo tipo ou com `null`; `list` e
`object` só se comparam com `null`.

**Objetos** (preparando para HTTP): são dinâmicos, como JSON. Chaves são
identificadores ou strings (`{ "Content-Type": "x" }`), com acesso por
`obj.campo` ou `obj["chave"]`. Atribuir a um campo novo cria o campo, e
ler um campo ausente devolve `null`. O tipo de um campo é conferido na
execução (R5), então um valor de campo não serve para inferir o tipo de
um `var` (E8). As formas tipadas (`object{...}`) ficam para depois.

**Listas:** `l.length()`, `l.push(v)` e `l.remove(i)`; `push` e `remove`
não devolvem valor.

**Biblioteca:** `terminal.log/info/warn/error/input` (`input` devolve
`string`) e as conversões `toString/toInt/toFloat/toBool`. Nenhum desses
nomes é palavra reservada: todos são `IDENTIFIER` no lexer.

**Léxico:** case-sensitive; strings só com aspas duplas, em uma linha,
com os escapes `\n \t \" \\`; comentários `//` e `/* */` (sem
aninhamento). `5.`, `2itens`, `1e10`, `0xFF` e `3.14abc` são erro léxico. Inteiros
vão até 2147483647. `&` e `|` sozinhos são erro. Pelo maior casamento,
`list<int>=` exige espaço antes do `=`.

**Mensagens de erro:** `Erro léxico|sintático|semântico [linha L, coluna C]:`
seguido de `Token encontrado: X` / `Esperado: Y`. Quando todos os tokens
de uma categoria cabem, a lista vira uma palavra: `Esperado: expressão`,
`tipo` ou `comando`. O T1 parava no primeiro erro; hoje há modo pânico
simples (regras `error`: sincroniza em `;` ou lendo um bloco `{ }` inteiro;
o refinamento com `}`, palavras de comando e `func`/`workflow` está em
ERROS.md, seção 6).

**Geração de código:** ainda não existe. O alvo planejado é x86-64
nativo, sem passar por C; a representação dos tipos na execução será
definida junto com o backend (veja as decisões D2 e D7 da auditoria).

**Fora da v1:** HTTP, formas tipadas de `object` e outros recursos
avançados.
