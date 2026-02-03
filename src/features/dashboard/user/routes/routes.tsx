import type { RouteObject } from 'react-router'
import { Navigate, Outlet } from 'react-router-dom'

import {
  UserDashboard,
  UserRedemptions,
  Orders,
  MyCards,
  CardDetailsPage,
  UserSettings,
} from '../pages'

export const userRoutes: RouteObject[] = [
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
]
