func f (c:bool):int {
  var x:int;
  if (c) { x = 1; } else { return 0; }
  return x;
}
func g (n:int):int {
  while (n > 0) { if (n == 3) { return n; } n = n - 1; }
  return 0;
}
func h (l:list<int>):int {
  for v in l { if (v > 1) { return v; } }
  return 0;
}
func main () {
  var y:int;
  while (true) { y = 1; break; }
}
