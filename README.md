# FluxLang

**FluxLang** é uma linguagem tipada voltada à **automação de tarefas e
criação de workflows**. O programa é organizado em workflows
reutilizáveis, coordenados por uma função `main`, com suporte a execução
declarativa de comandos, controle de fluxo, listas, objetos e tratamento
explícito de erros.

A FluxLang não pretende substituir linguagens de propósito geral como
Python ou JavaScript: é uma linguagem pequena e especializada, projetada
junto com o seu compilador.


| | |
|---|---|
| **Propósito** | Automatizar tarefas e organizar fluxos de execução |
| **Estrutura** | `main` + funções comuns + workflows |
| **Foco da v1** | Execução de comandos; HTTP e recursos avançados ficam para versões futuras |



## 1. Estrutura do programa

- O arquivo pode conter `var`, `const`, `func` e `workflow` em qualquer ordem.
- Deve existir exatamente uma `func main ()`, sem parâmetros e sem retorno, como ponto de entrada.
- Workflows são unidades de automação e são chamados explicitamente com `call`.
  `call` e `run` só podem ser usados em workflows e na `main`: funções comuns ficam para cálculo e lógica.
- Funções comuns retornam um único valor, com o tipo declarado após os parâmetros (`func f(a:int):int`). Sem `:tipo`, a função não retorna valor, como `main`.
- Workflows retornam o par `(resultado, erro)`. O tipo do resultado também vem após os parâmetros (`workflow w(p:string):string`); sem ele, o resultado é sempre `null`.

```flux
const version:string = "1.0";

func soma(a:int, b:int):int {
    return a + b;
}

workflow build(project:string):string {
    // automação
}

func main () {
    var result, err = call build("backend");
    abort if err;
}
```
## 2. Tipos, variáveis e estruturas de dados

- Tipos: `string`, `int`, `float`, `bool`, `object` e `list<tipo>`.
- `null` representa ausência de valor.
- `var` declara valores mutáveis; `const` exige valor inicial e impede reatribuição.
- Declarações múltiplas são permitidas, com ou sem valor inicial; o `:tipo`
  vale para todos os nomes (`var a, b:int;`). Atribuições múltiplas também:
  `a, b = 1, 2;`.
- Em `var` e `const`, o `:tipo` pode ser omitido quando há valor inicial: cada
  variável recebe o tipo do valor correspondente. `var x;` (sem tipo e
  sem valor) é inválido. `null` ou `[]` sozinhos também não servem,
  porque não indicam um tipo. Um `var` **global** sempre precisa de valor
  inicial (`var g:int;` só vale dentro de funções e blocos).

```flux
var nome, telefone:string = "Andrew", "99999";
var idade:int;
const version:string = "1.0";
var total = 10;                          // tipo inferido: int
var saida, err = run { command: "ls" };  // string e string (erro ou null)
abort if err;

nome, telefone = "Carlos", "88888";
```

Listas são homogêneas, com índice a partir de 0 (num literal, `int` e `float`
se unem: `[1, 2.5]` é `list<float>`), e têm três métodos:
`length()` devolve o tamanho (`int`), `push(valor)` adiciona no fim e
`remove(índice)` remove a posição indicada. `push` e `remove` não
devolvem valor, então só podem ser usados como comando.

```flux
var nomes:list<string> = ["Ana", "Bruno"];
nomes[0] = "Andrew";
nomes.push("Carlos");
nomes.remove(1);
var total:int = nomes.length();   // 2

for nome in nomes {
    terminal.log(nome);
}
```

Objetos (`object`) agrupam dados por campos, como um JSON. As chaves são
identificadores ou strings, e o acesso é por ponto (`user.name`) ou por
colchetes com uma string (`headers["Content-Type"]`):

