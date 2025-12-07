import React from 'react'
import { Button, Input, Text } from '@/components'
import { Icon } from '@/libs'
import DashxBG from '@/assets/svgs/Dashx_bg.svg'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCurrency } from '@/utils/format'
import { DashGoPurchaseSchema } from '@/utils/schemas'

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

export default function DashGoPurchase() {
  const [isCardFlipped, setIsCardFlipped] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [assignToSelf, setAssignToSelf] = React.useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<z.infer<typeof DashGoPurchaseSchema>>({
    resolver: zodResolver(DashGoPurchaseSchema),
  })

  const toggleCardFlip = () => {
    if (!isMobile) setIsCardFlipped((prev) => !prev)
  }

  const handleAssignToSelf = () => {
    const newValue = !assignToSelf
    setAssignToSelf(newValue)

    if (newValue) {
      // When assigning to self, populate with user info but these will be ignored in API
    }
  }

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const onSubmit = (data: z.infer<typeof DashGoPurchaseSchema>) => {
    console.log(data)
  }

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
              <Text as="p" variant="span" weight="medium" className="text-white/80">
                Create and customize a personalized DashGo gift card recipient
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[#ffc4004d] bg-[#ffc40033] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ffc400]">
            <Icon icon="bi:shield-check" className="size-4" />
            Secure
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col border border-[#f1f3f4]">
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
                        src={DashxBG}
                        alt={`DashGo background`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_1fr_auto] text-white">
                        <div className="p-4 text-2xl font-black tracking-[0.3em]">DashGo</div>
                        <div className="p-4 text-right text-2xl font-semibold">
                          {formatCurrency(getValues('recipient_card_amount'), 'GHS')}
                        </div>
                        <div className="p-4 text-lg font-semibold uppercase">
                          {getValues('recipient_name')}
                        </div>
                        <div className="flex items-end justify-end p-4">
                          {getValues('recipient_card_amount') &&
                          (assignToSelf || getValues('recipient_name')) ? (
                            <QRPlaceholder />
                          ) : null}
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
                            {getValues('recipient_message')}
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

          {/* Amount Section */}
          <section className="border-b border-gray-100 px-10 py-8 max-w-2xl grid gap-6">
            <div>
              <Text variant="h3" weight="semibold" className="text-[#212529]">
                Gift Card Amount
              </Text>
              <Text variant="span" weight="medium" className="text-gray-500">
                Set an amount up to GHS 10,000 per recipient
              </Text>
            </div>
            <Input
              register={register('recipient_card_amount')}
              error={errors.recipient_card_amount?.message}
              prefix="GHS"
              placeholder="Enter amount"
              className="w-full"
            />
          </section>

          {/* Recipient Details */}
          <section className="border-b border-gray-100 px-10 py-8 flex flex-col gap-6">
            <div>
              <Text variant="h3" weight="semibold" className="text-[#212529]">
                Recipient Details
              </Text>
              <Text variant="span" weight="medium" className="text-gray-500">
                Who will receive this gift card?
              </Text>
            </div>
            <div className="grid max-w-2xl gap-6">
              <Input
                label="Full Name"
                type="text"
                register={register('recipient_name')}
                error={errors.recipient_name?.message}
                placeholder="Enter recipient's full name"
                disabled={assignToSelf}
              />

              <Input
                label="Phone Number"
                type="tel"
                register={register('recipient_phone')}
                error={errors.recipient_phone?.message}
                placeholder="Enter phone number"
                disabled={assignToSelf}
              />

              <Input
                label="Email Address"
                type="email"
                register={register('recipient_email')}
                error={errors.recipient_email?.message}
                placeholder="Enter email address"
                disabled={assignToSelf}
              />

              <Input
                type="textarea"
                label="Personal Message"
                rows={10}
                innerClassName="!h-auto min-h-[200px]"
                inputClassName="resize-none"
                register={register('recipient_message')}
                error={errors.recipient_message?.message}
                placeholder="Write a personal message for the recipient..."
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#f8f9fa] px-10 py-6 md:flex-row md:justify-end">
            <Button type="button" variant="outline" className="md:w-auto">
              Cancel
            </Button>
            <Button type="submit" variant="secondary" className="md:w-auto">
              Create Customized DashGo Gift Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
