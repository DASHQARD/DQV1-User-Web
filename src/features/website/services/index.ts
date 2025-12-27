import { userRecipient } from '../../dashboard/services/recipients'
import { getRecipientCards, getRecipientsByCartId, getCartAllRecipients } from './recipients'
import { getList, getMethod } from '@/services/requests'

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

const getVendorQrCode = async (
  vendor_id: string,
): Promise<{ qr_code: string; vendor_account_id: number }> => {
  return await getMethod(`/vendor-management/qr-code`, vendor_id)
}

export {
  getCards,
  getPublicCards,
  getPublicVendors,
  getPublicVendorCards,
  getVendorQrCode,
  userRecipient,
  getRecipientCards,
  getRecipientsByCartId,
  getCartAllRecipients,
}
