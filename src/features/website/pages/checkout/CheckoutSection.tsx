import type { ReactNode } from 'react'
import { cn } from '@/libs'

type CheckoutSectionProps = {
  step: number
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function CheckoutSection({ step, title, subtitle, children, className }: CheckoutSectionProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4">
        <div className="flex items-start gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white"
            aria-hidden
          >
            {step}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}
