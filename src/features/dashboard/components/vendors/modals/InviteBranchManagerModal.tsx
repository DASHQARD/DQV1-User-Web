import { Controller } from 'react-hook-form'
import { Button, Modal, Input, BasePhoneInput, Text, Combobox } from '@/components'
import { Icon } from '@/libs'
import { useInviteBranchManagerModal } from '@/features/dashboard/vendor/hooks'

export function InviteBranchManagerModal() {
  const {
    form,
    phoneCountries,
    branchOptions,
    handleCloseModal,
    onSubmit,
    isPending,
    isOpen,
    isCorporateSuperAdmin,
  } = useInviteBranchManagerModal()

  if (!isCorporateSuperAdmin) return null

  return (
    <Modal
      position="center"
      title="Invite Branch Manager"
      isOpen={isOpen}
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
                isDisabled={isPending}
              />
            )}
          />

          <Input
            label="Branch Manager Name"
            placeholder="Enter full name"
            {...form.register('branch_manager_name')}
            error={form.formState.errors.branch_manager_name?.message}
            disabled={isPending}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            {...form.register('branch_manager_email')}
            error={form.formState.errors.branch_manager_email?.message}
            disabled={isPending}
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
                disabled={isPending}
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
          <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="secondary" type="submit" disabled={isPending} loading={isPending}>
            {isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
