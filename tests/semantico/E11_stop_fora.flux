func f () {
  var r, e = run { command: "ls" };
}
workflow w ():string {
  var r, e = run { command: "ls" };
  stop if e;
  return r, null;
}
func main () {
  var r, e = call w();
  stop if e;
}
