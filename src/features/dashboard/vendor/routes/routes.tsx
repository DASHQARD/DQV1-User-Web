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
import { Invite } from '../pages/invite'

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
]
