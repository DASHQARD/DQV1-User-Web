import { isRouteErrorResponse, useRouteError } from 'react-router'
import { CustomErrorBoundary } from '../CustomErrorBoundary'
import { NotFoundPage } from '../NotFoundPage'

function getRouteErrorStatus(error: unknown): number | undefined {
  if (isRouteErrorResponse(error)) return error.status
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: unknown }).status
    return typeof status === 'number' ? status : undefined
  }
  return undefined
}

/** User-facing route errors (404 and unexpected failures) without React Router dev UI. */
export function RouteErrorPage() {
  const error = useRouteError()

  if (getRouteErrorStatus(error) === 404) {
    return <NotFoundPage />
  }

  if (import.meta.env.DEV && error instanceof Error) {
    console.error(error)
  } else if (import.meta.env.DEV && isRouteErrorResponse(error)) {
    console.error(error.status, error.statusText, error.data)
  }

  return <CustomErrorBoundary />
}
