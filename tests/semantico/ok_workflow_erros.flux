workflow build (dir:string):string {
  var out, err = run { command: "npm", flags: ["run"], workingDir: dir };
  stop if err;
  return out, null;
}
workflow outro () {
  var r, e = call build("x");
  if (e != null) { stop if e; }
  return null, "falhou";
}
func main () {
  var r, e = call build("y");
  abort if e;
  var s, e2 = call outro();
  proceed if e2;
  terminal.log(toString(r));
  r, e = call build("z");
  abort if e;
}
