func main () {
  var i = 0;
  while (i < 10) {
    i = i + 1;
    if (i % 2 == 0) { continue; }
    if (i > 7) { break; }
    terminal.log(i);
  }
  for n in [1, 2, 3] {
    if (n == 2) { continue; }
    terminal.log("n=" + toString(n));
  }
  var x = 5;
  if (x > 3 && x < 10) { terminal.log("meio"); } else { terminal.log("fora"); }
}