```flux
var user:object = {
    name: "Andrew",
    age: 17,
    active: true,
};

user.name = "Carlos";
user.city = "Curitiba";                // cria o campo
var idade:int = user.age;              // tipo conferido na execução

if (user.phone == null) {              // campo ausente vale null
    terminal.warn("Sem telefone");
}

var headers:object = { "Content-Type": "application/json" };
headers["Authorization"] = "Bearer abc";
```

- Os campos são dinâmicos: guardam valores de qualquer tipo, e o
  compilador não conhece o tipo de `user.age`. Um valor lido de um campo
  é *dinâmico*: pode ser usado onde qualquer tipo é esperado (operadores,
  condições, argumentos), o resultado de uma operação com ele também é
  dinâmico, e o tipo real é conferido na execução. Por isso, `var x = user.age;` não serve: declare o tipo
  (`var x:int = user.age;`).
- Atribuir a um campo que não existe cria o campo; ler um campo que não
  existe devolve `null`.
- Esse modelo prepara o terreno para HTTP, em que respostas e cabeçalhos
  são objetos. Formas tipadas (`object{name:string}`) podem vir depois,
  sem quebrar o código existente.

Em listas e objetos, a vírgula após o último elemento é opcional.

`list` e `object` são **referências**: `var b = a;` e passar `a` a uma
função não copiam nada, então mudar um muda o outro (`b.push(1)` também
altera `a`). `int`, `float`, `bool` e `string` são por valor.

## 3. Controle de fluxo e expressões

- Condicional: `if (...) { ... } else { ... }`. O `else` é opcional e é
  sempre seguido de um bloco — **não existe `else if`**; para mais de um
  caso, aninhe um `if` dentro do bloco do `else`.
- Repetição: `while (...) { ... }` e `for item in lista { ... }`.
- Laços suportam `break;` e `continue;`.
- Operadores, da menor para a maior precedência:

| Precedência | Operadores |
|---|---|
| 1 | `\|\|` |
| 2 | `&&` |
| 3 | `==` `!=` |
| 4 | `<` `>` `<=` `>=` |
| 5 | `+` `-` (o `+` também concatena strings) |
| 6 | `*` `/` `%` |
| 7 | `!` `-` (unários) |
| 8 | `.campo` `[índice ou chave]` `(argumentos)` |

Tipos aceitos pelos operadores:

| Operadores | Operandos | Resultado |
|---|---|---|
| `+` `-` `*` `/` | `int` ou `float` | `float` se um dos lados for `float`; senão `int` (`7 / 2` é `3`: divisão inteira, como em C) |
| `+` | `string` e `string` | `string` |
| `%` | `int` | `int` |
| `-` (unário) | `int` ou `float` | o mesmo tipo |
| `<` `>` `<=` `>=` | `int` ou `float` | `bool` |
| `==` `!=` | dois valores do mesmo tipo (`int` e `float` também, promovendo o `int`: `1 == 1.0` é `true`), ou qualquer valor e `null`; `list` e `object` só com `null` | `bool` |
| `&&` `\|\|` `!` | `bool` | `bool` |

O `int` tem 32 bits (o `int` do C) e um resultado que estoura o intervalo
encerra o programa com erro de execução (`2147483647 + 1`). O `float` segue
o padrão IEEE: `1.0 / 0.0` é infinito e `0.0 / 0.0` é NaN, sem erro.
Divisão e resto inteiros por zero encerram o programa.

A única conversão implícita é de `int` para `float`, em operadores e em
atribuições: `1 + 2.5` é `float` e `var f:float = 3;` é aceito, mas
`var i:int = 2.5;` é erro (use `toInt`). Não há conversão implícita para
`string`: escreva `"Idade: " + toString(idade)`.

```flux
if (idade >= 18) {
    terminal.info("Maior de idade");
} else {
    terminal.warn("Menor de idade");
}

while (ativo) {
    break;
}
```

## 4. Terminal e conversões

- `terminal` concentra entrada e saída: `log`, `info`, `warn`, `error` e `input`.
- `terminal.log`, `info`, `warn` e `error` aceitam um valor de qualquer
  tipo e o imprimem como o `toString` faria.
