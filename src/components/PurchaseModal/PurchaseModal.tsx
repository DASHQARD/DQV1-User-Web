import React from 'react'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { useRecipients } from '@/features/dashboard/hooks'
import { useForm } from 'react-hook-form'
import { AssignRecipientSchema } from '@/utils/schemas/cards'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AssignRecipientPayload, GuestAssignRecipientPayload } from '@/types/responses'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { useAuthStore } from '@/stores'
import { MODAL_NAMES } from '@/utils/constants'
import { getAssignToSelfContactPrefill } from '@/features/website/utils/assignToSelfContactPrefill'
import { formatPersonName, splitPersonName } from '@/utils/personName'
import { isLocalGuestCartLineId } from '@/stores/guestLocalCart'
import {
  AssignToSelfToggle,
  GiftCardAmountSection,
  GiftCardFlipPreview,
  GiftCardRecipientFields,
  GiftCardRecipientFormActions,
  GiftCardRecipientFormHeader,
  getAssignToSelfDescription,
  getGiftCardBackground,
  getGiftCardTypeName,
  useAssignToSelfToggle,
  useCardFlipPreview,
} from '@/components/GiftCardRecipientForm'

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
    quantity_index?: number
    local_draft_id?: string
  }>({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const cartItemId = modal.modalData?.cart_item_id
  const isLocalGuestAssign =
    (!isAuthenticated && !isGuestAuth) || isLocalGuestCartLineId(cartItemId)
  const user = useAuthStore((s) => s.user)
  const {
    useAssignRecipientService,
    useAssignGuestRecipientService,
    useUpdateGuestRecipientService,
  } = useRecipients()
  const assignRecipientMutation = useAssignRecipientService()
  const assignGuestRecipientMutation = useAssignGuestRecipientService()
  const updateGuestRecipientMutation = useUpdateGuestRecipientService()
  const isEditingGuestRecipient = Boolean(
    isGuestAuth && !isLocalGuestAssign && modal.modalData?.recipient_id,
  )
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
      assign_to_self: !isLocalGuestAssign,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      message: '',
      amount: initialAmount as number | undefined,
    },
  })

  const {
    assignToSelf,
    setAssignToSelf,
    usesAccountAssignToSelf,
    handleAssignToSelf,
    applyContactPrefill,
    syncAssignToSelf,
  } = useAssignToSelfToggle({
    setValue: form.setValue,
    isGuestAuth,
    isLocalGuest: isLocalGuestAssign,
    user,
    userProfileData: userProfileData ?? null,
    initialAssignToSelf: !isLocalGuestAssign,
  })

  const { isCardFlipped, isMobile, toggleCardFlip } = useCardFlipPreview()

  const canChangeAmount = React.useMemo(() => {
    const normalizedType = cardType?.toLowerCase()
    return normalizedType === 'dashpro'
  }, [cardType])

  const cardBackground = getGiftCardBackground(cardType)
  const cardTypeName = getGiftCardTypeName(cardType)
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
        isLocalGuest: isLocalGuestAssign,
        user,
        userProfileData: userProfileData ?? null,
      })
      return contact.name || userProfileData?.fullname || 'Your Name'
    }
    return recipientName || 'Recipient Name'
  }, [assignToSelf, recipientName, isGuestAuth, isLocalGuestAssign, user, userProfileData])
  const displayedCardMessage =
    form.watch('message') || 'Your personalized message will appear here...'

  const quickAmounts = [100, 500, 1000, 5000]
  const amountSessionKeyRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!modalData) {
      amountSessionKeyRef.current = null
      return
    }

    const editing = Boolean(modalData.recipient_id || modalData.local_draft_id)
    const selfAssign = editing ? Boolean(modalData.assign_to_self) : !isLocalGuestAssign
    syncAssignToSelf(selfAssign)
    if (selfAssign) {
      applyContactPrefill()
      form.setValue('message', modalData.message ?? '')
    } else if (editing) {
      const { first_name, last_name } = splitPersonName(modalData.recipient_name ?? '')
      form.setValue('first_name', first_name)
      form.setValue('last_name', last_name)
      form.setValue('phone', modalData.recipient_phone ?? '')
      form.setValue('email', modalData.recipient_email ?? '')
      form.setValue('message', modalData.message ?? '')
    } else {
      form.setValue('first_name', '')
      form.setValue('last_name', '')
      form.setValue('phone', '')
      form.setValue('email', '')
      form.setValue('message', '')
    }

    const sessionKey = [
      modalData.cart_item_id,
      modalData.quantity_index ?? '',
      modalData.recipient_id ?? '',
      modalData.local_draft_id ?? '',
    ].join(':')

    if (amountSessionKeyRef.current !== sessionKey) {
      amountSessionKeyRef.current = sessionKey
      const amount = resolveModalAmount(
        selfAssign || editing ? (modalData.amount ?? initialAmount) : modalData.amount,
      )
      if (amount !== undefined) form.setValue('amount', amount)
      else form.resetField('amount')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form intentionally omitted; do not depend on assignToSelf (would reset toggle)
  }, [
    isGuestAuth,
    isLocalGuestAssign,
    modalData,
    user,
    userProfileData?.email,
    userProfileData?.fullname,
    userProfileData?.phonenumber,
    initialAmount,
    applyContactPrefill,
    syncAssignToSelf,
  ])

  React.useEffect(() => {
    if (activeMutation.isSuccess) {
      modal.closeModal()
      form.reset()
      setAssignToSelf(!isLocalGuestAssign)
      activeMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form intentionally omitted to avoid unnecessary re-runs
  }, [activeMutation.isSuccess, activeMutation, modal])

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset()
    setAssignToSelf(!isLocalGuestAssign)
  }, [modal, form, isLocalGuestAssign])

  const onSubmit = (data: z.infer<typeof AssignRecipientSchema>) => {
    const currentCartItemId = modal.modalData?.cart_item_id
    if (!currentCartItemId) {
      console.error('Cart item ID is required')
      return
    }

    const recipientFullName = formatPersonName(data.first_name ?? '', data.last_name ?? '')

    if (isLocalGuestAssign) {
      return
    }

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
      panelClass="!w-full !max-w-[900px] max-md:!max-w-[calc(100vw-0.5rem)] max-md:!my-2 max-md:max-h-[calc(100dvh-0.5rem)] overflow-x-hidden overflow-y-auto"
    >
      <GiftCardRecipientFormHeader
        title="Recipient details"
        subtitle={`Who receives this ${cardProduct || cardTypeName} gift card. Turn on Assign to Self if it is for you — otherwise enter their name, phone, email, and an optional message.`}
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-w-0 flex-col overflow-x-hidden">
        <GiftCardFlipPreview
          cardTypeName={cardTypeName}
          backgroundImage={cardBackground}
          displayAmount={displayedCardAmount}
          displayRecipient={displayedCardRecipient}
          displayMessage={displayedCardMessage}
          isCardFlipped={isCardFlipped}
          isMobile={isMobile}
          onToggleFlip={toggleCardFlip}
        />

        <AssignToSelfToggle
          checked={assignToSelf}
          onChange={handleAssignToSelf}
          description={getAssignToSelfDescription({
            assignToSelf,
            isLocalGuest: isLocalGuestAssign,
            isGuestAuth: isGuestAuth && !isLocalGuestAssign,
          })}
        />

        {canChangeAmount ? (
          <GiftCardAmountSection
            control={form.control}
            name="amount"
            currency={cardCurrency}
            error={form.formState.errors.amount?.message}
            quickAmounts={quickAmounts}
            onQuickAmount={(value) => form.setValue('amount', value)}
          />
        ) : null}

        <GiftCardRecipientFields
          control={form.control}
          register={form.register}
          errors={form.formState.errors}
          assignToSelf={assignToSelf}
          usesAccountAssignToSelf={usesAccountAssignToSelf}
          isLocalGuest={isLocalGuestAssign}
          isGuestAuth={isGuestAuth && !isLocalGuestAssign}
          variant="design-system"
        />

        <GiftCardRecipientFormActions>
          <Button type="button" variant="outline" onClick={handleCloseModal} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            loading={form.formState.isSubmitting || activeMutation.isPending}
            className="w-full sm:w-auto"
          >
            Save Recipient
          </Button>
        </GiftCardRecipientFormActions>
      </form>
    </Modal>
  )
}
