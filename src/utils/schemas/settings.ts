import { z } from 'zod'
import {
  getRequiredEmailSchema,
  getRequiredInternationalPhoneSchema,
  getRequiredStringSchema,
} from './shared'
import { personalInformationFieldsSchema } from './personalInformation'

export const UpdateBusinessDetailsSchema = z.object({
  id: z.number(),
  name: getRequiredStringSchema('Business name'),
  type: getRequiredStringSchema('Business type'),
  phone: getRequiredInternationalPhoneSchema('Phone number'),
  email: getRequiredEmailSchema('Email'),
  street_address: getRequiredStringSchema('Street address'),
  digital_address: z.string().optional().default(''),
  registration_number: getRequiredStringSchema('Registration number'),
})

export type UpdateBusinessDetailsFormData = z.infer<typeof UpdateBusinessDetailsSchema>

export const SettingsSchema = z.object({
  fullname: getRequiredStringSchema('Full Name'),
  phonenumber: getRequiredInternationalPhoneSchema('Phone Number'),
  email: getRequiredEmailSchema('Email'),
  oldPassword: z.string().optional(),
  password: z.string().optional(),
  newPassword: z.string().optional(),
  newPin: z.string().optional(),
  name: z.string().optional(),
  reason: z.string().optional(),
})

export const PersonalInformationSchema = personalInformationFieldsSchema
