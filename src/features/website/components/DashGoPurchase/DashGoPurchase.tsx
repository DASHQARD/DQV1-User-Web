import React from 'react'
import { Button, Input, Text, Combobox } from '@/components'
import { Icon } from '@/libs'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCurrency } from '@/utils/format'
import { DashGoPurchaseFormSchema } from '@/utils/schemas'
import { usePublicCatalogQueries } from '../../hooks/website/usePublicCatalogQueries'
import { usePublicCatalogMutations } from '../../hooks/website/usePublicCatalogMutations'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'
import { userProfile } from '@/hooks'
import { useCartStore } from '@/stores/cart'

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
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { useCreateDashGoAndAssignService } = usePublicCatalogMutations()
  const { useGetBranchesByVendorIdService } = vendorQueries()
  const { data: vendorsResponse } = usePublicVendorsService({ limit: 100 })
  const { openCart } = useCartStore()
  const createDashGoMutationAsync = useCreateDashGoAndAssignService()

  // Get user details
  const userDetails = React.useMemo(() => {
    if (!userProfileData) return null
    return {
      name: userProfileData?.fullname || '',
      phone: userProfileData?.phonenumber || '',
      email: userProfileData?.email || '',
    }
  }, [userProfileData])

  // Extract vendors from response
  const vendors = React.useMemo(() => {
    if (!vendorsResponse) return []
    const vendorsData = Array.isArray(vendorsResponse) ? vendorsResponse : [vendorsResponse]
    return vendorsData.map((vendor: any) => ({
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

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof DashGoPurchaseFormSchema>>({
    resolver: zodResolver(DashGoPurchaseFormSchema),
    defaultValues: {
      assign_to_self: true,
      vendor_id: 0,
      recipient_name: '',
      recipient_phone: '',
      recipient_email: '',
      recipient_message: 'Your personalized message will appear here...',
      recipient_card_amount: 100,
      recipient_card_currency: 'GHS',
      recipient_card_issue_date: new Date().toISOString().split('T')[0],
      recipient_card_expiry_date: '',
      recipient_card_images: [],
    },
  })

  // Watch form values for card preview
  const amount = useWatch({ control, name: 'recipient_card_amount' })
  const recipientName = useWatch({ control, name: 'recipient_name' })
  const message = useWatch({ control, name: 'recipient_message' })
  const assignToSelfFormValue = useWatch({ control, name: 'assign_to_self' })
  const vendorId = useWatch({ control, name: 'vendor_id' })

  // Update selected vendor ID when form value changes
  React.useEffect(() => {
    if (vendorId && vendorId > 0) {
      setSelectedVendorId(vendorId)
    }
  }, [vendorId])

  // Populate user details when assign to self is checked
  React.useEffect(() => {
    if (assignToSelfFormValue && userDetails) {
      setValue('recipient_name', userDetails.name)
      setValue('recipient_phone', userDetails.phone)
      setValue('recipient_email', userDetails.email)
    } else if (!assignToSelfFormValue) {
      // Clear fields when assign to self is unchecked
      setValue('recipient_name', '')
      setValue('recipient_phone', '')
      setValue('recipient_email', '')
    }
  }, [assignToSelfFormValue, userDetails, setValue])

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleCardFlip = () => {
    if (!isMobile) setIsCardFlipped((prev) => !prev)
  }

  const handleAssignToSelf = () => {
    const currentValue = watch('assign_to_self')
    const newValue = !currentValue
    setValue('assign_to_self', newValue)
  }

  const onSubmit = async (data: z.infer<typeof DashGoPurchaseFormSchema>) => {
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
      await createDashGoMutationAsync.mutateAsync({
        vendor_id: data.vendor_id,
        product: 'DashGo Gift Card',
        description: `Custom DashGo card for ${vendorName}`,
        price: data.recipient_card_amount,
        currency: data.recipient_card_currency || 'GHS',
        issue_date: issueDate,
        redemption_branches: redemptionBranches,
      })
      // Open cart on success
      openCart()
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
                            ? userDetails?.name || 'Your Name'
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
                    ? userDetails
                      ? `Card will be assigned to ${userDetails.name || 'your account'}. Name, email, and phone fields are auto-filled.`
                      : 'Card will be assigned to your account. Name, email, and phone fields will be ignored.'
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
              <Input
                label="Full Name"
                type="text"
                register={register('recipient_name')}
                error={errors.recipient_name?.message}
                placeholder={
                  assignToSelfFormValue
                    ? userDetails?.name || 'Your name'
                    : "Enter recipient's full name"
                }
                disabled={assignToSelfFormValue}
              />

              <Input
                label="Phone Number"
                type="tel"
                register={register('recipient_phone')}
                error={errors.recipient_phone?.message}
                placeholder={
                  assignToSelfFormValue
                    ? userDetails?.phone || 'Your phone number'
                    : 'Enter phone number'
                }
                disabled={assignToSelfFormValue}
              />

              <Input
                label="Email Address"
                type="email"
                register={register('recipient_email')}
                error={errors.recipient_email?.message}
                placeholder={
                  assignToSelfFormValue
                    ? userDetails?.email || 'Your email address'
                    : 'Enter email address'
                }
                disabled={assignToSelfFormValue}
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
