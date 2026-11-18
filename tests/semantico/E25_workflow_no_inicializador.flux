var r, e = call w();
var b:int = 5;

workflow w():int {
  return b, "";
}

func main() {
  terminal.log(b);
}
