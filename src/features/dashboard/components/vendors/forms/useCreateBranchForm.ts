import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCountriesData, useUserProfile } from '@/hooks'
import { CreateBranchFormSchema } from '@/utils/schemas'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { useAuth } from '@/features/auth/hooks'
import { ROUTES } from '@/utils/constants'
import { useAuthStore } from '@/stores'
import type { DropdownOption } from '@/types'

export type CreateBranchFormData = z.infer<typeof CreateBranchFormSchema>

const MOBILE_MONEY_PROVIDERS: DropdownOption[] = [
  { label: 'MTN Mobile Money', value: 'mtn' },
  { label: 'Vodafone Cash', value: 'vodafone' },
  { label: 'AirtelTigo Money', value: 'airteltigo' },
]

const DEFAULT_VALUES: Partial<CreateBranchFormData> = {
  country: 'Ghana',
  country_code: '01',
  branch_name: '',
  branch_location: '',
  branch_manager_name: '',
  branch_manager_email: '',
  branch_manager_phone: '',
  payment_method: 'mobile_money',
  mobile_money_provider: '',
  mobile_money_number: '',
  bank_name: '',
  branch: '',
  account_name: '',
  account_number: '',
  sort_code: '',
  swift_code: '',
}

export function useCreateBranchForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { user } = useAuthStore()
  const { useGetCountriesService } = useAuth()
  const { data: countries } = useGetCountriesService()
  const { countries: phoneCountries } = useCountriesData()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const vendorIdFromProfile =
    userProfileData?.vendor_id != null ? String(userProfileData.vendor_id) : null
  const vendorId = vendorIdFromUrl || vendorIdFromProfile

  const userType = (user as { user_type?: string })?.user_type || userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const corporatePayloadWithVendor = React.useCallback(
    (payload: Record<string, unknown>) =>
      isCorporateSuperAdmin && vendorId
        ? { ...payload, vendor_id: Number(vendorId) || vendorId }
        : payload,
    [isCorporateSuperAdmin, vendorId],
  )

  const { useAddBranchService } = useVendorMutations()
  const { useAddCorporateBranchService } = corporateMutations()
  const { mutateAsync: createVendorBranch } = useAddBranchService()
  const { mutateAsync: createCorporateBranch } = useAddCorporateBranchService()
  const createBranch = isCorporateSuperAdmin ? createCorporateBranch : createVendorBranch

  const isUserActive =
    userProfileData?.status === 'active' ||
    userProfileData?.status === 'verified' ||
    userProfileData?.status === 'approved'
  const isFormDisabled = !isUserActive || !vendorId
  const missingVendorId = !vendorId

  const form = useForm<CreateBranchFormData>({
    resolver: zodResolver(CreateBranchFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const paymentMethod = useWatch({ control: form.control, name: 'payment_method' })

  React.useEffect(() => {
    if (paymentMethod === 'bank') {
      form.setValue('mobile_money_provider', '', { shouldValidate: false })
      form.setValue('mobile_money_number', '', { shouldValidate: false })
    } else if (paymentMethod === 'mobile_money') {
      form.setValue('bank_name', '', { shouldValidate: false })
      form.setValue('branch', '', { shouldValidate: false })
      form.setValue('account_name', '', { shouldValidate: false })
      form.setValue('account_number', '', { shouldValidate: false })
      form.setValue('sort_code', '', { shouldValidate: false })
      form.setValue('swift_code', '', { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit form to avoid clearing on every re-render
  }, [paymentMethod])

  React.useEffect(() => {
    if (!countries) return
    const currentCountry = form.getValues('country')
    if (currentCountry) return
    const ghana = countries.find(
      (c: { id?: number; name?: string }) =>
        c.id === 1 || c.name === 'Ghana' || (c.name && c.name.toLowerCase() === 'ghana'),
    )
    if (ghana) {
      form.setValue('country', String(ghana.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit form to avoid loop
  }, [countries])

  const onSubmit = React.useCallback(
    async (data: CreateBranchFormData) => {
      if (!isUserActive || !vendorId) return
      try {
        if (data.payment_method === 'bank') {
          const bankData = {
            branch_name: data.branch_name,
            branch_location: data.branch_location,
            branch_manager_name: data.branch_manager_name,
            branch_manager_email: data.branch_manager_email,
            branch_manager_phone: data.branch_manager_phone,
            country: data.country,
            country_code: data.country_code,
            payment_method: data.payment_method,
            bank_name: data.bank_name,
            branch: data.branch,
            account_name: data.account_name,
            account_number: data.account_number,
            sort_code: data.sort_code,
            swift_code: data.swift_code,
          }
          await createBranch(corporatePayloadWithVendor(bankData) as CreateBranchFormData)
        } else if (data.payment_method === 'mobile_money') {
          const mobileMoneyData = {
            branch_name: data.branch_name,
            branch_location: data.branch_location,
            branch_manager_name: data.branch_manager_name,
            branch_manager_email: data.branch_manager_email,
            branch_manager_phone: data.branch_manager_phone,
            country: data.country,
            country_code: data.country_code,
            payment_method: data.payment_method,
            mobile_money_provider: data.mobile_money_provider,
            mobile_money_number: data.mobile_money_number,
          }
          await createBranch(corporatePayloadWithVendor(mobileMoneyData) as CreateBranchFormData)
        } else {
          await createBranch(
            corporatePayloadWithVendor(data as Record<string, unknown>) as CreateBranchFormData,
          )
        }
        navigate(
          `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCH_MANAGERS}?account=vendor${vendorId ? `&vendor_id=${vendorId}` : ''}`,
        )
      } catch (error) {
        console.error('Failed to create branch:', error)
      }
    },
    [isUserActive, vendorId, createBranch, corporatePayloadWithVendor, navigate],
  )

  return {
    form,
    paymentMethod,
    countries,
    phoneCountries,
    mobileMoneyProviders: MOBILE_MONEY_PROVIDERS,
    isUserActive,
    isFormDisabled,
    missingVendorId,
    vendorId,
    onSubmit,
  }
}
