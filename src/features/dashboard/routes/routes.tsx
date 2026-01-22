import type { RouteObject } from 'react-router'
import { Navigate, Outlet } from 'react-router-dom'

import { corporateRoutes } from '../corporate/routes/routes'
import { vendorRoutes } from '../vendor/routes/routes'
import { UserSettings, MyCards, CardDetailsPage } from '../pages'
import { UserDashboard, UserRedemptions, Orders } from '../user/pages'

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
    path: 'redemptions',
    element: <UserRedemptions />,
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
