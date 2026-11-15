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
#   tests/exec_color/*.flux  Runs: FORCE_COLOR=1 ./flux --run (ANSI colors; the ESC byte is shown as <ESC>)
#   tests/exec_nocolor/*.flux Runs: FORCE_COLOR=1 NO_COLOR=1 ./flux --run (NO_COLOR wins: no colors)
#   (exec again)            Runs: FLUX_GC_STRESS=1 ./flux --run on tests/exec/*.flux and expects the SAME
#                            .out: the garbage collector runs at every allocation and must change nothing
#   (exec again, Windows)   Runs: ./flux --run --windows on tests/exec/*.flux (a .exe under wine) and expects
#                            the SAME .out, once normally and once with FLUX_GC_STRESS=1; skips the tests
#                            that call POSIX commands (see windows_skip). Needs mingw64-gcc and wine.
#   tests/exec_windows/*.flux Runs: ./flux --run --windows (programs that call Windows commands via cmd /c)
#   tests/exec_tagged/*.flux Runs: FLUX_TAGGED=1 ./flux --run (the tagged output the web UI reads;
#                            the record separator \x1e is shown as <RS>)
#
#   Usage:
#   tests/run.sh             Compare all the cases
#   tests/run.sh --generate  Create the .out of the cases that don't have one yet

cd "$(dirname "$0")/.." || exit 2

run_case() {
  # a entrada padrão do teste: X.in, se existir, senão vazia
  input="${2%.flux}.in"
  [ -f "$input" ] || input=/dev/null
  if [ "$3" = windows ] || [ "$3" = windowsgc ]; then
    # um .exe sob o wine: sem o CR do Windows e sem o ruído do Mesa que o wine imprime
    gc=""
    [ "$3" = windowsgc ] && gc="FLUX_GC_STRESS=1"
    env $gc LC_ALL=C ./flux $1 --windows "$2" 2>&1 < "$input" | tr -d '\r' | grep -vE 'MESA|pci id'
    echo "[código ${PIPESTATUS[0]}]"
  elif [ "$3" = gcstress ]; then
    FLUX_GC_STRESS=1 ./flux $1 "$2" 2>&1 < "$input"
    echo "[código $?]"
  elif [ "$3" = color ]; then
    FORCE_COLOR=1 ./flux $1 "$2" 2>&1 < "$input" | sed 's/\x1b/<ESC>/g'
    echo "[código ${PIPESTATUS[0]}]"
  elif [ "$3" = nocolor ]; then
    FORCE_COLOR=1 NO_COLOR=1 ./flux $1 "$2" 2>&1 < "$input" | sed 's/\x1b/<ESC>/g'
    echo "[código ${PIPESTATUS[0]}]"
  elif [ "$3" = tagged ]; then
    FLUX_TAGGED=1 ./flux $1 "$2" 2>&1 < "$input" | sed 's/\x1e/<RS>/g'
    echo "[código ${PIPESTATUS[0]}]"
  else
    ./flux $1 "$2" 2>&1 < "$input"
    echo "[código $?]"
  fi
}

passed=0
failed=0

# testes que chamam comandos do POSIX (echo, sh, false, pwd): não existem no Windows
windows_skip="workflows_e_run erro_abort"
have_windows=0
command -v x86_64-w64-mingw32-gcc >/dev/null && command -v wine >/dev/null && have_windows=1

for pass in lexico sintatico arvore json ast semantico exec exec_tagged exec_color exec_nocolor exec_gc exec_win exec_win_gc exec_windows; do
  dir="$pass"
  [ "$pass" = exec_gc ] && dir=exec
  [ "$pass" = exec_win ] && dir=exec
  [ "$pass" = exec_win_gc ] && dir=exec
  case "$pass" in exec_win|exec_win_gc|exec_windows)
    if [ "$have_windows" = 0 ]; then
      echo "pulado  $pass (precisa de mingw64-gcc e wine)"
      continue
    fi;;
  esac
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
  [ "$dir" = exec_color ] && flags="--run" && mode="color"
  [ "$dir" = exec_nocolor ] && flags="--run" && mode="nocolor"
  [ "$pass" = exec_gc ] && flags="--run" && mode="gcstress"
  [ "$pass" = exec_win ] && flags="--run" && mode="windows"
  [ "$pass" = exec_win_gc ] && flags="--run" && mode="windowsgc"
  [ "$pass" = exec_windows ] && flags="--run" && mode="windows"

  for src in tests/$dir/*.flux; do
    [ -e "$src" ] || continue
    expected="${src%.flux}.out"
    label="$src"
    [ "$pass" = exec_gc ] && label="$src (coleta a cada alocação)"
    [ "$pass" = exec_win ] && label="$src (Windows, no wine)"
    [ "$pass" = exec_win_gc ] && label="$src (Windows, coleta a cada alocação)"
    case "$pass" in exec_win|exec_win_gc)
      case " $windows_skip " in *" $(basename "${src%.flux}") "*) continue;; esac;;
    esac

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
      echo "ok      $label"
      passed=$((passed + 1))
    else
      echo "FALHOU  $label"
      diff -u "$expected" <(run_case "$flags" "$src" "$mode") | tail -n +3 | sed 's/^/        /'
      failed=$((failed + 1))
    fi
  done
done

echo
echo "$passed passaram, $failed falharam."
[ "$failed" -eq 0 ]
