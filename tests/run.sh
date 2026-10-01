#!/usr/bin/env bash
# Runs the tests and compares each one with its X.out file.
#
#   tests/lexico/*.flux     Runs: ./fluxc -t (lexer)
#   tests/sintatico/*.flux  Runs: ./fluxc    (lexer + parser)
#
#   Usage:
#   tests/run.sh             Compare all the cases
#   tests/run.sh --generate  Create the .out of the cases that don't have one yet

cd "$(dirname "$0")/.." || exit 2

run_case() {
  ./fluxc $1 "$2" 2>&1
  echo "[código $?]"
}

passed=0
failed=0

for dir in lexico sintatico; do
  [ -d "tests/$dir" ] || continue
  flags=""
  [ "$dir" = lexico ] && flags="-t"

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
