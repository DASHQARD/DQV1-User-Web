import { deleteMethod, getList, postMethod, putMethod } from '@/services/requests'
import { getMethod } from '@/services/requests'
import type { CreateExperienceData } from '@/types'

const commonManagerUrl = '/cards'

export const createExperience = async (data: CreateExperienceData) => {
  return await postMethod(`${commonManagerUrl}`, data)
}

export const getCardsByVendorId = async ({ vendor_id }: { vendor_id: number }) => {
  return await getList(`${commonManagerUrl}/vendor/${vendor_id}`)
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
