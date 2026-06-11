import { Icon } from '@/libs'

type AssignToSelfToggleProps = {
  checked: boolean
  onChange: () => void
  description: string
}

export function AssignToSelfToggle({ checked, onChange, description }: AssignToSelfToggleProps) {
  return (
    <section className="border-b border-gray-100 px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-[#f8f9fa] p-4 text-center sm:p-6">
        <div className="flex flex-col items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <div className="relative h-6 w-11">
              <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-primary-500" />
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              <Icon icon="bi:person-check" className="mr-2 inline size-4 text-primary-500" />
              Assign to Self
            </span>
          </label>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </section>
  )
}

export function getAssignToSelfDescription(options: {
  assignToSelf: boolean
  isLocalGuest?: boolean
  isGuestAuth?: boolean
  accountName?: string
}): string {
  const { assignToSelf, isLocalGuest, isGuestAuth, accountName } = options

  if (isLocalGuest) {
    return assignToSelf
      ? 'This card is for you. Enter your details below, or complete sender details at checkout.'
      : 'Enter who should receive this gift card.'
  }

  if (isGuestAuth) {
    return assignToSelf
      ? 'This card is for you. We will use the sender details you entered at checkout.'
      : 'Enter who should receive this gift card.'
  }

  if (assignToSelf && accountName) {
    return `Card will be assigned to ${accountName}. Name, email, and phone fields are auto-filled.`
  }

  return assignToSelf
    ? 'Card will be assigned to your account. Name, email, and phone fields will be ignored.'
    : 'Card will be assigned to someone else. Please provide recipient details below.'
}
