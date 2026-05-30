import { LoginForm } from '../../components'
import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

export default function Login() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)

  if (isAuthenticated) {
    return (
      <Navigate
        to={isGuestAuth ? ROUTES.IN_APP.DASHQARDS : ROUTES.IN_APP.DASHBOARD.HOME}
        replace
      />
    )
  }

  return <LoginForm />
}
