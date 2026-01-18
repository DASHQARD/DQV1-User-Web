import { axiosClient } from '@/libs/axios'
import { getQueryString } from '@/utils/helpers'

export const postMethod = async (url: string, payload?: any) => {
  const res = await axiosClient.post(url, payload)
  return res
}

export const getList = async <T = any>(url: string, query?: Record<string, any>): Promise<T> => {
  const queryString = getQueryString(query)
  const fullUrl = queryString ? `${url}?${queryString}` : url
  const res = await axiosClient.get(fullUrl)
  return res.data
}

export const getMethod = async <T = any>(url: string, id?: string): Promise<T> => {
  const readyUrl = id ? `${url}/${id}` : url
  const res = await axiosClient.get(readyUrl)
  return res.data
}

export const patchMethod = async (url: string, payload?: any) => {
  const res = await axiosClient.patch(url, payload)
  return res
}

export const deleteMethod = async (url: string, payload?: any) => {
  const res = await axiosClient.delete(url, payload)
  return res
}

export const putMethod = async (customUrl: string, payload?: any) => {
  const res = await axiosClient.put(customUrl, payload)
  return res
}

export const fetchFileUrl = async (key: string) => {
  const res = await axiosClient.get(`shared/s3/signed-url?key=${key}`)
  return res.data
}
