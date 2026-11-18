func main () {
  var raiz = {};
  var atual:object = raiz;
  var i = 0;
  while (i < 1000) {
    atual.f = {};
    atual = atual.f;
    i = i + 1;
  }
  atual.fim = [1, 2];
  terminal.log(raiz);
  var s:string = toString(raiz);
  terminal.log(s == toString(raiz));
}
