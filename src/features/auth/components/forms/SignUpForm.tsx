import { BasePhoneInput, Input, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import AccountType from '../AccountType'
import EmailSentModal from '../modals/EmailSentModal'
import PasswordRequirementsChecklist from '../PasswordRequirementsChecklist'
import { useSignUpForm } from '../../hooks'

export default function SignUpForm() {
  const { form, onSubmit, isPending, phoneCountries } = useSignUpForm()

  return (
    <section className="wrapper">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[470.61px] w-full flex flex-col gap-6 mx-auto"
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
            isRequired
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />

          <Controller
            control={form.control}
            name="phone_number"
            render={({ field: { onChange } }) => (
              <BasePhoneInput
                placeholder="Enter number eg. 5512345678"
                options={phoneCountries}
                isRequired
                maxLength={14}
                handleChange={onChange}
                label="Phone Number"
                error={form.formState.errors.phone_number?.message}
                hint={
                  <>
                    Please enter your number in the format:{' '}
                    <span className="font-medium">5512345678</span>
                  </>
                }
              />
            )}
          />

          <div className="flex flex-col gap-2">
            <Input
              isRequired
              label="Password"
              placeholder="Enter your password"
              {...form.register('password')}
              type="password"
              error={form.formState.errors.password?.message}
            />
            <PasswordRequirementsChecklist password={form.watch('password') || ''} />
          </div>

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

      <EmailSentModal />
    </section>
  )
}
