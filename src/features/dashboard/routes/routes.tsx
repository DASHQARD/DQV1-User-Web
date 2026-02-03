import type { RouteObject } from 'react-router'

import { corporateRoutes } from '../corporate/routes/routes'
import { vendorRoutes } from '../vendor/routes/routes'
import { userRoutes } from '../user/routes'

export const dashboardRoutes: RouteObject[] = [
  ...userRoutes,
  {
    path: 'corporate',
    children: [...corporateRoutes],
  },
  {
    path: 'vendor',
    children: [...vendorRoutes],
  },
]
