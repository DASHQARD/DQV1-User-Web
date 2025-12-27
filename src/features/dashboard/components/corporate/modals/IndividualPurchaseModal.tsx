import { useState, useMemo } from 'react'
import { Button, Modal, Text, Tabs, Input, Loader } from '@/components'
import { DebouncedSearch } from '@/components/SearchBox'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { CardItems } from '@/features/website/components/CardItems/CardItems'
import { VendorItems } from '@/features/website/components/VendorItems/VendorItems'
import DashProPurchase from '@/features/website/components/DashProPurchase/DashProPurchase'
import { IndividualPurchase } from '../purchase'
import { Icon } from '@/libs'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { vendorQueries } from '@/features/dashboard/vendor'
import { corporateQueries } from '@/features/dashboard/corporate'

type TabType = 'purchases' | 'vendors' | 'dashpro'
type CardType = 'card' | 'dashgo'

export function IndividualPurchaseModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.PURCHASE.INDIVIDUAL.ROOT,
  })
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null)
  const [vendorSearch, setVendorSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('purchases')
  const [dashGoAmount, setDashGoAmount] = useState<string>('')

  const { useGetAllVendorsDetailsService } = vendorQueries()
  const { useGetCardsService } = corporateQueries()
  const { data: vendorsResponse } = useGetAllVendorsDetailsService()
  const { data: cardsResponse, isLoading: isLoadingCards } = useGetCardsService()

  // Get vendors data
  const vendors = useMemo(() => {
    if (!vendorsResponse) return []
    return Array.isArray(vendorsResponse) ? vendorsResponse : vendorsResponse?.data || []
  }, [vendorsResponse])

  // Get all cards
  const allCards = useMemo(() => {
    if (!cardsResponse) return []
    return Array.isArray(cardsResponse) ? cardsResponse : cardsResponse?.data || []
  }, [cardsResponse])

  // Filter vendors based on search
  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors
    const searchLower = vendorSearch.toLowerCase()
    return vendors.filter((vendor: any) => vendor.branch_name?.toLowerCase().includes(searchLower))
  }, [vendorSearch, vendors])

  // Get cards for selected vendor (including DashX and DashPass since vendors create them, excluding DashPro and DashGo)
  const vendorCards = useMemo(() => {
    if (!selectedVendor) return []
    return allCards.filter(
      (card: any) =>
        card.vendor_id === selectedVendor &&
        card.type?.toLowerCase() !== 'dashpro' &&
        card.type?.toLowerCase() !== 'dashgo', // DashGo is user-created, not vendor-created
    )
  }, [selectedVendor, allCards])

  const selectedVendorName = useMemo(() => {
    return vendors.find((v: any) => v.id === selectedVendor)?.branch_name || ''
  }, [selectedVendor, vendors])

  const handleVendorSelect = (vendorId: number) => {
    setSelectedVendor(vendorId)
    setSelectedCard(null)
    setSelectedCardType(null)
  }

  const handleCardSelect = (cardId: number, cardType: CardType = 'card') => {
    setSelectedCard(cardId)
    setSelectedCardType(cardType)
  }

  const handleDashGoSelect = () => {
    setSelectedCardType('dashgo')
    setSelectedCard(selectedVendor || 0)
  }

  const handleBackToVendors = () => {
    setSelectedVendor(null)
    setSelectedCard(null)
    setSelectedCardType(null)
    setVendorSearch('')
    setDashGoAmount('')
  }

  const handleConfirm = () => {
    if (!selectedCard && !selectedCardType) return

    if (selectedCardType === 'dashgo') {
      if (!dashGoAmount || parseFloat(dashGoAmount) <= 0) return
      // TODO: Handle DashGo individual purchase creation
      console.log('Creating DashGo purchase for vendor:', selectedVendor, 'amount:', dashGoAmount)
    } else {
      // TODO: Handle regular card individual purchase creation (includes DashX and DashPass which are vendor-created)
      console.log('Creating individual purchase for card:', selectedCard, 'vendor:', selectedVendor)
    }

    modal.closeModal()
    setSelectedCard(null)
    setSelectedVendor(null)
    setSelectedCardType(null)
    setDashGoAmount('')
  }

  const handleClose = () => {
    modal.closeModal()
    setSelectedVendor(null)
    setSelectedCard(null)
    setVendorSearch('')
    setActiveTab('purchases')
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
                { value: 'purchases', label: 'My Purchases' },
                { value: 'vendors', label: 'Vendors' },
                { value: 'dashpro', label: 'DashPro' },
              ]}
              active={activeTab}
              setActive={(value: string) => setActiveTab(value as TabType)}
              className="gap-6"
              btnClass="pb-2"
            />

            {activeTab === 'purchases' ? (
              <div className="py-4 min-h-[400px]">
                <IndividualPurchase />
              </div>
            ) : activeTab === 'vendors' ? (
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
                    filteredVendors.map((vendor: any) => (
                      <div
                        key={vendor.id}
                        onClick={() => handleVendorSelect(vendor.id)}
                        className="cursor-pointer transition-all hover:scale-105"
                      >
                        <VendorItems
                          name={vendor.branch_name}
                          branches={vendor.shops || 0}
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
            ) : null}
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

            {/* DashGo Featured Section */}
            {selectedVendor && (
              <div className="bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] rounded-lg p-6 border border-gray-200 mb-6">
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
                          value={dashGoAmount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setDashGoAmount(e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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

            {/* Vendor Cards (includes DashX and DashPass since vendors create them) */}
            {isLoadingCards ? (
              <div className="text-center py-12">
                <Loader />
              </div>
            ) : vendorCards.length > 0 ? (
              <div className="space-y-3">
                <Text variant="span" weight="semibold" className="text-gray-900">
                  Vendor Cards
                </Text>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                  {vendorCards.map((card: any) => (
                    <div
                      key={card.card_id || card.id}
                      onClick={() => handleCardSelect(card.card_id || card.id, 'card')}
                      className={`cursor-pointer transition-all ${
                        selectedCard === (card.card_id || card.id) && selectedCardType === 'card'
                          ? 'ring-2 ring-[#402D87] ring-offset-2'
                          : 'hover:scale-105'
                      }`}
                    >
                      <CardItems
                        card_id={card.card_id || card.id}
                        product={card.product}
                        branch_name={card.branch_name}
                        branch_location={card.branch_location}
                        vendor_name={selectedVendorName}
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
            ) : null}
          </>
        )}

        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {(selectedCard || selectedCardType) && (
            <Button
              variant="secondary"
              onClick={handleConfirm}
              disabled={
                selectedCardType === 'dashgo' && (!dashGoAmount || parseFloat(dashGoAmount) <= 0)
              }
            >
              Confirm Purchase
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
