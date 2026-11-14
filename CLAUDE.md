# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read `AGENTS.md` first.** It holds the working rules, the current state of the project and a one-page summary of the language. The essentials, so they aren't missed:

- The user decides the language design. Ask before introducing any new language choice; mechanical changes (propagating a decision, typos, LL(1) factoring) are fine.
- `docs/BNF.txt` is read-only for the agent: only `;; [erro]: ...` / `;; [pendente]: ...` comment lines may be added. Any grammar change must stay LL(1) (check FIRST/FIRST and FIRST/FOLLOW by hand and report).
- Docs and compiler messages are in Portuguese; BNF non-terminals are in English.
- Never add `Co-Authored-By` or any AI attribution to commit messages, and only commit when asked.

## Commands

FluxLang is a small typed language for task/workflow automation, built together with its compiler (university Compilers course). Requires `gcc`, `flex`, GNU `bison` ≥ 3.6 (for `parse.error custom` / `yyreport_syntax_error`) and GNU `make` ≥ 4.3 (the Makefile uses grouped targets, `&:`).

```
make                  # builds ./flux (bison + flex + gcc)
make parser|lexer|main  # build a single piece into build/*.o
make test             # builds and runs tests/run.sh over all cases
make clean
make web              # web UI (Vite + React + Tailwind in web/, needs Node 20+): http://127.0.0.1:5173
make bear             # full rebuild that regenerates compile_commands.json (clangd)

./flux file.flux      # lex + parse a file ("Programa aceito." / "Programa rejeitado.")
./flux < file.flux    # same, from stdin
./flux -t file.flux   # token mode: lexer only, prints line:col, token name, text
```

Exit codes: 0 accepted, 1 rejected (lexical/syntactic error), 2 bad usage/unreadable file.

Tests live in `tests/lexico/` (run with `-t`) and `tests/sintatico/` (run plain); each `X.flux` is compared against `X.out`, which holds stdout+stderr plus a `[código N]` exit-code line. There is no single-test flag: to run one, do `./flux [-t] tests/<dir>/X.flux; echo "[código $?]"` and diff by hand against `X.out`. For a new case, add the `.flux`, run `bash tests/run.sh --generate` (creates only the missing `.out` files), and **verify the generated `.out` by hand**.

## Architecture

Source files in `src/`: `lexer.l`, `parser.y`, `main.c`, `tree.c`, `json.c`, and the semantic side (`types.c`, `ast.c`, `ast_build.c`, `sema.c`), linked into one binary; `build/` holds the generated `lex.yy.c`, `parser.tab.{c,h}` and objects.

- `src/lexer.l` (Flex): tracks `line`/`column` itself in `YY_USER_ACTION`, filling `yylloc`; every returned token goes through `RET(TOKEN)`, which sets `yylval.node` to a leaf `Node` (token name, lexeme, position). Lexical errors L1–L6 are reported from here via `report_error` and returned as `YYerror`.
- `src/parser.y` (Bison, `%locations`, `%union { struct Node *node; }`: every token and non-terminal carries a `Node *`): a direct transcription of `docs/BNF.txt`, rule by rule, so it is deliberately **LL(1)-shaped** (right-recursive `*_rest`/`*_list_rest` rules, left factoring) rather than idiomatic LALR. The reason: Trabalho 2 requires showing the transformation to LL(1). Keep new rules in that style and with no Bison conflicts. Every alternative has the same action shape, `$$ = mknode("rule_name", n, $1, ..., $n);` (`empty_node()` for ε, `error_node(@k.first_line, @k.first_column)` for the `error` token), so the derivation tree stays faithful to the BNF; `./flux --tree` prints it (`src/tree.c`, `tests/arvore/`).
- `src/main.c`: option parsing, `report_error` (the single formatter for all `Erro <categoria> [linha L, coluna C]:` messages, shared by lexer and parser through `src/fluxc.h`), and the accept/reject driver.

Two parser mechanisms span several places:

- **Syntax error messages** are produced entirely by `yyreport_syntax_error` at the end of `parser.y`. It takes Bison's expected-token list and collapses complete groups (`EXPRESSION_START`, `TYPE_START`, `COMMAND_KEYWORDS`) into the words `expressão`, `tipo`, `comando`. When adding tokens that begin expressions, types or commands, update those arrays or the messages will silently degrade. `token_name`, `found_name`, `spelling` and `is_keyword` also live there.
- **S3 check** (invalid assignment target) is done in the grammar actions using the `flag` field of the expression nodes (1 = can receive an assignment; in `*_rest` nodes it means "an operator appeared") and `assign_loc`, not in the grammar itself.

The parser stays in Bison (decided 2026-11-14: the assignment does not require a hand-written parser). Panic mode is done in `parser.y` as `error` rules (`command`, `global_no_func`, `after_func`; simple version, see docs/ERROS.md section 6); the derivation tree (`--tree`) and `--json` (`src/json.c`; tokens are recorded by `RET` in the lexer, errors by `report_error`, which in JSON mode prints nothing to stderr) are done; semantic analysis is optional (`./flux --semantic`): `ast_build.c` converts the derivation tree into a lean AST (`./flux --ast`) and `sema.c` runs three passes (declare globals, check global initializers, check function bodies) with a scope stack, expression types and a control-flow state for E3/E20; the GUI is `web/` (Vite + React + Tailwind; its Vite plugin `server/flux-api.ts` serves `POST /api/compile` by piping the code into `./flux --json`).

Only lexing and parsing exist so far; there is no AST, semantic analysis (E1–E22) or codegen yet. Panic mode (simple `error` rules) and file reading are done; the derivation tree, AST and the GUI are Trabalho 2.

## Docs that must stay consistent

A language decision must appear in `README.md` (the language spec), `docs/ERROS.md` (error catalog: L1–L6 lexical, S1–S3 syntactic, E1–E22 semantic, R1–R6 runtime, with the 7-error `invalido.flux` described in section 5), `docs/exemplos/*.flux`, and as a `[pendente]` in the BNF. README links use the `docs/` prefix; ERROS.md links are relative to `docs/`. `docs/TAREFAS.md` is the checklist to the deadlines.
