import { compiladorPages } from './pages/compilador'
import { linguagemPages } from './pages/linguagem'
import type { DocPage, DocSection } from './types'

export const SECTIONS: { id: DocSection; title: string }[] = [
  { id: 'linguagem', title: 'Linguagem' },
  { id: 'compilador', title: 'Compilador' },
]

export const PAGES: DocPage[] = [...linguagemPages, ...compiladorPages]

export function findPage(id: string): DocPage | undefined {
  return PAGES.find((p) => p.id === id)
}

export function neighbors(id: string): { prev?: DocPage; next?: DocPage } {
  const i = PAGES.findIndex((p) => p.id === id)
  if (i < 0) return {}
  return { prev: PAGES[i - 1], next: PAGES[i + 1] }
}
