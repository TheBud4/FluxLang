func main () {
  var o = { itens: [] };
  o.itens.push(o);
  terminal.log("antes");
  var s:string = toString(o);
  terminal.log(s);
}