- `terminal.input(...)` sempre retorna `string`.
- Conversões explícitas, com estas entradas: `toString(qualquer tipo)`,
  `toInt(string ou float)` (o `float` é truncado), `toFloat(string ou int)`
  e `toBool(string)`, que só aceita `"true"` e `"false"`. Entrada de outro
  tipo (`toInt(true)`) é erro de tipo na compilação; entrada do tipo certo
  mas impossível (`toInt("abc")`, `toBool("sim")`) encerra o programa com
  erro de execução.

```flux
terminal.info("Iniciando processo");
var nome:string = terminal.input("Nome: ");
var idade:int = toInt(terminal.input("Idade: "));
terminal.log("Olá " + nome);
```

## 5. Workflows e tratamento de erros

- Workflows podem receber parâmetros e chamar outros workflows com `call`.
- O retorno de um workflow é `(resultado, erro)`, com `return resultado, erro;`.
  O resultado tem o tipo declarado após os parâmetros ou é `null`.
- Se um workflow termina naturalmente, o retorno implícito é `(null, null)`.
- `call` e `run` não são expressões: aparecem só logo depois do `=` de um
  `var` ou de uma atribuição, sozinhos e com duas variáveis à esquerda
  (`var r, e = call build(x);`, `r, e = run { ... };`). `call build(x);`
  isolado ou `terminal.log(call f())` são erros sintáticos.
- O erro é sempre uma `string`, ou `null`, que significa "sem erro".
- Todo erro vindo de `run` ou `call` deve ser tratado com um dos comandos
  abaixo. Se `erro` for `null`, nenhum deles faz nada.
  - `stop if erro;` encerra o workflow atual devolvendo `(null, erro)`.
    Só pode ser usado dentro de workflow.
  - `abort if erro;` escreve a mensagem na saída de erro e encerra o
    programa com código de saída 1.
  - `proceed if erro;` marca o erro como tratado e segue para a próxima
    instrução.
- `erro` precisa ser uma variável de erro: a segunda variável que recebeu
  um `call` ou `run`. Para criar um erro próprio, o workflow usa
  `return null, "mensagem";`.

```flux
workflow build(project:string):string {
    var output, err = run {
        command: "npm",
        flags: ["run", "build"],
        workingDir: project,
    };

    if (err != null) {
        terminal.error(err);
        stop if err;
    }

    return output, null;
}
```

## 6. Automação com `run`

- `run` usa a mesma sintaxe de um objeto: `run { campo: valor, ... }`.
- `command` (string) é obrigatório; `flags` (`list<string>`) e `workingDir` (string) são opcionais.
- Os campos podem aparecer em qualquer ordem, sem repetição; a vírgula final é opcional.
- `run` devolve `(resultado, erro)`. Se o comando termina com código de saída 0, o par é
  `(saída padrão, null)`. Se ele não pode ser iniciado ou termina com outro código, o par é
  `(null, saída de erro)`; com a saída de erro vazia, o erro é `comando 'npm' terminou com código 1`.
- Como o `call`, o `run` só aparece logo depois do `=` de um `var` ou de uma atribuição (seção 5).
- Como qualquer comando simples, a instrução que contém o `run` termina com `;`.

```flux
var result, err = run {
    command: "npm",
    flags: ["test", "--watch"],
    workingDir: "./backend",
};
```

## 7. Regras léxicas

- A linguagem é case-sensitive.
- Identificadores começam com letra ou `_` e continuam com letras, números ou `_`.
- Strings usam apenas aspas duplas, ficam numa única linha e suportam os escapes `\n`, `\t`, `\"` e `\\`. Qualquer outro escape é erro léxico.
- Números usam formato decimal simples; floats exigem dígitos dos dois lados do ponto.
  Um número, inteiro ou real, seguido de letra (`2itens`, `1e10`, `0xFF`, `3.14abc`) ou `5.` é erro léxico.
