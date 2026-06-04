import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { VendorSidebarNavItem } from '../VendorSidebarNavItem'
import { ROUTES } from '@/utils/constants'

describe('VendorSidebarNavItem', () => {
  const requestsItem = {
    path: ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS,
    label: 'Requests',
    icon: 'bi:clipboard-check',
  }

  it('shows Requests (1) in the label when there is one pending request', () => {
    renderWithProviders(
      <ul>
        <VendorSidebarNavItem
          item={requestsItem}
          isDisabled={false}
          isCollapsed={false}
          isActive={() => false}
          addAccountParam={(path) => path}
          pendingRequestsCount={1}
        />
      </ul>,
    )
    expect(screen.getByRole('link', { name: /requests \(1\)/i })).toBeInTheDocument()
  })

  it('shows plain Requests label when count is zero', () => {
    renderWithProviders(
      <ul>
        <VendorSidebarNavItem
          item={requestsItem}
          isDisabled={false}
          isCollapsed={false}
          isActive={() => false}
          addAccountParam={(path) => path}
          pendingRequestsCount={0}
        />
      </ul>,
    )
    expect(screen.getByRole('link', { name: /^requests$/i })).toBeInTheDocument()
  })
})
