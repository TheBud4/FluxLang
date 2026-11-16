import { useRef } from 'react'
import { PAGES, SECTIONS } from './registry'
import { useModal } from './useModal'
import { useOverflowFocus } from './useOverflowFocus'

interface DocsNavProps {
  pageId: string
  className?: string
  onNavigate?: (id: string) => void
}

export function DocsNav({ pageId, className = '', onNavigate }: DocsNavProps) {
  const [navRef, tabIndex] = useOverflowFocus<HTMLElement>()
  return (
    <nav
      ref={navRef}
      aria-label="Documentação"
      tabIndex={tabIndex}
      className={`overflow-auto bg-panel p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {SECTIONS.map((section) => {
        const pages = PAGES.filter((p) => p.section === section.id)
        if (pages.length === 0) return null
        return (
          <div key={section.id} className="mb-4 last:mb-0">
            <h2 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">{section.title}</h2>
            <ul className="m-0 list-none p-0">
              {pages.map((p) => {
                const current = p.id === pageId
                return (
                  <li key={p.id}>
                    <a
                      href={`#/doc/${p.id}`}
                      aria-current={current ? 'page' : undefined}
                      onClick={() => onNavigate?.(p.id)}
                      className={`flex min-h-6 items-center rounded px-2 py-1 text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent ${
                        current ? 'bg-bg font-semibold text-accent' : 'text-ink'
                      }`}
                    >
                      {p.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

interface DocsDrawerProps {
  pageId: string
  onNavigate: (id: string) => void
  onClose: () => void
}

export function DocsDrawer({ pageId, onNavigate, onClose }: DocsDrawerProps) {
  const dialog = useRef<HTMLDivElement>(null)
  useModal(dialog, onClose, 'nav a')

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Menu da documentação"
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-panel"
      >
        <div className="flex items-center justify-between border-b border-line p-3">
          <span className="text-sm font-semibold text-ink">Documentação</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-8 rounded border border-line bg-panel px-3 text-sm text-ink hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent"
          >
            Fechar
          </button>
        </div>
        <DocsNav pageId={pageId} onNavigate={onNavigate} className="min-h-0 flex-1" />
      </div>
    </div>
  )
}
