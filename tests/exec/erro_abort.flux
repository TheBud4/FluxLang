workflow w ():string {
  var r, e = run { command: "false" };
  stop if e;
  return r, null;
}
func main () {
  terminal.log("iniciando");
  var r, e = call w();
  abort if e;
  terminal.log("nao chega aqui");
}
