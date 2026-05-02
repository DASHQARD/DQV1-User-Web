import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'

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
export function getAssignToSelfContactPrefill(params: {
  isGuestAuth: boolean
  user: Record<string, unknown> | null
  userProfileData: UserProfileShape
}): AssignToSelfContact {
  const { isGuestAuth, user, userProfileData } = params

  if (isGuestAuth) {
    const u = (user ?? {}) as Record<string, string | undefined>
    let name = u.guest_name ?? u.fullname ?? ''
    let email = u.guest_email ?? u.email ?? ''
    let phone = u.guest_phone ?? u.phone ?? u.phonenumber ?? ''

    if (!name) name = getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY)
    if (!email) email = getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY)
    if (!phone) phone = getGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY)

    return { name, email, phone }
  }

  return {
    name: userProfileData?.fullname ?? '',
    email: userProfileData?.email ?? '',
    phone: userProfileData?.phonenumber ?? '',
  }
}
