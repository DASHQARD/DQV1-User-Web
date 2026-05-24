import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'

export function useCorporateAccountSettings() {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const requestAccountUpdateModal = usePersistedModalState({
    paramName: MODALS.REQUEST_CORPORATE_ACCOUNT_UPDATE.PARAM_NAME,
  })

  const profile = userProfileData as
    | (typeof userProfileData & { country_code?: string })
    | undefined

  const openRequestModal = () =>
    requestAccountUpdateModal.openModal(MODALS.REQUEST_CORPORATE_ACCOUNT_UPDATE.ROOT)

  return {
    profile,
    openRequestModal,
  }
}
