import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Text } from '@/components'
import { useUserProfile } from '@/hooks'
import { InviteVendorAdminSchema } from '@/utils/schemas/invite'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

type InviteVendorAdminFormData = z.infer<typeof InviteVendorAdminSchema>

export function InviteAdmin() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const form = useForm<InviteVendorAdminFormData>({
    resolver: zodResolver(InviteVendorAdminSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const { useInviteVendorAdminService } = corporateMutations()
  const inviteVendorAdminMutation = useInviteVendorAdminService()

  const vendorId =
    vendorIdFromUrl ??
    (userProfileData?.vendor_id != null ? String(userProfileData.vendor_id) : null)

  const onSubmit = (data: InviteVendorAdminFormData) => {
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
          form.reset()
        },
      },
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] p-6">
      <div className="mb-6">
        <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
          Invite Admin
        </Text>
        <Text variant="span" className="text-gray-500 text-sm">
          Send an invitation to a new admin. They will receive an email with instructions to set up
          their account.
        </Text>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-[600px]">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="Enter first name"
            {...form.register('first_name')}
            error={form.formState.errors.first_name?.message}
          />
          <Input
            label="Last Name"
            placeholder="Enter last name"
            {...form.register('last_name')}
            error={form.formState.errors.last_name?.message}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            className="col-span-full"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting || inviteVendorAdminMutation.isPending}
          >
            Clear
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={
              form.formState.isSubmitting || !vendorId || inviteVendorAdminMutation.isPending
            }
            loading={inviteVendorAdminMutation.isPending}
          >
            {inviteVendorAdminMutation.isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </div>
  )
}
