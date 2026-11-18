func main () {
  var a = { nome: "a" };
  var b = { nome: "b" };
  a.b = b;
  b.a = a;
  terminal.log(a.b.nome);
  terminal.warn(a);
}
