import { Modal, Button, Text, OTPInput } from '@/components'
import { Icon } from '@/libs'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const OTPSchema = z.object({
  otp: z.string().min(4, 'OTP must be 4 digits').max(4, 'OTP must be 4 digits'),
})

interface RedemptionOTPModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (otp: string) => void
  isLoading?: boolean
  userPhone?: string
}

export default function RedemptionOTPModal({
  isOpen,
  onClose,
  onVerify,
  isLoading = false,
  userPhone,
}: RedemptionOTPModalProps) {
  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      otp: '',
    },
  })

  const onSubmit = (data: z.infer<typeof OTPSchema>) => {
    onVerify(data.otp)
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Modal
      title="Verify Redemption"
      isOpen={isOpen}
      setIsOpen={handleClose}
      panelClass="!max-w-[500px]"
    >
      <div className="px-6 pb-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#402D87] to-[#5B47D4] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="bi:shield-lock-fill" className="text-3xl text-white" />
          </div>
          <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
            Enter Verification Code
          </Text>
          <Text variant="p" className="text-gray-600 text-sm">
            We've sent a verification code to{' '}
            <span className="font-semibold text-gray-900">{userPhone || 'your phone number'}</span>.
            Please enter it below to confirm your redemption.
          </Text>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Controller
              control={form.control}
              name="otp"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <OTPInput
                    length={4}
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value)
                      if (value.length === 4) {
                        // Auto-submit when 4 digits are entered
                        form.handleSubmit(onSubmit)()
                      }
                    }}
                    error={error?.message}
                    inputListClassName="grid grid-cols-4 gap-3 justify-center"
                  />
                  {error && (
                    <Text variant="span" className="text-red-600 text-sm mt-2 block text-center">
                      {error.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon icon="bi:info-circle" className="text-blue-600 text-lg shrink-0 mt-0.5" />
              <div>
                <Text variant="span" weight="medium" className="text-blue-900 block mb-1 text-sm">
                  Security Notice
                </Text>
                <Text variant="span" className="text-blue-700 text-xs block">
                  This code expires in 10 minutes. If you didn't receive the code, please check your
                  messages or try again.
                </Text>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              loading={isLoading}
              disabled={!form.formState.isValid || isLoading}
              className="flex-1"
            >
              Verify & Confirm
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
