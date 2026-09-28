# Erros da FluxLang

Definição dos erros que o compilador reconhece, em três classes:

| Classe | Etapa | Quando é detectado |
|---|---|---|
| Léxico | Lexer (Flex) | Ao formar os tokens |
| Sintático | Parser (Bison) | Ao validar a sequência de tokens contra a [`BNF.txt`](BNF.txt) |
| Semântico | Análise semântica | Após um parse sem erros, percorrendo a AST |

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
expressão ou um tipo são aceitos, a lista vira uma palavra só:
`Esperado: expressão` ou `Esperado: tipo`.

Não-terminais anuláveis (como os `-resto` e `-opcional` da BNF) seguem a
produção vazia por padrão, então o erro aparece no próximo terminal
obrigatório. Por isso um `;` esquecido gera `Esperado: ';'` em vez de uma
lista com todos os operadores possíveis.

No Bison, as mensagens padrão são em inglês. O `src/parser.y` usa
`%define parse.error custom` e escreve as mensagens em
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
| L5 | Número malformado | `5.`, `1e10`, `0xFF`, `2itens` | `Número malformado: '2itens'` |
| L6 | Inteiro fora do intervalo do `int` do C | `99999999999` | `Número inteiro fora do intervalo: '99999999999'` |

`&` e `|` só existem como `&&` e `||`. Letras acentuadas fora de strings
e comentários também caem em L1 (`var ação:int;` para no `ç`).
Caracteres de controle e bytes que não formam UTF-8 válido (ex.: arquivo
salvo em Latin-1) aparecem pelo código, como em
`Caractere não reconhecido: código 231`.

Já `.5` não é erro léxico: vira `DOT INT_LITERAL` e é rejeitado pelo
parser. Como o `-` é um operador separado, `-2147483648` também cai em L6.

## 3. Erros sintáticos

| Código | Erro | Mensagem |
|---|---|---|
| S1 | Token inesperado | `Token encontrado: X` / `Esperado: Y` |
| S2 | Fim de arquivo inesperado | `Token encontrado: fim do arquivo` / `Esperado: '}'` |
| S3 | Alvo de atribuição inválido | `Token encontrado: '='` / `Esperado: ';' (o lado esquerdo não é variável, campo ou índice)` |

S1 e S2 saem direto da gramática. S3 é verificado pelo parser na ação da
regra de atribuição, porque atribuição e expressão-comando começam do
mesmo jeito (ver seção 7 da BNF).

Casos comuns (mensagens conferidas com o `fluxc`):

| Situação | Exemplo | Encontrado | Esperado |
|---|---|---|---|
| `const` sem valor | `const v:string;` | `';'` | `'='` |
| `var` sem tipo e sem valor | `var x;` | `';'` | `':' ou '='` |
| Falta `;` | `x = 1` e na linha seguinte `y = 2;` | `identificador 'y'` | `';'` |
| Condição sem parênteses | `if x > 5 {` | `identificador 'x'` | `'('` |
| `else if` (não existe) | `} else if (x) {` | `palavra reservada 'if'` | `'{'` |
| Corpo sem chaves | `while (x) x = x - 1;` | `identificador 'x'` | `'{'` |
| Comando fora de função | `x = 1;` no nível global | `identificador 'x'` | `'var', 'const', 'func', 'workflow' ou fim do arquivo` |
| Bloco não fechado | falta o `}` final | `fim do arquivo` | `'}'` |
| `stop`/`abort` sem `if` | `abort err;` | `identificador 'err'` | `'if'` |
| Erro que não é identificador simples | `stop if r.err;` | `'.'` | `';'` |
| `>=` colado no tipo | `var l:list<int>= [1];` | `'>='` | `'>'` |
| Tipo de retorno antes dos parâmetros | `func soma:int (a:int)` | `':'` | `'('` |
| Alvo não atribuível | `soma(1, 2) = 3;` | `'='` | `';'` (S3) |
| Valor faltando | `var x:int = ;` | `';'` | `expressão` |
| Tipo faltando | `var x: = 1;` | `'='` | `tipo` |
| Palavra reservada como nome | `var list:int;` | `palavra reservada 'list'` | `identificador` |

Cada linha desta tabela e da tabela de erros léxicos tem um caso em
`tests/casos/`, conferido com `make test`.

## 4. Erros semânticos

Verificados só depois de um parse sem erros. No Trabalho 1 eles entram
no artigo (etapa de análise semântica), mas não precisam estar
implementados.

