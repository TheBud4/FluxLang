func f () {
  var r, e = run { command: "ls" };
  abort if e;
}
workflow w () { return null, null; }
func g () {
  var r, e = call w();
  abort if e;
}
func main () { }
