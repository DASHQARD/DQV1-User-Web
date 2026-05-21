import { Link, useNavigate } from 'react-router-dom'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'

/** Inline dashboard reminder for incomplete vendor onboarding steps. */
export default function VendorOnboardingBanner() {
  const navigate = useNavigate()
  const {
    steps,
    progressPercentage,
    totalCount,
    completedCount,
    isComplete,
    nextStep,
    addAccountParam,
    isBranchManager,
  } = useVendorOnboardingProgress()

  if (isComplete) return null

  const pendingSteps = steps.filter((s) => !s.completed)

  return (
    <section className="overflow-hidden rounded-xl border border-[#e8eaef] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-4 border-b border-[#f1f3f4] bg-[#faf9fc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#402D87]/10">
              <Icon icon="bi:clipboard-check" className="text-base text-[#402D87]" />
            </span>
            <Text variant="h6" weight="semibold" className="text-gray-900">
              {isBranchManager ? 'Complete branch manager setup' : 'Complete vendor setup'}
            </Text>
          </div>
          <Text variant="span" className="mt-2 block text-sm text-gray-500">
            {completedCount} of {totalCount} steps done — finish the remaining items to activate this
            account.
          </Text>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 max-w-xs overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#402D87] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-[#402D87]">
              {progressPercentage}%
            </span>
          </div>
        </div>
        {nextStep && (
          <Button
            variant="secondary"
            size="medium"
            className="shrink-0 rounded-lg px-5"
            onClick={() => navigate(addAccountParam(nextStep.path))}
          >
            Continue
            <Icon icon="bi:arrow-right" className="ml-1.5 text-sm" />
          </Button>
        )}
      </div>

      {pendingSteps.length > 0 && (
        <ul className="divide-y divide-[#f1f3f4]">
          {pendingSteps.map((step, index) => (
            <li key={step.id}>
              <Link
                to={addAccountParam(step.path)}
                className={cn(
                  'group flex items-center gap-4 px-5 py-3.5 transition-colors',
                  'hover:bg-[#faf9fc]',
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e0e3e8] bg-white text-xs font-semibold text-gray-500 group-hover:border-[#402D87]/30 group-hover:text-[#402D87]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-900 group-hover:text-[#402D87]">
                    {step.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">{step.description}</span>
                </span>
                <Icon
                  icon="bi:chevron-right"
                  className="shrink-0 text-gray-300 transition-colors group-hover:text-[#402D87]"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
