flux="$PWD/flux"
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
{
  printf 'func main() {\n  var a = 1'
  for ((i = 1; i < 5000; i++)); do printf ' + 1'; done
  printf ';\n}\n'
} > "$dir/ops.flux"
"$flux" --json "$dir/ops.flux" 2>&1 | grep -E '^"accepted"|^  \{"kind":"(léxico|sintático|semântico)"'
echo "[código ${PIPESTATUS[0]}]"
