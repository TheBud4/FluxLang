func v (nome:string, n:int):int {
  terminal.log(nome);
  return n;
}
workflow w ():int {
  terminal.log("workflow");
  return 3, null;
}
func main () {
  var l = [0, 0];
  var e:string;
  l[v("indice", 1)], e = call w();
  proceed if e;
  terminal.log(l);
}
