import { describe, expect, it } from 'vitest'

import {
  formatCardMetricsBalanceCell,
  getCardMetricsDisplayBalance,
  isBalanceCardType,
  isCountCardType,
  parseCardMetricsUnredeemedBalance,
  shouldShowCardMetricsBalance,
} from '@/utils/cardMetricsDisplay'

describe('cardMetricsDisplay', () => {
  it('classifies balance vs count card types', () => {
    expect(isBalanceCardType('dashpro')).toBe(true)
    expect(isBalanceCardType('dashgo')).toBe(true)
    expect(isCountCardType('dashx')).toBe(true)
    expect(isCountCardType('dashpass')).toBe(true)
    expect(shouldShowCardMetricsBalance('dashgo')).toBe(true)
    expect(shouldShowCardMetricsBalance('dashx')).toBe(false)
  })

  it('uses unredeemed_amount for DashGo without price fallback', () => {
    expect(
      getCardMetricsDisplayBalance(
        { type: 'DashGo', unredeemed_amount: '1.00' },
        'dashgo',
      ),
    ).toBe(1)
    expect(
      parseCardMetricsUnredeemedBalance({ unredeemed_amount: '50.00' }),
    ).toBe(50)
  })

  it('returns null balance for DashX / DashPass', () => {
    expect(
      getCardMetricsDisplayBalance(
        { type: 'DashX', unredeemed_amount: null },
        'dashx',
      ),
    ).toBeNull()
    expect(
      getCardMetricsDisplayBalance(
        { type: 'DashPass', unredeemed_amount: null },
        'dashpass',
      ),
    ).toBeNull()
  })

  it('formats table cells by card type', () => {
    expect(
      formatCardMetricsBalanceCell({
        type: 'DashGo',
        unredeemed_amount: '99.00',
        currency: 'GHS',
      }),
    ).toBe('GHS 99.00')
    expect(
      formatCardMetricsBalanceCell({
        type: 'DashX',
        unredeemed_amount: null,
        currency: 'GHS',
      }),
    ).toBe('—')
  })
})
