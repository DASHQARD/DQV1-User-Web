import { useAuth } from '../hooks'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, OTPInput, Text } from '@/components'
import { z } from 'zod'
import { VerifyLoginOTPSchema } from '@/utils/schemas'
import { Icon } from '@/libs'

export default function AdminOtpLoginModal() {
  const { useVerifyLoginTokenService } = useAuth()
  const { mutate, isPending } = useVerifyLoginTokenService()
  const form = useForm<z.infer<typeof VerifyLoginOTPSchema>>({
    resolver: zodResolver(VerifyLoginOTPSchema),
  })

  const onSubmit = (data: z.infer<typeof VerifyLoginOTPSchema>) => {
    mutate(data.otp)
  }
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary-500 rounded-full h-10 w-10 flex items-center justify-center">
          <Icon icon="bi:shield-check" className="size-5 text-white" />
        </div>
        <div>
          <Text variant="h4" weight="semibold" className="text-gray-900">
            Enter Verification Code
          </Text>
          <Text variant="span" weight="normal" className="text-gray-600">
            We've sent a 4-digit code to your phone
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-[18px]">
        <Controller
          control={form.control}
          name="otp"
          render={({ field }) => (
            <OTPInput
              length={4}
              inputType="password"
              inputListClassName="grid grid-cols-4 gap-2"
              {...field}
              secure
              onChange={(value) => {
                field.onChange(value)
                if (value.length === 4) {
                  mutate(value)
                }
              }}
            />
          )}
        />
      </div>
      {/* <ResendCode
          isLoading={isPending}
          formatCountdown={formatCountdown}
          countdown={countdown}
          onResend={resendOtp}
        /> */}
      <div className="py-2">
        <Button
          variant="secondary"
          className="w-full rounded-[48px] h-12"
          size="default"
          disabled={!form.formState.isValid || isPending}
          loading={isPending}
        >
          Verify & Continue
        </Button>
      </div>
    </form>
  )
}
