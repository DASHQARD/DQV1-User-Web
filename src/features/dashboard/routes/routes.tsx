import type { RouteObject } from 'react-router'
import { Navigate, Outlet } from 'react-router-dom'

import { corporateRoutes } from '../corporate/routes/routes'
import { vendorRoutes } from '../vendor/routes/routes'
import { Orders, UserSettings, MyCards } from '../pages'

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'my-cards',
    element: <MyCards />,
  },
  {
    path: 'orders',
    element: <Orders />,
  },
  {
    path: 'settings',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <UserSettings />,
      },
      {
        path: 'personal-information',
        element: <Navigate to="/dashboard/settings?tab=personal-information" replace />,
      },
    ],
  },
  {
    path: 'corporate',
    children: [...corporateRoutes],
  },
  {
    path: 'vendor',
    children: [...vendorRoutes],
  },
]
