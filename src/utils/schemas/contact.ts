import { z } from 'zod'
import {
  getOptionalInternationalPhoneSchema,
  getRequiredEmailSchema,
  getRequiredInternationalPhoneSchema,
  getRequiredStringSchema,
} from './shared'

export const ContactUsSchema = z.object({
  name: getRequiredStringSchema('Name'),
  email: getRequiredEmailSchema('Email'),
  subject: getRequiredStringSchema('Subject'),
  message: getRequiredStringSchema('Message'),
})

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
