import React from 'react'
import { Button, FileUploader, Modal, Text, Input, Checkbox, Tabs, Combobox } from '@/components'
import { CardItems } from '@/features/website/components/CardItems/CardItems'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import DashProBg from '@/assets/svgs/dashpro_bg.svg'
import BulkUploadTemplate from '@/assets/Bulk Upload Structure.xlsx?url'
import { usePersistedModalState, useToast, useUserProfile, useDebouncedState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { corporateQueries, corporateMutations } from '@/features/dashboard/corporate/hooks'
import { getCarts } from '@/features/dashboard/corporate/services'
import { formatCurrency } from '@/utils/format'
import { useQueryClient } from '@tanstack/react-query'
import { usePublicCatalogQueries } from '@/features/website/hooks/website/usePublicCatalogQueries'
import type { DropdownOption } from '@/types'

type RecipientRow = {
  id?: number
  name: string
  email: string
  phone: string
  message?: string
}

export function BulkPurchaseEmployees() {
  const modal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer"
        size="medium"
        onClick={() => modal.openModal(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)}
      >
        <Icon icon="hugeicons:upload-01" className="mr-2" />
        Bulk Purchase (Employees)
      </Button>
      <BulkPurchaseEmployeesModal modal={modal} />
    </>
  )
}

