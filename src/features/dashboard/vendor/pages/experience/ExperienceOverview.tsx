import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Text, Loader, EmptyState, TabbedView } from '@/components'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { getImageUrl, getCardBackground, getCardTypeName } from '@/utils/cardDisplay'
import { EmptyStateImage } from '@/assets/images'
import { useUserProfile, usePresignedURL } from '@/hooks'
import { vendorQueries } from '../../hooks'
import { branchQueries } from '@/features/dashboard/branch'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'

const EXPIRED_STATUSES = ['expired', 'cancelled']

function isExpired(experience: any): boolean {
  const status = (experience?.status ?? '').toLowerCase()
  return EXPIRED_STATUSES.includes(status)
}

type TabId = 'active' | 'expired'

interface ExperienceListContentProps {
  list: any[]
  imageUrls: Record<number, string>
  addAccountParam: (path: string) => string
  emptyTitle: string
  emptyDescription: string
  isLoading: boolean
}

function ExperienceListContent({
  list,
  imageUrls,
  addAccountParam,
  emptyTitle,
  emptyDescription,
  isLoading,
}: ExperienceListContentProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader />
      </div>
    )
  }
  if (list.length === 0) {
    return (
      <div className="py-12">
        <EmptyState image={EmptyStateImage} title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6 px-6">
      {list.map((experience: any) => {
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
            to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE)}
            className="rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden group"
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
                <Text variant="span" weight="bold" className="text-[#402D87] text-xs shrink-0">
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
  )
}

export default function ExperienceOverview() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const params = useMemo(() => ({ limit: 100 }), [])

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = (userProfileData as any)?.user_type
  const isCorporate = userType === 'corporate' || userType === 'corporate super admin'
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useGetCardsByVendorIdService } = vendorQueries()
  const { data: cardsResponse, isLoading } = useGetCardsByVendorIdService(params)
  const { useGetBranchExperiencesService } = branchQueries()
  const { data: branchCardsResponse, isLoading: isLoadingBranchCards } =
    useGetBranchExperiencesService(params)
  const {
    useGetCorporateCardsService,
    useGetCorporateSuperAdminCardsService,
    useGetCardsByVendorIdForCorporateService,
  } = corporateQueries()
  const { data: corporateCardsResponse, isLoading: isLoadingCorporateCards } =
    useGetCorporateCardsService(params)
  const { data: corporateSuperAdminCardsResponse, isLoading: isLoadingCorporateSuperAdminCards } =
    useGetCorporateSuperAdminCardsService(params)
  const { data: corporateVendorCardsResponse, isLoading: isLoadingCorporateVendorCards } =
    useGetCardsByVendorIdForCorporateService(
      isCorporateSuperAdmin && vendorIdFromUrl ? vendorIdFromUrl : null,
      params,
    )

  const corporateResponse =
    isCorporateSuperAdmin && vendorIdFromUrl
      ? corporateVendorCardsResponse
      : isCorporateSuperAdmin
        ? corporateSuperAdminCardsResponse
        : corporateCardsResponse
  const isLoadingCorporate =
    isCorporateSuperAdmin && vendorIdFromUrl
      ? isLoadingCorporateVendorCards
      : isCorporateSuperAdmin
        ? isLoadingCorporateSuperAdminCards
        : isLoadingCorporateCards

  const response = isCorporate ? corporateResponse : cardsResponse || branchCardsResponse
  const isLoadingAny = isCorporate ? isLoadingCorporate : isLoading || isLoadingBranchCards

  const experiencesData = useMemo(() => {
    if (!response) return []
    return Array.isArray(response?.data) ? response.data : []
  }, [response])

  const { activeExperiences, expiredExperiences } = useMemo(() => {
    const active: any[] = []
    const expired: any[] = []
    for (const exp of experiencesData) {
      if (isExpired(exp)) expired.push(exp)
      else active.push(exp)
    }
    return { activeExperiences: active, expiredExperiences: expired }
  }, [experiencesData])

  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})

  useEffect(() => {
    let cancelled = false
    const fetchUrls = async () => {
      if (experiencesData.length === 0) {
        if (!cancelled) setImageUrls({})
        return
      }
      const results = await Promise.all(
        experiencesData.map(async (exp: any) => {
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
  }, [experiencesData, fetchPresignedURL])

  const addAccountParam = useMemo(() => {
    return (path: string) => {
      const separator = path?.includes('?') ? '&' : '?'
      let full = `${path}${separator}account=vendor`
      if (isCorporateSuperAdmin && vendorIdFromUrl) {
        full += `&vendor_id=${vendorIdFromUrl}`
      }
      return full
    }
  }, [isCorporateSuperAdmin, vendorIdFromUrl])

  const experienceTabConfig: { key: TabId; label: string; component: ComponentType<any> }[] =
    useMemo(
      () => [
        {
          key: 'active',
          label: activeExperiences.length > 0 ? `Active (${activeExperiences.length})` : 'Active',
          component: () => (
            <ExperienceListContent
              list={activeExperiences}
              imageUrls={imageUrls}
              addAccountParam={addAccountParam}
              emptyTitle="No active experiences"
              emptyDescription="Active gift cards and experiences will appear here"
              isLoading={isLoadingAny}
            />
          ),
        },
        {
          key: 'expired',
          label:
            expiredExperiences.length > 0 ? `Expired (${expiredExperiences.length})` : 'Expired',
          component: () => (
            <ExperienceListContent
              list={expiredExperiences}
              imageUrls={imageUrls}
              addAccountParam={addAccountParam}
              emptyTitle="No expired experiences"
              emptyDescription="Expired or cancelled experiences will appear here"
              isLoading={isLoadingAny}
            />
          ),
        },
      ],
      [activeExperiences, expiredExperiences, imageUrls, addAccountParam, isLoadingAny],
    )

  return (
    <div className="lg:py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            My Experiences
          </Text>
        </div>

        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
          <div className="p-6">
            <TabbedView
              tabs={experienceTabConfig}
              defaultTab="active"
              urlParam="tab"
              containerClassName="space-y-4"
              btnClassName="pb-2"
              tabsClassName="gap-6 border-b border-[#f1f3f4]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
