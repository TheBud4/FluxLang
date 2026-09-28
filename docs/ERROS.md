# Erros da FluxLang

Definição dos erros que o compilador reconhece, em três classes:

| Classe | Etapa | Quando é detectado |
|---|---|---|
| Léxico | Lexer (Flex) | Ao formar os tokens |
| Sintático | Parser (Bison) | Ao validar a sequência de tokens contra a [`BNF.txt`](BNF.txt) |
| Semântico | Análise semântica | Após um parse sem erros, percorrendo a AST |

Além delas, a [seção 7](#7-erros-em-tempo-de-execução) define os erros
que o programa pode ter ao ser executado.

No **Trabalho 1**, o compilador para no primeiro erro léxico ou
sintático. No **Trabalho 2**, o modo pânico ([seção 6](#6-recuperação-de-erros-modo-pânico))
permite continuar e reportar os demais.

## 1. Formato das mensagens

```text
Erro léxico [linha 24, coluna 24]:
Caractere não reconhecido: '@'

Erro sintático [linha 7, coluna 20]:
Token encontrado: ';'
Esperado: '='

Erro semântico [linha 12, coluna 5]:
Variável 'idade' utilizada antes de ser inicializada.
```

Todo erro sintático cita o **token encontrado** e o **token esperado**.
Para a mensagem ficar em português, os tokens aparecem assim:

| Token | Como aparece na mensagem |
|---|---|
| Operadores e pontuação | O próprio símbolo: `';'`, `'='`, `'{'`, `'>='` |
| Palavras reservadas | `palavra reservada 'if'` |
| `IDENTIFIER` | `identificador 'total'` |
| `INT_LITERAL` / `FLOAT_LITERAL` | `número inteiro 10` / `número real 3.14` |
| `STRING_LITERAL` | `texto "abc"` |
| Fim da entrada | `fim do arquivo` |

Quando mais de um token é aceito naquele ponto, todos são listados:
`Esperado: ':' ou '='`. Palavras reservadas esperadas aparecem só entre
aspas (`Esperado: 'if'`). Quando todos os tokens que iniciam uma
expressão, um tipo ou um comando são aceitos, a lista vira uma palavra
só: `Esperado: expressão`, `Esperado: tipo` ou `Esperado: comando`.

Não-terminais anuláveis (como `<parameter_list>` e `<return_type>` da BNF) seguem a
produção vazia por padrão, então o erro aparece no próximo terminal
obrigatório. Por isso um `;` esquecido gera `Esperado: ';'` em vez de uma
lista com todos os operadores possíveis.

Pela mesma regra, `call` ou `run` fora do lugar geram só o próximo
terminal obrigatório (`'}'`, `')'`...). Como isso sozinho não explica o
erro, quando o token encontrado é `call` ou `run` a mensagem ganha a
explicação `(call e run só aparecem logo depois do '=' de um var ou de uma
atribuição)`.

No Bison, as mensagens padrão são em inglês. O `src/parser.y` vai usar
`%define parse.error custom` e escrever as mensagens em
`yyreport_syntax_error`, com a lista de tokens esperados vinda de
`yypcontext_expected_tokens`. A ordem da lista segue a ordem das
declarações `%token`.

## 2. Erros léxicos

| Código | Erro | Exemplo | Mensagem |
|---|---|---|---|
| L1 | Caractere não reconhecido | `10 @ 2`, `#`, `$`, `'a'`, `a & b`, `a \| b` | `Caractere não reconhecido: '@'` |
| L2 | String não terminada | `"abc` seguido de quebra de linha ou fim do arquivo | `String não terminada` |
| L3 | Sequência de escape inválida | `"C:\pasta"` | `Sequência de escape inválida: '\p'` |
| L4 | Comentário de bloco não terminado | `/* ...` sem `*/` até o fim | `Comentário de bloco não terminado` |
| L5 | Número malformado | `5.`, `1e10`, `0xFF`, `2itens`, `3.14abc` | `Número malformado: '2itens'` |
| L6 | Inteiro fora do intervalo do `int` do C | `99999999999` | `Número inteiro fora do intervalo: '99999999999'` |

`&` e `|` só existem como `&&` e `||`. Letras acentuadas fora de strings
e comentários também caem em L1 (`var ação:int;` para no `ç`).
Caracteres de controle e bytes que não formam UTF-8 válido (ex.: arquivo
salvo em Latin-1) aparecem pelo código, como em
`Caractere não reconhecido: código 231`.

Já `.5` não é erro léxico: vira `DOT INT_LITERAL` e é rejeitado pelo
parser. Como o `-` é um operador separado, `-2147483648` também cai em L6.

A posição do erro léxico é o início do trecho lido, com duas exceções:
L2 e L4 apontam para onde a string ou o comentário abriu (a `"` ou o
`/*`), e L3 aponta para a barra do escape inválido. Colunas contam
caracteres, e uma tabulação conta como uma coluna.

## 3. Erros sintáticos

| Código | Erro | Mensagem |
|---|---|---|
| S1 | Token inesperado | `Token encontrado: X` / `Esperado: Y` |
| S2 | Fim de arquivo inesperado | `Token encontrado: fim do arquivo` / `Esperado: '}'` |
| S3 | Alvo de atribuição inválido | `Token encontrado: '='` / `Esperado: ';' (o lado esquerdo não é variável, campo ou índice)` |

S1 e S2 saem direto da gramática. S3 é verificado pelo parser na ação da
regra de atribuição, porque atribuição e expressão-comando começam do
mesmo jeito (ver a seção Gramática do README). O que decide é o último
sufixo do alvo: `x`, `obj.a`, `l[0]` e `f().x` são aceitos; `f()`,
`(x)`, `a + b` e `10` dão S3. A posição é a do `=`, também na
atribuição múltipla (`a, f() = 1, 2;`).

Casos comuns (mensagens esperadas):

| Situação | Exemplo | Encontrado | Esperado |
|---|---|---|---|
| `const` sem valor | `const v:string;` | `';'` | `'='` |
| `var` sem tipo e sem valor | `var x;` | `';'` | `'=' ou ':'` |
| Falta `;` | `x = 1` e na linha seguinte `y = 2;` | `identificador 'y'` | `';'` |
| Condição sem parênteses | `if x > 5 {` | `identificador 'x'` | `'('` |
| `else if` (não existe) | `} else if (x) {` | `palavra reservada 'if'` | `'{'` |
| Corpo sem chaves | `while (x) x = x - 1;` | `identificador 'x'` | `'{'` |
| Comando fora de função | `x = 1;` no nível global, antes da `main` | `identificador 'x'` | `'var', 'const', 'func' ou 'workflow'` |
| `main` ausente | arquivo só com `var`, `func` e `workflow` | `fim do arquivo` | `'var', 'const', 'func' ou 'workflow'` |
| `main` repetida | segunda `func main () { }` | `palavra reservada 'main'` | `identificador` |
| `main` com parâmetros | `func main (x:int) {` | `identificador 'x'` | `')'` |
| `main` com tipo de retorno | `func main ():int {` | `':'` | `'{'` |
| `call`/`run` como comando isolado | `call build(x);` | `palavra reservada 'call'` | `'}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)` |
| `call`/`run` dentro de expressão | `terminal.log(call f());` | `palavra reservada 'call'` | `')' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)` |
| Bloco não fechado | falta o `}` final | `fim do arquivo` | `'}'` |
| `stop`/`abort` sem `if` | `abort err;` | `identificador 'err'` | `'if'` |
| Erro que não é identificador simples | `stop if r.err;` | `'.'` | `';'` |
| `>=` colado no tipo | `var l:list<int>= [1];` | `'>='` | `'>'` |
| Tipo de retorno antes dos parâmetros | `func soma:int (a:int)` | `':'` | `'('` |
| Alvo não atribuível | `soma(1, 2) = 3;` | `'='` | `';'` (S3) |
| Valor faltando | `var x:int = ;` | `';'` | `expressão, 'call' ou 'run'` |
| Tipo faltando | `var x: = 1;` | `'='` | `tipo` |
| Palavra reservada como nome | `var list:int;` | `palavra reservada 'list'` | `identificador` |

Cada linha desta tabela e da tabela de erros léxicos deve virar um caso
em `tests/casos/`, conferido com `make test`.

## 4. Erros semânticos

Verificados só depois de um parse sem erros. No Trabalho 1 eles entram
no artigo (etapa de análise semântica), mas não precisam estar
implementados.

| Código | Regra | Exemplo inválido | Mensagem |
|---|---|---|---|
| E1 | Nome não declarado | `total = contador + 1;`, `somar(1, 2);` | `'contador' não foi declarado.` |
| E2 | Nome já visível: redeclaração no mesmo escopo ou num escopo interno (sem shadowing) | `var x:int; var x:int;`, `var terminal:int;` (nome da biblioteca) | `'x' já foi declarada.` |
| E3 | Uso antes de inicializar (não atribuída em todos os caminhos) | `var idade:int; terminal.log(toString(idade));`, ou atribuída só dentro de um `if` sem `else` | `Variável 'idade' utilizada antes de ser inicializada.` |
| E4 | Tipos incompatíveis em atribuição, argumento ou operador (tabela da seção 3 do README) | `var idade:int = "dezessete";`, `"a" + 1` | `Tipo incompatível: esperado int, encontrado string.` / `Operador '+' não aceita string e int.` |
| E5 | Condição não `bool` | `if (total) { ... }` | `A condição do 'if' deve ser bool, encontrado int.` |
| E6 | Reatribuição de `const` | `versao = "2.0";` | `'versao' é constante e não pode ser reatribuída.` |
| E7 | Quantidade de variáveis diferente da de valores | `var a, b:int = 1;` | `2 variáveis e 1 valor.` |
| E8 | Tipo impossível de inferir | `var x = null;`, `var l = [];`, `var a = user.age;` (campo de object) | `Não é possível inferir o tipo de 'x'; declare o tipo.` |
| E9 | Erro de `run`/`call` não tratado até o fim do bloco onde foi declarado (vale tratamento em bloco interno) | `var s, e = run { command: "ls" };` sem `stop`/`abort`/`proceed if e;` | `O erro 'e' não foi tratado.` |
| E10 | `break`/`continue` fora de laço | `break;` direto em `main` | `'break' fora de um laço.` |
| E11 | `stop if` fora de workflow | `stop if e;` em `func` ou `main` | `'stop if' só pode ser usado dentro de workflow.` |
| E12 | `return` incompatível | `return 1;` em `func` sem tipo; `return x;` em workflow | `Workflow deve retornar (resultado, erro).` |
| E13 | Função sem retorno (ou `push`/`remove`) usada como valor | `var n:int = mostrarResumo(3);`, `var x = nomes.push(1);` | `'mostrarResumo' não retorna valor.` |
| E14 | Campos de `run` | sem `command`, campo repetido ou desconhecido, tipo errado | `'run' sem o campo obrigatório 'command'.` |
| E15 | Uso errado de `call` | `call soma(1, 2)` (func); `build(x)` sem `call` (workflow) | `'build' é um workflow e deve ser chamado com 'call'.` |
| E16 | `for` sobre algo que não é lista | `for c in "abc" { ... }` | `'for' exige uma lista, encontrado string.` |
| E17 | Operando de `stop`/`abort`/`proceed if` não é variável de erro | `var out, err = run { command: "ls" }; abort if out;` | `'out' não é uma variável de erro.` |
| E18 | `call`/`run` dentro de `func` | `func f() { var r, e = run { command: "ls" }; }` | `'run' só pode ser usado em workflow ou na main.` |
| E19 | `[ ]` com tipo errado | `nomes["a"]` (lista exige `int`), `user[0]` (object exige `string`), `idade[0]` | `Índice de lista deve ser int, encontrado string.` |
| E20 | `func` com `:tipo` sem `return` em todos os caminhos | `func f(x:int):int { if (x > 0) { return 1; } }` | `A função 'f' deve retornar int em todos os caminhos.` |
| E21 | Número de argumentos errado | `soma(1)` para `func soma(a:int, b:int)` | `'soma' espera 2 argumentos, recebeu 1.` |
| E22 | Chamada de algo que não é função nem método | `idade.push(1)` (int), `terminal.foo()`, `user.name()` | `'idade' não tem o método 'push'.` |

Sobre E7: `call` e `run` produzem **dois** valores (resultado, erro), então
exigem exatamente duas variáveis: `var r, e = call build(x);`. Que eles
estejam sozinhos do lado direito do `=` já é garantido pela gramática.

## 5. Erros do exemplo inválido

[`exemplos/invalido.flux`](exemplos/invalido.flux) tem sete erros, cada
um numa linha marcada com comentário. As posições foram calculadas a
partir do arquivo, e as mensagens seguem as seções 1 a 3. Quando o
`fluxc` existir, elas devem ser conferidas isolando um erro por vez (com
os outros seis corrigidos):

| # | Linha:coluna | Classe | Mensagem | Causa |
|---|---|---|---|---|
| 1 | 4:20 | Sintático | `Token encontrado: ';'` / `Esperado: '='` | `const` exige valor inicial |
| 2 | 16:5 | Sintático | `Token encontrado: palavra reservada 'stop'` / `Esperado: ';'` | Falta `;` depois do `}` do `run` (linha 15): a instrução que contém `run` termina com `;` |
| 3 | 21:24 | Léxico | `Caractere não reconhecido: '@'` | `@` não pertence ao alfabeto da linguagem |
| 4 | 22:9 | Léxico | `Número malformado: '2itens'` | Identificador não pode começar com dígito |
| 5 | 27:12 | Sintático | `Token encontrado: palavra reservada 'if'` / `Esperado: '{'` | Não existe `else if`: aninhe o `if` dentro do bloco do `else` |
| 6 | 31:5 | Sintático | `Token encontrado: palavra reservada 'call'` / `Esperado: '}' (call e run só aparecem logo depois do '=' de um var ou de uma atribuição)` | `call` não é comando isolado: o resultado e o erro precisam de duas variáveis (`var r, e = call build(...);`) |
| 7 | 32:16 | Sintático (S3) | `Token encontrado: '='` / `Esperado: ';' (o lado esquerdo não é variável, campo ou índice)` | Chamada de função não pode receber atribuição |

No Trabalho 1, o compilador reporta só o erro 1 (o primeiro da entrada).
Com o modo pânico do Trabalho 2, ele deverá reportar os sete, sem erros
em cascata.

## 6. Recuperação de erros (modo pânico)

Os tokens de sincronização vêm dos conjuntos FOLLOW da BNF: `;` e `}`
fecham comandos e blocos, e as palavras reservadas abaixo iniciam um
comando ou elemento global. A exceção é o `if` de `stop if`, `abort if` e
`proceed if`, que vem logo depois da palavra que abre o comando.

**Erro léxico:** o lexer reporta o erro, descarta o caractere ou lexema
inválido e entrega ao parser um token de erro. O parser entra em modo
pânico sem imprimir uma segunda mensagem.

**Erro sintático dentro de um bloco** (`<commands>`): o parser volta ao
nível do comando atual e descarta tokens até achar:

| Token | Ação |
|---|---|
| `;` | Consome e continua no próximo comando |
| `}` | Não consome: o bloco atual termina normalmente |
| `var` `const` `if` `while` `for` `return` `break` `continue` `stop` `abort` `proceed` | Continua a partir dele, como início de comando |
| `func` `workflow` | Bloco não fechado: volta ao nível global |

`IDENTIFIER`, literais, `(`, `[` e `{` também iniciam comandos, mas
aparecem no meio de expressões, então não servem para sincronizar. `call`
e `run` só aparecem depois de um `=`, no meio do comando, e também não
servem.

**Erro sintático no nível global** (`<declaration_list>`): descarta tokens até
`func`, `workflow`, `var`, `const` ou fim do arquivo. Se encontrar `;`,
consome e continua.

**Chaves balanceadas:** ao descartar tokens, o parser pula blocos
`{ ... }` inteiros, contando as chaves. Sem isso, em `if x > 5 { ... }`
o `}` do `if` fecharia o bloco da função e geraria erros em cascata.

**Fim do arquivo:** se ainda falta fechar um bloco, reporta
`Token encontrado: fim do arquivo` / `Esperado: '}'` e encerra.

No Bison, esses pontos viram regras com o token `error`, por exemplo
`command: error SEMICOLON` e `declaration: error SEMICOLON`, com
`yyerrok` na ação. Num parser descendente recursivo, cada função de
`<commands>` e `<declaration_list>` recebe o conjunto de sincronização acima.

## 7. Erros em tempo de execução

Só aparecem quando o programa é executado, por exemplo com a geração de
código C (ponto extra do Trabalho 2). São de dois tipos.

**Erros tratáveis:** só `run` e `call` devolvem erro, no par
`(resultado, erro)`, e ele deve ser tratado com `stop if`, `abort if` ou
`proceed if` (E9). O `run` devolve erro quando o comando não pode ser
iniciado ou termina com código de saída diferente de 0. Nesse caso, o par é
`(null, saída de erro do comando)`; se a saída de erro vier vazia, o erro é
`comando 'npm' terminou com código 1`.

**Erros fatais:** todos os outros encerram o programa como o `abort`, com
a mensagem na saída de erro e código de saída 1.

| Código | Erro | Exemplo | Mensagem |
|---|---|---|---|
| R1 | Conversão impossível | `toInt("abc")` | `Não é possível converter "abc" para int.` |
| R2 | Índice fora da lista | `nomes[5]` numa lista com 2 elementos | `Índice 5 fora da lista (tamanho 2).` |
| R3 | Uso inválido de `null` | `user.name` com `user` valendo `null` | `Uso de valor null.` |
| R4 | Divisão inteira por zero | `10 / 0`, `10 % 0` | `Divisão por zero.` |
| R5 | Valor de campo com tipo diferente do esperado | `var n:int = user.name;` com `name` valendo uma string; `user.name.x` | `Esperado int, encontrado string.` |

```text
Erro de execução [linha 12]:
Índice 5 fora da lista (tamanho 2).
```

O `abort if err;` usa o mesmo formato, com a mensagem de `err` no lugar da
mensagem da tabela.
