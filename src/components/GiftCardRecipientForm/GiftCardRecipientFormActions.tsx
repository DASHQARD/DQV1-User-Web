import type { ReactNode } from 'react'

type GiftCardRecipientFormActionsProps = {
  children: ReactNode
}

export function GiftCardRecipientFormActions({ children }: GiftCardRecipientFormActionsProps) {
  return (
    <div className="border-t border-gray-100 bg-[#f8f9fa] px-4 py-4 sm:px-6 sm:py-6 md:px-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:justify-end">
        {children}
      </div>
    </div>
  )
}
