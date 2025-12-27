import { axiosClient } from '@/libs'
import { getList } from '@/services/requests'
import type { RecipientsListResponse } from '@/types/responses'

export const getRecipientCards = async (): Promise<RecipientsListResponse> => {
  const response = await axiosClient.get<RecipientsListResponse>('/carts/users/recipients')
  return response.data
}

export const getRecipientByID = async (id: number): Promise<RecipientsListResponse> => {
  const response = await axiosClient.get<RecipientsListResponse>(`/carts/recipients/${id}`)
  return response.data
}

export const getRecipientsByCartId = async (cartId: number): Promise<RecipientsListResponse> => {
  const response = await axiosClient.get<RecipientsListResponse>(`/carts/recipients/${cartId}`)
  return response.data
}

export const getCartAllRecipients = async (): Promise<RecipientsListResponse> => {
  return await getList<RecipientsListResponse>(`/carts/all/recipients`)
}
