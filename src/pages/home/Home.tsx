import { Hero } from '@/components'
import { Contact, FeaturedCards, PartnerVendors } from './components'

export default function Home() {
  return (
    <div className="">
      <Hero />
      <FeaturedCards />
      <PartnerVendors />
      <Contact />
    </div>
  )
}
