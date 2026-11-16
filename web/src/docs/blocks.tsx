import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useDocs } from './DocsContext'
import { TOKEN_COLOR, highlight, type Lang } from './highlight'

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const smallButton =
  'min-h-6 rounded border border-line bg-panel px-2 text-xs text-ink hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent'

function Heading({ level, title }: { level: 2 | 3; title: string }) {
  const id = slugify(title)
  const Tag = level === 2 ? 'h2' : 'h3'
  const size = level === 2 ? 'mt-8 mb-3 text-xl' : 'mt-6 mb-2 text-base'
  return (
    <div className={`group flex items-baseline gap-2 ${size}`}>
      <Tag id={id} className="scroll-mt-4 font-semibold tracking-tight text-ink">
        {title}
      </Tag>
      <button
        type="button"
        aria-label={`Ir para a seção ${title}`}
        className="inline-flex min-h-6 min-w-6 items-center justify-center rounded text-muted opacity-0 group-hover:opacity-100 hover:text-accent focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent"
        onClick={() => document.getElementById(id)?.scrollIntoView({ block: 'start' })}
      >
        #
      </button>
    </div>
  )
}

export function H2({ title }: { title: string }) {
  return <Heading level={2} title={title} />
}

export function H3({ title }: { title: string }) {
  return <Heading level={3} title={title} />
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-3 leading-7 text-ink">{children}</p>
}

interface CodeProps {
  lang: Lang
  example?: boolean
  children: string
}

export function Code({ lang, example = false, children }: CodeProps) {
  const { openInEditor } = useDocs()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const code = children.replace(/^\n+|\s+$/g, '')

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure className="my-4 overflow-hidden rounded-md border border-line bg-panel">
      <figcaption className="flex items-center justify-between gap-2 border-b border-line px-3 py-1">
        <span className="text-xs font-semibold tracking-wide text-muted uppercase">{lang}</span>
        <span className="flex items-center gap-2">
          <span role="status" aria-live="polite" className="text-xs text-ok">
            {copied ? 'Copiado' : ''}
          </span>
          <button type="button" className={smallButton} onClick={copy}>
            Copiar
          </button>
          {example && (
            <button type="button" className={smallButton} onClick={() => openInEditor(code)}>
              Abrir no editor
            </button>
          )}
        </span>
      </figcaption>
      <div
        role="region"
        aria-label={`Código ${lang}`}
        tabIndex={0}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <pre className="m-0 px-3 py-2 font-mono text-sm leading-6 text-ink">
          <code>
            {highlight(lang, code).map((p, i) =>
              p.cls ? (
                <span key={i} className={TOKEN_COLOR[p.cls]}>
                  {p.text}
                </span>
              ) : (
                p.text
              ),
            )}
          </code>
        </pre>
      </div>
    </figure>
  )
}

interface TableProps {
  head: string[]
  rows: ReactNode[][]
}

export function Table({ head, rows }: TableProps) {
  return (
    <div
      role="region"
      aria-label="Tabela"
      tabIndex={0}
      className="my-4 overflow-x-auto rounded-md border border-line focus-visible:outline-2 focus-visible:outline-accent"
    >
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-bg">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b border-line px-3 py-2 font-semibold text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-line last:border-b-0">
              {row.map((cell, c) => (
                <td key={c} className="px-3 py-2 align-top text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Callout({ kind, children }: { kind: 'nota' | 'aviso'; children: ReactNode }) {
  const tone = kind === 'aviso' ? 'border-warn' : 'border-info'
  const label = kind === 'aviso' ? 'Aviso' : 'Nota'
  const labelTone = kind === 'aviso' ? 'text-warn' : 'text-info'
  return (
    <aside className={`my-4 rounded-md border-l-4 bg-bg px-4 py-3 ${tone}`}>
      <p className={`mb-1 text-xs font-semibold tracking-wide uppercase ${labelTone}`}>{label}</p>
      <div className="text-sm leading-6 text-ink">{children}</div>
    </aside>
  )
}

export function Why({ children }: { children: ReactNode }) {
  return (
    <aside className="my-4 rounded-md border border-line bg-bg px-4 py-3">
      <p className="mb-1 text-xs font-semibold tracking-wide text-accent uppercase">Por quê</p>
      <div className="text-sm leading-6 text-ink">{children}</div>
    </aside>
  )
}

export function Fn({ name, signature, children }: { name: string; signature: string; children: ReactNode }) {
  return (
    <section className="my-4 rounded-md border border-line bg-panel px-4 py-3">
      <h4 className="font-mono text-sm font-semibold text-ink">{name}</h4>
      <div
        role="region"
        aria-label={`Assinatura de ${name}`}
        tabIndex={0}
        className="my-2 overflow-x-auto focus-visible:outline-2 focus-visible:outline-accent"
      >
        <code className="font-mono text-sm whitespace-pre text-muted">{signature}</code>
      </div>
      <div className="text-sm leading-6 text-ink">{children}</div>
    </section>
  )
}

export function Diagram({ title, label, children }: { title: string; label: string; children: ReactNode }) {
  return (
    <figure className="my-4 rounded-md border border-line bg-panel">
      <div
        role="img"
        aria-label={label}
        tabIndex={0}
        className="overflow-auto p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        {children}
      </div>
      <figcaption className="border-t border-line px-3 py-1.5 text-xs text-muted">{title}</figcaption>
    </figure>
  )
}

export function PageLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a
      href={`#/doc/${to}`}
      className="inline-flex min-h-6 items-center text-accent underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {children}
    </a>
  )
}
