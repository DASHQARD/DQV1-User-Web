import { type RouteObject, Outlet } from 'react-router'

import {
  AddBranch,
  BusinessDetails,
  BusinessIdentificationCards,
  Compliance,
  CreateBranch,
  ProfileInformation,
  Redeem,
  Settings,
  UploadID,
} from '../../pages'
import { CorporateHome, Transactions } from '../pages'
import { Purchase } from '../pages/purchase'
import { Requests } from '../pages/requests'
import { AuditLogs } from '../pages/auditLogs'
import { Admins } from '../pages/admins'
import { Notifications } from '../pages/notifications'
import { Recipients } from '../pages/recipients'
import CorporateCardDetailsPage from '../pages/cards/CardDetailsPage'

export const corporateRoutes: RouteObject[] = [
  {
    path: '',
    element: <CorporateHome />,
  },
  {
    path: 'transactions',
    element: <Transactions />,
  },
  {
    path: 'redeem/dashpro',
    element: <Redeem />,
  },
  {
    path: 'purchase',
    element: <Purchase />,
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
    path: 'admins',
    element: <Admins />,
  },
  {
    path: 'notifications',
    element: <Notifications />,
  },
  {
    path: 'recipients',
    element: <Recipients />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
  {
    path: 'gift-cards/:cardType',
    element: <CorporateCardDetailsPage />,
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
      {
        path: 'business-identification-cards',
        element: <BusinessIdentificationCards />,
      },
      {
        path: 'add-branch',
        element: <AddBranch />,
      },
      {
        path: 'add-branch/create',
        element: <CreateBranch />,
      },
    ],
  },
]
