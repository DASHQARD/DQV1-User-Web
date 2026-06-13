import { LoginForm } from '../../components'
import { Navigate, useSearchParams } from 'react-router'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

export default function Login() {
  const [searchParams] = useSearchParams()
  const vtoken = searchParams.get('vtoken')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)

  // Legacy verification emails land on /auth/login?vtoken=... — always verify first,
  // even when a member session is already stored in the browser.
  if (vtoken) {
    const target = new URLSearchParams()
    target.set('vtoken', vtoken)
    return <Navigate to={`${ROUTES.IN_APP.AUTH.VERIFY_EMAIL}?${target.toString()}`} replace />
  }

  // Guest browse/checkout sessions are authenticated but should still be able to sign in.
  if (isAuthenticated && !isGuestAuth) {
    return <Navigate to={ROUTES.IN_APP.DASHBOARD.HOME} replace />
  }

  return <LoginForm />
}
