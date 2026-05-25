import { Icon } from '@/libs'
import { Text } from '@/components'
import { useCardItem } from '../../hooks/useCardItem'
import type { FeaturedCardProps } from '@/types'
import { formatDate } from '@/utils/format'
import { VendorLogoImage } from '../VendorLogo/VendorLogoImage'
import { CardItemImage } from './CardItemImage'
import type { VendorLogoFields } from '@/utils/vendorLogo'

export const CardItems = (props: FeaturedCardProps) => {
  const {
    displayPrice,
    displayProduct,
    handleCardClick,
    product,
    vendor_name,
    branch_name,
  } = useCardItem(props)
  const firstImageUrl = (props as any)?.images?.[0]?.file_url as string | undefined
  const vendorLogo: VendorLogoFields = {
    logo: props.logo,
    logo_key: props.logo_key,
  }

  return (
    <article
      className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <CardItemImage
          fileUrl={firstImageUrl}
          cardType={props.type}
          alt={`${product} card background`}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>

      <div className="p-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#402D87]/10 text-[#402D87] mb-2">
          <Icon icon="bi:briefcase-fill" className="text-[8px]" />
          {props.type?.toUpperCase() || 'DASHX'}
        </span>
        {displayProduct ? (
          <Text
            variant="span"
            weight="semibold"
            className="text-gray-900 block line-clamp-2 text-xs leading-snug mb-2"
          >
            {displayProduct}
          </Text>
        ) : null}
        <div className="mb-2">
          {props.status && (
            <div className="h-1 rounded-full bg-gray-100 overflow-hidden mb-1">
              <div
                className="h-full rounded-full bg-[#402D87] transition-all"
                style={{
                  width:
                    props.status === 'active' ? '80%' : props.status === 'expired' ? '100%' : '40%',
                }}
              />
            </div>
          )}
          {props.expiry_date && (
            <Text variant="span" className="text-gray-500 text-[10px] flex items-center gap-0.5">
              <Icon icon="bi:calendar-event" className="size-2.5" />
              Expires {formatDate(props.expiry_date)}
            </Text>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1.5 border-t border-gray-100">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#402D87]/10">
            <VendorLogoImage
              vendor={vendorLogo}
              name={vendor_name || branch_name || 'Vendor'}
              className="h-full w-full object-cover"
              iconClassName="text-[#402D87] text-[10px]"
              fallbackIcon="bi:shop"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Text variant="span" weight="semibold" className="text-gray-900 block text-xs truncate">
              {vendor_name || branch_name || 'Vendor'}
            </Text>
            <Text variant="span" className="text-gray-500 text-[10px] block">
              Vendor
            </Text>
          </div>
          <Text variant="span" weight="bold" className="text-[#402D87] text-xs shrink-0">
            {displayPrice}
          </Text>
        </div>
      </div>
    </article>
  )
}
