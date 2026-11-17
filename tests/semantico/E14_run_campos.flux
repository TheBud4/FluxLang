workflow w () {
  var a, e = run { flags: ["x"] };
  var b, e2 = run { command: "ls", command: "pwd" };
  var c, e3 = run { command: "ls", extra: 1 };
  var d, e4 = run { command: 1, flags: "x", workingDir: 2 };
  abort if e; abort if e2; abort if e3; abort if e4;
  return null, null;
}
func main () { }
