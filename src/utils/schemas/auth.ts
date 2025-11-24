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

export const ForgotPasswordSchema = z.object({
  email: getRequiredEmailSchema('Email'),
})

export const ResetPasswordSchema = z
  .object({
    password: getRequiredAlphaNumericStringSchema('Password'),
    confirmPassword: getRequiredAlphaNumericStringSchema('Confirm Password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const OnboardingSchema = z.object({
  full_name: getRequiredStringSchema('Full Name'),
  phone_number: getRequiredStringSchema('Phone Number'),
  street_address: getRequiredStringSchema('Street Address'),
  dob: getRequiredStringSchema('Date of Birth'),
  id_type: getRequiredStringSchema('ID Type'),
  id_number: getRequiredStringSchema('ID Number'),
})

export const UploadUserIDSchema = z.object({
  front_id: z
    .instanceof(File, { message: 'Front ID photo is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
  back_id: z
    .instanceof(File, { message: 'Back ID photo is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
  selfie_id: z
    .instanceof(File, { message: 'Selfie with ID photo is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
})

export const VerifyLoginOTPSchema = z
  .object({
    otp: getRequiredStringSchema('OTP'),
  })
  .refine((data) => data.otp.length === 4, {
    message: 'OTP must be 4 digits',
    path: ['otp'],
  })
