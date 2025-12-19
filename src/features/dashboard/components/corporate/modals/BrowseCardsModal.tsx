import { useState, useMemo } from 'react'
import { Button, Input, Modal, Text, Tabs } from '@/components'
import { DebouncedSearch } from '@/components/SearchBox'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { CardItems } from '@/features/website/components/CardItems/CardItems'
import { VendorItems } from '@/features/website/components/VendorItems/VendorItems'
import DashProPurchase from '@/features/website/components/DashProPurchase/DashProPurchase'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { Icon } from '@/libs'
import { useForm, useWatch } from 'react-hook-form'

// Example vendors data - no API integration
const EXAMPLE_VENDORS = [
  {
    id: 1,
    vendor_id: '1',
    branch_name: 'DashQards',
    shops: 5,
    rating: 4.8,
  },
  {
    id: 2,
    vendor_id: '2',
    branch_name: 'Travel Partners',
    shops: 3,
    rating: 4.6,
  },
  {
    id: 3,
    vendor_id: '3',
    branch_name: 'Business Solutions',
    shops: 8,
    rating: 4.9,
  },
  {
    id: 4,
    vendor_id: '4',
    branch_name: 'Retail Partners',
    shops: 12,
    rating: 4.5,
  },
  {
    id: 5,
    vendor_id: '5',
    branch_name: 'Adventure Tours',
    shops: 2,
    rating: 4.7,
  },
]

// Example cards data - no API integration
const EXAMPLE_CARDS = [
  {
    id: 1,
    product: 'DashX Classic Gift Card',
    vendor_name: 'DashQards',
    rating: 4.5,
    price: '500.00',
    currency: 'GHS',
    type: 'DashX' as const,
    description: 'Perfect for everyday purchases and gifting',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 1,
  },
  {
    id: 2,
    product: 'DashGo Travel Card',
    vendor_name: 'Travel Partners',
    rating: 4.8,
    price: '750.00',
    currency: 'GHS',
    type: 'dashgo' as const,
    description: 'Your perfect travel companion for hotels and flights',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 2,
  },
  {
    id: 3,
    product: 'DashPro Business Premium',
    vendor_name: 'Business Solutions',
    rating: 4.9,
    price: '1000.00',
    currency: 'GHS',
    type: 'dashpro' as const,
    description: 'Premium business gift card for corporate gifting',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 3,
  },
  {
    id: 4,
    product: 'DashPass Membership Card',
    vendor_name: 'DashQards',
    rating: 4.7,
    price: '300.00',
    currency: 'GHS',
    type: 'dashpass' as const,
    description: 'Exclusive membership benefits and rewards',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 1,
  },
  {
    id: 5,
    product: 'DashX Everyday Card',
    vendor_name: 'Retail Partners',
    rating: 4.6,
    price: '250.00',
    currency: 'GHS',
    type: 'DashX' as const,
    description: 'For all your daily shopping needs',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 4,
  },
  {
    id: 6,
    product: 'DashGo Adventure Card',
    vendor_name: 'Adventure Tours',
    rating: 4.4,
    price: '600.00',
    currency: 'GHS',
    type: 'dashgo' as const,
    description: 'Explore the world with travel benefits',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 5,
  },
  {
    id: 7,
    product: 'DashGo Premium Travel',
    vendor_name: 'DashQards',
    rating: 4.9,
    price: '1200.00',
    currency: 'GHS',
    type: 'dashgo' as const,
    description: 'Premium travel card for luxury experiences',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 1,
  },
  {
    id: 8,
    product: 'DashGo Business Travel',
    vendor_name: 'Business Solutions',
    rating: 4.7,
    price: '900.00',
    currency: 'GHS',
    type: 'dashgo' as const,
    description: 'Corporate travel solutions for business trips',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    images: [],
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
    vendor_id: 3,
  },
]

export function BrowseCardsModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.BROWSE_CARDS.ROOT,
  })
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [vendorSearch, setVendorSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'vendors' | 'dashpro'>('vendors')

  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return EXAMPLE_VENDORS
    const searchLower = vendorSearch.toLowerCase()
    return EXAMPLE_VENDORS.filter((vendor) =>
      vendor.branch_name.toLowerCase().includes(searchLower),
    )
  }, [vendorSearch])

  // Get cards for selected vendor (excluding DashPro and DashGo)
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []
    // Filter cards by vendor_id and exclude DashPro and DashGo
    return EXAMPLE_CARDS.filter(
      (card) =>
        card.vendor_id === selectedVendor &&
        card.type.toLowerCase() !== 'dashpro' &&
        card.type.toLowerCase() !== 'dashgo',
    )
  }, [selectedVendor])

  // Check if vendor has DashGo
  const hasDashGo = useMemo(() => {
    if (!selectedVendor) return false
    return EXAMPLE_CARDS.some(
      (card) => card.vendor_id === selectedVendor && card.type.toLowerCase() === 'dashgo',
    )
  }, [selectedVendor])

  const selectedVendorName = useMemo(() => {
    return EXAMPLE_VENDORS.find((v) => v.id === selectedVendor)?.branch_name || ''
  }, [selectedVendor])

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                  {filteredVendors.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Text variant="p" className="text-gray-500">
                        No vendors found
                      </Text>
                    </div>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        onClick={() => handleVendorSelect(vendor.id)}
                        className="cursor-pointer transition-all hover:scale-105"
                      >
                        <VendorItems
                          name={vendor.branch_name}
                          shops={vendor.shops}
                          rating={vendor.rating}
                        />
                      </div>
                    ))
                  )}
                </div>
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
                  {EXAMPLE_VENDORS.find((v) => v.id === selectedVendor)?.branch_name}
                </Text>
              </div>
            </div>

            <Text variant="p" className="text-sm text-gray-600">
              Select a card to assign to the selected employees
            </Text>

            {/* DashGo Featured Section */}
            {hasDashGo && (
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
                        Create a custom DashGo travel card with your desired amount for the selected
                        employees
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
            {vendorCards.length > 0 ? (
              <div className="space-y-3">
                {hasDashGo && (
                  <Text variant="span" weight="semibold" className="text-gray-900">
                    Other Cards
                  </Text>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto">
                  {vendorCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => handleCardSelect(card.id)}
                      className={`cursor-pointer transition-all ${
                        selectedCard === card.id ? 'ring-2 ring-primary-500 rounded-2xl' : ''
                      }`}
                    >
                      <CardItems
                        id={card.id}
                        product={card.product}
                        vendor_name={card.vendor_name}
                        rating={card.rating}
                        price={card.price}
                        currency={card.currency}
                        type={card.type}
                        description={card.description}
                        expiry_date={card.expiry_date}
                        terms_and_conditions={card.terms_and_conditions}
                        created_at={card.created_at}
                        created_by={card.created_by}
                        fraud_flag={card.fraud_flag}
                        fraud_notes={card.fraud_notes}
                        images={card.images}
                        is_activated={card.is_activated}
                        issue_date={card.issue_date}
                        last_modified_by={card.last_modified_by}
                        status={card.status}
                        updated_at={card.updated_at}
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
