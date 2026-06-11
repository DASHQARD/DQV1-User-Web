import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserProfile, useUploadFiles, usePresignedMediaUrl } from '@/hooks'
import { useAuthStore } from '@/stores'
import { finishClientLogout } from '@/utils/finishClientLogout'
import { useAuth } from '@/features/auth'

export function useUserSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout: clearAuthState } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { useGetUserProfileService, useUpdateUserAvatarService } = useUserProfile()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useLogoutService()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: updateAvatar, isPending: isUploadingImage } = useUpdateUserAvatarService()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { url: avatarUrl } = usePresignedMediaUrl(userProfileData?.avatar)

  const [file, setFile] = useState<File | null>(null)
  const imageUrl = avatarUrl ? { imageUrl: avatarUrl } : null

  const handleImageUpload = async (selectedFile: File) => {
    try {
      const uploadedFiles = await uploadFiles([selectedFile])
      if (uploadedFiles && uploadedFiles.length > 0) {
        const first = uploadedFiles[0] as { file_url?: string; file_key?: string }
        const fileUrl = first.file_url || first.file_key
        if (fileUrl) {
          await updateAvatar({ file_url: fileUrl })
          setFile(null)
        }
      }
    } catch (error: unknown) {
      console.error('Failed to upload avatar:', error)
    }
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path
    if (location.pathname === path) return true
    if (location.pathname.startsWith(path + '/')) return true
    return false
  }

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSettled: () => {
        finishClientLogout(navigate, clearAuthState)
      },
    })
  }

  return {
    location,
    navigate,
    isCollapsed,
    setIsCollapsed,
    userProfileData,
    file,
    setFile,
    imageUrl,
    handleImageUpload,
    isUploadingImage,
    isActive,
    handleLogout,
    isLoggingOut,
  }
}
