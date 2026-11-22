import type { ReactNode } from 'react'

export type DocSection = 'linguagem' | 'compilador'

export interface DocPage {
  id: string
  section: DocSection
  title: string
  summary: string
  Component: () => ReactNode
}
