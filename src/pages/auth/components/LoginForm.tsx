import { Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@/utils/schemas'
import { z } from 'zod'

export default function LoginForm() {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  })
  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    console.log(data)
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
            Welcome Back
          </Text>
          <p className="text-sm text-gray-500">Sign in to your account to continue</p>
        </div>
      </div>
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

        <Button type="submit" variant="secondary" className="w-full">
          Sign In
        </Button>
        <Link
          to={ROUTES.IN_APP.AUTH.RESET_PASSWORD}
          className="text-primary-500 underline  text-sm"
        >
          Forgot password?
        </Link>
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
            Don't have an account?{' '}
            <Link to={ROUTES.IN_APP.AUTH.REGISTER} className="text-primary-500 underline">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </form>
  )
}
