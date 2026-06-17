import { useState } from 'react'
import { Icon } from '@/libs'
import { BasePhoneInput } from '@/components/BasePhoneNumber/BasePhoneNumber'
import { NetworkWarning } from '@/components'
import { useRedemptionForm, type CardType } from '../hooks/useRedemptionForm'
import { useUserInfo } from '../hooks/useUserInfo'
import { useCountriesData } from '@/hooks'
import RedemptionSummary from '../components/RedemptionSummary'

const CARD_TYPES: { value: CardType; label: string; icon: string }[] = [
  { value: 'DashPro', label: 'DashPro', icon: 'bi:star-fill' },
  { value: 'DashGo', label: 'DashGo', icon: 'bi:lightning-charge-fill' },
  { value: 'DashX', label: 'DashX', icon: 'bi:x-diamond-fill' },
  { value: 'DashPass', label: 'DashPass', icon: 'bi:ticket-perforated-fill' },
]

export default function Redeem() {
  const userInfo = useUserInfo()
  const { countries } = useCountriesData()
  const {
    cardType,
    setCardType,
    redemptionAmount,
    setRedemptionAmount,
    rawVendorPhone,
    setRawVendorPhone,
    validatingVendor,
    vendorPhoneError,
    vendorPhoneName,
    vendorSearch,
    setVendorSearch,
    vendorSearchResults,
    isSearchingVendors,
    selectedVendor,
    handleSelectVendor,
    availableBalance,
    balanceLoading,
    balanceError,
    hasNetworkIssue,
    cardPreviewImageUrl,
    isFormValid,
    isSubmitting,
    submitRedemption,
    clearForm,
    showSummaryModal,
    setShowSummaryModal,
  } = useRedemptionForm()

  const [showVendorDropdown, setShowVendorDropdown] = useState(false)

  const isVendorScoped = cardType !== 'DashPro'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await submitRedemption()
  }

  const handleModalClose = () => {
    setShowSummaryModal(false)
    clearForm()
  }

  const insufficientBalance =
    redemptionAmount !== null &&
    availableBalance !== null &&
    redemptionAmount > availableBalance

  return (
    <div className="bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] min-h-screen">
      <div className="container-fluid">
        <div className="flex gap-4 min-h-screen items-center">
          {/* Left Column */}
          <div className="hidden lg:flex lg:col-span-6 left-panel bg-gradient-to-br from-[#402D87] to-[#2D1A72] text-white relative overflow-hidden">
            <div className="flex flex-col justify-center items-center h-screen relative p-12 z-[1]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[15%] left-[10%] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-6 flex items-center justify-center text-3xl text-white/70 animate-[float_6s_ease-in-out_infinite]">
                  <Icon icon="bi:shield-check" />
                </div>
                <div className="absolute top-[60%] right-[15%] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-6 flex items-center justify-center text-3xl text-white/70 animate-[float_6s_ease-in-out_infinite] [animation-delay:2s]">
                  <Icon icon="bi:gift" />
                </div>
                <div className="absolute bottom-[20%] left-[20%] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-6 flex items-center justify-center text-3xl text-white/70 animate-[float_6s_ease-in-out_infinite] [animation-delay:4s]">
                  <Icon icon="bi:phone" />
                </div>
              </div>

              <div className="relative my-8">
                <div className="relative w-[120px] h-[120px] bg-gradient-to-br from-[#5B47D4] to-[#402D87] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                  <Icon icon="bi:shield-lock-fill" className="text-5xl text-white z-[2]" />
                  <div className="absolute border-2 border-white/30 rounded-full h-[140px] w-[140px] animate-[pulse_2s_ease-out_infinite]" />
                </div>
              </div>

              <div className="text-center max-w-[400px]">
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Secure Gift Card Redemption
                </h2>
                <p className="text-lg opacity-90 mb-8 leading-relaxed">
                  Redeem your gift cards and vouchers with confidence using our bank-grade security
                  platform
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/8 rounded-xl backdrop-blur-md border border-white/12">
                    <Icon icon="bi:shield-fill-check" className="text-xl text-[#FBBF24]" />
                    <span className="text-sm font-medium">256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/8 rounded-xl backdrop-blur-md border border-white/12">
                    <Icon icon="bi:lightning-charge-fill" className="text-xl text-[#FBBF24]" />
                    <span className="text-sm font-medium">Instant Processing</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/8 rounded-xl backdrop-blur-md border border-white/12">
                    <Icon icon="bi:person-check-fill" className="text-xl text-[#FBBF24]" />
                    <span className="text-sm font-medium">No OTP Required for Members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Redemption Form */}
          <div className="col-span-12 lg:col-span-6">
            <div className="p-12 bg-white min-h-screen flex flex-col justify-center">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-[#402D87] to-[#5B47D4] rounded-[20px] flex items-center justify-center mx-auto mb-6 text-3xl text-white shadow-[0_10px_25px_rgba(64,45,135,0.3)]">
                  <Icon icon="bi:credit-card-2-front" />
                </div>
                <h1 className="text-4xl font-bold text-[#1E293B] mb-2">Redeem Your Gift Card</h1>
                <p className="text-lg text-[#64748B] m-0">
                  Select your card type and complete the redemption
                </p>
              </div>

              <div className="max-w-[500px] w-full mx-auto">
                {hasNetworkIssue && <NetworkWarning className="mb-6" />}
                <form onSubmit={handleSubmit} className="redemption-form">

                  {/* Card Type Selector */}
                  <div className="mb-6">
                    <span className="text-sm font-semibold text-[#374151] flex items-center gap-2 mb-3">
                      <Icon icon="bi:credit-card" className="text-[#402D87]" />
                      Card Type
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {CARD_TYPES.map(({ value, label, icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setCardType(value)}
                          className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                            cardType === value
                              ? 'border-[#402D87] bg-gradient-to-br from-[#F5F3FF] to-[#FAF8FF] text-[#402D87]'
                              : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#C4B5FD] hover:text-[#402D87]'
                          }`}
                        >
                          <Icon icon={icon} className="text-lg" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Available Balance */}
                  <div className="mb-6 p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#64748B] flex items-center gap-2 min-w-0">
                        {cardPreviewImageUrl ? (
                          <img
                            src={cardPreviewImageUrl}
                            alt={`${cardType} card`}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#E5E7EB]"
                          />
                        ) : (
                          <Icon icon="bi:wallet2" className="text-[#402D87] shrink-0" />
                        )}
                        <span className="truncate">Available Balance ({cardType})</span>
                      </span>
                      {balanceLoading ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#3B82F6]">
                          <div className="w-3 h-3 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
                          Loading...
                        </div>
                      ) : balanceError ? (
                        <span className="text-xs text-[#EF4444] flex items-center gap-1">
                          <Icon icon="bi:exclamation-circle" />
                          Unavailable
                        </span>
                      ) : availableBalance !== null ? (
                        <span className="text-sm font-bold text-[#10B981]">
                          GHS {availableBalance.toFixed(2)}
                        </span>
                      ) : isVendorScoped && !selectedVendor ? (
                        <span className="text-xs text-[#94A3B8]">Select a vendor first</span>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">—</span>
                      )}
                    </div>
                  </div>

                  {/* Vendor Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#374151] flex items-center gap-2 mb-3">
                      <Icon icon="bi:shop" className="text-[#402D87]" />
                      {isVendorScoped ? 'Select Vendor' : 'Vendor Mobile Money'}
                    </h3>

                    {isVendorScoped ? (
                      /* Vendor search for DashGo / DashX / DashPass */
                      <div className="relative">
                        <input
                          type="text"
                          value={vendorSearch}
                          onChange={(e) => {
                            setVendorSearch(e.target.value)
                            if (selectedVendor && e.target.value !== selectedVendor.vendor_name) {
                              handleSelectVendor({ vendor_id: '', vendor_name: '', gvid: '', phone_number: '' })
                            }
                            setShowVendorDropdown(true)
                          }}
                          onFocus={() => setShowVendorDropdown(true)}
                          onBlur={() => setTimeout(() => setShowVendorDropdown(false), 150)}
                          placeholder="Search vendor by name…"
                          className="w-full py-3.5 px-4 border-2 border-[#E5E7EB] rounded-xl text-base bg-white focus:outline-none focus:border-[#402D87] focus:ring-2 focus:ring-[#402D87]/10"
                        />
                        {isSearchingVendors && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[#E5E7EB] border-t-[#402D87] rounded-full animate-spin" />
                          </div>
                        )}

                        {showVendorDropdown && vendorSearchResults.length > 0 && (
                          <ul className="absolute z-10 w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {vendorSearchResults.map((vendor) => (
                              <li
                                key={vendor.vendor_id}
                                onMouseDown={() => handleSelectVendor(vendor)}
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F5F3FF] transition-colors"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#402D87]/10 flex items-center justify-center text-[#402D87] text-sm">
                                  <Icon icon="bi:shop-window" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-[#1F2937]">{vendor.vendor_name}</div>
                                  {vendor.phone_number && (
                                    <div className="text-xs text-[#6B7280]">{vendor.phone_number}</div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      /* Vendor phone input for DashPro */
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-[#64748B]">
                            Enter the vendor&apos;s mobile money number
                          </span>
                          <div className="text-xs">
                            {validatingVendor && (
                              <span className="text-[#3B82F6] flex items-center gap-1">
                                <div className="w-3 h-3 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
                                Verifying…
                              </span>
                            )}
                            {vendorPhoneName && !vendorPhoneError && (
                              <span className="text-[#10B981] flex items-center gap-1">
                                <Icon icon="bi:check-circle-fill" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <BasePhoneInput
                          selectedVal={rawVendorPhone}
                          handleChange={(value: string) => setRawVendorPhone(value)}
                          placeholder="Enter vendor phone number"
                          options={countries}
                          name="vendorPhone"
                          id="vendorPhone"
                        />
                        {vendorPhoneError && (
                          <div className="mt-2 text-sm text-[#EF4444] flex items-center gap-1">
                            <Icon icon="bi:exclamation-triangle" />
                            {vendorPhoneError}
                          </div>
                        )}
                      </>
                    )}

                    {/* Vendor confirmed card */}
                    {(vendorPhoneName && !isVendorScoped) || (selectedVendor?.vendor_id && isVendorScoped) ? (
                      <div className="mt-3 p-3 border border-[#10B981] rounded-xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-sm">
                          <Icon icon="bi:shop-window" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-[#1F2937]">
                            {isVendorScoped ? selectedVendor?.vendor_name : vendorPhoneName}
                          </div>
                          <div className="text-xs text-[#6B7280]">Verified Vendor</div>
                        </div>
                        <Icon icon="bi:patch-check-fill" className="text-[#10B981]" />
                      </div>
                    ) : null}
                  </div>

                  {/* Redemption Amount */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="redemptionAmount" className="text-sm font-semibold text-[#374151] flex items-center gap-2">
                        <Icon icon="bi:cash-coin" className="text-[#402D87]" />
                        Redemption Amount
                      </label>
                      {availableBalance !== null && redemptionAmount !== null && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            insufficientBalance ? 'text-[#EF4444]' : 'text-[#10B981]'
                          }`}
                        >
                          <Icon
                            icon={
                              insufficientBalance
                                ? 'bi:exclamation-triangle'
                                : 'bi:check-circle-fill'
                            }
                          />
                          {insufficientBalance ? 'Exceeds balance' : 'Within balance'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="redemptionAmount"
                        type="number"
                        value={redemptionAmount ?? ''}
                        onChange={(e) =>
                          setRedemptionAmount(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full py-3.5 px-4 pr-14 border-2 border-[#E5E7EB] rounded-xl text-base bg-white focus:outline-none focus:border-[#402D87] focus:ring-2 focus:ring-[#402D87]/10"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        max={availableBalance ?? undefined}
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#402D87]">
                        GHS
                      </div>
                    </div>
                    {insufficientBalance && (
                      <div className="mt-2 text-sm text-[#EF4444] flex items-center gap-1">
                        <Icon icon="bi:exclamation-triangle" />
                        Amount exceeds available balance of GHS {availableBalance?.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Auto-filled User Info */}
                  <div className="flex items-center my-6 text-center">
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                    <span className="px-4 text-sm font-medium text-[#64748B] bg-white">
                      Your Account
                    </span>
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                  </div>

                  <div className="mb-6 p-4 border border-[#402D87] rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#FAF8FF]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#402D87] text-white flex items-center justify-center text-xl">
                        <Icon icon="bi:person-circle" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#1F2937]">
                          {userInfo.userInfo.name || 'User'}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          {userInfo.userInfo.phone || 'Phone not available'}
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5">
                          {userInfo.userInfo.email || 'Email not available'}
                        </div>
                      </div>
                      <Icon icon="bi:check-circle-fill" className="text-xl text-[#10B981]" />
                    </div>
                    <div className="mt-3 px-2 py-1.5 bg-white/70 rounded-lg text-xs text-[#374151] flex items-center gap-2">
                      <Icon icon="bi:shield-check" />
                      <span>Logged in — details auto-filled</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      className="px-6 py-3.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] hover:bg-[#E2E8F0] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={clearForm}
                      disabled={isSubmitting}
                    >
                      <Icon icon="bi:arrow-clockwise" />
                      Reset
                    </button>

                    <button
                      type="submit"
                      className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] bg-gradient-to-br from-[#402D87] to-[#5B47D4] text-white shadow-[0_4px_14px_rgba(64,45,135,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(64,45,135,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Icon icon="bi:arrow-right-circle" />
                          Redeem Now
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RedemptionSummary
        isOpen={showSummaryModal}
        onClose={handleModalClose}
        isRegisteredUser={true}
      />
    </div>
  )
}
