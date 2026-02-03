import { useNavigate } from 'react-router-dom'
import { Button, Text, Loader, Modal, Combobox } from '@/components'
import { Icon } from '@/libs'
import { useCardDetailsPage } from './useCardDetailsPage'

export default function CardDetailsPage() {
  const navigate = useNavigate()
  const {
    cardTypeParam,
    validCardType,
    isLoading,
    filteredCards,
    cardImageUrls,
    pagination,
    paginationLimit,
    selectedCard,
    showVendorModal,
    showRedemptionModal,
    isProcessingRedemption,
    agreeToTerms,
    setAgreeToTerms,
    selectedVendor,
    selectedVendorId,
    selectedBranchId,
    setSelectedBranchId,
    vendorOptions,
    branchOptions,
    availableBranches,
    isLoadingVendors,
    user,
    CARD_DISPLAY_NAMES,
    getCardBackground,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    handleRedeemClick,
    handleVendorSelect,
    handleCloseVendorModal,
    handleConfirmVendor,
    handleConfirmRedemption,
    handleCloseRedemptionModal,
    clearVendorSelection,
  } = useCardDetailsPage()

  if (!validCardType) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Icon icon="bi:exclamation-triangle" className="text-6xl text-yellow-400 mb-4 mx-auto" />
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
            Invalid Card Type
          </Text>
          <Text variant="p" className="text-gray-600 mb-4">
            The card type "{cardTypeParam}" is not valid.
          </Text>
          <Button variant="primary" onClick={() => navigate('/dashboard/my-cards')}>
            Back to My Cards
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/my-cards')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <Icon icon="bi:arrow-left" className="text-lg" />
          <span>Back to My Cards</span>
        </button>
        <Text variant="h2" weight="semibold" className="text-primary-900">
          {CARD_DISPLAY_NAMES[validCardType]} Gift Cards
        </Text>
        <Text variant="p" className="text-gray-600 mt-2">
          View and manage your {CARD_DISPLAY_NAMES[validCardType]} gift cards
        </Text>
      </div>

      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Icon icon="bi:credit-card-2-front" className="text-6xl text-gray-300 mb-4 mx-auto" />
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
            No {CARD_DISPLAY_NAMES[validCardType]} Cards
          </Text>
          <Text variant="p" className="text-gray-600">
            You don't have any {CARD_DISPLAY_NAMES[validCardType]} gift cards yet.
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card, index) => {
            const cardBackground = getCardBackground(validCardType)
            const displayAmount = card.balance || card.amount || 0
            const canRedeem = card.status === 'active' && displayAmount > 0
            const cardId = card.id ?? card.card_id ?? index
            const cardImageUrl = validCardType === 'dashx' ? cardImageUrls[String(cardId)] : null

            return (
              <div
                key={cardId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div
                  className="relative overflow-hidden bg-gray-200"
                  style={{ paddingTop: '62.5%' }}
                >
                  <img
                    src={cardBackground}
                    alt={`${CARD_DISPLAY_NAMES[validCardType]} card background`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {cardImageUrl && validCardType === 'dashx' && (
                    <img
                      src={cardImageUrl}
                      alt={`${card.card_name || CARD_DISPLAY_NAMES[validCardType]} card image`}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon icon="bi:gift" className="size-5" />
                        <span className="font-extrabold text-lg tracking-wide">
                          {CARD_DISPLAY_NAMES[validCardType]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold">{displayAmount.toFixed(2)}</span>
                        <span className="text-sm ml-1">GHS</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      {(card.vendor_name || card.branch_name) && (
                        <div>
                          <span className="font-bold text-sm tracking-wide uppercase">
                            {card.vendor_name || card.branch_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <Text variant="h4" weight="semibold" className="text-gray-900 mb-3">
                      {card.card_name || card.name || `${CARD_DISPLAY_NAMES[validCardType]} Card`}
                    </Text>
                    <div className="flex flex-col gap-2 mb-4">
                      {card.balance !== undefined && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:wallet2" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            Balance:{' '}
                            <span className="font-semibold text-gray-900">
                              GHS {card.balance?.toFixed(2) || '0.00'}
                            </span>
                          </Text>
                        </div>
                      )}
                      {card.status && (
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={
                              card.status === 'active'
                                ? 'bi:check-circle-fill'
                                : card.status === 'used'
                                  ? 'bi:x-circle-fill'
                                  : 'bi:clock-fill'
                            }
                            className={
                              card.status === 'active'
                                ? 'text-green-500'
                                : card.status === 'used'
                                  ? 'text-red-500'
                                  : 'text-yellow-500'
                            }
                          />
                          <Text variant="span" className="text-gray-600 capitalize">
                            {card.status}
                          </Text>
                        </div>
                      )}
                      {card.expiry_date && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:calendar-event" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            Expires: {new Date(card.expiry_date).toLocaleDateString()}
                          </Text>
                        </div>
                      )}
                      {card.branch_name && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:shop" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            {card.branch_name}
                          </Text>
                        </div>
                      )}
                      {card.vendor_name && (
                        <div className="flex items-center gap-2">
                          <Icon icon="bi:building" className="text-primary-600" />
                          <Text variant="span" className="text-gray-600">
                            {card.vendor_name}
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      disabled={!canRedeem}
                      onClick={() => handleRedeemClick(card)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Icon icon="bi:arrow-repeat" />
                      <span>Redeem Card</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filteredCards.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Text variant="span" className="text-gray-600 text-sm">
              Items per page:
            </Text>
            <select
              value={paginationLimit}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="small"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPreviousPage || isLoading}
              className="flex items-center gap-2"
            >
              <Icon icon="bi:arrow-left" />
              <span>Previous</span>
            </Button>
            <Text variant="span" className="text-gray-600 text-sm">
              Showing {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
            </Text>
            <Button
              variant="outline"
              size="small"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || isLoading}
              className="flex items-center gap-2"
            >
              <span>Next</span>
              <Icon icon="bi:arrow-right" />
            </Button>
          </div>
        </div>
      )}

      <Modal
        title="Select Vendor & Branch"
        isOpen={showVendorModal}
        setIsOpen={handleCloseVendorModal}
        panelClass="!max-w-[500px] py-8"
      >
        {selectedCard && (
          <div className="px-6 pb-6">
            <Text variant="p" className="text-gray-600 mb-6">
              Please select the vendor and branch where you want to redeem this card.
            </Text>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Icon icon="bi:shop" className="text-primary-600" />
                  Search Vendor by Name <span className="text-red-500">*</span>
                </label>
                {selectedVendor && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Icon icon="bi:check-circle-fill" />
                    Selected
                  </span>
                )}
              </div>
              {!selectedVendor ? (
                <Combobox
                  options={vendorOptions}
                  value={selectedVendorId}
                  onChange={(e: { target: { value: string } }) => {
                    const vendorId = e.target.value
                    if (vendorId) handleVendorSelect(vendorId)
                  }}
                  placeholder="Search for a vendor by name..."
                  isLoading={isLoadingVendors}
                />
              ) : (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Icon icon="bi:shop-window" className="text-white text-lg" />
                      </div>
                      <div>
                        <Text variant="span" weight="semibold" className="text-gray-900">
                          {(selectedVendor as { business_name?: string; vendor_name?: string })
                            .business_name ||
                            (selectedVendor as { vendor_name?: string }).vendor_name ||
                            'Unknown Vendor'}
                        </Text>
                      </div>
                    </div>
                    <button
                      onClick={clearVendorSelection}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>
            {selectedVendor && availableBranches.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Branch <span className="text-red-500">*</span>
                </label>
                <Combobox
                  options={branchOptions}
                  value={selectedBranchId !== null ? String(selectedBranchId) : ''}
                  onChange={(e: { target: { value: string } }) => {
                    const branchId = e.target.value
                    setSelectedBranchId(branchId ? Number(branchId) : null)
                  }}
                  placeholder="Select a branch..."
                />
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleCloseVendorModal} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleConfirmVendor}
                disabled={
                  !selectedVendor ||
                  ((validCardType === 'dashx' || validCardType === 'dashpass') &&
                    availableBranches.length > 0 &&
                    selectedBranchId === null)
                }
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Redemption Summary"
        isOpen={showRedemptionModal}
        setIsOpen={handleCloseRedemptionModal}
        panelClass="!max-w-[500px] py-8"
      >
        {selectedCard && (
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] rounded-xl p-6 mb-6 text-white">
              <Text variant="span" className="text-white/90 text-sm mb-2 block">
                Redemption Amount
              </Text>
              <Text variant="h1" weight="bold" className="text-white text-4xl">
                GHS {(selectedCard.balance || selectedCard.amount || 0).toFixed(2)}
              </Text>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <Text variant="span" className="text-gray-600 text-sm">
                    Card Name
                  </Text>
                  <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                    {selectedCard.card_name || selectedCard.name || 'Gift Card'}
                  </Text>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <Text variant="span" className="text-gray-600 text-sm">
                    Card Type
                  </Text>
                  <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                    {CARD_DISPLAY_NAMES[validCardType]}
                  </Text>
                </div>
                {(() => {
                  const branchName =
                    selectedBranchId !== null
                      ? availableBranches.find((b) => b.branch_id === selectedBranchId)?.branch_name
                      : selectedCard.branch_name
                  return branchName ? (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <Text variant="span" className="text-gray-600 text-sm">
                        Branch
                      </Text>
                      <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                        {branchName}
                      </Text>
                    </div>
                  ) : null
                })()}
                {selectedVendor && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <Text variant="span" className="text-gray-600 text-sm">
                      Vendor
                    </Text>
                    <Text variant="span" weight="semibold" className="text-gray-900 text-sm">
                      {(selectedVendor as { business_name?: string; vendor_name?: string })
                        .business_name ||
                        (selectedVendor as { vendor_name?: string }).vendor_name ||
                        selectedCard.vendor_name}
                    </Text>
                  </div>
                )}
                {user && (
                  <div className="flex justify-between items-center">
                    <Text variant="span" className="text-gray-600 text-sm">
                      Account
                    </Text>
                    <div className="text-right">
                      <Text
                        variant="span"
                        weight="semibold"
                        className="text-gray-900 text-sm block"
                      >
                        {(user as { fullname?: string }).fullname || 'User'}
                      </Text>
                      <Text variant="span" className="text-gray-500 text-xs">
                        {(user as { phonenumber?: string; phone?: string }).phonenumber ||
                          (user as { phone?: string }).phone ||
                          'N/A'}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <Text variant="span" className="text-orange-800 text-xs leading-relaxed">
                <Icon icon="bi:exclamation-triangle-fill" className="inline mr-1" />
                Please ensure all details are correct before proceeding. Once redeemed, this action
                cannot be undone.
              </Text>
            </div>
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <Text variant="span" className="text-gray-700 text-sm">
                  I agree to DashQard's{' '}
                  <span className="text-primary-600 font-semibold">Terms & Conditions</span> for
                  card redemption.
                </Text>
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCloseRedemptionModal}
                disabled={isProcessingRedemption}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleConfirmRedemption}
                disabled={!agreeToTerms || isProcessingRedemption}
                loading={isProcessingRedemption}
                className="flex-1"
              >
                {isProcessingRedemption ? 'Processing...' : 'Redeem Card'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
