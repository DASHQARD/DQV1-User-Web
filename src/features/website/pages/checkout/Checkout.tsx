import React, { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Modal, EmptyState, Input } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import { useCart } from '../../hooks/useCart'
import type { RecipientResponse, CartListResponse } from '@/types/responses'
import { usePersistedModalState, useToast } from '@/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/Dashx_bg.svg'
import { ENV_VARS, MODAL_NAMES } from '@/utils/constants'
import { bulkAssignRecipients } from '@/features/dashboard/services'
import { userProfile } from '@/hooks'
import { usePayments } from '../../hooks'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'
import { usePublicCatalogQueries } from '../../hooks/website/usePublicCatalogQueries'

// Schema for user information form
const UserInfoSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string().min(1, 'Phone number is required'),
})

type UserInfoFormData = z.infer<typeof UserInfoSchema>

export default function Checkout() {
  const { useGetCartAllRecipientsService } = usePublicCatalogQueries()
  const { data: cartAllRecipientsData } = useGetCartAllRecipientsService()
  console.log('cartAllRecipientsData', cartAllRecipientsData)
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { cartItems, isLoading: isLoadingCart } = useCart()

  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()
  console.log('userProfileData', userProfileData)
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

  // Fetch all recipients using /carts/all/recipients endpoint

  // Get all recipients from /carts/all/recipients endpoint
  const recipients = useMemo(() => {
    if (!cartAllRecipientsData?.data || !Array.isArray(cartAllRecipientsData.data)) {
      return []
    }
    return cartAllRecipientsData.data
  }, [cartAllRecipientsData])
  // Flatten cart items from nested structure
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
    recipients?: any[]
  }

  const displayCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []

    const flattened: FlattenedCartItem[] = []

    cartItems.forEach((cart: CartListResponse) => {
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
            price: item.total_amount,
            amount: item.total_amount,
            images: item.images,
            cart_item_id: item.cart_item_id,
            recipients: [], // Recipients come from separate API
          })
        })
      }
    })

    return flattened
  }, [cartItems])

  // Calculate total amount from cart totals
  const totalAmount = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0
    return cartItems.reduce(
      (sum: number, cart: CartListResponse) => sum + parseFloat(cart.total_amount || '0'),
      0,
    )
  }, [cartItems])

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
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
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
    const firstCart = cartItems[0]
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
        return DashxBg
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

  // Group recipients by cart_id
  const recipientsByCart = useMemo(() => {
    const grouped: Record<number, RecipientResponse[]> = {}
    recipients.forEach((recipient: RecipientResponse) => {
      if (recipient.cart_id) {
        if (!grouped[recipient.cart_id]) {
          grouped[recipient.cart_id] = []
        }
        grouped[recipient.cart_id].push(recipient)
      }
    })
    return grouped
  }, [recipients])

  // Get carts that have recipients
  const cartsWithRecipients = useMemo(() => {
    return new Set(Object.keys(recipientsByCart).map(Number))
  }, [recipientsByCart])

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

  if (!Array.isArray(cartItems) || cartItems.length === 0 || displayCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <EmptyState
            image={EmptyStateImage}
            title="Your cart is empty"
            description="Add items to your cart to proceed to checkout"
          />
          <Button onClick={() => navigate('/dashqards')} className="mt-6">
            Browse Gift Cards
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8fafc] to-[#e2e8f0]">
      <div className="wrapper py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#212529] mb-2">Checkout</h1>
          <p className="text-grey-500">
            Assign recipients to your gift cards before completing your purchase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information Card - Show if profile is incomplete */}

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-primary-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Icon icon="bi:person-fill" className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Complete Your Information</h3>
                  <p className="text-sm text-gray-600">
                    Please provide your details to proceed with checkout
                  </p>
                </div>
              </div>

              <form onSubmit={userInfoForm.handleSubmit(() => {})} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    {...userInfoForm.register('full_name')}
                    error={userInfoForm.formState.errors.full_name?.message}
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    {...userInfoForm.register('email')}
                    error={userInfoForm.formState.errors.email?.message}
                    placeholder="Enter your email address"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    {...userInfoForm.register('phone_number')}
                    error={userInfoForm.formState.errors.phone_number?.message}
                    placeholder="Enter your phone number"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                  <Icon icon="bi:info-circle" className="size-4" />
                  <span>This information will be used for your order confirmation</span>
                </div>
              </form>
            </div>

            {/* Cart Items */}
            {/* Cart Items */}
            {displayCartItems.map((item: FlattenedCartItem) => {
              const cardBackground = getCardBackground(item.type || '')
              const displayPrice = parseFloat(item.amount || '0')

              // Get recipients from fetched recipients API
              const fetchedRecipients = recipientsByCart[item.cart_id] || []

              // Use a Map to deduplicate recipients
              const recipientsMap = new Map<string | number, RecipientResponse>()

              // Helper function to get a unique key for a recipient
              const getRecipientKey = (r: RecipientResponse): string | number => {
                if (r.id) return r.id
                // Fallback to email + cart_id if no ID
                return `${r.email || ''}_${r.cart_id || item.cart_id}`
              }

              // Helper function to validate and normalize recipient
              const normalizeRecipient = (r: RecipientResponse): RecipientResponse | null => {
                // Filter out invalid recipients (missing name, email, or invalid amount)
                if (!r.name || !r.email) return null

                const amount =
                  typeof r.amount === 'number'
                    ? r.amount
                    : parseFloat(String(r.amount || item.amount))

                if (isNaN(amount) || amount <= 0) return null

                return {
                  ...r,
                  amount: amount,
                  cart_id: r.cart_id || item.cart_id,
                }
              }

              // Add fetched recipients
              fetchedRecipients.forEach((r: RecipientResponse) => {
                const normalized = normalizeRecipient(r)
                if (normalized) {
                  const key = getRecipientKey(normalized)
                  recipientsMap.set(key, normalized)
                }
              })

              const itemRecipients = Array.from(recipientsMap.values())
              const hasRecipients = cartsWithRecipients.has(item.cart_id)
              const cardImageUrl = item.images?.[0]?.file_url
                ? getImageUrl(item.images[0].file_url)
                : null

              // Generate QR code for the card
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`${item.product}-${item.card_id}`)}&bgcolor=FFFFFF&color=000000&margin=0`

              return (
                <div
                  key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}
                  className={`bg-white rounded-2xl shadow-lg p-6 border transition-shadow ${
                    hasRecipients
                      ? 'border-primary-300 hover:shadow-xl hover:border-primary-400'
                      : 'border-gray-100 hover:shadow-xl'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    {/* Card Preview */}
                    <div className="w-full sm:w-48 h-32 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative shadow-md">
                      {/* Card Background - always shown as fallback */}
                      <img
                        src={cardBackground}
                        alt={`${item.type} card background`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Uploaded Image - shown if available, falls back to background on error */}
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

                      {/* Card Overlay Content */}
                      <div className="absolute inset-0 p-2 flex flex-col justify-between text-white pointer-events-none">
                        {/* Top Section */}
                        <div className="flex items-start justify-between">
                          {/* Left: Card Type */}
                          <div className="flex items-center gap-1">
                            <Icon icon="bi:gift" className="size-3" />
                            <span className="text-xs font-bold tracking-wide">
                              {getCardTypeName(item.type)}
                            </span>
                          </div>
                          {/* Right: Price */}
                          <div className="text-right">
                            <span className="text-xs font-bold">
                              {formatCurrency(displayPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex items-end justify-between">
                          {/* Left: Product Name */}
                          <div className="text-[10px] font-semibold uppercase truncate max-w-[60%]">
                            {item.product}
                          </div>
                          {/* Right: QR Code */}
                          <div className="p-1 rounded bg-white/10 backdrop-blur-sm">
                            <img src={qrCodeUrl} alt="QR Code" className="w-8 h-8" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {item.product || `Card #${item.card_id}`}
                        </h3>
                        {hasRecipients && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                            <Icon icon="bi:check-circle" className="size-3" />
                            Has Recipients
                          </span>
                        )}
                      </div>
                      {item.vendor_name && (
                        <p className="text-sm text-gray-600 mb-2">{item.vendor_name}</p>
                      )}
                      <p className="text-lg font-semibold text-primary-500 mb-2">
                        {formatCurrency(displayPrice)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase">
                          {getCardTypeName(item.type)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">Card ID: {item.card_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipients for this cart item */}
                  {itemRecipients.length > 0 && (
                    <div className="mb-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Icon icon="bi:people" className="size-4" />
                        Recipients ({itemRecipients.length})
                      </h4>
                      <div className="space-y-3">
                        {itemRecipients.map((recipient) => (
                          <div
                            key={recipient.id}
                            className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 mb-1">{recipient.name}</p>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Icon icon="bi:envelope" className="size-3" />
                                  {recipient.email}
                                </p>
                                {recipient.phone && (
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Icon icon="bi:telephone" className="size-3" />
                                    {recipient.phone}
                                  </p>
                                )}
                                {recipient.message && (
                                  <p className="text-xs text-gray-500 italic mt-2 pl-4 border-l-2 border-primary-200">
                                    "{recipient.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-primary-500 mb-1">
                                {formatCurrency(recipient.amount)}
                              </p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 capitalize">
                                {recipient.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assign Recipient Button */}
                  <Button
                    onClick={() => {
                      if (!item.cart_item_id) {
                        toast.error('Cart item ID is required')
                        return
                      }
                      modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
                        cart_item_id: item.cart_item_id,
                        cardType: item.type,
                        cardProduct: item.product,
                        cardCurrency: item.currency || 'GHS',
                        amount: parseFloat(item.amount || '0'),
                      })
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Icon icon="bi:person-plus" className="mr-2" />
                    {itemRecipients.length > 0 ? 'Add Another Recipient' : 'Assign Recipient'}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-[#212529] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-sm">Items ({displayCartItems.length})</span>
                  <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span className="text-sm">Service Fee (5%)</span>
                  <span className="font-semibold">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-primary-500">
                      {formatCurrency(amountDue)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                // disabled={recipients.length === 0 || isCheckingOut}
                onClick={handleCheckout}
                loading={isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Complete Purchase'}
              </Button>
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
