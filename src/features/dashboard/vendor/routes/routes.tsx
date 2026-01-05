import type { RouteObject } from 'react-router'
import { Outlet } from 'react-router-dom'

import { VendorHome } from '../pages/home'
import ExperiencePage from '../pages/experience'
import { BranchManagement } from '../pages/branches'
import { BranchDetails } from '../pages/branches'
import { Redemptions } from '../pages/redemptions'
import { Requests } from '../pages/requests'
import { AuditLogs } from '../pages/auditLogs'
import { PaymentInfo } from '../pages/payment'
import Payments from '../pages/payments/Payments'
import { Invite } from '../pages/invite'
import { Compliance, ProfileInformation, UploadID, BusinessDetails } from '../pages/compliance'
import { Settings } from '../pages/settings'

// Vendor-specific dashboard routes. These are mounted under "/dashboard".
export const vendorRoutes: RouteObject[] = [
  {
    index: true,
    element: <VendorHome />,
  },
  {
    path: 'experience',
    element: <ExperiencePage />,
  },
  {
    path: 'branches',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <BranchManagement />,
      },
      {
        path: ':id',
        element: <BranchDetails />,
      },
    ],
  },
  {
    path: 'payment-methods',
    element: <PaymentInfo />,
  },
  {
    path: 'payments',
    element: <Payments />,
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
    element: <Invite />,
  },
  {
    path: 'invite-admin',
    element: <Invite />,
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
