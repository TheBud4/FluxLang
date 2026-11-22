func main () {
  var l:list<list<int>> = [];
  var caixa = {};
  caixa.l = l;
  l.push(caixa.l);
  terminal.log(l.length());
  terminal.log(l);
}
