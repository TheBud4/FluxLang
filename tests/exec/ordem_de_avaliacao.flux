var contador = 0;
func marca (nome:string, v:bool):bool {
  terminal.log(nome);
  return v;
}
func proximo ():int {
  contador = contador + 1;
  return contador;
}
func main () {
  var r = marca("a", false) && marca("b", true);
  var s = marca("c", true) || marca("d", true);
  var t = marca("e", true) && marca("f", true);
  terminal.log(r);
  terminal.log(s);
  terminal.log(t);
  terminal.log(proximo() * 10 + proximo());
  var a = 1;
  var b = 2;
  a, b = b, a;
  terminal.log(a);
  terminal.log(b);
}
