import type { DocPage } from '../../types'
import { Introducao } from './introducao'

export const linguagemPages: DocPage[] = [
  {
    id: 'linguagem/introducao',
    section: 'linguagem',
    title: 'Introdução',
    summary: 'O que é a FluxLang, para que serve e como é o primeiro programa.',
    Component: Introducao,
  },
]
