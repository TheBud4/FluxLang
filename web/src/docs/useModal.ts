import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useModal(ref: RefObject<HTMLElement | null>, onClose: () => void, initial?: string) {
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = () => [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const start = (initial ? root.querySelector<HTMLElement>(initial) : null) ?? items()[0]
    start?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close.current()
        return
      }
      if (e.key !== 'Tab' || !root) return
      const list = items()
      const first = list[0]
      const last = list[list.length - 1]
      if (!first || !last) {
        e.preventDefault()
        return
      }
      const active = document.activeElement
      const outside = !root.contains(active)
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [ref, initial])
}
