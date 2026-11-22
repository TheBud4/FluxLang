# Documentação da FluxLang na interface web: plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam caixas `- [ ]`.

**Objetivo:** uma aba "Documentação" na interface web com o manual da linguagem e a referência do compilador, e a remoção dos comentários do código depois que cada "porquê" estiver na página.

**Arquitetura:** `App` ganha uma visão `editor | docs`, escolhida pelo `location.hash`. A visão `docs` é uma página cheia (menu, texto, "Nesta página", busca) que desenha páginas escritas em componentes TSX, montadas com blocos reutilizáveis. Cada página vive em `web/src/docs/pages/<secao>/` e é registrada num índice; menu, busca e "Nesta página" saem do próprio conteúdo.

**Tecnologias:** React 19, Tailwind 4 (tokens de `web/src/index.css`), TypeScript, Vite. Sem biblioteca de rotas, de Markdown ou de testes novas.

**Spec:** `docs/specs/2026-11-15-documentacao-web-design.md`

## Restrições globais

- Rota: `#/doc/<secao>/<slug>`, `secao` é `linguagem` ou `compilador`. Sem biblioteca de rotas.
- O estado do editor (código, entrada, resultado) não se perde ao ir e voltar.
- Cores só por tokens de `web/src/index.css` (`bg-panel`, `text-ink`, `text-muted`, `border-line`, `text-accent`, `text-ok`, `text-bad`, `text-warn`, `text-info`); nenhum valor solto. Tema pelo `prefers-color-scheme`.
- Código em `font-mono`, sem ligaduras (já no CSS).
- Sem emoji e sem travessão longo no texto da interface; texto em português.
- Abaixo de `lg`, o menu vira uma gaveta aberta por um botão.
- Acessibilidade: marcos `nav`/`main`, foco no título ao trocar de página, busca como diálogo, rolagem alcançável pelo teclado. Devem passar `verify_states`, `axe_audit` (claro e escuro), `verify_target_size` e `verify_keyboard` (ver "Interface web" em `AGENTS.md`, seção Armadilhas).
- Exemplos de FluxLang do manual: `./flux` os aceita (ou, nos exemplos de erro, os rejeita com a mensagem real). A conferência é um roteiro descartável no scratchpad, fora do repositório.
- Os comentários só saem de um arquivo depois que sua página está escrita e conferida. Ficam: `docs/BNF.txt`, `Makefile`, `tests/run.sh`, diretivas com função (`// @ts-expect-error`, `eslint-disable`, `#line`, `%{ %}`) e texto de string que pareça comentário.
- Commits por etapa, sem `Co-Authored-By` nem qualquer atribuição.
- Não mudar comportamento do compilador nem da linguagem; `docs/BNF.txt` não se toca.
- Não há teste automático da documentação (decisão do usuário).

## Foco da revisão

Entradas e falhas que o desenho implica e que nenhuma tarefa exercita sozinha. Cada uma tem sua verificação na tarefa dona.

1. Hash desconhecido (`#/doc/x/y`) ou `#/doc` sem página: abrir a primeira página, sem tela em branco (Tarefa 1).
2. Voltar e Avançar do navegador entre Editor e Documentação: o código digitado continua lá (Tarefa 1).
3. Busca sem resultado, com maiúsculas e sem acentos (`FUNCAO` acha "Funções"), e Esc devolvendo o foco a quem abriu (Tarefa 2).
4. Tela estreita: gaveta abre, fecha ao escolher uma página e libera o foco (Tarefa 2).
5. Remoção de comentários: `//` e `/*` dentro de strings, regex e padrões do flex continuam intactos; o código só perde comentários (Tarefas 6 a 12).

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `web/src/docs/types.ts` | `DocPage`, `DocSection` |
| `web/src/docs/registry.ts` | `PAGES`, `findPage`, `neighbors` |
| `web/src/docs/pages/linguagem/index.ts`, `.../compilador/index.ts` | listas ordenadas de páginas de cada seção |
| `web/src/docs/pages/<secao>/<slug>.tsx` | uma página (`export const page: DocPage`) |
| `web/src/docs/blocks.tsx` | `H2`, `H3`, `P`, `Code`, `Table`, `Callout`, `Why`, `Fn`, `Diagram`, `PageLink` |
| `web/src/docs/highlight.ts` | `highlight(lang, code): Span[]` |
| `web/src/docs/DocsContext.tsx` | `DocsProvider`, `useDocs` |
| `web/src/docs/useHashRoute.ts` | leitura e escrita do `location.hash` |
| `web/src/docs/DocsView.tsx`, `DocsNav.tsx`, `DocsToc.tsx`, `DocsSearch.tsx` | a tela |
| `web/src/docs/searchIndex.ts` | `normalize`, `buildIndex`, `search` |
| `web/src/App.tsx`, `components/TopBar.tsx` | alternância de visão |

