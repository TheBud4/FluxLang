func mostra (o:object) {
  terminal.log("mostrando");
  terminal.log(o);
}
func main () {
  var o = { nome: "o" };
  o.me = o;
  mostra(o);
  terminal.log("nao chega aqui");
}
