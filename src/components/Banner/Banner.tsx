import { ProgressCircle } from '../ProgressCircle'
import bannerImage from '../../assets/images/banner-image.png'

export default function Banner({ currentProgress }: { readonly currentProgress: number }) {
  return (
    <div className="rounded-xl border-solid border-[0.5px] border-[#f8d3b3] bg-[#fdf4ec] relative flex gap-6 py-4 px-8 items-center overflow-hidden">
      <ProgressCircle currentProgress={currentProgress} />
      <div className="flex flex-col  leading-[160%]">
        <h3 className="text-base font-medium">
          {currentProgress === 100 ? 'Completed' : 'In Progress'}
        </h3>
        <p className="text-[#6a7282]">
          {currentProgress === 100
            ? 'You have completed all onboarding steps'
            : 'You are on step 1 of 3'}
        </p>
      </div>
      <img
        className="absolute right-[-20px] bottom-0  max-w-none opacity-90 pointer-events-none select-none"
        src={bannerImage}
        alt="banner background"
      />
    </div>
  )
}
