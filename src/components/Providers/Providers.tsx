import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsAdapter } from 'nuqs/adapters/react-router'

import { ToastProvider } from '../ToastProvider'
import { useAuthSessionBootstrap, useAutoRefreshToken } from '@/hooks'

const queryClient = new QueryClient()
export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  useAuthSessionBootstrap()
  useAutoRefreshToken()

  return (
    <ToastProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NuqsAdapter>
    </ToastProvider>
  )
}
