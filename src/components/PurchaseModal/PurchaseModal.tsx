import React from 'react'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { Text } from '../Text'
import { Icon } from '@/libs'
import DashProBG from '@/assets/svgs/dashpro_bg.svg'
import DashxBG from '@/assets/svgs/Dashx_bg.svg'
import DashPassBG from '@/assets/images/dashpass_bg.png'
import DashGoBG from '@/assets/svgs/dashgo_bg.svg'
import { useRecipients } from '@/features/dashboard/hooks'
import { Controller, useForm } from 'react-hook-form'
import { AssignRecipientSchema } from '@/utils/schemas/cards'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BasePhoneInput } from '../BasePhoneNumber/BasePhoneNumber'
import { Input } from '../Input'
import { GiftCardPriceFormField } from '../GiftCardPriceFormField'
import type { AssignRecipientPayload, GuestAssignRecipientPayload } from '@/types/responses'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { useAuthStore } from '@/stores'
import { EXAMPLE_PHONE_PLACEHOLDER, MODAL_NAMES, PURCHASE_WHATSAPP_HI_PROMPT } from '@/utils/constants'
import { getAssignToSelfContactPrefill } from '@/features/website/utils/assignToSelfContactPrefill'
import { formatPersonName, splitPersonName } from '@/utils/personName'

function resolveModalAmount(amount: number | null | undefined): number | undefined {
  if (amount == null || amount <= 0) return undefined
  return Math.round(Number(amount) * 100) / 100
}

