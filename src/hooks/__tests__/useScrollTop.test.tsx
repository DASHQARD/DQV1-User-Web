import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useScrollTop } from '../useScrollTop'

function ScrollHarness() {
  const navigate = useNavigate()
  useScrollTop()
  return (
    <button type="button" onClick={() => navigate('/contact')}>
      Go
    </button>
  )
}

describe('useScrollTop', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('scrolls to top on initial route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollHarness />
      </MemoryRouter>,
    )

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('scrolls to top when pathname changes', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<ScrollHarness />} />
        </Routes>
      </MemoryRouter>,
    )

    vi.mocked(window.scrollTo).mockClear()
    await user.click(screen.getByRole('button', { name: 'Go' }))

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('does not scroll when navigating to a hash anchor', () => {
    render(
      <MemoryRouter initialEntries={['/faq#section']}>
        <ScrollHarness />
      </MemoryRouter>,
    )

    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
