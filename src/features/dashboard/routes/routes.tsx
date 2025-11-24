import type { RouteObject } from 'react-router'
import { Home } from '../pages/home'
import { Purchase } from '../pages/purchase'
import { Redeem, Settings, Transactions } from '../pages'

export const dashboardRoutes: RouteObject[] = [
  {
    path: '',
    element: <Home />,
  },
  {
    path: 'purchase',
    element: <Purchase />,
  },
  {
    path: 'redeem/dashpro',
    element: <Redeem />,
  },
  {
    path: 'transactions',
    element: <Transactions />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
]
