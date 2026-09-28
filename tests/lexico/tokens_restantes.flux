workflow build(dir:string):string {
    var r, e = run { command: "make", workingDir: dir };
    stop if e;
    return r, null;
}

func main() {
    var ok:bool = true;
    var taxa:float = 0.5;
    var dados:object = { nome: "flux" };
    var saida, erro = call build("src");
    proceed if erro;
    abort if erro;
    while (ok == true || taxa != 1.5) {
        taxa = taxa + 0.5;
        break;
    }
}
