# Correções do compilador e ajuste do texto da documentação: plano

> **Para agentes:** use superpowers:subagent-driven-development. Os passos usam caixas `- [ ]`.

**Objetivo:** consertar os defeitos do compilador que a documentação registrou em `docs/TAREFAS.md` ("Decisões pendentes com o usuário") e ajustar as páginas do manual que os descrevem.

**Arquitetura:** nada muda na gramática (`docs/BNF.txt` é só do usuário). As correções ficam em `src/semantic/sema.c`, `src/backend/codegen_c.c`, `src/backend/runtime/flux_rt.h`, `src/main.c`, `src/frontend/parser.y` (só regras de ação/`error`, sem tocar a gramática). Cada correção ganha casos em `tests/` e atualiza as páginas de `web/src/docs/pages/` na mesma mudança (regra 10 do AGENTS.md).

**Tecnologias:** C (flex, bison, gcc), `tests/run.sh`, TypeScript/React para as páginas.

## Decisões do usuário (18/11/2026)

- Escopo: os quatro grupos (geração e execução; compilador e linha de comando; ordem dos inicializadores globais; recuperação de erros do parser).
- Objeto cíclico impresso (`o.me = o;`): **erro de execução R7**, mensagem em português; sem segfault.
- `--build prog` com fonte sem extensão: **recusar com erro** (código de saída 2), pedindo `-o` ou uma extensão; nunca sobrescrever o fonte.
- Inicializador global fora de ordem: **erro de compilação** novo (E25), quando o inicializador de um global chama, direta ou indiretamente, uma função que lê um global declarado depois. Mantém a decisão D3 (globais só usam os declarados acima).
- Parser: **investigar e medir primeiro**; só aplicar o que diminuir os erros em cascata na medição de `docs/ERROS.md` seção 6; se piorar, descartar e documentar o número.

## Restrições globais

- A linguagem não muda além do E25. Mensagens e documentação em português; nomes de não-terminais da BNF em inglês.
- `docs/BNF.txt` não se toca. A gramática do `parser.y` não muda (conflitos zero no Bison; `bison -Wall` sem avisos).
- Sem comentários no código (AGENTS.md regra 10): o "porquê" vai para a página do manual correspondente, no mesmo commit.
- Cada tarefa: caso(s) de teste novos em `tests/` antes da correção (vermelho), correção (verde), `.out` conferidos à mão; `make clean && make` sem avisos; `bash tests/run.sh` termina em `203+N passaram, 0 falharam.` (o teste `tests/exec/entrada_com_stdin.flux` na passada wine/estresse já falhou de forma intermitente: repetir uma vez e dizer qual caso).
- Depois de cada correção que muda mensagem, código de erro ou comportamento visível: atualizar `docs/ERROS.md`, as páginas do manual afetadas (`web/src/docs/pages/linguagem/erros.tsx`, `regras-semanticas.tsx`, `compilador/*.tsx`, `referencia.tsx` para funções novas) e marcar o item em `docs/TAREFAS.md`. Rodar `lint_hardcodes.py` e `check_no_emoji.py` nos `.tsx` alterados e `cd web && npx tsc -b && npm run build`.
- Nunca `Co-Authored-By` nem atribuição a IA nos commits (português, um commit por tarefa, mais um de testes se separar ajudar). Não dar push (o usuário decide).
- Branch: `fix/bugs-do-compilador`.

## Foco da revisão

1. Mudança de comportamento que o teste não pegaria: programas existentes de `tests/` e `docs/exemplos/` continuam com a mesma saída (a suíte inteira).
2. A ordem de avaliação da esquerda para a direita vale também para índice e campo de atribuição, argumentos de chamada e literais.
3. Estouros de pilha e profundidade (R7) continuam funcionando com clang e gcc e não viram laço infinito.
4. Mensagens novas: formato `Erro <categoria> [linha L, coluna C]:`, posição correta, português.
5. O `--json` sempre devolve ao menos uma mensagem quando `accepted` é `false`.

---

### Task 1: Geração: conversão em `call`/`run`, ordem de avaliação, linha do erro

**Arquivos:** `src/backend/codegen_c.c`, `src/backend/runtime/flux_rt.h`, `tests/exec/*`, `tests/exec_tagged/*` se preciso; páginas `compilador/gerador-c.tsx`, `compilador/runtime.tsx`, `compilador/referencia.tsx`; `docs/TAREFAS.md`.