export default function PurchaseModal() {
  const modal = usePersistedModalState<{
    cart_item_id: string | number
    cardType?: string
    cardProduct?: string
    cardCurrency?: string
    amount?: number
    recipient_id?: string | number
    recipient_name?: string
    recipient_phone?: string
    recipient_email?: string
    message?: string
    assign_to_self?: boolean
  }>({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })
  const [isCardFlipped, setIsCardFlipped] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [assignToSelf, setAssignToSelf] = React.useState(true)
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const user = useAuthStore((s) => s.user)
  const {
    useAssignRecipientService,
    useAssignGuestRecipientService,
    useUpdateGuestRecipientService,
  } = useRecipients()
  const assignRecipientMutation = useAssignRecipientService()
  const assignGuestRecipientMutation = useAssignGuestRecipientService()
  const updateGuestRecipientMutation = useUpdateGuestRecipientService()
  const isEditingGuestRecipient = Boolean(isGuestAuth && modal.modalData?.recipient_id)
  const activeMutation = isEditingGuestRecipient
    ? updateGuestRecipientMutation
    : isGuestAuth
      ? assignGuestRecipientMutation
      : assignRecipientMutation

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  // Get data from modal
  const modalData = modal.modalData
  const cardType = modalData?.cardType || 'dashpro'
  const cardProduct = modalData?.cardProduct || ''
  const cardCurrency = modalData?.cardCurrency || 'GHS'
  const initialAmount = resolveModalAmount(modalData?.amount)

  const form = useForm<z.infer<typeof AssignRecipientSchema>>({
    resolver: zodResolver(AssignRecipientSchema),
    defaultValues: {
      assign_to_self: true,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      message: '',
      amount: initialAmount as number | undefined,
    },
  })

  // Check if amount can be changed (only DashPro allows changing amount)
  const canChangeAmount = React.useMemo(() => {
    const normalizedType = cardType?.toLowerCase()
    return normalizedType === 'dashpro'
  }, [cardType])

  // Get card background based on type
  const getCardBackground = () => {
    const normalizedType = cardType?.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBG
      case 'dashpro':
        return DashProBG
      case 'dashpass':
        return DashPassBG
      case 'dashgo':
        return DashGoBG
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
      case 'dashpass':
        return 'DASHPASS'
      case 'dashgo':
        return 'DASHGO'
      default:
        return 'DASHPRO'
    }
  }

  const cardBackground = getCardBackground()
  const cardTypeName = getCardTypeName()
  const displayedCardAmount = form.watch('amount')
    ? `${cardCurrency} ${Number(form.watch('amount')).toLocaleString()}`
    : `${cardCurrency} 0`
  const recipientFirstName = form.watch('first_name')
  const recipientLastName = form.watch('last_name')
  const recipientName = formatPersonName(recipientFirstName ?? '', recipientLastName ?? '')
  const displayedCardRecipient = React.useMemo(() => {
    if (assignToSelf) {
      const contact = getAssignToSelfContactPrefill({
        isGuestAuth,
        user,
        userProfileData: userProfileData ?? null,
      })
      return contact.name || userProfileData?.fullname || 'Your Name'
    }
    return recipientName || 'Recipient Name'
  }, [assignToSelf, recipientName, isGuestAuth, user, userProfileData])
  const displayedCardMessage =
    form.watch('message') || 'Your personalized message will appear here...'

  const toggleCardFlip = () => {
    if (!isMobile) setIsCardFlipped((prev) => !prev)
  }

  const handleAssignToSelf = () => {
    const newValue = !assignToSelf
    setAssignToSelf(newValue)
    form.setValue('assign_to_self', newValue)

    if (newValue) {
      const contact = getAssignToSelfContactPrefill({
        isGuestAuth,
        user,
        userProfileData: userProfileData ?? null,
      })
      const { first_name, last_name } = splitPersonName(contact.name)
      form.setValue('first_name', first_name)
      form.setValue('last_name', last_name)
      form.setValue('email', contact.email)
      form.setValue('phone', contact.phone)
    } else {
      form.setValue('first_name', '')
      form.setValue('last_name', '')
      form.setValue('email', '')
      form.setValue('phone', '')
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
    if (modalData) {
      const editing = Boolean(modalData.recipient_id)
      const selfAssign = editing ? Boolean(modalData.assign_to_self) : assignToSelf
      if (editing) {
        setAssignToSelf(selfAssign)
      }
      form.setValue('assign_to_self', selfAssign)
      if (selfAssign) {
        const contact = getAssignToSelfContactPrefill({
          isGuestAuth,
          user,
          userProfileData: userProfileData ?? null,
        })
        const { first_name, last_name } = splitPersonName(contact.name)
        form.setValue('first_name', first_name)
        form.setValue('last_name', last_name)
        form.setValue('phone', contact.phone)
        form.setValue('email', contact.email)
        form.setValue('message', modalData.message ?? '')
        const amount = resolveModalAmount(modalData.amount ?? initialAmount)
        if (amount !== undefined) form.setValue('amount', amount)
        else form.resetField('amount')
      } else if (editing) {
        const { first_name, last_name } = splitPersonName(modalData.recipient_name ?? '')
        form.setValue('first_name', first_name)
        form.setValue('last_name', last_name)
        form.setValue('phone', modalData.recipient_phone ?? '')
        form.setValue('email', modalData.recipient_email ?? '')
        form.setValue('message', modalData.message ?? '')
        const amount = resolveModalAmount(modalData.amount ?? initialAmount)
        if (amount !== undefined) form.setValue('amount', amount)
        else form.resetField('amount')
      } else {
        form.setValue('first_name', '')
        form.setValue('last_name', '')
        form.setValue('phone', '')
        form.setValue('email', '')
        form.setValue('message', '')
      }
      if (!selfAssign && !editing) {
        const amount = resolveModalAmount(modalData.amount)
        if (amount !== undefined) form.setValue('amount', amount)
        else form.resetField('amount')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form intentionally omitted to avoid unnecessary re-runs
  }, [
    assignToSelf,
    isGuestAuth,
    modalData,
    user,
    userProfileData?.email,
    userProfileData?.fullname,
    userProfileData?.phonenumber,
  ])

  React.useEffect(() => {
    if (activeMutation.isSuccess) {
      modal.closeModal()
      form.reset()
      setAssignToSelf(true)
      activeMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form intentionally omitted to avoid unnecessary re-runs
  }, [activeMutation.isSuccess, activeMutation, modal])

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset()
    setAssignToSelf(true)
  }, [modal, form])

  const onSubmit = (data: z.infer<typeof AssignRecipientSchema>) => {
    const currentCartItemId = modal.modalData?.cart_item_id
    if (!currentCartItemId) {
      console.error('Cart item ID is required')
      return
    }

    const recipientFullName = formatPersonName(data.first_name ?? '', data.last_name ?? '')

    if (isGuestAuth) {
      const recipientId = modal.modalData?.recipient_id
      if (recipientId != null && recipientId !== '') {
        updateGuestRecipientMutation.mutate({
          recipient_id: recipientId,
          ...(!data.assign_to_self && recipientFullName
            ? { recipient_name: recipientFullName }
            : {}),
          ...(!data.assign_to_self && data.email?.trim()
            ? { recipient_email: data.email.trim() }
            : {}),
          ...(!data.assign_to_self && data.phone?.trim()
            ? { recipient_phone: data.phone.trim() }
            : {}),
          message: data.message || '',
        })
        return
      }
      const guestPayload: GuestAssignRecipientPayload = {
        cart_item_id: currentCartItemId,
        assign_to_self: data.assign_to_self,
        amount: data.amount,
        message: data.message || '',
        quantity: 1,
      }
      if (!data.assign_to_self) {
        if (recipientFullName) {
          guestPayload.recipient_name = recipientFullName
        }
        if (data.email && data.email.trim().length > 0) {
          guestPayload.recipient_email = data.email.trim()
        }
        if (data.phone && data.phone.trim().length > 0) {
          guestPayload.recipient_phone = data.phone.trim()
        }
      }
      assignGuestRecipientMutation.mutate(guestPayload)
      return
    }

    const payload: AssignRecipientPayload = {
      cart_item_id: currentCartItemId,
      assign_to_self: data.assign_to_self,
      quantity: 1,
      amount: data.amount,
      message: data.message || '',
    }

    if (!data.assign_to_self) {
      if (recipientFullName) {
        payload.name = recipientFullName
      }
      if (data.email && data.email.trim().length > 0) {
        payload.email = data.email.trim()
      }
      if (data.phone && data.phone.trim().length > 0) {
        payload.phone = data.phone.trim()
      }
    }

    assignRecipientMutation.mutate(payload)
  }

  return (
    <Modal
      showClose
      isOpen={modal.isModalOpen(MODAL_NAMES.RECIPIENT.ASSIGN)}
      setIsOpen={modal.closeModal}
      panelClass="!max-w-[900px] md:!w-full"
    >
      {/* Modal Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-[20px] border-b-2 border-[#ffc40033] bg-linear-to-br from-[#402d87] to-[#2d1a72] px-8 py-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-[#ffc400] to-[#f0b90b] text-primary-500 shadow-[0_4px_12px_#ffc4004d]">
            <Icon icon="bi:person-plus-fill" className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <Text as="h2" variant="h2" weight="bold" className="text-white">
              Add New Recipient
            </Text>
            <Text as="p" variant="span" weight="medium" className="text-white/80">
              Create and customize a personalized {cardProduct || cardTypeName} gift card recipient
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-[#ffc4004d] bg-[#ffc40033] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ffc400]">
          <Icon icon="bi:shield-check" className="size-4" />
          Secure
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
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
                      <div className="p-4 text-2xl font-black tracking-[0.3em]">{cardTypeName}</div>
                      <div className="p-4 text-right text-2xl font-semibold">
                        {displayedCardAmount}
                      </div>
                      <div className="p-4 text-lg font-semibold uppercase">
                        {displayedCardRecipient}
                      </div>
                      <div className="flex items-end justify-end p-4" />
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
                              1. {PURCHASE_WHATSAPP_HI_PROMPT}
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

        {/* Assign to self */}
        <section className="border-b border-gray-100 px-10 py-8">
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
              <GiftCardPriceFormField
                control={form.control}
                name="amount"
                label="Enter Amount"
                error={form.formState.errors.amount?.message}
                showRangeHint={false}
                placeholder="0.00"
                iconBefore={
                  <span className="font-semibold text-primary-500">{cardCurrency}</span>
                }
                className="[&_input]:rounded-lg [&_input]:border-gray-200 [&_input]:px-4 [&_input]:py-3 [&_input]:pl-16 [&_input]:text-lg [&_input]:font-semibold"
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => form.setValue('amount', value)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  First Name {!assignToSelf && '*'}
                </label>
                <Input
                  type="text"
                  {...form.register('first_name')}
                  error={form.formState.errors.first_name?.message}
                  disabled={assignToSelf}
                  placeholder={assignToSelf ? 'Will use your account information' : 'First name'}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Last Name {!assignToSelf && '*'}
                </label>
                <Input
                  type="text"
                  {...form.register('last_name')}
                  error={form.formState.errors.last_name?.message}
                  disabled={assignToSelf}
                  placeholder={assignToSelf ? 'Will use your account information' : 'Last name'}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone Number
                {!assignToSelf && (
                  <span className="text-gray-400 font-normal"> (optional)</span>
                )}
              </label>
              <Controller
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <BasePhoneInput
                    selectedVal={field.value || ''}
                    handleChange={field.onChange}
                    disabled={assignToSelf}
                    placeholder={
                      assignToSelf ? 'Will use your account phone' : EXAMPLE_PHONE_PLACEHOLDER
                    }
                    error={form.formState.errors.phone?.message}
                  />
                )}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
                {!assignToSelf && (
                  <span className="text-gray-400 font-normal"> (optional)</span>
                )}
              </label>
              <Input
                type="email"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
                disabled={assignToSelf}
                placeholder={assignToSelf ? 'Will use your account email' : 'Enter email address'}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Personal Message *
              </label>
              <Input
                type="textarea"
                innerClassName="!h-auto min-h-[200px]"
                inputClassName="resize-none"
                {...form.register('message')}
                error={form.formState.errors.message?.message}
                placeholder="Write a personal message for the recipient..."
                isRequired
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-[#f8f9fa] px-10 py-6 md:flex-row md:justify-end">
          <Button type="button" variant="outline" onClick={handleCloseModal} className="md:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            loading={form.formState.isSubmitting || activeMutation.isPending}
            className="md:w-auto"
          >
            Save Recipient
          </Button>
        </div>
      </form>
    </Modal>
  )
}
