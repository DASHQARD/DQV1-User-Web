import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Modal, Input, Combobox, BasePhoneInput } from '@/components'
import { useCountriesData, usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { InviteAdminSchema } from '@/utils/schemas'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

type InviteAdminFormData = z.infer<typeof InviteAdminSchema>

export function InviteAdmin() {
  const modal = usePersistedModalState({
    paramName: MODALS.INVITE_ADMIN.CREATE,
  })

  const form = useForm<InviteAdminFormData>({
    resolver: zodResolver(InviteAdminSchema),
  })

  const { countries: phoneCountries } = useCountriesData()

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset()
  }, [modal, form])

  const { useInviteAdminForCorporateService } = corporateMutations()
  const inviteAdminForCorporateMutation = useInviteAdminForCorporateService()

  const onSubmit = async (data: InviteAdminFormData) => {
    inviteAdminForCorporateMutation.mutate(data)
    handleCloseModal()
  }

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer"
        size="medium"
        onClick={() => modal.openModal(MODALS.INVITE_ADMIN.CREATE)}
      >
        <Icon icon="bi:person-plus" className="mr-2" />
        Invite Admin
      </Button>
      <Modal
        position="center"
        title="Invite Admin"
        isOpen={modal.isModalOpen(MODALS.INVITE_ADMIN.CREATE)}
        setIsOpen={handleCloseModal}
        panelClass="!w-[500px] max-w-[90vw]"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 p-6">
          <div className="space-y-4 grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Enter admin's first name"
              {...form.register('first_name')}
              error={form.formState.errors.first_name?.message}
            />
            <Input
              label="Last Name"
              placeholder="Enter admin's last name"
              {...form.register('last_name')}
              error={form.formState.errors.last_name?.message}
            />

            <Input
              className="col-span-full"
              label="Email Address"
              type="email"
              placeholder="Enter admin's email address"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />

            <div className="flex flex-col gap-1 col-span-full">
              <Controller
                control={form.control}
                name="phone_number"
                render={({ field: { onChange } }) => {
                  return (
                    <BasePhoneInput
                      placeholder="Enter number eg. 5512345678"
                      options={phoneCountries}
                      maxLength={9}
                      handleChange={onChange}
                      label="Phone Number"
                      error={form.formState.errors.phone_number?.message}
                    />
                  )
                }}
              />
              <p className="text-xs text-gray-500">
                Please enter your number in the format:{' '}
                <span className="font-medium">+2335512345678</span>
              </p>
            </div>

            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="Role"
                  className="col-span-full"
                  options={[{ label: 'Admin', value: 'admin' }]}
                  {...field}
                  error={error?.message}
                  placeholder="Select role"
                />
              )}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              type="submit"
              disabled={form.formState.isSubmitting}
              loading={inviteAdminForCorporateMutation.isPending}
            >
              {inviteAdminForCorporateMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
