import { useMemo, useState } from 'react'
import { collapseRest } from '../lib/tree'
import type { TreeNode } from '../lib/types'

interface TreeViewProps {
  root: TreeNode | null
  /** Esconde os nós *_rest e as folhas ε (a árvore fiel fica no --json). */
  hideRest: boolean
  /** Muda quando o usuário pede Expandir tudo ou Recolher tudo. */
  expandKey: number
  expandAll: boolean
  onSelect: (line: number, column: number, length?: number) => void
}

export function TreeView({ root, hideRest, expandKey, expandAll, onSelect }: TreeViewProps) {
  const roots = useMemo(() => {
    if (!root) return []
    return hideRest ? collapseRest(root) : [root]
  }, [root, hideRest])

  if (roots.length === 0) {
    return <p className="p-3 text-sm text-muted">Sem árvore: nenhuma regra foi concluída.</p>
  }
  // Trocar a key recria os nós, então todos nascem abertos ou fechados.
  return (
    <ul className="w-max min-w-full p-2 font-mono text-xs" key={`${expandKey}-${hideRest}`}>
      {roots.map((node, i) => (
        <Node key={i} node={node} depth={0} expandAll={expandAll} expandKey={expandKey} onSelect={onSelect} />
      ))}
    </ul>
  )
}

interface NodeProps {
  node: TreeNode
  depth: number
  expandAll: boolean
  expandKey: number
  onSelect: TreeViewProps['onSelect']
}

// Sem pedido de Expandir/Recolher tudo, abre só os primeiros níveis.
const INITIAL_DEPTH = 4

function Node({ node, depth, expandAll, expandKey, onSelect }: NodeProps) {
  const children = node.children ?? []
  const hasChildren = children.length > 0
  const [open, setOpen] = useState(expandKey > 0 ? expandAll : depth < INITIAL_DEPTH)

  const tone =
    node.kind === 'error'
      ? 'font-semibold text-bad'
      : node.kind === 'token'
        ? 'text-accent'
        : node.kind === 'empty'
          ? 'text-muted italic'
          : 'text-ink'

  return (
    <li>
      <div className="flex items-center gap-1 rounded-sm hover:bg-bg">
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? 'Recolher' : 'Expandir'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="size-6 shrink-0 text-muted focus-visible:outline-2 focus-visible:outline-accent"
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="size-6 shrink-0" />
        )}
        <button
          type="button"
          disabled={!node.line}
          onClick={() => node.line && onSelect(node.line, node.column ?? 1, node.kind === 'token' ? [...(node.text ?? '')].length : undefined)}
          className={`min-h-6 shrink-0 text-left whitespace-nowrap enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-accent ${tone}`}
        >
          {node.label}
          {node.kind === 'token' && <span className="text-ink"> {node.text}</span>}
          {node.line ? (
            <span className="text-muted">
              {' '}
              {node.line}:{node.column}
            </span>
          ) : null}
        </button>
      </div>
      {hasChildren && open && (
        <ul className="ml-2 border-l border-line pl-2">
          {children.map((child, i) => (
            <Node key={i} node={child} depth={depth + 1} expandAll={expandAll} expandKey={expandKey} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  )
}
