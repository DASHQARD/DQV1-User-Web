import { type RouteObject } from 'react-router'

import { CreateAccount, DashQards, Home, Login, ResetPassword } from '../pages'
import { WebsiteLayout } from '../layout'
import Vendor from '@/pages/vendor/Vendor'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <WebsiteLayout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'dashqards',
        element: <DashQards />,
      },
      {
        path: 'vendor/:id',
        element: <Vendor />,
      },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'register',
        element: <CreateAccount />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },
]
