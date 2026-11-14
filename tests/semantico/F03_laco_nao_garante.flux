func main () {
  var y:int;
  var c = true;
  while (c) { y = 1; }
  terminal.log(y);
  var z:int;
  for i in [1] { z = i; }
  terminal.log(z);
  var w:int;
  while (c) { w = 1; break; }
  var k:int;
  if (c) { k = 1; } else { k = 2; }
  terminal.log(k);
}
