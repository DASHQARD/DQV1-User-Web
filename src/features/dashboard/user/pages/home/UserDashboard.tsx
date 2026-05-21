import { useMemo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Text, Loader, Button, Input, Combobox, DateInput } from '@/components'
import { Icon } from '@/libs'
import { ID_TYPE_OPTIONS } from '@/utils/constants'
import { PersonalInformationSchema } from '@/utils/schemas/settings'
import { useGiftCardMetrics } from '@/features/dashboard/hooks/useCards'
import { usePaymentInfoService } from '@/features/dashboard/hooks'
import { useUserProfile } from '@/hooks'
import { useAuth } from '@/features/auth/hooks/auth'
import { UserGiftCardMetricsGrid } from '@/features/dashboard/user/components/UserGiftCardMetricsGrid'
import { UserRecentTransactions } from '@/features/dashboard/user/components/UserRecentTransactions'
import { UserQuickActions } from '@/features/dashboard/user/components/UserQuickActions'
import { BackgroundCardImage } from '@/assets/images'
import type { OnboardingData } from '@/types/auth/auth'

type PersonalInformationFormData = z.infer<typeof PersonalInformationSchema>

export default function UserDashboard() {
  const { data: metricsResponse, isLoading } = useGiftCardMetrics()
  const { useGetUserProfileService } = useUserProfile()
  const { data: user } = useGetUserProfileService()
  const { usePersonalDetailsService } = useAuth()
  const { mutate: updatePersonalDetails, isPending: isSubmittingOnboarding } =
    usePersonalDetailsService()

  // Check if user has completed onboarding
  const hasCompletedOnboarding = useMemo(() => {
    return !!(
      user?.fullname &&
      user?.street_address &&
      user?.dob &&
      user?.id_type &&
      user?.id_number
    )
  }, [user])

  // Form for onboarding
  const onboardingForm = useForm<PersonalInformationFormData>({
    resolver: zodResolver(PersonalInformationSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: user?.fullname || '',
      street_address: user?.street_address || '',
      dob: user?.dob || '',
      id_type: user?.id_type || '',
      id_number: user?.id_number || '',
    },
  })

  // Update form when userProfileData changes
  useEffect(() => {
    if (user) {
      onboardingForm.reset({
        full_name: user?.fullname || '',
        street_address: user?.street_address || '',
        dob: user?.dob || '',
        id_type: user?.id_type || '',
        id_number: user?.id_number || '',
      })
    }
  }, [user, onboardingForm])

  const dobMaxDate = useMemo(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }, [])

  const handleOnboardingSubmit = (data: PersonalInformationFormData) => {
    const payload: OnboardingData = {
      full_name: data.full_name,
      street_address: data.street_address,
      dob: data.dob,
      id_type: data.id_type,
      id_number: data.id_number,
    }

    updatePersonalDetails(payload, {
      onSuccess: () => {
        onboardingForm.reset(data)
        // Refetch user profile to update the onboarding status
        window.location.reload()
      },
    })
  }

  // Fetch payments/transactions using the same endpoint as Orders page
  const { useGetPaymentByIdService } = usePaymentInfoService()
  const { data: paymentResponse, isLoading: isLoadingPayments } = useGetPaymentByIdService()

  // Get metrics data or default to 0
  const metrics = useMemo(() => {
    return (
      metricsResponse?.data || {
        DashX: 0,
        DashGo: 0,
        DashPass: 0,
        DashPro: 0,
        DashGo_balance: 0,
      }
    )
  }, [metricsResponse])

  if (isLoading || isLoadingPayments) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h2" weight="bold" className="text-gray-900">
            Dashboard
          </Text>
          <Text variant="p" className="text-gray-600 mt-1">
            Welcome back, {user?.fullname || 'User'}! Here's your overview.
          </Text>
        </div>
      </div>

      {/* Onboarding Section - Show if user hasn't completed onboarding */}
      {!hasCompletedOnboarding && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-linear-to-br from-primary-500 to-primary-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Icon icon="bi:person-check" className="text-white text-xl" />
              </div>
              <div>
                <Text variant="h4" weight="bold" className="text-white mb-0.5">
                  Let's get to know you! 👋
                </Text>
                <Text variant="span" className="text-white/90 text-sm">
                  Complete your profile to unlock all features
                </Text>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form
              onSubmit={onboardingForm.handleSubmit(handleOnboardingSubmit)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Icon icon="bi:person-fill" className="size-4 mr-2 text-primary-600" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    {...onboardingForm.register('full_name')}
                    error={onboardingForm.formState.errors.full_name?.message}
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Icon icon="bi:geo-alt-fill" className="size-4 mr-2 text-primary-600" />
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your street address"
                    {...onboardingForm.register('street_address')}
                    error={onboardingForm.formState.errors.street_address?.message}
                  />
                </div>

                <Controller
                  name="dob"
                  control={onboardingForm.control}
                  render={({ field }) => {
                    const dobError = onboardingForm.formState.errors.dob?.message
                    const normalizedValue = (() => {
                      if (!field.value || !field.value.trim()) return undefined
                      const d = new Date(field.value.trim() + 'T12:00:00')
                      if (Number.isNaN(d.getTime())) return undefined
                      return d
                    })()
                    return (
                      <div>
                        <DateInput
                          label="Date of Birth *"
                          id="dob"
                          placeholder="Select or type date (dd/mm/yyyy)"
                          dateFormat="dd/MM/yyyy"
                          value={normalizedValue}
                          maxDate={new Date(dobMaxDate + 'T12:00:00')}
                          strictParsing
                          onChange={(date: Date | null) => {
                            if (!date) {
                              field.onChange('')
                              requestAnimationFrame(() => onboardingForm.trigger('dob'))
                              return
                            }
                            const y = date.getFullYear()
                            const fixedDate =
                              y >= 0 && y <= 99
                                ? new Date(
                                    y <= 50 ? 2000 + y : 1900 + y,
                                    date.getMonth(),
                                    date.getDate(),
                                  )
                                : date
                            const next = fixedDate.toISOString().split('T')[0]
                            field.onChange(next)
                            requestAnimationFrame(() => onboardingForm.trigger('dob'))
                          }}
                          error={dobError}
                        />
                      </div>
                    )
                  }}
                />

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Icon icon="bi:card-text" className="size-4 mr-2 text-primary-600" />
                    ID Type <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="id_type"
                    control={onboardingForm.control}
                    render={({ field, fieldState: { error } }) => (
                      <Combobox
                        placeholder="Select ID type"
                        options={[...ID_TYPE_OPTIONS]}
                        value={field.value}
                        onChange={(e: { target: { value: string } }) => {
                          field.onChange(e.target.value)
                        }}
                        error={error?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <Icon icon="bi:hash" className="size-4 mr-2 text-primary-600" />
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your ID number"
                    {...onboardingForm.register('id_number')}
                    error={onboardingForm.formState.errors.id_number?.message}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <Text variant="span" className="text-xs text-gray-500">
                  This information is used for account verification and compliance purposes.
                </Text>
                <Button
                  type="submit"
                  disabled={isSubmittingOnboarding}
                  loading={isSubmittingOnboarding}
                  variant="secondary"
                  className="min-w-[160px]"
                >
                  <Icon icon="bi:check-circle" className="size-4 mr-2" />
                  Complete Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative rounded-xl shadow-lg p-6 text-white overflow-hidden bg-linear-to-br from-[#402D87] to-[#5B47D4]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{
            backgroundImage: `url(${BackgroundCardImage})`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <Text variant="h6" weight="semibold" className="text-white/90 mb-4">
            My Created Gift Cards
          </Text>
          <Text variant="h1" weight="bold" className="text-white text-4xl mb-2">
            {metrics.DashX + metrics.DashPass + metrics.DashGo}
          </Text>
          <Text variant="span" className="text-white/70 text-sm">
            Active gift cards
          </Text>
        </div>
      </div>

      <UserGiftCardMetricsGrid metrics={metrics} />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <UserRecentTransactions paymentResponse={paymentResponse} isLoading={isLoadingPayments} />
        <UserQuickActions />
      </div>
    </div>
  )
}
