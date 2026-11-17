func fat (n:int):int { if (n <= 1) { return 1; } else { return n * fat(n - 1); } }
func main () {
  if (true) { var x = 1; terminal.log(x); }
  if (true) { var x = 2; terminal.log(x); }
  for i in [1, 2] { var y = i; terminal.log(y); }
  for i in [3, 4] { terminal.log(i); }
  var r = fat(5);
}
