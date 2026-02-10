import { Hero } from '@/components'
import { FloatingFeedbackButton } from '@/components/floatingFeedbackButton'
import { Contact, FeaturedCards, PartnerVendors } from '../../components'

export default function LandingPage() {
  return (
    <div className="bg-[#f3f4f6]">
      <Hero />
      <FeaturedCards />
      <PartnerVendors />
      <Contact />
      <FloatingFeedbackButton />
    </div>
  )
}
