import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Modal, Input, BasePhoneInput } from '@/components'
import { usePersistedModalState, useCountriesData } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'

const UpdateBranchManagerDetailsSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone_number: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
})

type UpdateBranchManagerDetailsFormData = z.infer<typeof UpdateBranchManagerDetailsSchema>

export function UpdateBranchManagerDetailsModal() {
  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH.ROOT,
  })

  const branch = modal.modalData
  const { countries: phoneCountries } = useCountriesData()
  const isModalOpen = modal.isModalOpen(MODALS.BRANCH.UPDATE_MANAGER_DETAILS)

  const branchManagerUserId =
    branch?.branch_manager_user_id ?? branch?.user_id ?? branch?.branch_manager?.id

  const form = useForm<UpdateBranchManagerDetailsFormData>({
    resolver: zodResolver(UpdateBranchManagerDetailsSchema),
    defaultValues: {
      email: branch?.branch_manager_email || branch?.branch_manager?.email || '',
      phone_number:
        branch?.branch_manager_phone ||
        branch?.branch_manager?.phone_number ||
        branch?.branch_manager?.phonenumber ||
        '',
      password: '',
    },
  })

  React.useEffect(() => {
    if (branch && isModalOpen) {
      form.reset({
        email: branch.branch_manager_email || branch.branch_manager?.email || '',
        phone_number:
          branch.branch_manager_phone ||
          branch.branch_manager?.phone_number ||
          branch.branch_manager?.phonenumber ||
          '',
        password: '',
      })
    }
  }, [branch, isModalOpen, form])

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset()
  }, [modal, form])

  const { useUpdateBranchManagerDetailsService } = useVendorMutations()
  const { mutateAsync: updateBranchManagerDetails, isPending: isUpdating } =
    useUpdateBranchManagerDetailsService()

  const onSubmit = async (data: UpdateBranchManagerDetailsFormData) => {
    if (branchManagerUserId == null || branchManagerUserId === 0) return

    await updateBranchManagerDetails({
      branch_manager_user_id: Number(branchManagerUserId),
      email: data.email,
      phone_number: data.phone_number,
      password: data.password,
    })
    handleCloseModal()
  }

  if (!isModalOpen) return null

  return (
    <Modal
      title="Update Branch Manager Details"
      isOpen={isModalOpen}
      setIsOpen={(open) => !open && handleCloseModal()}
      panelClass="max-w-md"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
        <Input
          label="Email"
          type="email"
          placeholder="branch.manager@example.com"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
        />
        <Controller
          control={form.control}
          name="phone_number"
          render={({ field, fieldState }) => (
            <BasePhoneInput
              label="Phone number"
              options={phoneCountries}
              maxLength={14}
              selectedVal={field.value}
              handleChange={field.onChange}
              error={fieldState.error?.message}
              hint={
                <>
                  Please enter your number in the format:{' '}
                  <span className="font-medium">5512345678</span>
                </>
              }
            />
          )}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter new password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Icon icon="bi:arrow-repeat" className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
