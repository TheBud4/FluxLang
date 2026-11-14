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
- [x] Ensaio com o grupo

## Pendências da auditoria (02/10)

Auditoria de 02/10 (a pasta foi removida em 12/11; a lista abaixo é o que sobrou). A parte de
documentação já foi feita; o que envolve código ou BNF fica com você.

- [ ] Perguntar ao professor: o pânico "análogo ao código feito em sala", o que ele entende por "árvore sintática" e se a demonstração da transformação para LL(1) é mesmo dispensável, já que a linguagem nasceu LL(1)
- [x] Alinhar `tests/sintatico/invalido_erroN.flux` ao `invalido.flux` atual e conferir os `.out` com as posições da seção 5 do ERROS.md
- [x] Testes positivos que faltam: declarações depois da `main`, `var` global, `[]`, `{}`, função sem parâmetros, `return;` e o operador `>`
- [x] Alvo `make asan` e `-g` no `Makefile` (o `asan` precisa de `sudo dnf install libasan libubsan`; ainda não rodou neste computador)
- [ ] Decidir se `build/`, `flux` e `compile_commands.json` continuam versionados (hoje estão também no `.gitignore`)
- [ ] Decidir se as decisões da spec viram um `docs/DECISOES.md` versionado
- [x] Antes da análise semântica: decisões D1 a D8 (as originais da auditoria se perderam; as oito foram refeitas e decididas em 14/11, ver README e AGENTS.md)

## Trabalho 2 (26/11/2026)

### 6. Compilador

- [x] Leitura de arquivo (`./flux programa.flux`)
- [x] Modo pânico no parser, com regras `error` do Bison (seção 6 do ERROS.md; versão simples)
- [x] Pular blocos `{ ... }` ao descartar tokens (`error block`: o bloco é lido inteiro)
- [x] Refinar o pânico (retomar em `}`, palavras de comando e `func`): testado, aumenta os erros em cascata; versão simples mantida (medição em ERROS.md, seção 6)
- [x] Lexer entregando token de erro sem segunda mensagem
- [x] Conferir que `invalido.flux` reporta os 7 erros sem cascata
- [x] Árvore de derivação (nós = não-terminais da BNF; `./flux --tree`)
- [x] `./flux --json` com tokens, erros e árvore

### 7. Interface

- [x] Interface web local que chama o `./flux --json`
- [x] Exibir o código e a contagem de linhas
- [x] Tokens reconhecidos
- [x] Aceito / rejeitado e mensagens de erro
- [x] Árvore sintática
- [x] Documentar a interface no README

### 8. LL(1)

- [x] Dispensada: a linguagem foi escrita LL(1) desde o início (decisão do usuário, 14/11). Se o professor exigir, o material está no histórico git da BNF (7c94f9c → e9a06e3)

### 9. Apresentação

- [ ] Slides do modo pânico (código)
- [ ] Slides da interface
- [ ] Demonstração da interface
- [ ] Ensaio com o grupo

## Pontos extras

- [x] Realce das linhas com erro na interface
- [x] Análise semântica (E1–E24): `./flux --semantic`, com a chave na interface
- [x] Geração de código C e chamada do `gcc` (`--c`, `--build`, `--run`)
- [x] Checagens de execução R1–R7 no código gerado (biblioteca `runtime/flux_rt.h`)
