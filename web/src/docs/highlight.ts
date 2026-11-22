import grammar from '../../../tools/vscode-fluxlang/syntaxes/fluxlang.tmLanguage.json'

export type TokenClass = 'kw' | 'type' | 'str' | 'num' | 'cmt' | 'fn'
export interface Piece {
  text: string
  cls?: TokenClass
}
export type Lang = 'flux' | 'c' | 'ts' | 'bash' | 'text'

interface GrammarRule {
  match?: string
  begin?: string
  patterns?: GrammarRule[]
}

const repository = grammar.repository as unknown as Record<string, GrammarRule>

function rules(name: string): GrammarRule[] {
  const entry = repository[name]
  return entry.patterns ?? [entry]
}

function groups(rule: GrammarRule): string[][] {
  const source = rule.match ?? rule.begin ?? ''
  return [...source.matchAll(/\(([A-Za-z_|]+)\)/g)].map((m) => m[1].split('|'))
}

function wordsOf(name: string): Set<string> {
  const out = new Set<string>()
  for (const rule of rules(name)) for (const g of groups(rule)) for (const w of g) out.add(w)
  return out
}

function libraryWords(): { fns: Set<string>; members: Set<string> } {
  const fns = new Set<string>()
  const members = new Set<string>()
  for (const rule of rules('library')) {
    const found = groups(rule)
    const isMember = (rule.match ?? '').includes('\\.')
    if (isMember) {
      found.slice(0, -1).forEach((g) => g.forEach((w) => fns.add(w)))
      found.at(-1)?.forEach((w) => members.add(w))
    } else {
      found.forEach((g) => g.forEach((w) => fns.add(w)))
    }
  }
  return { fns, members }
}

const library = libraryWords()

const FLUX_KEYWORDS = new Set([...wordsOf('keywords'), ...wordsOf('declarations'), ...wordsOf('constants')])
const FLUX_TYPES = wordsOf('types')

const C_KEYWORDS = new Set(
  'if else while for do switch case default break continue return goto sizeof typedef struct union enum static const extern inline void NULL true false'.split(' '),
)
const C_TYPES = new Set(
  'int long short char float double unsigned signed size_t uint8_t uint32_t uint64_t int64_t bool FILE'.split(' '),
)
const TS_KEYWORDS = new Set(
  'const let var function return if else for while of in new class extends implements import export from default type interface as async await switch case break continue throw try catch finally null undefined true false this typeof void'.split(' '),
)
const TS_TYPES = new Set('string number boolean unknown never any object Promise Record Set Map Array'.split(' '))
const BASH_KEYWORDS = new Set(
  'if then else elif fi for in do done while case esac function export cd echo make npm npx gcc flex bison'.split(' '),
)

interface Spec {
  keywords: Set<string>
  types: Set<string>
  line: string[]
  block: boolean
  quotes: string
}

function specFor(lang: Lang): Spec {
  switch (lang) {
    case 'flux':
      return { keywords: FLUX_KEYWORDS, types: FLUX_TYPES, line: ['//'], block: true, quotes: '"' }
    case 'c':
      return { keywords: C_KEYWORDS, types: C_TYPES, line: ['//'], block: true, quotes: '"\'' }
    case 'ts':
      return { keywords: TS_KEYWORDS, types: TS_TYPES, line: ['//'], block: true, quotes: '"\'`' }
    case 'bash':
      return { keywords: BASH_KEYWORDS, types: new Set(), line: ['#'], block: false, quotes: '"\'' }
    case 'text':
      return { keywords: new Set(), types: new Set(), line: [], block: false, quotes: '' }
  }
}

function push(out: Piece[], text: string, cls?: TokenClass) {
  if (!text) return
  const last = out.at(-1)
  if (last && last.cls === cls) last.text += text
  else out.push(cls ? { text, cls } : { text })
}

function endOfString(code: string, start: number): number {
  const quote = code[start]
  let i = start + 1
  while (i < code.length && code[i] !== '\n') {
    if (code[i] === '\\') i += 2
    else if (code[i++] === quote) return i
  }
  return Math.min(i, code.length)
}

export function highlight(lang: Lang, code: string): Piece[] {
  const spec = specFor(lang)
  const out: Piece[] = []
  if (lang === 'text') {
    push(out, code)
    return out
  }

  let i = 0
  while (i < code.length) {
    const rest = code.slice(i)
    const lineMark = spec.line.find((m) => rest.startsWith(m))
    if (lineMark) {
      const end = code.indexOf('\n', i)
      const stop = end < 0 ? code.length : end
      push(out, code.slice(i, stop), 'cmt')
      i = stop
    } else if (spec.block && rest.startsWith('/*')) {
      const end = code.indexOf('*/', i + 2)
      const stop = end < 0 ? code.length : end + 2
      push(out, code.slice(i, stop), 'cmt')
      i = stop
    } else if (spec.quotes.includes(code[i])) {
      const stop = endOfString(code, i)
      push(out, code.slice(i, stop), 'str')
      i = stop
    } else {
      const num = /^[0-9]+(?:\.[0-9]+)?/.exec(rest)
      const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest)
      if (num && !/[A-Za-z_]/.test(code[i - 1] ?? '')) {
        push(out, num[0], 'num')
        i += num[0].length
      } else if (word) {
        const w = word[0]
        const before = code.slice(Math.max(0, i - 32), i)
        const afterDot = /\.\s*$/.test(before)
        const afterTerminal = /\bterminal\s*\.\s*$/.test(before)
        let cls: TokenClass | undefined
        if (lang === 'flux' && afterDot) cls = afterTerminal && library.members.has(w) ? 'fn' : undefined
        else if (spec.types.has(w)) cls = 'type'
        else if (lang === 'flux' && library.fns.has(w)) cls = 'fn'
        else if (spec.keywords.has(w)) cls = 'kw'
        push(out, w, cls)
        i += w.length
      } else {
        push(out, code[i])
        i += 1
      }
    }
  }
  return out
}

export const TOKEN_COLOR: Record<TokenClass, string> = {
  kw: 'text-accent',
  type: 'text-info',
  str: 'text-ok',
  num: 'text-warn',
  cmt: 'text-muted',
  fn: 'font-semibold text-ink',
}
