import { z } from 'zod'
import { getRequiredEmailSchema, getRequiredStringSchema } from './shared'

export const SettingsSchema = z.object({
  fullname: getRequiredStringSchema('Full Name'),
  phonenumber: getRequiredStringSchema('Phone Number'),
  email: getRequiredEmailSchema('Email'),
  oldPassword: z.string().optional(),
  password: z.string().optional(),
  newPassword: z.string().optional(),
  newPin: z.string().optional(),
  name: z.string().optional(),
  reason: z.string().optional(),
})
