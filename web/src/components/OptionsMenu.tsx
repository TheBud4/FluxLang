import { useEffect, useRef, useState } from 'react'

interface OptionsMenuProps {
  semantic: boolean
  onSemantic: (on: boolean) => void
}

const button =
  'rounded-md border border-line bg-panel px-3 py-1 text-sm hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function OptionsMenu({ semantic, onSemantic }: OptionsMenuProps) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={box} className="relative">
      <button
        ref={trigger}
        type="button"
        className={button}
        aria-expanded={open}
        aria-controls="options-menu"
        onClick={() => setOpen((o) => !o)}
      >
        Opções
      </button>
      {open && (
        <div
          id="options-menu"
          className="absolute right-0 z-10 mt-1 w-64 rounded-md border border-line bg-panel p-3 shadow"
        >
          <label className="flex min-h-6 items-center gap-1.5 text-sm whitespace-nowrap">
            <input
              type="checkbox"
              className="size-6 accent-accent"
              checked={semantic}
              onChange={(e) => onSemantic(e.target.checked)}
            />
            Análise semântica
          </label>
          <p className="mt-2 text-xs text-muted">Ctrl+Enter compila agora</p>
        </div>
      )}
    </div>
  )
}
