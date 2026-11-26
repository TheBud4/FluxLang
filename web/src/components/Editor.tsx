import { useEffect, useRef } from 'react'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, indentOnInput } from '@codemirror/language'
import { lintGutter, setDiagnostics } from '@codemirror/lint'
import { EditorState, Prec, type Extension, type Range } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view'
import { TOKEN_COLOR } from '../docs/highlight'
import { errorDiagnostics, offsetAt } from '../lib/editorPositions'
import { fluxMarks } from '../lib/fluxMarks'
import type { CompileError, Focus, Token } from '../lib/types'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  errors: CompileError[]
  tokens: Token[]
  focus: Focus | null
  focusKey?: number
  onCompileNow: () => void
}

function buildMarks(doc: string): DecorationSet {
  const ranges: Range<Decoration>[] = fluxMarks(doc).map((m) =>
    Decoration.mark({ class: TOKEN_COLOR[m.cls] }).range(m.from, m.to),
  )
  return Decoration.set(ranges)
}

const fluxHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildMarks(view.state.doc.toString())
    }
    update(update: ViewUpdate) {
      if (update.docChanged) this.decorations = buildMarks(update.state.doc.toString())
    }
  },
  { decorations: (plugin) => plugin.decorations },
)

const theme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    backgroundColor: 'var(--color-panel)',
    color: 'var(--color-ink)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-mono)' },
  '.cm-content': { caretColor: 'var(--color-ink)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-ink)' },
  '.cm-gutters': {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-muted)',
    borderRight: '1px solid var(--color-line)',
  },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)' },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
    color: 'var(--color-ink)',
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection':
    { backgroundColor: 'color-mix(in srgb, var(--color-accent) 25%, transparent)' },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--color-bad)',
    textUnderlineOffset: '3px',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--color-panel)',
    color: 'var(--color-ink)',
    border: '1px solid var(--color-line)',
  },
  '.cm-tooltip-lint .cm-diagnostic-error': { borderLeft: '4px solid var(--color-bad)' },
  '.cm-diagnostic': { color: 'var(--color-ink)' },
})

export function Editor({ value, onChange, errors, tokens, focus, focusKey, onCompileNow }: EditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const onCompileNowRef = useRef(onCompileNow)
  onChangeRef.current = onChange
  onCompileNowRef.current = onCompileNow

  useEffect(() => {
    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      drawSelection(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      bracketMatching(),
      indentOnInput(),
      lintGutter(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onCompileNowRef.current()
              return true
            },
          },
        ]),
      ),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChangeRef.current(update.state.doc.toString())
      }),
      fluxHighlight,
      EditorView.contentAttributes.of({ 'aria-label': 'Código FluxLang' }),
      theme,
    ]
    const created = new EditorView({
      parent: host.current!,
      state: EditorState.create({ doc: value, extensions }),
    })
    view.current = created
    return () => {
      created.destroy()
      view.current = null
    }
    // The view is created once; later values are synced by the effects below.
  }, [])

  useEffect(() => {
    const v = view.current
    if (!v) return
    const current = v.state.doc.toString()
    if (value !== current) v.dispatch({ changes: { from: 0, to: current.length, insert: value } })
  }, [value])

  useEffect(() => {
    const v = view.current
    if (!v) return
    v.dispatch(setDiagnostics(v.state, errorDiagnostics(v.state.doc.toString(), errors, tokens)))
  }, [errors, tokens])

  useEffect(() => {
    const v = view.current
    if (!focus || !v) return
    const doc = v.state.doc.toString()
    let from: number
    let to: number
    if (focus.length) {
      from = offsetAt(doc, focus.line, focus.column)
      to = offsetAt(doc, focus.line, focus.column + focus.length)
    } else {
      from = offsetAt(doc, focus.line, 1)
      const lineNo = Math.min(Math.max(v.state.doc.lineAt(from).number, 1), v.state.doc.lines)
      to = v.state.doc.line(lineNo).to
    }
    v.dispatch({
      selection: { anchor: from, head: to },
      effects: EditorView.scrollIntoView(from, { y: 'center' }),
    })
    v.focus()
  }, [focus])

  useEffect(() => {
    const v = view.current
    if (!focusKey || !v) return
    v.dispatch({ selection: { anchor: 0 }, effects: EditorView.scrollIntoView(0, { y: 'start' }) })
    v.focus()
  }, [focusKey])

  return <div ref={host} className="h-full min-h-0" />
}
