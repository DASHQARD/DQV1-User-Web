import { isRouteErrorResponse, useRouteError } from 'react-router'

import { cn } from '@/libs'

import { ErrorText } from '../Text'

type Props = Readonly<{
  className?: string
}>
export function CustomErrorBoundary({ className }: Props) {
  const error: unknown = useRouteError()

  if (import.meta.env.DEV) {
    console.error(error)
  }

  const userMessage =
    isRouteErrorResponse(error) && error.statusText
      ? error.statusText
      : 'Something went wrong. Please try again later.'

  return (
    <div className={cn('center flex-col h-full min-h-[40vh] text-center px-4 py-16', className)}>
      <div className="flex flex-col justify-center items-center gap-2 max-w-md">
        <h1 className="text-2xl font-bold text-primary-500">Oops!</h1>
        <p className="text-grey-500">Sorry, an unexpected error has occurred.</p>
        <ErrorText error={userMessage} className="text-center" />
      </div>
    </div>
  )
}
