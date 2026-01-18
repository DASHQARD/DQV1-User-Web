import React from 'react'
import { Icon } from '@/libs'
import { Text, Loader } from '@/components'
import { branchQueries } from '@/features/dashboard/branch'
import { usePresignedURL } from '@/hooks'
import { cn } from '@/libs'

export default function BranchPaymentDetails() {
  const { useGetBranchInfoService } = branchQueries()
  const { data: branchInfoData, isLoading } = useGetBranchInfoService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)

  // Fetch branch logo
  React.useEffect(() => {
    const logo = branchInfoData?.data?.business_details?.logo
    if (!logo) {
      setLogoUrl(null)
      return
    }

    let cancelled = false
    const loadLogo = async () => {
      try {
        const url = await fetchPresignedURL(logo)
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
  }, [branchInfoData?.data?.business_details?.logo, fetchPresignedURL])

  const branchInfo = branchInfoData?.data
  const branch = branchInfo?.branch
  const branchManager = branchInfo?.branch_manager
  const paymentDetails = branchInfo?.payment_details
  const businessDetails = branchInfo?.business_details

  if (isLoading) {
    return (
      <div className="bg-[#f8f9fa] rounded-[32px] p-4 sm:p-8 min-h-[600px] flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="bg-[#f8f9fa] rounded-[32px] p-4 sm:p-8 min-h-[600px]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(64,45,135,0.08)] border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-br from-[#f5f1ff] via-white to-[#fdf9ff] px-6 sm:px-10 py-8 border-b border-gray-100">
            <div className="flex flex-wrap gap-5 items-start">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#402D87] to-[#8d3cff] flex items-center justify-center text-white shadow-lg shadow-[#402D87]/25">
                <Icon icon="bi:credit-card-fill" className="text-2xl" />
              </div>
              <div className="flex-1 min-w-[220px]">
                <h2 className="text-3xl font-bold text-[#1f2937] mb-2">Payment Details</h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  View your branch payment information and business details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Information */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(64,45,135,0.08)] border border-gray-100 overflow-hidden">
          <div className="px-6 sm:px-10 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#402D87]/10 flex items-center justify-center">
                <Icon icon="bi:building" className="text-[#402D87] text-xl" />
              </div>
              <Text variant="h5" weight="semibold" className="text-gray-900">
                Branch Information
              </Text>
            </div>
          </div>
          <div className="px-6 sm:px-10 py-6 space-y-4">
            {logoUrl && (
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                  <img src={logoUrl} alt="Branch Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <Text variant="span" className="text-sm text-gray-500">
                    Branch Logo
                  </Text>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text variant="span" className="text-sm text-gray-500 block mb-1">
                  Branch Name
                </Text>
                <Text variant="span" weight="medium" className="text-gray-900">
                  {branch?.branch_name || 'N/A'}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-sm text-gray-500 block mb-1">
                  Branch Location
                </Text>
                <Text variant="span" weight="medium" className="text-gray-900">
                  {branch?.branch_location || 'N/A'}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-sm text-gray-500 block mb-1">
                  Branch Code
                </Text>
                <Text variant="span" weight="medium" className="text-gray-900">
                  {branch?.branch_code || 'N/A'}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-sm text-gray-500 block mb-1">
                  Branch Type
                </Text>
                <Text variant="span" weight="medium" className="text-gray-900 capitalize">
                  {branch?.branch_type || 'N/A'}
                </Text>
              </div>
              <div>
                <Text variant="span" className="text-sm text-gray-500 block mb-1">
                  Status
                </Text>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    branch?.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : branch?.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800',
                  )}
                >
                  {branch?.status || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Manager Information */}
        {branchManager && (
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(64,45,135,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-6 sm:px-10 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#402D87]/10 flex items-center justify-center">
                  <Icon icon="bi:person-fill" className="text-[#402D87] text-xl" />
                </div>
                <Text variant="h5" weight="semibold" className="text-gray-900">
                  Branch Manager
                </Text>
              </div>
            </div>
            <div className="px-6 sm:px-10 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text variant="span" className="text-sm text-gray-500 block mb-1">
                    Full Name
                  </Text>
                  <Text variant="span" weight="medium" className="text-gray-900">
                    {branchManager.fullname || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text variant="span" className="text-sm text-gray-500 block mb-1">
                    Email
                  </Text>
                  <Text variant="span" weight="medium" className="text-gray-900">
                    {branchManager.email || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text variant="span" className="text-sm text-gray-500 block mb-1">
                    Phone Number
                  </Text>
                  <Text variant="span" weight="medium" className="text-gray-900">
                    {branchManager.phonenumber || 'N/A'}
                  </Text>
                </div>
                {branchManager.default_payment_option && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Default Payment Option
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900 capitalize">
                      {branchManager.default_payment_option}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(64,45,135,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-6 sm:px-10 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#402D87]/10 flex items-center justify-center">
                  <Icon icon="bi:wallet2" className="text-[#402D87] text-xl" />
                </div>
                <Text variant="h5" weight="semibold" className="text-gray-900">
                  Payment Information
                </Text>
              </div>
            </div>
            <div className="px-6 sm:px-10 py-6 space-y-6">
              {/* Mobile Money */}
              {paymentDetails.momo_number && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center">
                      <Icon icon="bi:phone" className="text-[#402D87] text-lg" />
                    </div>
                    <Text variant="h6" weight="semibold" className="text-gray-900">
                      Mobile Money
                    </Text>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Text variant="span" className="text-sm text-gray-500 block mb-1">
                        Mobile Money Number
                      </Text>
                      <Text variant="span" weight="medium" className="text-gray-900">
                        {paymentDetails.momo_number || 'N/A'}
                      </Text>
                    </div>
                    {paymentDetails.provider && (
                      <div>
                        <Text variant="span" className="text-sm text-gray-500 block mb-1">
                          Provider
                        </Text>
                        <Text variant="span" weight="medium" className="text-gray-900 capitalize">
                          {paymentDetails.provider}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bank Account */}
              {paymentDetails.account_number && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center">
                      <Icon icon="bi:bank" className="text-[#402D87] text-lg" />
                    </div>
                    <Text variant="h6" weight="semibold" className="text-gray-900">
                      Bank Account
                    </Text>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentDetails.bank_name && (
                      <div>
                        <Text variant="span" className="text-sm text-gray-500 block mb-1">
                          Bank Name
                        </Text>
                        <Text variant="span" weight="medium" className="text-gray-900">
                          {paymentDetails.bank_name}
                        </Text>
                      </div>
                    )}
                    <div>
                      <Text variant="span" className="text-sm text-gray-500 block mb-1">
                        Account Number
                      </Text>
                      <Text variant="span" weight="medium" className="text-gray-900">
                        {paymentDetails.account_number}
                      </Text>
                    </div>
                    {paymentDetails.account_holder_name && (
                      <div>
                        <Text variant="span" className="text-sm text-gray-500 block mb-1">
                          Account Holder Name
                        </Text>
                        <Text variant="span" weight="medium" className="text-gray-900">
                          {paymentDetails.account_holder_name}
                        </Text>
                      </div>
                    )}
                    {paymentDetails.bank_branch && (
                      <div>
                        <Text variant="span" className="text-sm text-gray-500 block mb-1">
                          Bank Branch
                        </Text>
                        <Text variant="span" weight="medium" className="text-gray-900">
                          {paymentDetails.bank_branch}
                        </Text>
                      </div>
                    )}
                    {paymentDetails.swift_code && (
                      <div>
                        <Text variant="span" className="text-sm text-gray-500 block mb-1">
                          SWIFT Code
                        </Text>
                        <Text variant="span" weight="medium" className="text-gray-900">
                          {paymentDetails.swift_code}
                        </Text>
                      </div>
                    )}
                    {paymentDetails.sort_code && (
                      <div>
                        <Text variant="span" className="text-sm text-gray-500 block mb-1">
                          Sort Code
                        </Text>
                        <Text variant="span" weight="medium" className="text-gray-900">
                          {paymentDetails.sort_code}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!paymentDetails.momo_number && !paymentDetails.account_number && (
                <div className="text-center py-8">
                  <Icon icon="bi:info-circle" className="text-4xl text-gray-400 mb-3" />
                  <Text variant="span" className="text-gray-500">
                    No payment details available
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Business Details */}
        {businessDetails && (
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(64,45,135,0.08)] border border-gray-100 overflow-hidden">
            <div className="px-6 sm:px-10 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#402D87]/10 flex items-center justify-center">
                  <Icon icon="bi:briefcase" className="text-[#402D87] text-xl" />
                </div>
                <Text variant="h5" weight="semibold" className="text-gray-900">
                  Business Details
                </Text>
              </div>
            </div>
            <div className="px-6 sm:px-10 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessDetails.name && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Business Name
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900">
                      {businessDetails.name}
                    </Text>
                  </div>
                )}
                {businessDetails.type && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Business Type
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900 capitalize">
                      {businessDetails.type}
                    </Text>
                  </div>
                )}
                {businessDetails.phone && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Phone
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900">
                      {businessDetails.phone}
                    </Text>
                  </div>
                )}
                {businessDetails.email && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Email
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900">
                      {businessDetails.email}
                    </Text>
                  </div>
                )}
                {businessDetails.street_address && (
                  <div className="md:col-span-2">
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Street Address
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900">
                      {businessDetails.street_address}
                    </Text>
                  </div>
                )}
                {businessDetails.digital_address && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Digital Address
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900">
                      {businessDetails.digital_address}
                    </Text>
                  </div>
                )}
                {businessDetails.registration_number && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Registration Number
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900">
                      {businessDetails.registration_number}
                    </Text>
                  </div>
                )}
                {businessDetails.country && (
                  <div>
                    <Text variant="span" className="text-sm text-gray-500 block mb-1">
                      Country
                    </Text>
                    <Text variant="span" weight="medium" className="text-gray-900">
                      {businessDetails.country}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
