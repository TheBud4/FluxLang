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
| Extras | — | Realce das linhas com erro; geração de código C + `gcc` (feitos) |

Implementação: C. Lexer em Flex, parser em GNU Bison 3.6+, binário `./flux`.
O resto (árvore, AST, análise semântica, gerador de C, biblioteca de execução)
está descrito em "Estado atual (handoff)" abaixo, com as flags do `./flux`.

## Mapa do repositório

| Caminho | Papel | Quem edita |
|---|---|---|
| `README.md` | Especificação da linguagem (seções 1–10, Gramática, Escopo da v1, Em aberto) | Agente, com revisão do usuário |
| `docs/ERROS.md` | Catálogo de erros: formato, léxicos L1–L6, sintáticos S1–S3, semânticos E1–E24, exemplo inválido, modo pânico, execução R1–R7, saída colorida/etiquetada, memória e Windows | Agente, com revisão do usuário |
| `docs/BNF.txt` | Gramática LL(1), escrita pelo usuário | **Só o usuário** (ver regras) |
| `docs/exemplos/valido.flux` / `invalido.flux` | Exemplos do artigo (o inválido tem 7 erros, descritos na seção 5 do ERROS.md) | Agente, com revisão do usuário |
| `web/` | Interface web (Vite + React + Tailwind); o plugin `web/server/flux-api.ts` roda `./flux --json` (`/api/compile`) e executa programas (`/api/run`, botão Executar) | Agente, com revisão do usuário |
| `src/` | Driver: `main.c` (opções, `report_error`), `json.c` (saída `--json`), `fluxc.h` | Agente |
| `src/frontend/` | `lexer.l`, `parser.y`, `tree.c`/`tree.h` (análise léxica e sintática, árvore de derivação) | Agente |
| `src/semantic/` | `types.c`, `ast.c`, `ast_build.c`, `sema.c` (+ `.h`): tipos, AST e análise semântica | Agente |
| `src/backend/` | `codegen_c.c` (gerador de C) e `runtime/flux_rt.h`: biblioteca de execução (valores, operadores, `run`, `terminal`, coletor de lixo), embutida em todo `.c` gerado | Agente |
| `src/util/` | `mem.c`/`mem.h`: arena do compilador (nunca chame malloc/strdup direto) | Agente |
| `tests/` | Casos por pasta (ver "Estado atual"); `tests/run.sh` roda tudo | Agente |
| `docs/TAREFAS.md` | Checklist passo a passo até as entregas | Agente e usuário |
| `docs/specs/` | Desenho da interface web, escrito antes de construí-la | Agente |
| `docs/entregas/` | Artigo SBC (`.docx`) e slides (`.pptx`) entregues | Usuário |
| `tools/vscode-fluxlang/` | Extensão do VS Code (realce de sintaxe da FluxLang) | Agente |
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
   nas mensagens de commit. Só commite quando o usuário pedir, em commits
   pequenos e lógicos (código/testes separados da documentação). `build/`,
   `flux`, `compile_commands.json`, `web/node_modules` e `web/dist` ficam
   fora do controle de versão.
8. **Quem escreve o código:** desde 14/11 o agente escreve o código e
   explica o que fez; a BNF continua só do usuário (regra 2) e as decisões
   de linguagem continuam do usuário (regra 1).
9. **Medir antes de afirmar.** Tentativas que pioraram o resultado ficam
   registradas na documentação com o número que as derrubou (ver o
   refinamento do pânico em ERROS.md, seção 6) para ninguém repeti-las.

## Estado atual (15/11/2026): handoff

**Resumo.** O Trabalho 2 vence em 26/11/2026. O compilador está completo para
o enunciado e para os dois extras: lexer, parser com modo pânico, árvore de
derivação, `--json`, interface web, AST, análise semântica (E1 a E24) e um
gerador de C com biblioteca de execução. O que falta não é código: os slides,
a demonstração e o ensaio (feitos por outras pessoas) e a pergunta ao
professor (ver `docs/TAREFAS.md`). O Trabalho 1 foi entregue em 01/10.

### Como construir e testar

```
make            # gera ./flux
make test       # tests/run.sh: 203 casos; leva alguns minutos (passadas do coletor e do Windows)
make asan       # compilador e programas gerados com ASan + UBSan + LeakSanitizer; restaura o build normal
make web        # interface em http://127.0.0.1:5173 (Node 20+)
```

