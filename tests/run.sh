#!/usr/bin/env bash
# Runs the tests and compares each one with its X.out file.
#
#   tests/lexico/*.flux     Runs: ./flux -t (lexer)
#   tests/sintatico/*.flux  Runs: ./flux    (lexer + parser)
#   tests/arvore/*.flux     Runs: ./flux --tree (parse tree, plus the accept/reject line)
#   tests/json/*.flux       Runs: ./flux --json (tokens, errors and tree as JSON)
#   tests/ast/*.flux        Runs: ./flux --ast (the AST)
#   tests/semantico/*.flux  Runs: ./flux --semantic (semantic errors E1-E24)
#   tests/exec/*.flux       Runs: ./flux --run (compiles to C, runs the program)
#
#   Usage:
#   tests/run.sh             Compare all the cases
#   tests/run.sh --generate  Create the .out of the cases that don't have one yet

cd "$(dirname "$0")/.." || exit 2

run_case() {
  ./flux $1 "$2" 2>&1 </dev/null
  echo "[código $?]"
}

passed=0
failed=0

for dir in lexico sintatico arvore json ast semantico exec; do
  [ -d "tests/$dir" ] || continue
  flags=""
  [ "$dir" = lexico ] && flags="-t"
  [ "$dir" = arvore ] && flags="--tree"
  [ "$dir" = json ] && flags="--json"
  [ "$dir" = ast ] && flags="--ast"
  [ "$dir" = semantico ] && flags="--semantic"
  [ "$dir" = exec ] && flags="--run"

  for src in tests/$dir/*.flux; do
    [ -e "$src" ] || continue
    expected="${src%.flux}.out"

    if [ ! -f "$expected" ]; then
      if [ "$1" = "--generate" ]; then
        run_case "$flags" "$src" > "$expected"
        echo "GERADO  $expected (confira se está certo!)"
      else
        echo "SEM .out  $src (rode tests/run.sh --generate)"
        failed=$((failed + 1))
      fi
      continue
    fi

    if diff -u "$expected" <(run_case "$flags" "$src") > /dev/null; then
      echo "ok      $src"
      passed=$((passed + 1))
    else
      echo "FALHOU  $src"
      diff -u "$expected" <(run_case "$flags" "$src") | tail -n +3 | sed 's/^/        /'
      failed=$((failed + 1))
    fi
  done
done

echo
echo "$passed passaram, $failed falharam."
[ "$failed" -eq 0 ]
