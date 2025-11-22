import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateAccountSchema } from '@/utils/schemas'
import { z } from 'zod'
import { AccountType } from '.'
import { useAuth } from '@/pages/auth'

export default function CreateAccountForm() {
  const { useCreateAccountMutation } = useAuth()
  const { mutate, isPending } = useCreateAccountMutation()
  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    mode: 'onChange',
    defaultValues: {
      user_type: 'user',
    },
  })
  const onSubmit = (data: z.infer<typeof CreateAccountSchema>) => {
    const payload = {
      user_type: data.user_type,
      email: data.email,
      password: data.password,
    }
    mutate(payload)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-[470.61px] w-full flex flex-col gap-10"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
          <Icon icon="bi:shop-window" className="size-5 text-white" />
        </div>
        <div>
          <Text as="h2" className="text-2xl font-bold">
            Create account
          </Text>
          <p className="text-sm text-gray-500">Join us and start managing your digital cards </p>
        </div>
      </div>
      <AccountType
        value={form.watch('user_type')}
        onChange={(value) => form.setValue('user_type', value)}
      />
      <section className="flex flex-col gap-4">
        <Input
          label="Email"
          placeholder="Enter your email"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          {...form.register('password')}
          type="password"
          error={form.formState.errors.password?.message}
        />
        <Input
          label="Confirm Password"
          placeholder="Enter your confirm password"
          {...form.register('confirmPassword')}
          type="password"
          error={form.formState.errors.confirmPassword?.message}
        />

        <Button
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
          type="submit"
          variant="secondary"
          className="w-full"
        >
          Create account
        </Button>
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our{' '}
          <a href={ROUTES.IN_APP.TERMS_OF_SERVICE} className="text-primary-500 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href={ROUTES.IN_APP.PRIVACY_POLICY} className="text-primary-500 underline">
            Privacy Policy
          </a>
        </p>

        <hr className="border-gray-200" />

        <div className="flex items-center gap-2">
          <p>
            Already have an account?{' '}
            <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </form>
  )
}
