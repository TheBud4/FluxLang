import { useMemo, useState } from 'react'
import invalid from '../../docs/exemplos/invalido.flux?raw'
import valid from '../../docs/exemplos/valido.flux?raw'
import { ErrorList } from './components/ErrorList'
import { Editor } from './components/Editor'
import { Panel } from './components/Panel'
import { TokenList } from './components/TokenList'
import { TopBar } from './components/TopBar'
import { TreeView } from './components/TreeView'
import { countNodes } from './lib/tree'
import type { Focus } from './lib/types'
import { useCompile } from './lib/useCompile'

const SAMPLES = [
  { label: 'Exemplo válido', text: valid },
  { label: 'Exemplo inválido', text: invalid },
]

const checkbox = 'size-4 accent-accent'
const smallButton =
  'rounded border border-line px-2 py-0.5 text-xs hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent'

export default function App() {
  const [source, setSource] = useState(invalid)
  const [focus, setFocus] = useState<Focus | null>(null)
  const [hideRest, setHideRest] = useState(false)
  const [expand, setExpand] = useState({ key: 0, all: true })
  const { result, loading, failure, compileNow } = useCompile(source)

  const errorLines = useMemo(() => new Set(result?.errors.map((e) => e.line) ?? []), [result])

  const goTo = (line: number, column: number, length?: number) =>
    setFocus({ line, column, length, nonce: Date.now() })

  return (
    <div className="flex h-dvh flex-col">
      <TopBar
        result={result}
        loading={loading}
        onOpenFile={(_, text) => setSource(text)}
        onCompile={compileNow}
        samples={SAMPLES}
        onSample={setSource}
      />

      {failure && (
        <p role="alert" className="border-b border-line bg-bad/15 px-3 py-2 text-sm text-bad">
          {failure}
        </p>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-auto p-2 lg:grid-cols-[1.3fr_0.8fr_1.2fr] lg:grid-rows-[minmax(0,1fr)_11rem]">
        <Panel title="Código" className="h-96 lg:h-auto">
          <Editor value={source} onChange={setSource} errorLines={errorLines} focus={focus} />
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

        <Panel title={`Erros (${result?.errors.length ?? 0})`} className="lg:col-span-3">
          <ErrorList errors={result?.errors ?? []} onSelect={goTo} />
        </Panel>
      </main>
    </div>
  )
}
