import { createContext, useContext, type ReactNode } from 'react'

interface DocsApi {
  openInEditor(text: string): void
}

const DocsContext = createContext<DocsApi | null>(null)

export function DocsProvider({ openInEditor, children }: DocsApi & { children: ReactNode }) {
  return <DocsContext value={{ openInEditor }}>{children}</DocsContext>
}

export function useDocs(): DocsApi {
  const api = useContext(DocsContext)
  if (!api) throw new Error('useDocs fora de DocsProvider')
  return api
}
