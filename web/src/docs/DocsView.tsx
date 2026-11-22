import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Callout, HeadingIdsContext } from './blocks'
import { DocsDrawer, DocsNav } from './DocsNav'
import { DocsSearch } from './DocsSearch'
import { DocsToc } from './DocsToc'
import { findPage, neighbors } from './registry'
import { useOverflowFocus } from './useOverflowFocus'

const pagerLink =
  'flex min-h-6 min-w-0 flex-col rounded-md border border-line bg-panel px-3 py-2 text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent'

const toolButton =
  'inline-flex min-h-8 items-center gap-2 rounded-md border border-line bg-panel px-3 text-sm text-ink hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent'

type Overlay = 'menu' | 'search' | null

export function DocsView({ pageId, missing }: { pageId: string; missing?: string }) {
  const page = findPage(pageId)
  const heading = useRef<HTMLHeadingElement>(null)
  const [scroller, scrollTabIndex] = useOverflowFocus<HTMLElement>(pageId)
  const shown = useRef<string | undefined>(undefined)
  const skipHeading = useRef(false)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const opener = useRef<HTMLElement | null>(null)
  const restore = useRef(false)
  const headingIds = useMemo(() => new Map<string, string>(), [pageId])

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0
    const changed = shown.current !== undefined && shown.current !== pageId
    shown.current = pageId
    if (!changed) return
    if (skipHeading.current) skipHeading.current = false
    else heading.current?.focus({ preventScroll: true })
  }, [pageId, scroller])

  const open = useCallback((kind: Exclude<Overlay, null>, from?: HTMLElement) => {
    opener.current = from ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    setOverlay(kind)
  }, [])

  const close = useCallback((giveFocusBack: boolean) => {
    restore.current = giveFocusBack
    setOverlay(null)
  }, [])

  useEffect(() => {
    if (overlay !== null || !restore.current) return
    restore.current = false
    const target = opener.current
    if (target?.isConnected) target.focus()
    else heading.current?.focus({ preventScroll: true })
  }, [overlay])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'k') return
      e.preventDefault()
      if (overlay === null) open('search')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlay, open])

  useEffect(() => {
    if (overlay !== 'menu') return
    const wide = window.matchMedia('(min-width: 64rem)')
    const onChange = () => wide.matches && close(false)
    wide.addEventListener('change', onChange)
    return () => wide.removeEventListener('change', onChange)
  }, [overlay, close])

  if (!page) return null
  const { prev, next } = neighbors(page.id)
  const Page = page.Component

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div inert={overlay !== null} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-line bg-panel px-3 py-2">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={overlay === 'menu'}
            onClick={(e) => open('menu', e.currentTarget)}
            className={`${toolButton} lg:hidden`}
          >
            Menu
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={overlay === 'search'}
            aria-keyshortcuts="Control+K"
            onClick={(e) => open('search', e.currentTarget)}
            className={toolButton}
          >
            Buscar
            <span aria-hidden="true" className="hidden rounded border border-line px-1 text-xs text-muted sm:inline">
              Ctrl K
            </span>
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]">
          <DocsNav pageId={page.id} className="hidden border-r border-line lg:block" />
          <main
            ref={scroller}
            tabIndex={scrollTabIndex}
            aria-label="Conteúdo da documentação"
            className="min-h-0 overflow-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            <article className="mx-auto max-w-3xl px-4 py-6">
              {missing !== undefined && (
                <Callout kind="aviso">
                  Não existe a página <code className="font-mono">{missing}</code> no manual. Esta é a página inicial: use o menu ou a busca para achar o que procurava.
                </Callout>
              )}
              <h1
                ref={heading}
                tabIndex={-1}
                className="mb-2 text-2xl font-bold tracking-tight text-ink focus:outline-none"
              >
                {page.title}
              </h1>
              <p className="mb-4 text-muted">{page.summary}</p>
              <HeadingIdsContext value={headingIds}>
                <Page />
              </HeadingIdsContext>
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
          <DocsToc pageId={page.id} scroller={scroller} />
        </div>
      </div>

      {overlay === 'search' && (
        <DocsSearch
          onChoose={(id) => {
            close(id === page.id)
            window.location.hash = `#/doc/${id}`
          }}
          onClose={() => close(true)}
        />
      )}
      {overlay === 'menu' && (
        <DocsDrawer
          pageId={page.id}
          onNavigate={(id) => {
            if (id !== page.id) skipHeading.current = true
            close(true)
          }}
          onClose={() => close(true)}
        />
      )}
    </div>
  )
}
