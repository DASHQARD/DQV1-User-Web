import { getList } from '@/services/requests'

const CORPORATE_API_URL = '/corporate-admin'

export const getCorporate = async (): Promise<any> => {
  return await getList<any>(CORPORATE_API_URL)
}

export const getCorporateById = async (id: string): Promise<any> => {
  return await getList<any>(`${CORPORATE_API_URL}/admin/${id}`)
}

export const getAuditLogs = async (): Promise<any> => {
  return await getList<any>(`/audit-logs/corporates`)
}
