import { Text } from '@/components'

type Props = {
  title: string
  description: string
  image: any
}
export function EmptyState({ image, title, description }: Readonly<Props>) {
  return (
    <div className="w-full h-2/3 grid place-content-center py-12">
      <div className="max-w-[545px] space-y-12 flex flex-col justify-center items-center">
        <img src={image} alt="" />
        <div className="w-2/3 space-y-2 flex flex-col justify-center items-center">
          <Text variant="h3" className="font-semibold">
            {title}
          </Text>
          <Text variant="p" className="text-center text-sm text-gray-400">
            {description}
          </Text>
        </div>
      </div>
    </div>
  )
}
