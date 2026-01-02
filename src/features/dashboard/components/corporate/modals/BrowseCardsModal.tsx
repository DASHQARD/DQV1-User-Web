import { useState, useMemo } from 'react'
import { Button, Input, Modal, Text, Tabs, Loader } from '@/components'
import { DebouncedSearch } from '@/components/SearchBox'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { CardItems } from '@/features/website/components/CardItems/CardItems'
import { VendorItems } from '@/features/website/components/VendorItems/VendorItems'
import DashProPurchase from '@/features/website/components/DashProPurchase/DashProPurchase'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { Icon } from '@/libs'
import { useForm, useWatch } from 'react-hook-form'
import { corporateQueries } from '@/features/dashboard/corporate/hooks'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'

export function BrowseCardsModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.BROWSE_CARDS.ROOT,
  })
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [vendorSearch, setVendorSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'vendors' | 'dashpro'>('vendors')

  // Fetch vendors and cards from API
  const { useGetAllVendorsDetailsService } = vendorQueries()
  const { useGetCardsService } = corporateQueries()

  const { data: vendorsResponse, isLoading: isLoadingVendors } = useGetAllVendorsDetailsService()

  const { data: cardsResponse, isLoading: isLoadingCards } = useGetCardsService()

  // Extract vendors from API response
  const vendors = useMemo(() => {
    const vendorsData = vendorsResponse || []
    return vendorsData?.map((vendor: any) => ({
      id: vendor.vendor_id,
      vendor_id: String(vendor.vendor_id),
      branch_name: vendor.vendor_name || vendor.business_name || 'Unknown Vendor',
      shops: parseInt(vendor.branch_count || '0', 10),
      rating: 0, // Rating not available in API response
    }))
  }, [vendorsResponse])

  // Extract cards from API response
  const allCards = useMemo(() => {
    const cardsData = cardsResponse?.data || []
    return cardsData.map((card: any) => ({
      id: card.id,
      product: card.product,
      vendor_name: card.vendor_name || 'Unknown Vendor',
      rating: card.rating || 0,
      price: card.price,
      currency: card.currency,
      type: card.type,
      description: card.description,
      expiry_date: card.expiry_date,
      terms_and_conditions: card.terms_and_conditions || [],
      created_at: card.created_at,
      created_by: card.created_by,
      fraud_flag: card.fraud_flag || false,
      fraud_notes: card.fraud_notes,
      images: card.images || [],
      is_activated: card.is_activated || false,
      issue_date: card.issue_date,
      last_modified_by: card.last_modified_by,
      status: card.status,
      updated_at: card.updated_at,
      vendor_id: card.vendor_id,
    }))
  }, [cardsResponse])

  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors
    const searchLower = vendorSearch.toLowerCase()
    return vendors.filter((vendor: any) => vendor.branch_name.toLowerCase().includes(searchLower))
  }, [vendorSearch, vendors])

  // Get cards for selected vendor (excluding DashPro and DashGo)
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []
    // Filter cards by vendor_id and exclude DashPro and DashGo
    return allCards.filter(
      (card: any) =>
        card.vendor_id === selectedVendor &&
        card.type.toLowerCase() !== 'dashpro' &&
        card.type.toLowerCase() !== 'dashgo',
    )
  }, [selectedVendor, allCards])

  // Every vendor has DashGo available
  const hasDashGo = useMemo(() => {
    return !!selectedVendor
  }, [selectedVendor])

  const selectedVendorName = useMemo(() => {
    return vendors.find((v: any) => v.id === selectedVendor)?.branch_name || ''
  }, [selectedVendor, vendors])

  // Form for DashGo amount
  const dashGoForm = useForm<{ amount: string }>({
    defaultValues: {
      amount: '',
    },
  })

  const dashGoAmount = useWatch({ control: dashGoForm.control, name: 'amount' })

  const handleDashGoSelect = () => {
    // TODO: Handle DashGo selection
    console.log('DashGo selected for vendor:', selectedVendor, 'amount:', dashGoAmount)
    modal.closeModal()
  }

  const handleVendorSelect = (vendorId: number) => {
    setSelectedVendor(vendorId)
    setSelectedCard(null)
  }

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId)
  }

  const handleBackToVendors = () => {
    setSelectedVendor(null)
    setSelectedCard(null)
    setVendorSearch('')
  }

  const handleConfirm = () => {
    if (!selectedCard) return
    // TODO: Handle card selection
    console.log('Selected card:', selectedCard, 'for vendor:', selectedVendor)
    modal.closeModal()
    setSelectedCard(null)
    setSelectedVendor(null)
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BROWSE_CARDS.ROOT)}
      setIsOpen={modal.closeModal}
      title={selectedVendor ? 'Select Card' : 'Browse Vendors'}
      position="center"
      panelClass="!w-[90vw] !max-w-6xl p-6"
    >
      <div className="space-y-6">
        {!selectedVendor ? (
          <>
            <Tabs
              tabs={[
                { value: 'vendors', label: 'Vendors' },
                { value: 'dashpro', label: 'DashPro' },
              ]}
              active={activeTab}
              setActive={(value: string) => setActiveTab(value as 'vendors' | 'dashpro')}
              className="gap-6"
              btnClass="pb-2"
            />

            {activeTab === 'vendors' ? (
              <>
                <DebouncedSearch
                  value={vendorSearch}
                  onChange={setVendorSearch}
                  placeholder="Search vendors..."
                  className="w-full"
                />

                {isLoadingVendors ? (
                  <div className="col-span-full text-center py-12">
                    <Text variant="p" className="text-gray-500">
                      Loading vendors...
                    </Text>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                    {filteredVendors.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Text variant="p" className="text-gray-500">
                          No vendors found
                        </Text>
                      </div>
                    ) : (
                      filteredVendors.map((vendor: any) => (
                        <div
                          key={vendor.id}
                          onClick={() => handleVendorSelect(vendor.id)}
                          className="cursor-pointer transition-all hover:scale-105"
                        >
                          <VendorItems
                            name={vendor.branch_name}
                            branches={vendor.shops || vendor.branches_with_cards?.length || 0}
                            rating={vendor.rating}
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-8">
                <DashProPurchase />
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={modal.closeModal}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="small" onClick={handleBackToVendors}>
                  <Icon icon="hugeicons:arrow-left-01" className="mr-2" />
                  Back to Vendors
                </Button>
                <Text variant="span" weight="semibold" className="text-gray-900">
                  {vendors.find((v: any) => v.id === selectedVendor)?.branch_name}
                </Text>
              </div>
            </div>

            <Text variant="p" className="text-sm text-gray-600">
              Select a card to assign to the selected employees
            </Text>

            {/* DashGo Featured Section - Always shown for selected vendor */}
            {selectedVendor && (
              <div className="bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  {/* Left Column - DashGo Card Visual */}
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-[400px] h-[240px] rounded-2xl shadow-xl overflow-hidden">
                      <img
                        src={DashGoBg}
                        alt="DashGo background"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                        <div className="flex items-start justify-between">
                          <div className="text-xl font-black tracking-[0.3em]">DASHGO</div>
                          <div className="text-right text-xl font-semibold">
                            GHS {dashGoAmount || '0.00'}
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="text-base font-semibold uppercase">
                            {selectedVendorName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - DashGo Details and Actions */}
                  <div className="space-y-4">
                    <div>
                      <Text variant="h3" weight="semibold" className="text-gray-900">
                        DashGo Gift Card
                      </Text>
                      <Text variant="p" className="text-sm text-gray-600">
                        Vendor: {selectedVendorName}
                      </Text>
                    </div>

                    <div>
                      <Text variant="h4" weight="medium" className="text-gray-900 mb-2">
                        Description
                      </Text>
                      <Text variant="p" className="text-sm text-gray-600">
                        DashGo is a vendor-locked monetary gift card redeemable only at{' '}
                        {selectedVendorName}. Enter your desired amount to create a custom gift card
                        that can be used at this vendor's locations. Partial redemption is allowed.
                      </Text>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enter Amount
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                          GHS
                        </span>
                        <Input
                          type="number"
                          {...dashGoForm.register('amount')}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          error={dashGoForm.formState.errors.amount?.message}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="secondary"
                      onClick={handleDashGoSelect}
                      disabled={!dashGoAmount || parseFloat(dashGoAmount || '0') <= 0}
                      className="w-full"
                    >
                      Select DashGo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Vendor Cards (DashX, DashPass, etc.) */}
            {isLoadingCards ? (
              <div className="text-center py-12">
                <Loader />
              </div>
            ) : vendorCards.length > 0 ? (
              <div className="space-y-3">
                <Text variant="span" weight="semibold" className="text-gray-900">
                  Other Cards
                </Text>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto">
                  {vendorCards.map((card: any) => (
                    <div
                      key={card.id}
                      onClick={() => handleCardSelect(card.id)}
                      className={`cursor-pointer transition-all ${
                        selectedCard === card.id ? 'ring-2 ring-primary-500 rounded-2xl' : ''
                      }`}
                    >
                      <CardItems
                        card_id={card.id || card.card_id}
                        branch_name={card.branch_name || ''}
                        branch_location={card.branch_location || ''}
                        product={card.product}
                        vendor_name={card.vendor_name}
                        rating={card.rating}
                        price={card.price}
                        currency={card.currency}
                        type={card.type}
                        description={card.description || ''}
                        expiry_date={card.expiry_date || ''}
                        terms_and_conditions={card.terms_and_conditions || []}
                        created_at={card.created_at || ''}
                        base_price={card.price || ''}
                        markup_price={null}
                        service_fee="0"
                        status={card.status || 'active'}
                        recipient_count="0"
                        images={card.images || []}
                        updated_at={card.updated_at || card.created_at || ''}
                        vendor_id={card.vendor_id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : !hasDashGo ? (
              <div className="text-center py-12">
                <Text variant="p" className="text-gray-500">
                  No cards available for this vendor
                </Text>
              </div>
            ) : null}

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleBackToVendors}>
                Back
              </Button>
              <Button variant="secondary" onClick={handleConfirm} disabled={!selectedCard}>
                Select Card
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