| Código | Regra | Exemplo inválido | Mensagem |
|---|---|---|---|
| E1 | Nome não declarado | `total = contador + 1;` | `Variável 'contador' não declarada.` |
| E2 | Redeclaração no mesmo escopo, ou local com nome de global | `var x:int; var x:int;` | `'x' já foi declarada neste escopo.` |
| E3 | Uso antes de inicializar | `var idade:int; terminal.log(toString(idade));` | `Variável 'idade' utilizada antes de ser inicializada.` |
| E4 | Tipos incompatíveis | `var idade:int = "dezessete";` | `Tipo incompatível: esperado int, encontrado string.` |
| E5 | Condição não `bool` | `if (total) { ... }` | `A condição do 'if' deve ser bool, encontrado int.` |
| E6 | Reatribuição de `const` | `versao = "2.0";` | `'versao' é constante e não pode ser reatribuída.` |
| E7 | Quantidade de variáveis diferente da de valores | `var a, b:int = 1;` | `2 variáveis e 1 valor.` |
| E8 | Tipo impossível de inferir | `var x = null;`, `var l = [];` | `Não é possível inferir o tipo de 'x'; declare o tipo.` |
| E9 | Erro de `run`/`call` não tratado | `var s, e = run { command: "ls" };` sem `stop`/`abort`/`continue if e;` | `O erro 'e' não foi tratado.` |
| E10 | `break`/`continue;` fora de laço | `break;` direto em `main` | `'break' fora de um laço.` |
| E11 | `stop if` fora de workflow | `stop if e;` em `func` ou `main` | `'stop if' só pode ser usado dentro de workflow.` |
| E12 | `return` incompatível | `return 1;` em `func` sem tipo; `return x;` em workflow | `Workflow deve retornar (resultado, erro).` |
| E13 | Função sem retorno usada como valor | `var n:int = mostrarResumo(3);` | `'mostrarResumo' não retorna valor.` |
| E14 | `main` inválida | ausente, repetida, com parâmetros ou com `:tipo` | `O programa deve ter exatamente uma 'func main ()'.` |
| E15 | Campos de `run` | sem `command`, campo repetido ou desconhecido, tipo errado | `'run' sem o campo obrigatório 'command'.` |
| E16 | Uso errado de `call` | `call soma(1, 2)` (func); `build(x)` sem `call` (workflow); workflow chamando a si mesmo | `'build' é um workflow e deve ser chamado com 'call'.` |
| E17 | `for` sobre algo que não é lista | `for c in "abc" { ... }` | `'for' exige uma lista, encontrado string.` |

Sobre E7: `call` e `run` produzem **dois** valores (resultado, erro), então
exigem exatamente duas variáveis e precisam estar sozinhos do lado
direito: `var r, e = call build(x);`.

## 5. Erros do exemplo inválido

[`exemplos/invalido.flux`](exemplos/invalido.flux) tem sete erros. As
mensagens abaixo foram conferidas com o `fluxc`, isolando um erro por vez
(com os outros seis corrigidos):

| # | Linha:coluna | Classe | Mensagem | Causa |
|---|---|---|---|---|
| 1 | 7:20 | Sintático | `Token encontrado: ';'` / `Esperado: '='` | `const` exige valor inicial |
| 2 | 15:5 | Sintático | `Token encontrado: palavra reservada 'stop'` / `Esperado: ';'` | Falta `;` depois do `}` do `run` (linha 14). A instrução que contém `run` termina com `;` |
| 3 | 24:24 | Léxico | `Caractere não reconhecido: '@'` | `@` não pertence ao alfabeto da linguagem |
| 4 | 25:9 | Léxico | `Número malformado: '2itens'` | Identificador não pode começar com dígito |
| 5 | 26:17 | Sintático | `Token encontrado: ';'` / `Esperado: ':' ou '='` | Sem `:tipo`, a inicialização é obrigatória |
| 6 | 30:12 | Sintático | `Token encontrado: palavra reservada 'if'` / `Esperado: '{'` | Não existe `else if`: aninhe o `if` dentro do bloco do `else` |
| 7 | 34:16 | Sintático (S3) | `Token encontrado: '='` / `Esperado: ';' (o lado esquerdo não é variável, campo ou índice)` | Chamada de função não pode receber atribuição |

No Trabalho 1, o compilador reporta só o erro 1 (o primeiro da entrada).
Com o modo pânico do Trabalho 2, ele deverá reportar os sete, sem erros
em cascata.

## 6. Recuperação de erros (modo pânico)

Os tokens de sincronização vêm dos conjuntos FOLLOW da BNF: `;` e `}`
fecham comandos e blocos, e as palavras reservadas abaixo iniciam um
comando ou elemento global. A exceção é o `if` de `stop if`, `abort if` e
`continue if`, que vem logo depois da palavra que abre o comando.

**Erro léxico:** o lexer reporta o erro, descarta o caractere ou lexema
inválido e entrega ao parser um token de erro. O parser entra em modo
pânico sem imprimir uma segunda mensagem.

**Erro sintático dentro de um bloco** (`<comandos>`): o parser volta ao
nível do comando atual e descarta tokens até achar:

| Token | Ação |
|---|---|
| `;` | Consome e continua no próximo comando |
| `}` | Não consome: o bloco atual termina normalmente |
| `var` `const` `if` `while` `for` `return` `break` `continue` `stop` `abort` | Continua a partir dele, como início de comando |
| `func` `workflow` | Bloco não fechado: volta ao nível global |

`IDENTIFIER`, literais, `(`, `[`, `{`, `call` e `run` também iniciam
comandos, mas aparecem no meio de expressões, então não servem para
sincronizar.

**Erro sintático no nível global** (`<globais>`): descarta tokens até
`func`, `workflow`, `var`, `const` ou fim do arquivo. Se encontrar `;`,
consome e continua.

**Chaves balanceadas:** ao descartar tokens, o parser pula blocos
`{ ... }` inteiros, contando as chaves. Sem isso, em `if x > 5 { ... }`
o `}` do `if` fecharia o bloco da função e geraria erros em cascata.

**Fim do arquivo:** se ainda falta fechar um bloco, reporta
`Token encontrado: fim do arquivo` / `Esperado: '}'` e encerra.

No Bison, esses pontos viram regras com o token `error`, por exemplo
`comando: error SEMICOLON` e `elemento_global: error SEMICOLON`, com
`yyerrok` na ação. Num parser descendente recursivo, cada função de
`<comandos>` e `<globais>` recebe o conjunto de sincronização acima.
