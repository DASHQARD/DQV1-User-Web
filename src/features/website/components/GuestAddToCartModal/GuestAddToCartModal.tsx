import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Modal, Button, Text, OTPInput, BasePhoneInput, PhoneFormatHint } from '@/components'
import { getApiErrorMessage } from '@/utils/apiError'
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
  GUEST_PHONE_STORAGE_KEY,
  ROUTES,
  getGuestContactSessionItem,
  setGuestContactSessionItem,
} from '@/utils/constants'
import { useToast } from '@/hooks'
import {
  guestAddToCartContactSchema,
  type GuestAddToCartContactFormData,
} from './guestAddToCartContactSchema'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { setGuestBrowsingAck } from '@/features/website/utils/guestBrowsingSession'
import { ensureGuestSession } from '@/features/website/services/guestSession'
import {
  fulfillGuestOtpGate,
  rejectGuestOtpGate,
  GuestOtpCancelledError,
} from '@/features/website/services/guestOtpGate'
import {
  assertGuestCartAmountWithinLimit,
  GuestCartAmountLimitError,
} from '@/features/website/utils/validateGuestLocalCart'

const OTPSchema = z.object({
  otp: z.string().min(4, 'OTP must be 4 digits').max(4, 'OTP must be 4 digits'),
})

type ContactFormData = GuestAddToCartContactFormData
type OTPFormData = z.infer<typeof OTPSchema>

type Step = 'choice' | 'contact' | 'otp'