## Procedimento das tarefas de conteúdo (T3 a T12)

Cada uma dessas tarefas segue estes passos (a tarefa lista as fontes, as páginas e os arquivos de que se tiram comentários):

- [ ] **P1.** Ler as fontes (trechos do `README.md`/`ERROS.md` ou os arquivos de código **com os comentários**).
- [ ] **P2.** Escrever cada página em `pages/<secao>/<slug>.tsx` com os blocos, e registrá-la no `index.ts` da seção. Todo comentário de "porquê" do código vira um `<Why>` na página do módulo, citando o arquivo.
- [ ] **P3.** Exemplos de FluxLang: rodar `./flux` em cada um (roteiro no scratchpad) e confirmar aceito/rejeitado e a mensagem.
- [ ] **P4.** Só nas tarefas do compilador: tirar os comentários dos arquivos listados (roteiro descartável no scratchpad que respeita strings, caracteres e padrões). Conferir `git diff`: toda linha removida é comentário ou ficou em branco por causa dele.
- [ ] **P5.** Verificar: `cd web && npx tsc -b && npm run build` sem erro; nas tarefas que mexem em C/`.y`/`.l`, `make clean && make && bash tests/run.sh` deve terminar em `203 passaram, 0 falharam.`; abrir `http://127.0.0.1:5173/#/doc/<secao>/<slug>` (`make web`) e ver a página em claro e escuro.
- [ ] **P6.** Commitar a etapa (mensagem em português, sem atribuição).

---

### Task 1: Casca da documentação

**Arquivos:**
- Criar: `web/src/docs/{types.ts,registry.ts,blocks.tsx,highlight.ts,DocsContext.tsx,useHashRoute.ts,DocsView.tsx,DocsNav.tsx}`, `web/src/docs/pages/linguagem/{index.ts,introducao.tsx}`, `web/src/docs/pages/compilador/index.ts`
- Modificar: `web/src/App.tsx`, `web/src/components/TopBar.tsx`

**Interfaces:**
- Produz:
  - `type DocSection = 'linguagem' | 'compilador'`
  - `interface DocPage { id: string /* 'linguagem/introducao' */; section: DocSection; title: string; summary: string; Component: () => ReactNode }`
  - `PAGES: DocPage[]` (linguagem antes de compilador); `findPage(id: string): DocPage | undefined`; `neighbors(id: string): { prev?: DocPage; next?: DocPage }`
  - `useHashRoute(): { view: 'editor' | 'docs'; pageId: string; goDoc(id: string): void; goEditor(): void }`: `#/doc/<id>` → `docs`; qualquer outro hash → `editor`; `#/doc` ou id desconhecido → `docs` com `PAGES[0].id` (o hash é reescrito com `replace`, sem nova entrada no histórico)
  - `useDocs(): { openInEditor(text: string): void }`
  - Blocos (todos recebem `children`): `H2({title})`, `H3({title})` (id = `slugify(title)`, com âncora), `P`, `Code({lang: 'flux'|'c'|'ts'|'bash'|'text', example?: boolean, children: string})` (botão "Copiar" sempre; "Abrir no editor" quando `example`), `Table({head: string[], rows: ReactNode[][]})`, `Callout({kind: 'nota'|'aviso'})`, `Why` (caixa "Por quê"), `Fn({name: string, signature: string})` (entrada de referência), `Diagram({title: string, label: string})`, `PageLink({to: string})`
  - `highlight(lang, code): { text: string; cls?: 'kw'|'type'|'str'|'num'|'cmt'|'fn' }[]`; para `flux`, as palavras vêm de `tools/vscode-fluxlang/syntaxes/fluxlang.tmLanguage.json` (repositórios `keywords`, `types`, `constants`, `library`, `declarations`); as classes se mapeiam em tokens de cor (`kw`→`text-accent`, `str`→`text-ok`, `num`→`text-warn`, `type`→`text-info`, `cmt`→`text-muted`).
