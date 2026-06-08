import { axiosClient } from '@/libs'
import { patchMethod } from '@/services/requests'
import type { CardMetricsDetailsResponse, GetCardMetricsDetailsParams } from '@/types'
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

export const getCardById = async (id: string | number): Promise<CardDetailResponse> => {
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

export const deleteCard = async (
  id: string | number,
): Promise<{ status: string; message: string }> => {
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

export const getCardMetricsDetails = async (
  params?: GetCardMetricsDetailsParams,
): Promise<CardMetricsDetailsResponse> => {
  const response = await axiosClient.get('/cards/users/metrics/details', { params })
  return response as unknown as CardMetricsDetailsResponse
}

export interface RateCardPayload {
  card_id: string
  /** Whole number 1–5 */
  rating: number
}

export interface RateCardAggregateData {
  id: string
  rating: number
  rating_count: number
}

export interface RateCardResponse {
  status: string
  statusCode: number
  message: string
  data?: RateCardAggregateData
}

/** PATCH /cards/rate — registered users (`user_type: user`) only */
export const rateCard = async (data: RateCardPayload): Promise<RateCardResponse> => {
  const res = await patchMethod('/cards/rate', data)
  return res as unknown as RateCardResponse
}

/** PATCH /guest-cards/rate — guest OTP token; guest phone from Bearer */
export const rateGuestCard = async (data: RateCardPayload): Promise<RateCardResponse> => {
  const res = await patchMethod('/guest-cards/rate', data)
  return res as unknown as RateCardResponse
}
