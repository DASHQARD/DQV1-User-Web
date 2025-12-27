import { z } from 'zod'
import { getRequiredAlphaNumericStringSchema } from '../shared'

export const AcceptBranchManagerInvitationSchema = z
  .object({
    password: getRequiredAlphaNumericStringSchema('Password'),
    confirm_password: getRequiredAlphaNumericStringSchema('Confirm Password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
