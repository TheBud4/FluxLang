workflow w ():string { return null, null; }
func main () {
  var r, e = call w();
  abort if e;
  r, e = call w();
}
