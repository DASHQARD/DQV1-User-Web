import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Modal } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import { useCart } from '../../hooks/useCart'
import type { RecipientResponse, CartItemResponse } from '@/types/cart'
import { usePersistedModalState, useToast } from '@/hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import { ENV_VARS, MODAL_NAMES } from '@/utils/constants'
import { bulkAssignRecipients, getRecipients } from '@/features/dashboard/services'
import { useAuthStore } from '@/stores'
import { userProfile } from '@/hooks'
import { usePayments } from '../../hooks'
import { useRecipientCards } from '../../hooks/useRecipientCards'

export default function Checkout() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { cartItems, isLoading: isLoadingCart } = useCart()
  const { user } = useAuthStore()
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

  // Get recipients for all carts - try fetching without status filter first
  const { data: recipientsData } = useQuery({
    queryKey: ['cart-recipients'],
    queryFn: () => getRecipients(),
    enabled: false,
  })

  const recipients = useMemo(() => recipientsData?.data || [], [recipientsData?.data])

  const { useRecipientCardsService, useGetRecipientByIDsService } = useRecipientCards()
  const { data: recipientCardsData } = useRecipientCardsService()
  const { data: recipientByIDsData } = useGetRecipientByIDsService(31)

  console.log('recipientCardsData', recipientCardsData)
  console.log('recipientByIDsData', recipientByIDsData)
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

    cartItems.forEach((cart: CartItemResponse) => {
      // Each cart has an items array
      if (cart.items && Array.isArray(cart.items)) {
        cart.items.forEach((item) => {
          flattened.push({
            cart_id: cart.cart_id,
            card_id: item.card_id,
            product: item.product,
            vendor_name: undefined, // May not be in nested structure
            type: item.type,
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
      (sum: number, cart: CartItemResponse) => sum + parseFloat(cart.total_amount || '0'),
      0,
    )
  }, [cartItems])

  // Calculate service fee (5%)
  const serviceFee = useMemo(() => totalAmount * 0.05, [totalAmount])

  // Calculate total amount due (total + service fee)
  const amountDue = useMemo(() => totalAmount + serviceFee, [totalAmount, serviceFee])

  // Get user information for checkout
  const userInfo = useMemo(() => {
    const userData = user as any
    const profile = userProfile as any

    return {
      user_id: userData?.id || profile?.id || 0,
      full_name: profile?.fullname || userData?.fullname || userData?.name || '',
      email: profile?.email || userData?.email || '',
      phone_number: profile?.phonenumber || userData?.phonenumber || userData?.phone || '',
    }
  }, [user, userProfile])

  // Handle checkout
  const handleCheckout = async () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      toast.error('No items in cart')
      return
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

    return checkoutMutation(payload)
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
  const getCardBackground = (type: string) => {
    const normalizedType = type?.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBg
      case 'dashpro':
        return DashproBg
      case 'dashgo':
        return DashxBg
      default:
        return DashxBg
    }
  }

  // Construct full image URL from file_url
  const getImageUrl = (fileUrl: string | undefined) => {
    if (!fileUrl) return ''

    // If it's already a full URL, return as-is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl
    }

    // Construct full URL from API base URL
    // Remove /api/v1 from base URL if present, then add /uploads/ path
    let baseUrl = ENV_VARS.API_BASE_URL
    if (baseUrl.endsWith('/api/v1')) {
      baseUrl = baseUrl.replace('/api/v1', '')
    }
    return `${baseUrl}/uploads/${fileUrl}`
  }

  // Group recipients by cart_id
  const recipientsByCart = useMemo(() => {
    const grouped: Record<number, RecipientResponse[]> = {}
    recipients.forEach((recipient) => {
      if (!grouped[recipient.cart_id]) {
        grouped[recipient.cart_id] = []
      }
      grouped[recipient.cart_id].push(recipient)
    })
    return grouped
  }, [recipients])

  const handleBulkUpload = () => {
    if (!bulkFile) {
      toast.error('Please select a file first')
      return
    }

    bulkAssignMutation.mutate(bulkFile)
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(numPrice)
  }

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0 || displayCartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon icon="bi:cart-x" className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-[#212529]">Your cart is empty</h2>
          <p className="text-grey-500 mb-4">Add items to your cart to proceed to checkout</p>
          <Button onClick={() => navigate('/dashqards')}>Browse Gift Cards</Button>
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
              const cardImageUrl = item.images?.[0]?.file_url
                ? getImageUrl(item.images[0].file_url)
                : null

              // Get card type display name
              const getCardTypeName = () => {
                const normalizedType = item.type?.toLowerCase()
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
                    return item.type?.toUpperCase() || 'CARD'
                }
              }

              return (
                <div
                  key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                >
                  <div className="flex gap-6 mb-4">
                    {/* Card Preview */}
                    <div
                      className="w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative shadow-md"
                      style={{ aspectRatio: '16/10' }}
                    >
                      {/* Card Background - show uploaded image if available, otherwise show default background */}
                      {cardImageUrl ? (
                        <img
                          src={cardImageUrl}
                          alt={item.product || 'Cart item'}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            // Hide uploaded image if it fails and show default background
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            // Show the card background
                            const backgroundImg = target.parentElement?.querySelector(
                              'img[alt*="card background"]',
                            ) as HTMLImageElement
                            if (backgroundImg) {
                              backgroundImg.classList.remove('opacity-0')
                              backgroundImg.classList.add('opacity-100')
                            }
                          }}
                        />
                      ) : null}

                      {/* Default Card Background - shown when no uploaded image or as fallback */}
                      <img
                        src={cardBackground}
                        alt={`${item.type} card background`}
                        className={`absolute inset-0 w-full h-full object-cover ${
                          cardImageUrl ? 'opacity-0' : 'opacity-100'
                        }`}
                      />

                      {/* Card Overlay Content */}
                      <div className="absolute inset-0 p-2 flex flex-col justify-between text-white pointer-events-none">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1">
                            <Icon icon="bi:gift" className="size-3" />
                            <span className="text-xs font-bold tracking-wide">
                              {getCardTypeName()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold">
                              {item.currency || 'GHS'} {displayPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {item.vendor_name && (
                          <div className="text-[10px] font-semibold uppercase truncate">
                            {item.vendor_name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[#212529] mb-2">
                        {item.product || `Card #${item.card_id}`}
                      </h3>
                      {item.vendor_name && (
                        <p className="text-sm text-grey-500 mb-2">{item.vendor_name}</p>
                      )}
                      <p className="text-lg font-semibold text-primary-500 mb-2">
                        {item.currency || 'GHS'} {displayPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-grey-500">Type: {item.type}</p>
                    </div>
                  </div>

                  {/* Recipients for this cart item */}
                  {itemRecipients.length > 0 && (
                    <div className="mb-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Recipients ({itemRecipients.length})
                      </h4>
                      <div className="space-y-2">
                        {itemRecipients.map((recipient) => (
                          <div
                            key={recipient.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{recipient.name}</p>
                              <p className="text-sm text-gray-600">{recipient.email}</p>
                              <p className="text-sm text-gray-600">{recipient.phone}</p>
                              {recipient.message && (
                                <p className="text-xs text-gray-500 italic mt-1">
                                  "{recipient.message}"
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary-500">
                                {formatPrice(recipient.amount)}
                              </p>
                              <span className="text-xs text-gray-500 capitalize">
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
                    Assign Recipient
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
                <div className="flex justify-between text-gray-700">
                  <span>Items ({displayCartItems.length})</span>
                  <span className="font-semibold">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Service Fee</span>
                  <span className="font-semibold">{formatPrice(serviceFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-[#212529]">
                    <span>Total</span>
                    <span className="text-primary-500">{formatPrice(amountDue)}</span>
                  </div>
                </div>
              </div>

              {/* Bulk Assign Button */}
              <Button
                onClick={() => setIsBulkModalOpen(true)}
                variant="outline"
                className="w-full mb-4"
              >
                <Icon icon="bi:upload" className="mr-2" />
                Bulk Assign
              </Button>

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
