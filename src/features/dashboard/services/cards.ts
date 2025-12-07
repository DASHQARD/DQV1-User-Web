import { axiosClient } from '@/libs'
import type {
  CreateCardData,
  UpdateCardData,
  CardsListResponse,
  CardDetailResponse,
} from '@/types/cards'

export const getCards = async (params?: {
  card_type?: 'corporate' | 'vendor' | 'all'
}): Promise<CardsListResponse> => {
  const response = await axiosClient.get('/cards', { params })
  return response as unknown as CardsListResponse
}

export const getCardById = async (id: number): Promise<CardDetailResponse> => {
  const response = await axiosClient.get(`/cards/${id}`)
  return response as unknown as CardDetailResponse
}

export const createCard = async (data: CreateCardData): Promise<CardDetailResponse> => {
  const response = await axiosClient.post('/cards', data)
  return response as unknown as CardDetailResponse
}

export const updateCard = async (data: UpdateCardData): Promise<CardDetailResponse> => {
  // axiosClient interceptor returns data directly, but TypeScript needs the cast
  const response = await axiosClient.put('/cards/update', data)
  return response as unknown as CardDetailResponse
}

export const deleteCard = async (id: number): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.delete(`/cards/${id}`)
  return response as unknown as { status: string; message: string }
}
