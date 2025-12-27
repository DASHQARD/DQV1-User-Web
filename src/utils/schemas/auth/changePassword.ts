import { z } from 'zod'
import { getRequiredAlphaNumericStringSchema } from '../shared'

export const ChangePasswordSchema = z
  .object({
    currentPassword: getRequiredAlphaNumericStringSchema('Current Password'),
    newPassword: getRequiredAlphaNumericStringSchema('New Password'),
    confirmPassword: getRequiredAlphaNumericStringSchema('Confirm Password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