- [ ] **Passo 1: testes vermelhos.** (a) `q, e = call w()` com `q:float` e `w` devolvendo `int`: `q / 2` deve ser `0.5` e `toString(q)` `1.0`; o mesmo com `run` não se aplica (string), cobrir workflow com resultado `int` para variável `float` já declarada e em `var q:float, e = call w();`; (b) `l[f()] = g()` e `o.campo[f()] = g()` com funções que imprimem: ordem esperada alvo (base, índice) antes do valor (esquerda para a direita); (c) erro de execução depois do retorno de uma função: a linha citada é a da linha do chamador, não a do fim da função chamada (ex.: `var x = f(); var y = 1 / 0;` com `f` multilinha).
- [ ] **Passo 2: corrigir** em `codegen_c.c`/`flux_rt.h`: aplicar a mesma conversão `int` para `float` da atribuição comum ao receber o resultado de `call` (conferir o tipo declarado do destino); gerar o alvo (base e índice/campo) em temporários antes de gerar o valor da direita; restaurar `fx_line` ao retornar de função e de workflow (guardar a linha do chamador). Descobrir pelo fonte como as atribuições comuns convertem hoje e reaproveitar o mesmo caminho.
- [ ] **Passo 3: verde.** Suíte inteira, inclusive estresse do coletor e passadas Windows (se `wine` existir); `FLUX_CC=clang` nativo se `clang` existir.
- [ ] **Passo 4: documentar.** As Callouts "comportamento atual" de `gerador-c.tsx` e `runtime.tsx` (conversão em `call`, ordem de avaliação, `fx_line`) viram a regra correta com o "porquê"; atualizar `referencia.tsx` se mudar assinatura; `TAREFAS.md`: marcar os três itens. Commit: `fix: conversão int para float em call, ordem de avaliação do alvo e linha do erro depois do retorno`.

### Task 2: Execução: imprimir objeto cíclico vira R7

**Arquivos:** `src/backend/runtime/flux_rt.h` (`fx_repr`/`fx_to_string` e quem mais percorre listas/objetos), `tests/exec/*`, `docs/ERROS.md` (R7), `runtime.tsx`, `coletor.tsx` se citar o ciclo, `erros.tsx`, `docs/TAREFAS.md`.

- [ ] **Passo 1: teste vermelho.** `var o = {}; o.me = o; terminal.log(o);` e lista que contém a si mesma, e o ciclo indireto (`a.b = b; b.a = a;`), por `terminal.log` e por `toString`: hoje 139; esperado: erro de execução R7 com mensagem em português (ex.: `Estrutura circular ou profunda demais para imprimir.`), código de saída 1, na linha do comando. Uma estrutura profunda mas finita (profundidade 1000) deve continuar imprimindo.
- [ ] **Passo 2: corrigir** com um limite de profundidade (ou detecção de ciclo por marcação) em `fx_repr`; a mensagem usa o mesmo caminho de `fx_die` do R7 existente. Funcionar com clang -O1/-O2 e sob `FLUX_GC_STRESS=1`.
- [ ] **Passo 3: verde** com a suíte; **documentar**: `ERROS.md` R7 (nova causa), `erros.tsx` R7 (exemplo com `Abrir no editor`), `runtime.tsx` (fx_repr), `TAREFAS.md`. Commit: `fix: objeto cíclico impresso dá R7 em vez de falha de segmentação`.

### Task 3: Compilador e linha de comando

**Arquivos:** `src/main.c`, `src/frontend/parser.y` (só a função de erro de memória do Bison), `src/json.c` se preciso, `src/semantic/sema.c` (tabela de símbolos), `tests/*`, `tests/run.sh`, `docs/ERROS.md`, `compilador/linha-de-comando.tsx`, `compilador/semantica.tsx`, `compilador/arvore-json.tsx`, `compilador/mapa-e-build.tsx`, `referencia.tsx`, `docs/TAREFAS.md`.

