import { axiosClient } from '@/libs'
import type {
  AssignRecipientPayload,
  RecipientsListResponse,
  CreateRecipientPayload,
  UpdateRecipientPayload,
  UpdateRecipientAmountPayload,
} from '@/types/responses'

export const assignRecipient = async (
  data: AssignRecipientPayload,
): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.post('/carts/assign-recipient', data)
  return response as unknown as { status: string; message: string }
}

export const createRecipient = async (
  data: CreateRecipientPayload,
): Promise<{ status: string; statusCode: number; message: string }> => {
  const response = await axiosClient.post('/carts/add-recipients', data)
  return response as unknown as { status: string; statusCode: number; message: string }
}

export const userRecipient = async (): Promise<RecipientsListResponse> => {
  const response = await axiosClient.get('/carts/user/recipients')
  return response as unknown as RecipientsListResponse
}

export const bulkAssignRecipients = async (
  file: File,
): Promise<{ status: string; message: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosClient.post('/carts/bulk-assign', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response as unknown as { status: string; message: string }
}

export const getRecipients = async (params?: {
  cart_id?: number
  status?: string
  limit?: number
}): Promise<RecipientsListResponse> => {
  const response = await axiosClient.get('/carts/card/recipients', { params })
  return response as unknown as RecipientsListResponse
}

export const deleteRecipient = async (id: number): Promise<void> => {
  await axiosClient.delete(`/carts/recipients/${id}`)
}

export const updateRecipient = async (
  data: UpdateRecipientPayload,
): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.patch('/carts/recipient/update', data)
  return response as unknown as { status: string; message: string }
}

export const updateRecipientAmount = async (
  data: UpdateRecipientAmountPayload,
): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.patch('/carts/recipient/amount', data)
  return response as unknown as { status: string; message: string }
}
