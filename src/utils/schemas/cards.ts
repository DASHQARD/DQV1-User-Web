import { z } from 'zod'
import { getRequiredStringSchema } from './shared'

export const CreateCardSchema = z.object({
  product: getRequiredStringSchema('Product'),
  description: getRequiredStringSchema('Description'),
  type: getRequiredStringSchema('Type'),
  price: z.number({ message: 'Price must be a number' }).positive('Price must be greater than 0'),
  currency: getRequiredStringSchema('Currency'),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format'),
  images: z
    .array(
      z.object({
        file_url: z.string(),
        file_name: z.string(),
      }),
    )
    .optional()
    .default([]),
  terms_and_conditions: z
    .array(
      z.object({
        file_url: z.string(),
        file_name: z.string(),
      }),
    )
    .optional()
    .default([]),
})

export const UpdateCardSchema = CreateCardSchema.extend({
  card_id: z.number().positive('Card ID is required'),
})

export const DashGoPurchaseSchema = z.object({
  assign_to_self: z.boolean(),
  recipient_name: z.string().min(1),
  recipient_phone: z.string().min(1),
  recipient_email: z.string().email(),
  recipient_message: z.string().min(1),
  recipient_card_amount: z.number().min(1).max(10000),
  recipient_card_currency: z.string().min(1),
  recipient_card_issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
  recipient_card_expiry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format'),
  recipient_card_images: z.array(
    z.object({
      file_url: z.string(),
      file_name: z.string(),
    }),
  ),
})