- [ ] **Passo 1: testes vermelhos.** (a) `./flux --build prog` com `prog` sem extensão: hoje sobrescreve; esperado: erro em português, saída 2, o fonte intacto (teste no `run.sh` ou em `tests/` com arquivo temporário); com `-o` ou extensão continua funcionando; (b) `FLUX_CC=clang ./flux --build --windows` deve usar o compilador do alvo (mingw), e `FLUX_CC` só vale para o alvo nativo; (c) um arquivo gerado com 5000 operandos encadeados (`var a = 1 + 1 + ...` dentro de `main`, gerado por roteiro no teste ou em `tests/` pequeno com a fábrica no `run.sh`): `--json` deve devolver `accepted:false` com **um erro** de mensagem em português (limite do analisador: expressão encadeada longa demais), e o modo texto imprimir a mesma mensagem no formato `Erro sintático [linha L, coluna C]:`; (d) 8200 variáveis locais declaradas e um uso antes da atribuição na primeira e na última: o E3 deve ser detectado nas duas (hoje some a partir de 8192).
- [ ] **Passo 2: corrigir.** (a) em `main.c` recusar (saída 2, mensagem em português que cita `-o`) quando o nome do executável coincidiria com o do fonte; (b) `--windows` ignora `FLUX_CC` (documentado) e continua usando `x86_64-w64-mingw32-gcc`; (c) tratar o `memory exhausted` do Bison (a rotina de erro do parser) como erro registrado por `report_error` (também no modo JSON), em vez de só `fprintf` em stderr; (d) a tabela de símbolos de `sema.c` cresce com `mem_grow` em vez de `MAX_SYMS` fixo.
- [ ] **Passo 3: verde** com a suíte; `make asan` se `libasan` existir (a arena e o crescimento da tabela). **Documentar**: `ERROS.md` (mensagem nova do analisador, flags), `linha-de-comando.tsx` (recusa do `--build`, `FLUX_CC` e `--windows`), `arvore-json.tsx` ("Limites"), `semantica.tsx` (tabela de símbolos sem teto), `referencia.tsx`; `TAREFAS.md` marcar quatro itens. Commit: `fix: --build não sobrescreve o fonte, --windows ignora FLUX_CC, estouro do analisador vira erro e E3 sem teto de 8192`.

### Task 4: Semântica: E25, inicializador global fora de ordem

**Arquivos:** `src/semantic/sema.c`, `docs/ERROS.md` (seção 4), `README.md` (seção 8: regra de globais), `docs/exemplos/*` se algum exemplo violar, `tests/semantico/*`, `tests/exec/*`, páginas `linguagem/erros.tsx`, `linguagem/regras-semanticas.tsx`, `linguagem/estrutura.tsx` (se descreve a ordem), `compilador/semantica.tsx`, `compilador/referencia.tsx`; `docs/TAREFAS.md`.

- [ ] **Passo 1: testes vermelhos** em `tests/semantico/`: `var a = f();` global antes de `var b = 5;`, com `func f():int { return b; }`: hoje compila e dá R3 em tempo de execução; esperado: erro semântico novo **E25** (texto sugerido: `O inicializador de 'a' chama 'f', que lê o global 'b', declarado depois (linha N).`; posição no inicializador); casos de controle: `f` que só lê globais declarados antes (aceito); chamada indireta (`f` chama `g` que lê `b`); recursão; workflow chamado no inicializador (não pode: `call` não é expressão, mas confirmar o que o E já diz); função que lê `b` mas nunca chamada em inicializador (aceito).
- [ ] **Passo 2: implementar** em `sema.c` um grafo de leituras de globais por função (passada própria depois da passada 2) com fecho transitivo, e o E25 na passada dos inicializadores. Reaproveitar a pilha de erros e a deduplicação existentes; não alterar os E1 a E24. Conferir todos os exemplos de `docs/exemplos/` e `tests/` (a suíte): nenhum programa válido pode virar E25 por engano.
- [ ] **Passo 3: documentar.** `ERROS.md` seção 4: linha E25 (causa, exemplo, mensagem) e o contador "E1 a E24" vira "E1 a E25" em todo lugar (`grep -rn "E24" README.md AGENTS.md CLAUDE.md docs web/src/docs`); `README.md` seção 8: uma frase na regra dos globais (a decisão D3 ganha o erro); páginas `erros.tsx` (entrada E25 com exemplo e saída real), `regras-semanticas.tsx`, `semantica.tsx` (tabela E-código para função, passada nova), `referencia.tsx`; `TAREFAS.md`. Mexer no README só nesta frase (o usuário decidiu o E25). Commit: `feat: E25, inicializador de global que chama função que lê global declarado depois`.

