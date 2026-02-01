import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { AcceptVendorAdminInvitationSchema } from '@/utils/schemas'
import { useVendorMutations } from '@/features/dashboard'
import { useToast } from '@/hooks'

export function useAcceptVendorAdminForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { error } = useToast()
  const { useAcceptVendorInvitationService } = useVendorMutations()
  const { mutate, isPending } = useAcceptVendorInvitationService()

  const form = useForm<z.infer<typeof AcceptVendorAdminInvitationSchema>>({
    resolver: zodResolver(AcceptVendorAdminInvitationSchema),
  })

  const onSubmit = (data: z.infer<typeof AcceptVendorAdminInvitationSchema>) => {
    if (!token) {
      error('Invalid invitation token')
      return
    }
    mutate({
      password: data.password,
      token,
    })
  }

  return {
    form,
    onSubmit,
    isPending,
  }
}
