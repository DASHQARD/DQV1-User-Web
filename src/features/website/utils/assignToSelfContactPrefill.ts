import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { formatPersonName } from '@/utils/personName'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'
import {
  getGuestEmailFromAuth,
  getGuestNameFromAuth,
  getGuestPhoneFromAuth,
} from '@/features/website/utils/guestAuth'

export type AssignToSelfContact = {
  name: string
  email: string
  phone: string
}

type UserProfileShape = {
  fullname?: string
  email?: string
  phonenumber?: string
} | null

/**
 * Contact fields for "assign to self": full users use profile API; guests use JWT claims + session from OTP flow.
 */
function getLocalGuestContactPrefill(): AssignToSelfContact {
  const contact = useGuestLocalCartStore.getState().contact
  const name =
    formatPersonName(contact.first_name ?? '', contact.last_name ?? '') ||
    getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY)
  return {
    name,
    email: contact.email?.trim() || getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY),
    phone: contact.phone?.trim() || getGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY),
  }
}

export function getAssignToSelfContactPrefill(params: {
  isGuestAuth: boolean
  /** Anonymous guest with local cart (no OTP yet). */
  isLocalGuest?: boolean
  user: Record<string, unknown> | null
  userProfileData: UserProfileShape
}): AssignToSelfContact {
  const { isGuestAuth, isLocalGuest, user, userProfileData } = params

  if (isLocalGuest) {
    return getLocalGuestContactPrefill()
  }

  if (isGuestAuth) {
    return {
      name: getGuestNameFromAuth(user),
      email: getGuestEmailFromAuth(user),
      phone: getGuestPhoneFromAuth(user),
    }
  }

  return {
    name: userProfileData?.fullname ?? '',
    email: userProfileData?.email ?? '',
    phone: userProfileData?.phonenumber ?? '',
  }
}
