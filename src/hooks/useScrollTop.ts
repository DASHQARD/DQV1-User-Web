import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll the window to the top when the route changes (SPA in-app navigation). */
export function useScrollTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, search, hash])
}
