import type { Token } from '../lib/types'

interface TokenListProps {
  tokens: Token[]
  onSelect: (line: number, column: number, length: number) => void
}

/** Tokens reconhecidos, na ordem do código. Clicar seleciona o trecho no editor. */
export function TokenList({ tokens, onSelect }: TokenListProps) {
  if (tokens.length === 0) {
    return <p className="p-3 text-sm text-muted">Nenhum token reconhecido.</p>
  }
  return (
    <ul className="font-mono text-xs">
      {tokens.map((t, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => onSelect(t.line, t.column, [...t.text].length)}
            className="grid min-h-6 w-full grid-cols-[4rem_9.5rem_1fr] items-center gap-2 px-3 text-left hover:bg-bg focus-visible:bg-bg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            <span className="text-muted">
              {t.line}:{t.column}
            </span>
            <span className="truncate text-accent">{t.type}</span>
            <span className="truncate text-ink">{t.text}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
