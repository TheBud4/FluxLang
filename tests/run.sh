#!/usr/bin/env bash
# Roda o fluxc sobre cada caso de teste e compara com a saída esperada.
#   tests/casos/*.flux   análise completa, lendo da entrada padrão
#   tests/tokens/*.flux  modo --tokens
#   exemplos/*.flux      saída esperada em tests/exemplos/
set -u
cd "$(dirname "$0")/.."

total=0
falhas=0

verificar() {   # verificar <entrada> <esperado> [opções do fluxc...]
    local entrada=$1 esperado=$2
    shift 2
    total=$((total + 1))
    local obtido
    obtido=$(./fluxc "$@" < "$entrada" 2>&1)
    if [ "$obtido" == "$(cat "$esperado")" ]; then
        echo "ok     $entrada"
    else
        falhas=$((falhas + 1))
        echo "FALHOU $entrada"
        diff <(cat "$esperado") <(printf '%s\n' "$obtido") | sed 's/^/       /'
    fi
}

for f in tests/casos/*.flux; do
    verificar "$f" "${f%.flux}.esperado"
done
for f in tests/tokens/*.flux; do
    verificar "$f" "${f%.flux}.esperado" --tokens
done
for f in exemplos/*.flux; do
    verificar "$f" "tests/exemplos/$(basename "${f%.flux}").esperado"
done

echo
echo "$((total - falhas)) de $total casos passaram."
[ "$falhas" -eq 0 ]
