import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/react-router'

import { ToastProvider } from '../ToastProvider'
import { useAutoRefreshToken } from '@/hooks'

const queryClient = new QueryClient()
export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  useAutoRefreshToken()

  return (
    <ToastProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NuqsAdapter>
    </ToastProvider>
  )
}
