func main () {
  terminal.log("a" + "b");
  terminal.log(toString(1) + toString(2.5) + toString(true));
  terminal.log(null);
  terminal.log([1, 2, 3]);
  terminal.log(["a", "b"]);
  terminal.log([[1], [2, 3]]);
  terminal.log([3.0]);
  terminal.log({ a: 1, b: { c: [true] } });
  terminal.log("com \"aspas\" e \\ barra");
  terminal.log(toInt("42") + 1);
  terminal.log(toInt(3.9));
  terminal.log(toInt(-3.9));
  terminal.log(toFloat("2.5") + toFloat(1));
  terminal.log(toBool("true") && !toBool("false"));
}
