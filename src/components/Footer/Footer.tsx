import { ROUTES } from '@/utils/constants'
import LogoWhite from '../../assets/images/logo-white.png'
import { Text } from '../Text'
import { Icon } from '@/libs'
import { Link } from 'react-router-dom'

export default function Footer() {
  const socialMediaLinks = [
    {
      icon: 'hugeicons:linkedin-02',
      url: 'https://www.linkedin.com/company/dashqard',
    },
    {
      icon: 'hugeicons:instagram',
      url: 'https://www.instagram.com/dashqard',
    },
    {
      icon: 'hugeicons:twitter',
      url: 'https://www.twitter.com/dashqard',
    },
    {
      icon: 'hugeicons:youtube',
      url: 'https://www.youtube.com/dashqard',
    },
    {
      icon: 'hugeicons:tiktok',
      url: 'https://www.tiktok.com/dashqard',
    },
  ]

  const quickLinks = [
    {
      label: 'About Us',
      url: ROUTES.IN_APP.ABOUT,
    },
    {
      label: 'Faq',
      url: ROUTES.IN_APP.FAQ,
    },
    {
      label: 'Contact Us',
      url: ROUTES.IN_APP.CONTACT,
    },
    {
      label: 'Get Started',
      url: ROUTES.IN_APP.SIGNUP,
    },
  ]

  const services = [
    {
      label: 'Gift Cards',
      url: ROUTES.IN_APP.GIFT_CARDS,
    },
    {
      label: 'Bulk Gifting',
      url: ROUTES.IN_APP.BULK_GIFTING,
    },
    {
      label: 'Corporate Solutions',
      url: ROUTES.IN_APP.CORPORATE_SOLUTIONS,
    },
    {
      label: 'API Integration',
      url: ROUTES.IN_APP.API_INTEGRATION,
    },
  ]
  return (
    <footer className="bg-primary-700 text-white ">
      <section className="wrapper flex justify-between gap-10 py-12">
        <section className="flex flex-col gap-5 max-w-[416px] w-full">
          <div>
            <img src={LogoWhite} alt="Logo" />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="h2" weight="bold" className="text-yellow-500">
              Create, Connect. Celebrate.
            </Text>
            <p className="text-[#fffc]">
              Redefining the gifting experience across Ghana with innovative, secure, and seamless
              digital solutions.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Text variant="h5" weight="bold">
              Follow Us
            </Text>
            <div className="flex items-center gap-2">
              {socialMediaLinks.map((link) => (
                <button
                  key={link.url}
                  className="p-2 rounded-full bg-[#ffffff1a] border border-white/20 h-10 w-10 flex items-center justify-center cursor-pointer"
                >
                  <Icon icon={link.icon} className="size-5 text-white" />
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <p className="text-[20px] font-bold relative inline-block">
            Quick Links
            <span className="absolute -bottom-2 left-0 h-[2px] bg-yellow-500 w-[30px]"></span>
          </p>
          <ul className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.url} className="flex flex-col gap-3">
                <Link to={link.url}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-4">
          <p className="text-[20px] font-bold relative inline-block">
            Services
            <span className="absolute -bottom-2 left-0 h-[2px] bg-yellow-500 w-[30px]"></span>
          </p>
          <ul className="flex flex-col gap-2">
            {services.map((link) => (
              <li key={link.url} className="flex flex-col gap-3">
                <Link to={link.url}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-4">
          <p className="text-[20px] font-bold relative inline-block">
            Get in Touch
            <span className="absolute -bottom-2 left-0 h-[2px] bg-yellow-500 w-[30px]"></span>
          </p>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-2">
              <div className="bg-white/10 p-2 rounded-full">
                <Icon icon="mdi:email" className="size-5 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-white/60">Email</p>
                <Link
                  to="mailto:support@dashqard.com"
                  className="font-medium text-white hover:text-yellow-500 transition-colors hover:underline"
                >
                  support@dashqard.com
                </Link>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <div className="bg-white/10 p-2 rounded-full">
                <Icon icon="mdi:phone" className="size-5 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-white/60">Support Line</p>
                <p className="font-medium text-white">+233 54 202 2245</p>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <div className="bg-[#25d36633] p-2 rounded-full">
                <Icon icon="mdi:whatsapp" className="size-5 text-[#25d366]" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/60">Purchase Line (WhatsApp)</p>
                <Link
                  to="https://wa.me/233542022245"
                  target="_blank"
                  className="font-medium text-white hover:text-yellow-500 transition-colors hover:underline"
                >
                  +233 56 608 0362
                </Link>
              </div>
            </li>
          </ul>
        </section>
      </section>
      <section className="wrapper flex justify-between items-center py-4 border-t border-white/10">
        <Text className="text-sm text-white/70">
          &copy; {new Date().getFullYear()} DashQard. All rights reserved.
        </Text>
        <ul className="flex items-center gap-4 text-sm text-white/70">
          <li>
            <Link
              to={ROUTES.IN_APP.TERMS_OF_SERVICE}
              className="hover:text-yellow-500 transition-colors hover:underline"
            >
              Terms of Service
            </Link>
          </li>
          <li>
            <Link
              to={ROUTES.IN_APP.PRIVACY_POLICY}
              className="hover:text-yellow-500 transition-colors hover:underline"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              to={ROUTES.IN_APP.COOKIE_POLICY}
              className="hover:text-yellow-500 transition-colors hover:underline"
            >
              Cookie Policy
            </Link>
          </li>
        </ul>
      </section>
    </footer>
  )
}
