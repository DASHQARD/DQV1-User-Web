import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { useAuth } from '@/features/auth/hooks/auth'
import { useToast } from '@/hooks'
import { useAuthStore } from '@/stores'
import { finishClientLogout } from '@/utils/finishClientLogout'
import { ChangePasswordSchema } from '@/utils/schemas/auth/changePassword'

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>

const defaultValues: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function useChangePasswordSettings() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { info } = useToast()
  const { logout: clearAuthState } = useAuthStore()
  const { useChangePasswordService, useLogoutService } = useAuth()
  const { mutate: changePassword, isPending: isChanging } = useChangePasswordService()
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogoutService()

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues,
  })

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: async () => {
          form.reset(defaultValues)

          // After a credential change, drop any access/refresh token that was tied
          // to the old password so it can't continue to be used from this device.
          // The backend should also revoke them server-side; this gives it the
          // chance to do so and ensures the SPA itself stops using them.
          try {
            await logout()
          } catch (err) {
            console.error('Failed to call logout after password change:', err)
          } finally {
            queryClient.clear()
            info?.('For your security, please sign in with your new password.')
            finishClientLogout(navigate, clearAuthState)
          }
        },
      },
    )
  }

  const handleReset = () => {
    form.reset(defaultValues)
  }

  return {
    form,
    onSubmit,
    handleReset,
    isPending: isChanging || isLoggingOut,
  }
}
