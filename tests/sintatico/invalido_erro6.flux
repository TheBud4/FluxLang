// Exemplo inválido da FluxLang: sete erros, um em cada linha marcada.
// A definição de cada erro está em ERROS.md, seção 5.

const versao:string = "1.0";

func soma(a:int, b:int):int {
    return a + b;
}

workflow build(dir:string):string {
    var saida, err = run {
        command: "npm",
        flags: ["run", "build"],
        workingDir: dir,
    };
    stop if err;
    return saida, null;
}

func main () {
    var total:int = 10 * 2;
    var itens:int = 3;
    var ativo:bool = true;

    if (ativo) {
        terminal.info("Ativo");
    } else {
        terminal.warn("Inativo");
    }

    call build("./backend");            // erro 6
    soma(1, 2);
}
