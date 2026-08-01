import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { RouteGuard } from '@/components/RouteGuard/RouteGuard'
import { useAuthStore } from '@/stores'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ROUTES } from '@/utils/constants'

describe('RouteGuard', () => {
  afterEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      isGuestAuth: false,
      token: null,
      refreshToken: null,
      isSessionReady: true,
    })
  })

  it('redirects unauthenticated users home without mutating auth during render', () => {
    useAuthStore.setState({
      isAuthenticated: false,
      isGuestAuth: false,
      token: null,
      refreshToken: null,
      isSessionReady: true,
    })

    const resetSpy = vi.spyOn(useAuthStore.getState(), 'reset')

    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RouteGuard>
              <div>Protected</div>
            </RouteGuard>
          }
        />
        <Route path={ROUTES.IN_APP.HOME} element={<div>Home</div>} />
      </Routes>,
      { initialEntries: ['/dashboard'] },
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
    expect(resetSpy).not.toHaveBeenCalled()

    resetSpy.mockRestore()
  })

  it('renders children for authenticated members', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuestAuth: false,
      token: 'access',
      refreshToken: 'refresh',
      isSessionReady: true,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RouteGuard>
              <div>Protected</div>
            </RouteGuard>
          }
        />
      </Routes>,
      { initialEntries: ['/dashboard'] },
    )

    expect(screen.getByText('Protected')).toBeInTheDocument()
  })
})
