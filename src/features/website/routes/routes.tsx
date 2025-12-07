import type { RouteObject } from 'react-router'
import {
  AboutUs,
  Checkout,
  DashQards,
  LandingPage,
  Vendors,
  VendorsProfile,
  ViewBag,
} from '../pages'

export const websiteRoutes: RouteObject[] = [
  {
    path: '',
    element: <LandingPage />,
  },
  {
    path: 'about',
    element: <AboutUs />,
  },
  {
    path: 'dashqards',
    element: <DashQards />,
  },
  {
    path: 'vendors',
    element: <Vendors />,
  },
  {
    path: 'vendor',
    element: <VendorsProfile />,
  },
  {
    path: 'checkout',
    element: <Checkout />,
  },
  {
    path: 'view-bag',
    element: <ViewBag />,
  },
]
