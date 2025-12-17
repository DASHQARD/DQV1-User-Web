import { useParams } from 'react-router'

import AjoSavingsIllustration from '@/assets/images/ajo-savings.png'
import GroupSavingsIllustration from '@/assets/images/group-savings.png'
import IndividualSavingsIllustration from '@/assets/images/individual-savings.png'
import WalletIllustration from '@/assets/images/wallet-illustration.png'
import { VendorCards as VendorCardItem } from '../cards'

type Props = {
  wallet_balance: string
  ajo_savings?: string
  group_savings?: string
  individual_savings?: string
}
export default function VendorCards({
  wallet_balance,
  group_savings,
  individual_savings,
  ajo_savings,
}: Readonly<Props>) {
  const { id } = useParams()
  return (
    <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <VendorCardItem
        title="DashX"
        value={wallet_balance ?? '₦0'}
        IconName="hugeicons:wallet-01"
        IconBg="bg-[#041B2B]/[60%] group-hover:bg-[#041B2B]"
        image={WalletIllustration}
        href="#"
      />
      <VendorCardItem
        title="DashPass"
        value={individual_savings ?? '₦0'}
        IconName="hugeicons:money-bag-01"
        IconBg="bg-[#8AC1BA]/[60%] group-hover:bg-[#8AC1BA]"
        image={IndividualSavingsIllustration}
        href={`#${id || ''}`}
      />
      <VendorCardItem
        title="DashGo"
        value={ajo_savings ?? '₦0'}
        IconName="hugeicons:money-bag-01"
        IconBg="bg-[#8AC1BA]/[60%] group-hover:bg-[#8AC1BA]"
        image={AjoSavingsIllustration}
        href="#"
      />
      <VendorCardItem
        title="DashPro"
        value={group_savings ?? '₦0'}
        IconName="hugeicons:money-bag-01"
        IconBg="bg-[#1379F0]/[60%] group-hover:bg-[#1379F0]"
        image={GroupSavingsIllustration}
        href="#"
        imageSize="h-[110px] w-[104px]"
      />
    </section>
  )
}
