import { Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function ControleDeFluxo() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        Os comandos de controle de fluxo decidem quais comandos rodam e quantas vezes. A FluxLang tem um condicional
        ({mono('if')} com {mono('else')} opcional), dois laços ({mono('while')} e {mono('for item in lista')}) e os
        comandos {mono('break')} e {mono('continue')}, que só valem dentro de laços. Todos usam chaves em volta do
        corpo, e toda condição precisa ser {mono('bool')}.
      </P>
      <Table
        head={['Comando', 'Forma', 'Quando usar']}
        rows={[
          [mono('if'), mono('if (cond) { ... } else { ... }'), 'Executar um bloco ou outro conforme uma condição.'],
          [mono('while'), mono('while (cond) { ... }'), 'Repetir enquanto a condição for verdadeira.'],
          [mono('for'), mono('for item in lista { ... }'), 'Visitar cada elemento de uma lista.'],
          [mono('break'), mono('break;'), 'Sair do laço mais interno.'],
          [mono('continue'), mono('continue;'), 'Pular para a próxima volta do laço mais interno.'],
        ]}
      />

      <H2 title="Condicional: if e else" />
      <P>
        O {mono('if')} testa uma condição entre parênteses e executa o bloco seguinte se ela for verdadeira. O{' '}
        {mono('else')} é opcional e, quando existe, é sempre seguido de um bloco.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var idade = 17;
    if (idade >= 18) {
        terminal.log("Maior de idade");
    } else {
        terminal.log("Menor de idade");
    }
    if (idade == 17) {
        terminal.log("Faz 18 no ano que vem");
    }
}`}
      </Code>
      <Code lang="text">
        {`Menor de idade
Faz 18 no ano que vem`}
      </Code>

      <H3 title="Não existe else if" />
      <P>
        A linguagem não tem {mono('else if')}. Para testar mais de um caso, coloque outro {mono('if')} dentro do bloco
        do {mono('else')}.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 5;
    if (x > 3) {
        terminal.log("grande");
    } else if (x > 1) {
        terminal.log("médio");
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 5, coluna 12]:
Token encontrado: palavra reservada 'if'
Esperado: '{'`}
      </Code>
      <P>A forma correta aninha o segundo {mono('if')} dentro de um bloco:</P>
      <Code lang="flux" example>
        {`func classificar(x:int):string {
    if (x > 3) {
        return "grande";
    } else {
        if (x > 1) {
            return "médio";
        } else {
            return "pequeno";
        }
    }
}

func main () {
    terminal.log(classificar(5));
    terminal.log(classificar(2));
    terminal.log(classificar(0));
}`}
      </Code>
      <Code lang="text">
        {`grande
médio
pequeno`}
      </Code>

      <H3 title="A condição precisa ser bool" />
      <P>
        Não há valores "verdadeiros" ou "falsos": um número, um texto ou uma lista não serve como condição. Use uma
        comparação, como {mono('x != 0')}. Isso vale para o {mono('if')} e para o {mono('while')}.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 5;
    if (x) {
        terminal.log("diferente de zero");
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 9]:
A condição do 'if' deve ser bool, encontrado int.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    while (x) {
        x = x - 1;
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 12]:
A condição do 'while' deve ser bool, encontrado int.`}
      </Code>

      <H3 title="Parênteses e chaves são obrigatórios" />
      <P>
        A condição de {mono('if')} e de {mono('while')} fica entre parênteses, e o corpo de todos os comandos fica entre
        chaves, mesmo quando tem um único comando.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 5;
    if x > 3 {
        terminal.log("grande");
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 8]:
Token encontrado: identificador 'x'
Esperado: '('`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = 3;
    while (x > 0) x = x - 1;
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 3, coluna 19]:
Token encontrado: identificador 'x'
Esperado: '{'`}
      </Code>

      <H2 title="Repetição com while" />
      <P>
        O {mono('while')} avalia a condição antes de cada volta e repete o bloco enquanto ela for {mono('true')}. Se a
        condição já começa falsa, o corpo nunca executa. O corpo precisa, em algum ponto, mudar algo que a condição
        testa, ou sair com {mono('break')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var tentativas = 0;
    while (tentativas < 3) {
        tentativas = tentativas + 1;
        terminal.log("tentativa " + toString(tentativas));
    }
    terminal.log("fim");
}`}
      </Code>
      <Code lang="text">
        {`tentativa 1
tentativa 2
tentativa 3
fim`}
      </Code>

      <H2 title="Percorrendo uma lista com for" />
      <P>
        O {mono('for item in lista')} executa o bloco uma vez para cada elemento, na ordem da lista. Não há parênteses
        em volta de {mono('item in lista')}. A expressão depois de {mono('in')} precisa ser uma lista, e o tipo de{' '}
        {mono('item')} é inferido dela: numa {mono('list<int>')}, {mono('item')} é {mono('int')}.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var precos:list<float> = [10.5, 20.0, 4.25];
    var total = 0.0;
    for preco in precos {
        total = total + preco;
    }
    terminal.log(total);
    for nome in ["Ana", "Bruno"] {
        terminal.log("Olá, " + nome);
    }
}`}
      </Code>
      <Code lang="text">
        {`34.75
