import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Modal, Button, Text, Input, OTPInput, BasePhoneInput, PhoneFormatHint } from '@/components'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import { Icon } from '@/libs'
import { useGuestAddToCartModalStore, useAuthStore } from '@/stores'
import { useCartStore } from '@/stores/cart'
import {
  guestAuthOtpRequest,
  guestAuthOtpVerify,
} from '@/features/auth/services'
import { ensureGuestCartAndAddCard } from '@/features/website/services/cards'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
  ROUTES,
  getGuestContactSessionItem,
  setGuestContactSessionItem,
} from '@/utils/constants'
import { useToast } from '@/hooks'
import { isValidEmailAddress } from '@/utils/schemas/shared'

const ContactSchema = z.object({
  guest_name: z.string().trim().min(1, 'Name is required'),
  guest_phone: z.string().min(1, 'Phone number is required'),
  email: z.string().refine((val) => isValidEmailAddress(val), {
    message: 'Please enter a valid email address',
  }),
})

const OTPSchema = z.object({
  otp: z.string().min(4, 'OTP must be 4 digits').max(4, 'OTP must be 4 digits'),
})

type ContactFormData = z.infer<typeof ContactSchema>
type OTPFormData = z.infer<typeof OTPSchema>

type Step = 'choice' | 'contact' | 'otp'

