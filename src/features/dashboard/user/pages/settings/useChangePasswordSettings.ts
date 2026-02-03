import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/features/auth/hooks/auth'
import { ChangePasswordSchema } from '@/utils/schemas/auth/changePassword'

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>

const defaultValues: ChangePasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function useChangePasswordSettings() {
  const { useChangePasswordService } = useAuth()
  const { mutate: changePassword, isPending } = useChangePasswordService()

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
        onSuccess: () => {
          form.reset(defaultValues)
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
    isPending,
  }
}
