import { Text } from '@/components/Text'
import { Icon } from '@/libs'

type GiftCardRecipientFormHeaderProps = {
  title: string
  subtitle: string
}

export function GiftCardRecipientFormHeader({ title, subtitle }: GiftCardRecipientFormHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-[20px] border-b-2 border-[#ffc40033] bg-linear-to-br from-[#402d87] to-[#2d1a72] px-8 py-6 text-white">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-[#ffc400] to-[#f0b90b] text-primary-500 shadow-[0_4px_12px_#ffc4004d]">
          <Icon icon="bi:person-plus-fill" className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <Text as="h2" variant="h2" weight="bold" className="text-white">
            {title}
          </Text>
          <Text as="p" variant="span" weight="medium" className="text-white/80">
            {subtitle}
          </Text>
        </div>
      </div>
      <div className="flex items-center gap-1 rounded-full border border-[#ffc4004d] bg-[#ffc40033] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ffc400]">
        <Icon icon="bi:shield-check" className="size-4" />
        Secure
      </div>
    </div>
  )
}
