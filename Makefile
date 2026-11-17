# FluxLang - compilador flux
#
# Fontes em src/, separados por função:
#   src/            main.c, json.c, fluxc.h (driver: opções, report_error, saída --json)
#   src/frontend/   lexer.l, parser.y, tree.c, tree.h (análise léxica e sintática, árvore de derivação)
#   src/semantic/   types.c, ast.c, ast_build.c, sema.c (+ .h) (tipos, AST, análise semântica)
#   src/backend/    codegen_c.c e runtime/flux_rt.h (gerador de C e biblioteca de execução)
#   src/util/       mem.c, mem.h (arena de memória do compilador)
# Tudo o que é gerado (bison, flex, objetos) vai para build/; o executável fica em ./flux.
#
#   make           gera ./flux (todas as partes)
#   make clean     apaga o que foi gerado
#   make test      compila e roda os casos de tests/ (tests/run.sh)
#   make asan      compilador e programas gerados com AddressSanitizer + UBSan, roda os testes e volta ao build normal
#   make web       sobe a interface web (npm, Vite): http://127.0.0.1:5173
#   make bear      recompila tudo e gera compile_commands.json (para o clangd)

CC       = gcc
SRCDIRS  = src src/frontend src/semantic src/backend src/util
INCLUDES = $(addprefix -I,$(SRCDIRS)) -Ibuild
CFLAGS   = -Wall -g $(INCLUDES)

# O make procura os .c das regras build/%.o nestas pastas (os nomes não se repetem)
vpath %.c $(SRCDIRS)

# Cabeçalhos do projeto: qualquer mudança neles recompila os objetos
HEADERS = src/fluxc.h src/frontend/tree.h src/semantic/ast.h src/semantic/types.h src/util/mem.h

all: flux

OBJS = build/parser.tab.o build/lex.yy.o build/main.o build/tree.o build/json.o \
       build/types.o build/ast.o build/ast_build.o build/sema.o \
       build/codegen_c.o build/runtime_src.o build/mem.o

# Ligação: junta todas as partes no executável
flux: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

# Parser: o bison gera o .c e o .h (lista de tokens) de uma vez só
build/parser.tab.c build/parser.tab.h &: src/frontend/parser.y src/frontend/tree.h | build
	bison -d -o build/parser.tab.c src/frontend/parser.y

# A biblioteca de execução (src/backend/runtime/flux_rt.h) vira uma string C
# dentro do compilador, para o programa C gerado ser um arquivo único.
build/runtime_src.c: src/backend/runtime/flux_rt.h | build
	{ echo 'const char flux_runtime_source[] ='; \
	  sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/^/"/' -e 's/$$/\\n"/' $<; \
	  echo ';'; } > $@

# Lexer: depende do parser.tab.h por causa dos tokens
build/lex.yy.c: src/frontend/lexer.l build/parser.tab.h | build
	flex -o $@ src/frontend/lexer.l

# Compila os .c gerados em build/ (parser, lexer, runtime) em um .o de build/
build/%.o: build/%.c build/parser.tab.h $(HEADERS)
	$(CC) $(CFLAGS) -c -o $@ $<

# Compila qualquer .c de src/ ou de uma subpasta (achado pelo vpath) em um .o de build/
build/%.o: %.c build/parser.tab.h $(HEADERS) | build
	$(CC) $(CFLAGS) -c -o $@ $<

build:
	mkdir -p build

test: flux
	bash tests/run.sh

clean:
	rm -f build/* flux

# AddressSanitizer e UBSan pegam acesso fora dos limites, uso depois de liberar,
# comportamento indefinido e, com o LeakSanitizer (ligado), vazamentos: o
# compilador libera tudo no fim (arena) e o coletor de lixo da biblioteca de
# execução cuida dos programas gerados. O use-after-return do ASan fica desligado
# porque ele move variáveis para uma pilha falsa que o coletor não varre.
# Precisa dos pacotes libasan e libubsan (Fedora: sudo dnf install libasan libubsan).
# Mesmo que o build ou os testes falhem, o build normal é restaurado no fim.
asan:
	$(MAKE) clean
	@status=0; \
	$(MAKE) CFLAGS='-Wall -g -fsanitize=address,undefined -fno-omit-frame-pointer $(INCLUDES)' flux \
	  && FLUX_CC_FLAGS='-g -fsanitize=address,undefined -fno-omit-frame-pointer' \
     ASAN_OPTIONS=detect_stack_use_after_return=0 bash tests/run.sh || status=1; \
	$(MAKE) clean; $(MAKE) flux; exit $$status

web: flux
	npm --prefix web install
	npm --prefix web run dev

# -B força recompilar tudo: o bear só registra comandos que de fato rodam
bear:
	bear -- $(MAKE) -B all

.PHONY: all test clean bear web asan
