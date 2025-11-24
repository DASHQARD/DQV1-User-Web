import type { RouteObject } from 'react-router'
import {
  BusinessDetails,
  CreateAccount,
  ForgotPassword,
  Login,
  Onboarding,
  ResetPassword,
  UploadID,
} from '../pages'

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
  {
    path: 'business-details',
    element: <BusinessDetails />,
  },
  {
    path: 'upload-id',
    element: <UploadID />,
  },
]
