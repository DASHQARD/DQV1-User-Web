import { useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, BasePhoneInput } from '@/components'
import { useUserProfile, useCountriesData } from '@/hooks'
import { InviteVendorCoAdminSchema } from '@/utils/schemas/invite'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'
import { useVendorMutations } from '@/features'

type InviteVendorCoAdminFormData = z.infer<typeof InviteVendorCoAdminSchema>

export function InviteAdmin() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { countries: phoneCountries } = useCountriesData()

  const userType = userProfileData?.user_type
  const isVendor = userType === 'vendor'

  const coAdminForm = useForm<InviteVendorCoAdminFormData>({
    resolver: zodResolver(InviteVendorCoAdminSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    },
  })

  const { useInviteVendorAdminService } = corporateMutations()
  const { useInviteCoAdminService } = useVendorMutations()

  const inviteVendorAdminMutation = useInviteVendorAdminService()
  const inviteCoAdminMutation = useInviteCoAdminService()

  const vendorId =
    vendorIdFromUrl ??
    (userProfileData?.vendor_id != null ? String(userProfileData.vendor_id) : null)

  const isPending = inviteVendorAdminMutation.isPending || inviteCoAdminMutation.isPending

  const onSubmit = (data: InviteVendorCoAdminFormData) => {
    if (isVendor) {
      inviteCoAdminMutation.mutate(
        {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number ?? '',
          role: 'admin',
        },
        {
          onSuccess: () => {
            coAdminForm.reset()
          },
        },
      )
      return
    }
    if (!vendorId) return
    inviteVendorAdminMutation.mutate(
      {
        vendorId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: '',
        role: 'admin',
      },
      {
        onSuccess: () => {
          coAdminForm.reset()
        },
      },
    )
  }

  const submitDisabled = isVendor
    ? coAdminForm.formState.isSubmitting || isPending
    : coAdminForm.formState.isSubmitting || !vendorId || isPending

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] p-6">
      <form
        onSubmit={coAdminForm.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 max-w-[600px]"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="Enter first name"
            {...coAdminForm.register('first_name')}
            error={coAdminForm.formState.errors.first_name?.message}
          />
          <Input
            label="Last Name"
            placeholder="Enter last name"
            {...coAdminForm.register('last_name')}
            error={coAdminForm.formState.errors.last_name?.message}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            className="col-span-full"
            {...coAdminForm.register('email')}
            error={coAdminForm.formState.errors.email?.message}
          />
          {isVendor && (
            <div className="col-span-full">
              <Controller
                control={coAdminForm.control}
                name="phone_number"
                render={({ field: { onChange, value } }) => (
                  <BasePhoneInput
                    placeholder="Enter number eg. 5512345678"
                    options={phoneCountries}
                    maxLength={14}
                    handleChange={onChange}
                    selectedVal={value ?? ''}
                    label="Phone Number"
                    error={coAdminForm.formState.errors.phone_number?.message}
                    disabled={isPending}
                    hint={
                      <>
                        Please enter number in the format:{' '}
                        <span className="font-medium">5512345678</span>
                      </>
                    }
                  />
                )}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => coAdminForm.reset()}
            disabled={coAdminForm.formState.isSubmitting || isPending}
          >
            Clear
          </Button>
          <Button type="submit" variant="secondary" disabled={submitDisabled} loading={isPending}>
            {isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </div>
  )
}
