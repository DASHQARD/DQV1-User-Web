import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader, Button, Text, DocumentViewer } from '@/components'
import { ROUTES } from '@/utils/constants/shared'
import { Icon } from '@/libs'
import { formatCurrency } from '@/utils/format'
import { usePublicCatalogQueries } from '../../hooks/website'
import { useCart } from '../../hooks/useCart'
import { useCartStore } from '@/stores/cart'
import { usePresignedURL } from '@/hooks'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/dashpass_bg.svg'
import DashGoBg from '@/assets/svgs/dashgo_bg.svg'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

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

  // Document viewer state
  const [selectedDocument, setSelectedDocument] = React.useState<{
    url: string
    name: string
  } | null>(null)

  // Image viewer state
  const [imageIndex, setImageIndex] = React.useState(-1)

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

  // Prepare images for lightbox
  const lightboxImages = React.useMemo(() => {
    if (!card?.images) return []
    return card.images.map((image: any, index: number) => {
      const imageUrl = getImageUrl(image, index)
      return {
        src: imageUrl,
        alt: `${card.product} image ${index + 1}`,
      }
    })
  }, [card?.images, card?.product, getImageUrl])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section with Gradient */}
      <div className="bg-linear-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="wrapper py-6">
          <nav className="flex items-center gap-2 text-sm text-white/90 mb-4">
            <Link
              to={ROUTES.IN_APP.HOME}
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </Link>
            <Icon icon="bi:chevron-right" className="size-4 opacity-70" />
            <Link
              to={ROUTES.IN_APP.DASHQARDS}
              className="hover:text-white transition-colors duration-200"
            >
              Cards
            </Link>
            <Icon icon="bi:chevron-right" className="size-4 opacity-70" />
            <span className="text-white font-medium">{card.product}</span>
          </nav>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {card.vendor_name && (
                <button
                  onClick={() =>
                    navigate(
                      `/vendor?vendor_id=${card.vendor_id}&name=${encodeURIComponent(card.vendor_name || '')}`,
                    )
                  }
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-3 group"
                >
                  <Icon
                    icon="bi:shop"
                    className="text-base group-hover:translate-x-1 transition-transform"
                  />
                  <span>{card.vendor_name}</span>
                  <Icon icon="bi:arrow-right" className="text-xs" />
                </button>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                {card.product}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-extrabold text-white">
                  {formatCurrency(displayPrice, card.currency || 'GHS')}
                </span>
                <span className="text-lg text-white/80">{card.currency || 'GHS'} Gift Card</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {card.status && (
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    card.status === 'active'
                      ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                      : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                  }`}
                >
                  {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="wrapper py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Card Image */}
          <div className="space-y-6">
            {/* Main Card Display */}
            <div className="relative group">
              <div
                className="relative overflow-hidden rounded-3xl bg-gray-200 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ paddingTop: '62.5%' }}
              >
                <img
                  src={cardBackground}
                  alt={`${card.product} card background`}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Card Overlay Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div className="flex items-start justify-between">
                    {/* Left: Card Type */}
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                      <Icon icon="bi:gift" className="size-6" />
                      <span className="font-extrabold text-xl tracking-wide">
                        {getCardTypeName()}
                      </span>
                    </div>

                    {/* Right: Price Badge */}
                    <div className="text-right bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
                      <div className="text-3xl font-extrabold">{displayPrice.toFixed(2)}</div>
                      <div className="text-sm opacity-90">{card.currency}</div>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-end justify-between">
                    {/* Left: Vendor Name */}
                    {card.vendor_name && (
                      <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                        <span className="font-bold text-lg tracking-wide uppercase">
                          {card.vendor_name}
                        </span>
                      </div>
                    )}

                    {/* Right: QR Code */}
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Images Gallery */}
            {card.images && card.images.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="bi:images" className="text-primary-600 text-xl" />
                  <Text variant="h4" weight="semibold" className="text-gray-900">
                    Gallery
                  </Text>
                  <span className="text-sm text-gray-500">
                    ({card.images.length} {card.images.length === 1 ? 'image' : 'images'})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {card.images.slice(0, 4).map((image: any, index: number) => {
                    const imageUrl = getImageUrl(image, index)
                    return (
                      <button
                        key={image.id || image.file_name || index}
                        type="button"
                        onClick={() => setImageIndex(index)}
                        disabled={!imageUrl || isLoadingImages}
                        className="relative overflow-hidden rounded-xl bg-gray-200 cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:hover:scale-100 group border-2 border-transparent hover:border-primary-300"
                        style={{ paddingTop: '100%' }}
                      >
                        {isLoadingImages ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <Loader />
                          </div>
                        ) : imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={`${card.product} image ${index + 1}`}
                              className="absolute inset-0 h-full w-full object-cover group-hover:brightness-110 transition-all duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                              <Icon
                                icon="bi:zoom-in"
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-2xl"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                            <Icon icon="bi:image" className="size-8" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {card.images.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setImageIndex(4)}
                    className="mt-3 w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-2"
                  >
                    View all {card.images.length} images
                    <Icon icon="bi:arrow-right" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Card Details */}
          <div className="space-y-6">
            {/* Description */}
            {card.description && (
              <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Icon icon="bi:card-text" className="text-primary-600 text-xl" />
                  </div>
                  <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                    About This Card
                  </Text>
                </div>
                <Text
                  variant="p"
                  className="text-gray-700 whitespace-pre-line leading-relaxed text-base"
                >
                  {card.description}
                </Text>
              </div>
            )}

            {/* Card Information */}
            <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Icon icon="bi:info-circle" className="text-primary-600 text-xl" />
                </div>
                <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                  Card Information
                </Text>
              </div>
              <div className="space-y-4">
                {card.expiry_date && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon icon="bi:calendar-check" className="text-blue-600 text-base" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Valid Until</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {new Date(card.expiry_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Icon icon="bi:currency-exchange" className="text-purple-600 text-base" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Currency</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{card.currency || 'GHS'}</span>
                </div>
              </div>
            </div>

            {/* Redemption Locations */}
            {redemptionBranches.length > 0 && (
              <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Icon icon="bi:geo-alt" className="text-primary-600 text-xl" />
                  </div>
                  <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                    Where to Redeem
                  </Text>
                </div>
                <div className="space-y-3 mb-6">
                  {redemptionBranches.map((branch, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center transition-colors shrink-0 mt-0.5">
                        <Icon icon="bi:shop" className="text-primary-600 text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text
                          variant="span"
                          weight="bold"
                          className="text-gray-900 block text-base"
                        >
                          {branch.branch_name}
                        </Text>
                        {branch.branch_location && (
                          <div className="flex items-center gap-1 mt-1">
                            <Icon icon="bi:geo-alt" className="text-xs text-gray-600" />
                            <Text variant="span" className="text-sm text-gray-600">
                              {branch.branch_location}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon icon="bi:info-circle" className="text-white text-base" />
                    </div>
                    <div>
                      <Text
                        variant="span"
                        weight="bold"
                        className="text-blue-900 text-sm block mb-1"
                      >
                        How to Redeem
                      </Text>
                      <Text variant="span" className="text-blue-800 text-sm block leading-relaxed">
                        Visit any of the locations above to redeem your gift card. Present your card
                        QR code or card details at the point of purchase.
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Redemption Instructions */}
            <div className="p-6 lg:p-8 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-2xl border border-primary-400 shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Icon icon="bi:card-checklist" className="text-white text-xl" />
                </div>
                <Text variant="h3" weight="bold" className="text-white text-xl">
                  Redemption Instructions
                </Text>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  {
                    step: 1,
                    text: 'Purchase this gift card and receive it in your account',
                  },
                  {
                    step: 2,
                    text: 'Visit any redemption location listed above',
                  },
                  {
                    step: 3,
                    text: 'Present your card QR code or details at checkout',
                  },
                  {
                    step: 4,
                    text: 'Enjoy your purchase! The amount will be deducted from your card balance',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <Text variant="p" className="text-white/95 text-base leading-relaxed">
                      {item.text}
                    </Text>
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.IN_APP.REDEEM)}
                className="w-full bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 rounded-xl shadow-lg border-0"
              >
                <Icon icon="bi:arrow-right-circle" className="mr-2 text-lg" />
                Redeem Your Card
              </Button>
            </div>

            {/* Terms and Conditions */}
            {card.terms_and_conditions && card.terms_and_conditions.length > 0 && (
              <div className="p-6 lg:p-8 bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Icon icon="bi:file-earmark-text" className="text-primary-600 text-xl" />
                  </div>
                  <Text variant="h3" weight="bold" className="text-gray-900 text-xl">
                    Terms & Conditions
                  </Text>
                </div>
                <div className="space-y-3">
                  {card.terms_and_conditions.map((term: any, index: number) => {
                    const termKey = term.id || term.file_name || index
                    const termUrl =
                      termsUrls[termKey] ||
                      (term.file_url?.startsWith('http://') || term.file_url?.startsWith('https://')
                        ? term.file_url
                        : null)
                    const termName = term.file_name || `Terms & Conditions ${index + 1}`

                    return (
                      <button
                        key={termKey}
                        type="button"
                        disabled={!termUrl}
                        onClick={() => {
                          if (termUrl) {
                            setSelectedDocument({ url: termUrl, name: termName })
                          }
                        }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 w-full text-left group ${
                          termUrl
                            ? 'border-gray-200 hover:border-primary-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 text-gray-700 hover:text-primary-700 hover:shadow-md'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                            termUrl
                              ? 'bg-primary-100 group-hover:bg-primary-200 text-primary-600'
                              : 'bg-gray-200 text-gray-400'
                          } transition-colors`}
                        >
                          <Icon icon="bi:file-earmark-pdf" className="text-xl" />
                        </div>
                        <span className="flex-1 font-semibold text-base">{termName}</span>
                        {isLoadingTerms ? (
                          <div className="size-5">
                            <Loader />
                          </div>
                        ) : termUrl ? (
                          <div className="w-10 h-10 rounded-lg bg-primary-600 group-hover:bg-primary-700 flex items-center justify-center transition-colors">
                            <Icon icon="bi:eye" className="text-white text-lg" />
                          </div>
                        ) : (
                          <Icon icon="bi:x-circle" className="text-lg text-gray-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Image Lightbox */}
            <Lightbox
              open={imageIndex >= 0}
              close={() => setImageIndex(-1)}
              index={imageIndex}
              slides={lightboxImages}
            />

            {/* Document Viewer Modal */}
            <DocumentViewer
              isOpen={!!selectedDocument}
              setIsOpen={(open) => {
                if (!open) setSelectedDocument(null)
              }}
              documentUrl={selectedDocument?.url || null}
              documentName={selectedDocument?.name}
            />

            {/* Action Buttons - Sticky on scroll */}
            <div className="sticky bottom-0 pt-6 pb-4 bg-gradient-to-t from-white via-white to-transparent mt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  loading={isAdding}
                  variant="secondary"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 border-0"
                >
                  <Icon icon="bi:cart-plus" className="size-6 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-bold py-4 px-8 rounded-xl transition-all duration-300"
                >
                  <Icon icon="bi:arrow-left" className="size-6 mr-2" />
                  Back to Cards
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