Precisa de `gcc`, `flex`, `bison` 3.6+ e GNU `make` 4.3+. Opcionais: `libasan` e
`libubsan` (`make asan`); `mingw64-gcc` e `wine` (as passadas de Windows do
`make test`; sem eles elas são puladas com um aviso); `clang` (só para
conferir o código gerado: `FLUX_CC=clang bash tests/run.sh`). `tests/run.sh
--generate` roda a suíte inteira e cria os `.out` que faltam: **confira cada
um à mão**, ele grava o que o compilador imprimiu.

### O que o `./flux` faz

| Flag | Resultado |
|---|---|
| (nenhuma) | léxico + sintaxe; `Programa aceito.` ou `rejeitado.` |
| `-t` | só os tokens |
| `--tree` / `--ast` | árvore de derivação (fiel à BNF) / AST enxuta |
| `--json` | tokens, erros, linhas e árvore, para a interface |
| `--semantic` | confere E1 a E24 (a interface a liga por padrão) |
| `--c` | imprime o programa em C, com a biblioteca embutida |
| `--build [-o x]` / `--run` | gera o executável via `gcc` / gera, roda e apaga |
| `--windows` | com `--build`/`--run`: `.exe` com `mingw64-gcc`; o `--run` usa o `wine` |

### Estrutura do código

`parser.y` é uma transcrição regra a regra da BNF, com ações uniformes
`$$ = mknode("regra", n, ...)`; as regras `error` fazem o modo pânico simples.
`ast_build.c` converte a árvore de derivação em AST; `sema.c` roda três passadas
(declarar globais, conferir inicializadores, conferir corpos) com pilha de
escopos, tipos e um estado de fluxo para E3/E20. `codegen_c.c` gera C: todo
valor é um `FxValue` com etiqueta, cada subexpressão vai para um temporário
(ordem de avaliação da esquerda para a direita) e `&&`/`||` viram `if`.
`src/backend/runtime/flux_rt.h` é embutido em todo `.c` gerado (o Makefile o transforma em
`build/runtime_src.c`) e tem os operadores, `run`, `terminal`, o coletor de
lixo e as versões Windows/POSIX. O compilador aloca de um arena (`mem.c`).

### Testes (`tests/run.sh`)

`lexico`, `sintatico`, `arvore`, `json`, `ast`, `semantico` (um caso por regra
E1 a E24 e casos de borda), `exec` (programas que rodam e têm a saída
conferida; `X.in` é a entrada padrão, se existir), `exec_tagged`, `exec_color`,
`exec_nocolor`, `exec_windows`. Além disso, o `run.sh` repete `exec` com o
coletor em estresse (`FLUX_GC_STRESS=1`, coleta a cada alocação, a saída tem de
ser idêntica) e como `.exe` no `wine` (normal e em estresse).

### Decisões que o usuário tomou

- Manter o Bison (o enunciado não exige parser à mão); modo pânico **simples**.
- Dispensar a demonstração da transformação para LL(1): a linguagem nasceu LL(1).
- Backend em **C + gcc**, não x86-64 nativo. Windows: o **programa gerado** roda
  lá; o `flux` e a interface web exigem Linux/macOS (no Windows, WSL).
- D1 a D8 (campo de object dinâmico, list/object por referência, globais
  visíveis em todo o arquivo, `terminal.*` com qualquer tipo, conversões
  enxutas, `1 == 1.0`, estouro de int é erro R6, caminhos que terminam em
  return/break/continue contam), mais E23 (global sem valor inicial) e E24
  (só chamadas valem como comando). `[1, 2.5]` é `list<float>`.
- Slides, demonstração e ensaio são de outras pessoas.

### Escolhas minhas que o usuário não confirmou (mudáveis, em ERROS.md §4 e §7)

`terminal.log` e `info` na saída padrão, `warn` e `error` na de erro, sem
prefixo; float impresso na forma mais curta com `.0`; `terminal.input` devolve
`""` no fim da entrada; `run` devolve a saída padrão inteira (com o `\n`
final); cores no terminal (log azul, info ciano, warn amarelo, error vermelho);
posições dos erros semânticos; o amarelo do tema claro da interface é âmbar
escuro (contraste).

### Pendências e limitações conhecidas

