# Documentação da FluxLang dentro da interface web

Desenho de 15/11/2026. Status: aguardando aprovação.

**Prazo:** tudo pronto antes de 26/11/2026 (Trabalho 2), inclusive a remoção dos
comentários, escolha do usuário. Por isso a referência do compilador é em
camadas (ver "O que é completo").

## Intenção

Hoje o conhecimento sobre o código está espalhado em cerca de 570 linhas de
comentário nos fontes (`src/`, `flux_rt.h`, `web/`), e o conhecimento sobre a
linguagem está no `README.md` e no `docs/ERROS.md`, fora da interface. O pedido
do usuário: uma documentação **completa, como a de um projeto de código de
verdade**, dentro da própria página web, que **substitua os comentários**, que
saem do código.

Quem lê:

- **Quem está aprendendo a escrever em FluxLang.** Precisa de um manual da
  linguagem com exemplos que possa copiar e abrir no editor.
- **O grupo que mantém o compilador.** Precisa de uma referência do código:
  módulos, arquivos, funções, estruturas, fluxo de dados e o porquê das
  decisões não óbvias.

## Metas

1. Uma aba "Documentação" na barra do topo, ao lado do Editor, que ocupa a tela
   toda (opção A escolhida pelo usuário): menu à esquerda, texto no meio, "Nesta
   página" à direita, busca no topo (Ctrl+K).
2. Duas partes no menu: **Linguagem** e **Compilador**.
3. Cobertura completa (definida na seção "O que é completo").
4. Os exemplos da parte da linguagem têm "Copiar" e "Abrir no editor".
5. Todos os comentários de `src/`, `src/backend/runtime/flux_rt.h` e `web/`
   saem do código, sem perder nenhuma informação: cada comentário de "porquê"
   vira uma caixa "Por quê" na página do módulo correspondente.

## Fora do escopo

- Ligar mensagens de erro, tokens ou nós da árvore à documentação (a opção C
  mostrada ao usuário foi recusada). A única ponte entre as duas telas é o
  "Abrir no editor" dos exemplos.
- Teste automático que confira se a documentação cobre o código (o usuário
  dispensou).
- Mudar a linguagem, a gramática ou o comportamento do compilador.
- Tocar em `docs/BNF.txt` (somente leitura), no `Makefile` e no `tests/run.sh`
  (configuração, os comentários ficam).
- Servir a documentação fora da interface (site estático, PDF).

## Antimetas

- Perder um "porquê" ao apagar um comentário. Sem a explicação na página, o
  trabalho falhou, mesmo com tudo funcionando.
- Duas versões diferentes da mesma regra da linguagem (o `README.md` e o manual
  contradizendo-se).
- Mudar o comportamento do compilador ao tirar comentários.

## Restrições

- Fica em `web/` (Vite + React 19 + Tailwind 4, TypeScript). O texto é escrito
  em **componentes React (TSX)**, escolha do usuário, e não em Markdown.
- Cores só pelos tokens de `web/src/index.css` (`bg-panel`, `text-ink`,
  `text-muted`, `border-line`, `text-accent`...); nada de valor solto. Tema
  claro e escuro seguem `prefers-color-scheme`.
- Código sempre em `font-mono` e sem ligaduras (já definido no CSS).
- Acessibilidade como no resto da interface: marcos (`nav`, `main`), foco
  indo para o título ao trocar de página, busca como diálogo acessível,
  alvos de toque grandes, rolagem alcançável pelo teclado. As verificações
  usadas no projeto (`verify_states`, `axe_audit` em claro e escuro,
  `verify_target_size`, `verify_keyboard`) devem passar.
- Layout responsivo: abaixo de `lg`, o menu vira uma gaveta aberta por um botão.
- Sem emoji e sem travessão longo no texto da interface (o projeto tem hooks
  que os recusam).
- Idioma: português na documentação; nomes de código em inglês como estão.
- Regra do projeto: uma decisão da linguagem precisa aparecer de forma
  consistente no README, ERROS.md, exemplos e manual. O manual passa a ser
  mais um lugar a manter igual.
- Os comentários só saem **depois** que a página correspondente estiver escrita
  e conferida com o código. A ordem por arquivo é: ler o comentário, escrever
  a página, conferir, só então apagar.

## Abordagens consideradas

