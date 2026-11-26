# FluxLang
#   make           gera ./flux
#   make clean     apaga o que foi gerado
#   make test      compila e roda os casos de tests/ (tests/run.sh)
#   make web       sobe a interface web (npm, Vite): http://127.0.0.1:5173
#   make bear      recompila tudo e gera compile_commands.json (para o clangd)

CC       = gcc
SRCDIRS  = src src/frontend src/semantic src/backend src/util
INCLUDES = $(addprefix -I,$(SRCDIRS)) -Ibuild
CFLAGS   = -Wall -g $(INCLUDES)

vpath %.c $(SRCDIRS)

HEADERS = src/fluxc.h src/frontend/tree.h src/semantic/ast.h src/semantic/types.h src/util/mem.h

all: flux

OBJS = build/parser.tab.o build/lex.yy.o build/main.o build/tree.o build/json.o \
       build/types.o build/ast.o build/ast_build.o build/sema.o \
       build/codegen_c.o build/runtime_src.o build/mem.o

flux: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^

build/parser.tab.c build/parser.tab.h &: src/frontend/parser.y src/frontend/tree.h | build
	bison -d -o build/parser.tab.c src/frontend/parser.y

build/runtime_src.c: src/backend/runtime/flux_rt.h | build
	{ echo 'const char flux_runtime_source[] ='; \
	  sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/^/"/' -e 's/$$/\\n"/' $<; \
	  echo ';'; } > $@

build/lex.yy.c: src/frontend/lexer.l build/parser.tab.h | build
	flex -o $@ src/frontend/lexer.l

build/%.o: build/%.c build/parser.tab.h $(HEADERS)
	$(CC) $(CFLAGS) -c -o $@ $<

build/%.o: %.c build/parser.tab.h $(HEADERS) | build
	$(CC) $(CFLAGS) -c -o $@ $<

build:
	mkdir -p build

test: flux
	bash tests/run.sh

clean:
	rm -f build/* flux

web: flux
	npm --prefix web install
	npm --prefix web run dev

bear:
	bear -- $(MAKE) -B all

.PHONY: all test clean bear web
