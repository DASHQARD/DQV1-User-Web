import { z } from 'zod'

import {
  getRequiredInternationalPhoneSchema,
  INVALID_PHONE_MESSAGE,
  isValidEmailAddress,
  isValidInternationalPhoneDigits,
} from './shared'

export const DashGoAndDashProPurchaseFormSchema = z.object({
  assign_to_self: z.boolean(),
  recipient_first_name: z.string().min(1),
  recipient_last_name: z.string().min(1),
  recipient_phone: getRequiredInternationalPhoneSchema('Recipient phone'),
  recipient_email: z.string().refine((val) => isValidEmailAddress(val), {
    message: 'Invalid email address',
  }),
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
    vendor_id: z.string().min(1, 'Vendor is required'),
    recipient_first_name: z.string().optional(),
    recipient_last_name: z.string().optional(),
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
      if (!data.recipient_first_name || data.recipient_first_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'First name is required when not assigning to self',
          path: ['recipient_first_name'],
        })
      }
      if (!data.recipient_last_name || data.recipient_last_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last name is required when not assigning to self',
          path: ['recipient_last_name'],
        })
      }
      const recipientPhone = data.recipient_phone?.trim()
      if (recipientPhone && !isValidInternationalPhoneDigits(recipientPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: INVALID_PHONE_MESSAGE,
          path: ['recipient_phone'],
        })
      }
      const recipientEmail = data.recipient_email?.trim()
      if (recipientEmail && !isValidEmailAddress(recipientEmail)) {
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
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    message: z.string().optional(),
    amount: z
      .number()
      .min(1, 'Amount must be at least 1')
      .max(10000, 'Amount cannot exceed 10,000'),
  })
  .superRefine((data, ctx) => {
    if (!data.assign_to_self) {
      if (!data.first_name || data.first_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'First name is required when not assigning to yourself',
          path: ['first_name'],
        })
      }
      if (!data.last_name || data.last_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last name is required when not assigning to yourself',
          path: ['last_name'],
        })
      }
      const recipientPhone = data.phone?.trim()
      if (recipientPhone && !isValidInternationalPhoneDigits(recipientPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: INVALID_PHONE_MESSAGE,
          path: ['phone'],
        })
      }
      const recipientEmail = data.email?.trim()
      if (recipientEmail && !isValidEmailAddress(recipientEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide a valid email address',
          path: ['email'],
        })
      }
    } else {
      const email = data.email?.trim()
      if (email && !isValidEmailAddress(email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide a valid email address',
          path: ['email'],
        })
      }
      // Phone is optional when assigning to self (guests verify at checkout).
    }
  })

export const DashGoAssignRecipientSchema = z
  .object({
    assign_to_self: z.boolean(),
    vendor_id: z.string().min(1, 'Vendor is required'),
    recipient_first_name: z.string().optional().or(z.literal('')),
    recipient_last_name: z.string().optional().or(z.literal('')),
    recipient_phone: z.string().optional().or(z.literal('')),
    recipient_email: z.string().optional().or(z.literal('')),
    recipient_message: z.string().optional(),
    recipient_card_amount: z.number().min(1).max(10000),
    recipient_card_currency: z.string().min(1),
    recipient_card_issue_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be in YYYY-MM-DD format'),
    recipient_card_expiry_date: z.string().optional().or(z.literal('')),
    recipient_card_images: z.array(
      z.object({
        file_url: z.string(),
        file_name: z.string(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.assign_to_self) {
      if (!data.recipient_first_name || data.recipient_first_name.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'First name is required when not assigning to yourself',
          path: ['recipient_first_name'],
        })
      }
      if (!data.recipient_last_name || data.recipient_last_name.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last name is required when not assigning to yourself',
          path: ['recipient_last_name'],
        })
      }
      const recipientPhone = data.recipient_phone?.trim()
      if (recipientPhone && !isValidInternationalPhoneDigits(recipientPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: INVALID_PHONE_MESSAGE,
          path: ['recipient_phone'],
        })
      }
      const recipientEmail = data.recipient_email?.trim()
      if (recipientEmail && !isValidEmailAddress(recipientEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide a valid email address',
          path: ['recipient_email'],
        })
      }
    } else {
      const email = data.recipient_email?.trim()
      if (email && !isValidEmailAddress(email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide a valid email address',
          path: ['recipient_email'],
        })
      }
      const phone = data.recipient_phone?.trim()
      if (phone && !isValidInternationalPhoneDigits(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: INVALID_PHONE_MESSAGE,
          path: ['recipient_phone'],
        })
      }
    }
  })
