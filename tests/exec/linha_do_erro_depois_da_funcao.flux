func f (n:int):int {
  if (n == 0) {
    return 0;
  }
  var a = f(n - 1);
  return a + 1;
}
func main () {
  var z = 0;
  var x = f(f(2)) + 1 / z;
  terminal.log(x);
}
