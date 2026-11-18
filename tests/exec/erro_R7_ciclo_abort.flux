workflow falha ():int {
  var e = { motivo: "ciclo" };
  e.causa = e;
  return 0, e.causa;
}
func main () {
  var r, e = call falha();
  terminal.log(r);
  abort if e;
}
