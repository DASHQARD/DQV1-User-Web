import { z } from 'zod'
import {
  getRequiredAlphaNumericStringSchema,
  getRequiredEmailSchema,
  getRequiredStringSchema,
} from './shared'

export const LoginSchema = z.object({
  email: getRequiredEmailSchema('Email'),
  password: getRequiredStringSchema('Password'),
})

export const CreateAccountSchema = z
  .object({
    email: getRequiredEmailSchema('Email'),
    password: getRequiredAlphaNumericStringSchema('Password'),
    confirmPassword: getRequiredAlphaNumericStringSchema('Confirm Password'),
    user_type: z.enum(['user', 'vendor', 'corporate']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const ResetPasswordSchema = z.object({
  email: getRequiredEmailSchema('Email'),
})
