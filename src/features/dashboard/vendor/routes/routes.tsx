import type { RouteObject } from 'react-router'
import { Outlet } from 'react-router-dom'

import { VendorHome } from '../pages/home'
import ExperiencePage from '../pages/experience'
import ExperienceOverview from '../pages/experience/ExperienceOverview'
import { BranchDetails } from '../pages/branches'
import { Redemptions } from '../pages/redemptions'
import { Requests } from '../pages/requests'
import { AuditLogs } from '../pages/auditLogs'
import { PaymentInfo, VendorPaymentDetails } from '../pages/payment'
import Payments from '../pages/payments/Payments'
import { Compliance, ProfileInformation, UploadID, BusinessDetails } from '../pages/compliance'
import { Settings } from '../pages/settings'
import { BranchManagers } from '../pages/branchManagers'
import { CreateBranch } from '../pages/branches'
import { InviteAdminPage } from '../pages/admin'
import { CorporatePaymentDetails } from '@/features/dashboard/corporate/pages/paymentDetails/CorporatePaymentDetails'

// Vendor-specific dashboard routes. These are mounted under "/dashboard".
export const vendorRoutes: RouteObject[] = [
  {
    index: true,
    element: <VendorHome />,
  },
  {
    path: 'experience',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <ExperiencePage />,
      },
      {
        path: 'overview',
        element: <ExperienceOverview />,
      },
    ],
  },
  {
    path: 'branches',
    element: <Outlet />,
    children: [
      {
        path: ':id',
        element: <BranchDetails />,
      },
    ],
  },
  {
    path: 'branch-managers',
    element: <BranchManagers />,
  },
  {
    path: 'payment-methods',
    element: <PaymentInfo />,
  },
  {
    path: 'payment-details',
    element: <VendorPaymentDetails />,
  },
  {
    path: 'payments',
    element: <Payments />,
  },
  {
    path: 'corporate-payment-details',
    element: <CorporatePaymentDetails />,
  },
  {
    path: 'redemptions',
    element: <Redemptions />,
  },
  {
    path: 'requests',
    element: <Requests />,
  },
  {
    path: 'audit-logs',
    element: <AuditLogs />,
  },
  {
    path: 'invite-branch-manager',
    element: <CreateBranch />,
  },
  {
    path: 'invite-admin',
    element: <InviteAdminPage />,
  },
  {
    path: 'compliance',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <Compliance />,
      },
      {
        path: 'profile',
        element: <ProfileInformation />,
      },
      {
        path: 'upload-id',
        element: <UploadID />,
      },
      {
        path: 'business-details',
        element: <BusinessDetails />,
      },
    ],
  },
  {
    path: 'settings',
    element: <Settings />,
  },
]
