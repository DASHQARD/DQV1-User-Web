import { Modal, Text, Button, Input } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features'
import { Icon } from '@/libs'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const RemoveBranchManagerSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export function RemoveBranchManagerModal() {
  const modal = usePersistedModalState<any>({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitation = modal.modalData
  const { useRemoveBranchManagerService } = useVendorMutations()
  const removeMutation = useRemoveBranchManagerService()

  const form = useForm<z.infer<typeof RemoveBranchManagerSchema>>({
    resolver: zodResolver(RemoveBranchManagerSchema),
    defaultValues: {
      password: '',
    },
  })

  const onSubmit = (data: z.infer<typeof RemoveBranchManagerSchema>) => {
    if (!invitation?.branch_id || !invitation?.branch_manager_email) return

    removeMutation.mutate(
      {
        branch_id: Number(invitation.branch_id),
        email: invitation.branch_manager_email,
        password: data.password,
      },
      {
        onSuccess: () => {
          modal.closeModal()
          form.reset()
        },
      },
    )
  }

  if (!invitation) return null

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.REMOVE)}
      setIsOpen={() => {
        modal.closeModal()
        form.reset()
      }}
      panelClass="!max-w-md"
      position="center"
    >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
            </div>
            <div className="space-y-2 text-center">
              <Text variant="h3" className="font-semibold">
                Remove Branch Manager
              </Text>
              <p className="text-sm text-gray-600">
                Are you sure you want to remove{' '}
                {invitation.branch_manager_name || invitation.branch_manager_email} as branch
                manager? This action requires your password to confirm.
              </p>
            </div>
          </div>

          <div>
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
              disabled={removeMutation.isPending}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                modal.closeModal()
                form.reset()
              }}
              className="flex-1 rounded-full"
              disabled={removeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1 rounded-full"
              disabled={removeMutation.isPending}
              loading={removeMutation.isPending}
            >
              Remove
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
