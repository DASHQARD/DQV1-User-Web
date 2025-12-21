import { useAuth } from '../hooks'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Loader, OTPInput, ResendCode, Text } from '@/components'
import { z } from 'zod'
import { VerifyLoginOTPSchema } from '@/utils/schemas'
import { useCountdown } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/assets/images'
import { usePersistedModalState } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'

export default function OtpLoginModal() {
  const navigate = useNavigate()
  const { useVerifyLoginOTPService, useResendRefreshTokenService } = useAuth()
  const { mutate, isPending } = useVerifyLoginOTPService()
  const { mutate: resendRefreshToken } = useResendRefreshTokenService()
  const modal = usePersistedModalState<{ email?: string }>({
    paramName: MODAL_NAMES.AUTH.ROOT,
  })
  const email = modal.modalData?.email
  const form = useForm<z.infer<typeof VerifyLoginOTPSchema>>({
    resolver: zodResolver(VerifyLoginOTPSchema),
  })

  const onSubmit = (data: z.infer<typeof VerifyLoginOTPSchema>) => {
    mutate(data.otp)
  }

  const { resendOtp, formatCountdown, countdown } = useCountdown({
    sendOtp: () => {
      resendRefreshToken(email)
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="bg-white max-w-[540px] m-auto w-full h-fit p-[72px_40px] rounded-xl flex flex-col gap-6"
    >
      <button
        onClick={() => navigate(ROUTES.IN_APP.AUTH.LOGIN)}
        className="flex justify-center max-w-[160px] mx-auto cursor-pointer"
      >
        <img src={Logo} alt="Logo" className="w-full h-auto" />
      </button>
      <div className="flex flex-col gap-1">
        <Text variant="h2" weight="semibold" className="text-gray-900">
          {isPending ? 'Verifying OTP...' : 'OTP verification'}
        </Text>
        <Text variant="span" weight="medium" className="text-gray-600 leading-5">
          {isPending
            ? 'This might take few seconds...please wait'
            : `Enter the 4 digit one time verification code sent to your phone`}
        </Text>
      </div>

      {isPending ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <>
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
          <ResendCode
            isLoading={isPending}
            formatCountdown={formatCountdown}
            countdown={countdown}
            onResend={resendOtp}
          />
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
        </>
      )}
    </form>
  )
}
