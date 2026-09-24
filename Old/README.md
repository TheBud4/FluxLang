# FluxLang

**FluxLang** é uma linguagem tipada voltada à **automação de tarefas e
criação de workflows**. O programa é organizado em workflows
reutilizáveis, coordenados por uma função `main`, com suporte a execução
declarativa de comandos, controle de fluxo, listas, objetos e tratamento
explícito de erros.

A FluxLang não pretende substituir linguagens de propósito geral como
Python ou JavaScript: é uma linguagem pequena e especializada, projetada
junto com o seu compilador. A gramática é **LL(1)** desde a primeira
versão (ver [`BNF.txt`](BNF.txt)).

| | |
|---|---|
| **Propósito** | Automatizar tarefas e organizar fluxos de execução |
| **Estrutura** | `main` + funções comuns + workflows |
| **Foco da v1** | Execução de comandos; HTTP e recursos avançados ficam para versões futuras |

## 1. Estrutura do programa

- O arquivo pode conter `var`, `const`, `func` e `workflow` em qualquer ordem.
- Deve existir exatamente uma `func main ()`, sem parâmetros e sem retorno, como ponto de entrada.
- Workflows são unidades de automação e são chamados explicitamente com `call`.
- Funções comuns têm no máximo um valor de retorno, com o tipo declarado após os parâmetros (`func f(a:int):int`). Sem `:tipo`, a função não retorna valor, como `main`.
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
- Declarações e atribuições múltiplas são permitidas, com ou sem valor inicial.
- Em `var`, o `:tipo` pode ser omitido quando há valor inicial: cada
  variável recebe o tipo do valor correspondente. É assim que se declaram
  as variáveis que recebem `(resultado, erro)` de `run` e `call`.
  `var x;` (sem tipo e sem valor) é inválido. `null` ou `[]` sozinhos
  também não servem, porque não indicam um tipo.

```flux
var nome, telefone:string = "Andrew", "99999";
var idade:int;
const version:string = "1.0";
var total = 10;                          // tipo inferido: int
var saida, err = run { command: "ls" };  // string e erro
abort if err;

nome, telefone = "Carlos", "88888";
```

Listas são homogêneas e suportam índice, `length`, `push` e `remove`:

```flux
var nomes:list<string> = ["Ana", "Bruno"];
nomes[0] = "Andrew";
nomes.push("Carlos");
nomes.remove(1);

for nome in nomes {
    terminal.log(nome);
}
```

Objetos (`object`) agrupam dados por campos e usam acesso por ponto:

```flux
var user:object = {
    name: "Andrew",
    age: 17,
    active: true,
};

user.name = "Carlos";
```

Em listas e objetos, a vírgula após o último elemento é opcional.

## 3. Controle de fluxo e expressões

- Condicional: `if (...) { ... } else { ... }`. O `else` é opcional e é
  sempre seguido de um bloco — **não existe `else if`**; para mais de um
  caso, aninhe um `if` dentro do bloco do `else`.
- Repetição: `while (...) { ... }` e `for item in lista { ... }`.
- Laços suportam `break;` e `continue;`. O `continue if erro;` é outro
  comando, de tratamento de erro (seção 5), e não pula a iteração.
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
| 8 | `.campo` `[índice]` `(argumentos)` |

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
- Conversões explícitas: `toString`, `toInt`, `toFloat` e `toBool`.

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
- O erro tem um tipo interno, sem nome na linguagem. Por isso, variáveis
  de erro só podem ser declaradas por inferência (`var saida, err = ...`).
  `null` significa "sem erro".
- Todo erro vindo de `run` ou `call` deve ser tratado com um dos comandos:
  - `stop if erro;` encerra o workflow atual devolvendo `(null, erro)`.
    Só pode ser usado dentro de workflow.
  - `abort if erro;` encerra a execução global.
  - `continue if erro;` marca o erro como tratado e segue para a próxima
    instrução. Dentro de um laço, ele **não** pula a iteração; para isso,
    use `if (erro != null) { continue; }`.

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
- `run` devolve `(resultado, erro)`; na v1, o resultado é o texto (`string`) produzido pelo comando.
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
  Um número seguido de letra (`2itens`, `1e10`, `0xFF`) ou `5.` é erro léxico.
- Literais inteiros vão até 2147483647 (o `int` do C); acima disso, é erro léxico.
- O sinal `-` é um token separado e também funciona como operador unário.
- Comentários: `// linha` e `/* bloco */` (sem aninhamento).
- Pelo maior casamento, `list<int>=` é lido como `list<int` seguido de `>=`:
  escreva `list<int> = ...`, com espaço. Já `list<list<int>>` funciona, porque `>>` não é operador.
