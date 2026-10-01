# Tarefas

## Trabalho 1 (01/10/2026)

### 1. BNF (`docs/BNF.txt`)

- [x] Corrigir o conflito de `FUNC` em `<program>` (`<before_main>` / `<after_func>` / `<after_main>`)
- [x] Fatorar `<parameters>` com `<parameters_rest>`
- [x] Corrigir `<comands>` para `<commands>`
- [x] Trocar `<variable>` por `<variable_declaration>` e incluir `<constant_declaration>` no nível global
- [x] Mudar `<type>` para `TYPE_LIST LOWER_THAN <type> GREATER_THAN`
- [x] Adicionar o token `PROCEED`
- [x] Trocar "GTE" por `GREATER_THAN_EQUAL` no aviso de maior casamento
- [x] Renumerar as seções (falta a 3)
- [x] Escrever `<variable_declaration>` e `<constant_declaration>` (resto próprio: o `const` exige valor)
- [x] Escrever `<workflow>`
- [x] Escrever `<rhs>` (`call`, `run` ou lista de expressões)
- [x] Escrever `<command_if>`, `<command_while>` e `<command_for>`
- [x] Escrever `<command_return>`, `<command_break>` e `<command_continue>`
- [x] Escrever `<command_error>` (`stop` / `abort` / `proceed if`)
- [x] Escrever `<command_expression>` (expressão, atribuição simples e múltipla)
- [x] Escrever as expressões com os 8 níveis de precedência
- [x] Escrever os literais de lista e de objeto (`<field_key>`)
- [x] Escrever `<args>`
- [x] Pedir a validação da BNF (FIRST/FOLLOW)
- [x] Remover os comentários `[erro]` e `[pendente]` validados

### 2. Documentação

- [x] Revisar o README da seção 8 em diante e tirar o `# TODO`
- [x] Conferir se `docs/exemplos/valido.flux` e `docs/exemplos/invalido.flux` batem com a BNF final
- [x] Commitar README, ERROS, BNF e exemplos

### 3. Implementação

- [x] `Makefile` (gera `./flux`, alvo `test`)
- [x] `src/lexer.l`: tokens, linha e coluna, erros L1–L6
- [x] `src/parser.y`: BNF regra por regra, sem conflitos no Bison
- [x] Mensagens em português com token encontrado e esperado (`parse.error custom`)
- [x] Verificação S3 (lado esquerdo da atribuição)
- [x] `src/main.c`: entrada padrão, `Programa aceito.` / `Programa rejeitado.`, códigos de saída
- [x] Modo `--tokens`
- [x] `tests/`: um caso por linha das tabelas das seções 2 e 3 do ERROS.md
- [x] Rodar `valido.flux` (aceito)
- [x] Rodar `invalido.flux` e conferir as mensagens e posições da seção 5 do ERROS.md
- [x] Commitar código e binário

### 4. Artigo (formato SBC)

- [x] Montar o template SBC
- [x] Definição de compiladores
- [x] Análise léxica
- [x] Análise sintática
- [x] Análise semântica
- [x] Apresentação da FluxLang
- [x] BNF
- [x] Exemplo válido
- [x] Exemplo inválido com a definição dos erros
- [x] Catálogo de erros (léxicos, sintáticos e semânticos)
- [x] Referências
- [x] Revisão final com o grupo

### 5. Apresentação

- [x] Slides da linguagem
- [x] Slides da implementação
- [x] Demonstração com `valido.flux` e `invalido.flux`
- [ ] Ensaio com o grupo

## Trabalho 2 (26/11/2026)

### 6. Compilador

- [ ] Leitura de arquivo (`./flux programa.flux`)
- [ ] Lexer entregando token de erro sem segunda mensagem
- [ ] Modo pânico no parser (seção 6 do ERROS.md)
- [ ] Pular blocos `{ ... }` com chaves balanceadas ao descartar tokens
- [ ] Conferir que `invalido.flux` reporta os 7 erros sem cascata
- [ ] Definir a forma dos nós da AST
- [ ] Construir a AST nas ações do parser
- [ ] Definir como a interface recebe tokens, erros e AST do compilador

### 7. Interface

- [ ] Escolher a tecnologia
- [ ] Exibir o código
- [ ] Contagem de linhas
- [ ] Tokens reconhecidos
- [ ] Aceito / rejeitado
- [ ] Mensagens de erro
- [ ] Árvore sintática
- [ ] Documentar a interface no README

### 8. LL(1)

- [ ] Escrever a demonstração da transformação para LL(1) (pares antes/depois)

### 9. Apresentação

- [ ] Slides da transformação para LL(1)
- [ ] Slides do modo pânico (código)
- [ ] Slides da interface
- [ ] Demonstração da interface
- [ ] Ensaio com o grupo

## Pontos extras

- [ ] Realce das linhas com erro na interface
- [ ] Análise semântica (E1–E22)
- [ ] Geração de código C e chamada do `gcc`
- [ ] Checagens de execução R1–R5 no código gerado
