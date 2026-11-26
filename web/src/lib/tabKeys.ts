/** Índice da aba para a tecla de navegação, ou null se a tecla não navega. */
export function nextTabIndex(key: string, at: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (at + 1) % count
    case 'ArrowLeft':
      return (at - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}
