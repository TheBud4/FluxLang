import { PAGES, SECTIONS } from './registry'

export function DocsNav({ pageId }: { pageId: string }) {
  return (
    <nav
      aria-label="Documentação"
      tabIndex={0}
      className="max-h-40 overflow-auto border-b border-line bg-panel p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent lg:max-h-none lg:border-r lg:border-b-0"
    >
      {SECTIONS.map((section) => {
        const pages = PAGES.filter((p) => p.section === section.id)
        if (pages.length === 0) return null
        return (
          <div key={section.id} className="mb-4 last:mb-0">
            <h2 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">{section.title}</h2>
            <ul className="m-0 list-none p-0">
              {pages.map((p) => {
                const current = p.id === pageId
                return (
                  <li key={p.id}>
                    <a
                      href={`#/doc/${p.id}`}
                      aria-current={current ? 'page' : undefined}
                      className={`flex min-h-6 items-center rounded px-2 py-1 text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent ${
                        current ? 'bg-bg font-semibold text-accent' : 'text-ink'
                      }`}
                    >
                      {p.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
