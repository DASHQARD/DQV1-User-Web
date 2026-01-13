import React from 'react'
import { Button, Input, Text, Combobox } from '@/components'
import { Icon } from '@/libs'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCurrency } from '@/utils/format'
import { DashGoAssignRecipientSchema } from '@/utils/schemas'
import { usePublicCatalogQueries } from '../../hooks/website/usePublicCatalogQueries'
import { usePublicCatalogMutations } from '../../hooks/website/usePublicCatalogMutations'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'
import { useUserProfile } from '@/hooks'
import { useCartStore } from '@/stores/cart'
import { useCart, useRecipients } from '../../hooks'

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

  const form = useForm<z.infer<typeof DashGoAssignRecipientSchema>>({
    resolver: zodResolver(DashGoAssignRecipientSchema),
    defaultValues: {
      assign_to_self: true,
      vendor_id: 0,
      recipient_name: '',
      recipient_phone: '',
      recipient_email: '',
      recipient_message: '',
      recipient_card_amount: 100,
      recipient_card_currency: 'GHS',
      recipient_card_issue_date: new Date().toISOString().split('T')[0],
      recipient_card_expiry_date: '',
      recipient_card_images: [],
    },
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form

  console.log('errors', errors)

  // Watch form values for card preview
  const amount = useWatch({ control, name: 'recipient_card_amount' })
  const recipientName = useWatch({ control, name: 'recipient_name' })
  const message = useWatch({ control, name: 'recipient_message' })
  const assignToSelfFormValue = useWatch({ control, name: 'assign_to_self' })
  const vendorId = useWatch({ control, name: 'vendor_id' })

  const { useCreateDashGoAndAssignService } = usePublicCatalogMutations()
  const createDashGoMutationAsync = useCreateDashGoAndAssignService()
  const { addToCartAsync } = useCart()
  const { openCart } = useCartStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useAssignRecipientService } = useRecipients()
  const assignRecipientMutation = useAssignRecipientService()

  const { usePublicVendorsService } = usePublicCatalogQueries()

  const { useGetBranchesByVendorIdService } = vendorQueries()
  const { data: vendorsResponse } = usePublicVendorsService({ limit: 100 })

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

    if (newValue) {
      setValue('recipient_name', userProfileData?.fullname || '')
      setValue('recipient_email', userProfileData?.email || '')
      setValue('recipient_phone', userProfileData?.phonenumber || '')
    } else {
      setValue('recipient_name', '')
      setValue('recipient_email', '')
      setValue('recipient_phone', '')
    }
  }

  React.useEffect(() => {
    if (assignToSelf && userProfileData) {
      setValue('recipient_name', userProfileData?.fullname || '')
      setValue('recipient_email', userProfileData?.email || '')
      setValue('recipient_phone', userProfileData?.phonenumber || '')
    }
  }, [assignToSelf, userProfileData, setValue])

  // Extract vendors from response
  const vendors = React.useMemo(() => {
    if (!vendorsResponse) return []
    const vendorsData = Array.isArray(vendorsResponse) ? vendorsResponse : [vendorsResponse]
    return vendorsData
      .filter((vendor: any) => vendor.branches_with_cards?.length > 0)
      .map((vendor: any) => ({
        id: vendor.id || vendor.vendor_id,
        vendor_id: vendor.vendor_id || vendor.id,
        name: vendor.business_name || vendor.branch_name || vendor.vendor_name || 'Unknown Vendor',
      }))
  }, [vendorsResponse])

  // Watch selected vendor ID
  const [selectedVendorId, setSelectedVendorId] = React.useState<number | null>(null)

  // Get branches for selected vendor
  const { data: branchesData } = useGetBranchesByVendorIdService(selectedVendorId, false)
  const branches = React.useMemo(() => {
    if (!branchesData) return []
    return Array.isArray(branchesData) ? branchesData : branchesData?.data || []
  }, [branchesData])

  // Update selected vendor ID when form value changes
  React.useEffect(() => {
    if (vendorId && vendorId > 0) {
      setSelectedVendorId(vendorId)
    }
  }, [vendorId])

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const onSubmit = async (data: z.infer<typeof DashGoAssignRecipientSchema>) => {
    // Calculate issue date in YYYY-MM-DD format
    const today = new Date()
    const issueDate = today.toISOString().split('T')[0] // YYYY-MM-DD format

    // Get selected vendor name
    const selectedVendor = vendors.find((v) => v.vendor_id === data.vendor_id)
    const vendorName = selectedVendor?.name || 'Unknown Vendor'

    // Map branches to redemption_branches format
    const redemptionBranches = branches.map((branch: any) => ({
      branch_id: Number(branch.id || branch.branch_id),
    }))

    try {
      await createDashGoMutationAsync.mutateAsync(
        {
          vendor_id: data.vendor_id,
          product: 'DashGo Gift Card',
          description: `Custom DashGo card for ${vendorName}`,
          price: data.recipient_card_amount,
          currency: data.recipient_card_currency || 'GHS',
          issue_date: issueDate,
          redemption_branches: redemptionBranches,
        },
        {
          onSuccess: async (response: any) => {
            console.log('response from create dash go', response)

            await addToCartAsync(
              {
                card_id: response.data.card.id,
                quantity: 1,
              },
              {
                onSuccess: async (response: any) => {
                  console.log('response from add to cart', response)
                  if (data.assign_to_self) {
                    await assignRecipientMutation.mutateAsync({
                      cart_item_id: response.data.cart_item_id,
                      assign_to_self: data.assign_to_self,
                      quantity: 1,
                      amount: data.recipient_card_amount,
                      message: data.recipient_message,
                    })
                  } else {
                    await assignRecipientMutation.mutateAsync({
                      cart_item_id: response.data.cart_item_id,
                      assign_to_self: data.assign_to_self,
                      quantity: 1,
                      amount: data.recipient_card_amount,
                      message: data.recipient_message,
                      name: data.recipient_name,
                      phone: data.recipient_phone,
                      email: data.recipient_email,
                    })
                  }
                  openCart()
                },
                onError: (error: any) => {
                  console.error('Failed to add card to cart:', error)
                },
              },
            )
          },

          onError: (error: any) => {
            console.error('Failed to create DashGo card:', error)
          },
        },
      )

      // Open cart on success
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Failed to create DashGo card:', error)
    }
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
                        src={DashgoBg}
                        alt={`DashGo background`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_1fr_auto] text-white">
                        <div className="p-4 text-2xl font-black tracking-[0.3em]">DashGo</div>
                        <div className="p-4 text-right text-2xl font-semibold">
                          {amount ? formatCurrency(amount.toString(), 'GHS') : 'GHS 0'}
                        </div>
                        <div className="p-4 text-lg font-semibold uppercase">
                          {assignToSelfFormValue
                            ? userProfileData?.fullname || 'Your Name'
                            : recipientName || 'Recipient Name'}
                        </div>
                        <div className="flex items-end justify-end p-4">
                          {amount && (assignToSelfFormValue || recipientName) && <QRPlaceholder />}
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
                            {message || 'Your personalized message will appear here...'}
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
          <section className="border-b border-gray-100 px-10 py-8 max-w-2xl grid gap-6">
            <div>
              <Text variant="h3" weight="semibold" className="text-[#212529]">
                Select Vendor
              </Text>
              <Text variant="span" weight="medium" className="text-gray-500">
                Choose the vendor for this DashGo gift card
              </Text>
            </div>
            <Controller
              control={control}
              name="vendor_id"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="Vendor"
                  options={vendors.map((vendor) => ({
                    label: vendor.name,
                    value: vendor.vendor_id,
                  }))}
                  value={field.value || undefined}
                  onChange={(e: any) => {
                    const value = e?.target?.value || e?.value
                    const numValue = value ? Number(value) : 0
                    field.onChange(numValue)
                    setSelectedVendorId(numValue > 0 ? numValue : null)
                  }}
                  error={error?.message}
                  placeholder="Select a vendor"
                />
              )}
            />
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
              type="number"
              register={register('recipient_card_amount', { valueAsNumber: true })}
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
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name {!assignToSelf && '*'}
                </label>
                <input
                  type="text"
                  {...register('recipient_name')}
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
                {errors.recipient_name && (
                  <p className="mt-1 text-xs text-red-500">{errors.recipient_name.message}</p>
                )}
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
                  {...register('recipient_phone')}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={assignToSelf ? 'Will use your account phone' : 'Enter phone number'}
                />
                {errors.recipient_phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.recipient_phone.message}</p>
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
                  {...register('recipient_email')}
                  disabled={assignToSelf}
                  className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
                    assignToSelf ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={assignToSelf ? 'Will use your account email' : 'Enter email address'}
                />
                {errors.recipient_email && (
                  <p className="mt-1 text-xs text-red-500">{errors.recipient_email.message}</p>
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
                  {...register('recipient_message')}
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
                      checked={assignToSelfFormValue}
                      onChange={handleAssignToSelf}
                      className="peer sr-only"
                    />
                    <span
                      className={`absolute inset-0 rounded-full transition ${
                        assignToSelfFormValue ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    />
                    <span
                      className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition ${
                        assignToSelfFormValue ? 'translate-x-5' : ''
                      }`}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    <Icon icon="bi:person-check" className="mr-2 inline size-4 text-primary-500" />
                    Assign to Self
                  </span>
                </label>
                <p className="text-xs text-gray-500">
                  {assignToSelfFormValue
                    ? userProfileData?.fullname
                      ? `Card will be assigned to ${userProfileData.fullname || 'your account'}. Name, email, and phone fields are auto-filled.`
                      : 'Card will be assigned to your account. Name, email, and phone fields will be ignored.'
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
              loading={createDashGoMutationAsync.isPending}
              disabled={
                createDashGoMutationAsync.isPending ||
                !watch('vendor_id') ||
                watch('vendor_id') === 0
              }
            >
              Create Customized DashGo Gift Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
