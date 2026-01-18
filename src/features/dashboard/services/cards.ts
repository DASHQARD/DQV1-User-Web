import { axiosClient } from '@/libs'
import { getList, patchMethod } from '@/services/requests'
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

export interface GetCardMetricsDetailsParams {
  limit?: number
  after?: string
  card_type?: string
  vendor_ids?: number | number[]
  min_price?: number
}

export interface CardMetricsDetail {
  id: number
  card_id: string
  product: string
  description?: string
  price: string
  base_price?: string
  markup_amount?: string
  service_fee?: string
  currency: string
  type: string
  status: string
  expiry_date?: string
  issue_date?: string
  vendor_id: number
  created_at?: string
  updated_at?: string
  created_by?: number
  last_modified_by?: number | null
  is_activated?: boolean
  rating?: number
  // Optional fields that may be present in some responses
  recipient_id?: string
  branch_id?: number
  branch_name?: string
  branch_location?: string
  vendor_name?: string
  images?: Array<{ file_url: string }>
}

export interface CardMetricsDetailsResponse {
  status: string
  statusCode: number
  message: string
  data: {
    data: CardMetricsDetail[] // Array of cards
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    next: string | null
    previous: string | null
  }
}

export const getCardMetricsDetails = async (
  params?: GetCardMetricsDetailsParams,
): Promise<CardMetricsDetailsResponse> => {
  const response = await axiosClient.get('/cards/users/metrics/details', { params })
  return response as unknown as CardMetricsDetailsResponse
}

export interface CardsPerformanceMetricsParams {
  filter?: 'monthly' | 'quarterly' | 'yearly'
}

export interface CardsPerformanceMetricsData {
  period_key: string
  dashpro_amount: number
  dashx_amount: number
  dashpass_amount: number
  dashgo_amount: number
}

export interface CardsPerformanceMetricsResponse {
  status: string
  statusCode: number
  message: string
  data: CardsPerformanceMetricsData[]
}

export const getCardsPerformanceMetrics = async (query?: Record<string, any>): Promise<any> => {
  return await getList('/cards/performance/metrics', query)
}

export interface RateCardPayload {
  card_id: number
  rating: number
}

export const rateCard = async (data: RateCardPayload): Promise<any> => {
  return await patchMethod('/cards/rate', data)
}
