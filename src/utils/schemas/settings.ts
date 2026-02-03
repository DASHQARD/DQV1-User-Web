import { z } from 'zod'
import { getRequiredEmailSchema, getRequiredStringSchema } from './shared'

export const UpdateBusinessDetailsSchema = z.object({
  id: z.number(),
  name: getRequiredStringSchema('Business name'),
  type: getRequiredStringSchema('Business type'),
  phone: getRequiredStringSchema('Phone number'),
  email: getRequiredEmailSchema('Email'),
  street_address: getRequiredStringSchema('Street address'),
  digital_address: z.string().optional().default(''),
  registration_number: getRequiredStringSchema('Registration number'),
})

export type UpdateBusinessDetailsFormData = z.infer<typeof UpdateBusinessDetailsSchema>

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

export const PersonalInformationSchema = z.object({
  full_name: getRequiredStringSchema('Full Name'),
  street_address: getRequiredStringSchema('Street Address'),
  dob: getRequiredStringSchema('Date of Birth'),
  id_type: getRequiredStringSchema('ID Type'),
  id_number: getRequiredStringSchema('ID Number'),
})
