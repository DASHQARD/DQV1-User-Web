import { putMethod } from '@/services/requests'
import type { EditUserProfilePayload, EditUserProfileResponse, UpdateUserInfoPayload } from '@/types'
import { axiosClient } from '@/libs'

/** PUT /users/edit-profile — profile changes require admin approval (personal_info_update request) */
export const editUserProfile = async (
  data: EditUserProfilePayload,
): Promise<EditUserProfileResponse> => {
  const response = await putMethod('/users/edit-profile', data)
  return response as unknown as EditUserProfileResponse
}

export const updateUserInfo = async (
  data: UpdateUserInfoPayload,
): Promise<{ status: string; statusCode: number; message: string }> => {
  const response = await axiosClient.patch('/users/edit/profile-info', data)
  return response as unknown as { status: string; statusCode: number; message: string }
}
