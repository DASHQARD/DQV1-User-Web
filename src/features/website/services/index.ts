import { userRecipient } from '../../dashboard/services/recipients'
import { getRecipientCards, getRecipientsByCartId, getCartAllRecipients } from './recipients'
import { getList } from '@/services/requests'

const getCards = async (query?: Record<string, any>): Promise<any> => {
  return await getList('/cards', query)
}

const getPublicCards = async (query?: Record<string, any>): Promise<any> => {
  return await getList(`/cards-info`, query)
}

const getPublicVendorCards = async (vendor_id: string): Promise<any> => {
  return await getList(`/cards-info/${vendor_id}`)
}

const getPublicVendors = async (query?: Record<string, any>): Promise<any> => {
  return await getList(`/vendors/all/details`, query)
}

export {
  getCards,
  getPublicCards,
  getPublicVendors,
  getPublicVendorCards,
  userRecipient,
  getRecipientCards,
  getRecipientsByCartId,
  getCartAllRecipients,
}
