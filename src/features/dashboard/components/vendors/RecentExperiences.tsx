import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Text, Loader, EmptyState, Tooltip, TooltipTrigger, TooltipContent } from '@/components'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { getCardBackground, getCardTypeName, getCardDisplayName, getImageUrl } from '@/utils/cardDisplay'
import { EmptyStateImage } from '@/assets/images'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'
import { VENDOR_NAV_DISABLED_TOOLTIP } from '@/features/dashboard/components/sidebar/VendorSidebarNavItem'

export interface RecentExperiencesProps {
  experiences: any[]
  isLoading: boolean
  addAccountParam: (path: string) => string
  /** Carousel (vendor home) or compact list rows (branch home). */
  layout?: 'carousel' | 'list'
  viewAllPath?: string
  experienceLinkPath?: string
  isExperienceDisabled?: boolean
  disabledTooltip?: string
  listLimit?: number
}

const CARD_WIDTH = 240
const CARD_GAP = 20
const DEFAULT_LIST_LIMIT = 5

function experienceStatusClass(status: string): string {
  if (status === 'approved' || status === 'verified' || status === 'active') {
    return 'text-green-600'
  }
  if (status === 'pending') return 'text-yellow-600'
  return 'text-gray-600'
}

function getExperienceTitle(experience: Record<string, unknown>): string {
  return getCardDisplayName(
    experience.product as string,
    experience.card_name as string,
    experience.name as string,
  )
}

