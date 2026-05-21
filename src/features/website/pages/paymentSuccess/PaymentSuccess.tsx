import { useSearchParams, useNavigate, Link } from 'react-router-dom'

import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { getPaymentSuccessActions } from '@/features/website/utils/paymentSuccessActions'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const userType = useAuthStore((state) => (state.user as { user_type?: string } | null)?.user_type)

  const trxref = searchParams.get('trxref')
  const reference = searchParams.get('reference')

  const actions = getPaymentSuccessActions({
    isAuthenticated,
    isGuestAuth,
    userType,
  })

  const isMember = isAuthenticated && !isGuestAuth

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#f8fafc] to-[#e2e8f0] p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl md:p-12">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Icon icon="bi:check-circle-fill" className="text-5xl text-green-600" />
          </div>
          <Text variant="h2" weight="bold" className="mb-2 text-gray-900">
            Payment Successful!
          </Text>
          <Text variant="p" className="text-center text-gray-600">
            Your payment has been processed successfully. You will receive a confirmation email
            shortly.
          </Text>
          {!isMember && (
            <Text variant="p" className="mt-3 text-center text-sm text-gray-500">
              Guest checkout does not include a member dashboard. Continue shopping or redeem your
              gift cards below.
            </Text>
          )}
        </div>

        {(trxref || reference) && (
          <div className="mb-8 space-y-4 rounded-lg bg-gray-50 p-6">
            <Text variant="h6" weight="semibold" className="mb-4 text-gray-900">
              Payment Details
            </Text>
            {trxref && (
              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <Text variant="span" className="text-gray-600">
                  Transaction Reference:
                </Text>
                <Text variant="span" weight="medium" className="font-mono text-sm text-gray-900">
                  {trxref}
                </Text>
              </div>
            )}
            {reference && (
              <div className="flex items-center justify-between py-2">
                <Text variant="span" className="text-gray-600">
                  Reference:
                </Text>
                <Text variant="span" weight="medium" className="font-mono text-sm text-gray-900">
                  {reference}
                </Text>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row sm:flex-wrap">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              onClick={() => navigate(action.to)}
              className="flex items-center justify-center gap-2"
            >
              <Icon icon={action.icon} className="text-lg" />
              {action.label}
            </Button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Text variant="p" className="text-sm text-gray-500">
            If you have any questions or concerns, please{' '}
            <Link to="/contact" className="text-primary-600 hover:underline">
              contact our support team
            </Link>
            .
          </Text>
        </div>
      </div>
    </div>
  )
}
