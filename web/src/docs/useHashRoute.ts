import { useCallback, useEffect, useState } from 'react'
import { PAGES, findPage } from './registry'

const PREFIX = '#/doc'
const EDITOR_HASH = '#/editor'

interface Route {
  view: 'editor' | 'docs'
  pageId: string
  canonical: string
}

function parse(hash: string, lastId: string): Route {
  if (hash !== PREFIX && !hash.startsWith(`${PREFIX}/`)) {
    return { view: 'editor', pageId: lastId, canonical: hash }
  }
  const wanted = hash.slice(PREFIX.length + 1)
  const pageId = findPage(wanted) ? wanted : PAGES[0].id
  return { view: 'docs', pageId, canonical: `${PREFIX}/${pageId}` }
}

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  const [lastId, setLastId] = useState(PAGES[0].id)
  const route = parse(hash, lastId)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useEffect(() => {
    if (route.view !== 'docs') return
    setLastId(route.pageId)
    if (route.canonical !== hash) {
      window.history.replaceState(null, '', route.canonical)
      setHash(route.canonical)
    }
  }, [route.view, route.pageId, route.canonical, hash])

  const goDoc = useCallback((id: string) => {
    window.location.hash = `${PREFIX}/${id}`
  }, [])

  const goEditor = useCallback(() => {
    window.location.hash = EDITOR_HASH
  }, [])

  return { view: route.view, pageId: route.pageId, goDoc, goEditor }
}
