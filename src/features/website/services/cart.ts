import { axiosClient } from '@/libs'
import type { AddToCartPayload, CartItemResponse, CartListResponse } from '@/types/cart'

export const addToCart = async (data: AddToCartPayload): Promise<CartItemResponse> => {
  // axiosClient interceptor returns data directly
  const response = await axiosClient.post('/carts', data)
  return response as unknown as CartItemResponse
}

export const getCartItems = async (query?: Record<string, any>): Promise<CartListResponse> => {
  const response = await axiosClient.get('/carts', { params: query })
  return response as unknown as CartListResponse
}

export const getCartItem = async (id: number): Promise<CartItemResponse> => {
  // axiosClient interceptor returns data directly
  const response = await axiosClient.get(`/carts/${id}`)
  return response as unknown as CartItemResponse
}

export const deleteCartItem = async (id: number): Promise<void> => {
  await axiosClient.delete(`/carts/${id}`)
}

export const deleteCartItemRecipient = async (cart_item_id: number): Promise<void> => {
  await axiosClient.delete(`/carts/items/${cart_item_id}`)
}