| Item | Situação |
|---|---|
| Cascata de erros no pânico | Um `{` esquecido, ou função com o bloco aberto, gera erros extras. O refinamento foi medido e **piora**; não repetir. |
| `flux` e interface web no Windows | Só via WSL. Só o programa gerado roda no Windows. |
| macOS | Nunca testado. A biblioteca é POSIX e passou com `clang`, mas não houve execução lá. |
| Testes automáticos da interface web | Só tipos, build e os gates de acessibilidade; a API foi testada à mão com `curl`. |
| Entrada interativa na interface | A entrada é um campo preenchido antes de Executar; não há terminal interativo. |
| Mensagens do compilador sem cor | Só a saída do programa é colorida. |
| Gate de overflow da interface | Falha por falso positivo (linhas escondidas pela rolagem); verificado à mão. |
| x86-64 nativo | Possível etapa futura, reaproveitando a biblioteca. Só se o usuário pedir. |
| Pergunta ao professor | Em aberto em `docs/TAREFAS.md`. |

### Armadilhas (aprendidas na prática)

- **Nunca chame `malloc`/`strdup` em `src/`**: use `mem_alloc`/`mem_strdup`/`mem_grow`.
  O `make asan` roda com o LeakSanitizer ligado e acusa qualquer escape.
- **O coletor é conservador.** Ele varre a pilha do C e aceita ponteiros para o
  meio de um bloco e para o **cabeçalho** (o `clang -O1` guarda só o endereço do
  `calloc`). Mexeu em alocação da biblioteca? Rode o `exec` em estresse e o
  `make asan`. `FLUX_GC=0` desliga o coletor para investigar.
- **Teste com mais de um compilador.** O `gcc` escondeu esse bug do coletor; o
  `clang` o mostrou. O `clang -O1` também transforma recursão de cauda em
  laço, então um teste de "recursão infinita" precisa de recursão que não é de
  cauda (`1 + f(n + 1)`).
- **Testes de estouro de pilha e laço infinito** deixam executáveis órfãos se o
  pai morrer por timeout (`pgrep -f /tmp/fluxexe`). Mate-os depois.
- **`--generate` roda a suíte toda** (inclusive Windows e estresse): demora.
- **`wine`**: a primeira execução cria o prefixo (~7 s); o `run.sh` fixa
  `LC_ALL=C` para as mensagens do sistema saírem em inglês, e filtra o ruído do Mesa.
- **ASan e o coletor**: o `use-after-return` do ASan move variáveis para uma
  pilha falsa que o coletor não varre; o `make asan` o desliga. A flag do clang
  para isso não existe no gcc.
- **Interface web**: cores só por tokens em `web/src/index.css` (o hook de design
  barra valores soltos). Mudou a tela? Tire um retrato do DOM e rode `verify_states`,
  `axe_audit` (claro e escuro), `verify_target_size` e `verify_keyboard`.
- **Segurança do Executar**: `POST /api/run` roda programas e comandos de verdade; ele
  exige `Host` de localhost, `Origin` igual e o cabeçalho `X-Flux-Run`. Não relaxe.
- **Hooks do ambiente** recusam `rm -rf` com variável no caminho: use um diretório novo.

### Para retomar

Leia, nesta ordem: este arquivo, `docs/TAREFAS.md` (o que falta), `docs/ERROS.md`
(erros, formatos de saída, coletor, Windows) e o README seção 9 (uso). A memória do
agente (`~/.claude/projects/.../memory/`) guarda as decisões do usuário e os motivos.

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
inválidos, e todo `var` global precisa de valor inicial (E23). Existem atribuições múltiplas (`a, b = 1, 2;`).

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
inteira por zero, tipo errado de campo, estouro de `int`) são fatais: R1–R6.

**Controle de fluxo:** `if (cond) { } else { }` sem `else if` (o `else`
é seguido de bloco); `while (cond) { }`; `for item in lista { }`, sem
parênteses; `break;` e `continue;`. Condições devem ser `bool`. Todo
bloco `{ }` cria escopo; a variável do `for` vive só no laço.

**Escopo:** é proibido declarar um nome já visível (não há shadowing).
Blocos irmãos podem reutilizar nomes. Os nomes da biblioteca (`terminal`,
`toString`, `toInt`, `toFloat`, `toBool`) são globais pré-declarados. Os
globais (`var`, `const`, `func`, `workflow`) valem em todo o arquivo, mas o
inicializador de um global só usa globais declarados acima (D3). Uma
variável sem valor precisa ser atribuída em todos os caminhos antes do
uso (regra do Java); um caminho que termina em `return`, `break` ou
`continue` conta, e código depois deles é permitido (D8).

