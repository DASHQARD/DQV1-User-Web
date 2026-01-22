import { axiosClient } from '@/libs'
import { deleteMethod, getList, postMethod, putMethod } from '@/services/requests'
import { getMethod } from '@/services/requests'
import { getQueryString } from '@/utils/helpers'
import type { CreateExperienceData, VendorCardCountsResponse } from '@/types'

const commonManagerUrl = '/cards'

export const createExperience = async (data: CreateExperienceData) => {
  return await postMethod(`${commonManagerUrl}`, data)
}

export const getCardsByVendorId = async (opts: {
  vendor_id: number
  limit?: number
  after?: string
  search?: string
  status?: string
}): Promise<any> => {
  const { vendor_id, ...queryParams } = opts
  const queryString = getQueryString(queryParams)
  const base = `${commonManagerUrl}/vendor/${vendor_id}`
  const fullUrl = queryString ? `${base}?${queryString}` : base
  const response = await axiosClient.get(fullUrl)
  return response
}

export const getCardById = async (id: string | number) => {
  return await getList(`${commonManagerUrl}/${id}`)
}

export const updateCard = async (data: CreateExperienceData & { id: number }) => {
  return await putMethod(`${commonManagerUrl}/update`, data)
}

export const deleteCard = async (id: string | number) => {
  return await deleteMethod(`${commonManagerUrl}/${id}`)
}

export const getCardsMetrics = async () => {
  return await getMethod(`${commonManagerUrl}/users/metrics`)
}

export const getCardsPerformanceMetrics = async () => {
  return await getMethod(`${commonManagerUrl}/users/metrics/performance`)
}

export const getVendorCardCounts = async (): Promise<VendorCardCountsResponse> => {
  return await getMethod<VendorCardCountsResponse>(`${commonManagerUrl}/vendor/gift-card/counts`)
}
