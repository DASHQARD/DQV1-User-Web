import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePersistedModalState, useToast, useDebouncedState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { corporateQueries, corporateMutations } from '@/features/dashboard/corporate/hooks'
import { getCarts } from '@/features/dashboard/corporate/services'
import { useQueryClient } from '@tanstack/react-query'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import type {
  CardRecipientAssignment,
  DropdownOption,
  PublicVendorWithCards,
  RecipientRow,
} from '@/types'

export function useBulkPurchaseEmployeesModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })
  const [step, setStep] = React.useState(1)
  const [file, setFile] = React.useState<File | null>(null)
  const [uploadedRecipients, setUploadedRecipients] = React.useState<RecipientRow[]>([])
  const [selectedVendor, setSelectedVendor] = React.useState<number | null>(null)
  const [selectedCardId, setSelectedCardId] = React.useState<number | null>(null)
  const [selectedCardType, setSelectedCardType] = React.useState<string | null>(null)
  const [selectedRecipients, setSelectedRecipients] = React.useState<Set<number>>(new Set())
  const [cardRecipientAssignments, setCardRecipientAssignments] = React.useState<
    Record<string, CardRecipientAssignment>
  >({})
  const [dashGoAmount, setDashGoAmount] = React.useState<string>('')
  const [vendorSearch, setVendorSearch] = React.useState('')
  const [selectedVendorId, setSelectedVendorId] = React.useState<string>('')
  const [activeTab, setActiveTab] = React.useState<'vendors' | 'dashpro'>('vendors')
  const [cartId, setCartId] = React.useState<number | null>(null)
  const toast = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const {
    useUploadBulkRecipientsService,
    useAssignCardToRecipientsService,
    useCreateDashGoAndAssignService,
    useCreateDashProAndAssignService,
    useAddToCartService,
  } = corporateMutations()
  const { useGetCartsService, useGetAllRecipientsService } = corporateQueries()

  const uploadMutation = useUploadBulkRecipientsService()
  const assignCardToRecipientsMutation = useAssignCardToRecipientsService()
  const createDashGoMutation = useCreateDashGoAndAssignService()
  const createDashProMutation = useCreateDashProAndAssignService()
  const addToCartMutation = useAddToCartService()

  const { value: debouncedVendorSearch } = useDebouncedState({
    initialValue: vendorSearch,
    onChange: setVendorSearch,
    debounceTime: 500,
  })

  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { data: vendorsResponse, isLoading: isLoadingVendors } = usePublicVendorsService(
    debouncedVendorSearch ? { search: debouncedVendorSearch, limit: 20 } : undefined,
  )

  const { data: cartsResponse } = useGetCartsService()
  const { refetch: refetchRecipients } = useGetAllRecipientsService()

  const existingCartItems = React.useMemo(() => {
    const cartsData = cartsResponse?.data || []
    if (!Array.isArray(cartsData) || cartsData.length === 0) return []
    return cartsData
  }, [cartsResponse])

  const hasExistingCartItems = existingCartItems.length > 0

  const vendors = React.useMemo((): PublicVendorWithCards[] => {
    if (!vendorsResponse) return []
    if (Array.isArray(vendorsResponse)) {
      return (vendorsResponse as PublicVendorWithCards[]).filter((vendor) =>
        Boolean(vendor.branches_with_cards?.length),
      )
    }
    if (vendorsResponse && typeof vendorsResponse === 'object' && 'data' in vendorsResponse) {
      return (
        (vendorsResponse as { data?: PublicVendorWithCards[] }).data?.filter((vendor) =>
          Boolean(vendor.branches_with_cards?.length),
        ) || []
      )
    }
    return []
  }, [vendorsResponse])

  const vendorOptions: DropdownOption[] = React.useMemo(() => {
    return vendors.map((vendor) => ({
      label: vendor.business_name || vendor.vendor_name || 'Unknown Vendor',
      value: vendor.vendor_id?.toString() || '',
    }))
  }, [vendors])

  const vendorsDataMap = React.useMemo(() => {
    const map = new Map<number, PublicVendorWithCards>()
    vendors.forEach((vendor) => {
      if (vendor.vendor_id) map.set(vendor.vendor_id, vendor)
    })
    return map
  }, [vendors])

  const selectedVendorData = React.useMemo(() => {
    if (!selectedVendor) return null
    return vendors.find((v) => v.vendor_id === selectedVendor) || null
  }, [selectedVendor, vendors])

  const allCards = React.useMemo(() => {
    const cardsFromVendors: Array<Record<string, unknown>> = []
    vendors.forEach((vendor: Record<string, unknown>) => {
      const vendorName =
        (vendor.business_name as string) || (vendor.vendor_name as string) || 'Unknown Vendor'
      if (vendor.vendor_cards && Array.isArray(vendor.vendor_cards)) {
        ;(vendor.vendor_cards as Record<string, unknown>[]).forEach(
          (card: Record<string, unknown>) => {
            cardsFromVendors.push({
              card_id: card.card_id ?? card.id,
              product: card.product ?? card.card_name,
              vendor_name: vendorName,
              vendor_id: vendor.vendor_id,
              rating: card.rating ?? 0,
              price: card.price ?? card.card_price,
              currency: card.currency ?? 'GHS',
              type: card.type ?? card.card_type,
              description: card.card_description ?? card.description ?? '',
              expiry_date: card.expiry_date ?? '',
              terms_and_conditions: card.terms_and_conditions ?? [],
              images: card.images ?? [],
              issue_date: card.issue_date ?? '',
              status: card.status ?? card.card_status ?? 'active',
            })
          },
        )
      }
      if (vendor.branches_with_cards && Array.isArray(vendor.branches_with_cards)) {
        ;(vendor.branches_with_cards as Record<string, unknown>[]).forEach(
          (branch: Record<string, unknown>) => {
            if (branch.cards && Array.isArray(branch.cards)) {
              ;(branch.cards as Record<string, unknown>[]).forEach(
                (card: Record<string, unknown>) => {
                  cardsFromVendors.push({
                    card_id: card.card_id ?? card.id,
                    product: card.card_name ?? card.product,
                    vendor_name: (branch.branch_name as string) ?? vendorName,
                    branch_name: branch.branch_name ?? '',
                    branch_location: branch.branch_location ?? '',
                    vendor_id: vendor.vendor_id,
                    rating: 0,
                    price: card.card_price ?? card.price,
                    currency: card.currency ?? 'GHS',
                    type: card.card_type ?? card.type,
                    description: card.card_description ?? card.description ?? '',
                    expiry_date: card.expiry_date ?? '',
                    terms_and_conditions: card.terms_and_conditions ?? [],
                    images: card.images ?? [],
                    issue_date: card.issue_date ?? '',
                    status: card.card_status ?? card.status ?? 'active',
                  })
                },
              )
            }
          },
        )
      }
    })
    const allCardsMap = new Map<unknown, Record<string, unknown>>()
    cardsFromVendors.forEach((card) => {
      const id = card.card_id
      if (id && !allCardsMap.has(id)) allCardsMap.set(id, card)
    })
    return Array.from(allCardsMap.values())
  }, [vendors])

  const vendorCards = React.useMemo(() => {
    if (!selectedVendor) return []
    return allCards.filter((card: Record<string, unknown>) => card.vendor_id === selectedVendor)
  }, [selectedVendor, allCards])

  const selectedVendorName = React.useMemo(() => {
    if (!selectedVendorData) return ''
    const data = selectedVendorData as { business_name?: string; vendor_name?: string }
    return data.business_name || data.vendor_name || 'Unknown Vendor'
  }, [selectedVendorData])

  React.useEffect(() => {
    const cartsData = cartsResponse?.data || []
    if (step >= 2 && Array.isArray(cartsData) && cartsData.length > 0 && !cartId) {
      const first = cartsData[0] as { cart_id?: number }
      if (first?.cart_id) setCartId(first.cart_id)
    }
    if (step === 2 && hasExistingCartItems && uploadedRecipients.length === 0) {
      refetchRecipients().then((recipientsData: { data?: { data?: RecipientRow[] } }) => {
        if (recipientsData?.data?.data) {
          setUploadedRecipients(recipientsData.data.data || [])
        }
      })
    }
  }, [
    cartsResponse?.data,
    step,
    cartId,
    hasExistingCartItems,
    uploadedRecipients.length,
    refetchRecipients,
  ])

  const downloadTemplate = React.useCallback((templateUrl: string) => {
    const a = document.createElement('a')
    a.href = templateUrl
    a.download = 'bulk-recipients-template.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  const handleUpload = React.useCallback(async () => {
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }
    try {
      await uploadMutation.mutateAsync(file)
      const recipientsData = await refetchRecipients()
      const data = recipientsData as { data?: { data?: RecipientRow[] } }
      setUploadedRecipients(data?.data?.data || [])
      setStep(2)
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message || 'Failed to upload recipients')
    }
  }, [file, uploadMutation, refetchRecipients, toast])

  const handleToggleRecipient = React.useCallback((recipientId: number) => {
    setSelectedRecipients((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(recipientId)) newSet.delete(recipientId)
      else newSet.add(recipientId)
      return newSet
    })
  }, [])

  const handleSelectAllRecipients = React.useCallback(() => {
    const allRecipientIds = uploadedRecipients.filter((r) => r.id).map((r) => r.id!)
    if (selectedRecipients.size === allRecipientIds.length) {
      setSelectedRecipients(new Set())
    } else {
      setSelectedRecipients(new Set(allRecipientIds))
    }
  }, [uploadedRecipients, selectedRecipients.size])

  const handleVendorSelect = React.useCallback((vendorIdString: string) => {
    const vendorId = Number(vendorIdString)
    if (vendorId) {
      setSelectedVendor(vendorId)
      setSelectedVendorId(vendorIdString)
      setSelectedCardId(null)
      setSelectedCardType(null)
      setSelectedRecipients(new Set())
      setDashGoAmount('')
    }
  }, [])

  const handleBackToVendors = React.useCallback(() => {
    setSelectedVendor(null)
    setSelectedVendorId('')
    setSelectedCardId(null)
    setSelectedCardType(null)
    setVendorSearch('')
    setSelectedRecipients(new Set())
    setDashGoAmount('')
  }, [])

  const handleClearVendor = React.useCallback(() => {
    setSelectedVendor(null)
    setSelectedVendorId('')
  }, [])

  const scrollToRecipients = React.useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById('recipients-table-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  const handleCardSelect = React.useCallback(
    (cardId: number, cardType: string) => {
      setSelectedCardId(cardId)
      setSelectedCardType(cardType)
      const assignmentKey = `card-${cardId}`
      const assignment = cardRecipientAssignments[assignmentKey]
      if (assignment) {
        setSelectedRecipients(new Set(assignment.recipientIds))
      } else {
        setSelectedRecipients(new Set())
      }
      scrollToRecipients()
    },
    [cardRecipientAssignments, scrollToRecipients],
  )

  const handleDashGoSelect = React.useCallback(() => {
    setSelectedCardType('dashgo')
    setSelectedCardId(selectedVendor || 0)
    setSelectedRecipients(new Set())
    scrollToRecipients()
  }, [selectedVendor, scrollToRecipients])

  const handleDashProSelect = React.useCallback(() => {
    setSelectedCardType('dashpro')
    setSelectedCardId(0)
    setSelectedRecipients(new Set())
    scrollToRecipients()
  }, [scrollToRecipients])

  const handleSaveCardAssignment = React.useCallback(async () => {
    if (!selectedCardType || selectedRecipients.size === 0) {
      toast.error('Please select a card and at least one recipient')
      return
    }
    const recipientIds = Array.from(selectedRecipients)
    if (selectedCardType === 'dashgo' && (!dashGoAmount || parseFloat(dashGoAmount) <= 0)) {
      toast.error('Please enter a valid DashGo amount')
      return
    }

    if (selectedCardType === 'dashgo' || selectedCardType === 'dashpro') {
      try {
        const vendorData = vendorsDataMap.get(selectedVendor!)
        const vendorBranches =
          (vendorData as { branches_with_cards?: Array<{ branch_id?: number; id?: number }> })
            ?.branches_with_cards || []

        if (selectedCardType === 'dashgo') {
          const payload = {
            recipient_ids: recipientIds,
            vendor_id: selectedVendor!,
            product: 'DashGo Gift Card',
            description: `Custom DashGo card for ${selectedVendorName}`,
            price: parseFloat(dashGoAmount),
            currency: 'GHS',
            issue_date: new Date().toISOString().split('T')[0],
            redemption_branches:
              vendorBranches.length > 0
                ? vendorBranches.map((branch) => ({
                    branch_id: Number(branch.branch_id ?? branch.id),
                  }))
                : [],
          }
          const dashGoResponse = await createDashGoMutation.mutateAsync(
            payload as Parameters<typeof createDashGoMutation.mutateAsync>[0],
          )
          const res = dashGoResponse as { cart_id?: number }
          if (res?.cart_id && !cartId) setCartId(res.cart_id)
        } else if (selectedCardType === 'dashpro') {
          const payload = {
            recipient_ids: recipientIds,
            product: 'DashPro Gift Card',
            description: 'DashPro multi-vendor gift card',
            price: parseFloat(dashGoAmount || '0'),
            currency: 'GHS',
            issue_date: new Date().toISOString().split('T')[0],
          }
          const dashProResponse = await createDashProMutation.mutateAsync(
            payload as Parameters<typeof createDashProMutation.mutateAsync>[0],
          )
          const res = dashProResponse as { cart_id?: number }
          if (res?.cart_id && !cartId) setCartId(res.cart_id)
        }

        const assignmentKey =
          selectedCardType === 'dashgo'
            ? `dashgo-${selectedVendor || 0}`
            : selectedCardType === 'dashpro'
              ? 'dashpro-0'
              : `card-${selectedCardId || 0}`
        setCardRecipientAssignments((prev) => ({
          ...prev,
          [assignmentKey]: {
            recipientIds,
            cardType: selectedCardType,
            vendorId: selectedVendor ?? undefined,
            dashGoAmount:
              selectedCardType === 'dashgo' || selectedCardType === 'dashpro'
                ? parseFloat(dashGoAmount)
                : undefined,
            cardName: selectedCardType === 'dashgo' ? 'DashGo Gift Card' : 'DashPro Gift Card',
            cardPrice: parseFloat(dashGoAmount),
            cardCurrency: 'GHS',
          },
        }))
        toast.success(
          `${selectedCardType === 'dashgo' ? 'DashGo' : 'DashPro'} card created and assigned to ${recipientIds.length} recipient(s)`,
        )
        setSelectedCardId(null)
        setSelectedCardType(null)
        setSelectedRecipients(new Set())
        setDashGoAmount('')
      } catch (error: unknown) {
        const err = error as { message?: string }
        toast.error(err?.message || `Failed to create and assign ${selectedCardType}`)
      }
    } else if (selectedCardType === 'card') {
      const assignmentKey = `card-${selectedCardId}`
      const card = allCards.find((c: Record<string, unknown>) => c.card_id === selectedCardId) as
        | { product?: string; price?: string; currency?: string }
        | undefined
      setCardRecipientAssignments((prev) => ({
        ...prev,
        [assignmentKey]: {
          recipientIds,
          cardId: selectedCardId ?? undefined,
          cardType: selectedCardType,
          vendorId: selectedVendor ?? undefined,
          cardName: card?.product || 'Unknown Card',
          cardPrice: parseFloat(String(card?.price ?? '0')),
          cardCurrency: card?.currency || 'GHS',
        },
      }))
      toast.success(`Card assigned to ${recipientIds.length} recipient(s)`)
      setSelectedCardId(null)
      setSelectedCardType(null)
      setSelectedRecipients(new Set())
    }
  }, [
    selectedCardType,
    selectedRecipients,
    dashGoAmount,
    selectedVendor,
    selectedVendorName,
    selectedCardId,
    cartId,
    vendorsDataMap,
    allCards,
    createDashGoMutation,
    createDashProMutation,
    toast,
  ])

  const handleSaveToCart = React.useCallback(async () => {
    if (Object.keys(cardRecipientAssignments).length === 0) {
      toast.error('Please assign at least one card to recipients')
      return
    }
    try {
      const regularCardAssignments = Object.entries(cardRecipientAssignments).filter(
        ([, assignment]) => assignment.cardType === 'card',
      )

      if (regularCardAssignments.length > 0) {
        const cartItemPromises = regularCardAssignments.map(
          async ([, assignment]: [string, CardRecipientAssignment]) => {
            if (!assignment.cardId) return null
            const cartData = {
              card_id: assignment.cardId,
              quantity: assignment.recipientIds.length,
            }
            const cartItem = await addToCartMutation.mutateAsync(
              cartData as Parameters<typeof addToCartMutation.mutateAsync>[0],
            )
            const returnedCartId =
              (cartItem as { cart_id?: number })?.cart_id ||
              (cartItem as { data?: { cart_id?: number } })?.data?.cart_id ||
              (cartItem as { data?: { cart?: { cart_id?: number } } })?.data?.cart?.cart_id ||
              (cartItem as { cart?: { cart_id?: number } })?.cart?.cart_id
            if (returnedCartId) {
              if (!cartId) setCartId(returnedCartId)
              return { cartId: returnedCartId, cardId: assignment.cardId }
            }
            return null
          },
        )
        const cartResults = await Promise.all(cartItemPromises)
        const validCartResults = cartResults.filter(Boolean) as Array<{
          cartId: number
          cardId: number
        }>
        if (!cartId && validCartResults.length > 0) {
          setCartId(validCartResults[0].cartId)
        }
        await queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
        const updatedCartsResponse = await queryClient.fetchQuery({
          queryKey: ['corporate-carts'],
          queryFn: getCarts,
        })
        if (!cartId) {
          const updatedCartsData =
            (updatedCartsResponse as { data?: Array<{ cart_id?: number }> })?.data || []
          if (updatedCartsData.length > 0 && updatedCartsData[0].cart_id) {
            setCartId(updatedCartsData[0].cart_id)
          }
        }
        const assignPromises = regularCardAssignments.map(
          async ([, assignment]: [string, CardRecipientAssignment]) => {
            if (!assignment.cardId) return null
            return assignCardToRecipientsMutation.mutateAsync({
              card_id: assignment.cardId,
              recipient_ids: assignment.recipientIds,
            })
          },
        )
        await Promise.all(assignPromises)
      }

      queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
      queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })

      const dashGoDashProAssignments = Object.entries(cardRecipientAssignments).filter(
        ([, assignment]) => assignment.cardType === 'dashgo' || assignment.cardType === 'dashpro',
      )

      if (regularCardAssignments.length > 0) {
        toast.success(
          'Cards saved to cart successfully. You can continue later or proceed to checkout.',
        )
      } else if (dashGoDashProAssignments.length > 0) {
        toast.success('Cards created and assigned successfully')
      }

      setCardRecipientAssignments({})
      setSelectedCardId(null)
      setSelectedCardType(null)
      setSelectedRecipients(new Set())
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message || 'Failed to save cards to cart')
    }
  }, [
    cardRecipientAssignments,
    cartId,
    addToCartMutation,
    assignCardToRecipientsMutation,
    queryClient,
    toast,
  ])

  const handleClose = React.useCallback(() => {
    setStep(1)
    setFile(null)
    setUploadedRecipients([])
    setSelectedCardId(null)
    setSelectedCardType(null)
    setSelectedVendor(null)
    setSelectedRecipients(new Set())
    setCardRecipientAssignments({})
    setCartId(null)
    setVendorSearch('')
    setDashGoAmount('')
    modal.closeModal()
  }, [modal])

  const handleCloseAndNavigate = React.useCallback(
    (path: string) => {
      handleClose()
      navigate(path)
    },
    [handleClose, navigate],
  )

  return {
    modal,
    step,
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
    vendorSearch,
    setVendorSearch,
    activeTab,
    setActiveTab,
    cartId,
    existingCartItems,
    hasExistingCartItems,
    vendorOptions,
    vendorsDataMap,
    selectedVendorData,
    selectedVendorName,
    allCards,
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
    addToCartMutation,
  }
}
