import React, { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Modal, EmptyState, Input } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import { useCart } from '../../hooks/useCart'
import type { CartListResponse } from '@/types/responses'
import { usePersistedModalState, useToast } from '@/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/dashpass_bg.svg'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { ENV_VARS, MODAL_NAMES } from '@/utils/constants'
import { bulkAssignRecipients } from '@/features/dashboard/services'
import { userProfile } from '@/hooks'
import { usePayments } from '../../hooks'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'

// Schema for user information form
const UserInfoSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string().min(1, 'Phone number is required'),
})

type UserInfoFormData = z.infer<typeof UserInfoSchema>

export default function Checkout() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { cartItems, isLoading: isLoadingCart } = useCart()

  // Filter out paid carts - only show pending carts
  const pendingCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return cartItems.filter(
      (cart: CartListResponse) => cart.cart_status?.toLowerCase() === 'pending',
    )
  }, [cartItems])

  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const { useCheckoutService } = usePayments()
  const { mutateAsync: checkoutMutation, isPending: isCheckingOut } = useCheckoutService()
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false)
  const [bulkFile, setBulkFile] = React.useState<File | null>(null)
  const modal = usePersistedModalState({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })

  // Form for user information if profile is incomplete
  const userInfoForm = useForm<UserInfoFormData>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: {
      full_name: userProfileData?.fullname || '',
      email: userProfileData?.email || '',
      phone_number: userProfileData?.phonenumber || '',
    },
  })

  // Update form when userProfileData changes
  React.useEffect(() => {
    if (userProfileData) {
      userInfoForm.reset({
        full_name: userProfileData?.fullname || '',
        email: userProfileData?.email || '',
        phone_number: userProfileData?.phonenumber || '',
      })
    }
  }, [userProfileData, userInfoForm])

  // Flatten cart items from nested structure
  // Recipients are now included directly in the cart items from /carts endpoint
  type FlattenedCartItem = {
    cart_id: number
    card_id: number
    product: string
    vendor_name?: string
    type: string
    currency: string
    price: string
    amount: string
    images?: Array<{ file_url: string; file_name: string }>
    cart_item_id?: number
    total_quantity?: number
    recipients?: Array<{
      email: string
      phone: string
      message: string
      name?: string
      amount?: string
    }>
  }

  const displayCartItems = useMemo(() => {
    if (!Array.isArray(pendingCartItems)) return []

    const flattened: FlattenedCartItem[] = []

    pendingCartItems.forEach((cart: CartListResponse) => {
      // Each cart has an items object (not array in the new structure)
      if (cart.items) {
        // Handle both array and single object cases
        const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]

        itemsArray.forEach((item: any) => {
          flattened.push({
            cart_id: cart.cart_id,
            card_id: item.card_id,
            product: item.product,
            vendor_name: undefined, // May not be in nested structure
            type: item.type || 'dashx',
            currency: 'GHS', // Default, adjust if available
            price: item.total_amount?.toString() || '0',
            amount: item.total_amount?.toString() || '0',
            images: item.images || [],
            cart_item_id: item.cart_item_id,
            total_quantity: item.total_quantity || 1,
            recipients: item.recipients || [], // Recipients are now included in cart items
          })
        })
      }
    })

    return flattened
  }, [pendingCartItems])

  // Calculate total amount from cart totals
  const totalAmount = useMemo(() => {
    if (!Array.isArray(pendingCartItems)) return 0
    return pendingCartItems.reduce(
      (sum: number, cart: CartListResponse) => sum + parseFloat(cart.total_amount || '0'),
      0,
    )
  }, [pendingCartItems])

  // Calculate service fee (5%)
  const serviceFee = useMemo(() => totalAmount * 0.05, [totalAmount])

  // Calculate total amount due (total + service fee)
  const amountDue = useMemo(() => totalAmount + serviceFee, [totalAmount, serviceFee])

  // Get user information for checkout - use form data if profile is incomplete
  const userInfo = useMemo(() => {
    const profile = userProfileData as any
    const formData = userInfoForm.getValues()

    // Check if profile has complete information
    const hasCompleteProfile = profile?.fullname && profile?.email && profile?.phonenumber

    return {
      user_id: profile?.id || 0,
      full_name: hasCompleteProfile ? profile.fullname : formData.full_name,
      email: hasCompleteProfile ? profile.email : formData.email,
      phone_number: hasCompleteProfile ? profile.phonenumber : formData.phone_number,
    }
  }, [userProfileData, userInfoForm])

  // Check if user information is incomplete
  const isUserInfoIncomplete = useMemo(() => {
    const profile = userProfileData as any
    return !profile?.fullname || !profile?.email || !profile?.phonenumber
  }, [userProfileData])

  // Handle checkout
  const handleCheckout = async () => {
    if (!Array.isArray(pendingCartItems) || pendingCartItems.length === 0) {
      toast.error('No items in cart')
      return
    }

    // Validate form if user info is incomplete
    if (isUserInfoIncomplete) {
      const isValid = await userInfoForm.trigger()
      if (!isValid) {
        toast.error('Please complete all required fields')
        return
      }
    }

    // Validate user information
    if (!userInfo.user_id || !userInfo.full_name || !userInfo.email || !userInfo.phone_number) {
      toast.error('Please complete your profile information before checkout')
      return
    }

    // Validate recipients
    // if (recipients.length === 0) {
    //   toast.error('Please assign recipients to your gift cards before checkout')
    //   return
    // }

    // Use the first cart's ID (or you might want to handle multiple carts differently)
    const firstCart = pendingCartItems[0]
    const payload = {
      cart_id: firstCart.cart_id,
      full_name: userInfo.full_name,
      email: userInfo.email,
      phone_number: userInfo.phone_number,
      amount_due: amountDue,
      user_id: userInfo.user_id,
    }

    await checkoutMutation(payload)
  }

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: bulkAssignRecipients,
    onSuccess: () => {
      toast.success('Bulk assignment completed successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      setIsBulkModalOpen(false)
      setBulkFile(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to bulk assign recipients')
    },
  })

  // Get card background based on type
  const getCardBackground = useCallback((type: string) => {
    const normalizedType = type?.toLowerCase().trim()
    switch (normalizedType) {
      case 'dashx':
        return DashxBg
      case 'dashpro':
        return DashproBg
      case 'dashpass':
        return DashpassBg
      case 'dashgo':
        return DashgoBg
      default:
        return DashxBg
    }
  }, [])

  // Construct full image URL from file_url
  const getImageUrl = useCallback((fileUrl: string | undefined) => {
    if (!fileUrl) return ''

    // If it's already a full URL or base64, return as-is
    if (
      fileUrl.startsWith('http://') ||
      fileUrl.startsWith('https://') ||
      fileUrl.startsWith('data:')
    ) {
      return fileUrl
    }

    // Construct full URL from API base URL
    // Remove /api/v1 from base URL if present, then add /uploads/ path
    let baseUrl = ENV_VARS.API_BASE_URL
    if (baseUrl.endsWith('/api/v1')) {
      baseUrl = baseUrl.replace('/api/v1', '')
    }
    return `${baseUrl}/uploads/${fileUrl}`
  }, [])

  // Group recipients by cart_item_id from cart items (recipients are now included in cart response)
  const recipientsByCartItem = useMemo(() => {
    const grouped: Record<number, any[]> = {}

    displayCartItems.forEach((item: FlattenedCartItem) => {
      if (item.cart_item_id && item.recipients && item.recipients.length > 0) {
        // Calculate per-recipient amount: total_amount / total_quantity
        const totalAmount = parseFloat(item.amount || '0')
        const totalQuantity = item.total_quantity || 1
        const perRecipientAmount = totalAmount / totalQuantity

        grouped[item.cart_item_id] = item.recipients.map((recipient, index) => ({
          id: `${item.cart_item_id}-${index}`, // Generate unique ID
          name: recipient.name || recipient.email?.split('@')[0] || 'Recipient',
          email: recipient.email,
          phone: recipient.phone,
          message: recipient.message || '',
          amount: parseFloat(recipient.amount || perRecipientAmount.toString() || '0'),
          cart_id: item.cart_id,
          cart_item_id: item.cart_item_id,
        }))
      }
    })

    return grouped
  }, [displayCartItems])

  const handleBulkUpload = useCallback(() => {
    if (!bulkFile) {
      toast.error('Please select a file first')
      return
    }

    bulkAssignMutation.mutate(bulkFile)
  }, [bulkFile, bulkAssignMutation, toast])

  // Get card type display name
  const getCardTypeName = useCallback((type: string | undefined) => {
    const normalizedType = type?.toLowerCase().trim()
    switch (normalizedType) {
      case 'dashx':
        return 'DASHX'
      case 'dashpro':
        return 'DASHPRO'
      case 'dashgo':
        return 'DASHGO'
      case 'dashpass':
        return 'DASHPASS'
      default:
        return type?.toUpperCase() || 'DASHQARD'
    }
  }, [])

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (
    !Array.isArray(pendingCartItems) ||
    pendingCartItems.length === 0 ||
    displayCartItems.length === 0
  ) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <EmptyState
            image={EmptyStateImage}
            title="Your cart is empty"
            description="Add items to your cart to proceed to checkout"
          />
          <Button
            onClick={() => navigate('/dashqards')}
            className="mt-6 mx-auto"
            variant="secondary"
          >
            Browse Gift Cards
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="wrapper py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* User Information Section */}
            {isUserInfoIncomplete && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <form onSubmit={userInfoForm.handleSubmit(() => {})} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        {...userInfoForm.register('full_name')}
                        error={userInfoForm.formState.errors.full_name?.message}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        {...userInfoForm.register('phone_number')}
                        error={userInfoForm.formState.errors.phone_number?.message}
                        placeholder="+233 XX XXX XXXX"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      {...userInfoForm.register('email')}
                      error={userInfoForm.formState.errors.email?.message}
                      placeholder="john@example.com"
                      className="w-full"
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Order Items Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {displayCartItems
                  ?.filter((item: FlattenedCartItem) => item.cart_item_id)
                  .map((item: FlattenedCartItem) => {
                    const cardBackground = getCardBackground(item.type || '')
                    const displayPrice = parseFloat(item.amount || '0')

                    // Get recipients from cart item (recipients are now included in cart response)
                    const itemRecipients =
                      item.cart_item_id && recipientsByCartItem[item.cart_item_id]
                        ? recipientsByCartItem[item.cart_item_id]
                        : []

                    const hasRecipients = itemRecipients.length > 0
                    const cardImageUrl = item.images?.[0]?.file_url
                      ? getImageUrl(item.images[0].file_url)
                      : null

                    return (
                      <div
                        key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}
                        className="p-6"
                      >
                        <div className="flex gap-4">
                          {/* Card Preview */}
                          <div className="w-24 h-16 shrink-0 rounded-md overflow-hidden bg-gray-200 relative">
                            <img
                              src={cardBackground}
                              alt={`${item.type} card background`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {cardImageUrl && (
                              <img
                                src={cardImageUrl}
                                alt={item.product || 'Cart item'}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                  {item.product || `Card #${item.card_id}`}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                  <span>{getCardTypeName(item.type)}</span>
                                  <span>•</span>
                                  <span>ID: {item.card_id}</span>
                                </div>
                                {hasRecipients && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <Icon icon="bi:check-circle" className="size-3" />
                                    {itemRecipients.length} Recipient
                                    {itemRecipients.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-base font-semibold text-gray-900">
                                  {formatCurrency(displayPrice)}
                                </p>
                              </div>
                            </div>

                            {/* Recipients List */}
                            {itemRecipients.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="space-y-2">
                                  {itemRecipients.map((recipient) => (
                                    <div
                                      key={recipient.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                          {recipient.name}
                                        </p>
                                        <p className="text-gray-500 truncate">{recipient.email}</p>
                                      </div>
                                      <span className="ml-4 text-gray-600 font-medium">
                                        {formatCurrency(recipient.amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Assign Recipient Button */}
                            <div className="mt-4">
                              {/* Only show button if quantity allows more recipients */}
                              {itemRecipients.length < (item.total_quantity || 1) && (
                                <Button
                                  onClick={() => {
                                    if (!item.cart_item_id) {
                                      toast.error('Cart item ID is required')
                                      return
                                    }
                                    // Calculate per-recipient amount: total_amount / total_quantity
                                    const totalAmount = parseFloat(item.amount || '0')
                                    const totalQuantity = item.total_quantity || 1
                                    const perRecipientAmount = totalAmount / totalQuantity

                                    modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
                                      cart_item_id: item.cart_item_id,
                                      cardType: item.type,
                                      cardProduct: item.product,
                                      cardCurrency: item.currency || 'GHS',
                                      amount: perRecipientAmount,
                                    })
                                  }}
                                  variant="outline"
                                  size="small"
                                  className="w-full sm:w-auto"
                                >
                                  <Icon icon="bi:person-plus" className="mr-1.5" />
                                  {itemRecipients.length > 0
                                    ? 'Add Another Recipient'
                                    : 'Assign Recipient'}
                                </Button>
                              )}
                              {/* Show message when all recipients have been assigned */}
                              {itemRecipients.length >= (item.total_quantity || 1) && (
                                <div className="text-sm text-gray-500 italic">
                                  Maximum recipients reached (quantity: {item.total_quantity || 1})
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({displayCartItems.length} items)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(amountDue)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCheckout}
                loading={isCheckingOut}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Complete Purchase'}
              </Button>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <Icon icon="bi:shield-check" className="size-4 shrink-0 mt-0.5" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Recipient Modal */}
      <PurchaseModal />

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        setIsOpen={setIsBulkModalOpen}
        title="Bulk Assign Recipients"
        panelClass="max-w-2xl"
      >
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Upload a file containing recipient information. The file should be in CSV or Excel
            format with columns: name, email, phone, message, quantity, amount.
          </p>

          <FileUploader
            label="Upload Recipients File"
            accept=".csv,.xlsx,.xls"
            value={bulkFile}
            onChange={setBulkFile}
          />

          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkModalOpen(false)
                setBulkFile(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleBulkUpload}
              disabled={!bulkFile || bulkAssignMutation.isPending}
              loading={bulkAssignMutation.isPending}
            >
              Upload & Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