Olá, Ana
Olá, Bruno`}
      </Code>
      <P>
        As listas estão descritas em <PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink>. Uma string
        não é uma lista, então não pode ser percorrida:
      </P>
      <Code lang="flux">
        {`func main () {
    for c in "abc" {
        terminal.log(c);
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 14]:
'for' exige uma lista, encontrado string.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    for (item in [1, 2]) {
        terminal.log(item);
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro sintático [linha 2, coluna 9]:
Token encontrado: '('
Esperado: identificador`}
      </Code>

      <H2 title="break e continue" />
      <P>
        {mono('break;')} encerra o laço mais interno e continua no comando seguinte a ele. {mono('continue;')} abandona
        a volta atual e vai para a próxima: no {mono('while')}, o próximo teste da condição; no {mono('for')}, o
        próximo elemento. Os dois valem tanto em {mono('while')} quanto em {mono('for')}, e podem estar dentro de um{' '}
        {mono('if')} que esteja dentro do laço.
      </P>
      <Code lang="flux" example>
        {`func main () {
    var n = 0;
    while (true) {
        n = n + 1;
        if (n == 2) {
            continue;
        }
        if (n > 4) {
            break;
        }
        terminal.log(n);
    }
    for linha in ["a", "b"] {
        for numero in [1, 2, 3] {
            if (numero == 2) {
                break;
            }
            terminal.log(linha + toString(numero));
        }
    }
}`}
      </Code>
      <Code lang="text">
        {`1
3
4
a1
b1`}
      </Code>
      <P>
        No segundo par de laços, o {mono('break')} sai só do laço de {mono('numero')}; o laço de {mono('linha')}{' '}
        continua. Fora de um laço, os dois comandos são erro:
      </P>
      <Code lang="flux">
        {`func main () {
    break;
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 2, coluna 5]:
'break' fora de um laço.`}
      </Code>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    if (x > 0) {
        continue;
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 4, coluna 9]:
'continue' fora de um laço.`}
      </Code>
      <P>
        O {mono('if')} não é um laço: um {mono('continue')} dentro dele só é aceito se o próprio {mono('if')} estiver
        dentro de um {mono('while')} ou de um {mono('for')}.
      </P>

      <H2 title="Escopo dos blocos" />
      <P>
        Cada bloco {mono('{ ... }')} de {mono('if')}, {mono('else')}, {mono('while')} e {mono('for')} cria um escopo. Uma
        variável existe da declaração até o fim do bloco onde foi declarada, e a variável do {mono('for')} existe só
        dentro do laço.
      </P>
      <Code lang="flux">
        {`func main () {
    for i in [1, 2] {
        var dobro = i * 2;
    }
    terminal.log(i);
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 5, coluna 18]:
'i' não foi declarado.`}
      </Code>
      <P>
        Não há shadowing: declarar um nome que já está visível, inclusive de um escopo externo, é erro. Blocos irmãos,
        que não estão um dentro do outro, podem usar o mesmo nome.
      </P>
      <Code lang="flux">
        {`func main () {
    var x = 1;
    for x in [1, 2] {
        terminal.log(x);
    }
}`}
      </Code>
      <Code lang="text">
        {`Erro semântico [linha 3, coluna 9]:
'x' já foi declarada.`}
      </Code>
      <Code lang="flux" example>
        {`func main () {
    for i in [1, 2] {
        terminal.log(i);
    }
    for i in [3, 4] {
        terminal.log(i);
    }
    if (true) {
        var texto = "um";
        terminal.log(texto);
    } else {
        var texto = "dois";
        terminal.log(texto);
    }
}`}
      </Code>
      <Code lang="text">
        {`1
2
3
4
um`}
      </Code>
      <P>
        As regras completas de escopo estão em <PageLink to="linguagem/estrutura">Estrutura do programa</PageLink> e em{' '}
        <PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink>.
      </P>

      <H2 title="Resumo dos erros deste assunto" />
      <Table
        head={['Situação', 'Código', 'Mensagem']}
        rows={[
          [mono('else if'), 'S1', mono("Token encontrado: palavra reservada 'if' / Esperado: '{'")],
          [mono('if (x)'), 'E5', mono("A condição do 'if' deve ser bool, encontrado int.")],
          [mono('for c in "abc"'), 'E16', mono("'for' exige uma lista, encontrado string.")],
          [mono('break'), 'E10', mono("'break' fora de um laço.")],
          [mono('continue'), 'E10', mono("'continue' fora de um laço.")],
          ['Nome já visível', 'E2', mono("'x' já foi declarada.")],
        ]}
      />
      <P>
        O catálogo completo, com todos os códigos, está em{' '}
        <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.
      </P>
    </>
  )
}
