import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader, Button, Text } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Icon } from '@/libs'
import { formatCurrency } from '@/utils/format'
import { usePublicCatalogQueries } from '../../hooks/website'
import { useCart } from '../../hooks/useCart'
import { useCartStore } from '@/stores/cart'
import { usePresignedURL } from '@/hooks'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/Dashx_bg.svg'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'

export default function CardDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usePublicCardsService, usePublicVendorsService } = usePublicCatalogQueries()
  const { data: cardsResponse, isLoading } = usePublicCardsService()
  const { addToCartAsync, isAdding } = useCart()
  const { openCart } = useCartStore()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()

  // Find card by ID - handle both string and number comparison
  const card = React.useMemo(() => {
    if (!cardsResponse || !id) return null
    const cards = Array.isArray(cardsResponse) ? cardsResponse : []
    return (
      cards.find((c: any) => c.card_id?.toString() === id || (c as any).id?.toString() === id) ||
      null
    )
  }, [cardsResponse, id])

  // Fetch vendor details to get branch information for redemption
  const { data: vendorDetailsResponse } = usePublicVendorsService(
    card?.vendor_id
      ? {
          vendor_id: String(card.vendor_id),
        }
      : undefined,
  )

  // Extract redemption branches from vendor details
  const redemptionBranches = React.useMemo(() => {
    if (!vendorDetailsResponse || !card) return []

    // Handle both array response and wrapped response
    const vendors = Array.isArray(vendorDetailsResponse)
      ? vendorDetailsResponse
      : (vendorDetailsResponse as any)?.data || []

    // Find the vendor that matches the card's vendor_id
    const vendor = vendors.find((v: any) => String(v.vendor_id || v.id) === String(card.vendor_id))

    if (!vendor?.branches_with_cards) {
      // If no branches found but card has branch info, use that
      if ((card as any).branch_name) {
        return [
          {
            branch_name: (card as any).branch_name,
            branch_location: (card as any).branch_location || '',
          },
        ]
      }
      return []
    }

    // Find branches that have this card
    const branches: Array<{ branch_name: string; branch_location: string }> = []
    vendor.branches_with_cards.forEach((branch: any) => {
      if (branch.cards && Array.isArray(branch.cards)) {
        const hasCard = branch.cards.some(
          (c: any) =>
            (c.card_id || c.id)?.toString() === (card.card_id || (card as any).id)?.toString(),
        )
        if (hasCard && branch.branch_name) {
          branches.push({
            branch_name: branch.branch_name,
            branch_location: branch.branch_location || '',
          })
        }
      }
    })

    // If no branches found but card has branch info, use that
    if (branches.length === 0 && (card as any).branch_name) {
      branches.push({
        branch_name: (card as any).branch_name,
        branch_location: (card as any).branch_location || '',
      })
    }

    return branches
  }, [vendorDetailsResponse, card])

  // Fetch presigned URLs for images and terms
  const [imageUrls, setImageUrls] = React.useState<Record<number | string, string>>({})
  const [termsUrls, setTermsUrls] = React.useState<Record<number | string, string>>({})
  const [isLoadingImages, setIsLoadingImages] = React.useState(false)
  const [isLoadingTerms, setIsLoadingTerms] = React.useState(false)

  React.useEffect(() => {
    if (!card) {
      setImageUrls({})
      setTermsUrls({})
      setIsLoadingImages(false)
      setIsLoadingTerms(false)
      return
    }

    let cancelled = false

    // Fetch image URLs
    if (card.images && card.images.length > 0) {
      setIsLoadingImages(true)

      const fetchImageUrls = async () => {
        try {
          const imagePromises = card.images.map(async (image: any, index: number) => {
            try {
              const response = await fetchPresignedURL(image.file_url)
              // Handle both string response and object with url property
              const url =
                typeof response === 'string' ? response : (response as any)?.url || response
              return { key: image.id || image.file_name || index, url }
            } catch (error) {
              console.error('Failed to fetch presigned URL for image:', error)
              return { key: image.id || image.file_name || index, url: null }
            }
          })

          const results = await Promise.all(imagePromises)
          if (!cancelled) {
            const urlMap: Record<number | string, string> = {}
            results.forEach((result) => {
              if (result.url) {
                urlMap[result.key] = result.url
              }
            })
            setImageUrls(urlMap)
            setIsLoadingImages(false)
          }
        } catch (error) {
          console.error('Failed to fetch image URLs:', error)
          if (!cancelled) {
            setIsLoadingImages(false)
          }
        }
      }

      fetchImageUrls()
    } else {
      setImageUrls({})
      setIsLoadingImages(false)
    }

    // Fetch terms URLs
    if (card.terms_and_conditions && card.terms_and_conditions.length > 0) {
      setIsLoadingTerms(true)

      const fetchTermsUrls = async () => {
        try {
          const termsPromises = card.terms_and_conditions.map(async (term: any, index: number) => {
            try {
              const response = await fetchPresignedURL(term.file_url)
              // Handle both string response and object with url property
              const url =
                typeof response === 'string' ? response : (response as any)?.url || response
              return { key: term.id || term.file_name || index, url }
            } catch (error) {
              console.error('Failed to fetch presigned URL for term:', error)
              return { key: term.id || term.file_name || index, url: null }
            }
          })

          const results = await Promise.all(termsPromises)
          if (!cancelled) {
            const urlMap: Record<number | string, string> = {}
            results.forEach((result) => {
              if (result.url) {
                urlMap[result.key] = result.url
              }
            })
            setTermsUrls(urlMap)
            setIsLoadingTerms(false)
          }
        } catch (error) {
          console.error('Failed to fetch terms URLs:', error)
          if (!cancelled) {
            setIsLoadingTerms(false)
          }
        }
      }

      fetchTermsUrls()
    } else {
      setTermsUrls({})
      setIsLoadingTerms(false)
    }

    return () => {
      cancelled = true
    }
  }, [card, fetchPresignedURL])

  // Get card background based on type
  const getCardBackground = React.useCallback(() => {
    if (!card?.type) return DashxBg
    const normalizedType = card.type.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBg
      case 'dashpro':
        return DashproBg
      case 'dashpass':
        return DashpassBg
      case 'dashgo':
        return DashGoBg
      default:
        return DashxBg
    }
  }, [card?.type])

  // Get card type display name
  const getCardTypeName = React.useCallback(() => {
    if (!card?.type) return 'DASHQARD'
    const normalizedType = card.type.toLowerCase()
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
        return 'DASHQARD'
    }
  }, [card?.type])

  const handleAddToCart = async () => {
    if (!card || !id) return

    await addToCartAsync({
      card_id: card.card_id || (card as any).id,
      quantity: 1,
    } as any)
    openCart()
  }

  // Generate QR code for the card
  const qrCodeUrl = card
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${card.product}-${card.card_id || (card as any).id}`)}&bgcolor=FFFFFF&color=402D87&margin=10`
    : ''

  // Get image URL from presigned URLs or fallback
  const getImageUrl = React.useCallback(
    (image: any, index: number) => {
      const key = image.id || image.file_name || index
      // Use presigned URL if available
      if (imageUrls[key]) {
        return imageUrls[key]
      }
      // Fallback: if file_url is already a full URL, use it
      if (image.file_url?.startsWith('http://') || image.file_url?.startsWith('https://')) {
        return image.file_url
      }
      // Fallback: if it's a base64 data URL, use it
      if (image.file_url?.startsWith('data:')) {
        return image.file_url
      }
      return ''
    },
    [imageUrls],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Card not found</h2>
          <p className="text-gray-500 mb-4">The card you're looking for doesn't exist.</p>
          <Link
            to={ROUTES.IN_APP.DASHQARDS}
            className="text-primary-500 font-semibold hover:underline"
          >
            Browse all cards
          </Link>
        </div>
      </div>
    )
  }

  const displayPrice = parseFloat(card.price) || 0
  const cardBackground = getCardBackground()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="wrapper py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to={ROUTES.IN_APP.HOME} className="hover:text-primary-500">
            Home
          </Link>
          <Icon icon="bi:chevron-right" className="size-4" />
          <Link to={ROUTES.IN_APP.DASHQARDS} className="hover:text-primary-500">
            Cards
          </Link>
          <Icon icon="bi:chevron-right" className="size-4" />
          <span className="text-gray-900">{card.product}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Card Image */}
          <div className="space-y-4">
            {/* Main Card Display */}
            <div
              className="relative overflow-hidden rounded-2xl bg-gray-200"
              style={{ paddingTop: '62.5%' }}
            >
              <img
                src={cardBackground}
                alt={`${card.product} card background`}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Card Overlay Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  {/* Left: Card Type */}
                  <div className="flex items-center gap-2">
                    <Icon icon="bi:gift" className="size-6" />
                    <span className="font-extrabold text-xl tracking-wide">
                      {getCardTypeName()}
                    </span>
                  </div>

                  {/* Right: Price */}
                  <div className="text-right">
                    <span className="text-3xl font-extrabold">{displayPrice.toFixed(2)}</span>
                    <span className="text-lg ml-1">{card.currency}</span>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex items-end justify-between">
                  {/* Left: Vendor Name */}
                  {card.vendor_name && (
                    <div>
                      <span className="font-bold text-lg tracking-wide uppercase">
                        {card.vendor_name}
                      </span>
                    </div>
                  )}

                  {/* Right: QR Code */}
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {card.images && card.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {card.images.slice(0, 4).map((image: any, index: number) => {
                  const imageUrl = getImageUrl(image, index)
                  return (
                    <div
                      key={image.id || image.file_name || index}
                      className="relative overflow-hidden rounded-lg bg-gray-200"
                      style={{ paddingTop: '100%' }}
                    >
                      {isLoadingImages ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader />
                        </div>
                      ) : imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${card.product} image ${index + 1}`}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Icon icon="bi:image" className="size-8" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column - Card Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="pt-6 flex flex-col gap-3">
              {card.vendor_name && (
                <button
                  onClick={() =>
                    navigate(
                      `/vendor?vendor_id=${card.vendor_id}&name=${encodeURIComponent(card.vendor_name || '')}`,
                    )
                  }
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium w-fit"
                >
                  <Icon icon="bi:shop" className="text-base" />
                  <span>{card.vendor_name}</span>
                  <Icon icon="bi:arrow-right" className="text-xs" />
                </button>
              )}

              <Text variant="h1" weight="bold" className="text-gray-900 text-3xl">
                {card.product}
              </Text>
              <div className="flex items-baseline gap-2">
                <Text variant="h2" weight="bold" className="text-primary-600 text-4xl">
                  {formatCurrency(displayPrice, card.currency || 'GHS')}
                </Text>
                <Text variant="span" className="text-gray-500 text-lg">
                  Gift Card
                </Text>
              </div>
            </div>

            {/* Description */}
            {card.description && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Icon icon="bi:card-text" className="text-primary-600 text-xl" />
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    About This Card
                  </Text>
                </div>
                <Text variant="p" className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {card.description}
                </Text>
              </div>
            )}

            {/* Card Information */}
            <div className="space-y-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="bi:info-circle" className="text-primary-600 text-xl" />
                <Text variant="h3" weight="semibold" className="text-gray-900">
                  Card Information
                </Text>
              </div>
              <div className="space-y-4">
                {card.expiry_date && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Icon icon="bi:calendar-check" className="text-gray-400 text-lg" />
                      <span className="text-sm text-gray-600">Valid Until</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(card.expiry_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {card.status && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Icon icon="bi:check-circle" className="text-gray-400 text-lg" />
                      <span className="text-sm text-gray-600">Status</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        card.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="bi:currency-exchange" className="text-gray-400 text-lg" />
                    <span className="text-sm text-gray-600">Currency</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {card.currency || 'GHS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Redemption Locations */}
            {redemptionBranches.length > 0 && (
              <div className="space-y-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="bi:geo-alt" className="text-primary-600 text-xl" />
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    Where to Redeem
                  </Text>
                </div>
                <div className="space-y-3">
                  {redemptionBranches.map((branch, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors"
                    >
                      <Icon
                        icon="bi:shop"
                        className="text-primary-600 text-lg mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Text variant="span" weight="semibold" className="text-gray-900 block">
                          {branch.branch_name}
                        </Text>
                        {branch.branch_location && (
                          <Text variant="span" className="text-sm text-gray-600 block mt-1">
                            {branch.branch_location}
                          </Text>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Icon
                      icon="bi:info-circle"
                      className="text-blue-600 text-lg mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <Text variant="span" weight="medium" className="text-blue-900 text-sm block">
                        How to Redeem
                      </Text>
                      <Text variant="span" className="text-blue-700 text-xs block mt-1">
                        Visit any of the locations above to redeem your gift card. Present your card
                        QR code or card details at the point of purchase.
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Redemption Instructions */}
            <div className="space-y-4 p-6 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border border-primary-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="bi:card-checklist" className="text-primary-600 text-xl" />
                <Text variant="h3" weight="semibold" className="text-gray-900">
                  Redemption Instructions
                </Text>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <Text variant="p" className="text-sm text-gray-700">
                    Purchase this gift card and receive it in your account
                  </Text>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <Text variant="p" className="text-sm text-gray-700">
                    Visit any redemption location listed above
                  </Text>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <Text variant="p" className="text-sm text-gray-700">
                    Present your card QR code or details at checkout
                  </Text>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <Text variant="p" className="text-sm text-gray-700">
                    Enjoy your purchase! The amount will be deducted from your card balance
                  </Text>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary-200">
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.IN_APP.REDEEM)}
                  className="w-full border-primary-300 text-primary-700 hover:bg-primary-100"
                >
                  <Icon icon="bi:arrow-right-circle" className="mr-2" />
                  Redeem Your Card
                </Button>
              </div>
            </div>

            {/* Terms and Conditions */}
            {card.terms_and_conditions && card.terms_and_conditions.length > 0 && (
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="bi:file-earmark-text" className="text-primary-600 text-xl" />
                  <Text variant="h3" weight="semibold" className="text-gray-900">
                    Terms & Conditions
                  </Text>
                </div>
                <div className="space-y-2">
                  {card.terms_and_conditions.map((term: any, index: number) => {
                    const termKey = term.id || term.file_name || index
                    const termUrl =
                      termsUrls[termKey] ||
                      (term.file_url?.startsWith('http://') || term.file_url?.startsWith('https://')
                        ? term.file_url
                        : null)

                    return (
                      <a
                        key={termKey}
                        href={termUrl || '#'}
                        target={termUrl ? '_blank' : undefined}
                        rel={termUrl ? 'noopener noreferrer' : undefined}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          termUrl
                            ? 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-primary-600'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (!termUrl) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Icon icon="bi:file-earmark-pdf" className="text-lg" />
                        <span className="flex-1 font-medium">
                          {term.file_name || `Terms & Conditions ${index + 1}`}
                        </span>
                        {isLoadingTerms ? (
                          <div className="size-4">
                            <Loader />
                          </div>
                        ) : termUrl ? (
                          <Icon icon="bi:box-arrow-up-right" className="text-lg" />
                        ) : (
                          <Icon icon="bi:x-circle" className="text-lg" />
                        )}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                loading={isAdding}
                variant="secondary"
                className="flex-1 bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-full shadow-lg"
              >
                <Icon icon="bi:cart-plus" className="size-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-6 rounded-full"
              >
                <Icon icon="bi:arrow-left" className="size-5 mr-2" />
                Back to Cards
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
