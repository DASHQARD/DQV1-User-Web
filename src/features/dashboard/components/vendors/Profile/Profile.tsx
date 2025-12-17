import { Avatar, Tag, Text } from '@/components'
import { CustomIcon } from '@/components/CustomIcon/CustomIcon'
import { cn, Icon } from '@/libs'
import type { TierType } from '@/types'
import { getStatusVariant } from '@/utils/helpers'
import { getCustomerTierTagIconName } from '@/utils/helpers/customer'

type Props = {
  name: string
  tier: string | number
  status: string
  children: React.ReactNode
  className?: string
}

type PaymentInformationProps = {
  iconName: string
  iconBgColor: string
  name: string
  title: string
  amount: string
  image: string
  children: React.ReactNode
}

export default function Profile({ name, tier, status, children, className }: Readonly<Props>) {
  return (
    <section className={cn('bg-white rounded-xl py-5', className)}>
      <div className="px-6 flex items-center gap-6">
        <section className="flex items-center gap-3 flex-col min-w-40">
          <Avatar name={name} size="lg" className="rounded-xl flex justify-center items-center" />
          <div className="py-2.5 px-2 flex flex-col gap-1 text-center capitalize">
            <Text variant="h4" weight="medium" className="text-gray-800">
              {name}
            </Text>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <CustomIcon
                  name={getCustomerTierTagIconName(String(tier) as TierType)}
                  width={24}
                  height={24}
                />
                <Text variant="span" className="text-secondary-800 text-sm text-nowrap">
                  Tier {tier}
                </Text>
              </div>
              <Tag value={status} variant={getStatusVariant(status)} />
            </div>
          </div>
        </section>
        <div className="pl-6 border-l border-gray-100 grow">{children}</div>
      </div>
    </section>
  )
}

export const PaymentInformation = ({
  iconName,
  iconBgColor,
  title,
  amount,
  image,
  children,
}: Readonly<PaymentInformationProps>) => {
  return (
    <section className="bg-primary-50 rounded-xl px-6 py-5 relative">
      <div className="flex items-center gap-6">
        <section className="flex flex-col gap-6 min-w-36">
          <div className={cn('rounded-full p-2 w-fit', iconBgColor)}>
            <Icon icon={iconName} className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="span" weight="normal" className="text-gray-500">
              {title}
            </Text>
            <Text variant="h4" weight="normal" className="text-gray-800">
              {amount}
            </Text>
          </div>
        </section>

        <div className="pl-6 border-l border-gray-300">{children}</div>
      </div>
      <div className="absolute bottom-0 -right-5 flex items-center justify-center">
        <img src={image} alt={title} className="h-[147px]" />
      </div>
    </section>
  )
}
