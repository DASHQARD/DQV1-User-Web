import { Hero } from '@/components'
import { Contact, FeaturedCards, PartnerVendors } from '../../components'

export default function LandingPage() {
  return (
    <div className="bg-[#f3f4f6]">
      <Hero />
      <div className="wrapper max-md:w-full max-md:max-w-none flex flex-col gap-6 md:gap-12 max-md:px-0 pt-6 md:pt-14 pb-6 md:pb-12">
        <FeaturedCards />
        <PartnerVendors />
      </div>
      <Contact />
    </div>
  )
}
