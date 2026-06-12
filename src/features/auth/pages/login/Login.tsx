import { LoginForm } from '../../components'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

export default function Login() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)

  // Guest browse/checkout sessions are authenticated but should still be able to sign in.
  if (isAuthenticated && !isGuestAuth) {
    return <Navigate to={ROUTES.IN_APP.DASHBOARD.HOME} replace />
  }

  return <LoginForm />
}
