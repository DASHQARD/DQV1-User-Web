import type { RouteObject } from 'react-router'
import { AdminLogin, AdminOnboarding } from '../pages'

// TODO: Import admin auth pages when created
// import { AdminLogin, AdminForgotPassword, AdminResetPassword } from '../pages'

export const adminAuthRoutes: RouteObject[] = [
  {
    path: 'login',
    // element: <AdminLogin />,
    element: <AdminLogin />,
  },
  {
    path: 'onboard',
    element: <AdminOnboarding />,
  },
  {
    path: 'forget-password',
    // element: <AdminForgotPassword />,
    element: <div>Admin Forgot Password (To be implemented)</div>,
  },
  {
    path: 'reset-password',
    // element: <AdminResetPassword />,
    element: <div>Admin Reset Password (To be implemented)</div>,
  },
]
