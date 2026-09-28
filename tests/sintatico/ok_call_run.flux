workflow w(p:string):string {
    var r, e = run { command: "ls", };
    stop if e;
    return r, null;
}

func main () {
    var s, err = call w("x");
    abort if err;
    s, err = call w("y");
    proceed if err;
}
