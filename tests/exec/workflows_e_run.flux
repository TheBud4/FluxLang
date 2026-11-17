workflow ecoa (txt:string):string {
  var saida, err = run { command: "echo", flags: [txt] };
  stop if err;
  return saida, null;
}
workflow falha ():string {
  var s, e = run { command: "sh", flags: ["-c", "echo detalhe >&2; exit 3"] };
  stop if e;
  return s, null;
}
workflow propria (n:int):int {
  if (n < 0) { return null, "negativo"; }
  return n * 2, null;
}
workflow sem_tipo () { return null, null; }
func main () {
  var a, e1 = call ecoa("oi");
  abort if e1;
  terminal.log(a);
  var b, e2 = call falha();
  proceed if e2;
  terminal.log(e2);
  terminal.log(b);
  var c, e3 = call propria(-1);
  proceed if e3;
  terminal.log(e3);
  var d, e4 = call propria(4);
  abort if e4;
  terminal.log(d);
  var x, e5 = run { command: "naoexiste_xyz" };
  proceed if e5;
  terminal.log(e5);
  var w, e6 = call sem_tipo();
  abort if e6;
  terminal.log(w);
  var dir, e7 = run { command: "pwd", workingDir: "/tmp" };
  abort if e7;
  terminal.log(dir);
  var z, e8 = run { command: "false" };
  proceed if e8;
  terminal.log(e8);
}
