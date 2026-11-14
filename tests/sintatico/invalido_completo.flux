// Exemplo inválido da FluxLang: sete erros, um em cada linha marcada.

const versao:string;                    // erro 1

func soma(a:int, b:int):int {
    return a + b;
}

workflow build(dir:string):string {
    var saida, err = run {
        command: "npm",
        flags: ["run", "build"],
        workingDir: dir,
    }                                   // erro 2 (falta ';')
    stop if err;
    return saida, null;
}

func main () {
    var total:int = 10 @ 2;             // erro 3
    var 2itens:int = 3;                 // erro 4
    var ativo:bool = true;

    if (ativo) {
        terminal.info("Ativo");
    } else if (total > 5) {             // erro 5
        terminal.warn("Inativo");
    }

    call build("./backend");            // erro 6
    soma(1, 2) = 3;                     // erro 7
}
