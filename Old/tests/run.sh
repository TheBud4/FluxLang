#!/usr/bin/env bash
# Roda o fluxc sobre cada caso de teste e compara com a saída esperada.
#   tests/casos/*.flux   análise completa, lendo da entrada padrão
#   tests/tokens/*.flux  modo --tokens
#   exemplos/*.flux      lidos como arquivo; saída esperada em tests/exemplos/
# Também confere o código de saída: 1 se a saída esperada tem erro, 0 se não.
set -u
shopt -s nullglob   # diretório sem casos não vira um caso "*.flux"
cd "$(dirname "$0")/.."

total=0
falhas=0

verificar() {   # verificar <entrada> <esperado> [opções do fluxc...]
    local entrada=$1 esperado=$2
    shift 2
    total=$((total + 1))
    local obtido codigo codigo_esperado=0
    obtido=$(./fluxc "$@" < "${ENTRADA_PADRAO:-$entrada}" 2>&1)
    codigo=$?
    grep -q '^Erro ' "$esperado" && codigo_esperado=1
    if [ "$obtido" != "$(cat "$esperado")" ]; then
        falhas=$((falhas + 1))
        echo "FALHOU $entrada"
        diff "$esperado" <(printf '%s\n' "$obtido") | sed 's/^/       /'
    elif [ "$codigo" -ne "$codigo_esperado" ]; then
        falhas=$((falhas + 1))
        echo "FALHOU $entrada"
        echo "       código de saída $codigo, esperado $codigo_esperado"
    else
        echo "ok     $entrada"
    fi
}

for f in tests/casos/*.flux; do
    verificar "$f" "${f%.flux}.esperado"
done
for f in tests/tokens/*.flux; do
    verificar "$f" "${f%.flux}.esperado" --tokens
done
# Os exemplos vão como argumento, com a entrada padrão vazia.
for f in exemplos/*.flux; do
    ENTRADA_PADRAO=/dev/null verificar "$f" "tests/exemplos/$(basename "${f%.flux}").esperado" "$f"
done

echo
echo "$((total - falhas)) de $total casos passaram."
[ "$falhas" -eq 0 ]
