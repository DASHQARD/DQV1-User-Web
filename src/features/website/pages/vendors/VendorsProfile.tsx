import { useState, useMemo, useEffect } from 'react'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import {
  getVendorCardsFromBranches,
  vendorCatalogCardToFeaturedCardProps,
} from '@/features/dashboard/corporate/utils/vendorCardsFromBranches'
import { VendorGiftCardsCarousel } from './components/VendorGiftCardsCarousel'
import { PublicDashGoForm } from '../../components'
import { VendorLogoImage } from '../../components/VendorLogo/VendorLogoImage'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { useVendorProfilePage } from '../../hooks/website'
import { Loader } from '@/components'
import { QRCodeSVG } from 'qrcode.react'
import { formatCurrency } from '@/utils/format'
import { resolveGiftCardAmount } from '@/utils/giftCardAmount'
import { formatCardDisplayTitle } from '@/utils/cardDisplay'
import { VENDOR_PROFILE_WRAPPER } from './vendorProfileUtils'
import { buildVendorProfilePathFromGvid } from '../../utils/vendorProfilePath'

const QUICK_AMOUNTS = [100, 200, 300, 400, 500] as const

export default function VendorsProfile() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gvid = searchParams.get('gvid')?.trim() || ''
  const legacyVendorId = searchParams.get('vendor_id')?.trim() || ''
  const { vendor, displayName, isLoading } = useVendorProfilePage(gvid, legacyVendorId)
  const effectiveVendorId = String(vendor?.vendor_id ?? legacyVendorId)
  const [selectedAmount, setSelectedAmount] = useState('100')

  useEffect(() => {
    if (!vendor?.gvid || isLoading) return
    const canonicalGvid = String(vendor.gvid).trim()
    if (gvid === canonicalGvid && !legacyVendorId) return
    navigate(buildVendorProfilePathFromGvid(canonicalGvid), { replace: true })
  }, [vendor?.gvid, gvid, legacyVendorId, isLoading, navigate])

  const availableBranches = useMemo(() => {
    const branches = vendor?.branches_with_cards ?? []
    return branches.map((branch) => ({
      branch_id: String(branch.branch_id ?? ''),
      branch_name: formatCardDisplayTitle(branch.branch_name || 'Unnamed Branch'),
      branch_location: branch.branch_location || '',
    }))
  }, [vendor])

  const catalogCards = useMemo(
    () =>
      getVendorCardsFromBranches(vendor, {
        excludeCardTypes: ['dashgo'],
        activeOnly: false,
      }),
    [vendor],
  )

  const featuredCards = useMemo(
    () =>
      catalogCards.map((card) => ({
        ...vendorCatalogCardToFeaturedCardProps(card),
        gvid: vendor?.gvid,
      })),
    [catalogCards, vendor?.gvid],
  )

  const locationLabel =
    vendor?.business_country?.trim() || availableBranches[0]?.branch_location?.trim() || null

  const displayAmount = formatCurrency(resolveGiftCardAmount(selectedAmount))

  const hasLookupKey = Boolean(gvid || legacyVendorId)

  if (!hasLookupKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-sm text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-900">Vendor not found</h2>
          <p className="mb-6 text-sm text-gray-500">
            Open a vendor with a GVID in the URL, for example{' '}
            <span className="font-mono text-xs">/vendor?gvid=4158-01</span>.
          </p>
          <Link
            to={ROUTES.IN_APP.VENDORS}
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Browse all vendors
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-sm text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-900">Vendor not found</h2>
          <p className="mb-6 text-sm text-gray-500">
            This vendor may have been removed or the link is incorrect.
          </p>
          <Link
            to={ROUTES.IN_APP.VENDORS}
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Browse all vendors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-12">
      <header className="border-b border-gray-100 bg-white">
        <div className={`${VENDOR_PROFILE_WRAPPER} flex items-center gap-3 py-4`}>
          <Link
            to={ROUTES.IN_APP.VENDORS}
            className="-ml-1 inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Icon icon="bi:chevron-left" className="size-5" />
            <span className="hidden sm:inline">Vendors</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
              <VendorLogoImage
                vendor={vendor}
                name={displayName}
                className="h-full w-full object-cover"
                iconClassName="size-5 text-primary-600"
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-gray-900 md:text-lg">
                {displayName}
              </h1>
              {locationLabel ? (
                <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                  <Icon icon="bi:geo-alt" className="size-3 shrink-0" />
                  {locationLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className={`${VENDOR_PROFILE_WRAPPER} space-y-10 py-6 md:space-y-12 md:py-10`}>
        <section className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              Custom amount
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 md:text-xl">DashGo</h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose any amount for {displayName}. Works at all listed branches.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
            <div className="relative aspect-16/10 overflow-hidden rounded-xl shadow-md sm:aspect-5/3 lg:aspect-auto lg:min-h-[280px]">
              <img src={DashGoBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-black tracking-[0.2em]">DASHGO</span>
                  <span className="rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                    <span className="block text-xl font-extrabold leading-none tabular-nums">
                      {displayAmount}
                    </span>
                  </span>
                </div>
                <span className="truncate text-sm font-semibold uppercase tracking-wide">
                  {displayName}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center lg:pl-2">
              <PublicDashGoForm
                vendor_id={effectiveVendorId}
                vendorName={displayName}
                vendorDetails={vendor}
                availableBranches={availableBranches}
                quickAmounts={[...QUICK_AMOUNTS]}
                selectedAmount={selectedAmount}
                onAmountChange={setSelectedAmount}
              />
            </div>
          </div>
        </section>

        <VendorGiftCardsCarousel
          title="Best Sellers"
          cards={featuredCards}
          emptyDescription="This vendor has not published preset cards yet. Use custom DashGo above or check back soon."
        />

        {(availableBranches.length > 0 || vendor.qr_url) && (
          <section className="border-t border-gray-100 pt-8">
            <h2 className="mb-4 text-lg font-bold text-gray-900">About this vendor</h2>
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              {availableBranches.length > 0 && (
                <ul className="flex-1 space-y-2 text-sm text-gray-600">
                  {availableBranches.map((branch) => (
                    <li key={branch.branch_id} className="flex items-start gap-2">
                      <Icon icon="bi:shop" className="mt-0.5 size-3.5 shrink-0 text-primary-600" />
                      <span>
                        {branch.branch_name}
                        {branch.branch_location ? ` · ${branch.branch_location}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {vendor.qr_url && (
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <QRCodeSVG value={vendor.qr_url} size={100} />
                  </div>
                  <p className="text-xs text-gray-500">Vendor QR</p>
                </div>
              )}
            </div>
          </section>
        )}

        <p className="text-center text-sm md:text-left">
          <Link
            to={ROUTES.IN_APP.TERMS_OF_SERVICE}
            className="font-medium text-gray-500 hover:text-primary-600"
          >
            Terms & conditions
          </Link>
        </p>
      </div>
    </div>
  )
}