- Literais inteiros vão até 2147483647 (o `int` do C); acima disso, é erro léxico.
- O sinal `-` é um token separado e também funciona como operador unário.
- Comentários: `// linha` e `/* bloco */` (sem aninhamento).
- Pelo maior casamento, `list<int>=` é lido como `list<int` seguido de `>=`:
  escreva `list<int> = ...`, com espaço. Já `list<list<int>>` funciona, porque `>>` não é operador.
- Espaços em branco são ignorados fora de strings e comentários.
- Instruções simples terminam com `;`. Blocos (`if`, `while`, `for`, `func`, `workflow`) não levam `;`.

Palavras reservadas: `var`, `const`, `func`, `workflow`, `call`, `return`,
`if`, `else`, `while`, `for`, `in`, `break`, `continue`, `stop`, `abort`,
`proceed`, `run`, `true`, `false`, `null`, `int`, `float`, `string`,
`bool`, `object`, `list`, `main`.

## 8. Regras semânticas

Verificadas após o parse (etapa semântica). O catálogo completo, com as
mensagens, está em [`ERROS.md`](docs/ERROS.md#4-erros-semânticos).

- **Escopo:** global, `func`/`workflow` e cada bloco `{ ... }` (`if`,
  `else`, `while`, `for`). Uma variável existe da declaração até o fim do
  bloco onde foi declarada; a variável do `for` existe só dentro do laço.
  Não há shadowing: é proibido declarar um nome já visível, seja no mesmo
  escopo ou num escopo externo. Blocos irmãos podem reutilizar o mesmo nome.
  Os nomes globais (`var`, `const`, `func`, `workflow`) são visíveis em todo
  o arquivo, também dentro de funções declaradas antes deles; por isso uma
  variável local não pode reutilizar o nome de um global declarado depois.
  Só o inicializador de um global segue a ordem do arquivo: ele usa apenas
  globais declarados acima, e uma função que ele chame (direta ou
  indiretamente) também não pode ler um global declarado depois (E25).
  Os nomes da biblioteca (`terminal`, `toString`, `toInt`, `toFloat`,
  `toBool`) já existem no escopo global, então também não podem ser
  redeclarados.
- **Chamadas:** o número e os tipos dos argumentos devem bater com os
  parâmetros. Só se chamam funções, workflows (com `call`), métodos de
  lista, as funções de `terminal` e as conversões (`toString`, `toInt`,
  `toFloat`, `toBool`).
- **Inicialização:** `var x:int;` deixa `x` não inicializada (sem valor
  padrão); usar antes de atribuir é erro. Ela só conta como inicializada
  num ponto se for atribuída em todos os caminhos até ele: um `if` com
  `else` em que os dois lados atribuem garante; um `if` sem `else` ou um
  laço, não. Um caminho que termina em `return`, `break` ou `continue` não
  precisa atribuir: `if (c) { x = 1; } else { return; }` deixa `x`
  inicializada depois. Código escrito depois de `return`, `break` ou
  `continue` é permitido (não há erro de código inalcançável).
- **Inferência:** em `var` ou `const` sem `:tipo`, cada variável recebe o tipo do
  valor correspondente. `null` e `[]` sozinhos não permitem inferir. Ao
  receber o resultado de um workflow sem `:tipo`, a variável só aceita `null`.
- **Comandos:** uma expressão sozinha só vale como comando se for uma
  chamada (`terminal.log(x);`, `f();`); `x + 1;` e `idade;` não fazem nada e
  são erro.
- **Quantidade de valores:** em declarações e atribuições múltiplas, o
  número de variáveis deve ser igual ao de valores. `call` e `run`
  produzem dois valores (resultado, erro) e exigem exatamente duas
  variáveis; a gramática já garante que eles estão sozinhos à direita.
- **`const` raso:** a variável não pode ser reatribuída, mas o conteúdo
  pode mudar: campos de um `object` e elementos de uma `list` constantes
  (`push`, `remove`, `l[0] = ...`).
- **`null`** pode ser atribuído a variável de qualquer tipo; usos
  inválidos de `null` são detectados em tempo de execução na v1.
- **Erros de execução:** fora `run` e `call`, que devolvem erro tratável,
  todo erro em tempo de execução (conversão impossível, índice fora da
  lista, uso de `null`, divisão inteira por zero, campo com tipo errado,
  estouro de `int`)
  encerra o programa como o `abort`. Ver [`ERROS.md`](docs/ERROS.md#7-erros-em-tempo-de-execução).
- **Operadores:** os operandos seguem a tabela da seção 3; a única
  conversão implícita é `int` → `float`.
- **Condições** de `if` e `while` devem ser `bool` (sem truthy/falsy).
- **`for item in lista`:** a expressão deve ser uma lista, e o tipo de
  `item` é inferido dela.
- **Objetos:** campos são dinâmicos (seção 2): o tipo de `obj.campo` é
  conferido na execução, atribuir a um campo novo cria o campo e ler um
  campo ausente devolve `null`. Um valor de campo não permite inferir o
  tipo de um `var`/`const`.
- **Colchetes:** em `lista[i]`, `i` deve ser `int`; em `obj[chave]`,
  `chave` deve ser `string`.
- **Funções:** com `:tipo`, retornam com `return valor;`, que precisa
  existir em todos os caminhos (`if` com `else` em que os dois lados
  retornam garante; laço não; um caminho que termina em `break` ou
  `continue` sai do laço e não conta como retorno). Sem `:tipo`, só
  `return;` é permitido e a chamada não pode ser usada como valor. Podem
  ser recursivas, mas não podem usar `call` nem `run`.
- **Workflows:** retornam com `return resultado, erro;`. São chamados só
  com `call`, e `call` só vale para workflows. Podem ser recursivos,
  direta ou indiretamente.
- **Laços e erros:** `break` e `continue` só valem dentro de laços, e
  `stop if` só dentro de workflow. Erros retornados por workflows e por
  `run` devem ser tratados com `stop if`, `abort if` ou `proceed if`,
  inclusive em `main`, e o operando desses comandos deve ser uma variável
  de erro. O erro conta como tratado se a variável aparece num desses
  comandos antes do fim do bloco onde foi declarada, mesmo dentro de um
  bloco interno (`if (err != null) { stop if err; }`).
- **`run`:** `command` (`string`) é obrigatório; `flags` (`list<string>`) e
  `workingDir` (`string`) são opcionais; nenhum campo pode ser repetido ou
  desconhecido.

## 9. Implementação

**Plataformas.** O compilador `flux` roda em Linux (e deve rodar em macOS; não
foi testado lá). Os programas que ele gera rodam em Linux, macOS e **Windows**:
a biblioteca de execução tem uma versão para cada sistema (no Windows o `run`
usa `CreateProcess`, o console liga as cores ANSI e o programa roda numa thread
de pilha grande). Para Windows há duas formas: compilar aqui com
`./flux --build --windows` (gera um `.exe` que leva tudo junto) ou levar o `.c`
de `./flux --c` e compilá-lo no Windows com o MinGW ou o clang. No Windows, o
próprio `flux` e a interface web continuam precisando do WSL. Os programas
gerados foram testados com `gcc` e `clang` no Linux e como `.exe` no `wine`.

O compilador é escrito em C, com lexer em **Flex** e parser em **GNU
Bison**. O lexer e o parser do Trabalho 1 estão prontos: o compilador
reporta todos os erros do programa (modo pânico com as regras `error` do
Bison, versão simples). A árvore de derivação (`--tree`) sai com um nó por não-terminal da BNF. A análise semântica (`--semantic`) roda sobre uma AST enxuta.

- O lexer rastreia linha e coluna de cada token (colunas contam
  caracteres, não bytes; uma tabulação conta como uma coluna).
- A geração de código converte a AST em um programa C e chama o `gcc`
  (`./flux --c`, `--build` e `--run`). Todo valor em tempo de execução é um
  `FxValue` com etiqueta (null, int, float, bool, string, list, object), e
  uma biblioteca de execução (`src/backend/runtime/flux_rt.h`) faz as operações e dá os
  erros R1 a R7; ela é embutida no `.c` gerado, que compila sozinho. A memória
  dos programas é gerenciada por um coletor de lixo (marca e varre, que varre a
  pilha do C de forma conservadora): um laço que concatena textos não cresce
  sem limite. O próprio compilador usa um arena liberado no fim.
- Mensagens de erro em português, citando o token encontrado e o
  esperado, na saída de erro. Formato, catálogo e modo pânico estão em
  [`ERROS.md`](docs/ERROS.md).

```text
Erro léxico [linha 24, coluna 24]:
Caractere não reconhecido: '@'

Erro sintático [linha 7, coluna 20]:
Token encontrado: ';'
Esperado: '='
```

### Compilar e usar

Exige `gcc` (ou `clang`), `flex`, `bison` 3.6+ e GNU `make` 4.3+ (o
`Makefile` usa alvos agrupados, `&:`).

```sh
make                            # gera ./flux
./flux < programa.flux         # lê da entrada padrão (Trabalho 1)
./flux programa.flux           # lê de um arquivo (Trabalho 2)
./flux -t programa.flux        # --tokens: lista os tokens reconhecidos
./flux --tree programa.flux    # imprime a árvore de derivação
./flux --json programa.flux    # tokens, erros e árvore em JSON (para a interface)
./flux --ast programa.flux     # a AST (a árvore de derivação sem a burocracia da gramática)
./flux --semantic programa.flux # confere também os erros semânticos (E1 a E25)
./flux --c programa.flux        # imprime o programa em C (a biblioteca de execução vai junto)
./flux --build programa.flux    # gera o executável ./programa (via gcc); -o escolhe o nome
./flux --run programa.flux      # gera, executa e apaga o executável (a saída é colorida num terminal; NO_COLOR desliga)
./flux --build --windows programa.flux   # gera programa.exe para Windows (precisa do mingw64-gcc)
./flux --run --windows programa.flux     # idem, e roda o .exe no wine
./flux -h                      # --help: mostra as opções
make test                       # roda os casos de tests/
make bear                       # gera compile_commands.json (para o clangd)
```

A saída deve terminar com `Programa aceito.` (código de saída 0) ou
`Programa rejeitado.` (código 1); com `--c`, `--build` e `--run` o programa
precisa passar pela análise semântica, e `--run` termina com o código de saída
do próprio programa FluxLang; com `--json` a saída é só o JSON (mesmo
código de saída), e os erros não vão para o stderr. Opção desconhecida ou arquivo que não
pode ser lido dão código 2. O compilador segue depois dos erros
(modo pânico) e reporta todos. O modo `--tokens` roda só o lexer, continua após erros léxicos e
sai com código 1 se encontrou algum.

| Arquivo | Conteúdo |
|---|---|
| `src/main.c` | Leitura da entrada, modos `--tokens`, `--tree` e `--json` e resultado |
| `src/json.c` | Saída `--json`: tokens, erros e árvore num objeto JSON |
| `src/fluxc.h` | Declarações compartilhadas entre lexer, parser e `main.c` |
| `src/frontend/lexer.l` | Analisador léxico (Flex) |
| `src/frontend/parser.y` | Analisador sintático (Bison): a BNF regra por regra, mais as mensagens de erro |
| `src/frontend/tree.c`, `src/frontend/tree.h` | Árvore de derivação: um nó por não-terminal da BNF (inclusive os `*_rest` da fatoração LL(1)), folhas de token, de ε e de `error` |
| `src/semantic/types.c`, `ast.c`, `ast_build.c` | Tipos da linguagem, a AST e a conversão da árvore de derivação em AST |
| `src/semantic/sema.c` | Análise semântica (E1 a E25): tabela de símbolos, tipos e análise de fluxo |
| `src/backend/codegen_c.c`, `src/backend/runtime/flux_rt.h` | Gerador de código C e a biblioteca de execução que ele embute (os valores, os operadores, `run`, `terminal` e os erros R1 a R7) |
| `src/util/mem.c`, `src/util/mem.h` | Arena de memória do compilador (tudo é liberado no fim) |
| `web/` | Interface web: `src/` (React), `server/flux-api.ts` (plugin do Vite que roda `./flux --json`) |
| `tools/vscode-fluxlang/` | Extensão do VS Code com o realce de sintaxe da FluxLang |
| `docs/` | `BNF.txt`, `ERROS.md`, `TAREFAS.md`, `ENUNCIADO.md`, `exemplos/`, `specs/` (desenho da interface) e `entregas/` (artigo e slides) |
| `tests/` | Casos de teste: cada `X.flux` tem a saída esperada em `X.out`. `tests/run.sh` compara (`tests/lexico/` roda com `-t`, `tests/arvore/` com `--tree`, `tests/json/` com `--json`, `tests/ast/` com `--ast`, `tests/semantico/` com `--semantic`, `tests/exec/` com `--run`: compila para C e confere a saída do programa); `--generate` cria os `.out` que faltam, que devem ser conferidos à mão |

`src/frontend/parser.y` deve seguir a `BNF.txt` regra por regra e ser aceito pelo
Bison sem conflitos.

### Interface web

A pasta `web/` tem a interface gráfica (Vite + React + Tailwind). Ela não
reimplementa nada: o servidor do Vite expõe `POST /api/compile`, que roda
`./flux --json` com o código recebido.

```sh
make web        # compila o flux, instala as dependências e abre http://127.0.0.1:5173
```

Precisa de Node 20+ e npm. A tela mostra, ao mesmo tempo, o código com
numeração de linhas (as linhas com erro ficam realçadas), os tokens
reconhecidos, a árvore sintática, o resultado (`Programa aceito` ou
`Programa rejeitado`, com a contagem de linhas) e as mensagens de erro.
Clicar num erro, token ou nó da árvore seleciona o trecho no código. A
árvore é a de derivação, fiel à gramática LL(1); a opção "ocultar `*_rest`"
remove os nós criados na fatoração e sobe os filhos deles para o pai. O
código recompila sozinho 400 ms depois de parar de digitar, a chave "Análise semântica" liga os erros E1 a E25, o botão **Executar** compila o programa para C e o roda (se o programa usa `terminal.input`, aparece o campo "Entrada do programa": uma linha para cada `terminal.input`, na ordem, e a resposta aparece ao lado do prompt;a saída aparece no painel "Saída", em ordem e colorida pelo tipo: `log` em azul, `info` em ciano, `warn` em amarelo, `error` e os erros de execução em vermelho, cada linha com o nome do tipo ao lado; o painel mostra também o código de saída; um programa que passa de 10 segundos é interrompido e a saída é cortada em 1 MB), e há botões
para abrir um arquivo e carregar `docs/exemplos/valido.flux` e
`invalido.flux`.

**Documentação.** A aba **Documentação** da interface (endereço `#/doc`; cada
página fica em `#/doc/<seção>/<página>`, como `#/doc/linguagem/tipos`) traz o
manual da linguagem, que explica cada regra em detalhe com exemplos e as
mensagens reais do compilador, e a documentação do compilador (cada etapa
e uma referência arquivo por arquivo), com uma busca. Este README continua sendo a especificação da
linguagem; o manual a explica por inteiro e os dois devem dizer a mesma coisa.

**Segurança do Executar.** Executar roda o programa de verdade neste computador,
inclusive os comandos que ele pedir em `run`. O servidor só escuta em
`127.0.0.1`, e a rota `POST /api/run` ainda confere o `Host`, o `Origin` e um
cabeçalho próprio (`X-Flux-Run`), para que uma página qualquer aberta no
navegador não consiga mandar um programa para ela. Use a interface só em
computador seu e não a exponha na rede.

**Formato do `--json`** (a interface lê este objeto):

```json
{
"accepted": false,
"lines": 5,
"tokens": [ {"line":2,"column":3,"type":"VAR","text":"var"}, ... ],
"errors": [ {"kind":"sintático","line":3,"column":11,"message":"Token encontrado: ';'\nEsperado: ..."}, ... ],
"tree": {"kind":"rule","label":"program","line":1,"column":1,"children":[ ... ]}
}
```

`kind` do erro é `léxico`, `sintático` ou, com `--semantic` (que a interface
liga por padrão), `semântico`. Cada nó da árvore tem `kind`
(`rule` para não-terminal, `token`, `empty` para ε, `error` para o trecho
descartado pelo modo pânico), `label` e, quando há token, `text`, `line` e
`column`; `children` só existe se o nó tem filhos.

## 10. Exemplo integrado

```flux
const projectDir:string = "./backend";

workflow testProject(project:string):string {
    var output, err = run {
        command: "npm",
        flags: ["test"],
        workingDir: project,
    };

    if (err != null) {
        terminal.error(err);
        stop if err;
    }

    terminal.info("Testes executados");
    return output, null;
}

workflow buildProject(project:string):string {
    var output, err = run {
        command: "npm",
        flags: ["run", "build"],
        workingDir: project,
    };

    stop if err;
    return output, null;
}

func main () {
    var testResult, testErr = call testProject(projectDir);
    abort if testErr;

    var buildResult, buildErr = call buildProject(projectDir);
    abort if buildErr;

    terminal.info("Workflow finalizado com sucesso");
}
```

Programas completos para o artigo:

- [`docs/exemplos/valido.flux`](docs/exemplos/valido.flux): usa os dois laços, o
  condicional, declarações únicas e em lista, com e sem atribuição, os
  tipos `int`, `float`, `string`, `bool`, `list` e `object`, workflows,
  `run`, `call` e os três comandos de tratamento de erro.
- [`docs/exemplos/invalido.flux`](docs/exemplos/invalido.flux): sete erros léxicos
  e sintáticos, definidos em [`ERROS.md`](docs/ERROS.md#5-erros-do-exemplo-inválido).

## Gramática

A gramática completa está em [`BNF.txt`](docs/BNF.txt). Ela é escrita para
ser **LL(1)**: sem recursão à esquerda, fatorada à esquerda e sem conflitos
na tabela de análise preditiva (e deve ser aceita pelo Bison sem
conflitos).

A gramática garante que existe exatamente uma `func main ()`, sem
parâmetros e sem `:tipo`: `main` é palavra reservada, e `<program>`
separa as declarações que vêm antes e depois dela. Ela também garante que
`call` e `run` só aparecem sozinhos logo depois do `=` de um `var` ou de
uma atribuição.

Algumas regras não são expressáveis na gramática:

- o lado esquerdo de uma atribuição deve ser atribuível: uma variável
  escrita diretamente (`x`, e não `(x)`) ou uma expressão que termina em
  `.campo` ou `[índice]` (`obj.a`, `l[0]`, `f().x`). Se termina numa
  chamada (`f()`, `obj.m()`) ou é qualquer outra expressão (`a + b`,
  `10`), não serve. O parser verifica na ação da regra e reporta erro
  sintático (S3); na atribuição múltipla, vale para cada alvo;
- os campos de `run` (`command` obrigatório, tipos dos campos, sem
  repetição ou campo desconhecido): análise semântica.

## Escopo da v1

A primeira versão prioriza o núcleo necessário para lexer, parser e
árvore sintática. Requisições HTTP, formas tipadas de `object` e outros recursos avançados
ficam para versões posteriores.

## Em aberto

- Forma dos nós da AST (Trabalho 2).
