import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Modal } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import { useCart } from '../../hooks/useCart'
import type { AssignRecipientPayload, RecipientResponse, CartItemResponse } from '@/types/cart'
import { useToast } from '@/hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import { ENV_VARS } from '@/utils/constants'
import { assignRecipient, bulkAssignRecipients, getRecipients } from '@/features/dashboard/services'

export default function Checkout() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { cartItems, isLoading: isLoadingCart } = useCart()
  const [selectedCartItem, setSelectedCartItem] = React.useState<CartItemResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false)
  const [bulkFile, setBulkFile] = React.useState<File | null>(null)

  // Get recipients for all carts - try fetching without status filter first
  const { data: recipientsData } = useQuery({
    queryKey: ['cart-recipients'],
    queryFn: () => getRecipients(),
    enabled: Array.isArray(cartItems) && cartItems.length > 0,
  })

  // Calculate total amount before early returns
  const totalAmount = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0
    return cartItems.reduce(
      (sum: number, item: CartItemResponse) => sum + parseFloat(item.amount),
      0,
    )
  }, [cartItems])

  const recipients = useMemo(() => recipientsData?.data || [], [recipientsData?.data])

  // Assign recipient mutation
  const assignMutation = useMutation({
    mutationFn: assignRecipient,
    onSuccess: () => {
      toast.success('Recipient assigned successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      setIsModalOpen(false)
      setSelectedCartItem(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to assign recipient')
    },
  })

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

  const handleAssignRecipient = (cartItem: CartItemResponse) => {
    setSelectedCartItem(cartItem)
    setIsModalOpen(true)
  }

  const handleSaveRecipient = (recipientData: {
    amount: number
    name?: string
    phone?: string
    email?: string
    message?: string
    assign_to_self?: boolean
  }) => {
    if (!selectedCartItem) return

    const assignToSelf = recipientData.assign_to_self !== false // Default to true if omitted

    const payload: AssignRecipientPayload = {
      cart_id: selectedCartItem.cart_id,
      message: recipientData.message || '',
      quantity: 1,
      amount: recipientData.amount,
      assign_to_self: assignToSelf,
    }

    // Only include name, email, phone if assign_to_self is false
    if (!assignToSelf) {
      if (!recipientData.name || !recipientData.phone || !recipientData.email) {
        toast.error('Name, email, and phone are required when assigning to someone else')
        return
      }
      payload.name = recipientData.name
      payload.email = recipientData.email
      payload.phone = recipientData.phone
    }

    assignMutation.mutate(payload)
  }

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

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
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
            {Array.isArray(cartItems) &&
              cartItems.map((item: CartItemResponse) => {
                const cardBackground = getCardBackground(item.type)
                const displayPrice = parseFloat(item.amount)

                // Get recipients from cart item's recipients array first, then merge with fetched recipients
                const cartItemRecipients = item.recipients || []
                const fetchedRecipients = recipientsByCart[item.cart_id] || []

                // Convert cart item recipients to RecipientResponse format
                const convertedCartRecipients: RecipientResponse[] = cartItemRecipients.map(
                  (r) => ({
                    id: r.id,
                    cart_id: item.cart_id,
                    name: r.name,
                    email: r.email,
                    phone: r.phone,
                    message: r.message || null,
                    quantity: 1,
                    amount: parseFloat(item.amount),
                    status: 'pending',
                    created_at: r.created_at,
                    updated_at: r.created_at,
                  }),
                )

                // Remove duplicates by id, keeping fetched recipients if duplicate
                const recipientsMap = new Map<number, RecipientResponse>()
                convertedCartRecipients.forEach((r: RecipientResponse) =>
                  recipientsMap.set(r.id, r),
                )
                fetchedRecipients.forEach((r: RecipientResponse) => recipientsMap.set(r.id, r)) // Overwrite with fetched if duplicate

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
                    key={item.cart_id}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex gap-6 mb-4">
                      {/* Card Preview */}
                      <div
                        className="w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 relative shadow-md"
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
                                {item.currency} {displayPrice.toFixed(2)}
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
                          {item.currency} {displayPrice.toFixed(2)}
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
                      onClick={() => handleAssignRecipient(item)}
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
                  <span>Items ({Array.isArray(cartItems) ? cartItems.length : 0})</span>
                  <span className="font-semibold">{formatPrice(totalAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-[#212529]">
                    <span>Total</span>
                    <span className="text-primary-500">{formatPrice(totalAmount)}</span>
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

              <Button variant="secondary" className="w-full" disabled={recipients.length === 0}>
                Complete Purchase
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Recipient Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCartItem(null)
        }}
        initialData={
          selectedCartItem
            ? {
                amount: parseFloat(selectedCartItem.amount),
              }
            : null
        }
        onSave={handleSaveRecipient}
        showTrigger={false}
        cardType={selectedCartItem?.type}
        cardProduct={selectedCartItem?.product}
        cardCurrency={selectedCartItem?.currency || 'GHS'}
      />

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
