var a:int = f(3);
var b:int = 5;

func f(n:int):int {
  if (n == 0) {
    return b;
  }
  return f(n - 1);
}

func main() {
  terminal.log(a);
}
