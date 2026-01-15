import type { RouteObject } from 'react-router'
import {
  AboutUs,
  CardDetails,
  Checkout,
  ContactPage,
  DashQards,
  LandingPage,
  OrdersPage,
  PrivacyPolicy,
  RedemptionPage,
  TermsOfService,
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
    path: 'contact',
    element: <ContactPage />,
  },
  {
    path: 'orders',
    element: <OrdersPage />,
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
  {
    path: 'redeem',
    element: <RedemptionPage />,
  },
  {
    path: 'terms-of-service',
    element: <TermsOfService />,
  },
  {
    path: 'privacy-policy',
    element: <PrivacyPolicy />,
  },
]