export default function GuestAddToCartModal() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isOpen, pendingItem, close } = useGuestAddToCartModalStore()
  const authenticate = useAuthStore((s) => s.authenticate)
  const getGuestCartId = useAuthStore((s) => s.getGuestCartId)
  const getGuestCartUuid = useAuthStore((s) => s.getGuestCartUuid)
  const setGuestCartId = useAuthStore((s) => s.setGuestCartId)
  const setGuestCartUuid = useAuthStore((s) => s.setGuestCartUuid)
  const openCart = useCartStore((s) => s.openCart)

  const [step, setStep] = useState<Step>('choice')
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [submittedPhone, setSubmittedPhone] = useState('')
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(guestAddToCartContactSchema),
    defaultValues: { guest_phone: '' },
  })

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(OTPSchema),
    defaultValues: { otp: '' },
  })

  useEffect(() => {
    if (!isOpen || !pendingItem) return
    if (
      pendingItem.guestLoginOnly ||
      pendingItem.redemptionOnly ||
      pendingItem.cardCreationOtp
    ) {
      setStep('contact')
      const phone =
        useGuestLocalCartStore.getState().contact.phone ??
        getGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY) ??
        ''
      contactForm.reset({ guest_phone: phone })
      otpForm.reset({ otp: '' })
    } else {
      setStep('choice')
      contactForm.reset({ guest_phone: '' })
      otpForm.reset({ otp: '' })
      setSubmittedPhone('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset forms when opening modal / switching item
  }, [isOpen, pendingItem])

  const handleClose = () => {
    if (pendingItem?.cardCreationOtp) {
      rejectGuestOtpGate(new GuestOtpCancelledError())
    }
    setStep('choice')
    contactForm.reset()
    otpForm.reset()
    setSubmittedPhone('')
    close()
  }

  const handleSignIn = () => {
    handleClose()
    navigate(ROUTES.IN_APP.AUTH.LOGIN)
  }

  const handleContinueAsGuest = async () => {
    if (!pendingItem) return
    setGuestBrowsingAck()

    if (pendingItem.redemptionOnly || pendingItem.guestLoginOnly) {
      setStep('contact')
      return
    }

    try {
      await ensureGuestSession()

      if (pendingItem.authOnly) {
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        handleClose()
        toast.success('Continue customizing your card — no sign-in required.')
        return
      }

      if (pendingItem.card_id == null) {
        handleClose()
        toast.success('You can keep browsing and add items to your bag.')
        return
      }

      if (pendingItem.price != null) {
        assertGuestCartAmountWithinLimit(pendingItem.price)
      }

      await ensureGuestCartAndAddCard({
        card_id: String(pendingItem.card_id),
        amount: pendingItem.price,
        getGuestCartId,
        getGuestCartUuid,
        setGuestCartId,
        setGuestCartUuid,
      })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      openCart()
      handleClose()
      toast.success('Added to your bag')
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          err instanceof GuestCartAmountLimitError
            ? err.message
            : 'Could not add this item to your bag.',
        ),
      )
    }
  }

  const onContactSubmit = async (data: ContactFormData) => {
    if (!pendingItem) return
    setIsRequestingOtp(true)
    try {
      await guestAuthOtpRequest({ guest_phone: data.guest_phone })
      setGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY, data.guest_phone)
      setSubmittedPhone(data.guest_phone)
      contactForm.reset({ guest_phone: '' })
      otpForm.reset({ otp: '' })
      setStep('otp')
      toast.success('Verification code sent to your phone')
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Failed to send code. Please try again.'))
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
      const isPostPurchaseOtp =
        pendingItem.redemptionOnly || pendingItem.guestLoginOnly
      const isCardCreationOtp = pendingItem.cardCreationOtp
      authenticate({
        token: accessToken,
        refreshToken: refreshToken ?? null,
        isGuestAuth: true,
        guestOtpVerified: isPostPurchaseOtp || isCardCreationOtp,
      })
      void queryClient.invalidateQueries({ queryKey: ['guest-assigned-cards'] })
      void queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-pro'] })
      void queryClient.invalidateQueries({ queryKey: ['redemptions-amount-dash-go'] })
      setGuestBrowsingAck()
      if (submittedPhone) setGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY, submittedPhone)

      if (pendingItem.redemptionOnly) {
        useGuestAddToCartModalStore.getState().redemptionOnSuccess?.()
        handleClose()
        toast.success("You're signed in. Continue by selecting your vendor.")
        return
      }

      if (pendingItem.guestLoginOnly) {
        queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        handleClose()
        toast.success("You're signed in as a guest.")
        return
      }

      if (pendingItem.cardCreationOtp) {
        fulfillGuestOtpGate(accessToken)
        setStep('choice')
        contactForm.reset()
        otpForm.reset()
        setSubmittedPhone('')
        close()
        toast.success('Phone verified. Syncing your bag…')
        return
      }

      throw new Error('Unexpected guest OTP flow')
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Verification failed. Please try again.'))
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
            ? pendingItem?.cardCreationOtp
              ? 'Verify your phone'
              : pendingItem?.guestLoginOnly
                ? 'Continue as guest'
                : pendingItem?.redemptionOnly
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
                  ? 'Sign in to your account, or continue as guest without creating an account'
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
                    Browse and add to cart — no sign-in required
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
            <p className="pt-2 text-center text-xs leading-relaxed text-gray-500">
              New to DashQard?{' '}
              <Link
                to={ROUTES.IN_APP.AUTH.REGISTER}
                className="font-semibold text-[#402D87] no-underline hover:underline"
              >
                Create a free account
              </Link>{' '}
              for higher limits, bulk gifting, saved recipients, and faster checkout.
            </p>
          </>
        )}

        {step === 'contact' && (
          <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-5">
            <div className="flex items-center gap-3 pb-2">
              <div className="w-10 h-10 rounded-full bg-[#402D87]/10 flex items-center justify-center shrink-0">
                <Icon icon="bi:phone" className="text-[#402D87]" />
              </div>
              <p className="text-sm text-gray-600">
                {pendingItem?.cardCreationOtp
                  ? 'Verify your phone so we can create your custom gift cards at checkout.'
                  : "We'll send a one-time code to your phone number."}
              </p>
            </div>
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

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  pendingItem?.redemptionOnly ||
                  pendingItem?.guestLoginOnly ||
                  pendingItem?.cardCreationOtp
                    ? handleClose()
                    : setStep('choice')
                }
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
                  onClick={() => {
                    contactForm.reset({ guest_phone: submittedPhone })
                    setStep('contact')
                  }}
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
                  Verify & continue
                </Button>
              </div>
            </form>
          </>
        )}

      </div>
    </Modal>
  )
}
