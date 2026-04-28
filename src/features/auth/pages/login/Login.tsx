import { LoginForm } from '../../components'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

export default function Login() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.IN_APP.DASHBOARD.HOME} replace />
  }

  return <LoginForm />
}
