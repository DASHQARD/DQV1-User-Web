import { z } from 'zod'
import { getRequiredEmailSchema, getRequiredStringSchema } from './shared'

export const InviteAdminSchema = z.object({
  name: getRequiredStringSchema('Name'),
  email: getRequiredEmailSchema('Email'),
  role: getRequiredStringSchema('Role'),
})
