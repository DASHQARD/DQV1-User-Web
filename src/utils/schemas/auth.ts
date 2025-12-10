import { z } from 'zod'
import {
  getRequiredAlphaNumericStringSchema,
  getRequiredEmailSchema,
  getRequiredNumberSchema,
  getRequiredStringSchema,
} from './shared'

export const LoginSchema = z.object({
  email: getRequiredEmailSchema('Email'),
  password: getRequiredStringSchema('Password'),
})

export const AdminOnboardingSchema = z.object({
  verification_code: getRequiredStringSchema('Verification Code'),
  password: getRequiredAlphaNumericStringSchema('Password'),
})

export const CreateAccountSchema = z
  .object({
    email: getRequiredEmailSchema('Email'),
    password: getRequiredAlphaNumericStringSchema('Password'),
    confirmPassword: getRequiredAlphaNumericStringSchema('Confirm Password'),
    phone_number: getRequiredStringSchema('Phone Number'),
    user_type: z.enum(['user', 'corporate']),
    country: z.number().optional(),
    country_code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.user_type === 'corporate') {
        return (
          data.country !== undefined && data.country !== null && typeof data.country === 'number'
        )
      }
      return true
    },
    {
      message: 'Country is required',
      path: ['country'],
    },
  )
  .refine(
    (data) => {
      if (data.user_type === 'corporate') {
        return (
          data.country_code !== undefined &&
          data.country_code !== null &&
          typeof data.country_code === 'string' &&
          data.country_code.length > 0
        )
      }
      return true
    },
    {
      message: 'Country code is required',
      path: ['country_code'],
    },
  )

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
  first_name: getRequiredStringSchema('First Name'),
  last_name: getRequiredStringSchema('Last Name'),
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
})

export const VerifyLoginOTPSchema = z
  .object({
    otp: getRequiredStringSchema('OTP'),
  })
  .refine((data) => data.otp.length === 4, {
    message: 'OTP must be 4 digits',
    path: ['otp'],
  })

export const BusinessDetailsSchema = z.object({
  name: getRequiredStringSchema('Name'),
  type: z.enum(['llc', 'sole_proprietor', 'partnership']),
  phone: getRequiredStringSchema('Phone'),
  email: getRequiredEmailSchema('Email'),
  street_address: getRequiredStringSchema('Street Address'),
  digital_address: getRequiredStringSchema('Digital Address'),
  registration_number: getRequiredStringSchema('Registration Number'),
})

export const UploadBusinessIDSchema = z.object({
  employer_identification_number: getRequiredStringSchema('Employer Identification Number'),
  business_industry: getRequiredStringSchema('Business Industry'),
  certificate_of_incorporation: z
    .instanceof(File, { message: 'Certificate of Incorporation is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
  business_license: z
    .instanceof(File, { message: 'Business License is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
  articles_of_incorporation: z
    .instanceof(File, { message: 'Articles of Incorporation is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .optional(),
  utility_bill: z
    .instanceof(File, { message: 'Utility Bill is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
  logo: z
    .instanceof(File, { message: 'Logo is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .optional(),
})

const BranchManagerSchema = z.object({
  branch_manager_name: getRequiredStringSchema('Branch Manager Name'),
  branch_manager_email: getRequiredEmailSchema('Branch Manager Email'),
})

export const AddBranchSchema = z.object({
  country: getRequiredNumberSchema('Country'),
  country_code: getRequiredStringSchema('Country Code'),
  main_branch: z.boolean(),
  is_single_branch: z.boolean(),
  branch_name: getRequiredStringSchema('Branch Name'),
  branch_location: getRequiredStringSchema('Branch Location'),
  branches: z
    .array(BranchManagerSchema)
    .min(1, 'At least one branch manager is required')
    .refine((branches) => branches.length > 0, {
      message: 'At least one branch manager is required',
    }),
})

export const AddMainBranchSchema = z.object({
  country: getRequiredStringSchema('Country'),
  country_code: getRequiredStringSchema('Country Code'),
  is_single_branch: z.boolean(),
  branch_name: getRequiredStringSchema('Branch Name'),
  branch_location: getRequiredStringSchema('Branch Location'),
  branch_manager_name: getRequiredStringSchema('Branch Manager Name'),
  branch_manager_email: getRequiredEmailSchema('Branch Manager Email'),
})

export const UpdateUserInfoSchema = z.object({
  fullname: getRequiredStringSchema('Full Name'),
  dob: getRequiredStringSchema('Date of Birth'),
})
