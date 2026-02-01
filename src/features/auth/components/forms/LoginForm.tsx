import { Input, Modal, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { MODAL_NAMES, ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'
import OtpLoginModal from '../modals/OtpLoginModal'
import { useLoginForm } from '../../hooks'

export default function LoginForm() {
  const { form, onSubmit, isPending, modal } = useLoginForm()

  return (
    <>
      <section className="wrapper">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-[470.61px] w-full flex flex-col gap-10 mx-auto"
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
              isRequired
              label="Email"
              placeholder="Enter your email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Input
              isRequired
              label="Password"
              placeholder="Enter your password"
              {...form.register('password')}
              type="password"
              error={form.formState.errors.password?.message}
            />

            <Button
              disabled={!form.formState.isValid || isPending}
              loading={isPending}
              type="submit"
              variant="secondary"
              className="w-full"
            >
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
      </section>

      <Modal
        isOpen={modal.isModalOpen(MODAL_NAMES.AUTH.ROOT)}
        setIsOpen={modal.closeModal}
        panelClass="max-w-[546px] p-8"
      >
        <OtpLoginModal />
      </Modal>
    </>
  )
}
