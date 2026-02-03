import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserProfile, useUploadFiles, usePresignedURL } from '@/hooks'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { useAuth } from '@/features/auth'

export function useUserSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { useGetUserProfileService, useUpdateUserAvatarService } = useUserProfile()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useLogoutService()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: updateAvatar, isPending: isUploadingImage } = useUpdateUserAvatarService()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()

  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<{ imageUrl: string | null } | null>(null)

  useEffect(() => {
    if (!userProfileData?.avatar) {
      setImageUrl(null)
      return
    }
    let cancelled = false
    const loadAvatar = async () => {
      try {
        const url = await fetchPresignedURL(userProfileData.avatar!)
        if (!cancelled) {
          setImageUrl({
            imageUrl: typeof url === 'string' ? url : (url as { url?: string })?.url || url,
          })
        }
      } catch (error) {
        console.error('Failed to fetch avatar', error)
        if (!cancelled) setImageUrl(null)
      }
    }
    loadAvatar()
    return () => {
      cancelled = true
    }
  }, [userProfileData?.avatar, fetchPresignedURL])

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
      onSuccess: () => {
        logout()
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
      onError: () => {
        logout()
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
    })
  }

  return {
    location,
    navigate,
    logout,
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
