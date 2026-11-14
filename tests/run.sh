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
#   tests/exec_tagged/*.flux Runs: FLUX_TAGGED=1 ./flux --run (the tagged output the web UI reads;
#                            the record separator \x1e is shown as <RS>)
#
#   Usage:
#   tests/run.sh             Compare all the cases
#   tests/run.sh --generate  Create the .out of the cases that don't have one yet

cd "$(dirname "$0")/.." || exit 2

run_case() {
  if [ "$3" = tagged ]; then
    FLUX_TAGGED=1 ./flux $1 "$2" 2>&1 </dev/null | sed 's/\x1e/<RS>/g'
    echo "[código ${PIPESTATUS[0]}]"
  else
    ./flux $1 "$2" 2>&1 </dev/null
    echo "[código $?]"
  fi
}

passed=0
failed=0

for dir in lexico sintatico arvore json ast semantico exec exec_tagged; do
  [ -d "tests/$dir" ] || continue
  flags=""
  [ "$dir" = lexico ] && flags="-t"
  [ "$dir" = arvore ] && flags="--tree"
  [ "$dir" = json ] && flags="--json"
  [ "$dir" = ast ] && flags="--ast"
  [ "$dir" = semantico ] && flags="--semantic"
  [ "$dir" = exec ] && flags="--run"
  mode=""
  [ "$dir" = exec_tagged ] && flags="--run" && mode="tagged"

  for src in tests/$dir/*.flux; do
    [ -e "$src" ] || continue
    expected="${src%.flux}.out"

    if [ ! -f "$expected" ]; then
      if [ "$1" = "--generate" ]; then
        run_case "$flags" "$src" "$mode" > "$expected"
        echo "GERADO  $expected (confira se está certo!)"
      else
        echo "SEM .out  $src (rode tests/run.sh --generate)"
        failed=$((failed + 1))
      fi
      continue
    fi

    if diff -u "$expected" <(run_case "$flags" "$src" "$mode") > /dev/null; then
      echo "ok      $src"
      passed=$((passed + 1))
    else
      echo "FALHOU  $src"
      diff -u "$expected" <(run_case "$flags" "$src" "$mode") | tail -n +3 | sed 's/^/        /'
      failed=$((failed + 1))
    fi
  done
done

echo
echo "$passed passaram, $failed falharam."
[ "$failed" -eq 0 ]
