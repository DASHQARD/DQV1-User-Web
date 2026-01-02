import { Loader, EmptyState } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import React from 'react'
import { CardItems, PublicDashGoForm } from '../../components'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { useForm } from 'react-hook-form'
import { usePublicCatalogQueries } from '../../hooks/website'
import { EmptyStateImage } from '@/assets/images'
import LoaderGif from '@/assets/gifs/loader.gif'

export default function VendorsProfile() {
  const [searchParams] = useSearchParams()
  const vendor_id = searchParams.get('vendor_id') || ''
  const { usePublicVendorsService, useVendorQrCodeService } = usePublicCatalogQueries()
  const { data: vendorDetailsResponse, isLoading: isLoadingVendor } = usePublicVendorsService()
  const { data: qrCodeData, isLoading: isLoadingQrCode } = useVendorQrCodeService(vendor_id || null)

  const vendorDetails = React.useMemo(() => {
    if (!vendorDetailsResponse || !vendor_id) return null

    // Handle both array response and wrapped response
    const vendors = Array.isArray(vendorDetailsResponse)
      ? vendorDetailsResponse
      : (vendorDetailsResponse as any)?.data || []

    // Filter to find the vendor with matching vendor_id
    const vendor = vendors.find((v: any) => String(v.vendor_id || v.id) === vendor_id)

    return vendor || null
  }, [vendorDetailsResponse, vendor_id])

  console.log('vendorDetails', vendorDetails)

  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '100',
    },
  })

  const isLoading = isLoadingVendor || isLoadingQrCode

  const quickAmounts = [100, 200, 300, 400, 500]
  const selectedAmount = form.watch('amount')

  // Get available branches for redemption
  const availableBranches = React.useMemo(() => {
    const branches = (vendorDetails as any)?.branches_with_cards || []
    return branches.map((branch: any) => ({
      branch_id: Number(branch.branch_id || branch.id),
      branch_name: branch.branch_name || 'Unnamed Branch',
      branch_location: branch.branch_location || '',
    }))
  }, [vendorDetails])

  // Extract vendor cards from branches_with_cards
  const vendorCards = React.useMemo(() => {
    if (!vendorDetails) return []
    const branches = (vendorDetails as any)?.branches_with_cards || []
    const allCards: any[] = []

    branches.forEach((branch: any) => {
      if (branch.cards && Array.isArray(branch.cards)) {
        branch.cards.forEach((card: any) => {
          // Filter out DashGo cards
          if (card.card_type?.toLowerCase() !== 'dashgo' && card.type?.toLowerCase() !== 'dashgo') {
            allCards.push({
              card_id: card.card_id || card.id,
              product: card.card_name || card.product, // Use card_name as product name
              vendor_name: branch.branch_name || '', // Use branch name as vendor_name so it displays first
              branch_name: branch.branch_name || '', // Branch name from branch level
              branch_location: branch.branch_location || '', // Branch location from branch level
              rating: card.rating || 0,
              price: String(card.card_price || card.price || 0),
              currency: card.currency || 'GHS',
              type: card.card_type || card.type,
              description: card.card_description || card.description || '',
              expiry_date: card.expiry_date || '',
              terms_and_conditions: card.terms_and_conditions || [],
              images: card.images || [],
              issue_date: card.issue_date || '',
              status: card.card_status || card.status || 'active',
              base_price: String(card.card_price || card.price || 0),
              markup_price: null,
              service_fee: '0',
              recipient_count: '0',
              created_at: card.created_at || '',
              updated_at: card.updated_at || card.created_at || '',
              vendor_id: vendorDetails?.vendor_id || vendorDetails?.id,
            })
          }
        })
      }
    })

    return allCards
  }, [vendorDetails])

  const branchName = vendorDetails?.business_name || vendorDetails?.vendor_name || ''
  const vendorName = branchName || 'Vendor'

  const vendorDescription =
    'Explore our wide range of gift cards and services. We offer quality products and exceptional customer service to meet all your needs.'

  const vendorQrCode = qrCodeData?.qr_code || ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <img src={LoaderGif} alt="Loading..." className="w-20 h-auto" />
      </div>
    )
  }

  if (!vendorDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-[#212529]">Vendor not found</h2>
          <p className="text-grey-500 mb-4">The vendor you're looking for doesn't exist.</p>
          <Link
            to={ROUTES.IN_APP.VENDORS}
            className="text-primary-500 font-semibold hover:underline"
          >
            Browse all vendors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-linear-to-br from-[#402d87] to-[#2d1a72] text-white pt-20 pb-12">
        <div className="wrapper">
          <div className="text-center">
            <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold mb-4 leading-tight">
              {branchName} (Vendor)
            </h1>
            {/* Breadcrumbs */}
            <div className="flex items-center justify-center gap-2 text-sm text-white/80">
              <Link to={ROUTES.IN_APP.HOME} className="hover:text-white transition-colors">
                Home
              </Link>
              <Icon icon="bi:chevron-right" className="size-3" />
              <Link to={ROUTES.IN_APP.VENDORS} className="hover:text-white transition-colors">
                Vendor
              </Link>
              <Icon icon="bi:chevron-right" className="size-3" />
              <span className="text-white font-semibold">{branchName}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Featured Gift Card Visual */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[520px] h-[320px] rounded-2xl shadow-xl overflow-hidden">
                <img
                  src={DashGoBg}
                  alt={`${vendorName} background`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div className="flex items-start justify-between">
                    <div className="text-2xl font-black tracking-[0.3em]">DASHGO</div>
                    <div className="text-right text-2xl font-semibold">
                      {form.watch('amount')
                        ? `GHS ${parseFloat(form.watch('amount')).toFixed(2)}`
                        : 'GHS'}
                    </div>
                  </div>
                  {/* Bottom Section */}
                  <div className="flex items-end justify-between">
                    <div className="text-lg font-semibold uppercase">{vendorName}</div>
                  </div>
                </div>
              </div>
            </div>

            <PublicDashGoForm
              vendor_id={vendor_id}
              vendorName={vendorName}
              vendorDetails={vendorDetails}
              availableBranches={availableBranches}
              quickAmounts={quickAmounts}
              selectedAmount={selectedAmount}
            />
          </div>
        </div>
      </section>

      {/* About Vendor Section */}
      <section className="py-12 bg-linear-to-br from-[#f8f9fa] to-[#e9ecef]">
        <div className="wrapper">
          <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-6 text-[#212529]">
            About Vendor
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Left - Vendor Icon */}
              <div className="flex justify-center md:justify-start">
                <div className="w-24 h-24 bg-linear-to-br from-[#ffc400] to-[#f0b90b] rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon icon="bi:gift" className="size-12 text-primary-500" />
                </div>
              </div>

              {/* Middle - Vendor Information */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-[#212529]">{vendorName}</h3>
                <div className="flex items-center gap-2">
                  <Icon icon="bi:star-fill" className="size-5 text-yellow-500" />
                  <span className="font-semibold text-[#212529]">4.5</span>
                </div>
                <p className="text-sm text-grey-500">
                  Vendor ID:{' '}
                  {(vendorDetails as any)?.gvid || (vendorDetails as any)?.vendor_id || 'N/A'}
                </p>
                <p className="text-grey-600 leading-relaxed">{vendorDescription}</p>
              </div>

              {/* Right - Vendor QR Code */}
              <div className="flex justify-center md:justify-end">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  {isLoadingQrCode ? (
                    <div className="w-32 h-32 flex items-center justify-center">
                      <Loader />
                    </div>
                  ) : vendorQrCode ? (
                    <img src={vendorQrCode} alt="Vendor QR Code" className="w-32 h-32" />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-grey-500 text-sm">
                      QR Code unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qards from vendor Section */}
      <section className="py-12 bg-white">
        <div className="wrapper">
          <h2 className="text-[clamp(28px,4vw,36px)] font-extrabold mb-2 text-[#212529]">
            Cards from vendor ({vendorCards.length} Cards)
          </h2>
          {vendorCards.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <EmptyState
                image={EmptyStateImage}
                title="No cards available"
                description="No cards available for this vendor"
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-3 max-md:grid-cols-2 max-[480px]:grid-cols-1 max-md:gap-4">
              {vendorCards?.map((card: any) => (
                <CardItems
                  key={card.card_id}
                  {...card}
                  id={card.card_id}
                  type={(card.type as 'dashpro' | 'dashpass' | 'dashgo' | 'DashX') || 'DashX'}
                  branch_name={card.branch_name}
                  branch_location={card.branch_location}
                />
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <Link
              to={ROUTES.IN_APP.TERMS_OF_SERVICE}
              className="text-grey-500 font-semibold hover:text-primary-500 transition-colors"
            >
              View terms and conditions
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
