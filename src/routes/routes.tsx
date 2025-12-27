import { type RouteObject } from 'react-router'

import { DashboardLayout, dashboardRoutes, websiteRoutes } from '../features'
import { WebsiteLayout } from '../layout'
import { CustomErrorBoundary } from '@/components'
import { AuthLayout, authRoutes } from '@/features/auth'
import { InviteCorporateAdmin } from '@/features/auth/pages'
import AcceptVendorInvite from '@/features/auth/pages/acceptVendorInvite/AcceptVendorInvite'
import AcceptBranchManagerInvite from '@/features/auth/pages/acceptBranchManagerInvite/AcceptBranchManagerInvite'
import { PaymentSuccess } from '@/features/website/pages'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <WebsiteLayout />,
    children: websiteRoutes,
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: authRoutes,
  },
  {
    path: 'invite/vendor',
    element: <AcceptVendorInvite />,
  },
  {
    path: 'invite/branch',
    element: <AcceptBranchManagerInvite />,
  },
  {
    path: 'corporate-admin',
    element: <AuthLayout />,
    children: [
      {
        path: 'accept-invitation',
        element: <InviteCorporateAdmin />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <CustomErrorBoundary />,
    children: dashboardRoutes,
  },
  {
    path: '/payment/payment-success',
    element: <PaymentSuccess />,
  },
]
