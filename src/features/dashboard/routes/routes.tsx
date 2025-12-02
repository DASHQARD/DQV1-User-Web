import { type RouteObject, Outlet } from 'react-router'
import { Home } from '../pages/home'
import { Purchase } from '../pages/purchase'
import {
  AddBranch,
  BranchPerformance,
  BusinessDetails,
  BusinessIdentificationCards,
  Compliance,
  CreateBranch,
  PaymentInfo,
  ProfileInformation,
  Redeem,
  Settings,
  Transactions,
  UploadID,
} from '../pages'
import ExperiencePage from '../pages/experience'

export const dashboardRoutes: RouteObject[] = [
  {
    path: '',
    element: <Home />,
  },
  {
    path: 'purchase',
    element: <Purchase />,
  },
  {
    path: 'redeem/dashpro',
    element: <Redeem />,
  },
  {
    path: 'transactions',
    element: <Transactions />,
  },
  {
    path: 'experience',
    element: <ExperiencePage />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
  {
    path: 'payment-methods',
    element: <PaymentInfo />,
  },
  {
    path: 'branches',
    element: <BranchPerformance />,
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