export function RecentExperiences({
  experiences,
  isLoading,
  addAccountParam,
  layout = 'carousel',
  viewAllPath,
  experienceLinkPath,
  isExperienceDisabled: isExperienceDisabledProp,
  disabledTooltip,
  listLimit = DEFAULT_LIST_LIMIT,
}: RecentExperiencesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { getIsNavItemDisabled } = useVendorOnboardingProgress()
  const vendorExperienceDisabled = getIsNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)
  const isExperienceDisabled = isExperienceDisabledProp ?? vendorExperienceDisabled
  const tooltipMessage = disabledTooltip ?? VENDOR_NAV_DISABLED_TOOLTIP
  const viewAllHref = addAccountParam(
    viewAllPath ?? ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE_OVERVIEW,
  )
  const experienceHref = addAccountParam(
    experienceLinkPath ?? viewAllPath ?? ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE_OVERVIEW,
  )

  const previewExperiences = React.useMemo(
    () => experiences.slice(0, layout === 'list' ? listLimit : 10),
    [experiences, layout, listLimit],
  )

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const step = CARD_WIDTH + CARD_GAP
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  const viewAllLink = isExperienceDisabled ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-gray-400 text-sm font-medium cursor-not-allowed">View all</span>
      </TooltipTrigger>
      <TooltipContent>{tooltipMessage}</TooltipContent>
    </Tooltip>
  ) : (
    <Link
      to={viewAllHref}
      className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
    >
      View all <Icon icon="bi:arrow-right" className="ml-1" />
    </Link>
  )

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
        <div className="p-6 pb-0 flex justify-between items-center mb-5">
          <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
            <Icon icon="bi:briefcase-fill" className="text-[#402D87] mr-2" />
            My Experiences
            {experiences.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">({experiences.length})</span>
            )}
          </h5>
          {viewAllLink}
        </div>
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>
          ) : previewExperiences.length === 0 ? (
            <div className="py-8">
              <EmptyState
                image={EmptyStateImage}
                title="No experiences created yet"
                description="Create your first experience to start offering gift cards to customers"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {previewExperiences.map((experience: Record<string, unknown>) => {
                const cardType = String(experience.type ?? experience.card_type ?? 'Gift Card')
                const rowClassName = cn(
                  'flex items-center justify-between p-4 border border-gray-200 rounded-lg',
                  isExperienceDisabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-gray-50 transition-colors group',
                )
                const rowContent = (
                  <>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                        <Icon icon="bi:briefcase" className="text-[#402D87]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {getExperienceTitle(experience) ? (
                          <Text variant="span" weight="semibold" className="text-gray-900 block">
                            {getExperienceTitle(experience)}
                          </Text>
                        ) : null}
                        <div className="flex items-center gap-2 mt-1">
                          <Text variant="span" className="text-gray-500 text-sm">
                            {cardType}
                          </Text>
                          {experience.status ? (
                            <>
                              <span className="text-gray-400">•</span>
                              <span
                                className={cn(
                                  'text-xs font-medium',
                                  experienceStatusClass(String(experience.status)),
                                )}
                              >
                                {String(experience.status)}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {experience.price != null && experience.price !== '' ? (
                        <Text variant="span" weight="semibold" className="text-[#402D87]">
                          {formatCurrency(
                            Number(experience.price),
                            String(experience.currency ?? 'GHS'),
                          )}
                        </Text>
                      ) : null}
                      <Icon
                        icon="bi:chevron-right"
                        className={cn(
                          'text-gray-400 transition-colors',
                          !isExperienceDisabled && 'group-hover:text-[#402D87]',
                        )}
                      />
                    </div>
                  </>
                )

                if (isExperienceDisabled) {
                  return (
                    <Tooltip key={String(experience.id)}>
                      <TooltipTrigger asChild>
                        <div className={rowClassName}>{rowContent}</div>
                      </TooltipTrigger>
                      <TooltipContent>{tooltipMessage}</TooltipContent>
                    </Tooltip>
                  )
                }

                return (
                  <Link
                    key={String(experience.id)}
                    to={experienceHref}
                    className={rowClassName}
                  >
                    {rowContent}
                  </Link>
                )
              })}
              {experiences.length > listLimit ? (
                <div className="text-center pt-2">
                  {isExperienceDisabled ? (
                    <span className="text-gray-400 text-sm font-medium cursor-not-allowed">
                      View all {experiences.length} experiences
                    </span>
                  ) : (
                    <Link
                      to={viewAllHref}
                      className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                    >
                      View all {experiences.length} experiences
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between pt-4 px-2">
        <h5 className="text-lg font-bold text-[#504F5E] m-0">My Experiences</h5>
        <div className="flex items-center gap-3">
          {isExperienceDisabled ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-400 text-sm font-medium cursor-not-allowed">
                  View all
                </span>
              </TooltipTrigger>
              <TooltipContent>{tooltipMessage}</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to={viewAllHref}
              className="text-[#402D87] no-underline text-sm font-medium hover:text-[#2d1a72] transition-colors"
            >
              View all
            </Link>
          )}
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
        ) : previewExperiences.length === 0 ? (
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
            {previewExperiences.map((experience: Record<string, unknown>) => {
              const cardType = String(experience.type ?? experience.card_type ?? 'dashx')
              const firstImage = (experience.images as Array<{ file_url?: string }> | undefined)?.[0]
                ?.file_url
              const imageSrc =
                (firstImage ? getImageUrl(firstImage) : null) || getCardBackground(cardType)
              const productName = getExperienceTitle(experience)
              const vendorName = String(experience.vendor_name ?? 'Vendor')

              const cardClassName = cn(
                'shrink-0 w-[240px] rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden',
                isExperienceDisabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow group',
              )

              const cardContent = (
                <>
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
                    {productName ? (
                      <Text
                        variant="span"
                        weight="semibold"
                        className="text-gray-900 block line-clamp-2 text-xs leading-snug mb-2"
                      >
                        {productName}
                      </Text>
                    ) : null}
                    <div className="mb-2">
                      {experience.status ? (
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
                      ) : null}
                      {experience.expiry_date ? (
                        <Text
                          variant="span"
                          className="text-gray-500 text-[10px] flex items-center gap-0.5"
                        >
                          <Icon icon="bi:calendar-event" className="size-2.5" />
                          Expires {formatDate(String(experience.expiry_date))}
                        </Text>
                      ) : null}
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
                          ? formatCurrency(
                              Number(experience.price),
                              String(experience.currency ?? 'GHS'),
                            )
                          : '—'}
                      </Text>
                    </div>
                  </div>
                </>
              )

              if (isExperienceDisabled) {
                return (
                  <Tooltip key={String(experience.id)}>
                    <TooltipTrigger asChild>
                      <div className={cardClassName}>{cardContent}</div>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipMessage}</TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link key={String(experience.id)} to={experienceHref} className={cardClassName}>
                  {cardContent}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
