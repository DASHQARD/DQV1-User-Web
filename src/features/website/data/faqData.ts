import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL_HREF } from '@/utils/constants'

export type FaqItem = { q: string; a: string }
export type FaqCategory = { title: string; items: FaqItem[] }

export const FAQ_DATA: FaqCategory[] = [
  {
    title: '0.1 About Us',
    items: [
      {
        q: 'What is DashQard?',
        a: `DashQard is Ghana's Premier Digital Gifting Platform. We provide innovative, secure, and seamless solutions for individuals and businesses to exchange value in meaningful ways.`,
      },
      {
        q: 'What products does DashQard offer?',
        a: `DashPro, DashGo, DashX & DashPass`,
      },
    ],
  },
  {
    title: '0.2 Getting Started: Using the Platform',
    items: [
      {
        q: 'How do I create an account on DashQard?',
        a: `Visit the DashQard website at Dashqard.com.
Click "Sign Up" or "Get Started".
Enter your Email and create a password.
Log in to authenticate and activate your account.
We may send you an OTP verification to confirm your identity.`,
      },
      {
        q: 'Why should I sign up for DashQard?',
        a: `Signing up unlocks the full DashQard experience:
Access to an intuitive Dashboard with analytics.
Increased transaction limits.
Increased gift card limits; up to 10 recipients using bulk gifting.
Track your gift history, balances and redemptions.
Get personalized notifications.`,
      },
      {
        q: 'Is it free to create a DashQard account?',
        a: `Yes, creating an account on DashQard is completely free.`,
      },
      {
        q: 'Can I buy or redeem a gift card without signing up?',
        a: `Yes. You can purchase or redeem a gift card without signing up but with some limitations. As a guest, you are limited to one recipient per transaction and a purchase amount of GHS 1,000 per card.
Signing up provides access to the full DashQard experience with special features and benefits without these limitations.`,
      },
    ],
  },
  {
    title: '0.3 Purchasing a Gift Card',
    items: [
      {
        q: 'How do I purchase a gift card?',
        a: `Via Website

Browse as a Guest or Login to your DashQard account (Signing Up gives you more).
Select a Gift card
Enter the transaction details.
Proceed to checkout.
Make payment using the preferred payment method.
Send your gift card.`,
      },
      {
        q: 'Can I customize a gift card?',
        a: `Yes! Add personalized messages to your loved ones on all gift cards.`,
      },
      {
        q: 'What payment methods are accepted?',
        a: `Mobile money (MTN, Vodafone, AirtelTigo).
Bank transfers for bulk purchasing.
Debit/Credit Card`,
      },
      {
        q: 'How do recipients redeem gift cards?',
        a: `Redeem via the website by selecting the redeem option
Enter the receiving vendor details
Follow the prompts`,
      },
    ],
  },
  {
    title: '0.4 DashQard Pricing',
    items: [
      {
        q: 'How much does it cost to use DashQard?',
        a: `DashQard is free to use for browsing, redeeming, and managing your account.
However, a 5% service fee capped at GHS 50 on mobile money payments is applied at checkout`,
      },
      {
        q: 'Why does DashQard charge a 5% fee?',
        a: `The 5% fee covers:
Payment Processing charges.
Integration with mobile money and banking.
Customer support services.
Fraud protection.
Platform development & updates.
This allows DashQard to give you a personalized and secure gifting experience.`,
      },
      {
        q: 'Is the 5% fee included in the card value or added separately?',
        a: `The 5% fee is added on top of the value of the gift card.
For example:
A GHS 500 gift card will cost you GHS 525 total.
DashQard ensures that the full GHS 500 is received by the recipient or vendor.`,
      },
      {
        q: 'Do I get a receipt that shows the fee breakdown?',
        a: `Yes. Every purchase comes with a detailed receipt showing:
Gift card value
Service fee (5%)
Total amount paid.
This ensures full transparency for all purchases.`,
      },
    ],
  },
  {
    title: '0.5 Security and Privacy',
    items: [
      {
        q: 'How does DashQard ensure secure transactions?',
        a: `We use:
Secure payment gateways.
Data encryption for sensitive information.
Fraud detection systems.`,
      },
      {
        q: 'Is my personal information safe with DashQard?',
        a: `Yes, DashQard adheres to strict data privacy regulations and is registered with Ghana's Data Protection Commission. We do not share user information without consent.`,
      },
    ],
  },
  {
    title: '0.6 Support and Troubleshooting',
    items: [
      {
        q: 'What if I have issues with my gift card?',
        a: `Contact DashQard Support via:
Corporate/ Support: ${SUPPORT_PHONE_DISPLAY}
Email: support@dashqard.com
Live Chat: Available on the website.`,
      },
      {
        q: 'Can I cancel or refund a gift card?',
        a: `No, Refunds and cancellations are not possible once the gift card has been delivered to the recipient. Please refer to our Terms and Conditions or Contact support for assistance.`,
      },
      {
        q: 'How do I report fraudulent activity?',
        a: `Report suspicious activity immediately by;
Emailing support@DashQard.com.
Contacting DashQard support via ${SUPPORT_PHONE_DISPLAY}.
Using the chat reporting feature.`,
      },
    ],
  },
]

export const FAQ_SUPPORT_LINKS = {
  phoneDisplay: SUPPORT_PHONE_DISPLAY,
  phoneHref: SUPPORT_PHONE_TEL_HREF,
  email: 'support@dashqard.com',
} as const
