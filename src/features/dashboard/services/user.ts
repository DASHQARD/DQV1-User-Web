import { axiosClient } from '@/libs'
import type { UpdateUserInfoPayload } from '@/types'

export const updateUserInfo = async (
  data: UpdateUserInfoPayload,
): Promise<{ status: string; statusCode: number; message: string }> => {
  const response = await axiosClient.patch('/users/edit/profile-info', data)
  return response as unknown as { status: string; statusCode: number; message: string }
}
