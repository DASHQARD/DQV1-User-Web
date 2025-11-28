import { axiosClient } from '@/libs'
import type { CardsListResponse, PublicCardsResponse } from '@/types/cards'

const getCards = async (query?: Record<string, any>): Promise<CardsListResponse> => {
  const response = await axiosClient.get('/cards', query)
  return response.data
}

const getPublicCards = async (): Promise<PublicCardsResponse> => {
  const response = await axiosClient.get('/cards-info')
  return response.data
}

export { getCards, getPublicCards }
