import type { RouteObject } from 'react-router'
import { CreateAccount, ForgotPassword, Login, Onboarding, ResetPassword } from '../pages'

export const authRoutes: RouteObject[] = [
  {
    path: 'register',
    element: <CreateAccount />,
  },
  {
    path: 'login',
    element: <Login />,
  },
  {
    path: 'forget-password',
    element: <ResetPassword />,
  },
  {
    path: 'reset-password',
    element: <ForgotPassword />,
  },
  {
    path: 'onboarding',
    element: <Onboarding />,
  },
]
