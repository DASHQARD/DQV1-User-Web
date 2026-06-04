import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

/** Sends dashboard redeem routes to the unified public redemption flow. */
export default function RedemptionRedirect() {
  return <Navigate to={ROUTES.IN_APP.REDEEM} replace />
}
