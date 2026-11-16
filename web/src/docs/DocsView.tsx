import { useEffect, useRef } from 'react'
import { DocsNav } from './DocsNav'
import { findPage, neighbors } from './registry'

const pagerLink =
  'flex min-h-6 min-w-0 flex-col rounded-md border border-line bg-panel px-3 py-2 text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent'

export function DocsView({ pageId }: { pageId: string }) {
  const page = findPage(pageId)
  const heading = useRef<HTMLHeadingElement>(null)
  const scroller = useRef<HTMLElement>(null)

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0
    heading.current?.focus({ preventScroll: true })
  }, [pageId])

  if (!page) return null
  const { prev, next } = neighbors(page.id)
  const Page = page.Component

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-1">
      <DocsNav pageId={page.id} />
      <main
        ref={scroller}
        tabIndex={0}
        aria-label="Conteúdo da documentação"
        className="min-h-0 overflow-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <article className="mx-auto max-w-3xl px-4 py-6">
          <h1
            ref={heading}
            tabIndex={-1}
            className="mb-2 text-2xl font-bold tracking-tight text-ink focus:outline-none"
          >
            {page.title}
          </h1>
          <p className="mb-4 text-muted">{page.summary}</p>
          <Page />
          <nav aria-label="Páginas vizinhas" className="mt-10 grid grid-cols-2 gap-3 border-t border-line pt-4">
            {prev ? (
              <a href={`#/doc/${prev.id}`} className={pagerLink}>
                <span className="text-xs text-muted">Anterior</span>
                <span className="font-semibold text-accent">{prev.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a href={`#/doc/${next.id}`} className={`${pagerLink} col-start-2 items-end text-right`}>
                <span className="text-xs text-muted">Próxima</span>
                <span className="font-semibold text-accent">{next.title}</span>
              </a>
            ) : (
              <span />
            )}
          </nav>
        </article>
      </main>
    </div>
  )
}
