import type { CompileResult } from '../lib/types'

interface TopBarProps {
  result: CompileResult | null
  loading: boolean
  onCompile: () => void
  semantic: boolean
  onSemantic: (on: boolean) => void
  running: boolean
  onRun: () => void
  view: 'editor' | 'docs'
  onView: (view: 'editor' | 'docs') => void
}

const TABS = [
  { id: 'editor', label: 'Editor' },
  { id: 'docs', label: 'Documentação' },
] as const

const button =
  'rounded-md border border-line bg-panel px-3 py-1 text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function TopBar({
  result,
  loading,
  onCompile,
  semantic,
  onSemantic,
  running,
  onRun,
  view,
  onView,
}: TopBarProps) {
  function handleTabKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const at = TABS.findIndex((t) => t.id === view)
    const step = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : TABS.length - 1
    const next = TABS[(step + TABS.length) % TABS.length]
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
        <>
          <div className="flex items-center gap-2">
            <button type="button" className={button} onClick={onCompile}>
              Compilar
            </button>
            <button
              type="button"
              className="rounded-md border border-accent bg-accent px-3 py-1 text-sm font-semibold text-panel hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
              onClick={onRun}
              disabled={running}
            >
              {running ? 'Executando...' : 'Executar'}
            </button>
            <label className="flex min-h-6 items-center gap-1.5 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                className="size-6 accent-accent"
                checked={semantic}
                onChange={(e) => onSemantic(e.target.checked)}
              />
              Análise semântica
            </label>
          </div>

          <div className="ml-auto flex items-center gap-3 text-sm" role="status" aria-live="polite">
            {result ? (
              <>
                <span
                  className={`rounded-full px-3 py-0.5 font-semibold text-panel ${result.accepted ? 'bg-ok' : 'bg-bad'}`}
                >
                  {result.accepted ? 'Programa aceito' : 'Programa rejeitado'}
                </span>
                <span className="text-muted">
                  {result.lines} {result.lines === 1 ? 'linha' : 'linhas'} · {result.errors.length}{' '}
                  {result.errors.length === 1 ? 'erro' : 'erros'} · {result.tokens.length} tokens
                </span>
              </>
            ) : (
              <span className="text-muted">{loading ? 'Compilando...' : 'Sem resultado'}</span>
            )}
          </div>
        </>
      )}
    </header>
  )
}
