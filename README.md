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
  porque não indicam um tipo.

```flux
var nome, telefone:string = "Andrew", "99999";
var idade:int;
const version:string = "1.0";
var total = 10;                          // tipo inferido: int
var saida, err = run { command: "ls" };  // string e string (erro ou null)
abort if err;

nome, telefone = "Carlos", "88888";
```

Listas são homogêneas, com índice a partir de 0, e têm três métodos:
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
  pode ser usado onde qualquer tipo é esperado, e o tipo real é conferido
  na execução. Por isso, `var x = user.age;` não serve: declare o tipo
  (`var x:int = user.age;`).
- Atribuir a um campo que não existe cria o campo; ler um campo que não
  existe devolve `null`.
- Esse modelo prepara o terreno para HTTP, em que respostas e cabeçalhos
  são objetos. Formas tipadas (`object{name:string}`) podem vir depois,
  sem quebrar o código existente.

Em listas e objetos, a vírgula após o último elemento é opcional.

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
| `==` `!=` | dois valores do mesmo tipo, ou qualquer valor e `null`; `list` e `object` só com `null` | `bool` |
| `&&` `\|\|` `!` | `bool` | `bool` |

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
- `terminal.input(...)` sempre retorna `string`.
- Conversões explícitas: `toString`, `toInt`, `toFloat` e `toBool`. Uma conversão
  impossível (`toInt("abc")`) encerra o programa com erro.

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

# TODO: Revisar a partir daqui.
## 8. Regras semânticas

Verificadas após o parse (etapa semântica). O catálogo completo, com as
mensagens, está em [`ERROS.md`](docs/ERROS.md#4-erros-semânticos).

- **Escopo:** global, `func`/`workflow` e cada bloco `{ ... }` (`if`,
  `else`, `while`, `for`). Uma variável existe da declaração até o fim do
  bloco onde foi declarada; a variável do `for` existe só dentro do laço.
  Não há shadowing: é proibido declarar um nome já visível, seja no mesmo
  escopo ou num escopo externo. Blocos irmãos podem reutilizar o mesmo nome.
  Os nomes da biblioteca (`terminal`, `toString`, `toInt`, `toFloat`,
  `toBool`) já existem no escopo global, então também não podem ser
  redeclarados.
- **Chamadas:** o número e os tipos dos argumentos devem bater com os
  parâmetros. Só se chamam funções, workflows (com `call`), métodos de
  lista e as funções de `terminal`.
- **Inicialização:** `var x:int;` deixa `x` não inicializada (sem valor
  padrão); usar antes de atribuir é erro. Ela só conta como inicializada
  num ponto se for atribuída em todos os caminhos até ele: um `if` com
  `else` em que os dois lados atribuem garante; um `if` sem `else` ou um
  laço, não.
- **Inferência:** em `var` ou `const` sem `:tipo`, cada variável recebe o tipo do
  valor correspondente. `null` e `[]` sozinhos não permitem inferir. Ao
  receber o resultado de um workflow sem `:tipo`, a variável só aceita `null`.
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
  lista, uso de `null`, divisão inteira por zero) encerra o programa como
  o `abort`. Ver [`ERROS.md`](docs/ERROS.md#7-erros-em-tempo-de-execução).
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
  retornam garante; laço não). Sem `:tipo`, só
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

## 9. Implementação (planejada)

O compilador está sendo reescrito para a gramática atual. O plano:

- Linguagem C, lexer em **Flex** e parser em **GNU Bison**. A forma dos
  nós da AST ainda está em aberto.
- O lexer rastreia linha e coluna de cada token (colunas contam
  caracteres, não bytes).
- Mapeamento de tipos: `int` → `int`, `float` → `double`,
  `bool` → `int` (`1`/`0`), `string` → `char *`.
- Mensagens de erro em português, citando o token encontrado e o
  esperado. Formato, catálogo e modo pânico estão em [`ERROS.md`](docs/ERROS.md).

```text
Erro léxico [linha 24, coluna 24]:
Caractere não reconhecido: '@'

Erro sintático [linha 7, coluna 20]:
Token encontrado: ';'
Esperado: '='
```

### Compilar e usar

Vai exigir `gcc` (ou `clang`), `flex`, `bison` 3.6+ e `make`.

```sh
make                            # gera ./fluxc
./fluxc < programa.flux         # lê da entrada padrão (Trabalho 1)
./fluxc programa.flux           # lê de um arquivo (Trabalho 2)
./fluxc -t programa.flux        # --tokens: lista os tokens reconhecidos
./fluxc -h                      # --help: mostra as opções
make test                       # roda os casos de tests/
```

A saída deve terminar com `Programa aceito.` (código de saída 0) ou
`Programa rejeitado.` (código 1); opção desconhecida ou arquivo que não
pode ser lido dão código 2. No Trabalho 1, o compilador para no primeiro
erro. O modo `--tokens` roda só o lexer e continua após erros léxicos.

| Arquivo | Conteúdo |
|---|---|
| `src/lexer.l` | Analisador léxico (Flex) |
| `src/parser.y` | Analisador sintático (Bison): a BNF regra por regra, mais as mensagens de erro |
| `src/main.c` | Leitura da entrada, modo `--tokens` e resultado |
| `src/fluxc.h` | Declarações compartilhadas entre lexer, parser e `main.c` |
| `tests/` | Casos de teste com a saída esperada; `tests/run.sh` compara |

`src/parser.y` deve seguir a `BNF.txt` regra por regra e ser aceito pelo
Bison sem conflitos.

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

- o lado esquerdo de uma atribuição deve ser atribuível (variável,
  `.campo` ou `[índice]`, sem chamadas): o parser verifica na ação da
  regra e reporta erro sintático;
- os campos de `run` (`command` obrigatório, tipos dos campos, sem
  repetição ou campo desconhecido): análise semântica.

## Escopo da v1

A primeira versão prioriza o núcleo necessário para lexer, parser e
árvore sintática. Requisições HTTP, formas tipadas de `object` e outros recursos avançados
ficam para versões posteriores.

## Em aberto

Nenhum item no momento.
