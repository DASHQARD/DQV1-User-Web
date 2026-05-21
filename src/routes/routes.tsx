import { type RouteObject } from 'react-router'

import { DashboardLayout, dashboardRoutes, websiteRoutes } from '../features'
import { WebsiteLayout } from '../layout'
import { NotFoundPage, RouteErrorPage, RouteGuard } from '@/components'
import { AuthLayout, authRoutes } from '@/features/auth'
import { InviteCorporateAdmin } from '@/features/auth/pages'
import AcceptVendorInvite from '@/features/auth/pages/acceptVendorInvite/AcceptVendorInvite'
import AcceptBranchManagerInvite from '@/features/auth/pages/acceptBranchManagerInvite/AcceptBranchManagerInvite'
import { PaymentSuccess } from '@/features/website/pages'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <WebsiteLayout />,
    errorElement: <RouteErrorPage />,
    children: [...websiteRoutes, { path: '*', element: <NotFoundPage /> }],
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    errorElement: <RouteErrorPage />,
    children: [...authRoutes, { path: '*', element: <NotFoundPage /> }],
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
    element: (
      <RouteGuard>
        <DashboardLayout />
      </RouteGuard>
    ),
    errorElement: <RouteErrorPage />,
    children: [...dashboardRoutes, { path: '*', element: <NotFoundPage /> }],
  },
  {
    path: '/payment/payment-success',
    element: <PaymentSuccess />,
  },
  {
    path: '*',
    element: <WebsiteLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
]
