import { axiosClient } from '@/libs'
import type { CardsListResponse, PublicCardResponse, PublicCardsResponse } from '@/types/cards'
import type { VendorDetailsResponse } from '@/types/vendor'
import { userRecipient } from '../../dashboard/services/recipients'
import { getRecipientCards } from './recipients'

const getCards = async (query?: Record<string, any>): Promise<CardsListResponse> => {
  const response = await axiosClient.get('/cards', query)
  return response.data
}

const getPublicCards = async (query?: Record<string, any>): Promise<PublicCardsResponse> => {
  const response = await axiosClient.get('/cards-info', query)
  return response as unknown as PublicCardsResponse
}

const getPublicVendorCards = async (vendor_id: string): Promise<PublicCardsResponse> => {
  const response = await axiosClient.get(`/cards-info/${vendor_id}`)
  return response.data
}

const getPublicCardById = async (card_id: string | number): Promise<PublicCardResponse> => {
  const response = await axiosClient.get(`/cards-info/${card_id}`)
  return response.data
}

const getPublicVendors = async (params: {
  limit: number
  search?: string
  status?: string
  vendor_id?: string
  branch_type?: string
  is_single_branch?: string
  parent_branch_id?: string
  card_type?: string
  card_id?: string
  date_from?: string
  date_to?: string
  min_price?: string
  max_price?: string
}): Promise<VendorDetailsResponse> => {
  const response = await axiosClient.get(`/vendors/details`, { params })
  return response as unknown as VendorDetailsResponse
}

export {
  getCards,
  getPublicCards,
  getPublicVendors,
  getPublicVendorCards,
  getPublicCardById,
  userRecipient,
  getRecipientCards,
}