### Task 5: Parser: recuperação de erros (medir primeiro)

**Arquivos:** `src/frontend/parser.y` (regras `error` e ações, nunca a gramática), `tests/sintatico/*`, `tests/arvore/*`, `tests/json/*`, `docs/ERROS.md` seção 6, `compilador/modo-panico.tsx`, `compilador/parser.tsx`, `docs/TAREFAS.md`.

- [ ] **Passo 1: reproduzir e medir.** Montar os casos da seção "Pânico" de TAREFAS.md (`1 +;` solto sem `func main`; `x = 1 +` seguido de `}`; comando sem `;` antes de `}`; texto solto antes de `main`) e registrar hoje: número de erros, se há árvore. Repetir a medição de `docs/ERROS.md` seção 6 (983 erros de referência sobre o corpus descrito lá; reconstituir o roteiro) para ter a linha de base.
- [ ] **Passo 2: ajustar** só as regras `error`/ações do `parser.y` (sem tocar a gramática nem a BNF; `bison -Wall` sem avisos e sem conflitos), uma hipótese por vez, medindo contra a linha de base. Critério de aceitação de cada ajuste: não aumentar o total de erros do corpus, não perder erro real do `invalido.flux` (os 7 erros e posições da seção 5), e melhorar pelo menos um dos casos (menos erro espúrio, ou árvore parcial devolvida). Ajuste que piorar é descartado e a medição vai para `ERROS.md` seção 6 e `modo-panico.tsx`, como já fez o refinamento anterior.
- [ ] **Passo 3: verde** com a suíte (`tests/sintatico`, `arvore`, `json` e o `invalido.flux` inalterados). **Documentar** o que mudou ou o que foi tentado com os números (`ERROS.md` seção 6, `modo-panico.tsx`, `parser.tsx`, `TAREFAS.md`). Commit: `fix: recuperação do pânico (medida)` ou `docs: medição do pânico (nada aplicado)` conforme o resultado.

### Task 6: Texto da documentação

**Arquivos:** `web/src/docs/pages/compilador/linha-de-comando.tsx`, `docs/ERROS.md`, e as páginas que ainda descrevem como "comportamento atual" o que as Tasks 1 a 5 corrigiram; `docs/TAREFAS.md`.

- [ ] **Passo 1:** os dois ajustes que sobraram da revisão final: `linha-de-comando.tsx:26` (a árvore só sai quando o texto solto termina em `;` ou bloco; sem `;`, a recuperação engole o próximo `{`) refeito com a realidade depois da Task 5; a linha "Bloco não fechado" de `docs/ERROS.md` (~128) com `Esperado: comando ou '}'`.
- [ ] **Passo 2:** varredura: `grep -rn "comportamento atual\|o compilador atual" web/src/docs` e, para cada ocorrência cujo comportamento foi corrigido, reescrever como regra; as que continuam valendo (promoção em argumentos, curto-circuito, etc., que o usuário ainda não ratificou) ficam como estão. Conferir `visao-geral`, `mapa-e-build`, `referencia`, `erros` para contadores (E24/E25, R1 a R7, número de casos da suíte, número de páginas).
- [ ] **Passo 3:** `docs/TAREFAS.md`: marcar os itens resolvidos, deixar abertos os que não entraram (as lacunas do README, a thread de 64 MB, o `asm`, a interface). `cd web && npx tsc -b && npm run build`, gates, passeio pelas páginas alteradas no navegador. Commit: `docs: texto do manual depois das correções do compilador`.

---

## Revisão contra o pedido

- Quatro grupos do escopo: Tasks 1 e 2 (geração e execução), 3 (compilador e linha de comando), 4 (globais), 5 (pânico). Texto: Task 6 e o passo "documentar" de cada tarefa.
- Decisões do usuário: R7 para o objeto cíclico (Task 2), recusa do `--build` (Task 3), E25 (Task 4), medir primeiro (Task 5).
- Fora do escopo (continuam em TAREFAS.md): as lacunas do README (promoção em argumentos, curto-circuito, parâmetros reatribuíveis, chave repetida, `toInt(" 42")`, campo intermediário, `[[1],[2.5]]`, AST em "Em aberto"), a thread de 64 MB só no Windows, o `asm` do coletor, `ação` com um L1 por caractere, e os itens de interface e documentação.
