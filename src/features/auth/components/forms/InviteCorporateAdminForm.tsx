import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'

import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AcceptCorporateAdminInvitationFormSchema } from '@/utils/schemas'
import { corporateMutations } from '@/features/dashboard/corporate'
import { useToast } from '@/hooks'
import PasswordRequirementsChecklist from '../PasswordRequirementsChecklist'

export default function InviteCorporateAdminForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { error } = useToast()

  const form = useForm<z.infer<typeof AcceptCorporateAdminInvitationFormSchema>>({
    resolver: zodResolver(AcceptCorporateAdminInvitationFormSchema),
  })
  const { useAcceptCorporateAdminInvitationService } = corporateMutations()
  const acceptCorporateAdminInvitationMutation = useAcceptCorporateAdminInvitationService()

  const handleSubmit = (data: z.infer<typeof AcceptCorporateAdminInvitationFormSchema>) => {
    if (!token) {
      error('Invalid invitation token')
      return
    }

    const payload = {
      password: data.password,
      token: token,
    }
    acceptCorporateAdminInvitationMutation.mutate(payload)
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
            Set Your Password
          </Text>
          <p className="text-sm text-gray-500">
            Create a password to accept your corporate admin invitation
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Input
            label="Password"
            placeholder="Enter your password"
            {...form.register('password')}
            type="password"
            error={form.formState.errors.password?.message}
          />
          <PasswordRequirementsChecklist password={form.watch('password') || ''} />
        </div>
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
          loading={acceptCorporateAdminInvitationMutation.isPending}
          disabled={acceptCorporateAdminInvitationMutation.isPending || !form.formState.isValid}
        >
          Accept Invitation
        </Button>
      </section>
    </form>
  )
}
