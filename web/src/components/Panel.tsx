import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  /** Controles à direita do título. */
  actions?: ReactNode
  className?: string
  children: ReactNode
}

/** Moldura de um painel: título fixo em cima e corpo que rola sozinho. */
export function Panel({ title, actions, className = '', children }: PanelProps) {
  return (
    <section
      className={`flex min-h-48 min-w-0 flex-col lg:min-h-0 overflow-hidden rounded-md border border-line bg-panel ${className}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-line px-3 py-1.5">
        <h2 className="text-xs font-semibold tracking-wide whitespace-nowrap text-muted uppercase">{title}</h2>
        {actions}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  )
}
