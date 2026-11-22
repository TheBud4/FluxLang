func v (nome:string, n:int):int {
  terminal.log(nome);
  return n;
}
func main () {
  var l = [0, 0, 0];
  l[v("indice", 1)] = v("valor", 99);
  terminal.log(l);
  var o = {campo: [0, 0]};
  o.campo[v("indice do campo", 0)] = v("valor do campo", 7);
  terminal.log(o);
  var m = [[0, 0], [0, 0]];
  m[v("linha", 1)][v("coluna", 0)] = v("valor da matriz", 5);
  terminal.log(m);
  l[v("primeiro alvo", 0)], l[v("segundo alvo", 2)] = v("primeiro valor", 10), v("segundo valor", 30);
  terminal.log(l);
  var i = 0;
  i, l[i] = 2, 50;
  terminal.log(i);
  terminal.log(l);
}
