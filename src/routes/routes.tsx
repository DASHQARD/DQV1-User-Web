import { type RouteObject } from 'react-router'

import { CreateAccount, Home, Login, ProductDetails, Products, ResetPassword } from '../pages'
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
        path: 'products',
        element: <Products />,
      },
      {
        path: 'products/:id',
        element: <ProductDetails />,
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
