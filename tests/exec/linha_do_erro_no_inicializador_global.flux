func f ():int {
  var a = 1;
  return a;
}
var zero = 0;
var g = f() / zero;
func main () {
  terminal.log(g);
}
