import { z } from 'zod'
import isEmail from 'validator/es/lib/isEmail'

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

export const DashGoDashboardPurchaseFormSchema = z.object({
  recipient_card_amount: z.number().min(1).max(10000),
  recipient_message: z.string().min(1),
  vendor_id: z.string().min(1, 'Vendor is required'),
})

export const DashGoPurchaseFormSchema = z
  .object({
    assign_to_self: z.boolean(),
    vendor_id: z.number().min(1, 'Vendor is required'),
    recipient_name: z.string().optional(),
    recipient_phone: z.string().optional(),
    recipient_email: z.string().optional(),
    recipient_message: z.string().min(1),
    recipient_card_amount: z.number().min(1).max(10000),
    recipient_card_currency: z.string().min(1),
    recipient_card_issue_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
    recipient_card_expiry_date: z.string().optional().or(z.literal('')),
    recipient_card_images: z
      .array(
        z.object({
          file_url: z.string(),
          file_name: z.string(),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // If assign_to_self is false, recipient details are required
    if (!data.assign_to_self) {
      if (!data.recipient_name || data.recipient_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Recipient name is required when not assigning to self',
          path: ['recipient_name'],
        })
      }
      if (!data.recipient_phone || data.recipient_phone.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Recipient phone is required when not assigning to self',
          path: ['recipient_phone'],
        })
      }
      if (!data.recipient_email || data.recipient_email.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Recipient email is required when not assigning to self',
          path: ['recipient_email'],
        })
      } else if (data.recipient_email && !isEmail(data.recipient_email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide a valid email address',
          path: ['recipient_email'],
        })
      }
    }
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
