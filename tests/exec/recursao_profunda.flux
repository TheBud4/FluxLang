func soma_ate (n:int):int {
  if (n == 0) { return 0; }
  return n + soma_ate(n - 1);
}
func main () {
  terminal.log(soma_ate(20000));
}
