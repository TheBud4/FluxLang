var a:int = f();
var b:int = 5;

func f():int {
  return g();
}

func g():int {
  return b + 1;
}

func main() {
  terminal.log(a);
}
