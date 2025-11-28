import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ToastProvider } from '../ToastProvider'
import { useAutoRefreshToken } from '@/hooks'

const queryClient = new QueryClient()
export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  useAutoRefreshToken()

  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ToastProvider>
  )
}
