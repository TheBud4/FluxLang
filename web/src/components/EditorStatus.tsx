import type { CompileResult } from '../lib/types'

interface EditorStatusProps {
  result: CompileResult | null
  loading: boolean
}

export function EditorStatus({ result, loading }: EditorStatusProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-1 text-xs"
    >
      {result ? (
        <>
          <span className="flex items-center gap-1.5 font-semibold">
            <span aria-hidden="true" className={`size-2 rounded-full ${result.accepted ? 'bg-ok' : 'bg-bad'}`} />
            {result.accepted ? 'aceito' : 'rejeitado'}
          </span>
          <span className="text-muted">
            {result.lines} {result.lines === 1 ? 'linha' : 'linhas'} · {result.errors.length}{' '}
            {result.errors.length === 1 ? 'erro' : 'erros'} · {result.tokens.length} {result.tokens.length === 1 ? 'token' : 'tokens'}
          </span>
        </>
      ) : (
        <span className="text-muted">{loading ? 'Compilando...' : 'Sem resultado'}</span>
      )}
    </div>
  )
}
