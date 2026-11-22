var base:int = 10;
var a:int = f(2);
var b:int = g();
var depois:int = 5;

func f(n:int):int {
  if (n == 0) {
    return base;
  }
  return f(n - 1) + 1;
}

func g():int {
  return base + a;
}

func le_depois():int {
  return depois;
}

func main() {
  terminal.log(a);
  terminal.log(b);
  terminal.log(le_depois());
}
