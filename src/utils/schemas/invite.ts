import { z } from 'zod'
import { getRequiredEmailSchema, getRequiredStringSchema } from './shared'

export const InviteBranchManagerSchema = z.object({
  first_name: getRequiredStringSchema('First Name'),
  last_name: getRequiredStringSchema('Last Name'),
  email: getRequiredEmailSchema('Email'),
})

export const InviteVendorAdminSchema = z.object({
  first_name: getRequiredStringSchema('First Name'),
  last_name: getRequiredStringSchema('Last Name'),
  email: getRequiredEmailSchema('Email'),
})

/** For vendor user type: POST /vendors/co-admin/invite (includes phone_number) */
export const InviteVendorCoAdminSchema = z.object({
  first_name: getRequiredStringSchema('First Name'),
  last_name: getRequiredStringSchema('Last Name'),
  email: getRequiredEmailSchema('Email'),
  phone_number: z.string().optional(),
})
