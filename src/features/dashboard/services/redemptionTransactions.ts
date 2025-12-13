import { axiosClient } from '@/libs'

export interface RedemptionTransaction {
  id: string
  date: string
  createdAt: string
  amount: number
  status: string
  transactionId?: string
  vendorName?: string
  vendorMobile?: string
  type: 'redemption'
}

export interface RedemptionTransactionsListResponse {
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
  data: RedemptionTransaction[]
}

export const getRedemptionTransactions = async (): Promise<RedemptionTransactionsListResponse> => {
  const response = await axiosClient.get('/vendors/redemption-transactions')
  return response as unknown as RedemptionTransactionsListResponse
}
