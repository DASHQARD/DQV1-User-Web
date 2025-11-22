import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input, Modal, OTPInput, Text } from '@/components'
import { Button } from '@/components/Button'
import { Icon } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { ResetPasswordSchema } from '@/utils/schemas'

const ResetPasswordUpdateSchema = z
  .object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })

export default function ResetPasswordForm() {
  const emailForm = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
  })
  const passwordForm = useForm<z.infer<typeof ResetPasswordUpdateSchema>>({
    resolver: zodResolver(ResetPasswordUpdateSchema),
  })

  const [openOtpModal, setOpenOtpModal] = React.useState(false)
  const [otpValue, setOtpValue] = React.useState('')
  const [step, setStep] = React.useState<'request' | 'update'>('request')
  const [submittedEmail, setSubmittedEmail] = React.useState<string>('')

  const handleEmailSubmit = (data: z.infer<typeof ResetPasswordSchema>) => {
    setSubmittedEmail(data.email)
    setOtpValue('')
    setOpenOtpModal(true)
  }

  const handleOtpChange = (value: string) => {
    setOtpValue(value)
    if (value.length === 6) {
      // This is where an API call to verify the OTP would happen.
      setOpenOtpModal(false)
      setStep('update')
    }
  }

  const handlePasswordSubmit = (data: z.infer<typeof ResetPasswordUpdateSchema>) => {
    // Replace with API call to complete password reset
    console.log({
      email: submittedEmail,
      ...data,
    })
  }

  return (
    <>
      {step === 'request' && (
        <form
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
          className="max-w-[470.61px] w-full flex flex-col gap-10"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
              <Icon icon="bi:key-fill" className="size-5 text-white" />
            </div>
            <div>
              <Text as="h2" className="text-2xl font-bold">
                Reset Password
              </Text>
              <p className="text-sm text-gray-500">
                Enter your email to receive a password reset link
              </p>
            </div>
          </div>
          <section className="flex flex-col gap-4">
            <Input
              label="Email"
              placeholder="Enter your email"
              {...emailForm.register('email')}
              error={emailForm.formState.errors.email?.message}
            />

            <Button type="submit" variant="secondary" className="w-full">
              Send Reset Link
            </Button>

            <hr className="border-gray-200" />

            <div className="flex items-center gap-2">
              <p>
                Remember your password?{' '}
                <Link to={ROUTES.IN_APP.AUTH.LOGIN} className="text-primary-500 underline">
                  Login
                </Link>
              </p>
            </div>
          </section>
        </form>
      )}

      {step === 'update' && (
        <form
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          className="max-w-[470.61px] w-full flex flex-col gap-10"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
              <Icon icon="bi:key-fill" className="size-5 text-white" />
            </div>
            <div>
              <Text as="h2" className="text-2xl font-bold">
                Create New Password
              </Text>
              <p className="text-sm text-gray-500">Enter and confirm your new password</p>
            </div>
          </div>
          <section className="flex flex-col gap-4">
            <Input
              label="New Password"
              placeholder="Enter your new password"
              type="password"
              {...passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            <Input
              label="Confirm New Password"
              placeholder="Confirm your new password"
              type="password"
              {...passwordForm.register('confirmNewPassword')}
              error={passwordForm.formState.errors.confirmNewPassword?.message}
            />

            <Button type="submit" variant="secondary" className="w-full">
              Reset Password
            </Button>
          </section>
        </form>
      )}

      <Modal
        isOpen={openOtpModal}
        setIsOpen={setOpenOtpModal}
        showClose={true}
        panelClass="max-w-[480px] p-8"
      >
        <section className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary-500 rounded-full p-2 h-10 w-10 flex items-center justify-center">
              <Icon icon="bi:key-fill" className="size-5 text-white" />
            </div>
            <div className="text-center">
              <Text as="h2" className="text-2xl font-bold">
                Reset Password
              </Text>
              <p className="text-center text-sm text-gray-500">
                We sent the code to <span className="font-medium">{submittedEmail}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Text as="p" className="text-sm text-gray-500">
              Verification Code
            </Text>
            <OTPInput
              inputType="password"
              inputListClassName="grid grid-cols-6 gap-2"
              secure
              value={otpValue}
              onChange={handleOtpChange}
            />
          </div>
          <Button type="button" variant="secondary" className="w-full">
            Resend Code
          </Button>
        </section>
      </Modal>
    </>
  )
}
