import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Notifications from '../notifications/Notifications'
import { ROUTES } from '@/utils/constants'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Notifications (corporate)', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  it('redirects to corporate Requests inbox', () => {
    renderWithProviders(<Notifications />)
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS, {
      replace: true,
    })
  })
})
