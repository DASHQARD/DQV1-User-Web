import LoaderGif from '@/assets/gifs/loader.gif'
import { cn } from '@/libs/clsx'
export const Loader = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex justify-center items-center', className)}>
      <img src={LoaderGif} alt="Loading..." className="w-20 h-auto" />
    </div>
  )
}
