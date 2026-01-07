import type { RouteObject } from 'react-router'
import { Navigate, Outlet } from 'react-router-dom'

import { corporateRoutes } from '../corporate/routes/routes'
import { vendorRoutes } from '../vendor/routes/routes'
import { Orders, UserSettings, MyCards, CardDetailsPage, UserDashboard } from '../pages'

export const dashboardRoutes: RouteObject[] = [
  {
    index: true,
    element: <UserDashboard />,
  },
  {
    path: 'my-cards',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <MyCards />,
      },
      {
        path: ':cardType',
        element: <CardDetailsPage />,
      },
    ],
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
