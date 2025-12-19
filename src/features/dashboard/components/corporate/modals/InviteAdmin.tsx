import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Modal, Input, Combobox } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { useToast } from '@/hooks'
import { InviteAdminSchema } from '@/utils/schemas'

type InviteAdminFormData = z.infer<typeof InviteAdminSchema>

export function InviteAdmin() {
  const modal = usePersistedModalState({
    paramName: MODALS.INVITE_ADMIN.CREATE,
  })
  const toast = useToast()

  const form = useForm<InviteAdminFormData>({
    resolver: zodResolver(InviteAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
    },
  })

  const roles = [
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Admin', value: 'admin' },
    { label: 'Viewer', value: 'viewer' },
  ]

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    form.reset()
  }, [modal, form])

  const onSubmit = async (data: InviteAdminFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Inviting admin:', data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success(`Invitation sent to ${data.email}`)
      form.reset()
      handleCloseModal()
    } catch (error: any) {
      console.error('Error inviting admin:', error)
      toast.error(error?.message || 'Failed to send invitation. Please try again.')
    }
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
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter admin's full name"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter admin's email address"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />

            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="Role"
                  options={roles}
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
