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
      label: 'Contact Us',
      url: ROUTES.IN_APP.CONTACT,
    },
    {
      label: 'Get Started',
      url: ROUTES.IN_APP.AUTH.REGISTER,
    },
  ]

  const services = [
    {
      label: 'Gift Cards',
      url: ROUTES.IN_APP.DASHQARDS,
    },
    {
      label: 'Vendors',
      url: ROUTES.IN_APP.VENDORS,
    },
    {
      label: 'Redeem',
      url: ROUTES.IN_APP.REDEEM,
    },
  ]
  return (
    <footer className="bg-primary-700 text-white">
      <section className="wrapper px-4 md:px-0 flex flex-col lg:flex-row justify-between gap-8 lg:gap-10 py-8 md:py-12">
        {/* Brand Section */}
        <section className="flex flex-col gap-4 md:gap-5 max-w-[416px] w-full">
          <div>
            <img src={LogoWhite} alt="Logo" className="h-8 md:h-auto" />
          </div>
          <div className="flex flex-col gap-2">
            <Text
              variant="h2"
              weight="bold"
              className="text-yellow-500 text-xl md:text-2xl lg:text-3xl"
            >
              Create, Connect. Celebrate.
            </Text>
            <p className="text-sm md:text-base text-[#fffc]">
              Redefining the gifting experience across Ghana with innovative, secure, and seamless
              digital solutions.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Text variant="h5" weight="bold" className="text-base md:text-lg">
              Follow Us
            </Text>
            <div className="flex items-center gap-2 flex-wrap">
              {socialMediaLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-[#ffffff1a] border border-white/20 h-10 w-10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                  aria-label={`Visit our ${link.icon.split(':')[1]} page`}
                >
                  <Icon icon={link.icon} className="size-5 text-white" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="flex flex-col gap-3 md:gap-4">
          <p className="text-lg md:text-[20px] font-bold relative inline-block">
            Quick Links
            <span className="absolute -bottom-2 left-0 h-[2px] bg-yellow-500 w-[30px]"></span>
          </p>
          <ul className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.url}>
                <Link
                  to={link.url}
                  className="text-sm md:text-base text-white/90 hover:text-yellow-500 transition-colors hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Services Section */}
        <section className="flex flex-col gap-3 md:gap-4">
          <p className="text-lg md:text-[20px] font-bold relative inline-block">
            Services
            <span className="absolute -bottom-2 left-0 h-[2px] bg-yellow-500 w-[30px]"></span>
          </p>
          <ul className="flex flex-col gap-2">
            {services.map((link) => (
              <li key={link.url}>
                <Link
                  to={link.url}
                  className="text-sm md:text-base text-white/90 hover:text-yellow-500 transition-colors hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact Section */}
        <section className="flex flex-col gap-3 md:gap-4">
          <p className="text-lg md:text-[20px] font-bold relative inline-block">
            Get in Touch
            <span className="absolute -bottom-2 left-0 h-[2px] bg-yellow-500 w-[30px]"></span>
          </p>
          <ul className="flex flex-col gap-3 md:gap-4">
            <li className="flex items-start gap-2 md:items-center">
              <div className="bg-white/10 p-2 rounded-full shrink-0">
                <Icon icon="mdi:email" className="size-4 md:size-5 text-white" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs font-medium text-white/60">Email</p>
                <Link
                  to="mailto:support@dashqard.com"
                  className="text-xs md:text-sm font-medium text-white hover:text-yellow-500 transition-colors hover:underline break-all"
                >
                  support@dashqard.com
                </Link>
              </div>
            </li>
            <li className="flex items-start gap-2 md:items-center">
              <div className="bg-white/10 p-2 rounded-full shrink-0">
                <Icon icon="mdi:phone" className="size-4 md:size-5 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-white/60">Support Line</p>
                <p className="text-xs md:text-sm font-medium text-white">+233 54 202 2245</p>
              </div>
            </li>
            <li className="flex items-start gap-2 md:items-center">
              <div className="bg-[#25d36633] p-2 rounded-full shrink-0">
                <Icon icon="mdi:whatsapp" className="size-4 md:size-5 text-[#25d366]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white/60">Purchase Line (WhatsApp)</p>
                <Link
                  to="https://wa.me/233542022245"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs md:text-sm font-medium text-white hover:text-yellow-500 transition-colors hover:underline break-all"
                >
                  +233 56 608 0362
                </Link>
              </div>
            </li>
          </ul>
        </section>
      </section>

      {/* Bottom Section */}
      <section className="wrapper px-4 md:px-0 flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-t border-white/10">
        <Text className="text-xs md:text-sm text-white/70 text-center sm:text-left">
          &copy; {new Date().getFullYear()} DashQard. All rights reserved.
        </Text>
        <ul className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-white/70">
          <li>
            <Link
              to={ROUTES.IN_APP.TERMS_OF_SERVICE}
              className="hover:text-yellow-500 transition-colors hover:underline"
            >
              Terms of Service
            </Link>
          </li>
        </ul>
      </section>
    </footer>
  )
}
