var guardado:list<string> = ["inicio"];
var mapa:object = {};

func gera (n:int):int {
  var i = 0;
  var acc = 0;
  while (i < n) {
    var lixo = "lixo-" + toString(i) + "-" + toString(i * 7);
    var lista:list<list<int>> = [[i], [i, i + 1]];
    acc = acc + lista[1][1] - lista[0][0];
    if (i % 50 == 0) {
      guardado.push("g" + toString(i));
      mapa["k" + toString(i)] = { n: i, s: "v" + toString(i), filhos: [lixo, "x"] };
    }
    i = i + 1;
  }
  return acc;
}

func constroi (n:int):list<object> {
  var itens:list<object> = [];
  var i = 0;
  while (i < n) {
    itens.push({ id: i, nome: "item-" + toString(i), tags: ["a" + toString(i), "b" + toString(i)] });
    i = i + 1;
  }
  return itens;
}

func confere (itens:list<object>):int {
  var total = 0;
  for item in itens {
    var tags:list<string> = item.tags;
    var id:int = item.id;
    var nome:string = item.nome;
    if (nome != "item-" + toString(id)) { terminal.log("nome errado: " + nome); }
    if (tags[1] != "b" + toString(id)) { terminal.log("tag errada: " + tags[1]); }
    total = total + id + tags.length();
  }
  return total;
}

func main () {
  terminal.log(gera(3000));
  terminal.log(guardado.length());
  terminal.log(guardado[0] + " " + guardado[10] + " " + guardado[60]);
  var e:object = mapa["k450"];
  terminal.log(e.s);
  terminal.log(e.n);
  var f:list<string> = e.filhos;
  terminal.log(f[0]);
  var itens = constroi(400);
  terminal.log(confere(itens));
  var k = 0;
  while (itens.length() > 5) { itens.remove(0); k = k + 1; }
  terminal.log(k);
  terminal.log(confere(itens));
  terminal.log(mapa.k2950.s);
}
