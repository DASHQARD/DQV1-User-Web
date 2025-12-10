import type { RouteObject } from 'react-router'
import {
  AboutUs,
  CardDetails,
  Checkout,
  DashQards,
  LandingPage,
  WebsiteVendors,
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
    element: <WebsiteVendors />,
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
  {
    path: 'card/:id',
    element: <CardDetails />,
  },
]
