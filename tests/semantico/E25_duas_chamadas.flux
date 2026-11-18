var a:int = f() + f();
var b:int = 5;
var c:int = f() + h();
var d:int = 7;

func f():int {
  return b;
}

func h():int {
  return d;
}

func main() {
  terminal.log(a);
}
