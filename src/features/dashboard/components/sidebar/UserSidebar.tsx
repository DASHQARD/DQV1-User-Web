import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { USER_NAV_ITEMS, ROUTES } from '@/utils/constants'
import { cn } from '@/libs'
import { Text, Tooltip, TooltipTrigger, TooltipContent, ImageUpload } from '@/components'
import { useAuthStore } from '@/stores'
import Logo from '@/assets/images/logo-placeholder.png'
import { useUserProfile, useUploadFiles, usePresignedURL } from '@/hooks'
import { useAuth } from '@/features/auth'

export default function UserSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const { useGetUserProfileService, useUpdateUserAvatarService } = useUserProfile()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation, isPending: isLoggingOut } = useLogoutService()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: updateAvatar, isPending: isUploadingImage } = useUpdateUserAvatarService()
  const { mutateAsync: uploadFiles } = useUploadFiles()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()

  // State for avatar upload
  const [file, setFile] = React.useState<File | null>(null)
  const [imageUrl, setImageUrl] = React.useState<{ imageUrl: string | null } | null>(null)

  // Fetch current avatar from user profile
  React.useEffect(() => {
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
            imageUrl: typeof url === 'string' ? url : (url as any)?.url || url,
          })
        }
      } catch (error) {
        console.error('Failed to fetch avatar', error)
        if (!cancelled) {
          setImageUrl(null)
        }
      }
    }
    loadAvatar()
    return () => {
      cancelled = true
    }
  }, [userProfileData?.avatar, fetchPresignedURL])

  // Handle image upload
  const handleImageUpload = async (selectedFile: File) => {
    try {
      const uploadedFiles = await uploadFiles([selectedFile])
      if (uploadedFiles && uploadedFiles.length > 0) {
        const fileUrl = (uploadedFiles[0] as any).file_url || (uploadedFiles[0] as any).file_key
        // Update avatar with file_url
        await updateAvatar({ file_url: fileUrl })
        // Reset file state after successful upload
        setFile(null)
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error)
    }
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    if (location.pathname === path) {
      return true
    }
    if (location.pathname.startsWith(path + '/')) {
      return true
    }
    return false
  }

  function handleLogout() {
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

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1 justify-between w-full">
          {!isCollapsed && (
            <Link to={ROUTES.IN_APP.HOME} className="shrink-0">
              <img
                src={Logo}
                alt="Logo"
                className={cn('h-8 w-auto object-contain', isCollapsed && 'h-6 w-6')}
              />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-1.5 rounded-md hover:bg-gray-100 transition-colors shrink-0',
              isCollapsed && 'ml-auto',
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              fill="currentColor"
              height="18"
              viewBox="0 0 18 18"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
              data-sentry-element="svg"
              data-sentry-source-file="Nav.tsx"
            >
              <path
                clipRule="evenodd"
                d="M16 1.5H6.596C6.5624 1.5 6.5456 1.5 6.53276 1.50654C6.52147 1.51229 6.51229 1.52147 6.50654 1.53276C6.5 1.5456 6.5 1.5624 6.5 1.596V16.404C6.5 16.4376 6.5 16.4544 6.50654 16.4672C6.51229 16.4785 6.52147 16.4877 6.53276 16.4935C6.5456 16.5 6.5624 16.5 6.596 16.5H16C16.2761 16.5 16.5 16.2761 16.5 16V2C16.5 1.72386 16.2761 1.5 16 1.5ZM2 0H5H6.5H16C17.1046 0 18 0.895431 18 2V16C18 17.1046 17.1046 18 16 18H2C0.89543 18 0 17.1046 0 16V2C0 0.89543 0.895431 0 2 0ZM4.904 16.5C4.9376 16.5 4.9544 16.5 4.96724 16.4935C4.97853 16.4877 4.98771 16.4785 4.99346 16.4672C5 16.4544 5 16.4376 5 16.404V1.596C5 1.5624 5 1.5456 4.99346 1.53276C4.98771 1.52147 4.97853 1.51229 4.96724 1.50654C4.9544 1.5 4.9376 1.5 4.904 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V16C1.5 16.2761 1.72386 16.5 2 16.5H4.904ZM12.3376 5.53755C12.3138 5.51379 12.3019 5.50191 12.2882 5.49746C12.2762 5.49354 12.2632 5.49354 12.2511 5.49746C12.2374 5.50191 12.2255 5.51379 12.2018 5.53755L9.46967 8.26967L9.00722 8.73212C8.98346 8.75588 8.97158 8.76776 8.96713 8.78146C8.96321 8.79351 8.96321 8.80649 8.96713 8.81854C8.97158 8.83224 8.98346 8.84412 9.00722 8.86788L9.46967 9.33033L12.2018 12.0624C12.2255 12.0862 12.2374 12.0981 12.2511 12.1025C12.2632 12.1065 12.2762 12.1065 12.2882 12.1025C12.3019 12.0981 12.3138 12.0862 12.3376 12.0624L13.2624 11.1376C13.2862 11.1138 13.2981 11.1019 13.3025 11.0882C13.3065 11.0762 13.3065 11.0632 13.3025 11.0511C13.2981 11.0374 13.2862 11.0255 13.2624 11.0018L11.1285 8.86788C11.1048 8.84412 11.0929 8.83224 11.0884 8.81854C11.0845 8.80649 11.0845 8.79351 11.0884 8.78146C11.0929 8.76776 11.1048 8.75588 11.1285 8.73212L13.2624 6.59821C13.2862 6.57445 13.2981 6.56257 13.3025 6.54887C13.3065 6.53682 13.3065 6.52384 13.3025 6.51179C13.2981 6.49809 13.2862 6.48621 13.2624 6.46245L12.3376 5.53755Z"
                fill="currentColor"
                fillRule="evenodd"
                data-sentry-element="path"
                data-sentry-source-file="Nav.tsx"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <div className="p-4">
            {/* Workspace Card */}
            <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 shadow-sm p-4 mb-4">
              {/* Top Section - Workspace Info */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <ImageUpload
                    file={file}
                    onFileChange={setFile}
                    onUpload={handleImageUpload}
                    isUploading={isUploadingImage}
                    currentImageUrl={imageUrl?.imageUrl ?? undefined}
                    className="!h-12 !w-12 !rounded-full shrink-0"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <Text
                    variant="span"
                    weight="bold"
                    className="block text-sm text-gray-900 truncate leading-tight"
                  >
                    {userProfileData?.fullname || 'Personal Account'}
                  </Text>
                  <button
                    onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.SETTINGS.PERSONAL_INFORMATION)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors w-fit"
                  >
                    <Icon icon="bi:pencil" className="text-xs" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ul className="py-2 px-3">
          {USER_NAV_ITEMS.filter((section) => section.section !== 'Settings & Support').map(
            (section) => (
              <React.Fragment key={section.section}>
                {!isCollapsed && (
                  <li className="py-3 px-4 mt-2 first:mt-0">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-500 relative flex items-center">
                      {section.section}
                    </span>
                  </li>
                )}
                {section.items.map((item) => (
                  <li
                    key={item.path}
                    className={cn(
                      'flex items-center mb-1 rounded-lg transition-all duration-200 relative overflow-hidden',
                      isActive(item.path) &&
                        'bg-gradient-to-r from-[#402D87]/10 to-[#402D87]/5 border-l-2 border-[#402D87]',
                      !isActive(item.path) && 'hover:bg-gray-50',
                      isCollapsed && 'justify-center mb-2',
                    )}
                  >
                    {isActive(item.path) && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#402D87] rounded-r" />
                    )}
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              'flex items-center justify-center no-underline font-medium text-sm py-2.5 px-3 w-full transition-all duration-200 rounded-lg relative z-2',
                              isActive(item.path) && 'text-[#402D87]',
                              !isActive(item.path) && 'text-gray-600 hover:text-[#402D87]',
                            )}
                          >
                            <Icon
                              icon={item.icon}
                              className={cn(
                                'w-5 h-5 flex items-center justify-center transition-all duration-200 shrink-0',
                                isActive(item.path) && 'text-[#402D87]',
                                !isActive(item.path) && 'text-gray-500',
                              )}
                            />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 no-underline font-medium text-sm py-2.5 px-4 w-full transition-all duration-200 rounded-lg relative z-2',
                          isActive(item.path) && 'text-[#402D87] font-semibold',
                          !isActive(item.path) && 'text-gray-700 hover:text-[#402D87]',
                        )}
                      >
                        <Icon
                          icon={item.icon}
                          className={cn(
                            'w-5 h-5 flex items-center justify-center transition-all duration-200 shrink-0',
                            isActive(item.path) && 'text-[#402D87]',
                            !isActive(item.path) && 'text-gray-500',
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </React.Fragment>
            ),
          )}
        </ul>
      </nav>

      {/* Footer - Settings and Log Out */}
      <div className="border-t border-gray-200/60 p-3 space-y-1.5">
        {/* Settings */}
        <Link
          to="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 no-underline font-medium text-sm py-2.5 px-4 w-full transition-all duration-200 rounded-lg relative z-2',
            isActive('/dashboard/settings') &&
              'text-[#402D87] font-semibold bg-gradient-to-r from-[#402D87]/10 to-[#402D87]/5 border-l-2 border-[#402D87]',
            !isActive('/dashboard/settings') &&
              'text-gray-700 hover:text-[#402D87] hover:bg-gray-50',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <Icon
            icon="bi:gear"
            className={cn(
              'w-5 h-5 flex items-center justify-center transition-all duration-200 shrink-0',
              isActive('/dashboard/settings') && 'text-[#402D87]',
              !isActive('/dashboard/settings') && 'text-gray-500',
            )}
          />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        {/* Log Out */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-center text-red-600 font-medium text-sm py-2.5 px-2 w-full transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="bi:box-arrow-right" className="w-5 h-5 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Log Out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 text-red-600 font-medium text-sm py-2.5 px-4 w-full transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-700 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="bi:box-arrow-right" className="w-5 h-5 shrink-0" />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  )
}
