import { z } from 'zod'
import {
  getOptionalEmailSchema,
  getRequiredEmailSchema,
  getRequiredInternationalPhoneSchema,
  getRequiredStringSchema,
} from './shared'

export const UserInfoSchema = z.object({
  full_name: getRequiredStringSchema('Full name'),
  email: getRequiredEmailSchema('Email'),
  phone_number: getRequiredInternationalPhoneSchema('Phone number'),
})

/** Guest checkout — phone required (OTP identity); name and email optional enrichment. */
export const GuestUserInfoSchema = z.object({
  full_name: z.string().optional(),
  email: getOptionalEmailSchema(),
  phone_number: getRequiredInternationalPhoneSchema('Phone number'),
})

export const PaymentMethodSchema = z.object({
  payment_method_type: z.enum(['mobile_money', 'card']).optional(),
  /** For Egnanow mobile: MTNGH | ATGH | TCELGH */
  paypartner_code: z.enum(['MTNGH', 'ATGH', 'TCELGH']).optional(),
  /** For Kowri mobile: MTN_MONEY | AIRTELTIGO_MONEY | VODAFONE_CASH */
  kowri_provider: z.enum(['MTN_MONEY', 'AIRTELTIGO_MONEY', 'VODAFONE_CASH']).optional(),
  /** For card payments */
  card_name: z.string().optional(),
  /** For Egnanow card */
  card_number: z.string().optional(),
  expiry_month: z.coerce.number().min(1).max(12).optional(),
  expiry_year: z.coerce.number().min(2020).max(2040).optional(),
  cvv: z.string().optional(),
})

export type UserInfoFormData = z.infer<typeof UserInfoSchema>
export type GuestUserInfoFormData = z.infer<typeof GuestUserInfoSchema>
/** RHF holds raw input values; Zod coerces to numbers on parse. */
export type PaymentMethodFormData = z.input<typeof PaymentMethodSchema>
