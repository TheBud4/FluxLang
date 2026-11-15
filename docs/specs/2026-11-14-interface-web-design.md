# Interface web do compilador FluxLang (Trabalho 2)

## Intenção

O Trabalho 2 exige uma interface que exiba o código, a contagem de linhas, os
tokens reconhecidos, o texto de aceitação ou rejeição, as mensagens de erro e
a árvore sintática. O realce visual das linhas com erro vale ponto extra. A
interface será mostrada na apresentação de 26/11, então tudo precisa estar
visível de uma vez, sem cliques para trocar de painel.

## Objetivos

- Abrir um arquivo `.flux` (ou digitar), compilar e ver o resultado.
- Mostrar, ao mesmo tempo: código com numeração, tokens, árvore, aceito ou
  rejeitado, contagem de linhas e lista de erros.
- Realçar no código as linhas com erro; clicar num erro, token ou nó da
  árvore leva à linha correspondente.
- Árvore fiel à gramática LL(1), com opção de ocultar os nós `*_rest`.

## Não objetivos

- Editor completo (realce de sintaxe, desfazer avançado, vários arquivos).
- Salvar arquivos pelo servidor, autenticação, uso fora do `localhost`.
- Geração de código ou execução do programa FluxLang.

## Decisões do usuário

- Layout **A**: três colunas (Código, Tokens, Árvore) e uma faixa de erros
  embaixo, com a barra de topo (Abrir arquivo, Compilar, aceito ou rejeitado,
  linhas e erros).
- Ocultar os nós `*_rest` é uma opção da interface; a saída `--json` continua
  fiel à gramática.

## Abordagens consideradas

1. **Vite + React + Tailwind (escolhida pelo usuário).** Um plugin do Vite
   expõe `POST /api/compile`, que roda `./flux --json` com o código na entrada
   padrão (a primeira versão previa HTML puro e um servidor Python; o usuário
   pediu Vite, React e Tailwind numa pasta própria).
2. **Página estática que carrega um JSON pronto.** Mais simples, mas não
   compila o que o usuário digita; não serve para a demonstração.
3. **Compilar o `flux` para WebAssembly.** Roda no navegador sem servidor, mas
   é um desvio grande do prazo e exige toolchain extra.

## Desenho (escolhas do agente, para o usuário corrigir)

- **Arquivos:** projeto Vite em `web/` (`src/` em React + TypeScript, Tailwind
  v4, `server/flux-api.ts`).
- **Servidor:** o próprio Vite (`make web`), escuta só em `127.0.0.1`, executa `./flux --json` com limite de tamanho (1 MB) e de tempo
  (5 s). Se o `./flux` não existir, a página avisa para rodar `make`.
- **Editor:** `textarea` sem quebra de linha, com calha de numeração e uma
  camada atrás que pinta as linhas com erro (rolagem sincronizada). Compila ao
  clicar em Compilar e, sozinho, 400 ms depois de parar de digitar.
- **Tokens:** tabela `linha:coluna`, tipo e texto; clicar seleciona o trecho no
  código.
- **Árvore:** nós recolhíveis, com Expandir tudo e Recolher tudo. A opção
  "ocultar `*_rest`" remove os nós cujo nome termina em `_rest` ou
  `_after_comma`, sobe os filhos deles para o pai e esconde as folhas ε. Nós
  `error` aparecem em vermelho. Clicar num nó leva à linha dele.
- **Erros:** lista com tipo (léxico ou sintático), `linha:coluna` e mensagem
  (as duas linhas "Token encontrado" e "Esperado"); clicar leva à linha.
- **Aparência:** cores definidas como variáveis no `:root`, com tema claro e
  escuro pelo `prefers-color-scheme`. Em telas estreitas as colunas empilham.
  Cada painel rola sozinho.

## Verificação

Abrir a página num navegador de verdade com `valido.flux` (aceito, 0 erros) e
`invalido.flux` (7 erros, linhas realçadas) e conferir os painéis e as capturas
de tela; rodar `make test` para garantir que o `--json` não mudou.

## Fica para quem constrói

Detalhes de espaçamento e tipografia, o texto exato dos botões e como destacar
o item selecionado.
