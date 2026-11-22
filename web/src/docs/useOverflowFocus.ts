import { useEffect, useRef, useState } from 'react'

export function useOverflowFocus<T extends HTMLElement>(dep?: unknown) {
  const ref = useRef<T>(null)
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    for (const child of el.children) observer.observe(child)
    return () => observer.disconnect()
  }, [dep])

  return [ref, scrollable ? 0 : undefined] as const
}
