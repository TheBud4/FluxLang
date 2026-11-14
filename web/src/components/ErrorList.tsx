import type { CompileError } from '../lib/types'

interface ErrorListProps {
  errors: CompileError[]
  onSelect: (line: number, column: number) => void
}

/** Mensagens de erro (léxicas e sintáticas). Clicar leva à posição no código. */
export function ErrorList({ errors, onSelect }: ErrorListProps) {
  if (errors.length === 0) {
    return <p className="p-3 text-sm text-muted">Nenhum erro.</p>
  }
  return (
    <ul className="text-sm">
      {errors.map((e, i) => (
        <li key={i} className="border-b border-line last:border-b-0">
          <button
            type="button"
            onClick={() => onSelect(e.line, e.column)}
            className="flex w-full items-baseline gap-3 px-3 py-1.5 text-left hover:bg-bg focus-visible:bg-bg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            <span className="w-24 shrink-0 font-mono text-xs font-semibold text-bad">
              {e.kind} {e.line}:{e.column}
            </span>
            <span className="min-w-0 whitespace-pre-wrap text-ink">{e.message}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
