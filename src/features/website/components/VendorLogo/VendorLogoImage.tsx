import { useEffect, useState } from 'react'

import { Icon } from '@/libs'
import { useVendorLogoUrl } from '@/hooks'
import type { VendorLogoFields } from '@/utils/vendorLogo'

type VendorLogoImageProps = {
  vendor?: VendorLogoFields | null
  name?: string
  className?: string
  iconClassName?: string
  fallbackIcon?: string
}

export function VendorLogoImage({
  vendor,
  name = 'Vendor',
  className = 'h-full w-full object-cover',
  iconClassName = 'size-7 text-primary-600',
  fallbackIcon = 'bi:building',
}: VendorLogoImageProps) {
  const { url } = useVendorLogoUrl(vendor)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [url])

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={`${name} logo`}
        className={className}
        onError={() => setFailed(true)}
      />
    )
  }

  return <Icon icon={fallbackIcon} className={iconClassName} />
}
