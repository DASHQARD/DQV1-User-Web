import React from 'react'
import {
  Button,
  FileUploader,
  Modal,
  Text,
  Input,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Tabs,
  Loader,
} from '@/components'
import { DebouncedSearch } from '@/components/SearchBox'
import { CardItems } from '@/features/website/components/CardItems/CardItems'
import { VendorItems } from '@/features/website/components/VendorItems/VendorItems'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import DashProBg from '@/assets/svgs/dashpro_bg.svg'
import { usePersistedModalState, useToast, userProfile } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { corporateQueries, corporateMutations } from '@/features/dashboard/corporate/hooks'
import { getCarts } from '@/features/dashboard/corporate/services'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'
import { formatCurrency } from '@/utils/format'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GHANA_BANKS } from '@/assets/data/banks'
import { useQueryClient } from '@tanstack/react-query'

type RecipientRow = {
  id?: number
  name: string
  email: string
  phone: string
  message?: string
}

const PaymentDetailsSchema = z
  .object({
    payment_method: z.enum(['mobile_money', 'bank']),
    mobile_money_provider: z.string().optional(),
    mobile_money_number: z.string().optional(),
    bank_name: z.string().optional(),
    branch: z.string().optional(),
    account_name: z.string().optional(),
    account_number: z.string().optional(),
    swift_code: z.string().optional(),
    sort_code: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.payment_method === 'mobile_money') {
        return !!(data.mobile_money_provider && data.mobile_money_number)
      }
      return true
    },
    {
      message: 'Mobile Money Provider and Mobile Money Number are required',
      path: ['mobile_money_provider'],
    },
  )
  .refine(
    (data) => {
      if (data.payment_method === 'bank') {
        return !!(
          data.bank_name &&
          data.account_number &&
          data.account_name &&
          data.sort_code &&
          data.swift_code
        )
      }
      return true
    },
    {
      message: 'All bank details are required',
      path: ['bank_name'],
    },
  )

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
  const [activeTab, setActiveTab] = React.useState<'vendors' | 'dashpro'>('vendors')
  const [cartId, setCartId] = React.useState<number | null>(null)
  const toast = useToast()
  const queryClient = useQueryClient()
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const {
    useUploadBulkRecipientsService,
    useAssignCardToRecipientsService,
    useCreateDashGoAndAssignService,
    useCreateDashProAndAssignService,
    useAddToCartService,
    useAddPaymentDetailsService,
    useCheckoutService,
  } = corporateMutations()
  const {
    useGetCardsService,
    useGetCartsService,
    useGetPaymentDetailsService,
    useGetAllRecipientsService,
  } = corporateQueries()
  const { useGetAllVendorsDetailsService, useBranchesService } = vendorQueries()

  const uploadMutation = useUploadBulkRecipientsService()
  const assignCardToRecipientsMutation = useAssignCardToRecipientsService()
  const createDashGoMutation = useCreateDashGoAndAssignService()
  const createDashProMutation = useCreateDashProAndAssignService()
  const addToCartMutation = useAddToCartService()
  const addPaymentMutation = useAddPaymentDetailsService()
  const checkoutMutation = useCheckoutService()

  const { data: cardsResponse, isLoading: isLoadingCards } = useGetCardsService()
  const { data: vendorsResponse, isLoading: isLoadingVendors } = useGetAllVendorsDetailsService()
  const { data: branchesResponse } = useBranchesService()
  const { data: cartsResponse } = useGetCartsService()
  const { data: paymentDetailsResponse } = useGetPaymentDetailsService()
  const { refetch: refetchRecipients } = useGetAllRecipientsService()

  // Filter past purchases (completed carts)

  // Extract vendors from API response
  const vendors = React.useMemo(() => {
    const vendorsData = vendorsResponse || []
    return vendorsData?.map((vendor: any) => ({
      id: vendor.vendor_id,
      vendor_id: String(vendor.vendor_id),
      branch_name: vendor.vendor_name || vendor.business_name || 'Unknown Vendor',
      shops: parseInt(vendor.branch_count || '0', 10),
      rating: 0,
    }))
  }, [vendorsResponse])

  // Extract cards from API response
  const allCards = React.useMemo(() => {
    const cardsData = cardsResponse?.data || []
    return cardsData.map((card: any) => ({
      id: card.card_id || card.id,
      card_id: card.card_id || card.id,
      product: card.product,
      vendor_name: card.vendor_name || 'Unknown Vendor',
      vendor_id: card.vendor_id,
      rating: card.rating || 0,
      price: card.price,
      currency: card.currency,
      type: card.type,
      description: card.description,
      expiry_date: card.expiry_date,
      terms_and_conditions: card.terms_and_conditions || [],
      images: card.images || [],
      issue_date: card.issue_date,
    }))
  }, [cardsResponse])

  // Filter vendors based on search
  const filteredVendors = React.useMemo(() => {
    if (!vendorSearch) return vendors
    const searchLower = vendorSearch.toLowerCase()
    return vendors.filter((vendor: any) => vendor.branch_name.toLowerCase().includes(searchLower))
  }, [vendorSearch, vendors])

  // Get cards for selected vendor (excluding DashPro and DashGo)
  const vendorCards = React.useMemo(() => {
    if (!selectedVendor) return []
    return allCards.filter(
      (card: any) =>
        card.vendor_id === selectedVendor &&
        card.type?.toLowerCase() !== 'dashpro' &&
        card.type?.toLowerCase() !== 'dashgo',
    )
  }, [selectedVendor, allCards])

  const selectedVendorName = React.useMemo(() => {
    return vendors.find((v: any) => v.id === selectedVendor)?.branch_name || ''
  }, [selectedVendor, vendors])

  // Extract payment details from nested structure
  const paymentDetailsData = paymentDetailsResponse?.data || paymentDetailsResponse || {}
  const bankAccounts = paymentDetailsData?.bank_accounts || []
  const mobileMoneyAccounts = paymentDetailsData?.mobile_money_accounts || []
  const hasPaymentDetails = bankAccounts.length > 0 || mobileMoneyAccounts.length > 0
  // Get or create cart
  React.useEffect(() => {
    const cartsData = cartsResponse?.data || []
    if (step >= 2 && cartsData.length > 0 && !cartId) {
      // Use the first cart or create a new one
      setCartId(cartsData[0].cart_id)
    }
  }, [cartsResponse?.data, step, cartId])

  const downloadTemplate = () => {
    const example = `name,email,phone,message
John Doe,john.doe@example.com,+233551234567,Happy Birthday!
Jane Smith,jane.smith@example.com,+233551234568,Thank you for your service
Bob Johnson,bob.johnson@example.com,+233551234569,Welcome to the team!`
    const blob = new Blob([example], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-recipients-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    try {
      await uploadMutation.mutateAsync(file)
      toast.success('File uploaded successfully')

      // Fetch recipients from the API after upload
      queryClient.invalidateQueries({ queryKey: ['all-corporate-recipients'] })
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

  const handleVendorSelect = (vendorId: number) => {
    setSelectedVendor(vendorId)
    setSelectedCardId(null)
    setSelectedCardType(null)
    setSelectedRecipients(new Set())
    setDashGoAmount('')
  }

  const handleBackToVendors = () => {
    setSelectedVendor(null)
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
  }

  const handleDashGoSelect = () => {
    setSelectedCardType('dashgo')
    setSelectedCardId(selectedVendor || 0) // Use vendor ID as identifier for DashGo
    setSelectedRecipients(new Set())
  }

  const handleDashProSelect = () => {
    setSelectedCardType('dashpro')
    setSelectedCardId(0) // DashPro doesn't have a card ID
    setSelectedRecipients(new Set())
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
        const branchesArray = Array.isArray(branchesResponse)
          ? branchesResponse
          : branchesResponse?.data || []

        // Filter branches to only include those belonging to the selected vendor
        const vendorBranches = branchesArray.filter(
          (branch: any) => Number(branch.vendor_id) === Number(selectedVendor),
        )

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
                ? vendorBranches.map((branch: any) => ({ branch_id: Number(branch.id) }))
                : [],
          }

          await createDashGoMutation.mutateAsync(payload)
        } else if (selectedCardType === 'dashpro') {
          const payload = {
            recipient_ids: recipientIds,
            product: 'DashPro Gift Card',
            description: 'DashPro multi-vendor gift card',
            price: parseFloat(dashGoAmount || '0'),
            currency: 'GHS',
            issue_date: new Date().toISOString().split('T')[0],
          }

          await createDashProMutation.mutateAsync(payload)
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

  const handleAddCardsToCart = async () => {
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
          console.log('cartItem', cartItem)

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

      // Check if there are only DashGo/DashPro assignments (already created)
      const dashGoDashProAssignments = Object.entries(cardRecipientAssignments).filter(
        ([, assignment]) => assignment.cardType === 'dashgo' || assignment.cardType === 'dashpro',
      )

      if (regularCardAssignments.length === 0 && dashGoDashProAssignments.length > 0) {
        // Only DashGo/DashPro cards - they're already created, just proceed to checkout
        toast.success('Cards created and assigned successfully')
      } else if (regularCardAssignments.length > 0) {
        toast.success('Cards added to cart and recipients assigned successfully')
      }

      setStep(3)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add cards to cart')
    }
  }

  const handleCheckout = async () => {
    if (!userProfileData) {
      toast.error('Missing user information')
      return
    }

    // Check if there are any regular cards that need checkout
    const regularCardAssignments = Object.entries(cardRecipientAssignments).filter(
      ([, assignment]) => assignment.cardType === 'card',
    )

    // If there are no regular cards (only DashGo/DashPro), show success and close
    if (regularCardAssignments.length === 0) {
      toast.success('All cards have been created and assigned successfully!')
      setTimeout(() => {
        handleClose()
      }, 2000)
      return
    }

    // If there are regular cards but no cartId, try to get it from cartsResponse
    if (!cartId) {
      const cartsData = cartsResponse?.data || []
      if (cartsData.length > 0) {
        setCartId(cartsData[0].cart_id)
        // Retry checkout after setting cartId
        setTimeout(() => {
          handleCheckout()
        }, 100)
        return
      } else {
        toast.error('Missing cart information. Please try adding cards to cart again.')
        return
      }
    }

    // Calculate total amount from cardRecipientAssignments
    const totalAmount = Object.entries(cardRecipientAssignments).reduce((sum, [, assignment]) => {
      if (assignment.cardPrice) {
        return sum + assignment.cardPrice * assignment.recipientIds.length
      }
      // Fallback for regular cards
      const card = allCards.find((c: any) => c.card_id === assignment.cardId)
      if (card) {
        return sum + parseFloat(card.price) * assignment.recipientIds.length
      }
      return sum
    }, 0)

    try {
      const response = await checkoutMutation.mutateAsync({
        cart_id: cartId,
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

  const paymentForm = useForm<z.infer<typeof PaymentDetailsSchema>>({
    resolver: zodResolver(PaymentDetailsSchema),
    defaultValues: {
      payment_method: 'mobile_money',
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: '',
      branch: '',
      account_name: '',
      account_number: '',
      swift_code: '',
      sort_code: '',
    },
  })

  const paymentMethod = paymentForm.watch('payment_method')

  const mobileMoneyProviders = [
    { label: 'MTN', value: 'mtn' },
    { label: 'Vodafone', value: 'vodafone' },
    { label: 'AirtelTigo', value: 'airteltigo' },
  ]

  // Calculate total amount from cardRecipientAssignments for display
  const totalAmount = Object.values(cardRecipientAssignments).reduce((sum, assignment) => {
    return sum + (assignment.cardPrice || 0) * assignment.recipientIds.length
  }, 0)

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
          {[1, 2, 3].map((s) => (
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
                  {s === 1 ? 'Upload' : s === 2 ? 'Select Cards' : 'Checkout'}
                </span>
              </div>
              {s < 3 && (
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
                Upload an Excel or CSV file with recipient details (name, email, phone number,
                message). After uploading, you'll be able to assign gift cards to each recipient.
              </Text>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Text variant="span" weight="semibold" className="text-gray-900 block mb-2">
                  File Format Required
                </Text>
                <Text variant="p" className="text-sm text-gray-600 mb-2">
                  Your file must include the following columns:
                </Text>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>
                    <strong>name</strong> (required) - Recipient's full name
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
              label="Upload Recipients File (Excel/CSV)"
              accept=".csv,.xlsx,.xls"
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
            <Text variant="h6" weight="semibold" className="text-gray-900">
              Browse Cards & Assign Recipients ({uploadedRecipients.length} recipients)
            </Text>

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
                  <>
                    <DebouncedSearch
                      value={vendorSearch}
                      onChange={setVendorSearch}
                      placeholder="Search vendors..."
                      className="w-full"
                    />

                    {isLoadingVendors ? (
                      <div className="text-center py-12">
                        <Loader />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                        {filteredVendors.length === 0 ? (
                          <div className="col-span-full text-center py-12">
                            <Text variant="p" className="text-gray-500">
                              No vendors found
                            </Text>
                          </div>
                        ) : (
                          filteredVendors.map((vendor: any) => (
                            <div
                              key={vendor.id}
                              onClick={() => handleVendorSelect(vendor.id)}
                              className="cursor-pointer transition-all hover:scale-105"
                            >
                              <VendorItems
                                name={vendor.branch_name}
                                branches={vendor.shops}
                                rating={vendor.rating}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
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
                    <Button
                      variant="secondary"
                      onClick={handleAddCardsToCart}
                      disabled={Object.keys(cardRecipientAssignments).length === 0}
                    >
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
                {isLoadingCards ? (
                  <div className="text-center py-12">
                    <Loader />
                  </div>
                ) : vendorCards.length > 0 ? (
                  <div className="space-y-3">
                    <Text variant="span" weight="semibold" className="text-gray-900">
                      Other Cards
                    </Text>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto">
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
                              card_id={card.card_id}
                              product={card.product}
                              vendor_name={card.vendor_name}
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
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <Text variant="span" weight="medium" className="text-gray-700 block">
                        Select Recipients for{' '}
                        {selectedCardType === 'dashgo'
                          ? 'DashGo'
                          : selectedCardType === 'dashpro'
                            ? 'DashPro'
                            : selectedCardType === 'card'
                              ? cardsResponse?.data?.find((c: any) => c.card_id === selectedCardId)
                                  ?.product || 'this Card'
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
                  <Button
                    variant="secondary"
                    onClick={handleAddCardsToCart}
                    disabled={
                      Object.keys(cardRecipientAssignments).length === 0 ||
                      addToCartMutation.isPending
                    }
                    loading={addToCartMutation.isPending}
                  >
                    Add to Cart & Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Payment & Checkout */}
        {step === 3 && (
          <div className="space-y-6">
            <Text variant="h6" weight="semibold" className="text-gray-900">
              Review & Payment
            </Text>

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <Text variant="span" weight="semibold" className="text-gray-900 block">
                Cart Summary
              </Text>
              <div className="space-y-1">
                {Object.entries(cardRecipientAssignments).map(([key, assignment]) => {
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {assignment.cardName || 'Unknown Card'} × {assignment.recipientIds.length}{' '}
                        recipient(s)
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(
                          (assignment.cardPrice || 0) * assignment.recipientIds.length,
                          assignment.cardCurrency || 'GHS',
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <Text variant="span" weight="semibold" className="text-gray-900">
                  Total:
                </Text>
                <Text variant="span" weight="bold" className="text-lg text-primary-600">
                  {formatCurrency(totalAmount, 'GHS')}
                </Text>
              </div>
            </div>

            {/* Payment Details */}
            {!hasPaymentDetails ? (
              <form
                onSubmit={paymentForm.handleSubmit(async (data) => {
                  try {
                    await addPaymentMutation.mutateAsync(data)
                    toast.success('Payment details added successfully')
                    // Refresh payment details
                    queryClient.invalidateQueries({ queryKey: ['corporate-payment-details'] })
                  } catch (error: any) {
                    toast.error(error?.message || 'Failed to add payment details')
                  }
                })}
                className="space-y-4 border border-gray-200 rounded-lg p-4"
              >
                <Text variant="h6" weight="semibold" className="text-gray-900">
                  Add Payment Details
                </Text>

                <Controller
                  control={paymentForm.control}
                  name="payment_method"
                  render={({ field }) => (
                    <div>
                      <Text variant="span" className="text-sm font-medium text-gray-700 block mb-2">
                        Payment Method
                      </Text>
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="mobile_money" id="mobile-money" />
                            <label htmlFor="mobile-money" className="cursor-pointer text-sm">
                              Mobile Money
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="bank" id="bank" />
                            <label htmlFor="bank" className="cursor-pointer text-sm">
                              Bank Account
                            </label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                />

                {paymentMethod === 'mobile_money' && (
                  <div className="space-y-4">
                    <Controller
                      control={paymentForm.control}
                      name="mobile_money_provider"
                      render={({ field, fieldState: { error } }) => (
                        <Combobox
                          label="Mobile Money Provider"
                          options={mobileMoneyProviders}
                          {...field}
                          error={error?.message}
                          placeholder="Select provider"
                        />
                      )}
                    />
                    <Input
                      label="Mobile Money Number"
                      placeholder="Enter mobile money number"
                      {...paymentForm.register('mobile_money_number')}
                      error={paymentForm.formState.errors.mobile_money_number?.message}
                    />
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <Controller
                      control={paymentForm.control}
                      name="bank_name"
                      render={({ field, fieldState: { error } }) => (
                        <Combobox
                          label="Bank Name"
                          options={GHANA_BANKS.map((bank) => ({
                            label: bank.name,
                            value: bank.name,
                          }))}
                          {...field}
                          error={error?.message}
                          placeholder="Select bank"
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Bank Branch"
                        placeholder="Enter bank branch"
                        {...paymentForm.register('branch')}
                        error={paymentForm.formState.errors.branch?.message}
                      />
                      <Input
                        label="Account Number"
                        placeholder="Enter account number"
                        {...paymentForm.register('account_number')}
                        error={paymentForm.formState.errors.account_number?.message}
                      />
                    </div>
                    <Input
                      label="Account Name"
                      placeholder="Enter account holder name"
                      {...paymentForm.register('account_name')}
                      error={paymentForm.formState.errors.account_name?.message}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Sort Code"
                        placeholder="Enter sort code"
                        {...paymentForm.register('sort_code')}
                        error={paymentForm.formState.errors.sort_code?.message}
                      />
                      <Input
                        label="SWIFT Code"
                        placeholder="Enter SWIFT code"
                        {...paymentForm.register('swift_code')}
                        error={paymentForm.formState.errors.swift_code?.message}
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  disabled={addPaymentMutation.isPending}
                  loading={addPaymentMutation.isPending}
                >
                  Save Payment Details
                </Button>
              </form>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <Text variant="h6" weight="semibold" className="text-gray-900 mb-2">
                  Payment Details
                </Text>
                {bankAccounts.length > 0 && (
                  <div className="space-y-2">
                    <Text variant="span" weight="medium" className="text-sm text-gray-700 block">
                      Bank Accounts:
                    </Text>
                    {bankAccounts.map((account: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 pl-4">
                        <Text variant="span">
                          {account.bank_name} - {account.account_number} (
                          {account.account_holder_name})
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
                {mobileMoneyAccounts.length > 0 && (
                  <div className="space-y-2">
                    <Text variant="span" weight="medium" className="text-sm text-gray-700 block">
                      Mobile Money Accounts:
                    </Text>
                    {mobileMoneyAccounts.map((account: any, idx: number) => (
                      <div key={idx} className="text-sm text-gray-600 pl-4">
                        <Text variant="span" className="capitalize">
                          {account.mobile_money_provider} - {account.mobile_money_number}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="secondary"
                onClick={handleCheckout}
                // disabled={!cartId || !hasPaymentDetails || checkoutMutation.isPending}
                loading={checkoutMutation.isPending}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
