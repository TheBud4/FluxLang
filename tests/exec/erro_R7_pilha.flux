func sem_fim (n:int):int { return sem_fim(n + 1); }
func main () {
  terminal.log("antes");
  terminal.log(sem_fim(0));
}
