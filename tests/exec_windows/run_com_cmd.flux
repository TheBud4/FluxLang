workflow ecoa ():string {
  var s, e = run { command: "cmd", flags: ["/c", "echo oi"] };
  stop if e;
  return s, null;
}
func main () {
  var a, e1 = call ecoa();
  abort if e1;
  terminal.log(a);
  var b, e2 = run { command: "cmd", flags: ["/c", "exit 3"] };
  proceed if e2;
  terminal.log(e2);
  var c, e3 = run { command: "naoexiste_xyz" };
  proceed if e3;
  terminal.log(e3);
  var d, e4 = run { command: "cmd", flags: ["/c", "(echo erro)>&2 & exit 2"] };
  proceed if e4;
  terminal.log(e4);
  var f, e5 = run { command: "cmd", flags: ["/c", "cd"], workingDir: "C:\\windows" };
  abort if e5;
  terminal.log(f);
}
