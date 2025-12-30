import { deleteMethod, getList, patchMethod, postMethod } from '@/services/requests'
import type { UpdateBranchStatusPayload } from '@/types'
import type { BranchData, BranchesListResponse, OnboardBranchManagerPayload } from '@/utils/schemas'

const commonUrl = '/vendors'

export const addBranch = async (data: BranchData) => {
  return await postMethod(`${commonUrl}/branch`, data)
}

export const getBranches = async (): Promise<BranchesListResponse> => {
  return await getList<any>(`${commonUrl}/branches`)
}

export const getBranchesByVendorId = async (
  vendorId: number,
  includeRelatedVendors: boolean = false,
): Promise<any> => {
  return await getList<any>(`/branches/vendor/${vendorId}`, {
    include_related_vendors: includeRelatedVendors,
  })
}

export const deleteBranch = async (id: string) => {
  return await deleteMethod(`/branches/${id}`)
}

export const bulkUploadBranches = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return await postMethod(`${commonUrl}/branches/bulk-upload`, formData)
}

export const updateBranchStatus = async (payload: UpdateBranchStatusPayload): Promise<any> => {
  return await patchMethod(`${commonUrl}/manage-status`, payload)
}

export const getBranchManagerInvitation = async (token: string): Promise<any> => {
  return await getList(`${commonUrl}/branch-manager/invitation/${token}`)
}

export const onboardBranchManager = async (payload: OnboardBranchManagerPayload): Promise<any> => {
  return await postMethod(`${commonUrl}/onboard/branch-manager`, payload)
}
