func main () {
  var out, err = run { command: "ls" };
  abort if out;
  abort if err;
  var x = 1;
  proceed if x;
}
