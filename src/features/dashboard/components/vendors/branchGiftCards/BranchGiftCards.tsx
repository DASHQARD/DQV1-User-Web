import AjoSavingsIllustration from '@/assets/images/ajo-savings.png'
import GroupSavingsIllustration from '@/assets/images/group-savings.png'
import IndividualSavingsIllustration from '@/assets/images/individual-savings.png'
import WalletIllustration from '@/assets/images/wallet-illustration.png'
import { VendorCards } from '@/features/dashboard/components'

type Props = {
  dashx_redemptions: string
  dashpro_redemptions: string
  dashgo_redemptions: string
  dashpass_redemptions: string
}
export default function BranchGiftCards({
  dashx_redemptions,
  dashpro_redemptions,
  dashgo_redemptions,
  dashpass_redemptions,
}: Readonly<Props>) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <VendorCards
        title="DashX Redemptions"
        value={dashx_redemptions ?? '₦0'}
        IconName="hugeicons:wallet-01"
        IconBg="bg-[#041B2B]/[60%] group-hover:bg-[#041B2B]"
        image={WalletIllustration}
        href="#"
      />
      <VendorCards
        title="DashPro Redemptions"
        value={dashpro_redemptions ?? '₦0'}
        IconName="hugeicons:money-bag-01"
        IconBg="bg-[#8AC1BA]/[60%] group-hover:bg-[#8AC1BA]"
        image={IndividualSavingsIllustration}
        href="#"
      />
      <VendorCards
        title="DashGo Redemptions"
        value={dashgo_redemptions ?? '₦0'}
        IconName="hugeicons:money-bag-01"
        IconBg="bg-[#8AC1BA]/[60%] group-hover:bg-[#8AC1BA]"
        image={AjoSavingsIllustration}
        href="#"
      />
      <VendorCards
        title="DashPass Redemptions"
        value={dashpass_redemptions ?? '₦0'}
        IconName="hugeicons:money-bag-01"
        IconBg="bg-[#1379F0]/[60%] group-hover:bg-[#1379F0]"
        image={GroupSavingsIllustration}
        href="#"
        imageSize="h-[110px] w-[104px]"
      />
    </section>
  )
}
