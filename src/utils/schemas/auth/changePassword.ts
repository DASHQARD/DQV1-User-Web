import { z } from 'zod'
import { getRequiredAlphaNumericStringSchema, getRequiredStringSchema } from '../shared'

export const ChangePasswordSchema = z
  .object({
    currentPassword: getRequiredStringSchema('Current Password'),
    newPassword: getRequiredAlphaNumericStringSchema('New Password'),
    confirmPassword: getRequiredStringSchema('Confirm Password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })
