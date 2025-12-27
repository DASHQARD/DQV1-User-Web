import { deleteMethod, getList, getMethod, postMethod, patchMethod } from '@/services/requests'
import type { AddToCartPayload, CartItemResponse, CartListResponse } from '@/types/responses'

export const addToCart = async (data: AddToCartPayload): Promise<any> => {
  return await postMethod('/carts', data)
}

export const getCartItems = async (query?: Record<string, any>): Promise<CartListResponse[]> => {
  return await getList('/carts', query)
}

export const getCartItem = async (id: number): Promise<CartItemResponse> => {
  return await getMethod(`/carts/${id}`)
}

export const deleteCartItem = async (id: number): Promise<any> => {
  return await deleteMethod(`/carts/${id}`)
}

export const deleteCartItemRecipient = async (cart_item_id: number): Promise<any> => {
  return await deleteMethod(`/carts/items/${cart_item_id}`)
}

export const updateCartItem = async (data: {
  cart_item_id: number
  quantity: number
  amount: number
}): Promise<any> => {
  return await patchMethod('/carts/items', data)
}
