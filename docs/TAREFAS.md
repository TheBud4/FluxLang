# Tarefas

## Trabalho 1 (01/10/2026)

### 1. BNF (`docs/BNF.txt`)

- [ ] Corrigir o conflito de `FUNC` em `<program>` (`<before_main>` / `<after_func>` / `<after_main>`)
- [ ] Fatorar `<parameters>` com `<parameters_rest>`
- [ ] Corrigir `<comands>` para `<commands>`
- [ ] Trocar `<variable>` por `<variable_declaration>` e incluir `<constant_declaration>` no nível global
- [ ] Mudar `<type>` para `TYPE_LIST LOWER_THAN <type> GREATER_THAN`
- [x] Adicionar o token `PROCEED`
- [x] Trocar "GTE" por `GREATER_THAN_EQUAL` no aviso de maior casamento
- [ ] Renumerar as seções (falta a 3)
- [ ] Escrever `<variable_declaration>` e `<constant_declaration>` com resto compartilhado
- [ ] Escrever `<workflow>`
- [ ] Escrever `<rhs>` (`call`, `run` ou lista de expressões)
- [ ] Escrever `<command_if>`, `<command_while>` e `<command_for>`
- [ ] Escrever `<command_return>`, `<command_break>` e `<command_continue>`
- [ ] Escrever `<command_error>` (`stop` / `abort` / `proceed if`)
- [ ] Escrever `<command_expression>` (expressão, atribuição simples e múltipla)
- [ ] Escrever as expressões com os 8 níveis de precedência
- [ ] Escrever os literais de lista e de objeto (`<field_key>`)
- [ ] Escrever `<args>`
- [ ] Pedir a validação da BNF (FIRST/FOLLOW)
- [ ] Remover os comentários `[erro]` e `[pendente]` validados

### 2. Documentação

- [ ] Revisar o README da seção 8 em diante e tirar o `# TODO`
- [ ] Conferir se `docs/exemplos/valido.flux` e `docs/exemplos/invalido.flux` batem com a BNF final
- [ ] Commitar README, ERROS, BNF e exemplos

### 3. Implementação

- [x] `Makefile` (gera `./fluxc`, alvo `test`)
- [x] `src/lexer.l`: tokens, linha e coluna, erros L1–L6
- [ ] `src/parser.y`: BNF regra por regra, sem conflitos no Bison
- [ ] Mensagens em português com token encontrado e esperado (`parse.error custom`)
- [ ] Verificação S3 (lado esquerdo da atribuição)
- [ ] `src/main.c`: entrada padrão, `Programa aceito.` / `Programa rejeitado.`, códigos de saída
- [x] Modo `--tokens`
- [ ] `tests/`: um caso por linha das tabelas das seções 2 e 3 do ERROS.md
- [ ] Rodar `valido.flux` (aceito)
- [ ] Rodar `invalido.flux` e conferir as mensagens e posições da seção 5 do ERROS.md
- [ ] Commitar código e binário

### 4. Artigo (formato SBC)

- [ ] Montar o template SBC
- [ ] Definição de compiladores
- [ ] Análise léxica
- [ ] Análise sintática
- [ ] Análise semântica
- [ ] Apresentação da FluxLang
- [ ] BNF
- [ ] Exemplo válido
- [ ] Exemplo inválido com a definição dos erros
- [ ] Catálogo de erros (léxicos, sintáticos e semânticos)
- [ ] Referências
- [ ] Revisão final com o grupo

### 5. Apresentação

- [ ] Slides da linguagem
- [ ] Slides da implementação
- [ ] Demonstração com `valido.flux` e `invalido.flux`
- [ ] Ensaio com o grupo

## Trabalho 2 (26/11/2026)

### 6. Compilador

- [ ] Leitura de arquivo (`./fluxc programa.flux`)
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
