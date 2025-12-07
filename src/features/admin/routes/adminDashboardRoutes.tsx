import { type RouteObject } from 'react-router'
import { AdminHome, Vendors, Customers, Admins } from '../pages'

// TODO: Import other admin pages when created
// import { Merchants, Roles, Transactions, Profile, Settings } from '../pages'

export const adminDashboardRoutes: RouteObject[] = [
  {
    path: '',
    element: <AdminHome />,
  },
  {
    path: 'vendors',
    element: <Vendors />,
  },
  {
    path: 'customers',
    element: <Customers />,
  },
  {
    path: 'admins',
    element: <Admins />,
  },
  // TODO: Add other routes when pages are created
  // {
  //   path: 'merchants',
  //   element: <Merchants />,
  // },
  // {
  //   path: 'roles',
  //   element: <Roles />,
  // },
  // {
  //   path: 'transactions',
  //   element: <Transactions />,
  // },
  // {
  //   path: 'profile',
  //   element: <Profile />,
  // },
  // {
  //   path: 'settings',
  //   element: <Settings />,
  // },
]
