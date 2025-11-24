import type { RouteObject } from 'react-router'
import { AboutUs, DashQards, LandingPage, Vendor } from '../pages'

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
    path: 'vendor/:id',
    element: <Vendor />,
  },
]
