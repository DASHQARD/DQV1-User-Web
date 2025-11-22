import { z } from 'zod'
import { getRequiredEmailSchema, getRequiredStringSchema } from './shared'

export const ContactUsSchema = z.object({
  name: getRequiredStringSchema('Name'),
  email: getRequiredEmailSchema('Email'),
  subject: getRequiredStringSchema('Subject'),
  message: getRequiredStringSchema('Message'),
})
