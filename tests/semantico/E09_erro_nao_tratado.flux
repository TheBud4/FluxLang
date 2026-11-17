workflow w ():string {
  var s, e = run { command: "ls" };
  return s, null;
}
func main () {
  var r, err = call w();
  var s2, e2 = run { command: "ls" };
  abort if e2;
}
