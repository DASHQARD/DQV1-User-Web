import { Icon } from '@/libs'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

const BENEFITS = [
  {
    icon: 'bi:speedometer2',
    title: 'Dashboard & History',
    description: 'Access to Dashboard and transaction gift history',
  },
  {
    icon: 'bi:people-fill',
    title: 'Multiple Recipients',
    description: 'Send gifts to multiple recipients per transaction',
  },
  {
    icon: 'bi:arrow-up-circle-fill',
    title: 'Higher Limits',
    description: 'Enjoy higher gift card limits and premium features',
  },
  {
    icon: 'bi:shield-lock-fill',
    title: 'Enhanced Security',
    description:
      'Secure your transactions with PIN code protection and advanced security features',
  },
] as const

export function SignUpMarketingPanel() {
  return (
    <div className="flex flex-col">
      <div className="mb-3">
        <span className="inline-block rounded-full bg-linear-to-br from-primary-500 to-[#2d1a72] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(64,45,135,0.2)]">
          🚀 Join DashQard Today
        </span>
      </div>

      <h2 className="mb-4 text-3xl font-bold leading-tight text-[#2d1a72] md:text-4xl">
        Sign up for{' '}
        <span className="bg-linear-to-br from-[#f5c842] to-[#4a9eff] bg-clip-text text-transparent">
          more
        </span>
      </h2>

      <p className="mb-6 text-base leading-relaxed text-[#666] md:text-lg">
        Get amazing features on DashQard once you sign up and unlock the full potential of digital
        gifting:
      </p>

      <ul className="mb-6 list-none space-y-4 p-0">
        {BENEFITS.map((item) => (
          <li
            key={item.title}
            className="flex items-start gap-4 rounded-2xl border border-primary-500/10 bg-white p-4 shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:translate-x-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] max-md:hover:translate-x-0"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-[#2d1a72] text-lg text-white shadow-[0_4px_15px_rgba(64,45,135,0.3)]">
              <Icon icon={item.icon} className="text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h6 className="mb-1 text-base font-semibold text-[#2d1a72]">{item.title}</h6>
              <p className="m-0 text-sm leading-relaxed text-[#666]">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mb-4 text-base leading-relaxed text-[#555]">
        Sign up today and transform the way you gift on{' '}
        <span className="font-bold text-primary-500">DASHQARD</span>!
      </p>

      <Link
        to={ROUTES.IN_APP.AUTH.LOGIN}
        className="text-sm text-[#666] no-underline transition-colors hover:text-primary-500"
      >
        Already have an account? <strong className="text-primary-500">Login</strong>
      </Link>
    </div>
  )
}
