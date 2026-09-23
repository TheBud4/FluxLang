CC     ?= gcc
BISON  ?= bison
FLEX   ?= flex
CFLAGS ?= -std=c11 -D_POSIX_C_SOURCE=200809L -Wall -Wextra -O2 -g

BUILD := build
OBJS  := $(BUILD)/parser.o $(BUILD)/lexer.o $(BUILD)/main.o

fluxc: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $(OBJS)

$(BUILD)/parser.c: src/parser.y | $(BUILD)
	$(BISON) -Wall --header=$(BUILD)/parser.h -o $@ $<

$(BUILD)/parser.h: $(BUILD)/parser.c

$(BUILD)/lexer.c: src/lexer.l | $(BUILD)
	$(FLEX) -o $@ $<

$(BUILD)/%.o: $(BUILD)/%.c $(BUILD)/parser.h src/fluxc.h
	$(CC) $(CFLAGS) -Isrc -I$(BUILD) -c -o $@ $<

$(BUILD)/main.o: src/main.c $(BUILD)/parser.h src/fluxc.h
	$(CC) $(CFLAGS) -Isrc -I$(BUILD) -c -o $@ $<

$(BUILD):
	mkdir -p $@

test: fluxc
	./tests/run.sh

clean:
	rm -rf $(BUILD) fluxc

.PHONY: test clean
