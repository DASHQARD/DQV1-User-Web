import { z } from 'zod'
import { getRequiredStringSchema } from '../shared'

export const CreateExperienceSchema = z.object({
  product: getRequiredStringSchema('Product'),
  description: getRequiredStringSchema('Description'),
  type: getRequiredStringSchema('Type'),
  price: z.number({ message: 'Price must be a number' }).positive('Price must be greater than 0'),
  currency: getRequiredStringSchema('Currency'),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format'),
  redemption_branches: z.array(
    z.object({ branch_id: z.number().positive('Branch ID is required') }),
  ),
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

export const UpdateExperienceSchema = CreateExperienceSchema.extend({
  card_id: z.number().positive('Card ID is required'),
})
