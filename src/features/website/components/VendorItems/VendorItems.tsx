import { useMemo, useEffect, useState } from 'react'
import { Icon } from '@/libs'
import { usePresignedURL } from '@/hooks'

type VendorItemProps = {
  name: string
  branches?: number
  rating?: number
  business_logo?: string | null
  businessAddress?: string
  businessCountry?: string
  branchesWithCards?: any[]
}

export const VendorItems = ({
  name,
  branches = 0,
  rating = 4.5,
  business_logo,
  businessAddress,
  businessCountry,
  branchesWithCards = [],
}: VendorItemProps) => {
  const roundedRating = Math.round(rating)
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [presignedLogoUrl, setPresignedLogoUrl] = useState<string | null>(null)

  // Determine if we need to fetch presigned URL
  const needsPresignedURL = useMemo(() => {
    if (!business_logo) return false
    if (business_logo.startsWith('http://') || business_logo.startsWith('https://')) return false
    if (business_logo.startsWith('data:')) return false
    return true
  }, [business_logo])

  // Get direct URL for cases that don't need presigned URL
  const directLogoUrl = useMemo(() => {
    if (!business_logo) return null
    if (business_logo.startsWith('http://') || business_logo.startsWith('https://'))
      return business_logo
    if (business_logo.startsWith('data:')) return business_logo
    return null
  }, [business_logo])

  // Final logo URL - use direct URL if available, otherwise use presigned URL
  const logoUrl = useMemo(() => {
    return directLogoUrl || presignedLogoUrl
  }, [directLogoUrl, presignedLogoUrl])

  // Fetch presigned URL for logo when needed
  useEffect(() => {
    if (!needsPresignedURL || !business_logo) {
      return
    }

    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(business_logo)
        if (!cancelled) {
          setPresignedLogoUrl(typeof url === 'string' ? url : (url as any)?.url || url)
        }
      } catch (error) {
        console.error('Failed to fetch logo presigned URL', error)
        if (!cancelled) {
          setPresignedLogoUrl(null)
        }
      }
    }

    loadLogo()
    return () => {
      cancelled = true
      // Reset presigned URL when effect is cleaned up (e.g., when business_logo changes)
      setPresignedLogoUrl(null)
    }
  }, [business_logo, needsPresignedURL, fetchPresignedURL])

  // Calculate total cards across all branches
  const totalCards = useMemo(() => {
    return branchesWithCards.reduce((total, branch) => {
      return total + (branch.cards?.length || 0)
    }, 0)
  }, [branchesWithCards])

  return (
    <article className="group relative flex flex-col h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-lg">
      {/* Logo/Badge Section */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary-500/10 to-primary-600/10 ring-1 ring-primary-500/20 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="h-full w-full rounded-xl object-cover" />
          ) : (
            <Icon icon="bi:building" className="size-7 text-primary-600" />
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-1 min-w-0">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-200 whitespace-nowrap">
            {branches} {branches === 1 ? 'Branch' : 'Branches'}
          </span>
          {totalCards > 0 && (
            <span className="text-xs text-gray-500 font-medium">
              {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
            </span>
          )}
        </div>
      </div>

      {/* Vendor Name */}
      <div className="mb-3 flex-1">
        <h4 className="line-clamp-2 text-base font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors">
          {name}
        </h4>
      </div>

      {/* Location */}
      {(businessAddress || businessCountry) && (
        <div className="mb-3 flex items-start gap-1.5 text-xs text-gray-500">
          <Icon icon="bi:geo-alt" className="size-3.5 shrink-0 mt-0.5 text-gray-400" />
          <span className="line-clamp-1">
            {businessAddress && businessCountry
              ? `${businessAddress}, ${businessCountry}`
              : businessAddress || businessCountry}
          </span>
        </div>
      )}

      {/* Rating */}
      <div
        className="flex items-center gap-2 pt-3 border-t border-gray-100"
        aria-label={`Rating ${rating} out of 5`}
      >
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, n) => {
            const starNumber = n + 1
            return (
              <Icon
                key={starNumber}
                icon={starNumber <= roundedRating ? 'bi:star-fill' : 'bi:star'}
                className="size-3.5 text-yellow-400"
              />
            )
          })}
        </div>
        <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      </div>
    </article>
  )
}
