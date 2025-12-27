import { z } from 'zod'
import { getRequiredAlphaNumericStringSchema } from '../shared'

export const AcceptVendorAdminInvitationSchema = z.object({
  password: getRequiredAlphaNumericStringSchema('Password'),
  //   confirm_password: getRequiredAlphaNumericStringSchema('Confirm Password'),
})
