import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { AcceptBranchManagerInvitationSchema } from '@/utils/schemas/vendor/branchManager'
import { ROUTES } from '@/utils/constants'
import { onboardBranchManager } from '@/features/dashboard/vendor/services/branches'
import { useToast } from '@/hooks'

export function useAcceptBranchManagerForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { error, success } = useToast()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof AcceptBranchManagerInvitationSchema>>({
    resolver: zodResolver(AcceptBranchManagerInvitationSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: onboardBranchManager,
    onSuccess: (response: any) => {
      success(response?.message || 'Branch manager invitation accepted successfully')
      navigate(ROUTES.IN_APP.AUTH.LOGIN)
    },
    onError: (err: any) => {
      error(err?.message || 'Failed to accept branch manager invitation. Please try again.')
    },
  })

  const onSubmit = (data: z.infer<typeof AcceptBranchManagerInvitationSchema>) => {
    if (!token) {
      error('Invalid invitation token')
      return
    }
    mutate({ token, password: data.password })
  }

  return {
    form,
    onSubmit,
    isPending,
    hasValidToken: Boolean(token),
  }
}