export function BulkPurchaseEmployeesModal({
  modal,
}: {
  modal: ReturnType<typeof usePersistedModalState>
}) {
  const [step, setStep] = React.useState(1)
  const [file, setFile] = React.useState<File | null>(null)
  const [uploadedRecipients, setUploadedRecipients] = React.useState<RecipientRow[]>([])
  const [selectedVendor, setSelectedVendor] = React.useState<number | null>(null)
  const [selectedCardId, setSelectedCardId] = React.useState<number | null>(null)
  const [selectedCardType, setSelectedCardType] = React.useState<string | null>(null)
  const [selectedRecipients, setSelectedRecipients] = React.useState<Set<number>>(new Set())
  const [cardRecipientAssignments, setCardRecipientAssignments] = React.useState<
    Record<
      string,
      {
        recipientIds: number[]
        cardId?: number
        cardType: string
        vendorId?: number
        dashGoAmount?: number
        cardName?: string
        cardPrice?: number
        cardCurrency?: string
      }
    >
  >({})
  const [dashGoAmount, setDashGoAmount] = React.useState<string>('')
  const [vendorSearch, setVendorSearch] = React.useState('')
  const [selectedVendorId, setSelectedVendorId] = React.useState<string>('')
  const [activeTab, setActiveTab] = React.useState<'vendors' | 'dashpro'>('vendors')
  const [cartId, setCartId] = React.useState<number | null>(null)
  const toast = useToast()
  const queryClient = useQueryClient()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const {
    useUploadBulkRecipientsService,
    useAssignCardToRecipientsService,
    useCreateDashGoAndAssignService,
    useCreateDashProAndAssignService,
    useAddToCartService,
    useCheckoutService,
  } = corporateMutations()
  const { useGetCartsService, useGetAllRecipientsService } = corporateQueries()

  const uploadMutation = useUploadBulkRecipientsService()
  const assignCardToRecipientsMutation = useAssignCardToRecipientsService()
  const createDashGoMutation = useCreateDashGoAndAssignService()
  const createDashProMutation = useCreateDashProAndAssignService()
  const addToCartMutation = useAddToCartService()
  const checkoutMutation = useCheckoutService()

  // Debounce vendor search like redemption page
  const { value: debouncedVendorSearch } = useDebouncedState({
    initialValue: vendorSearch,
    onChange: setVendorSearch,
    debounceTime: 500,
  })

  const { usePublicVendorsService } = usePublicCatalogQueries()
  // Fetch vendors based on search query
  const { data: vendorsResponse, isLoading: isLoadingVendors } = usePublicVendorsService(
    debouncedVendorSearch
      ? {
          search: debouncedVendorSearch,
          limit: 20,
        }
      : undefined,
  )

  const { data: cartsResponse } = useGetCartsService()
  const { refetch: refetchRecipients } = useGetAllRecipientsService()

  // Load existing cart items when modal opens
  const existingCartItems = React.useMemo(() => {
    const cartsData = cartsResponse?.data || []
    if (!Array.isArray(cartsData) || cartsData.length === 0) return []
    return cartsData
  }, [cartsResponse])

  // Check if there are existing cart items
  const hasExistingCartItems = existingCartItems.length > 0

  // Filter past purchases (completed carts)

  // Extract vendors from API response (same pattern as redemption)
  const vendors = React.useMemo(() => {
    if (!vendorsResponse) return []
    if (Array.isArray(vendorsResponse)) {
      return vendorsResponse.filter((vendor: any) => vendor.branches_with_cards?.length > 0)
    }
    if (vendorsResponse && typeof vendorsResponse === 'object' && 'data' in vendorsResponse) {
      return (
        (vendorsResponse as any).data?.filter(
          (vendor: any) => vendor.branches_with_cards?.length > 0,
        ) || []
      )
    }
    return []
  }, [vendorsResponse])

  // Convert vendors to dropdown options
  const vendorOptions: DropdownOption[] = React.useMemo(() => {
    return vendors.map((vendor: any) => ({
      label: vendor.business_name || vendor.vendor_name || 'Unknown Vendor',
      value: vendor.vendor_id?.toString() || '',
    }))
  }, [vendors])

  // Store full vendor data for later use (branches_with_cards)
  const vendorsDataMap = React.useMemo(() => {
    const vendorsData = vendors || []
    const map = new Map()
    vendorsData.forEach((vendor: any) => {
      if (vendor.vendor_id) {
        map.set(vendor.vendor_id, vendor)
      }
    })
    return map
  }, [vendors])

  // Get selected vendor object
  const selectedVendorData = React.useMemo(() => {
    if (!selectedVendor) return null
    return vendors.find((v: any) => v.vendor_id === selectedVendor) || null
  }, [selectedVendor, vendors])

  // Extract cards from vendors (from vendor_cards and branches_with_cards)
  const allCards = React.useMemo(() => {
    const vendorsData = vendors || []
    const cardsFromVendors: any[] = []

    vendorsData.forEach((vendor: any) => {
      const vendorName = vendor.business_name || vendor.vendor_name || 'Unknown Vendor'
      // Extract from vendor_cards array
      if (vendor.vendor_cards && Array.isArray(vendor.vendor_cards)) {
        vendor.vendor_cards.forEach((card: any) => {
          cardsFromVendors.push({
            card_id: card.card_id || card.id,
            product: card.product || card.card_name,
            vendor_name: vendorName,
            vendor_id: vendor.vendor_id,
            rating: card.rating || 0,
            price: card.price || card.card_price,
            currency: card.currency || 'GHS',
            type: card.type || card.card_type,
            description: card.card_description || card.description || '',
            expiry_date: card.expiry_date || '',
            terms_and_conditions: card.terms_and_conditions || [],
            images: card.images || [],
            issue_date: card.issue_date || '',
            status: card.status || card.card_status || 'active',
          })
        })
      }

      // Extract from branches_with_cards (cards nested within branches)
      if (vendor.branches_with_cards && Array.isArray(vendor.branches_with_cards)) {
        vendor.branches_with_cards.forEach((branch: any) => {
          if (branch.cards && Array.isArray(branch.cards)) {
            branch.cards.forEach((card: any) => {
              cardsFromVendors.push({
                card_id: card.card_id || card.id,
                product: card.card_name || card.product,
                vendor_name: branch.branch_name || vendorName,
                branch_name: branch.branch_name || '',
                branch_location: branch.branch_location || '',
                vendor_id: vendor.vendor_id,
                rating: 0,
                price: card.card_price || card.price,
                currency: card.currency || 'GHS',
                type: card.card_type || card.type,
                description: card.card_description || card.description || '',
                expiry_date: card.expiry_date || '',
                terms_and_conditions: card.terms_and_conditions || [],
                images: card.images || [],
                issue_date: card.issue_date || '',
                status: card.card_status || card.status || 'active',
              })
            })
          }
        })
      }
    })

    // Deduplicate by card_id
    const allCardsMap = new Map()
    cardsFromVendors.forEach((card) => {
      if (card.card_id && !allCardsMap.has(card.card_id)) {
        allCardsMap.set(card.card_id, card)
      }
    })

    return Array.from(allCardsMap.values())
  }, [vendors])

  // Get cards for selected vendor (excluding DashPro and DashGo)
  const vendorCards = React.useMemo(() => {
    if (!selectedVendor) return []
    return allCards.filter((card: any) => card.vendor_id === selectedVendor)
  }, [selectedVendor, allCards])

  const selectedVendorName = React.useMemo(() => {
    if (!selectedVendorData) return ''
    return selectedVendorData.business_name || selectedVendorData.vendor_name || 'Unknown Vendor'
  }, [selectedVendorData])

  // Get or create cart and load existing recipients
  React.useEffect(() => {
    const cartsData = cartsResponse?.data || []
    if (step >= 2 && cartsData.length > 0 && !cartId) {
      // Use the first cart
      setCartId(cartsData[0].cart_id)
    }

    // Load existing recipients when modal opens with saved cart items
    if (step === 2 && hasExistingCartItems && uploadedRecipients.length === 0) {
      refetchRecipients().then((recipientsData) => {
        if (recipientsData?.data) {
          setUploadedRecipients(recipientsData.data || [])
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

  const downloadTemplate = () => {
    // Use the Excel template file from assets
    const a = document.createElement('a')
    a.href = BulkUploadTemplate
    a.download = 'bulk-recipients-template.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    try {
      await uploadMutation.mutateAsync(file)

      // Fetch recipients from the API after upload

      const recipientsData = await refetchRecipients()

      setUploadedRecipients(recipientsData?.data || [])
      toast.success(`Successfully loaded ${recipientsData?.data?.length || 0} recipient(s)`)
      setStep(2)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload recipients')
    }
  }

  const handleToggleRecipient = (recipientId: number) => {
    setSelectedRecipients((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(recipientId)) {
        newSet.delete(recipientId)
      } else {
        newSet.add(recipientId)
      }
      return newSet
    })
  }

  const handleSelectAllRecipients = () => {
    const allRecipientIds = uploadedRecipients.filter((r) => r.id).map((r) => r.id!)
    if (selectedRecipients.size === allRecipientIds.length) {
      setSelectedRecipients(new Set())
    } else {
      setSelectedRecipients(new Set(allRecipientIds))
    }
  }

  const handleVendorSelect = (vendorIdString: string) => {
    const vendorId = Number(vendorIdString)
    if (vendorId) {
      setSelectedVendor(vendorId)
      setSelectedVendorId(vendorIdString)
      setSelectedCardId(null)
      setSelectedCardType(null)
      setSelectedRecipients(new Set())
      setDashGoAmount('')
    }
  }

  const handleBackToVendors = () => {
    setSelectedVendor(null)
    setSelectedVendorId('')
    setSelectedCardId(null)
    setSelectedCardType(null)
    setVendorSearch('')
    setSelectedRecipients(new Set())
    setDashGoAmount('')
  }

  const handleCardSelect = (cardId: number, cardType: string) => {
    setSelectedCardId(cardId)
    setSelectedCardType(cardType)
    // Pre-select recipients already assigned to this card
    const assignmentKey = `card-${cardId}`
    const assignment = cardRecipientAssignments[assignmentKey]
    if (assignment) {
      setSelectedRecipients(new Set(assignment.recipientIds))
    } else {
      setSelectedRecipients(new Set())
    }
    // Scroll to recipients table
    setTimeout(() => {
      const recipientsSection = document.getElementById('recipients-table-section')
      if (recipientsSection) {
        recipientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleDashGoSelect = () => {
    setSelectedCardType('dashgo')
    setSelectedCardId(selectedVendor || 0) // Use vendor ID as identifier for DashGo
    setSelectedRecipients(new Set())
    // Scroll to recipients table
    setTimeout(() => {
      const recipientsSection = document.getElementById('recipients-table-section')
      if (recipientsSection) {
        recipientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleDashProSelect = () => {
    setSelectedCardType('dashpro')
    setSelectedCardId(0) // DashPro doesn't have a card ID
    setSelectedRecipients(new Set())
    // Scroll to recipients table
    setTimeout(() => {
      const recipientsSection = document.getElementById('recipients-table-section')
      if (recipientsSection) {
        recipientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleSaveCardAssignment = async () => {
    if (!selectedCardType || selectedRecipients.size === 0) {
      toast.error('Please select a card and at least one recipient')
      return
    }

    const recipientIds = Array.from(selectedRecipients)

    // For DashGo, we need amount
    if (selectedCardType === 'dashgo' && (!dashGoAmount || parseFloat(dashGoAmount) <= 0)) {
      toast.error('Please enter a valid DashGo amount')
      return
    }

    // For DashGo and DashPro, we'll create and assign immediately
    if (selectedCardType === 'dashgo' || selectedCardType === 'dashpro') {
      try {
        // Get branches from vendor data (branches_with_cards)
        const selectedVendorData = vendorsDataMap.get(selectedVendor)
        const vendorBranches = selectedVendorData?.branches_with_cards || []

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
                ? vendorBranches.map((branch: any) => ({
                    branch_id: Number(branch.branch_id || branch.id),
                  }))
                : [],
          }

          const dashGoResponse = await createDashGoMutation.mutateAsync(payload)

          // Try to get cart_id from response if available
          if (dashGoResponse?.cart_id && !cartId) {
            setCartId(dashGoResponse.cart_id)
          }
        } else if (selectedCardType === 'dashpro') {
          const payload = {
            recipient_ids: recipientIds,
            product: 'DashPro Gift Card',
            description: 'DashPro multi-vendor gift card',
            price: parseFloat(dashGoAmount || '0'),
            currency: 'GHS',
            issue_date: new Date().toISOString().split('T')[0],
          }

          const dashProResponse = await createDashProMutation.mutateAsync(payload)

          // Try to get cart_id from response if available
          if (dashProResponse?.cart_id && !cartId) {
            setCartId(dashProResponse.cart_id)
          }
        }

        // Store assignment for summary
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
            vendorId: selectedVendor || undefined,
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
      } catch (error: any) {
        toast.error(error?.message || `Failed to create and assign ${selectedCardType}`)
      }
    } else if (selectedCardType === 'card') {
      // Regular card - just store assignment
      const assignmentKey = `card-${selectedCardId}`
      const card = allCards.find((c: any) => c.card_id === selectedCardId)
      setCardRecipientAssignments((prev) => ({
        ...prev,
        [assignmentKey]: {
          recipientIds,
          cardId: selectedCardId || undefined,
          cardType: selectedCardType,
          vendorId: selectedVendor || undefined,
          cardName: card?.product || 'Unknown Card',
          cardPrice: parseFloat(card?.price || '0'),
          cardCurrency: card?.currency || 'GHS',
        },
      }))

      toast.success(`Card assigned to ${recipientIds.length} recipient(s)`)
      setSelectedCardId(null)
      setSelectedCardType(null)
      setSelectedRecipients(new Set())
    }
  }

  const handleSaveToCart = async () => {
    // Check if any card has recipients assigned
    const hasAnyAssignment = Object.keys(cardRecipientAssignments).length > 0

    if (!hasAnyAssignment) {
      toast.error('Please assign at least one card to recipients')
      return
    }

    try {
      // Filter out DashGo and DashPro assignments (they're already created and assigned)
      const regularCardAssignments = Object.entries(cardRecipientAssignments).filter(
        ([, assignment]) => assignment.cardType === 'card',
      )

      if (regularCardAssignments.length > 0) {
        // First, add regular cards to cart - one cart item per unique card
        const cartItemPromises = regularCardAssignments.map(async ([, assignment]) => {
          if (!assignment.cardId) return null

          const totalQuantity = assignment.recipientIds.length

          const cartData = {
            card_id: assignment.cardId,
            quantity: totalQuantity,
          }

          const cartItem = await addToCartMutation.mutateAsync(cartData)

          // Store cart_id for later use - check multiple possible response structures
          const returnedCartId =
            cartItem?.cart_id ||
            cartItem?.data?.cart_id ||
            cartItem?.data?.cart?.cart_id ||
            cartItem?.cart?.cart_id

          if (returnedCartId) {
            // Update cart ID if not set
            if (!cartId) {
              setCartId(returnedCartId)
            }
            return { cartId: returnedCartId, cardId: assignment.cardId }
          }
          return null
        })

        const cartResults = await Promise.all(cartItemPromises)
        const validCartResults = cartResults.filter(Boolean) as Array<{
          cartId: number
          cardId: number
        }>

        // Update cart ID from the first cart item if not set
        if (!cartId && validCartResults.length > 0) {
          setCartId(validCartResults[0].cartId)
        }

        // Refetch carts to ensure we have the latest cart data
        await queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
        const updatedCartsResponse = await queryClient.fetchQuery({
          queryKey: ['corporate-carts'],
          queryFn: getCarts,
        })

        // If cartId is still not set, try to get it from the refreshed carts response
        if (!cartId) {
          const updatedCartsData = (updatedCartsResponse as any)?.data || []
          if (updatedCartsData.length > 0) {
            setCartId(updatedCartsData[0].cart_id)
          }
        }

        // Then assign cards to recipients using the new endpoint
        const assignPromises = regularCardAssignments.map(async ([, assignment]) => {
          if (!assignment.cardId) return null
          return await assignCardToRecipientsMutation.mutateAsync({
            card_id: assignment.cardId,
            recipient_ids: assignment.recipientIds,
          })
        })

        await Promise.all(assignPromises)
      }

      // Invalidate carts query to refresh cart data
      queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
      queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })

      // Check if there are DashGo/DashPro assignments (already created)
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

      // Clear current assignments after saving (user can add more)
      setCardRecipientAssignments({})
      setSelectedCardId(null)
      setSelectedCardType(null)
      setSelectedRecipients(new Set())
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save cards to cart')
    }
  }

  const handleCheckout = async () => {
    if (!userProfileData) {
      toast.error('Missing user information')
      return
    }

    // Check if there are any current assignments
    const regularCardAssignments = Object.entries(cardRecipientAssignments).filter(
      ([, assignment]) => assignment.cardType === 'card',
    )

    const dashGoDashProAssignments = Object.entries(cardRecipientAssignments).filter(
      ([, assignment]) => assignment.cardType === 'dashgo' || assignment.cardType === 'dashpro',
    )

    // If there are current assignments, save them first
    if (regularCardAssignments.length > 0 || dashGoDashProAssignments.length > 0) {
      await handleSaveToCart()
      // Wait a bit for the save to complete
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Get the current cart ID (use local variable to avoid async state update issues)
    let currentCartId = cartId

    // Try to get cartId if not set - use local variable instead of relying on state
    if (!currentCartId) {
      // Refetch carts to get the latest cart
      await queryClient.invalidateQueries({ queryKey: ['corporate-carts'] })
      const updatedCartsResponse = await queryClient.fetchQuery({
        queryKey: ['corporate-carts'],
        queryFn: getCarts,
      })
      const cartsData = (updatedCartsResponse as any)?.data || updatedCartsResponse || []
      if (Array.isArray(cartsData) && cartsData.length > 0) {
        currentCartId = cartsData[0].cart_id
        setCartId(currentCartId) // Update state for future use
      }
    }

    // Ensure we have a cart_id before proceeding (required for checkout)
    if (!currentCartId) {
      toast.error('Missing cart information. Please add items to cart first.')
      return
    }

    // Calculate total amount from existing cart items
    let totalAmount = 0
    if (existingCartItems.length > 0) {
      existingCartItems.forEach((cart: any) => {
        if (cart.items && Array.isArray(cart.items)) {
          cart.items.forEach((item: any) => {
            const itemPrice = parseFloat(item.price || item.card_price || '0')
            const quantity = item.quantity || 1
            totalAmount += itemPrice * quantity
          })
        }
      })
    }

    // Also add current assignments if any
    totalAmount += Object.entries(cardRecipientAssignments).reduce((sum, [, assignment]) => {
      if (assignment.cardPrice) {
        return sum + assignment.cardPrice * assignment.recipientIds.length
      }
      const card = allCards.find((c: any) => c.card_id === assignment.cardId)
      if (card) {
        return sum + parseFloat(card.price) * assignment.recipientIds.length
      }
      return sum
    }, 0)

    try {
      const response = await checkoutMutation.mutateAsync({
        cart_id: currentCartId,
        full_name: userProfileData.fullname || userProfileData.email || '',
        email: userProfileData.email || '',
        phone_number: userProfileData.phonenumber || '',
        amount_due: totalAmount,
        user_id: userProfileData.id || 0,
      })

      // If payment URL is returned, open it
      if (response?.data) {
        window.open(response.data, '_blank', 'noopener,noreferrer')
      }

      // Close modal after successful checkout
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error: any) {
      toast.error(error?.message || 'Checkout failed')
    }
  }

  const handleClose = () => {
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
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)}
      setIsOpen={handleClose}
      title="Bulk Purchase Gift Cards for Employees"
      position="side"
      panelClass="!w-[864px] p-8"
    >
      <div className="p-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                <span className="ml-2 text-sm font-medium">
                  {s === 1 ? 'Upload' : 'Select Cards'}
                </span>
              </div>
              {s < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Upload Recipients */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Text variant="p" className="text-sm text-gray-600">
                Upload an Excel file with recipient details (first name, last name, email, phone
                number, message). After uploading, you'll be able to assign gift cards to each
                recipient.
              </Text>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Text variant="span" weight="semibold" className="text-gray-900 block mb-2">
                  File Format Required
                </Text>
                <Text variant="p" className="text-sm text-gray-600 mb-2">
                  Your file must include the following columns (in this order):
                </Text>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>
                    <strong>last_name</strong> (required) - Recipient's last name
                  </li>
                  <li>
                    <strong>email</strong> (required) - Recipient's email address
                  </li>
                  <li>
                    <strong>phone</strong> (required) - Recipient's phone number
                  </li>
                  <li>
                    <strong>message</strong> (optional) - Personal message for the recipient
                  </li>
                  <li>
                    <strong>first_name</strong> (required) - Recipient's first name
                  </li>
                </ul>
              </div>

              <div className="flex items-end ml-4">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Icon icon="hugeicons:download-01" className="mr-2" />
                  Download Template
                </Button>
              </div>
            </div>

            <FileUploader
              label="Upload Recipients File (Excel)"
              accept=".xlsx,.xls"
              value={file}
              onChange={setFile}
            />

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
                loading={uploadMutation.isPending}
              >
                Upload & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Browse Vendors & Select Cards */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Text variant="h6" weight="semibold" className="text-gray-900">
                Browse Cards & Assign Recipients ({uploadedRecipients.length} recipients)
              </Text>
              {hasExistingCartItems && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                  <Icon icon="hugeicons:shopping-cart-01" className="w-4 h-4 text-primary-600" />
                  <Text variant="span" className="text-sm text-primary-700 font-medium">
                    {existingCartItems.length} item(s) saved in cart
                  </Text>
                </div>
              )}
            </div>

            {/* Show existing cart items summary */}
            {hasExistingCartItems && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon icon="hugeicons:info-circle" className="w-5 h-5 text-blue-600" />
                    <Text variant="span" weight="semibold" className="text-blue-900">
                      Saved Cart Items
                    </Text>
                  </div>
                </div>
                <Text variant="p" className="text-sm text-blue-700 mb-2">
                  You have {existingCartItems.length} item(s) already saved in your cart. You can
                  continue adding more cards or proceed to checkout.
                </Text>
                <div className="mt-3 space-y-2">
                  {existingCartItems.slice(0, 3).map((cart: any, index: number) => (
                    <div key={index} className="text-sm text-blue-800">
                      • Cart #{cart.cart_id} - {cart.items?.length || 0} card(s)
                    </div>
                  ))}
                  {existingCartItems.length > 3 && (
                    <Text variant="span" className="text-sm text-blue-700">
                      ...and {existingCartItems.length - 3} more
                    </Text>
                  )}
                </div>
              </div>
            )}

            {!selectedVendor ? (
              <>
                {/* Vendor Selection */}
                <Tabs
                  tabs={[
                    { value: 'vendors', label: 'Vendors' },
                    { value: 'dashpro', label: 'DashPro' },
                  ]}
                  active={activeTab}
                  setActive={(value: string) => setActiveTab(value as 'vendors' | 'dashpro')}
                  className="gap-6"
                  btnClass="pb-2"
                />

                {activeTab === 'vendors' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Vendor <span className="text-red-500">*</span>
                      </label>
                      <Combobox
                        options={vendorOptions}
                        value={selectedVendorId}
                        onChange={(e: any) => {
                          const vendorId = e.target.value
                          if (vendorId) {
                            handleVendorSelect(vendorId)
                          } else {
                            setSelectedVendor(null)
                            setSelectedVendorId('')
                          }
                        }}
                        placeholder="Search for a vendor by name..."
                        isLoading={isLoadingVendors}
                        isClearable
                        className="w-full"
                      />
                      {selectedVendor && selectedVendorData && (
                        <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Icon icon="bi:check-circle-fill" className="text-green-600" />
                            <Text variant="span" weight="medium" className="text-green-900">
                              {selectedVendorName}
                            </Text>
                          </div>
                          {selectedVendorData.branches_with_cards && (
                            <Text variant="span" className="text-sm text-green-700 block mt-1">
                              {selectedVendorData.branches_with_cards.length} branch(es) available
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                      {/* Left Column - DashPro Card Visual */}
                      <div className="flex justify-center">
                        <div className="relative w-full max-w-[400px] h-[240px] rounded-2xl shadow-xl overflow-hidden">
                          <img
                            src={DashProBg}
                            alt="DashPro background"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                            <div className="flex items-start justify-between">
                              <div className="text-xl font-black tracking-[0.3em]">DASHPRO</div>
                              <div className="text-right text-xl font-semibold">
                                GHS {dashGoAmount || '0.00'}
                              </div>
                            </div>
                            <div className="flex items-end justify-between">
                              <div className="text-base font-semibold uppercase">Monetary Card</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - DashPro Details and Actions */}
                      <div className="space-y-4">
                        <div>
                          <Text variant="h3" weight="semibold" className="text-gray-900">
                            DashPro Gift Card
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            A monetary gift card that recipients can redeem for cash or use for
                            purchases
                          </Text>
                        </div>

                        <div>
                          <Text variant="h4" weight="medium" className="text-gray-900 mb-2">
                            Description
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            DashPro is a monetary gift card that provides recipients with a cash
                            value they can redeem or use for purchases. Simply enter the amount and
                            assign it to your selected employees.
                          </Text>
                        </div>

                        {/* Amount Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter Amount
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                              GHS
                            </span>
                            <Input
                              type="number"
                              value={dashGoAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setDashGoAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="secondary"
                          onClick={handleDashProSelect}
                          disabled={!dashGoAmount || parseFloat(dashGoAmount || '0') <= 0}
                          className="w-full"
                        >
                          Quick Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipients Table for DashPro - Show when DashPro is selected */}
                {selectedCardType === 'dashpro' && (
                  <div className="space-y-4 border-t border-gray-200 pt-4 mt-6">
                    <div className="flex items-center justify-between">
                      <Text variant="span" weight="medium" className="text-gray-700 block">
                        Select Recipients for DashPro
                      </Text>
                      <Button variant="outline" size="small" onClick={handleSelectAllRecipients}>
                        {selectedRecipients.size === uploadedRecipients.filter((r) => r.id).length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">
                              <Checkbox
                                checked={
                                  uploadedRecipients.filter((r) => r.id).length > 0 &&
                                  selectedRecipients.size ===
                                    uploadedRecipients.filter((r) => r.id).length
                                }
                                indeterminate={
                                  selectedRecipients.size > 0 &&
                                  selectedRecipients.size <
                                    uploadedRecipients.filter((r) => r.id).length
                                }
                                onChange={handleSelectAllRecipients}
                              />
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Recipient Name
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedRecipients.map((recipient) => {
                            if (!recipient.id) return null
                            const isChecked = selectedRecipients.has(recipient.id)

                            return (
                              <tr
                                key={`recipient-${recipient.id}`}
                                className="border-t border-gray-200 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3">
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleToggleRecipient(recipient.id!)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="font-medium text-gray-900">
                                    {recipient.name}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.email}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.phone}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-600">
                                    {recipient.message || '-'}
                                  </Text>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <Text variant="span" className="text-sm text-gray-700">
                        {selectedRecipients.size} of {uploadedRecipients.filter((r) => r.id).length}{' '}
                        recipients selected
                      </Text>
                      <Button
                        variant="secondary"
                        onClick={handleSaveCardAssignment}
                        disabled={
                          selectedRecipients.size === 0 ||
                          !dashGoAmount ||
                          parseFloat(dashGoAmount || '0') <= 0
                        }
                        loading={createDashProMutation.isPending}
                      >
                        Save Assignment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Summary of Assignments for DashPro */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="space-y-3 border-t border-gray-200 pt-4 mt-6">
                    <Text variant="h6" weight="semibold" className="text-gray-900">
                      Assignment Summary
                    </Text>
                    <div className="space-y-2">
                      {Object.entries(cardRecipientAssignments).map(([key, assignment]) => {
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <Text variant="span" weight="medium" className="text-gray-900">
                                {assignment.cardName || 'Unknown Card'} ({assignment.cardType})
                              </Text>
                              <Text variant="span" className="text-sm text-gray-600 block">
                                Assigned to {assignment.recipientIds.length} recipient(s) -{' '}
                                {formatCurrency(
                                  (assignment.cardPrice || 0) * assignment.recipientIds.length,
                                  assignment.cardCurrency || 'GHS',
                                )}
                              </Text>
                            </div>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => {
                                setCardRecipientAssignments((prev) => {
                                  const newAssignments = { ...prev }
                                  delete newAssignments[key]
                                  return newAssignments
                                })
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Total Amount for DashPro */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Text variant="span" weight="semibold" className="text-gray-900">
                        Total Amount:
                      </Text>
                      <Text variant="span" weight="bold" className="text-lg text-primary-600">
                        {formatCurrency(
                          Object.values(cardRecipientAssignments).reduce(
                            (sum, assignment) =>
                              sum + (assignment.cardPrice || 0) * assignment.recipientIds.length,
                            0,
                          ),
                          'GHS',
                        )}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  {Object.keys(cardRecipientAssignments).length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSaveToCart}
                        disabled={
                          Object.keys(cardRecipientAssignments).length === 0 ||
                          addToCartMutation.isPending
                        }
                        loading={addToCartMutation.isPending}
                      >
                        Save to Cart
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await handleSaveToCart()
                          setTimeout(() => {
                            handleCheckout()
                          }, 500)
                        }}
                        disabled={
                          Object.keys(cardRecipientAssignments).length === 0 ||
                          addToCartMutation.isPending
                        }
                        loading={addToCartMutation.isPending}
                      >
                        Save & Checkout
                      </Button>
                    </>
                  )}
                  {Object.keys(cardRecipientAssignments).length === 0 && hasExistingCartItems && (
                    <Button variant="secondary" onClick={handleCheckout} disabled={!cartId}>
                      Proceed to Checkout
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Card Selection for Selected Vendor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="small" onClick={handleBackToVendors}>
                      <Icon icon="hugeicons:arrow-left-01" className="mr-2" />
                      Back to Vendors
                    </Button>
                    <Text variant="span" weight="semibold" className="text-gray-900">
                      {selectedVendorName}
                    </Text>
                  </div>
                </div>

                <Text variant="p" className="text-sm text-gray-600">
                  Select a card to assign to recipients
                </Text>

                {/* DashGo Featured Section - Always shown for selected vendor */}
                {selectedVendor && (
                  <div className="bg-linear-to-br from-[#f8f9fa] to-[#e9ecef] rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                      {/* Left Column - DashGo Card Visual */}
                      <div className="flex justify-center">
                        <div className="relative w-full max-w-[400px] h-[240px] rounded-2xl shadow-xl overflow-hidden">
                          <img
                            src={DashGoBg}
                            alt="DashGo background"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                            <div className="flex items-start justify-between">
                              <div className="text-xl font-black tracking-[0.3em]">DASHGO</div>
                              <div className="text-right text-xl font-semibold">
                                GHS {dashGoAmount || '0.00'}
                              </div>
                            </div>
                            <div className="flex items-end justify-between">
                              <div className="text-base font-semibold uppercase">
                                {selectedVendorName}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - DashGo Details and Actions */}
                      <div className="space-y-4">
                        <div>
                          <Text variant="h3" weight="semibold" className="text-gray-900">
                            DashGo Gift Card
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            Vendor: {selectedVendorName}
                          </Text>
                        </div>

                        <div>
                          <Text variant="h4" weight="medium" className="text-gray-900 mb-2">
                            Description
                          </Text>
                          <Text variant="p" className="text-sm text-gray-600">
                            DashGo is a vendor-locked monetary gift card redeemable only at{' '}
                            {selectedVendorName}. Enter your desired amount to create a custom gift
                            card that can be used at this vendor's locations. Partial redemption is
                            allowed. selected employees
                          </Text>
                        </div>

                        {/* Amount Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter Amount
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
                              GHS
                            </span>
                            <Input
                              type="number"
                              value={dashGoAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setDashGoAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="secondary"
                          onClick={handleDashGoSelect}
                          disabled={!dashGoAmount || parseFloat(dashGoAmount || '0') <= 0}
                          className="w-full"
                        >
                          Quick Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Vendor Cards (DashX, DashPass, etc.) */}
                {vendorCards.length > 0 ? (
                  <div className="space-y-3">
                    <Text variant="span" weight="semibold" className="text-gray-900">
                      Other Cards
                    </Text>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto">
                      {vendorCards.map((card: any) => {
                        const assignmentKey = `card-${card.card_id}`
                        const assignment = cardRecipientAssignments[assignmentKey]
                        const assignedCount = assignment?.recipientIds.length || 0
                        const isSelected =
                          selectedCardId === card.card_id && selectedCardType === 'card'

                        return (
                          <div
                            key={card.card_id}
                            className={`transition-all ${
                              isSelected ? 'ring-2 ring-primary-500 rounded-2xl' : ''
                            }`}
                          >
                            <CardItems
                              branch_name={card.branch_name || ''}
                              branch_location={card.branch_location || ''}
                              card_id={card.card_id}
                              product={card.product}
                              vendor_name={
                                card.vendor_name || selectedVendorName || 'Unknown Vendor'
                              }
                              rating={card.rating}
                              price={card.price}
                              currency={card.currency}
                              type={card.type}
                              description={card.description || ''}
                              expiry_date={card.expiry_date || ''}
                              terms_and_conditions={card.terms_and_conditions || []}
                              created_at={card.created_at || ''}
                              base_price={card.price || ''}
                              markup_price={null}
                              service_fee="0"
                              status={card.status || 'active'}
                              recipient_count="0"
                              images={card.images || []}
                              updated_at={card.updated_at || card.created_at || ''}
                              vendor_id={card.vendor_id}
                              buttonText="Quick Assign"
                              onGetQard={() => handleCardSelect(card.card_id, 'card')}
                            />
                            {assignedCount > 0 && (
                              <div className="mt-2 text-center">
                                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                                  {assignedCount} assigned
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Recipients Table - Only show when a card is selected */}
                {(selectedCardId || selectedCardType) && (
                  <div
                    id="recipients-table-section"
                    className="space-y-4 border-t border-gray-200 pt-4 mt-6"
                  >
                    <div className="flex items-center justify-between">
                      <Text variant="span" weight="medium" className="text-gray-700 block">
                        Select Recipients for{' '}
                        {selectedCardType === 'dashgo'
                          ? 'DashGo'
                          : selectedCardType === 'dashpro'
                            ? 'DashPro'
                            : selectedCardType === 'card'
                              ? allCards.find((c: any) => c.card_id === selectedCardId)?.product ||
                                'this Card'
                              : 'this Card'}
                      </Text>
                      <Button variant="outline" size="small" onClick={handleSelectAllRecipients}>
                        {selectedRecipients.size === uploadedRecipients.filter((r) => r.id).length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">
                              <Checkbox
                                checked={
                                  uploadedRecipients.filter((r) => r.id).length > 0 &&
                                  selectedRecipients.size ===
                                    uploadedRecipients.filter((r) => r.id).length
                                }
                                indeterminate={
                                  selectedRecipients.size > 0 &&
                                  selectedRecipients.size <
                                    uploadedRecipients.filter((r) => r.id).length
                                }
                                onChange={handleSelectAllRecipients}
                              />
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Recipient Name
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedRecipients.map((recipient) => {
                            if (!recipient.id) return null
                            const isChecked = selectedRecipients.has(recipient.id)

                            return (
                              <tr
                                key={`recipient-${recipient.id}`}
                                className="border-t border-gray-200 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3">
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleToggleRecipient(recipient.id!)}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="font-medium text-gray-900">
                                    {recipient.name}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.email}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-700">
                                    {recipient.phone}
                                  </Text>
                                </td>
                                <td className="px-4 py-3">
                                  <Text variant="span" className="text-gray-600">
                                    {recipient.message || '-'}
                                  </Text>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div>
                        <Text variant="span" weight="medium" className="text-gray-700 block">
                          {selectedRecipients.size} recipient(s) selected
                        </Text>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={handleSaveCardAssignment}
                        disabled={
                          selectedRecipients.size === 0 ||
                          (selectedCardType === 'dashgo' &&
                            (!dashGoAmount || parseFloat(dashGoAmount) <= 0)) ||
                          (selectedCardType === 'dashpro' &&
                            (!dashGoAmount || parseFloat(dashGoAmount) <= 0))
                        }
                        loading={createDashGoMutation.isPending || createDashProMutation.isPending}
                      >
                        Save Assignment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Summary of Assignments */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <Text variant="h6" weight="semibold" className="text-gray-900">
                      Assignment Summary
                    </Text>
                    <div className="space-y-2">
                      {Object.entries(cardRecipientAssignments).map(([key, assignment]) => {
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <Text variant="span" weight="medium" className="text-gray-900">
                                {assignment.cardName || 'Unknown Card'} ({assignment.cardType})
                              </Text>
                              <Text variant="span" className="text-sm text-gray-600 block">
                                Assigned to {assignment.recipientIds.length} recipient(s) -{' '}
                                {formatCurrency(
                                  (assignment.cardPrice || 0) * assignment.recipientIds.length,
                                  assignment.cardCurrency || 'GHS',
                                )}
                              </Text>
                            </div>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => {
                                setCardRecipientAssignments((prev) => {
                                  const newAssignments = { ...prev }
                                  delete newAssignments[key]
                                  return newAssignments
                                })
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                {Object.keys(cardRecipientAssignments).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <Text variant="span" weight="semibold" className="text-gray-900">
                        Total Amount:
                      </Text>
                      <Text variant="span" weight="bold" className="text-lg text-primary-600">
                        {formatCurrency(
                          Object.values(cardRecipientAssignments).reduce(
                            (sum, assignment) =>
                              sum + (assignment.cardPrice || 0) * assignment.recipientIds.length,
                            0,
                          ),
                          'GHS',
                        )}
                      </Text>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={handleBackToVendors}>
                    Back
                  </Button>
                  {Object.keys(cardRecipientAssignments).length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSaveToCart}
                        disabled={
                          Object.keys(cardRecipientAssignments).length === 0 ||
                          addToCartMutation.isPending
                        }
                        loading={addToCartMutation.isPending}
                      >
                        Save to Cart
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await handleSaveToCart()
                          setTimeout(() => {
                            handleCheckout()
                          }, 500)
                        }}
                        disabled={
                          Object.keys(cardRecipientAssignments).length === 0 ||
                          addToCartMutation.isPending
                        }
                        loading={addToCartMutation.isPending}
                      >
                        Save & Checkout
                      </Button>
                    </>
                  )}
                  {Object.keys(cardRecipientAssignments).length === 0 && hasExistingCartItems && (
                    <Button variant="secondary" onClick={handleCheckout} disabled={!cartId}>
                      Proceed to Checkout
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
