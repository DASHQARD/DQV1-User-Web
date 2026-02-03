import { z } from 'zod'
import {
  getRequiredAlphaNumericStringSchema,
  getRequiredEmailSchema,
  getRequiredStringSchema,
} from '../shared'

export const CreateBranchManagerInvitationSchema = z.object({
  branch_id: z.union([
    getRequiredStringSchema('Branch'),
    z.number().positive('Branch is required'),
  ]),
  branch_manager_name: getRequiredStringSchema('Name'),
  branch_manager_email: getRequiredEmailSchema('Email'),
  branch_manager_phone: getRequiredStringSchema('Phone number'),
})

export type CreateBranchManagerInvitationFormData = z.infer<
  typeof CreateBranchManagerInvitationSchema
>

export const UpdateBranchManagerInvitationSchema = z.object({
  branch_manager_name: getRequiredStringSchema('Name'),
  branch_manager_email: getRequiredEmailSchema('Email'),
  branch_manager_phone: getRequiredStringSchema('Phone number'),
})

export type UpdateBranchManagerInvitationFormData = z.infer<
  typeof UpdateBranchManagerInvitationSchema
>

export const RemoveBranchManagerSchema = z.object({
  password: getRequiredStringSchema('Password'),
})

export type RemoveBranchManagerFormData = z.infer<typeof RemoveBranchManagerSchema>

export const AcceptBranchManagerInvitationSchema = z
  .object({
    password: getRequiredAlphaNumericStringSchema('Password'),
    confirm_password: getRequiredAlphaNumericStringSchema('Confirm Password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
