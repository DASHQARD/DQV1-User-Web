import { describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import RedemptionRedirect from '../RedemptionRedirect'
import { ROUTES } from '@/utils/constants'

describe('RedemptionRedirect', () => {
  it('redirects to unified redeem route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/redeem/dashpro']}>
        <Routes>
          <Route path="/dashboard/redeem/dashpro" element={<RedemptionRedirect />} />
          <Route path={ROUTES.IN_APP.REDEEM} element={<div>Unified redeem</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Unified redeem')).toBeInTheDocument()
  })
})
