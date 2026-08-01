import { z } from 'zod'
import {
  getRequiredEmailSchema,
  getRequiredInternationalPhoneSchema,
  getRequiredStringSchema,
} from './shared'
import {
  personalInformationFieldsSchema,
  personalInformationFirstNameSchema,
  personalInformationLastNameSchema,
  personalInformationFullNameSchema,
  personalInformationStreetAddressSchema,
  personalInformationDobSchema,
  personalInformationIdTypeSchema,
  personalInformationIdNumberSchema,
} from './personalInformation'
import { validatePersonalInformationIdNumber } from '@/utils/validation/personalInformation'
import { UploadUserIDSchema } from './auth/auth'

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

/** User dashboard profile completion — personal fields plus Ghana Card front/back uploads */
const userDashboardPersonalFieldsSchema = z
  .object({
    first_name: personalInformationFirstNameSchema,
    last_name: personalInformationLastNameSchema,
    street_address: personalInformationStreetAddressSchema,
    dob: personalInformationDobSchema,
    id_type: personalInformationIdTypeSchema,
    id_number: personalInformationIdNumberSchema,
  })
  .superRefine(validatePersonalInformationIdNumber)

export const UserDashboardOnboardingSchema =
  userDashboardPersonalFieldsSchema.merge(UploadUserIDSchema)

/** Settings form for PUT /users/edit-profile (email is display-only; API rejects it) */
export const EditUserProfileSchema = z
  .object({
    full_name: personalInformationFullNameSchema,
    phone_number: getRequiredInternationalPhoneSchema('Phone number'),
    street_address: personalInformationStreetAddressSchema,
    dob: personalInformationDobSchema,
    id_type: personalInformationIdTypeSchema,
    id_number: personalInformationIdNumberSchema,
  })
  .superRefine(validatePersonalInformationIdNumber)

export type EditUserProfileFormData = z.infer<typeof EditUserProfileSchema>
