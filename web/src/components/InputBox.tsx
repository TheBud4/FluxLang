interface InputBoxProps {
  value: string
  onChange: (value: string) => void
}

/**
 * A entrada do programa: uma linha para cada `terminal.input`, na ordem. A
 * página não é um terminal interativo; o programa roda de uma vez, com esse
 * texto como entrada padrão (quando as linhas acabam, o input devolve "").
 */
export function InputBox({ value, onChange }: InputBoxProps) {
  return (
    <div className="border-b border-line px-3 py-2">
      <label htmlFor="program-input" className="block text-xs font-semibold text-muted">
        Entrada do programa (uma linha para cada terminal.input)
      </label>
      <textarea
        id="program-input"
        value={value}
        rows={3}
        spellCheck={false}
        wrap="off"
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full resize-y rounded border border-line bg-bg px-2 py-1 font-mono text-xs text-ink focus-visible:outline-2 focus-visible:outline-accent"
      />
    </div>
  )
}
