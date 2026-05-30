import type { ReactNode } from 'react'

type GiftCardRecipientFormActionsProps = {
  children: ReactNode
}

export function GiftCardRecipientFormActions({ children }: GiftCardRecipientFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#f8f9fa] px-10 py-6 md:flex-row md:justify-end">
      {children}
    </div>
  )
}
