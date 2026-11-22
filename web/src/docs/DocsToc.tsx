import { useEffect, useState, type RefObject } from 'react'
import { useOverflowFocus } from './useOverflowFocus'

interface Entry {
  id: string
  title: string
  level: 2 | 3
}

interface DocsTocProps {
  pageId: string
  scroller: RefObject<HTMLElement | null>
}

const BAND = 0.25

export function DocsToc({ pageId, scroller }: DocsTocProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [active, setActive] = useState('')
  const [navRef, tabIndex] = useOverflowFocus<HTMLElement>(entries)

  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const found = [...root.querySelectorAll<HTMLElement>('article h2[id], article h3[id]')]
    setEntries(found.map((h) => ({ id: h.id, title: h.textContent ?? '', level: h.tagName === 'H2' ? 2 : 3 })))
    setActive(found[0]?.id ?? '')
    if (found.length === 0) return

    function pick() {
      if (!root) return
      const limit = root.getBoundingClientRect().top + root.clientHeight * BAND
      let id = found[0].id
      for (const h of found) if (h.getBoundingClientRect().top <= limit) id = h.id
      setActive(id)
    }

    const observer = new IntersectionObserver(pick, {
      root,
      rootMargin: `0px 0px -${(1 - BAND) * 100}% 0px`,
    })
    found.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [pageId, scroller])

  if (entries.length === 0) return null

  return (
    <nav
      ref={navRef}
      aria-label="Nesta página"
      tabIndex={tabIndex}
      className="hidden overflow-auto border-l border-line bg-panel p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent xl:block"
    >
      <h2 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Nesta página</h2>
      <ul className="m-0 list-none p-0">
        {entries.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              aria-current={e.id === active ? 'location' : undefined}
              onClick={() => {
                const target = document.getElementById(e.id)
                target?.scrollIntoView({ block: 'start' })
                target?.focus({ preventScroll: true })
                setActive(e.id)
              }}
              className={`flex min-h-6 w-full items-center rounded px-2 py-1 text-left text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent ${
                e.level === 3 ? 'pl-5' : ''
              } ${e.id === active ? 'bg-bg font-semibold text-accent' : 'text-ink'}`}
            >
              {e.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
