#!/usr/bin/env bash
# Roda os testes e compara com X.out.
#
#   tests/lexico/*.flux     roda ./fluxc -t (só lexer)
#   tests/sintatico/*.flux  roda ./fluxc    (lexer + parser)
#
#   Uso:
#   tests/run.sh          compara todos os casos
#   tests/run.sh --generate  cria o .out dos casos que ainda não têm

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
