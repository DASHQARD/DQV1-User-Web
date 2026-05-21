import { useMemo } from 'react'
import { useBusinessLogoUrl, useUserProfile, usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  llc: 'Limited Liability Company',
  sole_proprietor: 'Sole Proprietorship',
  partnership: 'Partnership',
  corporation: 'Corporation',
}

export function useBusinessDetailsSettings() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const requestBusinessUpdateModal = usePersistedModalState({
    paramName: MODALS.REQUEST_BUSINESS_UPDATE.PARAM_NAME,
  })

  const business = userProfileData?.business_details?.[0]

  const { url: logoUrl } = useBusinessLogoUrl(userProfileData)

  const businessTypeLabel = useMemo(() => {
    if (!business?.type) return business?.type || '—'
    return BUSINESS_TYPE_LABELS[business.type] ?? business.type
  }, [business?.type])

  const openRequestModal = () =>
    requestBusinessUpdateModal.openModal(MODALS.REQUEST_BUSINESS_UPDATE.ROOT)

  return {
    business,
    logoUrl,
    businessTypeLabel,
    openRequestModal,
  }
}
