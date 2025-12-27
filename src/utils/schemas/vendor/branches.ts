import { z } from 'zod'
import { getRequiredEmailSchema, getRequiredStringSchema } from '../shared'

export interface Branch {
  id: string
  user_id: number
  branch_manager_name: string
  branch_manager_email: string
  branch_name: string
  branch_location: string
  is_single_branch: boolean
  created_at: string
  updated_at: string
  vendor_id: number
  full_branch_id: string
  gvid: string
  parent_branch_id: string | null
  branch_code: string
  branch_type: string
  status: string
}

export interface OnboardBranchManagerPayload {
  token: string
  password: string
}
export interface BranchesListResponse {
  status: string
  statusCode: number
  message: string
  pagination: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    next: string | null
    previous: string | null
  }
  data: Branch[]
}

export interface DeleteBranchResponse {
  status: string
  statusCode: number
  message: string
}

export interface BulkBranchesUploadResponse {
  status: string
  statusCode: number
  message: string
  data: {
    successful: number
    failed: number
    total: number
  }
}

export type BranchData = {
  branch_name: string
  branch_location: string
  branch_manager_name: string
  branch_manager_email: string
  branch_manager_phone: string
  country: string
  country_code?: string
  payment_method: 'mobile_money' | 'bank'
  mobile_money_provider?: string
  mobile_money_number?: string
  bank_name?: string
  branch?: string
  account_name?: string
  account_number?: string
  sort_code?: string
  swift_code?: string
}

export const CreateBranchFormSchema = z
  .object({
    branch_name: getRequiredStringSchema('Branch Name'),
    branch_location: getRequiredStringSchema('Branch Location'),
    branch_manager_name: getRequiredStringSchema('Branch Manager Name'),
    branch_manager_email: getRequiredEmailSchema('Branch Manager Email'),
    branch_manager_phone: getRequiredStringSchema('Branch Manager Phone Number'),
    country: getRequiredStringSchema('Country'),
    country_code: z.string().optional(),
    payment_method: z.enum(['mobile_money', 'bank']),
    mobile_money_provider: z.string().optional(),
    mobile_money_number: z.string().optional(),
    bank_name: z.string().optional(),
    branch: z.string().optional(),
    account_name: z.string().optional(),
    account_number: z.string().optional(),
    sort_code: z.string().optional(),
    swift_code: z.string().optional(),
  })
  .refine(
    (data) => {
      // If payment_method is mobile_money, provider and number are required
      if (data.payment_method === 'mobile_money') {
        return !!(data.mobile_money_provider && data.mobile_money_number)
      }
      return true
    },
    {
      message: 'Mobile Money Provider and Mobile Money Number are required',
      path: ['mobile_money_provider'],
    },
  )
  .refine(
    (data) => {
      // If payment_method is bank, all bank fields are required
      if (data.payment_method === 'bank') {
        return !!(
          data.bank_name &&
          data.account_number &&
          data.account_name &&
          data.sort_code &&
          data.swift_code
        )
      }
      return true
    },
    {
      message: 'All bank details are required',
      path: ['bank_name'],
    },
  )
