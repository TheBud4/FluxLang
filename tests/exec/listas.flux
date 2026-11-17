func main () {
  var l:list<int> = [10, 20];
  l.push(30);
  terminal.log(l);
  terminal.log(l.length());
  terminal.log(l[1]);
  l[1] = 25;
  l.remove(0);
  terminal.log(l);
  var f:list<float> = [1, 2];
  terminal.log(f);
  f.push(3);
  terminal.log(f);
  var m = [1, 2.5];
  terminal.log(m);
  var vazia:list<string> = [];
  terminal.log(vazia.length());
  var a:list<int> = [1];
  var b = a;
  b.push(2);
  terminal.log(a);
  for x in l { terminal.log(x * 2); }
}
