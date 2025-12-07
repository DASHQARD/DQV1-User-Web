import React from 'react'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { Text } from '../Text'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { useUserProfile } from '@/hooks'
import DashProBG from '@/assets/svgs/dashpro_bg.svg'
import DashxBG from '@/assets/svgs/Dashx_bg.svg'

const QRPlaceholder = () => {
  const pattern = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]

  return (
    <div className="grid grid-cols-5 gap-[3px] rounded-md border border-black/10 bg-white p-2">
      {pattern.map((cell, index) => (
        <span
          key={`qr-cell-${index}`}
          className={cell === 1 ? 'size-3 rounded-sm bg-black' : 'size-3 rounded-sm bg-white'}
        />
      ))}
    </div>
  )
}

type RecipientData = {
  amount: number
  name?: string
  phone?: string
  email?: string
  message?: string
  assign_to_self?: boolean
}

type PurchaseModalProps = {
  initialData?: Partial<RecipientData> | null
  onSave?: (data: RecipientData) => void
  isOpen?: boolean
  onClose?: () => void
  showTrigger?: boolean
  cardType?: string
  cardProduct?: string
  cardCurrency?: string
}

export default function PurchaseModal({
  initialData = null,
  onSave,
  isOpen: controlledIsOpen,
  onClose,
  showTrigger = true,
  cardType,
  cardProduct,
  cardCurrency = 'GHS',
}: PurchaseModalProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen
  const setIsOpen = isControlled
    ? (value: boolean) => {
        if (!value && onClose) onClose()
      }
    : setInternalIsOpen
  const [isCardFlipped, setIsCardFlipped] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [assignToSelf, setAssignToSelf] = React.useState(true) // Default to true

  const [amount, setAmount] = React.useState(initialData?.amount?.toString() ?? '')
  const [name, setName] = React.useState(initialData?.name ?? '')
  const [phone, setPhone] = React.useState(initialData?.phone ?? '')
  const [email, setEmail] = React.useState(initialData?.email ?? '')
  const [message, setMessage] = React.useState(initialData?.message ?? '')

  // Get authenticated user info
  const { user } = useAuthStore()
  const { data: userProfile } = useUserProfile()

  // Get user information for assign_to_self
  const getUserInfo = React.useCallback(() => {
    const userData = user as any
    return {
      name: userProfile?.fullname || userData?.fullname || userData?.name || '',
      email: userProfile?.email || userData?.email || '',
      phone: userProfile?.phonenumber || userData?.phonenumber || userData?.phone || '',
    }
  }, [user, userProfile])

  // Check if amount can be changed (only DashPro allows changing amount)
  const canChangeAmount = React.useMemo(() => {
    const normalizedType = cardType?.toLowerCase()
    return normalizedType === 'dashpro'
  }, [cardType])

  // Form validation: if assign_to_self is true, only amount is required (for DashPro)
  // If assign_to_self is false, amount (for DashPro), name, email, and phone are required
  const isFormValid = React.useMemo(() => {
    // For DashX and DashPass, amount is not required (it's fixed from cart item)
    if (canChangeAmount && !amount) return false
    if (assignToSelf) {
      return true // Only amount required when assigning to self (for DashPro)
    }
    return Boolean(name && phone && email) // All required when assigning to someone else
  }, [amount, assignToSelf, name, phone, email, canChangeAmount])

  // Get card background based on type
  const getCardBackground = () => {
    const normalizedType = cardType?.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBG
      case 'dashpro':
        return DashProBG
      case 'dashgo':
        return DashxBG // fallback for now
      default:
        return DashProBG // default fallback
    }
  }

  // Get card type display name
  const getCardTypeName = () => {
    const normalizedType = cardType?.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return 'DASHX'
      case 'dashpro':
        return 'DASHPRO'
      case 'dashgo':
        return 'DASHGO'
      default:
        return 'DASHPRO'
    }
  }

  const cardBackground = getCardBackground()
  const cardTypeName = getCardTypeName()
  const displayedCardAmount = amount
    ? `${cardCurrency} ${Number(amount).toLocaleString()}`
    : `${cardCurrency} 0`
  const displayedCardRecipient = React.useMemo(() => {
    if (assignToSelf) {
      const userInfo = getUserInfo()
      return userInfo.name || 'Your Name'
    }
    return name || 'Recipient Name'
  }, [assignToSelf, name, getUserInfo])
  const displayedCardMessage = message || 'Your personalized message will appear here...'

  const toggleCardFlip = () => {
    if (!isMobile) setIsCardFlipped((prev) => !prev)
  }

  const handleAssignToSelf = () => {
    const newValue = !assignToSelf
    setAssignToSelf(newValue)

    if (newValue) {
      // When assigning to self, populate with user info but these will be ignored in API
      const userInfo = getUserInfo()
      setName(userInfo.name)
      setEmail(userInfo.email)
      setPhone(userInfo.phone)
    } else {
      // When assigning to someone else, clear the fields
      setName('')
      setEmail('')
      setPhone('')
    }
  }

  const quickAmounts = [100, 500, 1000, 5000]

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    if (initialData) {
      // For DashX and DashPass, use the initial amount (from cart item price)
      // For DashPro, allow user to set amount
      if (canChangeAmount) {
        setAmount(initialData.amount?.toString() ?? '')
      } else {
        // For non-DashPro cards, use the initial amount and keep it fixed
        setAmount(initialData.amount?.toString() ?? '')
      }
      setName(initialData.name ?? '')
      setPhone(initialData.phone ?? '')
      setEmail(initialData.email ?? '')
      setMessage(initialData.message ?? '')
      setAssignToSelf(initialData.assign_to_self ?? true)
    } else {
      // If no initial data, only set amount for DashPro
      if (canChangeAmount) {
        setAmount('')
      }
      setName('')
      setPhone('')
      setEmail('')
      setMessage('')
      setAssignToSelf(true) // Default to true
    }
  }, [initialData, isOpen, canChangeAmount])

  // Populate user info when assignToSelf is true and modal opens
  React.useEffect(() => {
    if (isOpen && assignToSelf) {
      const userInfo = getUserInfo()
      if (userInfo.name) setName(userInfo.name)
      if (userInfo.email) setEmail(userInfo.email)
      if (userInfo.phone) setPhone(userInfo.phone)
    }
  }, [isOpen, assignToSelf, getUserInfo])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormValid) return

    onSave?.({
      amount: Number(amount),
      name: assignToSelf ? undefined : name,
      phone: assignToSelf ? undefined : phone,
      email: assignToSelf ? undefined : email,
      message,
      assign_to_self: assignToSelf,
    })
    setIsOpen(false)
  }

  return (
    <div>
      {showTrigger && (
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          🎁 Gift
        </Button>
      )}

      <Modal isOpen={isOpen} setIsOpen={setIsOpen} panelClass="!max-w-[900px] md:!w-full">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-[20px] border-b-2 border-[#ffc40033] bg-linear-to-br from-[#402d87] to-[#2d1a72] px-8 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-[#ffc400] to-[#f0b90b] text-primary-500 shadow-[0_4px_12px_#ffc4004d]">
              <Icon icon="bi:person-plus-fill" className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <Text as="h2" variant="h2" weight="bold" className="text-white">
                {initialData ? 'Edit Recipient' : 'Add New Recipient'}
              </Text>
              <Text as="p" variant="span" weight="medium" className="text-white/80">
                Create and customize a personalized {cardProduct || cardTypeName} gift card
                recipient
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[#ffc4004d] bg-[#ffc40033] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ffc400]">
            <Icon icon="bi:shield-check" className="size-4" />
            Secure
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Card Preview Section */}
          <section className="border-b border-[#f1f3f4] bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] px-10 py-8">
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-semibold text-[#212529]">Card Preview</h3>
              <div className="flex justify-center">
                <div
                  className="relative h-[320px] w-full max-w-[520px] cursor-pointer perspective-[1000px]"
                  onClick={toggleCardFlip}
                >
                  <div
                    className={`relative h-full w-full transition-transform duration-700 transform-3d ${
                      isCardFlipped && !isMobile ? 'transform-[rotateY(180deg)]' : ''
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 rounded-2xl shadow-xl backface-hidden">
                      <img
                        src={cardBackground}
                        alt={`${cardTypeName} background`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_1fr_auto] text-white">
                        <div className="p-4 text-2xl font-black tracking-[0.3em]">
                          {cardTypeName}
                        </div>
                        <div className="p-4 text-right text-2xl font-semibold">
                          {displayedCardAmount}
                        </div>
                        <div className="p-4 text-lg font-semibold uppercase">
                          {displayedCardRecipient}
                        </div>
                        <div className="flex items-end justify-end p-4">
                          {amount && (assignToSelf || name) ? <QRPlaceholder /> : null}
                        </div>
                      </div>
                      {!isMobile && (
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[11px] uppercase text-white">
                          <Icon icon="bi:arrow-repeat" className="size-4" />
                          Click to flip
                        </div>
                      )}
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 rounded-2xl bg-white p-6 shadow-xl backface-hidden transform-[rotateY(180deg)]">
                      <div className="flex h-full flex-col gap-4 text-sm text-[#333]">
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-base font-semibold text-[#d25e8d]">
                            <Icon icon="bi:heart-fill" className="size-4" />
                            Personal Message
                          </div>
                          <p className="rounded-xl border border-yellow-200 bg-white/90 p-4 text-sm italic shadow-sm">
                            {displayedCardMessage}
                          </p>
                          <p className="text-right text-xs text-gray-600">From: Sender Name</p>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center gap-2 text-base font-semibold text-green-600">
                            <Icon icon="bi:gift-fill" className="size-4" />
                            How to Redeem
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg border border-green-200 bg-white/90 p-3 shadow-sm">
                              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <Icon icon="bi:phone-fill" className="size-4" />
                                USSD Code
                              </div>
                              <p className="text-xs text-gray-600">1. Dial *800*0000#</p>
                              <p className="text-xs text-gray-600">2. Select “Redemption”</p>
                            </div>
                            <div className="rounded-lg border border-green-200 bg-white/90 p-3 shadow-sm">
                              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <Icon icon="bi:whatsapp" className="size-4" />
                                WhatsApp
                              </div>
                              <p className="text-xs text-gray-600">
                                1. Send “Hi” to +233 25 608 0362
                              </p>
                              <p className="text-xs text-gray-600">2. Follow the prompts</p>
                            </div>
                          </div>
                        </div>

                        {!isMobile && (
                          <div className="mt-auto flex items-center justify-center gap-2 text-[11px] uppercase text-gray-500">
                            <Icon icon="bi:arrow-repeat" className="size-4" />
                            Click to flip back
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Amount Section - Only show for DashPro */}
          {canChangeAmount && (
            <section className="border-b border-gray-100 px-10 py-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#212529]">Gift Card Amount</h3>
                <p className="text-sm text-gray-500">
                  Set an amount up to {cardCurrency} 10,000 per recipient
                </p>
              </div>
              <div className="max-w-md space-y-4">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                    {cardCurrency}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setAmount(String(value))}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:bg-primary-500 hover:text-white"
                    >
                      {cardCurrency} {value}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Icon icon="bi:info-circle" className="size-4" />
                  Amount limit: {cardCurrency} 10,000 per recipient
                </div>
              </div>
            </section>
          )}

          {/* Recipient Details */}
          <section className="border-b border-gray-100 px-10 py-8">
            <div className="mb-6 space-y-1">
              <h3 className="text-xl font-semibold text-[#212529]">Recipient Details</h3>
              <p className="text-sm text-gray-500">Who will receive this gift card?</p>
            </div>
            <div className="grid max-w-2xl gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name {!assignToSelf && '*'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={
                    assignToSelf
                      ? 'Will use your account information'
                      : "Enter recipient's full name"
                  }
                  required={!assignToSelf}
                />
                {assignToSelf && (
                  <p className="mt-1 text-xs text-gray-500">Will use your account name</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone Number {!assignToSelf && '*'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={assignToSelf ? 'Will use your account phone' : 'Enter phone number'}
                  required={!assignToSelf}
                />
                {assignToSelf && (
                  <p className="mt-1 text-xs text-gray-500">Will use your account phone number</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address {!assignToSelf && '*'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={assignToSelf ? 'Will use your account email' : 'Enter email address'}
                  required={!assignToSelf}
                />
                {assignToSelf && (
                  <p className="mt-1 text-xs text-gray-500">Will use your account email</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Personal Message
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Write a personal message for the recipient..."
                />
              </div>
            </div>
          </section>

          {/* Assign to self */}
          <section className="px-10 py-8">
            <div className="rounded-2xl bg-[#f8f9fa] p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-3">
                  <div className="relative h-6 w-11">
                    <input
                      type="checkbox"
                      checked={assignToSelf}
                      onChange={handleAssignToSelf}
                      className="peer sr-only"
                    />
                    <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-primary-500" />
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    <Icon icon="bi:person-check" className="mr-2 inline size-4 text-primary-500" />
                    Assign to Self
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  {assignToSelf
                    ? 'Card will be assigned to your account. Name, email, and phone fields will be ignored.'
                    : 'Card will be assigned to someone else. Please provide recipient details below.'}
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#f8f9fa] px-10 py-6 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="md:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={!isFormValid} className="md:w-auto">
              {initialData ? 'Update Recipient' : 'Save Recipient'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
