import { type RouteObject } from 'react-router'

import { DashboardLayout, dashboardRoutes, websiteRoutes } from '../features'
import { WebsiteLayout } from '../layout'
import { CustomErrorBoundary } from '@/components'
import { authRoutes } from '@/features/auth'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <WebsiteLayout />,
    children: websiteRoutes,
  },
  {
    path: 'auth',
    children: authRoutes,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <CustomErrorBoundary />,
    children: dashboardRoutes,
  },
]
