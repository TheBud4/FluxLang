import { highlight, type TokenClass } from '../docs/highlight'

export interface FluxMark {
  from: number
  to: number
  cls: TokenClass
}

/** Highlighted ranges (UTF-16 offsets) of FluxLang code, reusing the docs tokenizer. Only pieces with a class. */
export function fluxMarks(code: string): FluxMark[] {
  const marks: FluxMark[] = []
  let offset = 0
  for (const piece of highlight('flux', code)) {
    const end = offset + piece.text.length
    if (piece.cls) marks.push({ from: offset, to: end, cls: piece.cls })
    offset = end
  }
  return marks
}
