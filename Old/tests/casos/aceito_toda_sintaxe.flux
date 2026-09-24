// Usa todas as construções da BNF: deve ser aceito.
const nomes:list<string> = ["a", "b",];
const limite:int = 3;
var matriz:list<list<int>> = [[1, 2], [], [3,],];
var x, y:float;
var total = -limite * (2 + 3) % 4;

/* comentário de bloco
   em várias linhas */
func vazio() {
    return;
}

func calcula(a:int, b:float):bool {
    return !(a >= 1 && b < 2.5) || a != 0 == true;
}

workflow semTipo(p:string) {
    var saida, err = run {
        workingDir: p,
        flags: ["-l", "-a"],
        command: "ls",
    };
    stop if err;
}

workflow comTipo():object {
    var r, e = call semTipo("texto com \"aspas\", \\ \t e \n");
    continue if e;
    return {
        nome: "x",
        dados: { lista: [1, 2, 3], ok: false },
    }, null;
}

func main () {
    var obj:object = { a: { b: [0, 1] } };
    var i:int = 0;
    const passo:int = 10 / 2 - 1;

    obj.a.b[0] = 10;
    x, y, obj.a.b[i + 1] = 1.5, 2.0, 7;
    terminal.log(toString(obj.a.b[0]) + nomes[1]);
    vazio();

    while (i < limite && i <= passo) {
        i = i + 1;
        if (i == 2) {
            continue;
        } else {
            if (calcula(i, x) || i > passo) {
                break;
            }
        }
    }

    for linha in matriz {
        for valor in linha {
            terminal.info(toString(valor));
        }
    }

    var resultado, erro = call comTipo();
    abort if erro;
    {}.campo;
    null;
}
