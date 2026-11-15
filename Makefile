# FluxLang - compilador flux
#
#   make           gera ./flux (todas as partes)
#   make parser    só o parser: src/parser.y -> build/parser.tab.o
#   make lexer     só o lexer:  src/lexer.l  -> build/lex.yy.o
#   make main      só o main:   src/main.c   -> build/main.o
#   make tree      só a árvore: src/tree.c   -> build/tree.o
#   make json      só o --json: src/json.c   -> build/json.o
#   make ast       só a AST: src/ast.c, ast_build.c e types.c
#   make clean     apaga o que foi gerado
#   make test      compila e roda os casos de tests/ (tests/run.sh)
#   make asan      compilador e programas gerados com AddressSanitizer + UBSan, roda os testes e volta ao build normal
#   make web       sobe a interface web (npm, Vite): http://127.0.0.1:5173
#   make bear      recompila tudo e gera compile_commands.json (para o clangd)

CC     = gcc
CFLAGS = -Wall -g -Isrc -Ibuild

all: flux

parser: build/parser.tab.o
lexer:  build/lex.yy.o
main:   build/main.o
tree:   build/tree.o
json:   build/json.o
ast:    build/ast.o build/ast_build.o build/types.o build/sema.o build/mem.o

# Ligação: junta as três partes no executável
flux: build/parser.tab.o build/lex.yy.o build/main.o build/tree.o build/json.o build/types.o build/ast.o build/ast_build.o build/sema.o build/codegen_c.o build/runtime_src.o build/mem.o
	$(CC) $(CFLAGS) -o $@ $^

# Parser: o bison gera o .c e o .h (lista de tokens) de uma vez só
build/parser.tab.c build/parser.tab.h &: src/parser.y src/tree.h | build
	bison -d -o build/parser.tab.c src/parser.y

# A biblioteca de execução (runtime/flux_rt.h) vira uma string C dentro do
# compilador, para o programa C gerado ser um arquivo único.
build/runtime_src.c: runtime/flux_rt.h | build
	{ echo 'const char flux_runtime_source[] ='; \
	  sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/^/"/' -e 's/$$/\\n"/' $<; \
	  echo ';'; } > $@

# Lexer: depende do parser.tab.h por causa dos tokens
build/lex.yy.c: src/lexer.l build/parser.tab.h | build
	flex -o $@ src/lexer.l

# Compila qualquer .c de build/ ou src/ em um .o de build/
build/%.o: build/%.c build/parser.tab.h src/fluxc.h src/tree.h
	$(CC) $(CFLAGS) -c -o $@ $<

build/%.o: src/%.c build/parser.tab.h src/fluxc.h src/tree.h src/ast.h src/types.h src/mem.h | build
	$(CC) $(CFLAGS) -c -o $@ $<

build:
	mkdir -p build

test: flux
	bash tests/run.sh

clean:
	rm -f build/* flux

# AddressSanitizer e UBSan pegam acesso fora dos limites, uso depois de liberar
# e comportamento indefinido. A árvore de derivação nunca é liberada (vive até
# o fim do processo), então a detecção de vazamento fica desligada.
# Precisa dos pacotes libasan e libubsan (Fedora: sudo dnf install libasan libubsan).
# Mesmo que o build ou os testes falhem, o build normal é restaurado no fim.
asan:
	$(MAKE) clean
	@status=0; \
	$(MAKE) CFLAGS='-Wall -g -fsanitize=address,undefined -fno-omit-frame-pointer -Isrc -Ibuild' flux \
	  && FLUX_CC_FLAGS='-g -fsanitize=address,undefined -fno-omit-frame-pointer' \
     ASAN_OPTIONS=detect_leaks=0 bash tests/run.sh || status=1; \
	$(MAKE) clean; $(MAKE) flux; exit $$status

web: flux
	npm --prefix web install
	npm --prefix web run dev

# -B força recompilar tudo: o bear só registra comandos que de fato rodam
bear:
	bear -- $(MAKE) -B all

.PHONY: all parser lexer main tree json ast test clean bear web asan
