import React from 'react'
import { ToastContext, type ToastNotificationType } from './toast-context-value'

export { ToastContext }
export type { ToastNotificationType }

export function ToastContextProvider({
  children,
  addMessage,
}: React.PropsWithChildren<{
  addMessage: (message: string, type: ToastNotificationType, title?: string) => void
}>) {
  const success = React.useCallback(
    (message: string, title?: string) => addMessage(message, 'success', title),
    [addMessage],
  )

  const error = React.useCallback(
    (message: string, title?: string) => addMessage(message, 'error', title),
    [addMessage],
  )

  const info = React.useCallback(
    (message: string, title?: string) => addMessage(message, 'info', title),
    [addMessage],
  )

  const value = React.useMemo(() => {
    return { success, error, info }
  }, [success, error, info])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
