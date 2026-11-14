import { useRef } from 'react'
import type { CompileResult } from '../lib/types'

interface TopBarProps {
  result: CompileResult | null
  loading: boolean
  onOpenFile: (name: string, text: string) => void
  onCompile: () => void
  samples: { label: string; text: string }[]
  onSample: (text: string) => void
  semantic: boolean
  onSemantic: (on: boolean) => void
}

const button =
  'rounded-md border border-line bg-panel px-3 py-1 text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function TopBar({
  result,
  loading,
  onOpenFile,
  onCompile,
  samples,
  onSample,
  semantic,
  onSemantic,
}: TopBarProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    onOpenFile(file.name, await file.text())
    if (fileInput.current) fileInput.current.value = '' // permite abrir o mesmo arquivo de novo
  }

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-panel px-3 py-2">
      <h1 className="text-base font-bold tracking-tight">FluxLang</h1>

      <div className="flex items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept=".flux,.txt,text/plain"
          className="sr-only"
          id="open-file"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <label htmlFor="open-file" className={`${button} cursor-pointer`}>
          Abrir arquivo
        </label>
        <button type="button" className={button} onClick={onCompile}>
          Compilar
        </button>
        {samples.map((s) => (
          <button key={s.label} type="button" className={button} onClick={() => onSample(s.text)}>
            {s.label}
          </button>
        ))}
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
    </header>
  )
}
