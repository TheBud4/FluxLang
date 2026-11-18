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
- [x] Análise semântica (E1–E25): `./flux --semantic`, com a chave na interface
- [x] Geração de código C e chamada do `gcc` (`--c`, `--build`, `--run`)
- [x] Checagens de execução R1–R7 no código gerado (biblioteca `src/backend/runtime/flux_rt.h`)
- [x] Coletor de lixo na biblioteca de execução e arena de memória no compilador (sem vazamentos sob o LeakSanitizer)
- [x] Saída do programa colorida por tipo, no terminal e na interface (`NO_COLOR` e `FORCE_COLOR`)
- [x] Campo de entrada (stdin) e botão Executar na interface
- [x] O programa gerado roda no Windows (`--build --windows`; testado como `.exe` no wine)
- [x] Documentação completa da linguagem e do compilador na interface web (aba Documentação, `#/doc`: 15 páginas da linguagem, 17 do compilador); comentários removidos do código

## Em aberto (opcional)

- [ ] Perguntar ao professor (item acima)
- [ ] Testes automáticos da interface web (hoje só tipos, build e gates de acessibilidade)
- [ ] Colorir as mensagens do próprio compilador no terminal
- [ ] Testar em macOS
- [ ] x86-64 nativo, sem passar por C (só se o usuário pedir)

### Decisões pendentes com o usuário (achados da documentação)

Achados ao escrever o manual. As páginas documentam o comportamento atual
do compilador; nada aqui foi mudado. Cada item espera uma decisão: corrigir,
ratificar no README ou deixar como está.

Comportamentos do compilador a decidir (alguns podem ser intencionais):

- [x] `./flux --build prog` com o fonte sem extensão grava o executável por cima do fonte (corrigido: recusa com saída 2, comparando dispositivo e inode do fonte e do destino; `tests/cli/build_nao_sobrescreve_fonte.sh`)
- [x] `q, e = call w()` com `q:float` e `w` devolvendo `int` copia sem converter (`q / 2` dá 0, não 0.5) (corrigido: o resultado passa pela mesma conversão da atribuição comum; `tests/exec/call_converte_para_float.flux`)
- [x] `l[f()] = g()` avalia o valor (`g`) antes do alvo (`f`), contra a ordem da esquerda para a direita (corrigido: base e índice de todos os alvos antes dos valores; `tests/exec/ordem_do_alvo.flux`)
- [x] Inicializadores globais rodam na ordem do arquivo: uma função chamada ali lê os globais de baixo como `null` (R3) (corrigido: erro E25 na compilação; `tests/semantico/E25_*.flux`)
- [x] `fx_line` não é restaurada no retorno de função: um erro de execução pode citar a linha do fim da função chamada (corrigido: `FX_LINE` de novo depois de cada chamada de func e de `call`, e a cada volta do `while`; `tests/exec/linha_do_erro_*.flux`)
- [x] Imprimir um objeto cíclico (`o.me = o;`) dá falha de segmentação (código 139) em vez de um erro de execução (corrigido: R7 `Estrutura circular ou profunda demais para imprimir.`, na linha do comando; o ciclo é achado pela marca `busy` do bloco que está sendo impresso (`fx_repr_enter`), e a conferência de pilha só pega a estrutura finita funda demais; `tests/exec/erro_R7_ciclo_*.flux`, `estrutura_profunda.flux`, `estrutura_compartilhada.flux`)
- [x] Com mais de 8192 variáveis locais, o E3 deixa de ser detectado (corrigido: o estado de fluxo cresce pela arena, sem teto; `tests/cli/locais_acima_de_8192.sh`)
- [x] Mais de 4995 operandos encadeados estouram a pilha do Bison: o `--json` rejeita sem nenhuma mensagem (`errors: []`, `tree: null`) (corrigido: erro sintático em português, também no JSON; `tests/cli/operandos_encadeados_*.sh`)
- [ ] Pânico: um comando quebrado sem `;` antes do `}` (`x = 1 +` e `}`) tem o `}` descartado, a função fica aberta e sai `tree: null` ou um erro extra no fim do arquivo; `1 +;` solto no nível global, sem `func main` depois, dá o mesmo segundo erro e `tree: null`
- [x] `FLUX_CC` também troca o compilador do alvo `--windows` (com `FLUX_CC=clang`, as passadas Windows falham) (corrigido: o alvo Windows ignora `FLUX_CC`; `tests/cli/windows_ignora_flux_cc.sh`)
- [ ] `ação` dá um L1 por caractere não ASCII, e um texto partido em duas linhas dá dois L2
- [ ] A thread de 64 MB do programa só existe no Windows; no POSIX o programa roda na thread principal
- [ ] O `asm` que salva os registradores no coletor: só `__builtin_unwind_init` passou com clang 22 e gcc 16 (a falha descrita no antigo comentário não se reproduziu); o `asm` fica até o usuário decidir
- [ ] A nota de AGENTS.md (Armadilhas) sobre o clang transformar a recursão de cauda em laço não se reproduziu em 18/11 (gcc e clang, -O1 a -O3): rever a nota

Interface e documentação:

- [ ] A saída impressa antes de um tempo esgotado do `/api/run` se perde (o buffer da saída num cano não é esvaziado antes do SIGKILL)
- [ ] O CORS padrão do Vite aceita o pré-voo de outra porta em localhost; só a conferência de `Origin` do plugin barra o pedido
- [ ] Um `PageLink` ou endereço com id de página desconhecido abre a Introdução sem aviso (talvez uma tela "página não encontrada")
- [ ] `tests/exec/entrada_com_stdin.flux` falha às vezes na passada wine/estresse (duas vezes neste trabalho; passa ao repetir)

Lacunas do README (o compilador já faz; falta ratificar ou mudar):

- [ ] Promoção de `int` para `float` também em argumentos, no `return` de função `:float` e nos elementos de literal de lista
- [ ] `&&` e `||` em curto-circuito
- [ ] Parâmetros de função e a variável do `for` podem ser reatribuídos
- [ ] Chave repetida em literal de objeto (`{a: 1, a: 2}`) é aceita; vale a última
- [ ] `toInt(" 42")` (com espaço) devolve 42
- [ ] `cfg.servidor.porta = 80` sem `servidor` dá R3 (o objeto intermediário não é criado); o README só diz que atribuir a um campo que não existe cria o campo
- [ ] `[[1], [2.5]]` é rejeitado (`esperado list<int>, encontrado list<float>`): a união de `int` e `float` vale só para os elementos diretos da lista
- [ ] O item "Forma dos nós da AST" em "Em aberto" do README está desatualizado (`--ast` existe)
