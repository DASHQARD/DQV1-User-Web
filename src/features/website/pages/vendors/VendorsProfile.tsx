import { Loader, Button, Text, Input, EmptyState } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import React from 'react'
import { CardItems } from '../../components'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { useForm } from 'react-hook-form'

import { usePublicCatalogQueries } from '../../hooks/website'
import { EmptyStateImage } from '@/assets/images'
import { useCartStore } from '@/stores/cart'
import { createDashGoAndAssign } from '../../services/cards'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'

export default function VendorsProfile() {
  const [searchParams] = useSearchParams()
  const vendor_id = searchParams.get('vendor_id') || ''
  const { usePublicVendorsService, useVendorQrCodeService, usePublicCardsService } =
    usePublicCatalogQueries()
  const { data: vendorDetailsResponse, isLoading: isLoadingVendor } = usePublicVendorsService({
    limit: 1,
    vendor_ids: vendor_id || '',
  })
  const { data: qrCodeData, isLoading: isLoadingQrCode } = useVendorQrCodeService(vendor_id || null)
  const { data: vendorCardsResponse, isLoading: isLoadingVendorCards } = usePublicCardsService({
    vendor_ids: vendor_id || '',
  })

  // Extract vendor from response - VendorDetailsResponse is an array
  const vendorDetails = React.useMemo(() => {
    if (!vendorDetailsResponse?.[0]) return null
    return vendorDetailsResponse[0] || null
  }, [vendorDetailsResponse])

  const vendorCards = React.useMemo(() => {
    if (!vendorCardsResponse) return []
    // Handle both array response and object with data property
    const cards = vendorCardsResponse
    // Filter out DashGo cards - DashGo is static, not fetched from backend
    return cards.filter((card: any) => {
      const isDashGo = card.type?.toLowerCase() === 'dashgo'
      const matchesVendor = !vendor_id || card.vendor_id === parseInt(vendor_id, 10)
      return !isDashGo && matchesVendor
    })
  }, [vendorCardsResponse, vendor_id])

  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: '100',
    },
  })

  const { openCart } = useCartStore()
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()

  const createDashGoMutation = useMutation({
    mutationFn: createDashGoAndAssign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      success('DashGo card added to cart successfully')
      openCart()
    },
    onError: (error: any) => {
      toastError(error?.message || 'Failed to add DashGo card to cart. Please try again.')
    },
  })

  const isLoading = isLoadingVendor || isLoadingVendorCards || isLoadingQrCode

  const quickAmounts = [100, 200, 300, 400, 500]
  const selectedAmount = form.watch('amount')

  const onSubmit = async (data: { amount: string }) => {
    const cardAmount = parseFloat(data.amount)
    if (isNaN(cardAmount) || cardAmount <= 0) {
      return
    }

    if (!vendor_id) {
      return
    }

    // Get branches from vendor details for redemption_branches
    const vendorBranches = (vendorDetails as any)?.branches_with_cards || []
    const redemptionBranches =
      vendorBranches.length > 0
        ? vendorBranches.map((branch: any) => ({
            branch_id: Number(branch.branch_id || branch.id),
          }))
        : []

    // Create DashGo card and add to cart using the endpoint
    createDashGoMutation.mutate({
      recipient_ids: [], // Empty array for now - recipients can be assigned later
      vendor_id: parseInt(vendor_id, 10),
      product: 'DashGo Gift Card',
      description: `Custom DashGo card for ${vendorName}`,
      price: cardAmount,
      currency: 'GHS',
      issue_date: new Date().toISOString().split('T')[0],
      redemption_branches: redemptionBranches,
    })
  }

  // Get vendor details - use business_name or vendor_name as fallback
  const branchName = vendorDetails?.business_name || vendorDetails?.vendor_name || ''
  const vendorName = branchName || 'Vendor'
  const vendorDescription =
    'Explore our wide range of gift cards and services. We offer quality products and exceptional customer service to meet all your needs.'

  // Get QR code from backend - it's a base64 data URL
  const vendorQrCode = qrCodeData?.qr_code || ''

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
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

            {/* Right Column - Card Details and Actions */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-1">
                <Text variant="h1" className="capitalize">
                  DashGo Gift Qard
                </Text>
                <Text variant="p" className="text-grey-500">
                  Vendor: {vendorName}
                </Text>
                <div className="flex items-center gap-1">
                  <Icon icon="bi:geo-alt-fill" className="size-4 text-grey-500" />
                  <Text variant="p" className="text-grey-500">
                    {(vendorDetails as any)?.country ||
                      (vendorDetails as any)?.branch_location ||
                      'Location not available'}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Text variant="h2" className="capitalize">
                  Description
                </Text>
                <Text variant="p" className="text-grey-600 leading-relaxed">
                  Create a custom DashGo gift card with your desired amount for {vendorName}. Use
                  this card at {vendorName} locations.
                </Text>
              </div>

              {/* Amount Input */}
              <div>
                <Text variant="h3" weight="bold" className="text-gray-900 mb-4">
                  Select Amount
                </Text>

                {/* Quick Selection Buttons */}
                <div className="flex gap-3 mb-4 flex-wrap">
                  {quickAmounts.map((amount) => {
                    const isSelected = parseFloat(selectedAmount || '0') === amount
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => form.setValue('amount', amount.toString())}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        GHS {amount.toLocaleString()}
                      </button>
                    )
                  })}
                </div>

                {/* Amount Input Field */}

                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  prefix={
                    <span className="pointer-events-none font-bold text-primary-500 text-lg">
                      GHS
                    </span>
                  }
                  {...form.register('amount', {
                    required: 'Amount is required',
                    validate: (value) => {
                      const numValue = parseFloat(value)
                      if (isNaN(numValue) || numValue <= 0) {
                        return 'Please enter a valid amount greater than 0'
                      }
                      if (numValue > 10000) {
                        return `Maximum amount is GHS 10000`
                      }
                      return true
                    },
                  })}
                  placeholder="0.00"
                  innerClassName="h-[56px]!"
                  error={form.formState.errors.amount?.message}
                />

                <p className="mt-2 text-sm text-gray-500">Maximum amount: GHS 10000</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  type="submit"
                  disabled={
                    !form.watch('amount') ||
                    parseFloat(form.watch('amount') || '0') <= 0 ||
                    createDashGoMutation.isPending ||
                    !vendor_id
                  }
                  loading={createDashGoMutation.isPending}
                  className="flex-1"
                >
                  <Icon icon="bi:cart-plus" className="size-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </form>
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
