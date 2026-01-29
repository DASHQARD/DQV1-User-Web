import React from 'react'
import { useSearchParams } from 'react-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Modal, Input, BasePhoneInput, Text, Combobox } from '@/components'
import { usePersistedModalState, useCountriesData, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'

const InviteBranchManagerSchema = z.object({
  branch_id: z.union([z.string().min(1, 'Branch is required'), z.number().positive()]),
  branch_manager_name: z.string().min(1, 'Name is required'),
  branch_manager_email: z.string().email('Invalid email address'),
  branch_manager_phone: z.string().min(1, 'Phone number is required'),
})

type InviteBranchManagerFormData = z.infer<typeof InviteBranchManagerSchema>

export function InviteBranchManagerModal() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const { countries: phoneCountries } = useCountriesData()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useGetCorporateBranchesListService, useGetCorporateBranchesByVendorIdService } =
    corporateQueries()
  const { data: corporateBranchesList } = useGetCorporateBranchesListService()
  const { data: corporateBranchesByVendor } =
    useGetCorporateBranchesByVendorIdService(vendorIdFromUrl)

  const branchesArray = React.useMemo(() => {
    const raw = vendorIdFromUrl ? corporateBranchesByVendor : corporateBranchesList
    if (!raw) return []
    return Array.isArray(raw) ? raw : raw?.data || []
  }, [vendorIdFromUrl, corporateBranchesByVendor, corporateBranchesList])

  const branchOptions = React.useMemo(
    () =>
      branchesArray.map((b: any) => ({
        label: b.branch_name || `Branch ${b.id ?? b.branch_id}`,
        value: String(b.id ?? b.branch_id),
      })),
    [branchesArray],
  )

  const form = useForm<InviteBranchManagerFormData>({
    resolver: zodResolver(InviteBranchManagerSchema),
    defaultValues: {
      branch_id: '',
      branch_manager_name: '',
      branch_manager_email: '',
      branch_manager_phone: '',
    },
  })

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset()
  }, [modal, form])

  const { useCreateCorporateBranchManagerInvitationService } = corporateMutations()
  const createMutation = useCreateCorporateBranchManagerInvitationService()

  const onSubmit = (data: InviteBranchManagerFormData) => {
    createMutation.mutate(
      {
        branch_id: Number(data.branch_id),
        branch_manager_name: data.branch_manager_name,
        branch_manager_email: data.branch_manager_email,
        branch_manager_phone: data.branch_manager_phone,
      },
      {
        onSuccess: () => {
          handleCloseModal()
        },
      },
    )
  }

  if (!isCorporateSuperAdmin) return null

  return (
    <Modal
      position="center"
      title="Invite Branch Manager"
      isOpen={modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.CREATE)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[500px] max-w-[90vw]"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 items-center justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Icon icon="bi:person-plus-fill" className="text-2xl text-blue-600" />
          </div>
          <div className="space-y-2 text-center">
            <Text variant="h3" className="font-semibold">
              Invite Branch Manager
            </Text>
            <p className="text-sm text-gray-600">
              Send an invitation to a branch manager. They will receive an email to complete
              registration.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Controller
            control={form.control}
            name="branch_id"
            render={({ field, fieldState: { error } }) => (
              <Combobox
                label="Branch"
                options={branchOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                error={error?.message}
                placeholder="Select branch"
                isDisabled={createMutation.isPending}
              />
            )}
          />

          <Input
            label="Branch Manager Name"
            placeholder="Enter full name"
            {...form.register('branch_manager_name')}
            error={form.formState.errors.branch_manager_name?.message}
            disabled={createMutation.isPending}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            {...form.register('branch_manager_email')}
            error={form.formState.errors.branch_manager_email?.message}
            disabled={createMutation.isPending}
          />

          <Controller
            control={form.control}
            name="branch_manager_phone"
            render={({ field: { onChange, value } }) => (
              <BasePhoneInput
                placeholder="Enter number eg. 5512345678"
                options={phoneCountries}
                maxLength={14}
                handleChange={onChange}
                selectedVal={value}
                label="Phone Number"
                error={form.formState.errors.branch_manager_phone?.message}
                disabled={createMutation.isPending}
                hint={
                  <>
                    Please enter your number in the format:{' '}
                    <span className="font-medium">5512345678</span>
                  </>
                }
              />
            )}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            type="submit"
            disabled={createMutation.isPending}
            loading={createMutation.isPending}
          >
            {createMutation.isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
