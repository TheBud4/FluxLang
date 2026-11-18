flux="$PWD/flux"
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
cd "$dir"
printf 'func main() {\n  terminal.log("oi");\n}\n' > prog
cp prog original
"$flux" --build prog 2>&1
echo "[código $?]"
cmp -s prog original && echo "fonte intacto" || echo "fonte sobrescrito"
cp original prog
"$flux" --build prog -o prog 2>&1
echo "[código $?]"
cmp -s prog original && echo "fonte intacto" || echo "fonte sobrescrito"
cp original prog
"$flux" --build prog -o prog.bin 2>&1
echo "[código $?]"
./prog.bin
cp prog outro.flux
"$flux" --build outro.flux 2>&1
echo "[código $?]"
./outro
