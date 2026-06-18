import { flushSync } from 'react-dom'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !prefersReducedMotion()
  )
}

/** Run a DOM update inside the View Transitions API (same-document SPA navigations). */
export function withViewTransition(update: () => void): void {
  if (!supportsViewTransitions()) {
    update()
    return
  }

  document.startViewTransition(() => {
    flushSync(update)
  })
}
