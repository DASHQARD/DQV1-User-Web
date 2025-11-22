import React from 'react'

import { ToastContext } from '@/contexts'

export function useToast() {
  const toastContext = React.useContext(ToastContext)
  if (!toastContext) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return toastContext
}
