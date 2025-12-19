import React from 'react'
import { Button, Text } from '@/components'
import { Icon } from '@/libs'
import DashProBG from '@/assets/svgs/dashpro_bg.svg'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCurrency } from '@/utils/format'
import { AssignRecipientSchema } from '@/utils/schemas'
import { useCreateCard } from '@/features/dashboard/hooks'
import { useCart } from '../../hooks'

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

export default function DashProPurchase() {
  const [isCardFlipped, setIsCardFlipped] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [assignToSelf, setAssignToSelf] = React.useState(true)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<z.infer<typeof AssignRecipientSchema>>({
    resolver: zodResolver(AssignRecipientSchema),
    defaultValues: {
      assign_to_self: true,
      amount: 1000,
      name: '',
      phone: '',
      email: '',
      message: 'Your personalized message will appear here...',
    },
  })

  // Watch form values for card preview
  const amount = useWatch({ control, name: 'amount' })
  const recipientName = useWatch({ control, name: 'name' })
  const message = useWatch({ control, name: 'message' })
  const assignToSelfFormValue = useWatch({ control, name: 'assign_to_self' })

  const { mutate: createDashProCard, isPending: isCreatingDashProCard } = useCreateCard()
  const { addToCart } = useCart()

  // Sync assignToSelf state with form value
  React.useEffect(() => {
    setAssignToSelf(assignToSelfFormValue)
  }, [assignToSelfFormValue])

  const toggleCardFlip = () => {
    if (!isMobile) setIsCardFlipped((prev) => !prev)
  }

  const handleAssignToSelf = () => {
    const newValue = !assignToSelf
    setAssignToSelf(newValue)
    setValue('assign_to_self', newValue)
  }

  const onSubmit = (data: z.infer<typeof AssignRecipientSchema>) => {
    // Calculate dates in YYYY-MM-DD format
    const today = new Date()
    const issueDate = today.toISOString().split('T')[0] // YYYY-MM-DD format

    // Add 1 year (handles leap years correctly)
    const expiryDate = new Date(today)
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    const expiryDateFormatted = expiryDate.toISOString().split('T')[0] // YYYY-MM-DD format

    createDashProCard(
      {
        product: 'DashPro',
        description: 'DashPro',
        type: 'DashPro',
        price: amount,
        currency: 'GHS',
        issue_date: issueDate,
        expiry_date: expiryDateFormatted,
        images: [],
        terms_and_conditions: [],
      },
      {
        onSuccess: (response: any) => {
          console.log('response', response)
          addToCart({
            card_id: response.card_id,
            amount: amount,
            quantity: 1,
          })
        },
      },
    )
    console.log('Form submitted:', data)
  }

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Computed values for card preview
  const displayedCardAmount = amount ? formatCurrency(amount.toString(), 'GHS') : 'GHS 0'
  const displayedCardRecipient = assignToSelf ? 'Your Name' : recipientName || 'Recipient Name'
  const displayedCardMessage = message || 'Your personalized message will appear here...'

  return (
    <div>
      <div className="max-w-[900px] w-full">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-[20px] border-b-2 border-[#ffc40033] bg-linear-to-br from-[#402d87] to-[#2d1a72] px-8 py-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-[#ffc400] to-[#f0b90b] text-primary-500 shadow-[0_4px_12px_#ffc4004d]">
              <Icon icon="bi:person-plus-fill" className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <Text as="h2" variant="h2" weight="bold" className="text-white">
                Create and customize a personalized DashPro gift card recipient
              </Text>
              <Text as="p" variant="span" weight="medium" className="text-white/80">
                Create and customize a personalized DashPro gift card recipient
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[#ffc4004d] bg-[#ffc40033] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ffc400]">
            <Icon icon="bi:shield-check" className="size-4" />
            Secure
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
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
                        src={DashProBG}
                        alt={`DashPro background`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_1fr_auto] text-white">
                        <div className="p-4 text-2xl font-black tracking-[0.3em]">DashPro</div>
                        <div className="p-4 text-right text-2xl font-semibold">
                          {displayedCardAmount}
                        </div>
                        <div className="p-4 text-lg font-semibold uppercase">
                          {displayedCardRecipient}
                        </div>
                        <div className="flex items-end justify-end p-4">
                          {amount && (assignToSelf || getValues('name')) ? <QRPlaceholder /> : null}
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

                        <div className="mt-auto flex items-center justify-center gap-2 text-[11px] uppercase text-gray-500">
                          <Icon icon="bi:arrow-repeat" className="size-4" />
                          Click to flip back
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Amount Section */}
          <section className="border-b border-gray-100 px-10 py-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#212529]">Gift Card Amount</h3>
              <p className="text-sm text-gray-500">Set an amount up to GHS 10,000 per recipient</p>
            </div>
            <div className="max-w-md space-y-4">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                  GHS
                </span>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
                )}
              </div>
            </div>
          </section>

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
                  {...register('name')}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={
                    assignToSelf
                      ? 'Will use your account information'
                      : "Enter recipient's full name"
                  }
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
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
                  {...register('phone')}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={assignToSelf ? 'Will use your account phone' : 'Enter phone number'}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                )}
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
                  {...register('email')}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={assignToSelf ? 'Will use your account email' : 'Enter email address'}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
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
                  {...register('message')}
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
                      {...register('assign_to_self')}
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
            <Button type="button" variant="outline" className="md:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="md:w-auto"
              disabled={isCreatingDashProCard}
            >
              Create and customize DashPro Gift Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
