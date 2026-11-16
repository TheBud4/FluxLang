import { Callout, Code, H2, P, Table } from '../../blocks'

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
        Ela não pretende substituir linguagens de propósito geral: é pequena, especializada e foi projetada junto com o
        seu compilador.
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
      <P>As declarações globais podem vir em qualquer ordem.</P>

      <H2 title="Primeiro programa" />
      <P>Este programa escreve uma linha no terminal. Use Abrir no editor para compilá-lo e executá-lo.</P>
      <Code lang="flux" example>
        {`func main () {
    terminal.log("Olá, FluxLang!");
}`}
      </Code>
      <Callout kind="nota">Todo programa precisa de uma {mono('func main ()')}. Sem ela, o compilador rejeita o arquivo.</Callout>
    </>
  )
}
