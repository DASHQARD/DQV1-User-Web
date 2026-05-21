import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { Text } from '@/components'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'

export default function CompleteVendorWidget() {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const navigate = useNavigate()
  const {
    steps,
    totalCount,
    progressPercentage,
    isComplete,
    nextStep,
    addAccountParam,
    isBranchManager,
  } = useVendorOnboardingProgress()

  const handleContinue = () => {
    if (nextStep) navigate(addAccountParam(nextStep.path))
  }

  if (isComplete) return null

  return (
    <div className="bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-[#f1f3f4] overflow-hidden w-full">
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
              <div className="w-6 h-6 rounded-full border-2 border-gray-400 border-t-transparent" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">
                Complete your {isBranchManager ? 'branch manager' : 'vendor'} onboarding
              </div>
              <div className="text-xs text-gray-500">
                {progressPercentage}% complete — finish setup to activate this account
              </div>
            </div>
          </div>
          <Icon icon="bi:chevron-down" className="text-gray-400 text-lg" />
        </button>
      )}

      {isExpanded && (
        <div className="p-6 flex flex-col gap-4">
          <section className="p-4 border-4 border-[#F5F6F9] rounded-lg flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <section>
                <Text variant="h4" weight="medium" className="text-gray-900 mb-1">
                  Complete your {isBranchManager ? 'branch manager' : 'vendor'} onboarding process
                </Text>
                <Text variant="span" className="text-gray-600">
                  Finish all {totalCount} {totalCount === 1 ? 'step' : 'steps'} to activate your{' '}
                  {isBranchManager ? 'branch manager' : 'vendor'} account.
                </Text>
              </section>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Collapse"
              >
                <Icon icon="bi:chevron-up" className="text-gray-600 text-xl shrink-0" />
              </button>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-sm font-semibold text-[#402D87]">
                  {progressPercentage}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#402D87] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </section>

          <div className="space-y-3 mb-6">
            {steps.map((step) => (
              <Link
                key={step.id}
                to={addAccountParam(step.path)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  step.completed ? 'bg-gray-50 opacity-75' : 'bg-[#f5f1ff] hover:bg-[#ede9fe]',
                )}
              >
                <Icon
                  icon={step.completed ? 'bi:check-circle-fill' : 'bi:circle'}
                  className={cn(
                    'text-lg shrink-0',
                    step.completed ? 'text-[#059669]' : 'text-gray-400',
                  )}
                />
                <div className="flex-1">
                  <div
                    className={cn(
                      'text-sm font-medium',
                      step.completed ? 'text-gray-500 line-through' : 'text-gray-900',
                    )}
                  >
                    {step.label}
                  </div>
                  {!step.completed && (
                    <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!nextStep}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200',
              'bg-[#402D87] text-white hover:bg-[#5B4397] shadow-sm',
            )}
          >
            {nextStep ? `Continue with ${nextStep.label}` : 'Continue'}
          </button>
        </div>
      )}
    </div>
  )
}
