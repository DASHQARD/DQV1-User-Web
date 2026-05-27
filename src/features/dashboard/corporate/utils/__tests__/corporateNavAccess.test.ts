import { describe, it, expect } from 'vitest'
import { ROUTES } from '@/utils/constants'
import { buildCorporateAccountMenuItems, isCorporateNavItemVisible } from '../corporateNavAccess'

describe('corporateNavAccess', () => {
  describe('isCorporateNavItemVisible', () => {
    it('hides management routes for corporate account owner', () => {
      expect(isCorporateNavItemVisible(ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS, 'corporate')).toBe(
        false,
      )
      expect(
        isCorporateNavItemVisible(
          ROUTES.IN_APP.DASHBOARD.CORPORATE.VENDOR_INVITATIONS,
          'corporate',
        ),
      ).toBe(false)
    })

    it('shows management routes for corporate super admin', () => {
      expect(
        isCorporateNavItemVisible(
          ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS,
          'corporate super admin',
        ),
      ).toBe(true)
    })

    it('hides purchases and recipients until approved', () => {
      expect(
        isCorporateNavItemVisible(ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE, 'corporate', {
          canAccessRestrictedFeatures: false,
        }),
      ).toBe(false)
      expect(
        isCorporateNavItemVisible(ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE, 'corporate', {
          canAccessRestrictedFeatures: true,
        }),
      ).toBe(true)
    })
  })

  describe('buildCorporateAccountMenuItems', () => {
    it('shows only dashboard for pending corporate owner', () => {
      const items = buildCorporateAccountMenuItems({
        userType: 'corporate',
        canAccessRestrictedFeatures: false,
      })
      expect(items.map((i) => i.label)).toEqual(['Dashboard'])
    })

    it('matches sidebar for corporate super admin with full access', () => {
      const items = buildCorporateAccountMenuItems({
        userType: 'corporate super admin',
        canAccessRestrictedFeatures: true,
      })
      expect(items.map((i) => i.label)).toEqual([
        'Dashboard',
        'Purchases',
        'Recipients',
        'Requests',
        'Admins',
        'Vendor Invitations',
        'Vendors',
      ])
    })
  })
})
