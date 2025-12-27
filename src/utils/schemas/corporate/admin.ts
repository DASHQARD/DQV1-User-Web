import { z } from 'zod'
import {
  getRequiredEmailSchema,
  getRequiredStringSchema,
  getRequiredAlphaNumericStringSchema,
} from '../shared'

export const InviteAdminSchema = z.object({
  first_name: getRequiredStringSchema('First Name'),
  last_name: getRequiredStringSchema('Last Name'),
  email: getRequiredEmailSchema('Email'),
  phone_number: getRequiredStringSchema('Phone Number'),
  role: getRequiredStringSchema('Role'),
})

export const AcceptCorporateAdminInvitationSchema = z.object({
  token: getRequiredStringSchema('Token'),
  password: getRequiredAlphaNumericStringSchema('Password'),
})

export const AcceptCorporateAdminInvitationFormSchema = z.object({
  password: getRequiredAlphaNumericStringSchema('Password'),
  confirm_password: getRequiredAlphaNumericStringSchema('Confirm Password'),
})

export const DeleteAdminInvitiationFormSchema = z.object({})

export const ToggleCustomerStatusSchema = z.object({
  reason: getRequiredStringSchema('Reason'),
})
