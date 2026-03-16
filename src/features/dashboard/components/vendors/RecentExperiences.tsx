import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Text, Loader, EmptyState } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { getImageUrl, getCardBackground, getCardTypeName } from '@/utils/cardDisplay'
import { EmptyStateImage } from '@/assets/images'
import { usePresignedURL } from '@/hooks'

interface RecentExperiencesProps {
  experiences: any[]
  isLoading: boolean
  addAccountParam: (path: string) => string
}

const CARD_WIDTH = 240
const CARD_GAP = 20

export function RecentExperiences({
  experiences,
  isLoading,
  addAccountParam,
}: RecentExperiencesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})

  const recentExperiences = React.useMemo(() => experiences.slice(0, 10), [experiences])

  useEffect(() => {
    const list = experiences.slice(0, 10)
    let cancelled = false
    const fetchUrls = async () => {
      if (list.length === 0) {
        if (!cancelled) setImageUrls({})
        return
      }
      const results = await Promise.all(
        list.map(async (exp: any) => {
          const firstImage = exp.images?.[0]?.file_url
          if (!firstImage) return { id: exp.id, url: null }
          if (
            firstImage.startsWith('http://') ||
            firstImage.startsWith('https://') ||
            firstImage.startsWith('data:')
          ) {
            return { id: exp.id, url: firstImage }
          }
          try {
            const response = await fetchPresignedURL(firstImage)
            const url =
              typeof response === 'string' ? response : ((response as any)?.url ?? response)
            return { id: exp.id, url: url || null }
          } catch {
            return { id: exp.id, url: null }
          }
        }),
      )
      if (!cancelled) {
        const map: Record<number, string> = {}
        results.forEach((r) => {
          if (r.url) map[r.id] = r.url
        })
        setImageUrls(map)
      }
    }
    fetchUrls()
    return () => {
      cancelled = true
    }
  }, [experiences, fetchPresignedURL])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const step = CARD_WIDTH + CARD_GAP
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between pt-4 px-2">
        <h5 className="text-lg font-bold text-[#504F5E] m-0">My Experiences</h5>
        <div className="flex items-center gap-3">
          <Link
            to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE_OVERVIEW)}
            className="text-[#402D87] no-underline text-sm font-medium hover:text-[#2d1a72] transition-colors"
          >
            View all
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Previous"
              className="w-9 h-9 rounded-full bg-[#402D87]/10 flex items-center justify-center text-gray-500 hover:bg-[#402D87]/20 hover:text-[#402D87] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <Icon icon="bi:chevron-left" className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Next"
              className="w-9 h-9 rounded-full bg-[#402D87] flex items-center justify-center text-white hover:bg-[#2d1a72] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <Icon icon="bi:chevron-right" className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        ) : recentExperiences.length === 0 ? (
          <div className="py-12 px-6">
            <EmptyState
              image={EmptyStateImage}
              title="No experiences created yet"
              description="Create your first experience to start offering gift cards to customers"
            />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto overflow-y-hidden py-6 px-6 scroll-smooth"
          >
            {recentExperiences.map((experience: any) => {
              const cardType = experience.type || experience.card_type || 'dashx'
              const firstImage = experience.images?.[0]?.file_url
              const presignedUrl = imageUrls[experience.id]
              const imageSrc =
                presignedUrl ||
                (firstImage ? getImageUrl(firstImage) : null) ||
                getCardBackground(cardType)
              const productName = experience.product || experience.card_name || 'Experience'
              const vendorName = experience.vendor_name || 'Vendor'

              return (
                <Link
                  key={experience.id}
                  to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE_OVERVIEW)}
                  className="shrink-0 w-[240px] rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden group"
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = getCardBackground(cardType)
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#402D87]/10 text-[#402D87] mb-2">
                      <Icon icon="bi:briefcase-fill" className="text-[8px]" />
                      {getCardTypeName(cardType)}
                    </span>
                    <Text
                      variant="span"
                      weight="semibold"
                      className="text-gray-900 block line-clamp-2 text-xs leading-snug mb-2"
                    >
                      {productName}
                    </Text>
                    <div className="mb-2">
                      {experience.status && (
                        <div className="h-1 rounded-full bg-gray-100 overflow-hidden mb-1">
                          <div
                            className="h-full rounded-full bg-[#402D87] transition-all"
                            style={{
                              width:
                                experience.status === 'active'
                                  ? '80%'
                                  : experience.status === 'expired'
                                    ? '100%'
                                    : '40%',
                            }}
                          />
                        </div>
                      )}
                      {experience.expiry_date && (
                        <Text
                          variant="span"
                          className="text-gray-500 text-[10px] flex items-center gap-0.5"
                        >
                          <Icon icon="bi:calendar-event" className="size-2.5" />
                          Expires {formatDate(experience.expiry_date)}
                        </Text>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                        <Icon icon="bi:shop" className="text-[#402D87] text-[10px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text
                          variant="span"
                          weight="semibold"
                          className="text-gray-900 block text-xs truncate"
                        >
                          {vendorName}
                        </Text>
                        <Text variant="span" className="text-gray-500 text-[10px] block">
                          Vendor
                        </Text>
                      </div>
                      <Text
                        variant="span"
                        weight="bold"
                        className="text-[#402D87] text-xs shrink-0"
                      >
                        {experience.price != null && experience.price !== ''
                          ? formatCurrency(Number(experience.price), experience.currency || 'GHS')
                          : '—'}
                      </Text>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
