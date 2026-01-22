import { axiosClient } from '@/libs'
import { deleteMethod, getList, getMethod, postMethod, putMethod } from '@/services/requests'
import { getQueryString } from '@/utils/helpers'
import type { GetBranchRedemptionsParams } from '../../services/redemptions'
import type { CreateExperienceData, RedemptionsListResponse } from '@/types'

const commonManagerUrl = '/cards'
const commonUrl = '/redemptions'

export const getBranchExperiences = async (params?: Record<string, any>): Promise<any> => {
  const queryString = getQueryString(params)
  const fullUrl = queryString
    ? `${commonManagerUrl}/branch?${queryString}`
    : `${commonManagerUrl}/branch`
  const response = await axiosClient.get(fullUrl)
  return response
}

export const updateBranchExperience = async (
  data: Record<string, any> & { id: number },
): Promise<any> => {
  return await putMethod(`${commonManagerUrl}/branch/update`, data)
}

export const getSingleBranchExperience = async (id: string): Promise<any> => {
  return await getMethod<any>(`${commonManagerUrl}/branch/${id}`)
}

export const deleteBranchExperience = async (id: number): Promise<any> => {
  return await deleteMethod(`${commonManagerUrl}/branch/${id}`)
}

export const getBranchRedemptions = async (
  params?: GetBranchRedemptionsParams,
): Promise<RedemptionsListResponse> => {
  return await getList(`${commonUrl}/branches`, { params })
}

export const createBranchExperience = async (payload: CreateExperienceData) => {
  return await postMethod(`${commonManagerUrl}/branch`, payload)
}

export interface BranchInfoResponse {
  status: string
  statusCode: number
  message: string
  data: {
    branch: {
      id: number
      user_id: number
      vendor_id: number
      gvid: string
      branch_manager_name: string
      branch_manager_email: string
      branch_name: string
      branch_location: string
      full_branch_id: string
      branch_code: string
      branch_type: string
      is_single_branch: boolean
      parent_branch_id: number
      status: string
      branch_manager_user_id: number
      created_at: string
      updated_at: string
    }
    branch_manager: {
      id: number
      email: string
      phonenumber: string
      fullname: string
      default_payment_option: string
    }
    payment_details: {
      id: number
      user_id: number
      created_at: string
      updated_at: string
      momo_number: string
      provider: string
      account_number: string
      account_holder_name: string
      bank_name: string
      bank_branch: string
      swift_code: string
      sort_code: string
    }
    business_details: {
      id: number
      user_id: number
      name: string
      type: string
      phone: string
      email: string
      street_address: string
      digital_address: string
      registration_number: string
      country: string
      country_code: string
      logo: string
      created_at: string
      updated_at: string
    }
  }
}

export const getBranchInfo = async (): Promise<BranchInfoResponse> => {
  return await getMethod<BranchInfoResponse>('/branches/info')
}
