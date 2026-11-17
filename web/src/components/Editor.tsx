import { useEffect, useMemo, useRef, useState } from 'react'
import type { Focus } from '../lib/types'

const LINE_HEIGHT = 20
const PADDING = 8

interface EditorProps {
  value: string
  onChange: (value: string) => void
  errorLines: ReadonlySet<number>
  focus: Focus | null
}

export function Editor({ value, onChange, errorLines, focus }: EditorProps) {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const lineCount = useMemo(() => value.split('\n').length, [value])

  useEffect(() => {
    const el = textarea.current
    if (!focus || !el) return
    const lines = el.value.split('\n')
    const lineIndex = Math.min(Math.max(focus.line - 1, 0), lines.length - 1)
    const lineStart = lines.slice(0, lineIndex).reduce((sum, l) => sum + l.length + 1, 0)
    const start = focus.length ? lineStart + Math.max(focus.column - 1, 0) : lineStart
    const end = focus.length ? start + focus.length : lineStart + lines[lineIndex].length
    el.focus({ preventScroll: true })
    el.setSelectionRange(start, end)
    el.scrollTop = Math.max(0, PADDING + lineIndex * LINE_HEIGHT - el.clientHeight / 2)
  }, [focus])

  return (
    <div className="flex h-full min-h-0 font-mono text-sm leading-5">
      <div
        aria-hidden
        className="w-12 shrink-0 overflow-hidden border-r border-line bg-bg text-right text-muted select-none"
      >
        <div className="pr-2" style={{ transform: `translateY(${PADDING - scrollTop}px)` }}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className={errorLines.has(i + 1) ? 'font-bold text-bad' : ''}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="relative min-w-0 flex-1">
        {[...errorLines].map((line) => (
          <div
            key={line}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-5 bg-bad/15"
            style={{ top: PADDING + (line - 1) * LINE_HEIGHT - scrollTop }}
          />
        ))}
        <textarea
          ref={textarea}
          aria-label="Código FluxLang"
          value={value}
          spellCheck={false}
          wrap="off"
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          className="absolute inset-0 resize-none overflow-auto bg-transparent p-2 whitespace-pre text-ink outline-none"
        />
      </div>
    </div>
  )
}