- Consome: `TopBar` ganha `view: 'editor'|'docs'` e `onView(v)`.

- [ ] **Passo 1:** em `TopBar.tsx`, adicionar duas abas "Editor" e "Documentação" (`role="tablist"`/`tab`, `aria-selected`). Na visão `docs`, esconder Abrir arquivo, Compilar, Executar, exemplos e a chave semântica; manter o status à direita só na visão `editor`.
- [ ] **Passo 2:** `useHashRoute.ts` e `registry.ts` com as regras acima; `App.tsx` usa `useHashRoute` e renderiza `DocsView` (dentro de `DocsProvider`, cujo `openInEditor` faz `setSource(text)` e `goEditor()`) ou o `<main>` atual. O `<main>` do editor **continua montado** quando a visão é `docs` (escondido com `hidden`), para o estado do editor, a saída e o cursor não se perderem.
- [ ] **Passo 3:** `blocks.tsx`, `highlight.ts`, `DocsView.tsx` (grade: menu `DocsNav` à esquerda, `<main>` com título, corpo e rodapé Anterior/Próxima; foco movido para o `<h1>` da página ao trocar de id) e a página `introducao.tsx` (primeiro programa com `Code example`).
- [ ] **Passo 4:** `cd web && npx tsc -b && npm run build`; esperado: sem erro.
- [ ] **Passo 5:** `make web`, no navegador: alternar as abas; digitar algo no editor, ir à Documentação, apertar Voltar e Avançar do navegador: o texto continua. Abrir `#/doc/xyz/abc`: cai na primeira página sem tela em branco. "Abrir no editor" troca o código e volta à aba Editor.
- [ ] **Passo 6:** commit: `feat(web): aba Documentação com rota por hash, blocos e primeira página`.

### Task 2: Nesta página, busca, gaveta e acessibilidade

**Arquivos:**
- Criar: `web/src/docs/{DocsToc.tsx,DocsSearch.tsx,searchIndex.ts}`
- Modificar: `DocsView.tsx`, `DocsNav.tsx`

**Interfaces:**
- Produz: `normalize(s: string): string` (minúsculas, sem acentos); `buildIndex(pages: DocPage[]): { id: string; title: string; text: string }[]` (renderiza cada `Component` com `renderToStaticMarkup` de `react-dom/server`, na primeira abertura da busca, e tira as tags); `search(index, query: string): { id: string; title: string; snippet: string }[]` (todas as palavras da consulta presentes, título pesa mais).
- Consome: `PAGES` (Tarefa 1).

- [ ] **Passo 1:** `DocsToc.tsx`: lê `h2, h3` do corpo da página (`querySelectorAll` após cada troca de página) e realça o item da seção visível (`IntersectionObserver`). Escondido abaixo de `xl`.
- [ ] **Passo 2:** `DocsSearch.tsx`: diálogo (`role="dialog"`, `aria-modal`), aberto por Ctrl+K e por um botão "Buscar" no topo da visão; setas e Enter escolhem; Esc fecha e devolve o foco a quem o abriu; sem resultado mostra "Nenhum resultado para ...".
- [ ] **Passo 3:** gaveta do menu abaixo de `lg`: botão "Menu" no topo da visão; abrir move o foco para o primeiro link; escolher uma página fecha a gaveta e devolve o foco; Esc fecha.
- [ ] **Passo 4:** `npx tsc -b && npm run build`; depois, no navegador: busca por `PRIMEIRO` e `primeiro` acham "Introdução"; `zzzz` mostra "Nenhum resultado"; em 375 px de largura a gaveta abre, fecha ao escolher e o foco volta ao botão.
- [ ] **Passo 5:** rodar `verify_states`, `axe_audit` (claro e escuro), `verify_target_size` e `verify_keyboard` na visão Documentação; todos devem passar.
- [ ] **Passo 6:** commit: `feat(web): índice da página, busca Ctrl+K e menu em gaveta na documentação`.

---

### Task 3: Linguagem 1/3: introdução, estrutura, tipos, listas e objetos, operadores

