import { useEffect, useMemo, useState } from 'react'
import { useUserProfile, usePresignedURL, usePersistedModalState } from '@/hooks'
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
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const requestBusinessUpdateModal = usePersistedModalState({
    paramName: MODALS.REQUEST_BUSINESS_UPDATE.PARAM_NAME,
  })

  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const business = userProfileData?.business_details?.[0]

  useEffect(() => {
    const logoDocument = userProfileData?.business_documents?.find((doc) => doc.type === 'logo')
    if (!logoDocument?.file_url) {
      setLogoUrl(null)
      return
    }

    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoDocument.file_url)
        if (!cancelled) setLogoUrl(url)
      } catch {
        if (!cancelled) setLogoUrl(null)
      }
    }
    loadLogo()
    return () => {
      cancelled = true
    }
  }, [userProfileData?.business_documents, fetchPresignedURL])

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
