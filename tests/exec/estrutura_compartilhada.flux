func main () {
  var x = { a: 1 };
  var l = [x, x];
  var o = { p: x, q: l };
  terminal.log(l);
  terminal.log(o);
  terminal.log(toString(o) == toString(o));
}