**Fontes:** `README.md` seções 1, 2, 3 (operadores e precedência). **Páginas** (`pages/linguagem/`): `introducao` (já existe, completar), `estrutura`, `tipos`, `listas-objetos`, `operadores`. Seguir P1 a P3, P5, P6 (sem P4).

### Task 4: Linguagem 2/3: controle de fluxo, funções, workflows, `call`/`run`/erros, biblioteca

**Fontes:** `README.md` seções 3 (controle de fluxo), 4, 5, 6. **Páginas:** `controle-de-fluxo`, `funcoes`, `workflows`, `call-run-erros`, `biblioteca`. Seguir P1 a P3, P5, P6.

### Task 5: Linguagem 3/3: regras léxicas e semânticas, catálogo de erros, exemplo integrado, escopo da v1

**Fontes:** `README.md` seções 7, 8, 10, Escopo da v1; `docs/ERROS.md` seções 1 a 4, 7. **Páginas:** `regras-lexicas`, `regras-semanticas`, `erros` (L1 a L6, S1 a S3, E1 a E24, R1 a R7, cada um com causa, exemplo e a mensagem real), `exemplo-integrado`, `escopo-v1`. Os exemplos de erro são rodados com `./flux` e a mensagem copiada da saída. Seguir P1 a P3, P5, P6.

### Task 6: Compilador 1/9: visão geral, mapa do repositório, linha de comando e arena

**Fontes:** `AGENTS.md` (mapa, flags, variáveis), `README.md` seção 9, `src/main.c`, `src/fluxc.h`, `src/util/mem.c`, `src/util/mem.h`. **Páginas** (`pages/compilador/`): `visao-geral` (com `Diagram` do caminho texto → tokens → árvore → AST → C → executável), `mapa-e-build`, `linha-de-comando` (todas as flags do `./flux`; todas as `FLUX_*`, `NO_COLOR`, `FORCE_COLOR`), `arena`. **Tirar comentários de:** `src/main.c`, `src/fluxc.h`, `src/util/mem.c`, `src/util/mem.h`. Seguir P1 a P6.

### Task 7: Compilador 2/9: léxico, parser e modo pânico

**Fontes:** `src/frontend/lexer.l`, `src/frontend/parser.y`, `docs/ERROS.md` seções 5 e 6, `docs/BNF.txt` (só leitura). **Páginas:** `lexico`, `parser` (forma uniforme das ações, S3 e o campo `flag`, `yyreport_syntax_error` e as listas `EXPRESSION_START`/`TYPE_START`/`COMMAND_KEYWORDS`), `modo-panico`. **Tirar comentários de:** `src/frontend/lexer.l` e `src/frontend/parser.y` (cuidado com padrões do flex que contêm `/*` e `//`). Seguir P1 a P6.

### Task 8: Compilador 3/9: árvore, `--json` e AST

**Fontes:** `src/frontend/tree.{c,h}`, `src/json.c`, `src/semantic/ast.{h,c}`, `src/semantic/ast_build.c`. **Páginas:** `arvore-json`, `ast` (cada nó e `Fn` para cada função pública). **Tirar comentários de:** os mesmos cinco arquivos mais `tree.h`/`ast.h`. Seguir P1 a P6.

### Task 9: Compilador 4/9: tipos e análise semântica

**Fontes:** `src/semantic/types.{c,h}`, `src/semantic/sema.c`, `docs/ERROS.md` seção 4. **Páginas:** `tipos-internos`, `semantica` (as três passadas, pilha de escopos, estado de fluxo de E3/E20, uma entrada por função). **Tirar comentários de:** `types.c`, `types.h`, `sema.c`. Seguir P1 a P6.

### Task 10: Compilador 5/9: gerador de C

**Fontes:** `src/backend/codegen_c.c`. **Páginas:** `gerador-c` (cada construção da linguagem e o C que ela vira, temporários, `&&`/`||`, ordem de avaliação). **Tirar comentários de:** `codegen_c.c`. Seguir P1 a P6.

### Task 11: Compilador 6/9: biblioteca de execução e coletor de lixo

