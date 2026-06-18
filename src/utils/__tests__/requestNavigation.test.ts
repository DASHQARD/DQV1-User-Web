import { describe, it, expect } from 'vitest'
import { MODALS, ROUTES } from '@/utils/constants'
import { buildRequestsInboxUrl, buildRequestViewUrl } from '../requestNavigation'

describe('requestNavigation', () => {
  it('buildRequestViewUrl opens view modal in corporate inbox', () => {
    const url = buildRequestViewUrl('corporate', { id: '99', request_id: 'REQ-99' })
    expect(url).toContain(ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS)
    expect(url).toContain(`${MODALS.REQUEST.PARAM_NAME}=${MODALS.REQUEST.CHILDREN.VIEW}`)
    expect(url).toContain('account=corporate')
  })

  it('buildRequestViewUrl includes vendor scope for CSA', () => {
    const url = buildRequestViewUrl(
      'corporate-vendor-scoped',
      { id: '1' },
      { vendorId: 'v-7407' },
    )
    expect(url).toContain(ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS)
    expect(url).toContain('vendor_id=v-7407')
  })

  it('buildRequestsInboxUrl supports pending filter', () => {
    const url = buildRequestsInboxUrl('vendor', { pendingOnly: true })
    expect(url).toBe(`${ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS}?account=vendor&status=pending`)
  })
})
