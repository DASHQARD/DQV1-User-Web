import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inviteAdmin } from '../services'
import type { InviteAdminPayload, InviteAdminResponse } from '@/types/admin'
import { useToast } from '@/hooks'

export function useInviteAdmin() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<InviteAdminResponse, Error, InviteAdminPayload>({
    mutationFn: inviteAdmin,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success(response.message || 'Admin invited successfully')
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to invite admin')
    },
  })
}
