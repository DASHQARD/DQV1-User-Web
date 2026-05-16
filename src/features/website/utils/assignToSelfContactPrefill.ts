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
export function getAssignToSelfContactPrefill(params: {
  isGuestAuth: boolean
  user: Record<string, unknown> | null
  userProfileData: UserProfileShape
}): AssignToSelfContact {
  const { isGuestAuth, user, userProfileData } = params

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
