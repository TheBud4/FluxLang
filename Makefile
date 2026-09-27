# FluxLang - compilador fluxc
#
#   make           gera ./fluxc (todas as partes)
#   make parser    só o parser: src/parser.y -> build/parser.tab.o
#   make lexer     só o lexer:  src/lexer.l  -> build/lex.yy.o
#   make main      só o main:   src/main.c   -> build/main.o
#   make clean     apaga o que foi gerado
#   make test      compila e roda os casos de tests/ (tests/run.sh)
#   make bear      recompila tudo e gera compile_commands.json (para o clangd)

CC     = gcc
CFLAGS = -Wall -Isrc -Ibuild

all: fluxc

parser: build/parser.tab.o
lexer:  build/lex.yy.o
main:   build/main.o

# Ligação: junta as três partes no executável
fluxc: build/parser.tab.o build/lex.yy.o build/main.o
	$(CC) $(CFLAGS) -o $@ $^

# Parser: o bison gera o .c e o .h (lista de tokens) de uma vez só
build/parser.tab.c build/parser.tab.h &: src/parser.y | build
	bison -d -o build/parser.tab.c src/parser.y

# Lexer: depende do parser.tab.h por causa dos tokens
build/lex.yy.c: src/lexer.l build/parser.tab.h | build
	flex -o $@ src/lexer.l

# Compila qualquer .c de build/ ou src/ em um .o de build/
build/%.o: build/%.c build/parser.tab.h src/fluxc.h
	$(CC) $(CFLAGS) -c -o $@ $<

build/%.o: src/%.c build/parser.tab.h src/fluxc.h | build
	$(CC) $(CFLAGS) -c -o $@ $<

build:
	mkdir -p build

test: fluxc
	bash tests/run.sh

clean:
	rm -f build/* fluxc

# -B força recompilar tudo: o bear só registra comandos que de fato rodam
bear:
	bear -- $(MAKE) -B all

.PHONY: all parser lexer main test clean bear
