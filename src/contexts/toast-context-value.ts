import React from 'react'

export type ToastNotificationType = 'info' | 'success' | 'error'

type ToastContextValue = {
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

export const ToastContext = React.createContext<ToastContextValue>({} as ToastContextValue)
