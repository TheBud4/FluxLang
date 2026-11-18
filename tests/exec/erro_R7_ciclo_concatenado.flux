func main () {
  var o = {};
  var l = [o];
  o.l = l;
  terminal.log("x" + toString(o.nada));
  var s = "x" + toString(o);
  terminal.log(s);
}
