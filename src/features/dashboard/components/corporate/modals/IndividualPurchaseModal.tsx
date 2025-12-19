import { useState, useMemo } from 'react'
import { Button, Modal, Text, Tabs } from '@/components'
import { DebouncedSearch } from '@/components/SearchBox'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { CardItems } from '@/features/website/components/CardItems/CardItems'
import { VendorItems } from '@/features/website/components/VendorItems/VendorItems'
import DashProPurchase from '@/features/website/components/DashProPurchase/DashProPurchase'
import DashGoPurchase from '../purchase/DashGoPurchase'
import { Icon } from '@/libs'

// Example vendors data
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

// Example cards data with all card types
const EXAMPLE_CARDS = [
  // DashX Cards
  {
    id: 1,
    vendor_id: 1,
    product: 'DashX Classic Gift Card',
    vendor_name: 'DashQards',
    type: 'DashX' as const,
    price: '500.00',
    currency: 'GHS',
    images: [],
    rating: 4.5,
    description: 'Perfect for everyday purchases and gifting',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    vendor_id: 1,
    product: 'DashX Everyday Card',
    vendor_name: 'DashQards',
    type: 'DashX' as const,
    price: '250.00',
    currency: 'GHS',
    images: [],
    rating: 4.6,
    description: 'For all your daily shopping needs',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    vendor_id: 4,
    product: 'DashX Shopping Card',
    vendor_name: 'Retail Partners',
    type: 'DashX' as const,
    price: '300.00',
    currency: 'GHS',
    images: [],
    rating: 4.7,
    description: 'Shop at your favorite retail stores',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  // DashGo Cards
  {
    id: 4,
    vendor_id: 2,
    product: 'DashGo Travel Card',
    vendor_name: 'Travel Partners',
    type: 'dashgo' as const,
    price: '750.00',
    currency: 'GHS',
    images: [],
    rating: 4.8,
    description: 'Your perfect travel companion for hotels and flights',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    vendor_id: 5,
    product: 'DashGo Adventure Card',
    vendor_name: 'Adventure Tours',
    type: 'dashgo' as const,
    price: '600.00',
    currency: 'GHS',
    images: [],
    rating: 4.4,
    description: 'Explore the world with travel benefits',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    vendor_id: 1,
    product: 'DashGo Premium Travel',
    vendor_name: 'DashQards',
    type: 'dashgo' as const,
    price: '1200.00',
    currency: 'GHS',
    images: [],
    rating: 4.9,
    description: 'Premium travel card for luxury experiences',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  // DashPass Cards
  {
    id: 7,
    vendor_id: 1,
    product: 'DashPass Membership Card',
    vendor_name: 'DashQards',
    type: 'dashpass' as const,
    price: '300.00',
    currency: 'GHS',
    images: [],
    rating: 4.7,
    description: 'Exclusive membership benefits and rewards',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    vendor_id: 3,
    product: 'DashPass Business',
    vendor_name: 'Business Solutions',
    type: 'dashpass' as const,
    price: '400.00',
    currency: 'GHS',
    images: [],
    rating: 4.8,
    description: 'Business membership with exclusive perks',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  // DashPro Cards
  {
    id: 9,
    vendor_id: 3,
    product: 'DashPro Business Premium',
    vendor_name: 'Business Solutions',
    type: 'dashpro' as const,
    price: '1000.00',
    currency: 'GHS',
    images: [],
    rating: 4.9,
    description: 'Premium business gift card for corporate gifting',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    vendor_id: 1,
    product: 'DashPro Premium',
    vendor_name: 'DashQards',
    type: 'dashpro' as const,
    price: '800.00',
    currency: 'GHS',
    images: [],
    rating: 4.8,
    description: 'Premium gift card for all occasions',
    expiry_date: '2025-12-31',
    terms_and_conditions: [],
    created_at: new Date().toISOString(),
    created_by: null,
    fraud_flag: false,
    fraud_notes: null,
    is_activated: false,
    issue_date: new Date().toISOString(),
    last_modified_by: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  },
]

type TabType = 'vendors' | 'DashX' | 'dashgo' | 'dashpass' | 'dashpro'

export function IndividualPurchaseModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.PURCHASE.INDIVIDUAL.ROOT,
  })
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [vendorSearch, setVendorSearch] = useState('')
  const [cardSearch, setCardSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('vendors')

  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return EXAMPLE_VENDORS
    const searchLower = vendorSearch.toLowerCase()
    return EXAMPLE_VENDORS.filter((vendor) =>
      vendor.branch_name.toLowerCase().includes(searchLower),
    )
  }, [vendorSearch])

  // Get cards for selected vendor
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []
    return EXAMPLE_CARDS.filter((card) => card.vendor_id === selectedVendor)
  }, [selectedVendor])

  // Get cards filtered by type
  const cardsByType = useMemo(() => {
    let filtered = EXAMPLE_CARDS

    // Filter by card type based on active tab
    if (activeTab === 'DashX') {
      filtered = filtered.filter((card) => card.type.toLowerCase() === 'dashx')
    } else if (activeTab === 'dashgo') {
      filtered = filtered.filter((card) => card.type.toLowerCase() === 'dashgo')
    } else if (activeTab === 'dashpass') {
      filtered = filtered.filter((card) => card.type.toLowerCase() === 'dashpass')
    } else if (activeTab === 'dashpro') {
      filtered = filtered.filter((card) => card.type.toLowerCase() === 'dashpro')
    }

    // Filter by search if provided
    if (cardSearch) {
      const searchLower = cardSearch.toLowerCase()
      filtered = filtered.filter(
        (card) =>
          card.product.toLowerCase().includes(searchLower) ||
          card.vendor_name?.toLowerCase().includes(searchLower),
      )
    }

    return filtered
  }, [activeTab, cardSearch])

  const selectedVendorName = useMemo(() => {
    return EXAMPLE_VENDORS.find((v) => v.id === selectedVendor)?.branch_name || ''
  }, [selectedVendor])

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
    // TODO: Handle individual purchase creation
    console.log('Creating individual purchase for card:', selectedCard, 'vendor:', selectedVendor)
    modal.closeModal()
    setSelectedCard(null)
    setSelectedVendor(null)
  }

  const handleClose = () => {
    modal.closeModal()
    setSelectedVendor(null)
    setSelectedCard(null)
    setVendorSearch('')
    setCardSearch('')
    setActiveTab('vendors')
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.PURCHASE.INDIVIDUAL.CREATE)}
      setIsOpen={handleClose}
      title={selectedVendor ? 'Select Card' : 'Individual Purchase'}
      position="center"
      panelClass="!w-[90vw] !max-w-6xl p-6"
    >
      <div className="space-y-6">
        {!selectedVendor ? (
          <>
            <Tabs
              tabs={[
                { value: 'vendors', label: 'Vendors' },
                { value: 'DashX', label: 'DashX' },
                { value: 'dashgo', label: 'DashGo' },
                { value: 'dashpass', label: 'DashPass' },
                { value: 'dashpro', label: 'DashPro' },
              ]}
              active={activeTab}
              setActive={(value: string) => setActiveTab(value as TabType)}
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
            ) : activeTab === 'dashpro' ? (
              <div className="py-8">
                <DashProPurchase />
              </div>
            ) : activeTab === 'dashgo' ? (
              <div className="py-8">
                <DashGoPurchase />
              </div>
            ) : (
              <>
                <DebouncedSearch
                  value={cardSearch}
                  onChange={setCardSearch}
                  placeholder={`Search ${activeTab} cards...`}
                  className="w-full"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                  {cardsByType.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Text variant="p" className="text-gray-500">
                        No {activeTab} cards found
                      </Text>
                    </div>
                  ) : (
                    cardsByType.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => handleCardSelect(card.id)}
                        className={`cursor-pointer transition-all ${
                          selectedCard === card.id
                            ? 'ring-2 ring-[#402D87] ring-offset-2'
                            : 'hover:scale-105'
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
                    ))
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBackToVendors}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon icon="bi:arrow-left" className="w-5 h-5 text-gray-600" />
              </button>
              <Text variant="h4" weight="semibold" className="text-gray-900">
                {selectedVendorName}
              </Text>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {vendorCards.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Text variant="p" className="text-gray-500">
                    No cards available for this vendor
                  </Text>
                </div>
              ) : (
                vendorCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardSelect(card.id)}
                    className={`cursor-pointer transition-all ${
                      selectedCard === card.id
                        ? 'ring-2 ring-[#402D87] ring-offset-2'
                        : 'hover:scale-105'
                    }`}
                  >
                    <CardItems
                      id={card.id}
                      product={card.product}
                      vendor_name={selectedVendorName}
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
                ))
              )}
            </div>
          </>
        )}

        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {selectedCard && (
            <Button variant="secondary" onClick={handleConfirm}>
              Confirm Purchase
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
