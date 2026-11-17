import { useCallback, useEffect, useRef, useState } from 'react'
import type { CompileResult } from './types'

const DEBOUNCE_MS = 400

interface State {
  result: CompileResult | null
  loading: boolean
  /** Falha do servidor ou do compilador (não confundir com erros do programa). */
  failure: string | null
}

/**
 * Compila `source` chamando `POST /api/compile`. Recompila sozinho 400 ms depois
 * da última alteração (a primeira vez é na hora) e descarta respostas de
 * pedidos que já foram substituídos por outros mais novos.
 */
export function useCompile(source: string, semantic: boolean) {
  const [state, setState] = useState<State>({ result: null, loading: true, failure: null })
  const pending = useRef<AbortController | null>(null)
  const first = useRef(true)

  const run = useCallback(async (text: string, withSemantic: boolean) => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller
    setState((s) => ({ ...s, loading: true }))
    try {
      const response = await fetch(`/api/compile${withSemantic ? '?semantic=1' : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: text,
        signal: controller.signal,
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? `Erro ${response.status}`)
      setState({ result: body as CompileResult, loading: false, failure: null })
    } catch (e) {
      if (controller.signal.aborted) return
      const failure = e instanceof Error ? e.message : String(e)
      setState((s) => ({ ...s, loading: false, failure }))
    }
  }, [])

  useEffect(() => {
    const delay = first.current ? 0 : DEBOUNCE_MS
    first.current = false
    const timer = setTimeout(() => run(source, semantic), delay)
    return () => clearTimeout(timer)
  }, [source, semantic, run])

  return { ...state, compileNow: () => run(source, semantic) }
}
