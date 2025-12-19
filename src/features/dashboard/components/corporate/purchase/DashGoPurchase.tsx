import { useState, useEffect } from 'react'
import { Button, Input, Text } from '@/components'
import { Select } from '@/components/Select'
import { Icon } from '@/libs'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCurrency } from '@/utils/format'
import { DashGoDashboardPurchaseFormSchema } from '@/utils/schemas'
import type { DropdownOption } from '@/types'

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

const VENDOR_OPTIONS: DropdownOption[] = EXAMPLE_VENDORS.map((vendor) => ({
  value: vendor.id.toString(),
  label: vendor.branch_name,
}))

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

type DashGoFormData = z.infer<typeof DashGoDashboardPurchaseFormSchema>

export default function DashGoPurchase() {
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<DashGoFormData>({
    resolver: zodResolver(DashGoDashboardPurchaseFormSchema),
    defaultValues: {
      recipient_card_amount: 0,
      recipient_message: '',
      vendor_id: '',
    },
  })

  const amount = useWatch({ control, name: 'recipient_card_amount' }) || 0
  const message = useWatch({ control, name: 'recipient_message' })
  const selectedVendorId = useWatch({ control, name: 'vendor_id' })

  const selectedVendorName = selectedVendorId
    ? EXAMPLE_VENDORS.find((v) => v.id.toString() === selectedVendorId)?.branch_name || ''
    : ''

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleCardFlip = () => {
    if (!isMobile) setIsCardFlipped((prev) => !prev)
  }

  const onSubmit = (data: DashGoFormData) => {
    if (!data.vendor_id) return
    // TODO: Handle DashGo purchase creation
    console.log(
      'Creating DashGo purchase for vendor:',
      data.vendor_id,
      'amount:',
      data.recipient_card_amount,
    )
  }

  // Computed values for card preview
  const displayedCardAmount =
    amount && amount > 0 ? formatCurrency(amount.toString(), 'GHS') : 'GHS 0.00'
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
                Create and customize a personalized DashGo gift card recipient
              </Text>
              {selectedVendorName && (
                <Text as="p" variant="span" weight="medium" className="text-white/80">
                  Vendor: {selectedVendorName}
                </Text>
              )}
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
                        src={DashGoBg}
                        alt="DashGo background"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_1fr_auto] text-white">
                        <div className="p-4 text-2xl font-black tracking-[0.3em]">DashGo</div>
                        <div className="p-4 text-right text-2xl font-semibold">
                          {displayedCardAmount}
                        </div>
                        <div className="p-4 text-lg font-semibold uppercase">YOUR NAME</div>
                        <div className="flex items-end justify-end p-4">
                          {amount ? <QRPlaceholder /> : null}
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
                              <p className="text-xs text-gray-600">2. Select "Redemption"</p>
                            </div>
                            <div className="rounded-lg border border-green-200 bg-white/90 p-3 shadow-sm">
                              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <Icon icon="bi:whatsapp" className="size-4" />
                                WhatsApp
                              </div>
                              <p className="text-xs text-gray-600">
                                1. Send "Hi" to +233 25 608 0362
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

          {/* Vendor Selection */}
          <section className="border-b border-gray-100 px-10 py-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#212529]">Select Vendor</h3>
              <p className="text-sm text-gray-500">
                Choose which vendor to attach this DashGo card to
              </p>
            </div>
            <div className="max-w-md">
              <Controller
                control={control}
                name="vendor_id"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Select
                    label="Vendor"
                    placeholder="Select a vendor"
                    options={VENDOR_OPTIONS}
                    value={value || ''}
                    onValueChange={onChange}
                    error={error?.message}
                    name="vendor_id"
                  />
                )}
              />
            </div>
          </section>

          {/* Amount Section */}
          <section className="border-b border-gray-100 px-10 py-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#212529]">Gift Card Amount</h3>
              <p className="text-sm text-gray-500">Set an amount up to GHS 10,000 per recipient</p>
            </div>
            <div className="max-w-md space-y-4">
              <Input
                register={register('recipient_card_amount', {
                  valueAsNumber: true,
                })}
                error={errors.recipient_card_amount?.message}
                prefix="GHS"
                placeholder="Enter amount"
                className="w-full"
                type="number"
                min={1}
                max={10000}
                step="0.01"
              />
            </div>
          </section>

          {/* Message Section */}
          <section className="border-b border-gray-100 px-10 py-8">
            <div className="mb-6 space-y-1">
              <h3 className="text-xl font-semibold text-[#212529]">Personal Message</h3>
              <p className="text-sm text-gray-500">Add a personal message for the recipient</p>
            </div>
            <div className="max-w-2xl">
              <Input
                type="textarea"
                label="Message"
                rows={3}
                register={register('recipient_message')}
                error={errors.recipient_message?.message}
                placeholder="Write a personal message for the recipient..."
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#f8f9fa] px-10 py-6 md:flex-row md:justify-end">
            <Button type="submit" variant="secondary" className="md:w-auto">
              Create and customize DashGo Gift Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
