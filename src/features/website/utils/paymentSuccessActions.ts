import { ROUTES } from '@/utils/constants'

export type PaymentSuccessSession = {
  isAuthenticated: boolean
  isGuestAuth: boolean
  userType?: string
}

export type PaymentSuccessAction = {
  id: string
  label: string
  icon: string
  to: string
  variant: 'secondary' | 'outline'
}

function isCorporateUserType(userType?: string) {
  return (
    userType === 'corporate' ||
    userType === 'corporate super admin' ||
    userType === 'corporate admin'
  )
}

/** Actions shown after checkout based on session type (member vs guest vs signed out). */
export function getPaymentSuccessActions(session: PaymentSuccessSession): PaymentSuccessAction[] {
  const { isAuthenticated, isGuestAuth, userType } = session
  const isMember = isAuthenticated && !isGuestAuth

  if (isMember) {
    const isCorporate = isCorporateUserType(userType)
    return [
      {
        id: 'dashboard',
        label: 'Go to dashboard',
        icon: 'bi:house-door-fill',
        to: isCorporate ? ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME : ROUTES.IN_APP.DASHBOARD.HOME,
        variant: 'secondary',
      },
      {
        id: 'orders',
        label: isCorporate ? 'View transactions' : 'View orders',
        icon: 'bi:receipt',
        to: isCorporate
          ? ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS
          : ROUTES.IN_APP.DASHBOARD.ORDERS,
        variant: 'outline',
      },
    ]
  }

  const actions: PaymentSuccessAction[] = isGuestAuth
    ? [
        {
          id: 'shop',
          label: 'Continue shopping',
          icon: 'bi:bag-heart-fill',
          to: ROUTES.IN_APP.DASHQARDS,
          variant: 'secondary',
        },
        {
          id: 'guest-cards',
          label: 'My cards',
          icon: 'bi:credit-card-2-front',
          to: ROUTES.IN_APP.GUEST.CARDS,
          variant: 'outline',
        },
        {
          id: 'redeem',
          label: 'Redeem a gift card',
          icon: 'bi:gift-fill',
          to: ROUTES.IN_APP.REDEEM,
          variant: 'outline',
        },
      ]
    : [
        {
          id: 'shop',
          label: 'Continue shopping',
          icon: 'bi:bag-heart-fill',
          to: ROUTES.IN_APP.DASHQARDS,
          variant: 'secondary',
        },
        {
          id: 'redeem',
          label: 'Redeem a gift card',
          icon: 'bi:gift-fill',
          to: ROUTES.IN_APP.REDEEM,
          variant: 'outline',
        },
      ]

  if (!isAuthenticated) {
    actions.push({
      id: 'sign-in',
      label: 'Sign in',
      icon: 'bi:box-arrow-in-right',
      to: ROUTES.IN_APP.AUTH.LOGIN,
      variant: 'outline',
    })
  }

  return actions
}
