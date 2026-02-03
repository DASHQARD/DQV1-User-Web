import { axiosClient } from '@/libs'

export interface ExperienceApproval {
  id: number
  card_id: number
  product: string
  title?: string
  description?: string
  branch_id: number
  branch_name: string
  branch_manager_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  created_by: string
}

export interface ExperienceApprovalsResponse {
  status: string
  statusCode: number
  message: string
  data: ExperienceApproval[]
}

export const approveExperience = async (
  cardId: number,
): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.post(`/cards/${cardId}/approve`)
  return response as unknown as { status: string; message: string }
}

export const rejectExperience = async (
  cardId: number,
  reason?: string,
): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.post(`/cards/${cardId}/reject`, { reason })
  return response as unknown as { status: string; message: string }
}
