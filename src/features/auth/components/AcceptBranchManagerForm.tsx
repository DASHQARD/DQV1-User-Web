import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { AcceptBranchManagerInvitationSchema } from '@/utils/schemas/vendor/branchManager'
import { useToast } from '@/hooks'
import { onboardBranchManager } from '@/features/dashboard/vendor/services/branches'
import { ROUTES } from '@/utils/constants'

export default function AcceptBranchManagerForm() {
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

  const onboardBranchManagerMutation = useMutation({
    mutationFn: onboardBranchManager,
    onSuccess: (response: any) => {
      success(response?.message || 'Branch manager invitation accepted successfully')
      navigate(ROUTES.IN_APP.AUTH.LOGIN)
    },
    onError: (err: any) => {
      error(err?.message || 'Failed to accept branch manager invitation. Please try again.')
    },
  })

  const handleSubmit = async (data: z.infer<typeof AcceptBranchManagerInvitationSchema>) => {
    if (!token) {
      error('Invalid invitation token')
      return
    }

    const payload = {
      token: token,
      password: data.password,
    }

    onboardBranchManagerMutation.mutate(payload)
  }

  if (!token) {
    return (
      <div className="max-w-[470.61px] w-full flex flex-col items-center justify-center gap-4 py-10">
        <Icon icon="bi:exclamation-triangle" className="text-4xl text-red-500" />
        <Text as="h2" className="text-xl font-bold text-gray-900">
          Invalid Invitation
        </Text>
        <Text as="p" className="text-sm text-gray-600 text-center">
          This invitation link is invalid or has expired. Please contact the administrator for a new
          invitation.
        </Text>
      </div>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
          <Icon icon="bi:key-fill" className="size-5 text-white" />
        </div>
        <div>
          <Text as="h2" className="text-2xl font-bold">
            Accept Branch Manager Invitation
          </Text>
          <p className="text-sm text-gray-500">
            Set your password to accept the branch manager invitation
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <Input
          label="Password"
          placeholder="Enter your password"
          type="password"
          {...form.register('password')}
          error={form.formState.errors.password?.message}
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          type="password"
          {...form.register('confirm_password')}
          error={form.formState.errors.confirm_password?.message}
        />

        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          loading={onboardBranchManagerMutation.isPending}
          disabled={onboardBranchManagerMutation.isPending}
        >
          Accept Invitation
        </Button>
      </section>
    </form>
  )
}
