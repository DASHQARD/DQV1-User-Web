import { Modal, Button, Input, Loader } from '@/components'
import { useInviteAdmin } from '../../hooks/useInviteAdmin'
import { usePermissions, useRoles } from '../../hooks'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const inviteAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  role_id: z.string().min(1, 'Role is required'),
  type: z.string().min(1, 'Type is required'),
})

type InviteAdminFormData = z.infer<typeof inviteAdminSchema>

interface InviteAdminModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteAdminModal({ isOpen, onClose }: InviteAdminModalProps) {
  const { mutate: inviteAdmin, isPending } = useInviteAdmin()
  const { data: roles, isLoading: isLoadingRoles } = useRoles()
  const { data: permissions } = usePermissions()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteAdminFormData>({
    resolver: zodResolver(inviteAdminSchema),
  })

  console.log('roles', roles)
  console.log('permissions', permissions)

  const onSubmit = (data: InviteAdminFormData) => {
    inviteAdmin(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title="Invite Admin"
      position="center"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
        <div className="space-y-4">
          <div>
            <Input
              label="Email"
              type="email"
              placeholder="Enter email address"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                type="text"
                placeholder="Enter first name"
                {...register('first_name')}
                error={errors.first_name?.message}
              />
            </div>
            <div>
              <Input
                label="Last Name"
                type="text"
                placeholder="Enter last name"
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center py-4">
                <Loader />
              </div>
            ) : (
              <select
                {...register('role_id')}
                className="w-full border-2 border-gray-300 rounded-lg py-2.5 px-4 text-sm bg-white text-gray-900 cursor-pointer transition-colors focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25 hover:border-gray-400"
                disabled={isLoadingRoles}
              >
                <option value="">Select role</option>
                {roles?.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.role}
                  </option>
                ))}
              </select>
            )}
            {errors.role_id && (
              <p className="mt-1 text-sm text-red-600">{errors.role_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Type</label>
            <select
              {...register('type')}
              className="w-full border-2 border-gray-300 rounded-lg py-2.5 px-4 text-sm bg-white text-gray-900 cursor-pointer transition-colors focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25 hover:border-gray-400"
            >
              <option value="">Select type</option>
              <option value="staff">Staff</option>
              <option value="super_admin">Super Admin</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-2"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            className="flex-1 bg-linear-to-br from-[#402D87] to-[#5a4fcf] text-white hover:from-[#2d1a72] hover:to-[#402D87]"
            loading={isPending}
            disabled={isPending}
          >
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  )
}