- Espaços em branco são ignorados fora de strings e comentários.
- Instruções simples terminam com `;`. Blocos (`if`, `while`, `for`, `func`, `workflow`) não levam `;`.

Palavras reservadas: `var`, `const`, `func`, `workflow`, `call`, `return`,
`if`, `else`, `while`, `for`, `in`, `break`, `continue`, `stop`, `abort`,
`run`, `true`, `false`, `null`, `int`, `float`, `string`, `bool`, `object`,
`list`.

## 8. Regras semânticas

Verificadas após o parse (etapa semântica). O catálogo completo, com as
mensagens, está em [`ERROS.md`](ERROS.md#4-erros-semânticos).

- **Escopo:** global, `func` e `workflow`. `if`, `else`, `for` e `while`
  não criam escopo próprio. Redeclaração no mesmo escopo e shadowing de
  global por local são proibidos.
- **Inicialização:** `var x:int;` deixa `x` não inicializada (sem valor
  padrão); usar antes de atribuir é erro.
- **Inferência:** em `var` sem `:tipo`, cada variável recebe o tipo do
  valor correspondente. `null` e `[]` sozinhos não permitem inferir. Ao
  receber o resultado de um workflow sem `:tipo`, a variável só aceita `null`.
- **Quantidade de valores:** em declarações e atribuições múltiplas, o
  número de variáveis deve ser igual ao de valores. `call` e `run`
  produzem dois valores (resultado, erro) e precisam estar sozinhos do
  lado direito.
- **`const` raso:** a variável não pode ser reatribuída, mas os campos de
  um `object` constante podem ser modificados.
- **`null`** pode ser atribuído a variável de qualquer tipo; usos
  inválidos de `null` são detectados em tempo de execução na v1.
- **Condições** de `if` e `while` devem ser `bool` (sem truthy/falsy).
- **`for item in lista`:** a expressão deve ser uma lista, e o tipo de
  `item` é inferido dela.
- **Objetos:** campos existentes podem ser modificados; não é permitido
  adicionar campos após a criação.
- **Funções:** com `:tipo`, retornam com `return valor;`. Sem `:tipo`, só
  `return;` é permitido e a chamada não pode ser usada como valor.
- **Workflows:** retornam com `return resultado, erro;`. São chamados só
  com `call`, e `call` só vale para workflows. Um workflow não pode chamar
  a si mesmo (recursão fica fora da v1).
- **Laços e erros:** `break` e `continue;` só valem dentro de laços, e
  `stop if` só dentro de workflow. Erros retornados por workflows e por
  `run` devem ser tratados com `stop if`, `abort if` ou `continue if`,
  inclusive em `main`.
- **`main`:** exatamente uma `func main ()`, sem parâmetros e sem retorno.
- **`run`:** `command` (`string`) é obrigatório; `flags` (`list<string>`) e
  `workingDir` (`string`) são opcionais; nenhum campo pode ser repetido ou
  desconhecido.

## 9. Implementação

- Linguagem C, lexer em **Flex** e parser em **GNU Bison**. A AST ainda
  não foi implementada: a forma dos nós continua em aberto.
- O lexer rastreia linha e coluna de cada token (colunas contam
  caracteres, não bytes).
- Mapeamento de tipos: `int` → `int`, `float` → `double`,
  `bool` → `int` (`1`/`0`), `string` → `char *`.
- Mensagens de erro em português, citando o token encontrado e o
  esperado. Formato, catálogo e modo pânico estão em [`ERROS.md`](ERROS.md).

```text
Erro léxico [linha 24, coluna 24]:
Caractere não reconhecido: '@'

Erro sintático [linha 7, coluna 20]:
Token encontrado: ';'
Esperado: '='
```

### Compilar e usar

Requer `gcc` (ou `clang`), `flex`, `bison` 3.6+ e `make`.

```sh
make                            # gera ./fluxc
./fluxc < programa.flux         # lê da entrada padrão (Trabalho 1)
./fluxc programa.flux           # lê de um arquivo
./fluxc --tokens programa.flux  # lista os tokens reconhecidos
./fluxc --ajuda                 # mostra as opções
make test                       # roda os casos de tests/
```

A saída termina com `Programa aceito.` (código de saída 0) ou
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

`src/parser.y` tem as mesmas 131 regras de `BNF.txt` e o Bison o
aceita sem conflitos.

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

- [`exemplos/valido.flux`](exemplos/valido.flux): usa os dois laços, o
  condicional, declarações únicas e em lista, com e sem atribuição, e os
  tipos `int`, `float`, `string`, `bool` e `list`.
- [`exemplos/invalido.flux`](exemplos/invalido.flux): sete erros léxicos
  e sintáticos, definidos em [`ERROS.md`](ERROS.md#5-erros-do-exemplo-inválido).

## Gramática

A gramática completa está em [`BNF.txt`](BNF.txt). Ela é **LL(1)**: não
tem recursão à esquerda, está fatorada à esquerda e não possui conflitos
na tabela de análise preditiva (e também é aceita pelo Bison sem
conflitos). Algumas regras não são expressáveis na gramática:

- o lado esquerdo de uma atribuição deve ser atribuível (variável,
  `.campo` ou `[índice]`, sem chamadas): o parser verifica na ação da
  regra e reporta erro sintático;
- existe exatamente uma `func main ()`: análise semântica;
- os campos de `run` (`command` obrigatório, tipos dos campos, sem
  repetição ou campo desconhecido): análise semântica.

### Transformações para LL(1)

A BNF já está escrita na forma LL(1). Para a apresentação do Trabalho 2,
estas são as transformações aplicadas, partindo da forma natural de cada
regra:

```text
1. Recursão à esquerda nos operadores binários (6 níveis: || && == < + *)
   antes:  <expressao> ::= <expressao> OR <expressao-and> | <expressao-and>
   depois: <expressao> ::= <expressao-and> <expressao-or-resto>
           <expressao-or-resto> ::= OR <expressao-and> <expressao-or-resto> | ε
   (a AST reassocia os operadores à esquerda)

2. Recursão à esquerda nos pós-fixos (.campo, [índice], (argumentos))
   antes:  <posfixa> ::= <posfixa> DOT IDENTIFIER | <posfixa> LBRACKET ...
                       | <posfixa> LPAREN ... | <primaria>
   depois: <expressao-posfixa> ::= <primaria> <sufixos>
           <sufixos> ::= <sufixo> <sufixos> | ε

3. Recursão à esquerda nas listas separadas por vírgula
   antes:  <lista-identificadores> ::= <lista-identificadores> COMMA IDENTIFIER
                                     | IDENTIFIER
   depois: <lista-identificadores> ::= IDENTIFIER <lista-identificadores-resto>
   (idem para expressões, parâmetros e argumentos)

4. Fatoração à esquerda de partes opcionais
   antes:  <comando-if> ::= IF ( <expressao> ) <bloco>
                          | IF ( <expressao> ) <bloco> ELSE <bloco>
   depois: <comando-if> ::= IF ( <expressao> ) <bloco> <else-opcional>
   (idem para inicialização, tipo de retorno e argumentos)

5. Fatoração à esquerda de prefixo comum
   antes:  <continue> ::= CONTINUE SEMICOLON | CONTINUE IF IDENTIFIER SEMICOLON
   depois: <comando-continue> ::= CONTINUE <continue-resto>
   (idem para var com tipo / var sem tipo: <declaracao-var-resto>)

6. Vírgula final opcional em listas e objetos
   antes:  <elementos> ::= <expressao> | <expressao> COMMA
                         | <expressao> COMMA <elementos>
   depois: <elementos-lista> ::= <expressao> <elementos-lista-resto> | ε
           <elementos-lista-resto> ::= COMMA <elementos-lista> | ε

7. Atribuição x comando de expressão
   antes:  <atribuicao> ::= <alvos> ASSIGN <lista-expressoes> SEMICOLON
           <comando-expressao> ::= <expressao> SEMICOLON
   Os dois começam com IDENTIFIER e o alvo pode ter qualquer tamanho
   (a.b[i].c), então nenhum lookahead fixo decide.
   depois: <comando-expressao> ::= <expressao> <resto-comando-expressao>
   A expressão é lida primeiro e o token seguinte decide (";" ou ","/"=").
   O alvo é validado na ação da regra (erro S3).
```

## Escopo da v1

A primeira versão prioriza o núcleo necessário para lexer, parser e
árvore sintática. Requisições HTTP, recursão de workflows e outros
recursos avançados ficam para versões posteriores.

## Em aberto

- Semântica: retorno de `push`/`remove`, índice fora dos limites,
  compatibilidade `int`/`float`, conversões implícitas, regras de
  concatenação.
- Tipos dos campos de `object`: o tipo `object` não descreve seus campos,
  então `user.name` não tem tipo conhecido na análise semântica.
- Criação de erros: um workflow só consegue propagar erros vindos de
  `run` ou `call`; não há como criar um erro próprio.
- `const` sem `:tipo`: a inferência foi definida só para `var`.
