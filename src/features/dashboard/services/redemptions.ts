import { axiosClient } from '@/libs'

export interface VendorRedemption {
  id: string
  amount: number
  giftCardType: string
  updated_at: string
  transactionId?: string
  status?: string
}

export interface RedemptionsListResponse {
  status: string
  statusCode: number
  message: string
  pagination: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    limit: number
    next: string | null
    previous: string | null
  }
  data: VendorRedemption[]
}

export const getRedemptions = async (): Promise<RedemptionsListResponse> => {
  const response = await axiosClient.get('/vendors/redemptions')
  return response as unknown as RedemptionsListResponse
}