**Operadores:** 8 níveis de precedência (seção 3 do README). A única
conversão implícita é `int` → `float`. `int / int` é divisão inteira.
`+` concatena só `string + string` (use `toString`). `%` só com `int`. `==`
e `!=` funcionam entre valores do mesmo tipo (`int` e `float` se comparam
promovendo o `int`, D6) ou com `null`; `list` e `object` só se comparam
com `null`. Estouro de `int` (32 bits) é erro de execução R6; `float` segue
o IEEE (`1.0 / 0.0` é infinito) (D7).

**Objetos** (preparando para HTTP): são dinâmicos, como JSON. Chaves são
identificadores ou strings (`{ "Content-Type": "x" }`), com acesso por
`obj.campo` ou `obj["chave"]`. Atribuir a um campo novo cria o campo, e
ler um campo ausente devolve `null`. O tipo de um campo é conferido na
execução (R5), então um valor de campo não serve para inferir o tipo de
um `var` (E8). Um valor de campo é *dinâmico*: serve em operadores,
condições e argumentos, com resultado dinâmico (D1). `list` e `object` são
referências: `var b = a;` e passar `a` a uma função não copiam (D2); o
resto é por valor. As formas tipadas (`object{...}`) ficam para depois.

**Listas:** `l.length()`, `l.push(v)` e `l.remove(i)`; `push` e `remove`
não devolvem valor. Num literal, `int` e `float` se unem (`[1, 2.5]` é
`list<float>`). Uma expressão sozinha só vale como comando se for uma
chamada (E24).

**Biblioteca:** `terminal.log/info/warn/error/input` (`input` devolve
`string`) e as conversões `toString/toInt/toFloat/toBool`. `terminal.log`
e os irmãos aceitam qualquer tipo (D4); `toString(qualquer)`,
`toInt(string|float)`, `toFloat(string|int)`, `toBool(string)` só com
`"true"`/`"false"` (D5). Nenhum desses
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
simples (regras `error`: sincroniza em `;` ou lendo um bloco `{ }` inteiro).
O refinamento da seção 6 do ERROS.md foi medido e descartado.

**Geração de código:** `./flux --c` imprime um programa C, `--build [-o x]`
gera o executável e `--run` roda (via `gcc`). Todo valor é um `FxValue` com
etiqueta; a biblioteca `src/backend/runtime/flux_rt.h` (embutida no `.c`) faz os operadores
e dá os erros de execução R1 a R7 (R7 é o estouro de pilha). Cada subexpressão
vai para um temporário, para a ordem de avaliação ser da esquerda para a
direita. `terminal.log` e `info` vão para a saída padrão, `warn` e `error` para
a de erro, sem prefixo; `toString` de float usa a forma mais curta com `.0`
(`3.0`); `terminal.input` devolve `""` no fim da entrada; `run` devolve a saída
padrão sem cortar o `\n` final. O programa gerado roda também no Windows (`--build --windows`, `mingw64-gcc`; `--run --windows` usa o
`wine`): a biblioteca tem `#ifdef _WIN32` para o `run` (CreateProcess), as cores, a pilha (o programa roda
numa thread de 64 MB) e a entrada. O `flux` em si só roda em Linux/macOS.
A memória dos programas é gerenciada por um coletor de lixo na biblioteca
(`FLUX_GC=0` desliga, `FLUX_GC_STRESS=1` coleta a cada alocação, `FLUX_GC_STATS=1` mostra as
contagens); o compilador usa um arena (`src/util/mem.c`) liberado no fim.
Num terminal a saída é colorida por tipo (log azul, info ciano, warn amarelo,
error e erro de execução vermelhos), cada fluxo decidido pelo seu `isatty`;
`NO_COLOR` desliga e `FORCE_COLOR` liga. Com `FLUX_TAGGED=1` no ambiente a biblioteca
marca cada impressão com o tipo (registros `\x1e<tipo><bytes>:<texto>`), que a
interface lê para colorir a saída. A interface passa o texto do campo "Entrada" como
entrada padrão (uma linha por `terminal.input`); o `run.sh` usa `X.in`, se existir, como entrada do teste.

**Fora da v1:** HTTP, formas tipadas de `object` e outros recursos
avançados.
