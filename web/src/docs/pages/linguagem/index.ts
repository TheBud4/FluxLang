import type { DocPage } from '../../types'
import { Estrutura } from './estrutura'
import { Introducao } from './introducao'
import { ListasObjetos } from './listas-objetos'
import { Operadores } from './operadores'
import { Tipos } from './tipos'

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
]
