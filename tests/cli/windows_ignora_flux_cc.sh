flux="$PWD/flux"
command -v x86_64-w64-mingw32-gcc > /dev/null || { echo "pulado"; exit 0; }
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
printf 'func main() {\n  terminal.log("oi");\n}\n' > "$dir/w.flux"
FLUX_CC=false "$flux" --build --windows -o "$dir/w.exe" "$dir/w.flux" 2>&1 | sed "s#$dir/##"
echo "[código ${PIPESTATUS[0]}]"
head -c 2 "$dir/w.exe"
echo
