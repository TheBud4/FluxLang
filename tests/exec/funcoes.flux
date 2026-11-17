func fat (n:int):int { if (n <= 1) { return 1; } else { return n * fat(n - 1); } }
func par (n:int):bool { if (n == 0) { return true; } return impar(n - 1); }
func impar (n:int):bool { if (n == 0) { return false; } return par(n - 1); }
func media (a:float, b:float):float { return (a + b) / 2; }
var base = fat(5);
const dobro = base * 2;
func main () {
  terminal.log(base);
  terminal.log(dobro);
  terminal.log(par(10));
  terminal.log(impar(10));
  terminal.log(media(1, 2));
}