export default function GuestAddToCartModal() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen, pendingItem, close } = useGuestAddToCartModalStore()
  const authenticate = useAuthStore((s) => s.authenticate)
  const getGuestCartId = useAuthStore((s) => s.getGuestCartId)
  const setGuestCartId = useAuthStore((s) => s.setGuestCartId)
  const openCart = useCartStore((s) => s.openCart)

  const [step, setStep] = useState<Step>('choice')
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [submittedPhone, setSubmittedPhone] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
    defaultValues: { guest_name: '', guest_phone: '', email: '' },
  })

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: '' },
  })

  useEffect(() => {
    if (!isOpen || !pendingItem) return
    if (pendingItem.redemptionOnly) {
      setStep('contact')
      const phone = getGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY) ?? ''
      contactForm.reset({
        guest_name: getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY) ?? '',
        guest_phone: phone,
        email: getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY) ?? '',
      })
      otpForm.reset({ otp: '' })
    } else {
      setStep('choice')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset forms when opening modal / switching item
  }, [isOpen, pendingItem])

  const handleClose = () => {
    setStep('choice')
    contactForm.reset()
    otpForm.reset()
    setSubmittedPhone('')
    setGuestName('')
    setGuestEmail('')
    close()
  }

  const handleSignIn = () => {
    handleClose()
    navigate(ROUTES.IN_APP.AUTH.LOGIN)
  }

  const handleContinueAsGuest = () => {
    setStep('contact')
  }

  const onContactSubmit = async (data: ContactFormData) => {
    if (!pendingItem) return
    setIsRequestingOtp(true)
    try {
      await guestAuthOtpRequest({ guest_phone: data.guest_phone })
      setGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY, data.email)
      setGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY, data.guest_phone)
      setGuestName(data.guest_name)
      setGuestEmail(data.email)
      setSubmittedPhone(data.guest_phone)
      setStep('otp')
      toast.success('Verification code sent to your phone')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send code. Please try again.')
    } finally {
      setIsRequestingOtp(false)
    }
  }

  const onOtpSubmit = async (data: OTPFormData) => {
    if (!pendingItem) return
    setIsVerifyingOtp(true)
    try {
      if (!submittedPhone) {
        toast.error('Phone number is missing. Go back and send the code again.')
        setIsVerifyingOtp(false)
        return
      }
      const response = await guestAuthOtpVerify({
        otp: data.otp,
        guest_phone: submittedPhone,
      })
      const verifyData = response?.data ?? response
      const accessToken =
        verifyData?.access_token ??
        verifyData?.accessToken ??
        verifyData?.tokens?.access_token ??
        verifyData?.tokens?.accessToken
      const refreshToken =
        verifyData?.refresh_token ??
        verifyData?.refreshToken ??
        verifyData?.tokens?.refresh_token ??
        verifyData?.tokens?.refreshToken
      if (!accessToken) {
        throw new Error('Invalid response from server')
      }
      authenticate({
        token: accessToken,
        refreshToken: refreshToken ?? null,
        isGuestAuth: true,
      })
      if (guestName) setGuestContactSessionItem(GUEST_NAME_STORAGE_KEY, guestName)
      if (submittedPhone) setGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY, submittedPhone)

      if (pendingItem.redemptionOnly) {
        useGuestAddToCartModalStore.getState().redemptionOnSuccess?.()
        handleClose()
        toast.success("You're signed in. Continue by selecting your vendor.")
        return
      }

      if (pendingItem.authOnly) {
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        handleClose()
        toast.success("You're signed in. You can continue customizing your card.")
        return
      }

      if (pendingItem.card_id == null) {
        throw new Error('Missing card')
      }

      await ensureGuestCartAndAddCard({
        card_id: String(pendingItem.card_id),
        guest_name: guestName,
        guest_email: guestEmail,
        getGuestCartId,
        setGuestCartId,
      })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      openCart()
      handleClose()
      toast.success('Item added to cart')
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed. Please try again.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => !open && handleClose()}
      title={
        step === 'choice'
          ? pendingItem?.authOnly
            ? 'Continue'
            : 'Add to cart'
          : step === 'contact'
            ? pendingItem?.redemptionOnly
              ? 'Verify your details'
              : 'Continue as guest'
            : 'Verify your phone'
      }
      panelClass="!max-w-md max-md:!max-w-[94vw] max-md:!my-4 max-md:max-h-[calc(100dvh-2rem)] max-md:overflow-y-auto"
    >
      <div className="px-6 py-6 max-md:px-4 max-md:py-5">
        {step === 'choice' && !pendingItem?.redemptionOnly && (
          <>
            <div className="text-center mb-8 max-md:mb-6">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#402D87] to-[#7950ed] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#402D87]/20">
                <Icon
                  icon={pendingItem?.authOnly ? 'bi:gift' : 'bi:bag-plus'}
                  className="text-2xl text-white"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {pendingItem?.authOnly ? 'Create your custom card' : 'Add to cart'}
              </h3>
              <p className="text-sm text-gray-500">
                {pendingItem?.authOnly
                  ? 'Sign in or continue as guest to customize your gift card'
                  : 'Choose how you’d like to continue'}
              </p>
            </div>
            <div className="space-y-3 max-md:space-y-2.5">
              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="w-full flex items-center gap-4 p-4 max-md:p-3.5 rounded-xl border-2 border-transparent bg-linear-to-br from-[#402D87]/10 to-[#7950ed]/10 hover:from-[#402D87]/15 hover:to-[#7950ed]/15 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#402D87]/50 focus-visible:ring-offset-2"
              >
                <div className="w-10 h-10 rounded-full bg-[#402D87]/20 flex items-center justify-center shrink-0">
                  <Icon icon="bi:person" className="text-lg text-[#402D87]" />
                </div>
                <div className="min-w-0">
                  <span className="block font-medium text-gray-900">Continue as guest</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Quick checkout with phone verification
                  </span>
                </div>
                <Icon icon="bi:chevron-right" className="text-gray-400 shrink-0 ml-auto" />
              </button>
              <button
                type="button"
                onClick={handleSignIn}
                className="w-full flex items-center gap-4 p-4 max-md:p-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon icon="bi:box-arrow-in-right" className="text-lg text-gray-600" />
                </div>
                <div className="min-w-0">
                  <span className="block font-medium text-gray-900">Sign in to my account</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Use your existing account
                  </span>
                </div>
                <Icon icon="bi:chevron-right" className="text-gray-400 shrink-0 ml-auto" />
              </button>
            </div>
          </>
        )}

        {step === 'contact' && (
          <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-5">
            <div className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                <Icon icon="bi:phone" className="text-[#402D87]" />
              </div>
              <p className="text-sm text-gray-600">
                We’ll send a one-time code to your phone. Your email is saved for later.
              </p>
            </div>
            <Input
              label="Full name"
              id="guest-name"
              type="text"
              {...contactForm.register('guest_name')}
              error={contactForm.formState.errors.guest_name?.message}
              placeholder="Your name"
              className="w-full"
              isRequired
            />
            <Controller
              control={contactForm.control}
              name="guest_phone"
              render={({ field: { onChange, value } }) => (
                <BasePhoneInput
                  label="Phone number"
                  isRequired
                  placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                  selectedVal={value}
                  handleChange={onChange}
                  error={contactForm.formState.errors.guest_phone?.message} hint={<PhoneFormatHint />}
                />
              )}
            />

            <Input
              label="Email"
              id="guest-email"
              type="email"
              {...contactForm.register('email')}
              error={contactForm.formState.errors.email?.message}
              placeholder="you@example.com"
              className="w-full"
              isRequired
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => (pendingItem?.redemptionOnly ? handleClose() : setStep('choice'))}
                disabled={isRequestingOtp}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={isRequestingOtp}
                disabled={isRequestingOtp}
                className="flex-1 bg-linear-to-r from-[#402D87] to-[#7950ed] hover:from-[#402D87]/90 hover:to-[#7950ed]/90 text-white border-0"
              >
                Send code
              </Button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                <Icon icon="bi:shield-check" className="text-[#402D87]" />
              </div>
              <p className="text-sm text-gray-600">
                Enter the 4-digit code sent to{' '}
                <span className="font-semibold text-gray-900">{submittedPhone}</span>
              </p>
            </div>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
              <Controller
                control={otpForm.control}
                name="otp"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <OTPInput
                      length={4}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        if (value.length === 4) {
                          otpForm.handleSubmit(onOtpSubmit)()
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
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('contact')}
                  disabled={isVerifyingOtp}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={isVerifyingOtp}
                  disabled={!otpForm.formState.isValid || isVerifyingOtp}
                  className="flex-1 bg-linear-to-r from-[#402D87] to-[#7950ed] hover:from-[#402D87]/90 hover:to-[#7950ed]/90 text-white border-0"
                >
                  {pendingItem?.redemptionOnly
                    ? 'Verify & continue'
                    : pendingItem?.authOnly
                      ? 'Verify & continue'
                      : 'Verify & add to cart'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  )
}
