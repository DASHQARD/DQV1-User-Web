import { z } from 'zod'
import { getRequiredStringSchema } from './shared'
import isEmail from 'validator/es/lib/isEmail'

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

export const DashGoAndDashProPurchaseFormSchema = z.object({
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

export const AssignRecipientSchema = z
  .object({
    assign_to_self: z.boolean(),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    message: z.string().optional(),
    amount: z
      .number()
      .min(1, 'Amount must be at least 1')
      .max(10000, 'Amount cannot exceed 10,000'),
  })
  .superRefine((data, ctx) => {
    // If assign_to_self is false, name is required, email and phone are optional
    if (!data.assign_to_self) {
      if (!data.name || data.name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Name is required when not assigning to self',
          path: ['name'],
        })
      }
      // Email is optional but if provided, must be valid
      if (data.email && data.email.trim().length > 0 && !isEmail(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide a valid email address',
          path: ['email'],
        })
      }
    }
  })
