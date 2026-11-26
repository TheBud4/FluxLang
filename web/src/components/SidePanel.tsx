import type { ReactNode } from 'react'
import { nextTabIndex } from '../lib/tabKeys'

export interface SideTab {
  id: string
  label: string
  alert?: boolean
  content: ReactNode
}

interface SidePanelProps {
  tabs: SideTab[]
  active: string
  onActive: (id: string) => void
}

export function SidePanel({ tabs, active, onActive }: SidePanelProps) {
  function handleKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const at = tabs.findIndex((t) => t.id === active)
    const to = nextTabIndex(e.key, at, tabs.length)
    if (to === null) return
    e.preventDefault()
    const next = tabs[to]
    onActive(next.id)
    requestAnimationFrame(() => document.getElementById(`side-tab-${next.id}`)?.focus())
  }

  return (
    <section
      className="flex min-h-80 min-w-0 flex-col overflow-hidden rounded-md border border-line bg-panel lg:min-h-0"
    >
      <div role="tablist" aria-label="Resultados" className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-1">
        {tabs.map((t) => {
          const selected = t.id === active
          return (
            <button
              key={t.id}
              id={`side-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`side-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onActive(t.id)}
              onKeyDown={handleKey}
              className={`min-h-6 rounded-md border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                selected ? 'border-accent bg-bg font-semibold' : 'border-transparent hover:bg-bg'
              } ${t.alert ? 'text-bad' : selected ? 'text-accent' : 'text-ink'}`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          id={`side-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`side-tab-${t.id}`}
          tabIndex={0}
          hidden={t.id !== active}
          className="min-h-0 flex-1 overflow-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          {t.content}
        </div>
      ))}
    </section>
  )
}
