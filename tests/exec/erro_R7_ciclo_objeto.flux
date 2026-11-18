func main () {
  var o = {};
  o.me = o;
  terminal.log("antes");
  terminal.log(o);
  terminal.log("nao chega aqui");
}
