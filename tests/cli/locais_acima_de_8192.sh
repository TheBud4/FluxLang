flux="$PWD/flux"
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
{
  printf 'func main() {\n  var primeira:int;\n  terminal.log(primeira);\n'
  for ((i = 1; i <= 8200; i++)); do printf '  var v%d = %d;\n' "$i" "$i"; done
  printf '  var ultima:int;\n  terminal.log(ultima);\n}\n'
} > "$dir/locais.flux"
"$flux" --semantic "$dir/locais.flux" 2>&1
echo "[código $?]"
