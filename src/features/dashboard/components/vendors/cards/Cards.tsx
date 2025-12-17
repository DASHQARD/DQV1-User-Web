import { Link } from 'react-router'

import { Text } from '@/components'
import { cn, Icon } from '@/libs'

type Props = {
  title: string
  value: string
  IconName: string
  IconBg: string
  image: string
  href: string
  className?: string
  imageSize?: string
}

export default function VendorCards({
  title,
  value,
  IconName,
  IconBg,
  image,
  href,
  imageSize,
  className,
}: Readonly<Props>) {
  return (
    <Link
      to={href}
      className={cn(
        'flex relative rounded-xl pt-[18px] pb-6 pl-6 pr-4 border border-gray-100 items-center justify-between group bg-primary-25 hover:bg-primary-100 w-full',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 flex flex-col gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', IconBg)}>
            <Icon icon={IconName} className="w-5 h-5 text-white" />
          </div>

          <div>
            <Text variant="span" weight="normal" className="text-gray-500">
              {title}
            </Text>
            <Text variant="h3" weight="normal" className="text-gray-800">
              {value}
            </Text>
          </div>
        </div>

        <div
          className={cn(
            'absolute right-10 bottom-0 opacity-50 group-hover:opacity-100 transition-opacity duration-300',
            imageSize,
          )}
        >
          <img src={image} alt="wallet illustration" className="w-full h-full" />
        </div>
      </div>

      <div>
        <Icon
          icon="hugeicons:arrow-right-01"
          className="size-6 text-gray-300 group-hover:text-gray-500"
        />
      </div>
    </Link>
  )
}