**Fontes:** `src/backend/runtime/flux_rt.h`, `docs/ERROS.md` seções 7 e as de coletor/Windows. **Páginas:** `runtime` (`FxValue`, operadores, `run`, `terminal`, R1 a R7, POSIX × Windows), `coletor` (marca e varre, raízes, pilha conservadora, `fx_gc_find`, salvamento de registradores no Windows, `FLUX_GC*`). Todo comentário de plataforma ou de compilador (gcc × clang) entra num `<Why>`. **Tirar comentários de:** `flux_rt.h`; depois da remoção, `./flux --c` imprime a biblioteca sem comentários e a suíte inclusive nas passadas de estresse e Windows deve passar. Seguir P1 a P6.

### Task 12: Compilador 7/9: interface web

**Fontes:** `web/src/**`, `web/server/**`, `web/index.html`, `web/vite.config.ts`. **Páginas:** `interface-web` (componentes, hooks `useCompile`/`useRun`, a API `/api/compile` e `/api/run`, formato etiquetado `\x1e<tipo><bytes>:<texto>`, segurança do Executar: Host, Origin e `X-Flux-Run`). **Tirar comentários de:** os arquivos listados, **exceto** `web/src/docs/` (já nasceu sem comentário) e as diretivas com função. Verificação extra: `npx tsc -b` e `npm run build`. Seguir P1 a P6.

### Task 13: Compilador 8/9: referência por arquivo (camada resumida)

**Fontes:** todos os arquivos de `src/`, `flux_rt.h`, `web/src`, `web/server`. **Página:** `referencia` (uma seção por arquivo; cada função `static` ou auxiliar em uma linha com `Fn`; as não óbvias com texto próprio). Conferência de cobertura com roteiro descartável: toda função definida (`ctags`/`grep`) aparece em alguma página do compilador; listar as faltantes e preenchê-las. Seguir P1, P2, P5, P6.

### Task 14: Fechamento

**Arquivos:** `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/TAREFAS.md`, `.gitignore`

- [ ] **Passo 1:** `README.md`: um parágrafo apontando para a aba Documentação da interface (o README continua sendo a especificação, o manual explica e os dois devem bater).
- [ ] **Passo 2:** `AGENTS.md` e `CLAUDE.md`: regra nova ("o código não leva comentário; a explicação vai na página de documentação correspondente em `web/src/docs/pages/`") e o manual na lista "Docs que devem ficar consistentes". `docs/TAREFAS.md`: marcar o item.
- [ ] **Passo 3:** `.gitignore`: acrescentar `.superpowers/`. Perguntar ao usuário se `.impeccable/` também entra ou se o `config.json` é versionado.
- [ ] **Passo 4:** varredura final: `grep -rnE '^\s*(//|/\*|\*)' src web/src web/server` não deve achar nada além do permitido; `make clean && make && bash tests/run.sh` termina em `203 passaram, 0 falharam.`; `cd web && npx tsc -b && npm run build` sem erro; os gates de acessibilidade do Passo 5 da Tarefa 2 repetidos com todas as páginas.
- [ ] **Passo 5:** commit: `docs: README, AGENTS e CLAUDE apontam para o manual; fecha a documentação na interface`.

---

## Revisão contra o spec

- Aba, layout A, menu/texto/"Nesta página"/busca: Tarefas 1 e 2.
- Linguagem (15 itens do spec): as páginas se espalham por Tarefas 3 a 5 (`introducao`, `estrutura`, `tipos`, `listas-objetos`, `operadores`, `controle-de-fluxo`, `funcoes`, `workflows`, `call-run-erros`, `biblioteca`, `regras-lexicas`, `regras-semanticas`, `erros`, `exemplo-integrado`, `escopo-v1`).
- Compilador (15 itens do spec): Tarefas 6 a 13 (`visao-geral`, `mapa-e-build`, `linha-de-comando`, `lexico`, `parser`, `modo-panico`, `arvore-json`, `ast`, `tipos-internos`, `semantica`, `gerador-c`, `runtime`, `coletor`, `arena`, `interface-web`, `referencia`).
- Remoção dos comentários e caixas "Por quê": P2 e P4 em cada tarefa do compilador; varredura final na Tarefa 14.
- Camadas (profundidade nos módulos, resumo nos auxiliares): Tarefas 6 a 12 e 13.
- Ordem do trabalho e um commit por etapa: a numeração e o último passo de cada tarefa.
