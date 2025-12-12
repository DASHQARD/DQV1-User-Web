import { axiosClient } from '@/libs'
import type { RecipientsListResponse } from '@/types/cart'

export const getRecipientCards = async (): Promise<RecipientsListResponse> => {
  const response = await axiosClient.get<RecipientsListResponse>('/carts/users/recipients')
  return response.data
}

export const getRecipientByID = async (id: number): Promise<RecipientsListResponse> => {
  const response = await axiosClient.get<RecipientsListResponse>(`/carts/recipients/${id}`)
  return response.data
}
