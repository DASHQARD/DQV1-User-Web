import { Controller } from 'react-hook-form'
import { Button, Modal, Input, BasePhoneInput, Text } from '@/components'
import { Icon } from '@/libs'
import { useUpdateBranchManagerInvitationModal } from '@/features/dashboard/vendor/hooks'

export function UpdateBranchManagerInvitationModal() {
  const {
    invitation,
    form,
    phoneCountries,
    handleCloseModal,
    onSubmit,
    isUpdating,
    isOpen,
    invitationEmailLabel,
  } = useUpdateBranchManagerInvitationModal()

  if (!invitation) return null

  return (
    <Modal
      position="center"
      title="Update Branch Manager Invitation"
      isOpen={isOpen}
      setIsOpen={handleCloseModal}
      panelClass="!w-[500px] max-w-[90vw]"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 items-center justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Icon icon="bi:pencil-fill" className="text-2xl text-blue-600" />
          </div>
          <div className="space-y-2 text-center">
            <Text variant="h3" className="font-semibold">
              Update Invitation
            </Text>
            <p className="text-sm text-gray-600">Update the details for {invitationEmailLabel}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Branch Manager Name"
            placeholder="Enter branch manager name"
            {...form.register('branch_manager_name')}
            error={form.formState.errors.branch_manager_name?.message}
            disabled={isUpdating}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            {...form.register('branch_manager_email')}
            error={form.formState.errors.branch_manager_email?.message}
            disabled={isUpdating}
          />

          <div className="flex flex-col gap-1">
            <Controller
              control={form.control}
              name="branch_manager_phone"
              render={({ field: { onChange, value } }) => (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={phoneCountries}
                  maxLength={9}
                  handleChange={onChange}
                  selectedVal={value}
                  label="Phone Number"
                  error={form.formState.errors.branch_manager_phone?.message}
                  disabled={isUpdating}
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
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isUpdating}>
            Cancel
          </Button>
          <Button variant="secondary" type="submit" disabled={isUpdating} loading={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
