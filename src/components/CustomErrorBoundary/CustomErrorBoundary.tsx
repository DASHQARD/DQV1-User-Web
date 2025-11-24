import { useRouteError } from 'react-router'

import { cn } from '@/libs'

import { ErrorText } from '../Text'

type Props = Readonly<{
  className?: string
}>
export function CustomErrorBoundary({ className }: Props) {
  const error: any = useRouteError()
  console.error(error)
  return (
    <div className={cn('center flex-col h-full text-center', className)}>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-gray-600">Oops!</h1>
        <p className="text-gray-600">Sorry, an unexpected error has occurred.</p>
        <ErrorText error={error.statusText || error.message} className="text-center" />
      </div>
    </div>
  )
}
