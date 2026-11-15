func main () {
  var nome = terminal.input("Nome: ");
  var idade = toInt(terminal.input("Idade: "));
  terminal.log("Ola, " + nome + "! Em 10 anos voce tera " + toString(idade + 10));
  var resto = terminal.input();
  terminal.log("sem prompt: [" + resto + "]");
  var fim = terminal.input("Fim: ");
  terminal.log("no fim da entrada a resposta e vazia: " + toString(fim == ""));
}
