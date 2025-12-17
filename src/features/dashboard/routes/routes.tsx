import type { RouteObject } from 'react-router'

import { corporateRoutes } from '../corporate/routes/routes'
import { vendorRoutes } from '../vendor/routes/routes'

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'corporate',
    children: [...corporateRoutes],
  },
  {
    path: 'vendor',
    children: [...vendorRoutes],
  },
]
