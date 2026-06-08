import { cn, Icon } from '@/libs'

export type CheckoutFlowStepStatus = 'complete' | 'current' | 'upcoming'

export type CheckoutFlowStep = {
  id: string
  label: string
  status: CheckoutFlowStepStatus
}

function stepBadgeClass(status: CheckoutFlowStepStatus): string {
  if (status === 'complete') return 'bg-green-600 text-white'
  if (status === 'current') return 'bg-primary-600 text-white'
  return 'bg-gray-300 text-gray-600'
}

function stepPillClass(status: CheckoutFlowStepStatus): string {
  if (status === 'complete') return 'bg-green-50 text-green-700'
  if (status === 'current') return 'bg-primary-100 text-primary-700'
  return 'bg-gray-100 text-gray-500'
}

export function CheckoutFlowProgress({ steps }: { steps: CheckoutFlowStep[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-y-2 text-sm font-medium">
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-center gap-2">
          {index > 0 ? (
            <Icon icon="bi:chevron-right" className="size-4 shrink-0 text-gray-400" aria-hidden />
          ) : null}
          <span
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1.5',
              stepPillClass(step.status),
            )}
          >
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full text-xs',
                stepBadgeClass(step.status),
              )}
            >
              {step.status === 'complete' ? '✓' : index + 1}
            </span>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  )
}
