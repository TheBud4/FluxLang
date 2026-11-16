import { useEffect, useMemo, useRef, useState } from 'react'
import { getIndex, search } from './searchIndex'
import { useModal } from './useModal'

const MAX_HITS = 8

interface DocsSearchProps {
  onChoose: (id: string) => void
  onClose: () => void
}

export function DocsSearch({ onChoose, onClose }: DocsSearchProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [index] = useState(getIndex)
  const hits = useMemo(() => search(index, query).slice(0, MAX_HITS), [index, query])
  const current = hits[Math.min(active, hits.length - 1)]

  useModal(dialog, onClose, 'input')

  useEffect(() => {
    if (current) document.getElementById(`busca-${current.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [current])

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (hits.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % hits.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + hits.length) % hits.length)
    } else if (e.key === 'Enter' && current) {
      e.preventDefault()
      onChoose(current.id)
    }
  }

  const trimmed = query.trim()
  const status =
    hits.length > 0
      ? `${hits.length} ${hits.length === 1 ? 'resultado' : 'resultados'}`
      : trimmed
        ? `Nenhum resultado para ${trimmed}`
        : 'Digite para buscar. Setas escolhem, Enter abre, Esc fecha.'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[10dvh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar na documentação"
        className="flex max-h-[80dvh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-line bg-panel"
      >
        <div className="flex items-center gap-2 border-b border-line p-3">
          <input
            type="text"
            role="combobox"
            aria-label="Buscar"
            aria-autocomplete="list"
            aria-expanded={hits.length > 0}
            aria-controls={hits.length > 0 ? 'busca-lista' : undefined}
            aria-activedescendant={current ? `busca-${current.id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder="Buscar na documentação"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            className="min-h-8 min-w-0 flex-1 rounded border border-line bg-bg px-2 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
          />
          <button
            type="button"
            onClick={onClose}
            className="min-h-8 rounded border border-line bg-panel px-3 text-sm text-ink hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent"
          >
            Fechar
          </button>
        </div>
        <p role="status" className="px-3 py-2 text-xs text-muted">
          {status}
        </p>
        {hits.length > 0 && (
          <ul
            id="busca-lista"
            role="listbox"
            aria-label="Resultados"
            className="m-0 min-h-0 list-none overflow-auto p-1 pt-0"
          >
            {hits.map((hit) => (
              <li
                key={hit.id}
                id={`busca-${hit.id}`}
                role="option"
                aria-selected={hit.id === current?.id}
                onMouseMove={() => setActive(hits.indexOf(hit))}
                onClick={() => onChoose(hit.id)}
                className={`cursor-pointer rounded px-3 py-2 ${hit.id === current?.id ? 'bg-bg' : ''}`}
              >
                <span className="block text-sm font-semibold text-ink">{hit.title}</span>
                <span className="line-clamp-2 block text-xs text-muted">{hit.snippet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
