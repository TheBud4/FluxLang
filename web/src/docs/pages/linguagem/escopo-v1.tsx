import { H2, P, PageLink, Table } from '../../blocks'

const mono = (text: string) => <code className="font-mono">{text}</code>

export function EscopoV1() {
  return (
    <>
      <H2 title="Visão geral" />
      <P>
        A primeira versão da FluxLang (a v1) prioriza o núcleo da linguagem: ler o programa, entender a estrutura
        dele, conferir os tipos e executá-lo. Esta página diz o que faz parte dessa versão, o que ficou de fora de
        propósito e o que ainda está em aberto.
      </P>
      <H2 title="O que está na v1" />
      <P>
        Tudo o que as páginas desta seção descrevem faz parte da v1. A tabela resume o conteúdo e aponta para a página
        de cada assunto.
      </P>
      <Table
        head={['Assunto', 'O que a v1 oferece', 'Página']}
        rows={[
          [
            'Estrutura do programa',
            <>Declarações globais em qualquer ordem e uma {mono('func main ()')} obrigatória</>,
            <><PageLink to="linguagem/estrutura">Estrutura do programa</PageLink></>,
          ],
          [
            'Tipos',
            <>{mono('int')}, {mono('float')}, {mono('string')}, {mono('bool')}, {mono('null')}, {mono('list<tipo>')} e {mono('object')}; {mono('var')} e {mono('const')}, com tipo explícito ou inferido</>,
            <><PageLink to="linguagem/tipos">Tipos, variáveis e constantes</PageLink></>,
          ],
          [
            'Listas e objetos',
            <>Literais, índices, {mono('length')}, {mono('push')}, {mono('remove')}, campos dinâmicos</>,
            <><PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink></>,
          ],
          [
            'Operadores',
            'Aritméticos, de comparação e lógicos, em oito níveis de precedência',
            <><PageLink to="linguagem/operadores">Operadores e precedência</PageLink></>,
          ],
          [
            'Controle de fluxo',
            <>{mono('if')} e {mono('else')}, {mono('while')}, {mono('for')} sobre listas, {mono('break')} e {mono('continue')}</>,
            <><PageLink to="linguagem/controle-de-fluxo">Controle de fluxo</PageLink></>,
          ],
          [
            'Funções e workflows',
            <>{mono('func')} com um valor de retorno e {mono('workflow')} com {mono('(resultado, erro)')}, ambos recursivos</>,
            <><PageLink to="linguagem/funcoes">Funções</PageLink> e <PageLink to="linguagem/workflows">Workflows</PageLink></>,
          ],
          [
            'Automação',
            <>{mono('call')} para workflows e {mono('run')} para comandos do sistema</>,
            <><PageLink to="linguagem/call-run-erros">call, run e erros</PageLink></>,
          ],
          [
            'Tratamento de erros',
            <>{mono('stop if')}, {mono('abort if')} e {mono('proceed if')}, com tratamento obrigatório</>,
            <><PageLink to="linguagem/call-run-erros">call, run e erros</PageLink></>,
          ],
          [
            'Biblioteca',
            <>{mono('terminal')} e as conversões {mono('toString')}, {mono('toInt')}, {mono('toFloat')} e {mono('toBool')}</>,
            <><PageLink to="linguagem/biblioteca">Biblioteca</PageLink></>,
          ],
          [
            'Regras e erros',
            'Regras léxicas e semânticas, e os erros L1 a L6, S1 a S3, E1 a E25 e R1 a R7',
            <><PageLink to="linguagem/regras-lexicas">Regras léxicas</PageLink>, <PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink> e <PageLink to="linguagem/erros">Catálogo de erros</PageLink></>,
          ],
        ]}
      />
      <H2 title="O que fica para versões posteriores" />
      <P>
        Duas coisas estão marcadas como fora da v1: as requisições HTTP e as formas tipadas de {mono('object')}.
        Outros recursos avançados também ficam para depois, mas o README não os enumera.
      </P>
      <Table
        head={['Recurso', 'Situação na v1']}
        rows={[
          [
            'Requisições HTTP',
            <>Fora da v1. O {mono('object')} dinâmico foi desenhado pensando nelas, mas a linguagem não tem como fazer uma requisição.</>,
          ],
          [
            <>Formas tipadas de {mono('object')}</>,
            <>Fora da v1. Hoje o {mono('object')} é dinâmico, como um JSON: os campos e os tipos só são conferidos na execução.</>,
          ],
          ['Outros recursos avançados', 'Fora da v1. Não há uma lista fechada deles.'],
        ]}
      />
      <P>
        A base para HTTP, hoje, é o {mono('object')} dinâmico: ele aceita chaves como {mono('"Content-Type"')},
        acessadas com {mono('obj["chave"]')}. O assunto está em <PageLink to="linguagem/listas-objetos">Listas e objetos</PageLink>.
      </P>
      <H2 title="O que a linguagem não tem, por decisão" />
      <P>
        Algumas ausências não são pendências, e sim decisões já tomadas e registradas nas regras da linguagem. Quem
        vem de outra linguagem costuma procurar por elas.
      </P>
      <Table
        head={['Ausência', 'O que usar no lugar', 'Página']}
        rows={[
          [
            mono('else if'),
            <>Um {mono('if')} dentro do bloco do {mono('else')}</>,
            <><PageLink to="linguagem/controle-de-fluxo">Controle de fluxo</PageLink></>,
          ],
          [
            'Valores "verdadeiros" ou "falsos" em condições',
            <>Uma condição {mono('bool')} de verdade</>,
            <><PageLink to="linguagem/controle-de-fluxo">Controle de fluxo</PageLink></>,
          ],
          [
            <>Conversão implícita, exceto {mono('int')} para {mono('float')}</>,
            <>{mono('toInt')}, {mono('toFloat')}, {mono('toString')}, {mono('toBool')}</>,
            <><PageLink to="linguagem/biblioteca">Biblioteca</PageLink></>,
          ],
          [
            'Esconder um nome de fora com um nome igual (shadowing)',
            'Escolher nomes diferentes',
            <><PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink></>,
          ],
          [
            'Comentários de bloco aninhados',
            'Fechar o comentário e abrir outro',
            <><PageLink to="linguagem/regras-lexicas">Regras léxicas</PageLink></>,
          ],
          [
            <>{mono('call')} e {mono('run')} dentro de expressões, ou como comando isolado</>,
            <>Receber o par {mono('(resultado, erro)')} em duas variáveis</>,
            <><PageLink to="linguagem/call-run-erros">call, run e erros</PageLink></>,
          ],
          [
            <>{mono('call')} e {mono('run')} dentro de {mono('func')}</>,
            'Fazer essa parte num workflow',
            <><PageLink to="linguagem/funcoes">Funções</PageLink></>,
          ],
          [
            'Erro de código inalcançável',
            <>O código depois de {mono('return')}, {mono('break')} ou {mono('continue')} é permitido</>,
            <><PageLink to="linguagem/regras-semanticas">Regras semânticas</PageLink></>,
          ],
        ]}
      />
      <H2 title="Em aberto" />
      <P>
        O README ainda lista um item em aberto: a forma dos nós da AST (Trabalho 2). É um assunto interno do
        compilador, não da linguagem, e não muda nada no que um programa FluxLang pode ou não escrever. O compilador
        já tem uma AST, que {mono('./flux --ast')} imprime.
      </P>
      <H2 title="Escolhas do compilador atual que podem mudar" />
      <P>
        Alguns comportamentos não estão definidos nas regras da linguagem: foram escolhidos na implementação, porque a
        especificação não os dizia, e podem ser mudados. Eles aparecem nas páginas anteriores marcados como "o
        compilador atual".
      </P>
      <Table
        head={['Comportamento', 'Escolha do compilador atual']}
        rows={[
          [
            'Saída do terminal',
            <>{mono('terminal.log')} e {mono('info')} vão para a saída padrão, {mono('warn')} e {mono('error')} para a saída de erro, sem prefixo</>,
          ],
          [
            <>Valores {mono('float')} impressos</>,
            <>Na forma mais curta que volta ao mesmo número, com {mono('.0')} se for inteiro ({mono('3.0')}); {mono('inf')} e {mono('nan')} nos casos do IEEE</>,
          ],
          ['Listas e objetos impressos', <>Como {mono('[1, 2]')} e {mono('{a: 1}')}, com as strings entre aspas</>],
          [mono('terminal.input'), <>Aceita 0 ou 1 argumento e devolve {mono('""')} no fim da entrada</>],
          [<>Resultado do {mono('run')}</>, 'A saída padrão inteira, inclusive a quebra de linha do final'],
          [
            'Erro de um comando que não inicia',
            <>{mono("comando 'x' não pôde ser iniciado: <motivo>")}, com o motivo do sistema operacional</>,
          ],
          ['Posição dos erros semânticos', 'A do nome, a do operador ou a do valor errado'],
          [
            'Cores no terminal',
            <>{mono('log')} em azul, {mono('info')} em ciano, {mono('warn')} em amarelo e {mono('error')} em vermelho, só quando a saída é um terminal</>,
          ],
        ]}
      />
      <H2 title="Limitações conhecidas do compilador atual" />
      <P>
        Além das escolhas acima, o compilador tem limitações conhecidas, que não fazem parte da linguagem.
      </P>
      <Table
        head={['Limitação', 'O que acontece']}
        rows={[
          [
            'Erros em cascata',
            <>Uma chave {mono('{')} ou {mono('}')} esquecida, ou um {mono(';')} esquecido antes de {mono('}')}, gera erros extras depois do primeiro (texto solto sem {mono(';')} fora de função já não gera). Veja a recuperação de erros no <PageLink to="linguagem/erros">Catálogo de erros</PageLink>.</>,
          ],
          [
            'Windows',
            <>O {mono('flux')} e a interface web só rodam no Windows via WSL. O programa gerado roda também no Windows.</>,
          ],
          ['macOS', 'Nunca foi testado.'],
          [
            'Entrada interativa na interface web',
            <>A entrada do {mono('terminal.input')} é um campo preenchido antes de executar; não há terminal interativo.</>,
          ],
        ]}
      />
    </>
  )
}
