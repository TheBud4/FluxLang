import { Callout, Code, H2, H3, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function Introducao() {
  return (
    <>
      <H2 title="O que é a FluxLang" />
      <P>
        A FluxLang é uma linguagem tipada voltada à automação de tarefas e à criação de workflows. O programa se
        organiza em workflows reutilizáveis, coordenados por uma função {mono('main')}, com execução declarativa de
        comandos, controle de fluxo, listas, objetos e tratamento explícito de erros.
      </P>
      <P>
        Ela não pretende substituir linguagens de propósito geral como Python ou JavaScript: é pequena, especializada e
        foi projetada junto com o seu compilador.
      </P>
      <Table
        head={['Característica', 'Descrição']}
        rows={[
          ['Propósito', 'Automatizar tarefas e organizar fluxos de execução.'],
          ['Estrutura', <>{mono('main')} mais funções comuns mais workflows.</>],
          ['Foco da v1', 'Execução de comandos. HTTP e recursos avançados ficam para versões futuras.'],
        ]}
      />

      <H2 title="Para quem é esta documentação" />
      <P>
        Esta seção é escrita para quem está aprendendo a linguagem: ela explica cada construção com exemplos que o
        compilador aceita e mostra, quando é útil, a mensagem que ele dá quando algo está errado. Não é preciso saber
        nada sobre o compilador; quem quiser entender como ele funciona por dentro encontra isso na seção Compilador.
      </P>
      <P>
        Quem já programou em outra linguagem vai reconhecer quase tudo: a sintaxe lembra a de C e de JavaScript, com
        tipos escritos depois do nome ({mono('idade:int')}), blocos entre chaves e comandos terminados em ponto e
        vírgula. O que é diferente da maioria das linguagens são os workflows e a forma explícita de tratar erros.
      </P>

      <H2 title="Estrutura de um programa" />
      <Table
        head={['Peça', 'Papel']}
        rows={[
          [mono('main'), 'Ponto de entrada. Exatamente uma, sem parâmetros e sem retorno.'],
          [mono('func'), 'Cálculo e lógica. Retorna um único valor e não usa call nem run.'],
          [mono('workflow'), 'Unidade de automação. Retorna o par (resultado, erro) e é chamado com call.'],
          [mono('var'), 'Variável mutável.'],
          [mono('const'), 'Valor fixo, com valor inicial obrigatório.'],
        ]}
      />
      <P>
        As declarações globais podem vir em qualquer ordem. A página <PageLink to="linguagem/estrutura">Estrutura do
        programa</PageLink> detalha essas regras.
      </P>

      <H2 title="Primeiro programa" />
      <P>Este programa escreve uma linha no terminal. Use Abrir no editor para compilá-lo e executá-lo.</P>
      <Code lang="flux" example>
        {`func main () {
    terminal.log("Olá, FluxLang!");
}`}
      </Code>
      <Code lang="text">{`Olá, FluxLang!`}</Code>
      <P>Cada parte tem uma função:</P>
      <Table
        head={['Trecho', 'O que faz']}
        rows={[
          [mono('func main ()'), 'Declara a função principal. Os parênteses ficam vazios: a main não recebe parâmetros.'],
          [mono('{ ... }'), 'O corpo da função. Todo bloco da linguagem é cercado por chaves.'],
          [mono('terminal.log("...")'), 'Chama a função log do terminal, que imprime um valor na saída padrão.'],
          [mono('"Olá, FluxLang!"'), 'Um texto (string), sempre entre aspas duplas.'],
          [mono(';'), 'Termina um comando simples. Blocos como if, while e func não levam ponto e vírgula.'],
        ]}
      />
      <Callout kind="nota">Todo programa precisa de uma {mono('func main ()')}. Sem ela, o compilador rejeita o arquivo.</Callout>

      <H2 title="Um programa com as três peças" />
      <P>
        O exemplo abaixo junta uma constante global, uma função comum, um workflow e a {mono('main')}, que coordena
        tudo. O workflow devolve o par (resultado, erro), e a {mono('main')} trata o erro com {mono('abort if')} antes
        de usar o resultado.
      </P>
      <Code lang="flux" example>
        {`const saudacao:string = "Olá";

func dobro(n:int):int {
    return n * 2;
}

workflow cumprimentar(nome:string):string {
    terminal.log(saudacao + ", " + nome);
    return "feito", null;
}

func main () {
    var resultado, erro = call cumprimentar("Ana");
    abort if erro;
    terminal.log(resultado);
    terminal.log(dobro(21));
}`}
      </Code>
      <Code lang="text">{`Olá, Ana
feito
42`}</Code>
      <P>
        As funções são explicadas em <PageLink to="linguagem/funcoes">Funções</PageLink>, os workflows em{' '}
        <PageLink to="linguagem/workflows">Workflows</PageLink> e o tratamento de erros em{' '}
        <PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>.
      </P>

      <H2 title="Como executar" />
      <H3 title="No editor da interface" />
      <P>
        Na aba Editor, escreva ou cole o programa (ou use Abrir no editor em qualquer exemplo desta documentação, que
        troca o código do editor e volta para a aba Editor). O código é recompilado sozinho depois que você para de
        digitar, e as mensagens de erro aparecem com a linha e a coluna. A chave Análise semântica liga a
        verificação de tipos e de escopo, além da análise léxica e sintática.
      </P>
      <P>
        O botão Executar compila o programa e o roda. A saída aparece no painel Saída, em ordem, colorida pelo tipo
        de impressão, junto com o código de saída. Se o programa usa {mono('terminal.input')}, aparece o campo
        Entrada do programa: digite uma linha para cada {mono('terminal.input')}, na ordem em que o programa as lê.
      </P>
      <Callout kind="aviso">
        Executar roda o programa de verdade no computador onde a interface está, inclusive os comandos que ele pedir
        em {mono('run')}. Use a interface só em computador seu.
      </Callout>
      <H3 title="Na linha de comando" />
      <P>Com o compilador construído ({mono('make')}), os modos mais usados são:</P>
      <Code lang="bash">
        {`./flux programa.flux            # confere o programa (lexer e parser)
./flux --semantic programa.flux  # confere também tipos e escopo
./flux --run programa.flux       # compila para C, executa e apaga o executável`}
      </Code>
      <P>
        A saída termina com Programa aceito. ou Programa rejeitado., e {mono('--run')} termina com o código de saída do
        próprio programa FluxLang. Todas as opções estão na seção Compilador.
      </P>

      <H2 title="Como esta documentação está organizada" />
      <Table
        head={['Página', 'Assunto']}
        rows={[
          [<PageLink to="linguagem/estrutura">Estrutura do programa</PageLink>, 'main, ordem das declarações, func, workflow, var, const e escopo.'],
          [<PageLink to="linguagem/tipos">Tipos, variáveis e constantes</PageLink>, 'Os tipos, declarações, inferência e conversões.'],
          [<PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink>, 'Literais, índices, métodos, campos dinâmicos e referências.'],
          [<PageLink to="linguagem/operadores">Operadores e precedência</PageLink>, 'Todos os operadores, as regras de tipo e a ordem de avaliação.'],
          [<PageLink to="linguagem/controle-de-fluxo">Controle de fluxo</PageLink>, 'if, while, for, break e continue.'],
          [<PageLink to="linguagem/funcoes">Funções</PageLink>, 'func, parâmetros e retorno.'],
          [<PageLink to="linguagem/workflows">Workflows</PageLink>, 'workflow, o par (resultado, erro) e call.'],
          [<PageLink to="linguagem/call-run-erros">call, run e erros</PageLink>, 'Executar comandos e tratar erros com stop, abort e proceed.'],
          [<PageLink to="linguagem/biblioteca">Biblioteca</PageLink>, 'terminal e as conversões.'],
          [<PageLink to="linguagem/regras-lexicas">Regras léxicas</PageLink>, 'Identificadores, strings, números, comentários e palavras reservadas.'],
          [<PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink>, 'O que o compilador confere depois do parse.'],
          [<PageLink to="linguagem/erros">Catálogo de erros</PageLink>, 'Todos os erros, com causa, exemplo e mensagem.'],
          [<PageLink to="linguagem/exemplo-integrado">Exemplo integrado</PageLink>, 'Um programa completo comentado.'],
          [<PageLink to="linguagem/escopo-v1">Escopo da v1</PageLink>, 'O que a primeira versão cobre e o que ficou de fora.'],
        ]}
      />
      <P>
        Os blocos de código marcados como exemplo têm o botão Abrir no editor e são programas completos que o
        compilador aceita. Os outros blocos mostram trechos ou programas com erro, seguidos da mensagem que o
        compilador realmente imprime.
      </P>
    </>
  )
}
