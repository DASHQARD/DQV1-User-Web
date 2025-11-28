import { type RouteObject } from 'react-router'

import { DashboardLayout, dashboardRoutes, websiteRoutes } from '../features'
import { WebsiteLayout } from '../layout'
import { CustomErrorBoundary } from '@/components'
import { authRoutes } from '@/features/auth'
import { adminAuthRoutes, adminDashboardRoutes, AdminLayout } from '@/features/admin'

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
    path: 'admin/auth',
    children: adminAuthRoutes,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <CustomErrorBoundary />,
    children: dashboardRoutes,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <CustomErrorBoundary />,
    children: adminDashboardRoutes,
  },
]