| | Como | Troca |
|---|---|---|
| **Markdown renderizado** | páginas em `.md`, desenhadas por uma biblioteca | fácil de editar; dependência nova. Recomendada pelo assistente, **recusada**. |
| **Componentes TSX (escolhida)** | cada página é um componente | permite exemplos interativos e controle total da tela; texto longo dentro de JSX é mais trabalhoso de editar. |
| **Reaproveitar README e ERROS.md** | renderizá-los e acrescentar só o compilador | menos escrita, mas duas fontes da verdade; descartada. |

O usuário escolheu os **componentes TSX**.

## Desenho

### Navegação e estado

- `App` ganha uma visão ativa: `editor` ou `docs`. A aba da barra do topo
  alterna entre elas. O estado do editor (código, entrada, resultado) **não
  se perde** ao ir para a documentação e voltar.
- A página aberta fica na URL (`#/doc/linguagem/funcoes`), então o botão
  Voltar, os links e um endereço copiado funcionam. Sem biblioteca de rotas:
  basta ler e escrever `location.hash`.
- "Abrir no editor" troca o código do editor pelo do exemplo e volta para a
  aba Editor.

### Peças da tela

- Menu: duas seções com as páginas, destacando a atual.
- Corpo: título, texto, blocos de código, tabelas, avisos e caixas "Por quê".
  Cada página tem um caminho "Linguagem › Funções e workflows" no topo e
  "Anterior / Próxima" no rodapé.
- "Nesta página": lista dos títulos `h2/h3` da página, com o item da seção
  visível realçado.
- Busca (Ctrl+K): procura no título e no texto de todas as páginas e abre a
  escolhida. O índice de busca é montado a partir do próprio conteúdo das
  páginas, sem manter uma segunda cópia à mão.
- Blocos reutilizáveis: título com âncora, bloco de código (com "Copiar" e,
  quando for exemplo, "Abrir no editor"; as cores de FluxLang seguem a
  gramática de `tools/vscode-fluxlang`), tabela, aviso, caixa "Por quê",
  diagrama (SVG).

### Conteúdo

**Linguagem** (para quem aprende), com o assunto que hoje está no README:

1. Introdução e primeiro programa
2. Estrutura do programa (`main`, ordem das declarações)
3. Tipos, variáveis e constantes
4. Listas e objetos
5. Operadores e precedência
6. Controle de fluxo (`if`, `while`, `for`, `break`, `continue`)
7. Funções
8. Workflows
9. `call`, `run` e tratamento de erros (`stop`, `abort`, `proceed`)
10. Biblioteca (`terminal`, conversões)
11. Regras léxicas
12. Regras semânticas
13. Catálogo de erros: léxicos L1 a L6, sintáticos S1 a S3, semânticos E1 a E24,
    de execução R1 a R7, com a causa, um exemplo e a mensagem de cada um
14. Exemplo integrado
15. Escopo da v1 e o que ficou de fora

**Compilador** (para o grupo):

1. Visão geral: o caminho de um programa, do texto ao executável, com diagrama
2. Mapa do repositório e como construir/testar (`make`, `tests/run.sh`)
3. Linha de comando e variáveis de ambiente (todas as flags do `./flux`, todas
   as `FLUX_*`, `NO_COLOR`/`FORCE_COLOR`)
4. Léxico (`lexer.l`): tokens, posição, erros L1 a L6
5. Parser (`parser.y`): a gramática LL(1), a forma uniforme das ações, S3,
   as mensagens de erro (`yyreport_syntax_error`)
6. Modo pânico e recuperação de erros
7. Árvore de derivação (`tree.c`) e `--json` (`json.c`)
8. AST (`ast.h`, `ast.c`, `ast_build.c`)
9. Tipos (`types.c`) e análise semântica (`sema.c`): as três passadas, escopos,
   estado de fluxo para E3/E20
10. Gerador de C (`codegen_c.c`): como cada construção vira C, temporários,
    ordem de avaliação
11. Biblioteca de execução (`flux_rt.h`): `FxValue`, operadores, `run`,
    terminal, erros R1 a R7, versões POSIX e Windows
12. Coletor de lixo: algoritmo, raízes, os detalhes de plataforma e de
    compilador
13. Memória do compilador (`mem.c`, arena)
14. Interface web: componentes, hooks, a API (`/api/compile`, `/api/run`),
    segurança do Executar
