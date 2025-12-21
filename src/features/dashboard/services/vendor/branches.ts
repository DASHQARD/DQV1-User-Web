import { deleteMethod, getList, patchMethod, postMethod } from '@/services/requests'
import type { UpdateBranchStatusPayload } from '@/types'
import type { BranchData, BranchesListResponse, OnboardBranchManagerPayload } from '@/utils/schemas'

const commonUrl = '/vendors'

export const addBranch = async (data: BranchData) => {
  return await postMethod(`${commonUrl}/branch`, data)
}

export const getBranches = async (): Promise<BranchesListResponse> => {
  return await getList<BranchesListResponse>(`${commonUrl}/branches`)
}

export const deleteBranch = async (id: string) => {
  return await deleteMethod(`/branches/${id}`)
}

export const bulkUploadBranches = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return await postMethod(`${commonUrl}/branches/bulk-upload`, formData)
}

export const updateBranchStatus = async (
  payload: UpdateBranchStatusPayload,
): Promise<{ status: string; statusCode: number; message: string }> => {
  const response = await patchMethod(`${commonUrl}/manage-status`, payload)
  return response as unknown as { status: string; statusCode: number; message: string }
}

export const onboardBranchManager = async (
  payload: OnboardBranchManagerPayload,
): Promise<{ status: string; statusCode: number; message: string }> => {
  const response = await patchMethod(`${commonUrl}/onboard/branch-manager`, payload)
  return response as unknown as { status: string; statusCode: number; message: string }
}
