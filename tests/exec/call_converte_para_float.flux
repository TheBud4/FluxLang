workflow um ():int {
  return 1, null;
}
workflow nada () {
  return null, null;
}
func main () {
  var q:float = 0.0;
  var e:string;
  q, e = call um();
  proceed if e;
  terminal.log(q / 2);
  terminal.log(toString(q));
  var r, e2 = call um();
  proceed if e2;
  terminal.log(r / 2);
  var l:list<float> = [0.5];
  var o = {a: 0.5};
  var e3:string;
  l[0], e3 = call um();
  proceed if e3;
  terminal.log(l[0] / 2);
  o.a, e3 = call um();
  proceed if e3;
  terminal.log(o.a / 2);
  var n, e4 = call nada();
  proceed if e4;
  terminal.log(n);
}
