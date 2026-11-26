import type { CompileError, Token } from './types'

export interface EditorDiagnostic {
  from: number
  to: number
  severity: 'error'
  message: string
}

/** Start and end (exclusive, before the '\n') offsets of a 1-based line, or null when the line does not exist. */
function lineSpan(doc: string, line: number): { start: number; end: number } | null {
  let start = 0
  for (let current = 1; ; current++) {
    const newline = doc.indexOf('\n', start)
    if (current === line) return { start, end: newline === -1 ? doc.length : newline }
    if (newline === -1) return null
    start = newline + 1
  }
}

/**
 * Converts a compiler position (1-based line, 1-based column counted in code points)
 * into a CodeMirror offset (UTF-16 code units).
 */
export function offsetAt(doc: string, line: number, column: number): number {
  if (line < 1) return 0
  const span = lineSpan(doc, line)
  if (!span) return doc.length
  const text = doc.slice(span.start, span.end)
  const maxColumn = [...text].length + 1
  const clamped = Math.min(Math.max(column, 1), maxColumn)
  return span.start + [...text].slice(0, clamped - 1).join('').length
}

export function errorDiagnostics(doc: string, errors: CompileError[], tokens: Token[]): EditorDiagnostic[] {
  return errors.map((error) => {
    let from = offsetAt(doc, error.line, error.column)
    const token = tokens.find((t) => t.line === error.line && t.column === error.column)
    let to: number
    if (token) {
      to = Math.min(offsetAt(doc, error.line, error.column + [...token.text].length), doc.length)
    } else {
      const span = lineSpan(doc, error.line)
      const lineEnd = span ? span.end : doc.length
      to = Math.min(from + 1, lineEnd)
    }
    if (from >= doc.length) {
      from = Math.max(0, doc.length - 1)
      to = doc.length
    }
    to = Math.max(to, from)
    return { from, to, severity: 'error', message: `[${error.kind}] ${error.message}` }
  })
}
