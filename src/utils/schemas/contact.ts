import { z } from 'zod'
import { CONTACT_SUBJECT_VALUES, DEFAULT_CONTACT_SUBJECT } from '@/utils/constants/contact'
import {
  getOptionalInternationalPhoneSchema,
  getRequiredEmailSchema,
  getRequiredInternationalPhoneSchema,
  getRequiredStringSchema,
} from './shared'

export const ContactUsSchema = z.object({
  name: getRequiredStringSchema('Name'),
  email: getRequiredEmailSchema('Email'),
  subject: z.enum(CONTACT_SUBJECT_VALUES, { message: 'Subject is required' }),
  message: getRequiredStringSchema('Message'),
})

export { DEFAULT_CONTACT_SUBJECT }

/** Contact page form: core ticket fields plus optional phone and feedback type. */
export const ContactPageFormSchema = ContactUsSchema.extend({
  phone: getOptionalInternationalPhoneSchema(),
  inquiryType: getRequiredStringSchema('Feedback type'),
})

export type ContactPageFormData = z.infer<typeof ContactPageFormSchema>

export const CreateRecipientSchema = z.object({
  name: getRequiredStringSchema('Name'),
  email: getRequiredEmailSchema('Email'),
  phone: getRequiredInternationalPhoneSchema('Phone'),
})
