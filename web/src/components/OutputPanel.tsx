import type { RunState } from '../lib/useRun'

const block = 'm-0 px-3 py-2 font-mono text-xs whitespace-pre-wrap break-words'

/** A saída do programa executado: texto normal em tom neutro, erro em vermelho. */
export function OutputPanel({ state }: { state: RunState }) {
  if (state.phase === 'idle') {
    return (
      <p className="p-3 text-sm text-muted">
        Clique em Executar para rodar o programa. Ele roda neste computador, inclusive os comandos de run.
      </p>
    )
  }
  if (state.phase === 'running') return <p className="p-3 text-sm text-muted">Executando...</p>
  if (state.phase === 'failed') return <p className="p-3 text-sm text-bad">{state.message}</p>

  const r = state.result
  const heading =
    r.status === 'ok'
      ? `Terminou com código ${r.exitCode ?? '?'}`
      : r.status === 'timeout'
        ? 'Interrompido: passou de 10 segundos'
        : r.status === 'rejected'
          ? 'Não executou: o programa tem erros'
          : 'Erro interno do compilador'
  const good = r.status === 'ok' && r.exitCode === 0

  return (
    <div role="status" aria-live="polite">
      <p className={`px-3 pt-2 text-xs font-semibold ${good ? 'text-ok' : 'text-bad'}`}>{heading}</p>
      {r.message && <p className="px-3 pt-1 text-xs text-muted">{r.message}</p>}
      {r.stdout && <pre className={`${block} text-ink`}>{r.stdout}</pre>}
      {r.stderr && <pre className={`${block} text-bad`}>{r.stderr}</pre>}
      {!r.stdout && !r.stderr && r.status === 'ok' && <p className="px-3 py-2 text-xs text-muted">(sem saída)</p>}
      {r.truncated && <p className="px-3 pb-2 text-xs text-muted">A saída passou de 1 MB e foi cortada.</p>}
    </div>
  )
}
