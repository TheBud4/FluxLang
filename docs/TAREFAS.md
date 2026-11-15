# Tarefas

## Concluído

- **Trabalho 1 (entregue em 01/10/2026):** BNF LL(1) validada (FIRST/FOLLOW), README e exemplos
  (`docs/exemplos/`), lexer e parser com erros L1–L6 e S1–S3, `Makefile`, testes por linha do
  ERROS.md, artigo SBC e slides (arquivos em `docs/entregas/`).
- **Auditoria de 02/10:** testes positivos e `invalido_erroN` alinhados ao ERROS.md, `make asan`,
  artefatos fora do git, decisões D1–D8 refeitas em 14/11 (ver README e AGENTS.md). As decisões ficam
  no handoff do `AGENTS.md`; não há `DECISOES.md`.

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
- [x] Checagens de execução R1–R7 no código gerado (biblioteca `src/backend/runtime/flux_rt.h`)
- [x] Coletor de lixo na biblioteca de execução e arena de memória no compilador (sem vazamentos sob o LeakSanitizer)
- [x] Saída do programa colorida por tipo, no terminal e na interface (`NO_COLOR` e `FORCE_COLOR`)
- [x] Campo de entrada (stdin) e botão Executar na interface
- [x] O programa gerado roda no Windows (`--build --windows`; testado como `.exe` no wine)

## Em aberto (opcional)

- [ ] Perguntar ao professor (item acima)
- [ ] Testes automáticos da interface web (hoje só tipos, build e gates de acessibilidade)
- [ ] Colorir as mensagens do próprio compilador no terminal
- [ ] Testar em macOS
- [ ] x86-64 nativo, sem passar por C (só se o usuário pedir)
