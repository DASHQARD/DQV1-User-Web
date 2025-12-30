import { axiosClient } from '@/libs'
import type {
  CreateCardData,
  UpdateCardData,
  CardsListResponse,
  CardDetailResponse,
} from '@/types/responses'

export const getCards = async (params?: {
  card_type?: 'corporate' | 'vendor' | 'all'
}): Promise<any> => {
  const response = await axiosClient.get('/cards', { params })
  return response as unknown as CardsListResponse
}

export const getCardById = async (id: number): Promise<CardDetailResponse> => {
  const response = await axiosClient.get(`/cards/${id}`)
  return response as unknown as CardDetailResponse
}

export const createCard = async (data: CreateCardData): Promise<CardDetailResponse> => {
  // Remove expiry_date for DashGo and DashPro cards (not allowed by API)
  const cardType = data.type?.toLowerCase()
  const isDashGoOrDashPro = cardType === 'dashgo' || cardType === 'dashpro'

  const payload = isDashGoOrDashPro ? (({ ...rest }) => rest)(data) : data

  const response = await axiosClient.post('/cards', payload)
  return response as unknown as CardDetailResponse
}

export const updateCard = async (data: UpdateCardData): Promise<CardDetailResponse> => {
  // Remove expiry_date for DashGo and DashPro cards (not allowed by API)
  const cardType = data.type?.toLowerCase()
  const isDashGoOrDashPro = cardType === 'dashgo' || cardType === 'dashpro'

  const payload = isDashGoOrDashPro ? (({ ...rest }) => rest)(data) : data

  const response = await axiosClient.put('/cards/update', payload)
  return response as unknown as CardDetailResponse
}

export const deleteCard = async (id: number): Promise<{ status: string; message: string }> => {
  const response = await axiosClient.delete(`/cards/${id}`)
  return response as unknown as { status: string; message: string }
}

export interface GiftCardMetricsResponse {
  status: string
  statusCode: number
  message: string
  data: {
    DashX: number
    DashGo: number
    DashPass: number
    DashPro: number
  }
}

export const getGiftCardMetrics = async (): Promise<GiftCardMetricsResponse> => {
  const response = await axiosClient.get('/cards/users/metrics')
  return response as unknown as GiftCardMetricsResponse
}
