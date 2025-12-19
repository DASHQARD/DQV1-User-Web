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
