func soma (a:int, b:int):int { return a + b; }
workflow build (x:string):string { return x, null; }
func main () {
  var r, e = call soma(1, 2);
  var s = build("x");
  abort if e;
}