15. Referência por arquivo: para cada arquivo de `src/` e de `web/`, cada
    função, estrutura e enumeração (assinatura, o que faz, parâmetros,
    retorno, efeitos colaterais, quem chama)

### O que é "completo"

A documentação do compilador está completa quando:

- **Camada 1, escrita com profundidade** (páginas 1 a 14 do menu): léxico,
  parser, pânico, árvore e `--json`, AST, tipos e semântica, gerador de C,
  `flux_rt.h`, coletor, arena e interface web. Cada função **pública** (não
  `static`, ou declarada em cabeçalho) e cada estrutura, enumeração e macro
  relevante aparece com assinatura, o que faz, parâmetros, retorno e efeitos.
- **Camada 2, resumida** (página 15, referência por arquivo): as funções
  `static` e auxiliares ganham uma linha cada (nome, assinatura, propósito),
  agrupadas por arquivo. Só as que carregam uma regra não óbvia recebem texto
  próprio.
- Toda flag do `./flux`, variável de ambiente, rota da API e código de erro
  (L1 a L6, S1 a S3, E1 a E24, R1 a R7) está descrito.
- Todo arquivo de `src/`, `flux_rt.h`, `web/src` e `web/server` aparece em
  alguma página ou na referência.
- Cada comentário de "porquê" apagado tem sua caixa "Por quê" no módulo certo,
  **sem exceção** (é o que a camada resumida nunca pode deixar cair).

A documentação da linguagem está completa quando cada construção e cada regra
do README e do ERROS.md tem sua página, com pelo menos um exemplo que o
compilador aceita (os de erro, um exemplo que o compilador rejeita com a
mensagem real).

Os exemplos de FluxLang do manual são confirmados rodando `./flux` neles
(aceito/rejeitado/saída), uma vez, na hora de escrever. Essa conferência é um
roteiro descartável, não um teste do repositório.

### Remoção dos comentários

- **Sai:** comentários de linha e de bloco de `src/**/*.{c,h,y,l}`,
  `src/backend/runtime/flux_rt.h` e `web/src`, `web/server`, `web/index.html`,
  `web/vite.config.ts`.
- **Fica:** diretivas e sintaxe que parecem comentário mas têm função (marcas
  como `/* ... */` dentro de uma string, `// @ts-expect-error`,
  `eslint-disable`, `#line`, `%{ ... %}` do flex e do bison); o `Makefile`,
  `tests/run.sh`, `docs/BNF.txt`; os comentários das gramáticas que o próprio
  bison/flex exige para as seções.
- **Prova de que nada mudou:** `make clean && make && bash tests/run.sh`
  (203 casos) e `npx tsc --noEmit`; a saída do compilador não muda, exceto
  que o `flux --c` imprime a biblioteca sem comentários.
- Regra nova no `AGENTS.md`: o código não leva comentário; a explicação vai
  para a página de documentação correspondente.

### Escolhas do assistente (conferir)

- **Sem "Executar" no manual:** os exemplos só têm "Copiar" e "Abrir no
  editor". Rodar dentro da documentação exigiria painel de saída, estado de
  execução e tratamento de entrada próprios, e o editor já executa. (Retirado
  depois da revisão do desenho.)
- **README:** continua como está, acrescido de um parágrafo apontando para a
  aba Documentação da interface. A fonte da regra continua o README; o manual
  é a explicação completa e deve ficar igual a ele.
- **Busca:** apenas pelo texto; sem distinguir maiúsculas e sem acentos.
- **Ordem do trabalho (cabe em 11 dias):** primeiro a casca (aba, rota por hash, menu, busca,
  blocos); depois a parte da linguagem; depois a do compilador em ordem de
  fluxo; em cada arquivo, escrever a página e só depois apagar os comentários.
- **Commits:** um por etapa (casca; linguagem; cada grupo de módulos com a
  remoção dos comentários correspondentes), sem `Co-Authored-By`.

## Deixado ao construtor

- Como montar o índice de busca a partir de páginas TSX.
- Como realçar FluxLang nos blocos de código (a gramática do VS Code pode
  servir de base).
- Se o conteúdo vive em um arquivo por página ou por seção.
- O desenho visual dos blocos (aviso, "Por quê", tabela), dentro dos tokens.
- Os diagramas (SVG feito à mão).
