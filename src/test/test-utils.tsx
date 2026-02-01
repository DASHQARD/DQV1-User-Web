import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { type ReactElement } from 'react'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

type WrapperProps = {
  children: React.ReactNode
  initialEntries?: MemoryRouterProps['initialEntries']
}

function createWrapper({
  initialEntries = ['/'],
}: { initialEntries?: MemoryRouterProps['initialEntries'] } = {}) {
  const queryClient = createTestQueryClient()

  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    initialEntries?: MemoryRouterProps['initialEntries']
  },
) {
  const { initialEntries, ...renderOptions } = options ?? {}
  const Wrapper = createWrapper({ initialEntries })
  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  })
}

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { renderWithProviders as render }
