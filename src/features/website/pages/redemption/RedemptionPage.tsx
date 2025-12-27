import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Text, RadioGroup, RadioGroupItem } from '@/components'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'

type RedemptionMethod = 'vendor_mobile_money' | 'vendor_id'
type CardType = 'dashpro' | 'dashgo' | 'dashx' | 'dashpass'

export default function RedemptionPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // State management
  const [redemptionMethod, setRedemptionMethod] = useState<RedemptionMethod | ''>('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [vendorMobileMoney, setVendorMobileMoney] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [cardType, setCardType] = useState<CardType | ''>('')
  const [amount, setAmount] = useState('')
  const [balance] = useState<number | null>(null)
  const [vendorName] = useState('')
  const [step, setStep] = useState<'method' | 'details' | 'confirm' | 'success'>('method')

  // Handle method selection
  const handleMethodSelect = (method: RedemptionMethod) => {
    setRedemptionMethod(method)
    setStep('details')
  }

  // Handle vendor mobile money validation
  const handleVendorMobileMoneyChange = async (value: string) => {
    setVendorMobileMoney(value)
    // TODO: Validate vendor mobile money number and get vendor name
    // This would call an API endpoint to validate the number
  }

  // Handle phone number entry (for guest users)
  const handlePhoneNumberChange = async (value: string) => {
    setPhoneNumber(value)
    // TODO: Fetch card balances based on phone number and vendor
    // This would call an API endpoint to get balances
  }

  // Handle amount validation
  const handleAmountChange = (value: string) => {
    setAmount(value)
    // Validate amount against balance
    if (balance && parseFloat(value) > balance) {
      // Show insufficient balance message
    }
  }

  // Handle redemption submission
  const handleRedeem = () => {
    setStep('confirm')
  }

  // Handle confirmation
  const handleConfirm = async () => {
    // TODO: Call redemption API
    // On success, navigate to success page
    setStep('success')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8fafc] to-[#e2e8f0] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Text variant="h1" weight="bold" className="text-gray-900 mb-2">
            Redeem Gift Card
          </Text>
          <Text variant="p" className="text-gray-600">
            Choose your redemption method and follow the steps
          </Text>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {step === 'method' && (
            <div className="space-y-6">
              <Text variant="h3" weight="semibold" className="text-gray-900 mb-6">
                Select Redemption Method
              </Text>

              <RadioGroup
                value={redemptionMethod}
                onValueChange={(value) => handleMethodSelect(value as RedemptionMethod)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg border-gray-200 hover:border-primary-500 cursor-pointer transition-colors">
                  <RadioGroupItem value="vendor_mobile_money" id="vendor_mobile_money" />
                  <label
                    htmlFor="vendor_mobile_money"
                    className="flex-1 cursor-pointer"
                    onClick={() => handleMethodSelect('vendor_mobile_money')}
                  >
                    <div className="font-semibold text-gray-900">Vendor Mobile Money</div>
                    <div className="text-sm text-gray-600">
                      Redeem from your DashPro balance only
                    </div>
                  </label>
                </div>
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg border-gray-200 hover:border-primary-500 cursor-pointer transition-colors">
                  <RadioGroupItem value="vendor_id" id="vendor_id" />
                  <label
                    htmlFor="vendor_id"
                    className="flex-1 cursor-pointer"
                    onClick={() => handleMethodSelect('vendor_id')}
                  >
                    <div className="font-semibold text-gray-900">Vendor ID</div>
                    <div className="text-sm text-gray-600">
                      Redeem from DashGo, DashX, DashPass, and DashPro
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setStep('method')
                  setRedemptionMethod('')
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <Icon icon="bi:arrow-left" className="text-lg" />
                <span>Back</span>
              </button>

              {redemptionMethod === 'vendor_mobile_money' && (
                <div className="space-y-6">
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    Vendor Mobile Money Redemption
                  </Text>

                  {!isAuthenticated && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter the phone number you received the gift card on"
                        value={phoneNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePhoneNumberChange(e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vendor Mobile Money Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter vendor mobile money number"
                      value={vendorMobileMoney}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleVendorMobileMoneyChange(e.target.value)
                      }
                    />
                    {vendorName && (
                      <p className="mt-2 text-sm text-green-600">Vendor: {vendorName}</p>
                    )}
                  </div>

                  {balance !== null && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        DashPro Balance
                      </label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Text variant="h4" weight="semibold" className="text-primary-600">
                          GHS {balance.toFixed(2)}
                        </Text>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount to redeem"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleAmountChange(e.target.value)
                      }
                    />
                    {balance && parseFloat(amount) > balance && (
                      <p className="mt-2 text-sm text-red-600">Insufficient balance</p>
                    )}
                    {balance && parseFloat(amount) <= balance && parseFloat(amount) > 0 && (
                      <p className="mt-2 text-sm text-green-600">Amount valid</p>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleRedeem}
                    disabled={
                      !vendorMobileMoney ||
                      (!isAuthenticated && !phoneNumber) ||
                      !amount ||
                      (balance !== null && parseFloat(amount) > balance)
                    }
                    className="w-full"
                  >
                    Redeem
                  </Button>
                </div>
              )}

              {redemptionMethod === 'vendor_id' && (
                <div className="space-y-6">
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    Vendor ID Redemption
                  </Text>

                  {/* TODO: Implement vendor ID search and branch selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vendor ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter vendor ID or search"
                      value={selectedVendorId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSelectedVendorId(e.target.value)
                      }
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Use the search function to find vendors by name
                    </p>
                  </div>

                  {!isAuthenticated && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="Enter the phone number you received the gift card on"
                        value={phoneNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handlePhoneNumberChange(e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Card type selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Card Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setCardType('dashpro')}
                        className={`p-4 border-2 rounded-lg ${
                          cardType === 'dashpro'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        DashPro
                      </button>
                      <button
                        onClick={() => setCardType('dashgo')}
                        className={`p-4 border-2 rounded-lg ${
                          cardType === 'dashgo'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        DashGo
                      </button>
                      <button
                        onClick={() => setCardType('dashx')}
                        className={`p-4 border-2 rounded-lg ${
                          cardType === 'dashx'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        DashX
                      </button>
                      <button
                        onClick={() => setCardType('dashpass')}
                        className={`p-4 border-2 rounded-lg ${
                          cardType === 'dashpass'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        DashPass
                      </button>
                    </div>
                  </div>

                  {/* TODO: Add branch selection when vendor is selected */}
                  {/* TODO: Add amount input for DashPro and DashGo */}
                  {/* TODO: Add card ID input for DashX and DashPass */}
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <Text variant="h3" weight="semibold" className="text-gray-900">
                Confirm Redemption
              </Text>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <Text variant="span" className="text-gray-600">
                    Redemption Amount:
                  </Text>
                  <Text variant="span" weight="semibold" className="text-gray-900">
                    GHS {parseFloat(amount).toFixed(2)}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text variant="span" className="text-gray-600">
                    Vendor:
                  </Text>
                  <Text variant="span" weight="semibold" className="text-gray-900">
                    {vendorName || selectedVendorId}
                  </Text>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirm} className="flex-1">
                  Confirm
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Icon icon="bi:check-circle-fill" className="text-5xl text-green-600" />
              </div>
              <Text variant="h2" weight="bold" className="text-gray-900">
                Redemption Successful!
              </Text>
              <Text variant="p" className="text-gray-600">
                GHS {parseFloat(amount).toFixed(2)} successfully redeemed to {vendorName}
              </Text>
              {balance !== null && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <Text variant="span" className="text-gray-600">
                    Remaining Balance: GHS {(balance - parseFloat(amount)).toFixed(2)}
                  </Text>
                </div>
              )}
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
