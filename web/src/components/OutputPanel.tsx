import { useEffect, useRef } from 'react'
import type { OutputKind } from '../lib/types'
import type { RunState } from '../lib/useRun'

/**
 * Cada linha ganha a cor e o nome de quem a imprimiu: log em azul, info em
 * ciano, warn em amarelo, error em vermelho, e o erro de execução (fatal) em
 * vermelho forte. O nome escrito evita que a cor seja a única pista.
 */
const KIND: Record<OutputKind, { label: string; tone: string }> = {
  log: { label: 'log', tone: 'text-accent' },
  info: { label: 'info', tone: 'text-info' },
  warn: { label: 'warn', tone: 'text-warn' },
  error: { label: 'error', tone: 'text-bad' },
  fatal: { label: 'fatal', tone: 'font-semibold text-bad' },
  prompt: { label: 'input', tone: 'text-muted' },
  raw: { label: 'saída', tone: 'text-ink' },
  stderr: { label: 'stderr', tone: 'text-bad' },
}

const note = 'px-3 py-1 text-xs'

export function OutputPanel({ state }: { state: RunState }) {
  // Como um terminal: quando chega saída nova, rola até o fim (é onde fica o erro)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (state.phase === 'done') end.current?.scrollIntoView({ block: 'nearest' })
  }, [state])

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
      {r.status === 'rejected' && r.message && (
        <pre className="m-0 px-3 py-2 font-mono text-xs break-words whitespace-pre-wrap text-bad">{r.message}</pre>
      )}
      {r.status !== 'rejected' && r.message && <p className={`${note} text-muted`}>{r.message}</p>}
      {r.output.length > 0 && (
        <ul className="px-3 py-2 font-mono text-xs">
          {r.output.map((line, i) => (
            <li key={i} className="grid grid-cols-[3.5rem_1fr] gap-2 py-px">
              <span className={KIND[line.kind].tone}>{KIND[line.kind].label}</span>
              <span className={`break-words whitespace-pre-wrap ${KIND[line.kind].tone}`}>{line.text}</span>
            </li>
          ))}
        </ul>
      )}
      {r.output.length === 0 && r.status === 'ok' && <p className={`${note} text-muted`}>(sem saída)</p>}
      {r.truncated && <p className={`${note} text-muted`}>A saída passou de 1 MB e foi cortada.</p>}
      <div ref={end} />
    </div>
  )
}
