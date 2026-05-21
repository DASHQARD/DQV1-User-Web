import type { RouteObject } from 'react-router'
import { GuestRouteGuard } from '@/components'
import {
  AboutUs,
  CardDetails,
  Checkout,
  ContactPage,
  FaqPage,
  DashQards,
  GuestCardsPage,
  GuestOrdersPage,
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
    path: 'faq',
    element: <FaqPage />,
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
    path: 'guest/cards',
    element: (
      <GuestRouteGuard>
        <GuestCardsPage />
      </GuestRouteGuard>
    ),
  },
  {
    path: 'guest/orders',
    element: (
      <GuestRouteGuard>
        <GuestOrdersPage />
      </GuestRouteGuard>
    ),
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
