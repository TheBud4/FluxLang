import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DocsProvider } from './DocsContext'
import { PAGES } from './registry'
import type { DocPage } from './types'

export interface IndexEntry {
  id: string
  title: string
  text: string
}

export interface SearchHit {
  id: string
  title: string
  snippet: string
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const INLINE_TAGS = new Set(['span', 'code', 'a', 'strong', 'em'])

const TOOLBAR = /<figcaption\b[^>]*>(?:(?!<\/figcaption>)[\s\S])*?<button\b(?:(?!<\/figcaption>)[\s\S])*?<\/figcaption>/g

function toText(markup: string): string {
  return markup
    .replace(TOOLBAR, ' ')
    .replace(/<button\b[\s\S]*?<\/button>/g, ' ')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (_, tag: string) => (INLINE_TAGS.has(tag.toLowerCase()) ? '' : ' '))
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
      if (code[0] === '#') {
        const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
        return Number.isFinite(n) ? String.fromCodePoint(n) : whole
      }
      return ENTITIES[code.toLowerCase()] ?? whole
    })
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildIndex(pages: DocPage[]): IndexEntry[] {
  return pages.map((page) => {
    const body = renderToStaticMarkup(
      createElement(DocsProvider, { openInEditor: () => {}, children: createElement(page.Component) }),
    )
    return { id: page.id, title: page.title, text: toText(`${page.summary} ${body}`) }
  })
}

let cached: IndexEntry[] | null = null

export function getIndex(): IndexEntry[] {
  cached ??= buildIndex(PAGES)
  return cached
}

const SPAN = 60

function snippetOf(text: string, norm: string, words: string[]): string {
  const at = words.map((w) => norm.indexOf(w)).filter((i) => i >= 0)
  if (at.length === 0 || norm.length !== text.length) return text.slice(0, SPAN * 2).trim()
  const hit = Math.min(...at)
  const from = Math.max(0, hit - SPAN)
  const to = Math.min(text.length, hit + SPAN)
  return `${from > 0 ? '...' : ''}${text.slice(from, to).trim()}${to < text.length ? '...' : ''}`
}

function count(haystack: string, word: string): number {
  let n = 0
  for (let i = haystack.indexOf(word); i >= 0; i = haystack.indexOf(word, i + word.length)) n += 1
  return n
}

export function search(index: IndexEntry[], query: string): SearchHit[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const scored: { entry: IndexEntry; norm: string; score: number }[] = []
  for (const entry of index) {
    const title = normalize(entry.title)
    const norm = normalize(entry.text)
    if (!words.every((w) => title.includes(w) || norm.includes(w))) continue
    let score = 0
    for (const w of words) score += count(title, w) * 20 + Math.min(count(norm, w), 10)
    scored.push({ entry, norm, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.map((s) => ({
    id: s.entry.id,
    title: s.entry.title,
    snippet: snippetOf(s.entry.text, s.norm, words),
  }))
}
