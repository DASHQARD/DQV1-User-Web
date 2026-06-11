import { Text } from '@/components/Text'
import { Icon } from '@/libs'

type GiftCardRecipientFormHeaderProps = {
  title: string
  subtitle: string
}

export function GiftCardRecipientFormHeader({ title, subtitle }: GiftCardRecipientFormHeaderProps) {
  return (
    <div className="rounded-t-[20px] border-b-2 border-[#ffc40033] bg-linear-to-br from-[#402d87] to-[#2d1a72] px-4 py-4 pr-14 text-white sm:px-8 sm:py-6 sm:pr-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#ffc400] to-[#f0b90b] text-primary-500 shadow-[0_4px_12px_#ffc4004d] sm:h-14 sm:w-14">
            <Icon icon="bi:person-plus-fill" className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <Text as="h2" variant="h2" weight="bold" className="text-lg text-white sm:text-2xl">
              {title}
            </Text>
            <Text
              as="p"
              variant="span"
              weight="medium"
              className="mt-1 text-xs leading-relaxed text-white/80 sm:text-sm"
            >
              {subtitle}
            </Text>
          </div>
        </div>
        <div className="flex w-fit shrink-0 items-center gap-1 self-start rounded-full border border-[#ffc4004d] bg-[#ffc40033] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#ffc400] sm:px-3 sm:py-2 sm:text-xs">
          <Icon icon="bi:shield-check" className="size-3.5 sm:size-4" />
          Secure
        </div>
      </div>
    </div>
  )
}
