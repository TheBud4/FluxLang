// Exemplo válido da FluxLang: roda as etapas de um projeto Node, tenta
// de novo quando uma etapa falha e mostra um resumo no terminal.

/* Globais: const com tipo explícito e com tipo inferido. */
const projeto:string = "./backend";
const tentativasMax = 3;

// Recursiva: o if com else garante return em todos os caminhos.
func fatorial(n:int):int {
    if (n <= 1) {
        return 1;
    } else {
        return n * fatorial(n - 1);
    }
}

// int / int é divisão inteira; com toFloat, a conta é feita em float.
func taxa(passaram:int, total:int):float {
    return toFloat(passaram) / total;
}

// Sem :tipo, a função não retorna valor.
func mostrarResumo(nomes:list<string>) {
    terminal.info("Etapas: " + toString(nomes.length()));
    for nome in nomes {
        terminal.log("- " + nome);
    }
}

// Executa uma etapa e devolve (saída, erro).
workflow executar(etapa:string, dir:string):string {
    var saida, err = run {
        command: "npm",
        flags: ["run", etapa],
        workingDir: dir,
    };
    stop if err;
    return saida, null;
}

// Chama outro workflow e cria um erro próprio.
workflow pipeline(dir:string, etapas:list<string>):int {
    var concluidas:int = 0;
    for etapa in etapas {
        var saida, err = call executar(etapa, dir);
        stop if err;
        terminal.log(saida);
        concluidas = concluidas + 1;
    }
    if (concluidas == 0) {
        return null, "nenhuma etapa executada";
    }
    return concluidas, null;
}

func main () {
    // Declarações únicas e em lista, com e sem valor inicial
    var tentativa:int = 0;
    var concluidas:int;
    var nome, responsavel:string = "api", "Ana";
    var meta, atual:float;
    var sucesso:bool = false;

    meta = 0.75;
    atual = 0;                          // int vira float
    concluidas = 0;

    // Objeto dinâmico: chave string e campo criado depois
    var config:object = {
        nome: nome,
        "max-tentativas": tentativasMax,
    };
    config.responsavel = responsavel;
    var limite:int = config["max-tentativas"];

    // Lista: push, remove e length()
    var etapas:list<string> = ["lint", "test", "docs"];
    etapas.push("build");
    etapas.push("deploy");
    etapas.remove(2);                   // tira "docs"
    mostrarResumo(etapas);

    // Sem node instalado, o abort encerra o programa
    var versao, erroVersao = run { command: "node", flags: ["--version"] };
    abort if erroVersao;
    terminal.info("Node " + versao);

    // while com proceed: em caso de erro, tenta de novo
    while (!sucesso && tentativa < limite) {
        tentativa = tentativa + 1;
        var total, err = call pipeline(projeto, etapas);
        proceed if err;
        if (err == null) {
            concluidas = total;
            sucesso = true;
        } else {
            terminal.warn("Tentativa " + toString(tentativa) + ": " + err);
        }
    }

    // if/else aninhado (não existe else if)
    if (sucesso) {
        atual = taxa(concluidas, etapas.length());
        if (atual >= meta) {
            terminal.info("Pipeline de " + nome + " aprovado");
        } else {
            terminal.warn("Pipeline abaixo da meta");
        }
    } else {
        terminal.error("Falhou após " + toString(tentativa) + " tentativas");
    }

    // for com continue e break
    for etapa in etapas {
        if (etapa == "lint") {
            continue;
        }
        if (etapa == "deploy") {
            break;
        }
        terminal.log("Etapa " + etapa + " conferida");
    }

    terminal.log("Ordens possíveis: " + toString(fatorial(etapas.length())));
    terminal.info("Fim do \"pipeline\"");
}
