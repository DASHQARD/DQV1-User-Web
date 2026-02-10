import { z } from 'zod'
import { getRequiredEmailSchema, getRequiredStringSchema } from './shared'

export const UserInfoSchema = z.object({
  full_name: getRequiredStringSchema('Full name'),
  email: getRequiredEmailSchema('Email'),
  phone_number: getRequiredStringSchema('Phone number'),
})

export type UserInfoFormData = z.infer<typeof UserInfoSchema>
