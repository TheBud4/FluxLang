import type { DocPage } from '../../types'
import { Biblioteca } from './biblioteca'
import { CallRunErros } from './call-run-erros'
import { ControleDeFluxo } from './controle-de-fluxo'
import { Estrutura } from './estrutura'
import { Funcoes } from './funcoes'
import { Introducao } from './introducao'
import { ListasObjetos } from './listas-objetos'
import { Operadores } from './operadores'
import { RegrasLexicas } from './regras-lexicas'
import { RegrasSemanticas } from './regras-semanticas'
import { Tipos } from './tipos'
import { Workflows } from './workflows'

export const linguagemPages: DocPage[] = [
  {
    id: 'linguagem/introducao',
    section: 'linguagem',
    title: 'Introdução',
    summary: 'O que é a FluxLang, para que serve, como é o primeiro programa e como executá-lo.',
    Component: Introducao,
  },
  {
    id: 'linguagem/estrutura',
    section: 'linguagem',
    title: 'Estrutura do programa',
    summary: 'A função main, a ordem das declarações, func, workflow, var, const e o escopo dos nomes.',
    Component: Estrutura,
  },
  {
    id: 'linguagem/tipos',
    section: 'linguagem',
    title: 'Tipos, variáveis e constantes',
    summary: 'int, float, string, bool e null; declarações, inferência de tipo, const e conversões.',
    Component: Tipos,
  },
  {
    id: 'linguagem/listas-objetos',
    section: 'linguagem',
    title: 'Listas e objetos',
    summary: 'list<tipo> e object: literais, índices, métodos, campos dinâmicos e semântica de referência.',
    Component: ListasObjetos,
  },
  {
    id: 'linguagem/operadores',
    section: 'linguagem',
    title: 'Operadores e precedência',
    summary: 'Todos os operadores, os oito níveis de precedência e as regras de tipo de cada um.',
    Component: Operadores,
  },
  {
    id: 'linguagem/controle-de-fluxo',
    section: 'linguagem',
    title: 'Controle de fluxo',
    summary: 'if e else, while, for, break e continue, condições bool e o escopo dos blocos.',
    Component: ControleDeFluxo,
  },
  {
    id: 'linguagem/funcoes',
    section: 'linguagem',
    title: 'Funções',
    summary: 'Declaração, parâmetros, valor de retorno, funções sem retorno e recursão.',
    Component: Funcoes,
  },
  {
    id: 'linguagem/workflows',
    section: 'linguagem',
    title: 'Workflows',
    summary: 'A unidade de automação: retorno (resultado, erro), chamada com call e erros próprios.',
    Component: Workflows,
  },
  {
    id: 'linguagem/call-run-erros',
    section: 'linguagem',
    title: 'call, run e erros',
    summary: 'Onde call e run aparecem, o que run devolve, stop if, abort if, proceed if e os erros de execução.',
    Component: CallRunErros,
  },
  {
    id: 'linguagem/biblioteca',
    section: 'linguagem',
    title: 'Biblioteca',
    summary: 'terminal, as conversões toString, toInt, toFloat e toBool e o que já vem declarado.',
    Component: Biblioteca,
  },
  {
    id: 'linguagem/regras-lexicas',
    section: 'linguagem',
    title: 'Regras léxicas',
    summary: 'Maiúsculas e minúsculas, identificadores, palavras reservadas, números, textos, comentários e o maior casamento.',
    Component: RegrasLexicas,
  },
  {
    id: 'linguagem/regras-semanticas',
    section: 'linguagem',
    title: 'Regras semânticas',
    summary: 'Escopo, inicialização, tipos, chamadas, retorno e tratamento de erros, cada regra com o seu código E.',
    Component: RegrasSemanticas,
  },
]
