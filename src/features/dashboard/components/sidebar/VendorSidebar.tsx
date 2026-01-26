import React from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import { VENDOR_NAV_ITEMS, ROUTES } from '@/utils/constants'
import { cn } from '@/libs'
import { Text, Tooltip, TooltipTrigger, TooltipContent, Avatar } from '@/components'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/PopOver'
import { PaymentChangeNotifications } from '../corporate/notifications/PaymentChangeNotifications'
import { ExperienceApprovalNotifications } from '../corporate/notifications/ExperienceApprovalNotifications'
import { CreateVendorAccount } from '../corporate/modals'
import { useUserProfile, usePresignedURL } from '@/hooks'
import { useAuthStore } from '@/stores'
import { vendorQueries } from '@/features'

export default function VendorSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { logout, user } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)

  const userType = (user as any)?.user_type || userProfileData?.user_type
  const isVendor = userType === 'vendor'
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  // Get display name - always show "Vendor" when on vendor dashboard
  const displayName = React.useMemo(() => {
    return 'Vendor'
  }, [])

  const { useBranchesService, useGetAllVendorsDetailsService } = vendorQueries()
  const { data: branches } = useBranchesService()
  const { data: allVendorsDetails } = useGetAllVendorsDetailsService()

  console.log('switch workspace', allVendorsDetails)

  // Handle branches data structure (array or wrapped response)
  const branchesArray = Array.isArray(branches) ? branches : branches?.data || []

  // Calculate discovery score based on onboarding progress
  const discoveryScore = React.useMemo(() => {
    const progress = userProfileData?.onboarding_progress
    if (!progress) return 0

    // For vendors: count as 3 steps like CompleteVendorWidget
    // 1. Profile & ID (personal_details + upload_id combined)
    // 2. Business Details & Docs (business_details + business_documents combined)
    // 3. Branches (actual branches exist, not just the flag)
    const hasProfileAndID = progress.personal_details_completed && progress.upload_id_completed
    const hasBusinessDetailsAndDocs =
      progress.business_details_completed && progress.business_documents_completed
    const hasBranches = branchesArray.length > 0

    const completedCount =
      (hasProfileAndID ? 1 : 0) + (hasBusinessDetailsAndDocs ? 1 : 0) + (hasBranches ? 1 : 0)
    const totalCount = 3
    return Math.round((completedCount / totalCount) * 100)
  }, [userProfileData?.onboarding_progress, branchesArray.length])

  // Get vendors created by this corporate user
  const vendorsCreatedByCorporate = React.useMemo(() => {
    const vendorsData = Array.isArray(allVendorsDetails)
      ? allVendorsDetails
      : allVendorsDetails?.data || []
    return vendorsData.filter(
      (vendor: any) =>
        vendor.corporate_user_id === userProfileData?.id &&
        vendor.approval_status === 'auto_approved',
    )
  }, [allVendorsDetails, userProfileData?.id])

  // Check if user can access corporate workspace
  // Show corporate account if user has corporate_id or if they have vendors created (meaning they have a corporate account)
  const canAccessCorporate = React.useMemo(() => {
    // Check if user type allows corporate access
    if (userType === 'corporate_vendor' || userType === 'corporate super admin') {
      return true
    }
    // Check if user has corporate_id (meaning they have a corporate account)
    if (userProfileData?.corporate_id) {
      return true
    }
    // Check if user has created vendors (meaning they came from corporate side)
    if (vendorsCreatedByCorporate && vendorsCreatedByCorporate.length > 0) {
      return true
    }
    return false
  }, [userType, userProfileData?.corporate_id, vendorsCreatedByCorporate])

  // State for vendor logo URLs
  const [vendorLogoUrls, setVendorLogoUrls] = React.useState<Record<number, string>>({})

  // Fetch vendor logo presigned URLs
  React.useEffect(() => {
    if (vendorsCreatedByCorporate.length === 0) return

    const fetchLogos = async () => {
      const logoPromises = vendorsCreatedByCorporate.map(async (vendor: any) => {
        if (!vendor.vendor_logo) return null
        try {
          const url = await fetchPresignedURL(vendor.vendor_logo)
          return { vendorId: vendor.vendor_id, url }
        } catch (error) {
          throw new Error(`Failed to fetch logo for vendor ${vendor.vendor_id}: ${error}`)
        }
      })

      const results = await Promise.all(logoPromises)
      const logoMap: Record<number, string> = {}
      results.forEach((result) => {
        if (result) {
          logoMap[result.vendorId] = result.url
        }
      })
      setVendorLogoUrls(logoMap)
    }

    fetchLogos()
  }, [vendorsCreatedByCorporate, fetchPresignedURL])

  // Fetch corporate logo presigned URL
  React.useEffect(() => {
    const logoDocument = userProfileData?.business_documents?.find(
      (doc: any) => doc.type === 'logo',
    )

    if (!logoDocument?.file_url) {
      setLogoUrl(null)
      return
    }

    let cancelled = false

    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoDocument.file_url)
        if (!cancelled) {
          setLogoUrl(url)
        }
      } catch (error) {
        console.error('Failed to fetch logo presigned URL', error)
        if (!cancelled) {
          setLogoUrl(null)
        }
      }
    }

    loadLogo()

    return () => {
      cancelled = true
    }
  }, [userProfileData?.business_documents, fetchPresignedURL])

  // Get corporate business details
  const corporateBusiness = userProfileData?.business_details?.[0]
  const corporateName = corporateBusiness?.name || 'Corporate Account'
  const corporateId = userProfileData?.corporate_id_from_business || ''

  // Get current vendor from URL params
  const currentVendorId = searchParams.get('vendor_id')
  const currentVendor = React.useMemo(() => {
    if (!currentVendorId || vendorsCreatedByCorporate.length === 0) return null
    return vendorsCreatedByCorporate.find(
      (vendor: any) =>
        String(vendor.vendor_id) === currentVendorId || String(vendor.id) === currentVendorId,
    )
  }, [currentVendorId, vendorsCreatedByCorporate])

  // Filter out current vendor from the list of vendors to switch to
  const vendorsToSwitchTo = React.useMemo(() => {
    if (!currentVendorId) return vendorsCreatedByCorporate
    return vendorsCreatedByCorporate.filter(
      (vendor: any) =>
        String(vendor.vendor_id) !== currentVendorId && String(vendor.id) !== currentVendorId,
    )
  }, [vendorsCreatedByCorporate, currentVendorId])

  // Get current vendor information
  const vendorName = React.useMemo(() => {
    return (
      currentVendor?.vendor_name ||
      currentVendor?.business_name ||
      userProfileData?.business_details?.[0]?.name ||
      'Vendor Account'
    )
  }, [currentVendor, userProfileData?.business_details])
  const vendorGvid = currentVendor?.gvid || ''
  const [currentVendorLogoUrl, setCurrentVendorLogoUrl] = React.useState<string | null>(null)

  // Fetch current vendor logo presigned URL
  React.useEffect(() => {
    // First try to get logo from currentVendor (when switching between vendor accounts)
    // Otherwise, get it from userProfileData business_documents (for current vendor account)
    const logoSource = currentVendor?.vendor_logo
      ? currentVendor.vendor_logo
      : userProfileData?.business_documents?.find((doc: any) => doc.type === 'logo')?.file_url

    if (!logoSource) {
      setCurrentVendorLogoUrl(null)
      return
    }

    let cancelled = false

    const loadVendorLogo = async () => {
      try {
        const url = await fetchPresignedURL(logoSource)
        if (!cancelled) {
          setCurrentVendorLogoUrl(url)
        }
      } catch (error) {
        console.error('Failed to fetch vendor logo presigned URL', error)
        if (!cancelled) {
          setCurrentVendorLogoUrl(null)
        }
      }
    }

    loadVendorLogo()

    return () => {
      cancelled = true
    }
  }, [currentVendor?.vendor_logo, userProfileData?.business_documents, fetchPresignedURL])

  // Branches state
  const [isBranchesExpanded, setIsBranchesExpanded] = React.useState(false)

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    if (location.pathname === path) {
      return true
    }
    // For vendor home, only match exact path or if we're at the root dashboard
    if (path === ROUTES.IN_APP.DASHBOARD.VENDOR.HOME) {
      return location.pathname === path || location.pathname === '/dashboard/vendor'
    }
    // For branches, check if we're on a branch details page
    if (path === ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES) {
      return location.pathname.startsWith(path + '/') || location.pathname === path
    }
    // For other paths, check if pathname starts with the path
    if (location.pathname.startsWith(path + '/')) {
      if (path === ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT) {
        return !location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH)
      }
      return true
    }
    return false
  }

  // Check if a specific branch is active
  const isBranchActive = (branchId: string) => {
    return location.pathname === `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/${branchId}`
  }

  // Auto-expand branches if we're on a branch details page
  React.useEffect(() => {
    if (location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES + '/')) {
      setIsBranchesExpanded(true)
    }
  }, [location.pathname])

  const addAccountParam = (path: string): string => {
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=vendor`
  }

  const accountMenuContent = (
    <>
      <PaymentChangeNotifications />
      <ExperienceApprovalNotifications />
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <svg
                  fill="none"
                  focusable="false"
                  height="16"
                  role="img"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                  width="16"
                  className={cn(
                    'text-[#677084] transition-transform',
                    isPopoverOpen && 'rotate-90',
                  )}
                >
                  <path
                    d="M8.46973 6.53039L13.9394 12.0001L8.46973 17.4697L9.53039 18.5304L16.0607 12.0001L9.53039 5.46973L8.46973 6.53039Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Account menu</TooltipContent>
        </Tooltip>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="min-w-[280px] max-w-[320px] p-0 bg-white border-none"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar size="sm" src={currentVendorLogoUrl} name={vendorName} />
              <div className="flex-1 min-w-0">
                <Text variant="span" weight="semibold" className="block text-sm truncate">
                  {vendorName}
                </Text>
                {vendorGvid && (
                  <Text variant="span" className="block text-xs text-gray-500 truncate">
                    {vendorGvid}
                  </Text>
                )}
              </div>
            </div>
          </div>

          {/* Switch Workspace */}
          <div className="px-4 py-2">
            <Text
              variant="span"
              className="text-xs text-gray-500 uppercase tracking-wider block mb-2"
            >
              Switch Workspace
            </Text>

            {/* List of vendor accounts */}
            {vendorsToSwitchTo && vendorsToSwitchTo.length > 0 && (
              <div className="mb-3 space-y-1 max-h-[200px] overflow-y-auto">
                {vendorsToSwitchTo.map((vendor: any) => (
                  <button
                    key={vendor.vendor_id || vendor.id}
                    onClick={() => {
                      setIsPopoverOpen(false)
                      const vendorId = vendor.vendor_id || vendor.id
                      navigate(
                        `${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor${vendorId ? `&vendor_id=${vendorId}` : ''}`,
                      )
                    }}
                    className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <Avatar
                      size="sm"
                      src={vendorLogoUrls[vendor.vendor_id]}
                      name={vendor.vendor_name || vendor.business_name}
                    />
                    <div className="flex-1 min-w-0">
                      <Text variant="span" weight="semibold" className="block text-sm truncate">
                        {vendor.vendor_name || vendor.business_name}
                      </Text>
                      <Text variant="span" className="block text-xs text-gray-500 truncate">
                        {vendor.gvid || `ID: ${vendor.vendor_id || vendor.id}`}
                      </Text>
                    </div>
                    <Icon icon="bi:chevron-right" className="text-gray-400 text-sm shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {canAccessCorporate && (
              <button
                onClick={() => {
                  setIsPopoverOpen(false)
                  navigate(`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`)
                }}
                className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors mb-3"
              >
                <Avatar size="sm" src={logoUrl} name={corporateName} />
                <div className="flex-1 min-w-0">
                  <Text variant="span" weight="semibold" className="block text-sm truncate">
                    {corporateName}
                  </Text>
                  <Text variant="span" className="block text-xs text-gray-500 mt-0.5 truncate">
                    {corporateId ? `ID: ${corporateId}` : 'Corporate Account'}
                  </Text>
                </div>
                <Icon icon="bi:chevron-right" className="text-gray-400 text-sm shrink-0" />
              </button>
            )}

            <CreateVendorAccount />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 py-2">
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
            >
              <Icon icon="bi:question-circle" className="text-lg text-[#677084]" />
              <span>Help</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )

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
            <Link to={ROUTES.IN_APP.DASHBOARD.VENDOR.HOME} className="shrink-0">
              <Avatar size="sm" src={currentVendorLogoUrl} name={vendorName} />
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
            <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-3">
              {/* Top Section - Workspace Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <Text
                      variant="span"
                      weight="bold"
                      className="block text-sm text-gray-900 truncate"
                    >
                      {vendorName} {vendorGvid && `- ${vendorGvid}`}
                    </Text>

                    <Text variant="span" className="block text-xs text-gray-500 truncate">
                      {displayName}
                    </Text>
                  </div>
                </div>
                {accountMenuContent && !isVendor && (
                  <div className="flex items-center gap-2">{accountMenuContent}</div>
                )}
              </div>

              {/* Divider - Only show if discovery score is not complete */}
              {discoveryScore !== 100 && <div className="border-t border-gray-200 my-1" />}

              {/* Bottom Section - Discovery Score - Only show if not 100% */}
              {discoveryScore !== 100 && (
                <div className="flex items-center gap-3">
                  {/* Circular Score Indicator */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg
                      className="absolute inset-0 -rotate-90"
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                    >
                      {/* Background circle */}
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      {/* Progress ring */}
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#402D87"
                        strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 20 * (discoveryScore / 100)} ${2 * Math.PI * 20}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700 relative z-10 leading-none">
                      {discoveryScore}%
                    </span>
                  </div>
                  <Text variant="span" className="text-sm text-gray-600">
                    Discovery score
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}
        {isCollapsed && accountMenuContent && !isVendor && (
          <div className="flex items-center justify-center w-full p-4">{accountMenuContent}</div>
        )}
        <ul className="py-2 px-3">
          {VENDOR_NAV_ITEMS.map((section) => {
            // Filter items based on user type - only show Requests for corporate super admin
            const filteredItems = section.items.filter((item) => {
              if (item.path === ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS) {
                return isCorporateSuperAdmin
              }
              return true
            })

            // Skip section if no items after filtering
            if (filteredItems.length === 0) {
              return null
            }

            return (
              <React.Fragment key={section.section}>
                {!isCollapsed && (
                  <li className="py-5 px-5 mt-5 first:mt-3">
                    <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-[#6c757d]/90 relative flex items-center after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-5 after:h-0.5 after:bg-linear-to-r after:from-[#402D87] after:to-[rgba(64,45,135,0.4)] after:rounded-sm after:shadow-[0_1px_2px_rgba(64,45,135,0.2)] before:content-[''] before:absolute before:-top-2 before:-left-5 before:-right-5 before:h-px before:bg-linear-to-r before:from-transparent before:via-black/6 before:to-transparent">
                      {section.section}
                    </span>
                  </li>
                )}
                {filteredItems.map((item) => {
                  // Special handling for Branches - make it expandable
                  if (item.path === ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES && !isCollapsed) {
                    return (
                      <React.Fragment key={item.path}>
                        <li
                          className={cn(
                            'flex flex-col mb-2 rounded-[10px] transition-all duration-200 relative overflow-hidden',
                            (isActive(item.path) || isBranchesExpanded) &&
                              'bg-[rgba(64,45,135,0.08)] border-l-[3px] border-[#402D87] rounded-l-none rounded-r-[10px] shadow-[0_2px_8px_rgba(64,45,135,0.1)]',
                            !isActive(item.path) &&
                              !isBranchesExpanded &&
                              'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-px',
                          )}
                        >
                          {(isActive(item.path) || isBranchesExpanded) && (
                            <>
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-white/30 via-[#402D87] to-[#2d1a72] rounded-r-sm shadow-[2px_0_8px_rgba(64,45,135,0.4),2px_0_16px_rgba(64,45,135,0.2)]" />
                              <div className="absolute inset-0 rounded-r-2xl bg-linear-to-br from-white/8 via-transparent to-[rgba(45,26,114,0.03)] pointer-events-none" />
                            </>
                          )}
                          <button
                            onClick={() => setIsBranchesExpanded(!isBranchesExpanded)}
                            className={cn(
                              'flex items-center gap-3.5 w-full text-left no-underline text-[#495057] font-medium text-sm py-3 px-4 transition-all duration-200 rounded-[10px] relative z-2',
                              (isActive(item.path) || isBranchesExpanded) &&
                                'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                              !isActive(item.path) && !isBranchesExpanded && 'hover:text-[#402D87]',
                            )}
                          >
                            <Icon
                              icon={item.icon}
                              className={cn(
                                'w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d]',
                                (isActive(item.path) || isBranchesExpanded) && 'text-[#402D87]',
                                !isActive(item.path) &&
                                  !isBranchesExpanded &&
                                  'hover:scale-110 hover:rotate-2 hover:text-[#402D87] hover:filter-[drop-shadow(0_2px_4px_rgba(64,45,135,0.3))]',
                              )}
                            />
                            <span className="flex-1">{item.label}</span>
                            <Icon
                              icon={isBranchesExpanded ? 'bi:chevron-up' : 'bi:chevron-down'}
                              className={cn(
                                'w-4 h-4 transition-transform text-[#6c757d]',
                                (isActive(item.path) || isBranchesExpanded) && 'text-[#402D87]',
                              )}
                            />
                          </button>
                          {isBranchesExpanded && (
                            <div className="pl-4 pb-2">
                              {branchesArray.length === 0 ? (
                                <div className="px-4 py-2 text-xs text-gray-500">
                                  No branches available
                                </div>
                              ) : (
                                branchesArray.map((branch: any) => {
                                  const branchId = branch.id || branch.branch_id
                                  const vendorId = currentVendorId || userProfileData?.vendor_id
                                  const branchPath = `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/${branchId}`
                                  // Build query params
                                  const queryParams = new URLSearchParams()
                                  if (vendorId) queryParams.set('vendor_id', String(vendorId))
                                  if (branchId) queryParams.set('branch_id', String(branchId))
                                  const queryString = queryParams.toString()
                                  const branchUrl = addAccountParam(
                                    queryString ? `${branchPath}?${queryString}` : branchPath,
                                  )
                                  return (
                                    <Link
                                      key={branchId}
                                      to={branchUrl}
                                      className={cn(
                                        'flex items-center gap-2 py-2 px-4 rounded-md text-sm transition-colors relative z-2',
                                        isBranchActive(branchId)
                                          ? 'text-[#402D87] font-semibold bg-[rgba(64,45,135,0.12)]'
                                          : 'text-gray-600 hover:text-[#402D87] hover:bg-[rgba(64,45,135,0.06)]',
                                      )}
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                      <span className="truncate">{branch.branch_name}</span>
                                    </Link>
                                  )
                                })
                              )}
                            </div>
                          )}
                        </li>
                      </React.Fragment>
                    )
                  }

                  // Special handling for Log Out
                  if (item.path === 'logout') {
                    return (
                      <li
                        key={item.path}
                        className={cn(
                          'flex items-center mb-2 rounded-[10px] transition-all duration-200 relative overflow-hidden',
                          'hover:bg-red-50 hover:translate-x-px',
                          isCollapsed && 'justify-center mb-3',
                        )}
                      >
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  logout()
                                  navigate(ROUTES.IN_APP.AUTH.LOGIN)
                                }}
                                className={cn(
                                  'flex items-center gap-3.5 text-red-600 font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 justify-center hover:text-red-700',
                                )}
                              >
                                <Icon
                                  icon={item.icon}
                                  className="w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0"
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <button
                            onClick={() => {
                              logout()
                              navigate(ROUTES.IN_APP.AUTH.LOGIN)
                            }}
                            className={cn(
                              'flex items-center gap-3.5 text-red-600 font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 hover:text-red-700',
                            )}
                          >
                            <Icon
                              icon={item.icon}
                              className="w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0"
                            />
                            <span>{item.label}</span>
                          </button>
                        )}
                      </li>
                    )
                  }

                  // Regular items
                  return (
                    <li
                      key={item.path}
                      className={cn(
                        'flex items-center mb-2 rounded-[10px] transition-all duration-200 relative overflow-hidden',
                        isActive(item.path) &&
                          'bg-[rgba(64,45,135,0.08)] border-l-[3px] border-[#402D87] rounded-l-none rounded-r-[10px] shadow-[0_2px_8px_rgba(64,45,135,0.1)]',
                        !isActive(item.path) &&
                          'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-px',
                        isCollapsed && 'justify-center mb-3',
                      )}
                    >
                      {isActive(item.path) && (
                        <>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-white/30 via-[#402D87] to-[#2d1a72] rounded-r-sm shadow-[2px_0_8px_rgba(64,45,135,0.4),2px_0_16px_rgba(64,45,135,0.2)]" />
                          <div className="absolute inset-0 rounded-r-2xl bg-linear-to-br from-white/8 via-transparent to-[rgba(45,26,114,0.03)] pointer-events-none" />
                        </>
                      )}
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to={addAccountParam(item.path)}
                              className={cn(
                                'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 justify-center',
                                isActive(item.path) &&
                                  'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                                !isActive(item.path) && 'hover:text-[#402D87]',
                              )}
                            >
                              <Icon
                                icon={item.icon}
                                className={cn(
                                  'w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d]',
                                  isActive(item.path) && 'text-[#402D87]',
                                  !isActive(item.path) &&
                                    'hover:scale-110 hover:rotate-2 hover:text-[#402D87] hover:filter-[drop-shadow(0_2px_4px_rgba(64,45,135,0.3))]',
                                )}
                              />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link
                          to={addAccountParam(item.path)}
                          className={cn(
                            'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2',
                            isActive(item.path) &&
                              'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                            !isActive(item.path) && 'hover:text-[#402D87]',
                          )}
                        >
                          <Icon
                            icon={item.icon}
                            className={cn(
                              'w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d]',
                              isActive(item.path) && 'text-[#402D87]',
                              !isActive(item.path) &&
                                'hover:scale-110 hover:rotate-2 hover:text-[#402D87] hover:filter-[drop-shadow(0_2px_4px_rgba(64,45,135,0.3))]',
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      )}
                      {isCollapsed && isActive(item.path) && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-[#402D87] to-[#2d1a72] rounded-l-sm" />
                      )}
                    </li>
                  )
                })}
              </React.Fragment>
            )
          })}
        </ul>
      </nav>

      {/* Footer - Settings and Log Out */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        {/* Settings */}
        <Link
          to={addAccountParam(ROUTES.IN_APP.DASHBOARD.VENDOR.SETTINGS)}
          className={cn(
            'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2',
            isActive(ROUTES.IN_APP.DASHBOARD.VENDOR.SETTINGS) &&
              'text-[#402D87] font-bold bg-[rgba(64,45,135,0.08)] border-l-[3px] border-[#402D87] rounded-l-none rounded-r-[10px] shadow-[0_2px_8px_rgba(64,45,135,0.1)]',
            !isActive(ROUTES.IN_APP.DASHBOARD.VENDOR.SETTINGS) &&
              'hover:text-[#402D87] hover:bg-[rgba(64,45,135,0.04)]',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <Icon
            icon="bi:gear"
            className={cn(
              'w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d]',
              isActive(ROUTES.IN_APP.DASHBOARD.VENDOR.SETTINGS) && 'text-[#402D87]',
              !isActive(ROUTES.IN_APP.DASHBOARD.VENDOR.SETTINGS) &&
                'hover:scale-110 hover:rotate-2 hover:text-[#402D87] hover:filter-[drop-shadow(0_2px_4px_rgba(64,45,135,0.3))]',
            )}
          />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        {/* Log Out */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  logout()
                  navigate(ROUTES.IN_APP.AUTH.LOGIN)
                }}
                className="flex items-center justify-center p-3 w-full text-red-600 hover:bg-red-50 rounded-[10px] transition-colors"
              >
                <Icon icon="bi:box-arrow-right" className="text-lg" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Log Out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => {
              logout()
              navigate(ROUTES.IN_APP.AUTH.LOGIN)
            }}
            className="flex items-center gap-3.5 text-red-600 font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] hover:bg-red-50 hover:text-red-700"
          >
            <Icon icon="bi:box-arrow-right" className="w-5 h-5 text-base" />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  )
}
