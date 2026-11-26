import { nextTabIndex } from '../lib/tabKeys'
import { OptionsMenu } from './OptionsMenu'

interface TopBarProps {
  view: 'editor' | 'docs'
  onView: (view: 'editor' | 'docs') => void
  running: boolean
  onRun: () => void
  semantic: boolean
  onSemantic: (on: boolean) => void
}

const TABS = [
  { id: 'editor', label: 'Editor' },
  { id: 'docs', label: 'Documentação' },
] as const

export function TopBar({ view, onView, running, onRun, semantic, onSemantic }: TopBarProps) {
  function handleTabKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const at = TABS.findIndex((t) => t.id === view)
    const to = nextTabIndex(e.key, at, TABS.length)
    if (to === null) return
    e.preventDefault()
    const next = TABS[to]
    onView(next.id)
    requestAnimationFrame(() => document.getElementById(`tab-${next.id}`)?.focus())
  }

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-panel px-3 py-2">
      {view === 'docs' ? (
        <p className="text-base font-bold tracking-tight">FluxLang</p>
      ) : (
        <h1 className="text-base font-bold tracking-tight">FluxLang</h1>
      )}

      <div role="tablist" aria-label="Telas" className="flex items-center gap-1">
        {TABS.map((t) => {
          const selected = t.id === view
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onView(t.id)}
              onKeyDown={handleTabKey}
              className={`min-h-6 rounded-md border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                selected ? 'border-accent bg-bg font-semibold text-accent' : 'border-transparent text-ink hover:bg-bg'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {view === 'editor' && (
        <div className="ml-auto flex items-center gap-2">
          <OptionsMenu semantic={semantic} onSemantic={onSemantic} />
          <button
            type="button"
            className="rounded-md border border-accent bg-accent px-3 py-1 text-sm font-semibold text-panel hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
            onClick={onRun}
            disabled={running}
          >
            {running ? 'Executando...' : 'Executar'}
          </button>
        </div>
      )}
    </header>
  )
}
