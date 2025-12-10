import { useEffect } from 'react'
import { Icon } from '@/libs'
import { BasePhoneInput } from '@/components/BasePhoneNumber/BasePhoneNumber'
import { useRedemptionForm } from '../../hooks/useRedemptionForm'
import { useUserInfo } from '../../hooks/useUserInfo'
import { useCountriesData } from '@/hooks'
import RedemptionSummary from '../../components/RedemptionSummary'

export default function Redeem() {
  const userInfo = useUserInfo()
  const { countries } = useCountriesData()
  const {
    form,
    rawVendor,
    setRawVendor,
    validatingVendor,
    vendorError,
    vendorName,
    isFormValid,
    isSubmitting,
    submitRedemption,
    clearForm,
    balance,
    balanceCheckComplete,
    balanceError,
    showSummaryModal,
    setShowSummaryModal,
    setForm,
  } = useRedemptionForm()

  // Auto-fill user information from logged-in user
  useEffect(() => {
    if (userInfo.userInfo.phone) {
      // User phone is already set from auth store
    }
  }, [userInfo.userInfo.phone])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await submitRedemption(userInfo.userInfo)
  }

  const handleModalClose = () => {
    setShowSummaryModal(false)
    clearForm()
  }

  return (
    <div className="bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] min-h-screen">
      <div className="container-fluid">
        <div className="flex gap-4 min-h-screen items-center">
          {/* Left Column - Professional Illustration */}
          <div className="hidden lg:flex lg:col-span-6 left-panel bg-gradient-to-br from-[#402D87] to-[#2D1A72] text-white relative overflow-hidden">
            <div className="flex flex-col justify-center items-center h-screen relative p-12 z-[1]">
              {/* Floating Cards */}
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

              {/* Main Visual */}
              <div className="relative my-8">
                <div className="relative w-[120px] h-[120px] bg-gradient-to-br from-[#5B47D4] to-[#402D87] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                  <Icon icon="bi:shield-lock-fill" className="text-5xl text-white z-[2]" />
                  <div className="absolute border-2 border-white/30 rounded-full h-[140px] w-[140px] animate-[pulse_2s_ease-out_infinite]" />
                </div>
              </div>

              {/* Content Text */}
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
                    <Icon icon="bi:telephone-fill" className="text-xl text-[#FBBF24]" />
                    <span className="text-sm font-medium">SMS Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Redemption Form */}
          <div className="col-span-12 lg:col-span-6">
            <div className="p-12 bg-white min-h-screen flex flex-col justify-center">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-[#402D87] to-[#5B47D4] rounded-[20px] flex items-center justify-center mx-auto mb-6 text-3xl text-white shadow-[0_10px_25px_rgba(64,45,135,0.3)]">
                  <Icon icon="bi:credit-card-2-front" />
                </div>
                <h1 className="text-4xl font-bold text-[#1E293B] mb-2">Redeem Your Gift Card</h1>
                <p className="text-lg text-[#64748B] m-0">
                  Enter your details below to start the secure redemption process
                </p>
              </div>

              <div className="max-w-[500px] w-full mx-auto">
                <form onSubmit={handleSubmit} className="redemption-form">
                  {/* Vendor Mobile Money Section */}
                  <div className="mb-6">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold text-[#1E293B] mb-1">
                        Vendor Information
                      </h3>
                      <span className="text-sm text-[#64748B]">
                        Details of the vendor providing the service
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-[#374151] flex items-center gap-2">
                          <Icon icon="bi:shop" className="text-[#402D87]" />
                          Vendor Mobile Money
                        </label>
                        <div className="text-xs">
                          {validatingVendor && (
                            <span className="text-[#3B82F6] flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin" />
                              Verifying vendor...
                            </span>
                          )}
                          {vendorName && !vendorError && (
                            <span className="text-[#10B981] flex items-center gap-1">
                              <Icon icon="bi:check-circle-fill" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`relative transition-all duration-200 ${
                          vendorError
                            ? 'error'
                            : validatingVendor
                              ? 'validating'
                              : vendorName && !vendorError
                                ? 'success'
                                : ''
                        }`}
                      >
                        <BasePhoneInput
                          selectedVal={rawVendor}
                          handleChange={(value: string) => setRawVendor(value)}
                          placeholder="Enter vendor phone number"
                          options={countries}
                          name="vendorPhone"
                          id="vendorPhone"
                        />
                      </div>

                      {vendorError && (
                        <div className="mt-2 text-sm text-[#EF4444] flex items-center gap-1">
                          <Icon icon="bi:exclamation-triangle" />
                          {vendorError}
                        </div>
                      )}

                      {/* Vendor Details Card */}
                      {vendorName && !vendorError && (
                        <div className="mt-4 p-4 border border-[#10B981] rounded-xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xl">
                              <Icon icon="bi:shop-window" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-[#1F2937]">
                                {vendorName}
                              </div>
                              <div className="text-xs text-[#6B7280]">Verified Vendor</div>
                            </div>
                            <Icon icon="bi:patch-check-fill" className="text-xl text-[#10B981]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Redemption Amount */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-[#374151] flex items-center gap-2">
                        <Icon icon="bi:cash-coin" className="text-[#402D87]" />
                        Redemption Amount
                      </label>
                      {form.redemptionAmount && Number(form.redemptionAmount) > 0 && (
                        <span className="text-xs text-[#10B981] flex items-center gap-1">
                          <Icon icon="bi:check-circle-fill" />
                          Valid Amount
                        </span>
                      )}
                    </div>

                    <div
                      className={`relative transition-all duration-200 ${
                        form.redemptionAmount && Number(form.redemptionAmount) > 0
                          ? 'success'
                          : form.redemptionAmount !== null &&
                              (!form.redemptionAmount || Number(form.redemptionAmount) <= 0)
                            ? 'error'
                            : ''
                      }`}
                    >
                      <input
                        type="number"
                        value={form.redemptionAmount || ''}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            redemptionAmount: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="w-full py-3.5 px-12 pr-12 border-2 border-[#E5E7EB] rounded-xl text-base transition-all duration-200 bg-white focus:outline-none focus:border-[#402D87] focus:ring-2 focus:ring-[#402D87]/10"
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#402D87]">
                        GHS
                      </div>
                    </div>

                    {form.redemptionAmount !== null &&
                      (!form.redemptionAmount || Number(form.redemptionAmount) <= 0) && (
                        <div className="mt-2 text-sm text-[#EF4444] flex items-center gap-1">
                          <Icon icon="bi:exclamation-triangle" />
                          Please enter a valid amount greater than 0
                        </div>
                      )}

                    <div className="mt-2 text-sm text-[#64748B] flex items-center gap-1">
                      <Icon icon="bi:info-circle" />
                      Enter the amount you want to redeem in Ghana Cedis (GHS)
                    </div>
                  </div>

                  {/* Auto-filled User Details */}
                  <div className="flex items-center my-8 text-center">
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                    <span className="px-4 text-sm font-medium text-[#64748B] bg-white">
                      Your Account Details
                    </span>
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                  </div>

                  {/* Auto-filled User Info Card */}
                  <div className="mb-6 p-4 border border-[#402D87] rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#FAF8FF]">
                    <div className="flex items-center gap-3 mb-3">
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
                      <span>Logged in - Details auto-filled</span>
                    </div>
                  </div>

                  {/* Balance Information Section */}
                  {(balanceCheckComplete || balanceError) && (
                    <div className="mb-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-[#1E293B] mb-1">
                          Balance Information
                        </h3>
                        <span className="text-sm text-[#64748B]">
                          Your account balance verification
                        </span>
                      </div>

                      {/* Balance Error */}
                      {balanceError && (
                        <div className="border border-[#EF4444] rounded-xl p-6 bg-gradient-to-br from-[#FEF2F2] to-[#FECACA]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-xl">
                              <Icon icon="bi:exclamation-triangle-fill" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold m-0 mb-1">
                                Balance Check Failed
                              </h4>
                              <p className="text-sm m-0 opacity-80">{balanceError}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="bg-transparent text-[#402D87] border border-[#402D87] px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 hover:bg-[#402D87] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => submitRedemption(userInfo.userInfo)}
                            disabled={isSubmitting}
                          >
                            <Icon icon="bi:arrow-clockwise" />
                            Retry Balance Check
                          </button>
                        </div>
                      )}

                      {/* Balance Success */}
                      {balanceCheckComplete && !balanceError && balance !== null && (
                        <div className="border border-[#10B981] rounded-xl p-6 bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xl">
                              <Icon icon="bi:check-circle-fill" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold m-0 mb-1">Balance Verified</h4>
                              <p className="text-sm m-0 opacity-80">
                                Account: {userInfo.userInfo.name || 'User'} (
                                {userInfo.userInfo.phone || 'N/A'})
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-[#10B981]/20 pt-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[#374151]">Available Balance:</span>
                              <span className="text-sm font-semibold text-[#10B981]">
                                {balance} GHS
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[#374151]">Amount to Send:</span>
                              <span className="text-sm font-semibold">
                                {form.redemptionAmount} GHS
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#10B981]/20 pt-2 mt-2 font-semibold">
                              <span className="text-sm text-[#374151]">Status:</span>
                              <span className="text-sm text-[#10B981] flex items-center gap-1">
                                <Icon icon="bi:check-circle-fill" />
                                Sufficient Balance
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      className="px-6 py-3.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] hover:bg-[#E2E8F0] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={clearForm}
                      disabled={isSubmitting}
                    >
                      <Icon icon="bi:arrow-clockwise" />
                      Reset Form
                    </button>

                    <button
                      type="submit"
                      className="flex-1 px-6 py-3.5 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px] bg-gradient-to-br from-[#402D87] to-[#5B47D4] text-white shadow-[0_4px_14px_rgba(64,45,135,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(64,45,135,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Icon icon="bi:arrow-right-circle" />
                          Continue to Redemption
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-8 p-4 bg-gradient-to-br from-[#FEF7CD] to-[#FEF3C7] border border-[#F59E0B] rounded-xl flex gap-3">
                    <Icon icon="bi:shield-lock" className="text-xl text-[#D97706] mt-0.5" />
                    <div className="text-sm text-[#92400E] leading-relaxed">
                      <strong>Secure Transaction:</strong> This redemption is protected by 256-bit
                      SSL encryption and requires SMS verification to complete.
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      <RedemptionSummary
        isOpen={showSummaryModal}
        onClose={handleModalClose}
        isRegisteredUser={true}
      />
    </div>
  )
}
