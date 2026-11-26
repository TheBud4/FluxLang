import { useEffect, useMemo, useRef, useState } from 'react'
import { ErrorList } from './components/ErrorList'
import { Editor } from './components/Editor'
import { Panel } from './components/Panel'
import { TokenList } from './components/TokenList'
import { TopBar } from './components/TopBar'
import { TreeView } from './components/TreeView'
import { countNodes } from './lib/tree'
import type { Focus } from './lib/types'
import { useCompile } from './lib/useCompile'
import { useRun } from './lib/useRun'
import { InputBox } from './components/InputBox'
import { OutputPanel } from './components/OutputPanel'
import { DocsProvider } from './docs/DocsContext'
import { DocsView } from './docs/DocsView'
import { useHashRoute } from './docs/useHashRoute'

const HELLO = `func main () {
    terminal.log("Hello, world!");
}
`

const checkbox = 'size-6 accent-accent'
const smallButton =
  'min-h-6 rounded border border-line px-2 text-xs hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent'

export default function App() {
  const [source, setSource] = useState(HELLO)
  const [focus, setFocus] = useState<Focus | null>(null)
  const [hideRest, setHideRest] = useState(false)
  const [semantic, setSemantic] = useState(true)
  const [stdin, setStdin] = useState('')
  const [expand, setExpand] = useState({ key: 0, all: true })
  const [editorFocus, setEditorFocus] = useState(0)
  const focusPending = useRef(false)
  const { result, loading, failure, compileNow } = useCompile(source, semantic)
  const { state: runState, run } = useRun()
  const { view, pageId, missing, goDoc, goEditor } = useHashRoute()

  useEffect(() => {
    if (view !== 'editor' || !focusPending.current) return
    focusPending.current = false
    setEditorFocus((n) => n + 1)
  }, [view])

  const usesInput = useMemo(() => /\bterminal\s*\.\s*input\b/.test(source), [source])

  const errorLines = useMemo(() => new Set(result?.errors.map((e) => e.line) ?? []), [result])

  const goTo = (line: number, column: number, length?: number) =>
    setFocus({ line, column, length, nonce: Date.now() })

  return (
    <div className="flex h-dvh flex-col">
      <TopBar
        result={result}
        loading={loading}
        onCompile={compileNow}
        semantic={semantic}
        onSemantic={setSemantic}
        running={runState.phase === 'running'}
        onRun={() => run(source, stdin)}
        view={view}
        onView={(v) => (v === 'docs' ? goDoc(pageId) : goEditor())}
      />

      {view === 'editor' && failure && (
        <p role="alert" className="border-b border-line bg-bad/15 px-3 py-2 text-sm text-bad">
          {failure}
        </p>
      )}

      <main hidden={view === 'docs'} className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-auto p-2 lg:grid-cols-[1.3fr_0.8fr_1.2fr] lg:grid-rows-[minmax(0,1fr)_11rem]">
        <Panel title="Código" className="h-96 lg:h-auto">
          <Editor value={source} onChange={setSource} errorLines={errorLines} focus={focus} focusKey={editorFocus} />
        </Panel>

        <Panel title={`Tokens (${result?.tokens.length ?? 0})`} className="h-72 lg:h-auto">
          <TokenList tokens={result?.tokens ?? []} onSelect={goTo} />
        </Panel>

        <Panel
          title={`Árvore sintática${result?.tree ? ` (${countNodes(result.tree)} nós)` : ''}`}
          className="h-96 lg:h-auto"
          actions={
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                <input
                  type="checkbox"
                  className={checkbox}
                  checked={hideRest}
                  onChange={(e) => setHideRest(e.target.checked)}
                />
                ocultar *_rest
              </label>
              <button type="button" className={smallButton} onClick={() => setExpand((s) => ({ key: s.key + 1, all: true }))}>
                Expandir
              </button>
              <button type="button" className={smallButton} onClick={() => setExpand((s) => ({ key: s.key + 1, all: false }))}>
                Recolher
              </button>
            </div>
          }
        >
          <TreeView
            root={result?.tree ?? null}
            hideRest={hideRest}
            expandKey={expand.key}
            expandAll={expand.all}
            onSelect={goTo}
          />
        </Panel>

        <Panel title={`Erros (${result?.errors.length ?? 0})`} className="lg:col-span-2">
          <ErrorList errors={result?.errors ?? []} onSelect={goTo} />
        </Panel>

        <Panel title="Saída">
          {usesInput && <InputBox value={stdin} onChange={setStdin} />}
          <OutputPanel state={runState} />
        </Panel>
      </main>

      {view === 'docs' && (
        <DocsProvider
          openInEditor={(text) => {
            setSource(text)
            focusPending.current = true
            goEditor()
          }}
        >
          <DocsView pageId={pageId} missing={missing} />
        </DocsProvider>
      )}
    </div>
  )
}
