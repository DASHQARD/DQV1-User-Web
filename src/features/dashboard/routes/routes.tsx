import type { RouteObject } from 'react-router'

import { VendorOnboardingGuard } from '../components/VendorOnboardingGuard'
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
    element: <VendorOnboardingGuard />,
    children: [...vendorRoutes],
  },
]
