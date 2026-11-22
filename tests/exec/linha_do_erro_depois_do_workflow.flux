workflow w ():int {
  var a = 1;
  return a, null;
}
func main () {
  var l = [0];
  var e:string;
  l[5], e = call w();
  proceed if e;
}
