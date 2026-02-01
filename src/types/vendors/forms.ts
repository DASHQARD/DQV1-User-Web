import type { UserProfileResponse } from '@/types/user'

export interface VendorDetailsFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  corporateUser?: UserProfileResponse | null
}

export interface VendorProfileFormProps {
  onSubmit: () => void
  onCancel: () => void
  corporateUser?: UserProfileResponse | null
}

export interface VendorNameFormProps {
  onSubmit: () => void
  corporateUser?: UserProfileResponse | null
}
