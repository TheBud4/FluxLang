/*
 * Exemplo inválido — FluxLang
 * Cada linha marcada com "ERRO n" contém um erro léxico ou sintático,
 * descrito na tabela "Erros do exemplo inválido" em ERROS.md.
 */

const versao:string;                          // ERRO 1

workflow publicar(destino:string):string {
    var saida, err = run {
        command: "npm",
        flags: ["publish"],
        workingDir: destino,
    }
    stop if err;                              // ERRO 2
    return saida, null;
}

func soma(a:int, b:int):int {
    return a + b;
}

func main () {
    var total:int = 10 @ 2;                   // ERRO 3
    var 2itens:list<string>;                  // ERRO 4
    var contador;                             // ERRO 5

    if (total > 5) {
        terminal.log("maior que cinco");
    } else if (total < 0) {                   // ERRO 6
        terminal.log("negativo");
    }

    soma(1, 2) = 3;                           // ERRO 7
}
