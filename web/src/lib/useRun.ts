import { useCallback, useRef, useState } from 'react'
import type { RunResult } from './types'

export type RunState =
  | { phase: 'idle' }
  | { phase: 'running' }
  | { phase: 'done'; result: RunResult }
  | { phase: 'failed'; message: string }

/**
 * Executa o programa pelo servidor (`POST /api/run`): ele compila, roda neste
 * computador e devolve a saída. O cabeçalho X-Flux-Run é o que o servidor exige
 * para aceitar o pedido: um outro site aberto no navegador não consegue enviá-lo.
 */
export function useRun() {
  const [state, setState] = useState<RunState>({ phase: 'idle' })
  const pending = useRef<AbortController | null>(null)

  const run = useCallback(async (source: string) => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller
    setState({ phase: 'running' })
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Flux-Run': '1' },
        body: source,
        signal: controller.signal,
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? `Erro ${response.status}`)
      setState({ phase: 'done', result: body as RunResult })
    } catch (e) {
      if (controller.signal.aborted) return
      setState({ phase: 'failed', message: e instanceof Error ? e.message : String(e) })
    }
  }, [])

  return { state, run }
}
