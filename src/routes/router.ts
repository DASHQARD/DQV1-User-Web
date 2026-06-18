import {
  createBrowserRouter,
  resolvePath,
  type To,
} from 'react-router'

import { routes } from './routes'
import { supportsViewTransitions, withViewTransition } from '@/utils/viewTransition'

const browserRouter = createBrowserRouter(routes)

function isPathnameNavigation(to: To | number | null, currentPathname: string): boolean {
  if (to == null) return false
  if (typeof to === 'number') return true
  const resolved = resolvePath(to, currentPathname)
  return resolved.pathname !== currentPathname
}

const originalNavigate = browserRouter.navigate.bind(browserRouter)

browserRouter.navigate = ((...args: Parameters<typeof originalNavigate>) => {
  const [to] = args
  const currentPathname = browserRouter.state.location.pathname

  if (!supportsViewTransitions() || !isPathnameNavigation(to, currentPathname)) {
    return originalNavigate(...args)
  }

  let result: ReturnType<typeof originalNavigate>
  withViewTransition(() => {
    result = originalNavigate(...args)
  })
  return result!
}) as typeof browserRouter.navigate

export const router = browserRouter
