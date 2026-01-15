import { deleteMethod, getList, getMethod, postMethod, putMethod } from '@/services/requests'
import type {
  GetBranchRedemptionsParams,
  RedemptionsListResponse,
} from '../../services/redemptions'
import type { CreateExperienceData } from '@/types'

const commonManagerUrl = '/cards'
const commonUrl = '/redemptions'

export const getBranchExperiences = async (params?: Record<string, any>): Promise<any> => {
  return await getList(`${commonManagerUrl}/branch`, { params })
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
