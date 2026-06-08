import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { ACCOUNT_BENEFITS } from './accountBenefits'

type AccountBenefitsPanelProps = {
  /** Full marketing layout for signup; compact sidebar for checkout/view bag; banner for mobile checkout. */
  variant?: 'marketing' | 'sidebar' | 'banner'
  /** Optional note that guest checkout remains available (AC4). */
  showGuestCheckoutNote?: boolean
  className?: string
}

export function AccountBenefitsPanel({
  variant = 'sidebar',
  showGuestCheckoutNote = false,
  className = '',
}: AccountBenefitsPanelProps) {
  if (variant === 'marketing') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="mb-3">
          <span className="inline-block rounded-full bg-linear-to-br from-primary-500 to-[#2d1a72] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(64,45,135,0.2)]">
            Join DashQard Today
          </span>
        </div>

        <h2 className="mb-4 text-3xl font-bold leading-tight text-[#2d1a72] md:text-4xl">
          Sign up for{' '}
          <span className="bg-linear-to-br from-[#f5c842] to-[#4a9eff] bg-clip-text text-transparent">
            more
          </span>
        </h2>

        <p className="mb-6 text-base leading-relaxed text-[#666] md:text-lg">
          Create a free account to unlock the full DashQard gifting experience:
        </p>

        <BenefitList items={ACCOUNT_BENEFITS} density="comfortable" />

        <CreateAccountCta className="mt-6" size="lg" />

        <Link
          to={ROUTES.IN_APP.AUTH.LOGIN}
          className="mt-4 text-sm text-[#666] no-underline transition-colors hover:text-primary-500"
        >
          Already have an account? <strong className="text-primary-500">Login</strong>
        </Link>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <aside
        className={`rounded-2xl border border-primary-500/15 bg-linear-to-br from-primary-500/5 to-[#7950ed]/5 p-4 sm:p-5 ${className}`}
        aria-label="Account benefits"
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
              Why create an account?
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Unlock higher limits, bulk gifting, and more — free to join.
            </p>
          </div>
          <CreateAccountCta size="sm" />
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACCOUNT_BENEFITS.map((item) => (
            <li key={item.title} className="flex items-start gap-2 text-sm text-gray-700">
              <Icon icon={item.icon} className="mt-0.5 shrink-0 text-primary-600" />
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
        {showGuestCheckoutNote ? (
          <p className="mt-3 text-xs text-gray-500">
            You can still complete this purchase as a guest — no account required.
          </p>
        ) : null}
      </aside>
    )
  }

  return (
    <aside
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
      aria-label="Account benefits"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
        Why create an account?
      </p>
      <p className="mt-1 mb-4 text-sm text-gray-600">
        Get more from DashQard with a free registered account.
      </p>

      <BenefitList items={ACCOUNT_BENEFITS} density="compact" />

      <CreateAccountCta className="mt-5" size="md" />

      {showGuestCheckoutNote ? (
        <p className="mt-3 text-center text-xs text-gray-500">
          Continue as guest — your purchase is not blocked.
        </p>
      ) : null}
    </aside>
  )
}

function BenefitList({
  items,
  density,
}: {
  items: typeof ACCOUNT_BENEFITS
  density: 'comfortable' | 'compact'
}) {
  if (density === 'comfortable') {
    return (
      <ul className="mb-2 list-none space-y-4 p-0">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex items-start gap-4 rounded-2xl border border-primary-500/10 bg-white p-4 shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:translate-x-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] max-md:hover:translate-x-0"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-[#2d1a72] text-lg text-white shadow-[0_4px_15px_rgba(64,45,135,0.3)]">
              <Icon icon={item.icon} className="text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-base font-semibold text-[#2d1a72]">{item.title}</h3>
              <p className="m-0 text-sm leading-relaxed text-[#666]">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-700">
            <Icon icon={item.icon} className="text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{item.title}</p>
            <p className="text-xs leading-relaxed text-gray-500">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function CreateAccountCta({
  className = '',
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass =
    size === 'sm'
      ? 'px-4 py-2 text-xs'
      : size === 'lg'
        ? 'px-6 py-3 text-base'
        : 'w-full px-4 py-2.5 text-sm'

  return (
    <Link
      to={ROUTES.IN_APP.AUTH.REGISTER}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#402D87] to-[#7950ed] font-semibold text-white no-underline shadow-sm transition-all hover:from-[#402D87]/90 hover:to-[#7950ed]/90 hover:shadow-md ${sizeClass} ${className}`}
    >
      Create free account
      <Icon icon="bi:arrow-right" className="text-sm" />
    </Link>
  )
}
