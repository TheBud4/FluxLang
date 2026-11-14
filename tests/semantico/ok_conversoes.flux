func main () {
  var a = toInt("1") + toInt(2.5);
  var b = toFloat(1) + toFloat("2.5");
  var c = toBool("true");
  var d = toString(1) + toString(true) + toString([1]);
  var e = 1 == 1.0;
  var l:list<float> = [1, 2];
  var m = [1, 2.5];
  var n:list<list<int>> = [[1], []];
}
