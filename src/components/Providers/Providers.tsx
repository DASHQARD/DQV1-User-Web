import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ToastProvider } from '../ToastProvider'

const queryClient = new QueryClient()
export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ToastProvider>
  )
}
