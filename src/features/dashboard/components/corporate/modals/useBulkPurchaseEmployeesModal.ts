import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { assignCardToRecipients } from '@/features/dashboard/corporate/services'
import { usePersistedModalState, useToast } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { corporateMutations, corporateQueries } from '@/features/dashboard/corporate/hooks'
import type { RecipientRow } from '@/types'
import type { CardRecipientAssignment } from '@/types/corporate/recipients'
import type { DropdownOption } from '@/types'
import {
  countVendorBranches,
  getVendorCardsFromBranches,
} from '@/features/dashboard/corporate/utils/vendorCardsFromBranches'
import {
  isGiftCardAmountSubmittable,
  resolveGiftCardAmount,
} from '@/utils/giftCardAmount'

const STEP_CHOICE = 0
const INITIAL_STEP_UPLOAD = 1
const STEP_SELECT_CARDS = 2

function normalizeRecipient(r: any): RecipientRow {
  const name = r.name ?? ([r.first_name, r.last_name].filter(Boolean).join(' ') || 'Unknown')
  return {
    id: r.id,
    name,
    email: r.email ?? '',
    phone: r.phone ?? '',
    message: r.message,
  }
}

function normalizeRecipients(data: any[] | undefined): RecipientRow[] {
  if (!Array.isArray(data)) return []
  return data.map(normalizeRecipient).filter((r) => r.id != null)
}

