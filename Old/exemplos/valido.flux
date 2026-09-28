/*
 * Exemplo válido — FluxLang
 * Testa uma lista de projetos, compila os aprovados e mostra um resumo.
 */

const pastaBase:string = "./projetos";
const maxTentativas:int = 3;

var aprovados, reprovados:int = 0, 0;      // lista de variáveis, com atribuição

// Função com tipo de retorno.
func caminho(nome:string):string {
    return pastaBase + "/" + nome;
}

// Função sem tipo de retorno: não devolve valor.
func mostrarResumo(total:int) {
    var taxa:float = toFloat(aprovados) / toFloat(total) * 100.0;

    terminal.info("Aprovados: " + toString(aprovados) + " de " + toString(total));
    terminal.info("Taxa de sucesso: " + toString(taxa) + "%");
}

// Workflow cujo resultado é string.
workflow testar(projeto:string):string {
    var saida, err = run {                 // tipos inferidos: string e erro
        command: "npm",
        flags: ["test"],
        workingDir: projeto,
    };
    stop if err;

    return saida, null;
}

// Workflow cujo resultado é o número de tentativas usadas.
workflow compilar(projeto:string):int {
    var tentativa:int = 0;
    var concluido:bool = false;

    while (!concluido && tentativa < maxTentativas) {
        tentativa = tentativa + 1;

        var saida, err = run {
            workingDir: projeto,
            command: "npm",
            flags: ["run", "build"],
        };

        if (err == null) {
            terminal.log(saida);
            concluido = true;
        } else {
            terminal.warn("Tentativa " + toString(tentativa) + " falhou");
            continue if err;               // marca o erro como tratado e segue
        }
    }

    return tentativa, null;
}

func main () {
    var nome, versao:string;               // lista de variáveis, sem atribuição
    var total:int;                         // variável única, sem atribuição
    var projetos:list<string> = ["api", "web", "docs",];

    nome, versao = "pipeline", "1.0";
    projetos.push("worker");
    total = projetos.length;

    terminal.info("Iniciando " + nome + " v" + versao);

    for projeto in projetos {
        if (projeto == "docs") {
            total = total - 1;
            continue;                      // docs não tem testes
        }

        var relatorio, erroTeste = call testar(caminho(projeto));

        if (erroTeste != null) {
            terminal.error(erroTeste);
            reprovados = reprovados + 1;
            continue if erroTeste;
        } else {
            terminal.log(relatorio);
            aprovados = aprovados + 1;

            var tentativas, erroBuild = call compilar(caminho(projeto));
            abort if erroBuild;
            terminal.info(projeto + " compilado em " + toString(tentativas) + " tentativa(s)");
        }

        if (reprovados >= 2) {
            terminal.warn("Muitas falhas; interrompendo");
            break;
        }
    }

    mostrarResumo(total);
}