export function useBulkPurchaseEmployeesModal() {
  const queryClient = useQueryClient()
  const { error: toastError } = useToast()
  const navigate = useNavigate()
  const modal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  const isOpen = modal.isModalOpen(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)

  const [step, setStep] = useState(INITIAL_STEP_UPLOAD)
  const [file, setFile] = useState<File | null>(null)
  const [choiceMade, setChoiceMade] = useState<'replace' | 'add' | null>(null)
  const [uploadedRecipients, setUploadedRecipients] = useState<RecipientRow[]>([])
  const [selectedVendorId, setSelectedVendorId] = useState<string>('')
  const [selectedCardId, setSelectedCardId] = useState<number | string | null>(null)
  const [isSavingToCart, setIsSavingToCart] = useState(false)
  const [selectedCardType, setSelectedCardType] = useState<'dashgo' | 'dashpro' | 'card' | null>(
    null,
  )
  const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set())
  const [cardRecipientAssignments, setCardRecipientAssignments] = useState<
    Record<string, CardRecipientAssignment>
  >({})
  const [dashGoAmount, setDashGoAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'vendors' | 'dashpro'>('vendors')

  const {
    useGetAllRecipientsService,
    useGetAllVendorsManagementService,
    useGetCartsService,
  } = corporateQueries()

  const {
    useUploadBulkRecipientsService,
    useDeleteUnassignedBulkRecipientsService,
    useCreateDashGoAndAssignService,
    useCreateDashProAndAssignService,
  } = corporateMutations()

  const { data: existingRecipientsResponse, isLoading: existingRecipientsLoading } =
    useGetAllRecipientsService({ limit: 100 })
  const existingRecipientsList = useMemo(() => {
    const raw = existingRecipientsResponse?.data
    const arr = Array.isArray(raw) ? raw : (existingRecipientsResponse as any)?.data?.data
    return normalizeRecipients(Array.isArray(arr) ? arr : undefined)
  }, [existingRecipientsResponse])
  const hasExistingRecipients = isOpen && existingRecipientsList.length > 0

  const { data: vendorsResponse, isLoading: isLoadingVendors } = useGetAllVendorsManagementService({
    limit: 500,
  })
  const vendorList = useMemo(() => {
    if (!vendorsResponse) return []
    return Array.isArray(vendorsResponse?.data) ? vendorsResponse.data : []
  }, [vendorsResponse])
  const vendorOptions: DropdownOption[] = useMemo(
    () =>
      vendorList.map((v: any) => ({
        value: String(v.vendor_id ?? v.id ?? ''),
        label: v.business_name || v.vendor_name || 'Unknown Vendor',
      })),
    [vendorList],
  )

  const selectedVendorRecord = useMemo(
    () => vendorList.find((x: any) => String(x.vendor_id ?? x.id) === selectedVendorId),
    [vendorList, selectedVendorId],
  )
  const selectedVendor = selectedVendorId ? selectedVendorId : null
  const selectedVendorName = useMemo(() => {
    return selectedVendorRecord?.business_name || selectedVendorRecord?.vendor_name || ''
  }, [selectedVendorRecord])
  const selectedVendorLogo = useMemo(() => {
    const record = selectedVendorRecord as
      | { logo?: string; logo_key?: string; vendor_logo?: string; business_logo?: string }
      | undefined
    if (!record) return null
    return {
      logo: record.logo ?? null,
      logo_key: record.logo_key ?? null,
      vendor_logo: record.vendor_logo ?? null,
      business_logo: record.business_logo ?? null,
    }
  }, [selectedVendorRecord])
  const selectedVendorBranchCount = useMemo(
    () => countVendorBranches(selectedVendorRecord),
    [selectedVendorRecord],
  )
  const vendorCards = useMemo(
    () => getVendorCardsFromBranches(selectedVendorRecord),
    [selectedVendorRecord],
  )

  const { data: cartsResponse } = useGetCartsService()
  const existingCartItems = useMemo(() => {
    const items = cartsResponse?.data ?? []
    return Array.isArray(items) ? items : []
  }, [cartsResponse?.data])
  const hasExistingCartItems = existingCartItems.length > 0
  const cartId = useMemo(() => {
    const first = existingCartItems[0]
    return first?.cart_id ?? first?.id ?? null
  }, [existingCartItems])

  const uploadMutation = useUploadBulkRecipientsService()
  const deleteUnassignedBulkMutation = useDeleteUnassignedBulkRecipientsService()
  const createDashGoMutation = useCreateDashGoAndAssignService()
  const createDashProMutation = useCreateDashProAndAssignService()
  const handleClose = useCallback(() => {
    setStep(INITIAL_STEP_UPLOAD)
    setFile(null)
    setChoiceMade(null)
    setUploadedRecipients([])
    setSelectedVendorId('')
    setSelectedCardId(null)
    setSelectedCardType(null)
    setSelectedRecipients(new Set())
    setCardRecipientAssignments({})
    setDashGoAmount('')
    setActiveTab('vendors')
    modal.closeModal()
  }, [modal])

  const handleCloseAndNavigate = useCallback(
    (path: string) => {
      handleClose()
      navigate(path)
    },
    [handleClose, navigate],
  )

  const handleReplaceAll = useCallback(() => {
    deleteUnassignedBulkMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
        setChoiceMade('replace')
        setUploadedRecipients([])
        setStep(INITIAL_STEP_UPLOAD)
      },
    })
  }, [deleteUnassignedBulkMutation, queryClient])

  const handleAddToRecipients = useCallback(() => {
    setChoiceMade('add')
    setUploadedRecipients(existingRecipientsList)
    setStep(INITIAL_STEP_UPLOAD)
  }, [existingRecipientsList])

  const handleProceedToSelectCards = useCallback(() => {
    setStep(STEP_SELECT_CARDS)
  }, [])

  const handleUpload = useCallback(() => {
    if (!file) return
    uploadMutation.mutate(file, {
      onSuccess: (response: any) => {
        const newRecipients = normalizeRecipients(response?.data ?? response)
        if (choiceMade === 'add') {
          setUploadedRecipients((prev) => [...prev, ...newRecipients])
        } else {
          setUploadedRecipients(newRecipients)
        }
        setStep(STEP_SELECT_CARDS)
        setFile(null)
      },
    })
  }, [file, choiceMade, uploadMutation])

  const handleVendorSelect = useCallback((vendorId: string) => {
    setSelectedVendorId(vendorId)
    setSelectedCardId(null)
    setSelectedCardType(null)
  }, [])

  const handleClearVendor = useCallback(() => {
    setSelectedVendorId('')
    setSelectedCardId(null)
    setSelectedCardType(null)
  }, [])

  const handleBackToVendors = useCallback(() => {
    setSelectedVendorId('')
    setSelectedCardId(null)
    setSelectedCardType(null)
  }, [])

  const handleCardSelect = useCallback(
    (cardId: number | string, type: 'dashgo' | 'dashpro' | 'card') => {
      setSelectedCardId(cardId)
      setSelectedCardType(type)
    },
    [],
  )

  const handleDashGoSelect = useCallback(() => {
    setSelectedCardType('dashgo')
    setSelectedCardId(null)
  }, [])

  const handleDashProSelect = useCallback(() => {
    setSelectedCardType('dashpro')
    setSelectedCardId(null)
  }, [])

  const handleToggleRecipient = useCallback((id: number) => {
    setSelectedRecipients((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAllRecipients = useCallback(() => {
    const withIds = uploadedRecipients.filter((r) => r.id != null)
    const ids = new Set(withIds.map((r) => r.id!))
    if (ids.size === selectedRecipients.size) {
      setSelectedRecipients(new Set())
    } else {
      setSelectedRecipients(ids)
    }
  }, [uploadedRecipients, selectedRecipients.size])

  const handleSaveCardAssignment = useCallback(() => {
    const recipientIds = Array.from(selectedRecipients)
    if (recipientIds.length === 0) return

    const vendorId = selectedVendorId || undefined
    const amount = resolveGiftCardAmount(dashGoAmount)

    if (selectedCardType === 'dashgo' && vendorId && isGiftCardAmountSubmittable(dashGoAmount)) {
      createDashGoMutation.mutate(
        {
          recipient_ids: recipientIds,
          vendor_id: vendorId,
          product: 'DashGo',
          description: 'DashGo gift card',
          price: amount,
          currency: 'GHS',
          issue_date: new Date().toISOString().split('T')[0],
          redemption_branches: [],
        },
        {
          onSuccess: () => {
            const key = `dashgo-${vendorId}-${amount}`
            setCardRecipientAssignments((prev) => ({
              ...prev,
              [key]: {
                recipientIds,
                cardType: 'dashgo',
                vendorId,
                dashGoAmount: amount,
                cardName: 'DashGo',
                cardPrice: amount,
                cardCurrency: 'GHS',
              },
            }))
            setSelectedRecipients(new Set())
          },
        },
      )
      return
    }

    if (selectedCardType === 'dashpro' && isGiftCardAmountSubmittable(dashGoAmount)) {
      createDashProMutation.mutate(
        {
          recipient_ids: recipientIds,
          product: 'DashPro',
          description: 'DashPro gift card',
          price: amount,
          currency: 'GHS',
          issue_date: new Date().toISOString().split('T')[0],
        },
        {
          onSuccess: () => {
            const key = `dashpro-${amount}`
            setCardRecipientAssignments((prev) => ({
              ...prev,
              [key]: {
                recipientIds,
                cardType: 'dashpro',
                dashGoAmount: amount,
                cardName: 'DashPro',
                cardPrice: amount,
                cardCurrency: 'GHS',
              },
            }))
            setSelectedRecipients(new Set())
          },
        },
      )
      return
    }

    if (selectedCardType === 'card' && selectedCardId != null) {
      const card = vendorCards.find((c) => String(c.card_id) === String(selectedCardId))
      if (!card) return
      const key = `card-${selectedCardId}`
      setCardRecipientAssignments((prev) => ({
        ...prev,
        [key]: {
          recipientIds,
          cardId: selectedCardId,
          cardType: 'card',
          cardName: card.product ?? 'Card',
          cardPrice: Number(card.price) || 0,
          cardCurrency: card.currency ?? 'GHS',
        },
      }))
      setSelectedRecipients(new Set())
    }
  }, [
    selectedRecipients,
    selectedVendorId,
    selectedCardType,
    selectedCardId,
    dashGoAmount,
    vendorCards,
    createDashGoMutation,
    createDashProMutation,
  ])

  const handleSaveToCart = useCallback(async () => {
    const assignments = Object.values(cardRecipientAssignments)
    if (assignments.length === 0) return

    const cardAssignments = assignments.filter(
      (a) => a.cardType === 'card' && a.cardId != null && a.recipientIds.length > 0,
    )
    // DashGo / DashPro are persisted when the user clicks Quick Assign
    if (cardAssignments.length === 0) return

    setIsSavingToCart(true)
    try {
      for (const a of cardAssignments) {
        await assignCardToRecipients({
          card_id: a.cardId!,
          recipient_ids: a.recipientIds,
        })
      }
      await queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      await queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
      await queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Failed to save assignments to cart. Please try again.'
      toastError(message)
      throw err
    } finally {
      setIsSavingToCart(false)
    }
  }, [cardRecipientAssignments, queryClient, toastError])

  const downloadTemplate = useCallback((url: string) => {
    window.open(url, '_blank')
  }, [])

  const effectiveStep = useMemo(() => {
    if (isOpen && hasExistingRecipients && choiceMade === null) return STEP_CHOICE
    return step
  }, [isOpen, hasExistingRecipients, choiceMade, step])

  return {
    modal,
    step: effectiveStep,
    setStep,
    file,
    setFile,
    uploadedRecipients,
    selectedVendor,
    selectedVendorId,
    selectedCardId,
    selectedCardType,
    selectedRecipients,
    cardRecipientAssignments,
    setCardRecipientAssignments,
    dashGoAmount,
    setDashGoAmount,
    activeTab,
    setActiveTab,
    cartId,
    existingCartItems,
    hasExistingCartItems,
    vendorOptions,
    selectedVendorName,
    selectedVendorLogo,
    selectedVendorBranchCount,
    vendorCards,
    isLoadingVendors,
    downloadTemplate,
    handleUpload,
    handleToggleRecipient,
    handleSelectAllRecipients,
    handleVendorSelect,
    handleClearVendor,
    handleBackToVendors,
    handleCardSelect,
    handleDashGoSelect,
    handleDashProSelect,
    handleSaveCardAssignment,
    handleSaveToCart,
    handleClose,
    handleCloseAndNavigate,
    uploadMutation,
    createDashGoMutation,
    createDashProMutation,
    isSavingToCart,
    hasExistingRecipients,
    existingRecipientsList,
    existingRecipientsLoading,
    choiceMade,
    handleReplaceAll,
    handleAddToRecipients,
    handleProceedToSelectCards,
    deleteUnassignedBulkMutation,
  }
}
