import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Modal, OTPInput, Input, BasePhoneInput, Button } from '@/components'
import { useAuthStore } from '@/stores'
import { axiosClient } from '@/libs/axios'
import LoaderGif from '@/assets/gifs/loader.gif'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/libs/clsx'
import { useCountriesData, useUserProfile } from '@/hooks'
import { Controller } from 'react-hook-form'
import { SettingsSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface PhoneModal {
  show: boolean
  step: 'confirm-current' | 'enter-new' | 'confirm-new'
  current: string
  otpOld: string
  newValue: string
  otpNew: string
  loading: boolean
  error: string
}

interface EmailModal {
  show: boolean
  step: 'confirm-current' | 'enter-new' | 'confirm-new'
  current: string
  otpOld: string
  newValue: string
  otpNew: string
  loading: boolean
  error: string
}

export default function Settings() {
  const navigate = useNavigate()
  const { data: userProfile } = useUserProfile()
  const { logout, reset } = useAuthStore()
  const { countries } = useCountriesData()

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
  })
  const [isLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'success' | 'danger'>('success')

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Name change modal states
  const [showNameChangeModal, setShowNameChangeModal] = useState(false)

  const [submittingNameRequest, setSubmittingNameRequest] = useState(false)
  const [nameRequestError, setNameRequestError] = useState<string | null>(null)
  const [nameRequestSuccess, setNameRequestSuccess] = useState(false)

  // Phone change modal states
  const [phoneModal, setPhoneModal] = useState<PhoneModal>({
    show: false,
    step: 'confirm-current',
    current: userProfile?.phonenumber || '',
    otpOld: '',
    newValue: '',
    otpNew: '',
    loading: false,
    error: '',
  })

  // Email change modal states
  const [emailModal, setEmailModal] = useState<EmailModal>({
    show: false,
    step: 'confirm-current',
    current: userProfile?.email || '',
    otpOld: '',
    newValue: '',
    otpNew: '',
    loading: false,
    error: '',
  })

  // Update profile when user info changes
  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        fullname: userProfile?.fullname || '',
        phonenumber: userProfile?.phonenumber || '',
        email: userProfile?.email || '',
      })
    }
  }, [userProfile, form])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.formState.errors.newPassword) return

    setPasswordLoading(true)
    try {
      await axiosClient.post('/auth/change-password', {
        currentPassword: form.getValues('oldPassword'),
        newPassword: form.getValues('password'),
      })

      setShowLogoutModal(true)
    } catch (error: any) {
      setAlertMessage(error?.message || 'Failed to change password')
      setAlertType('danger')
      setTimeout(() => setAlertMessage(null), 5000)
    } finally {
      setPasswordLoading(false)
    }
  }

  const forceLogout = () => {
    reset()
    logout()
    navigate(ROUTES.IN_APP.AUTH.LOGIN)
  }

  // const handlePinCodeSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (form.formState.errors.newPin?.message) return

  //   setPinLoading(true)
  //   setPinError(null)
  //   setPinShowAlert(true)
  //   try {
  //     await axiosClient.post('/auth/change-pin', {
  //       currentPin: pinCode.old,
  //       newPin: pinCode.new,
  //     })

  //     setPinCode({ old: '', new: '', confirm: '' })
  //     setPinSuccess(true)
  //     setPinError(null)
  //     setTimeout(() => {
  //       setPinSuccess(false)
  //       setPinShowAlert(false)
  //     }, 5000)
  //   } catch (error: any) {
  //     setPinError(error?.message || 'Failed to change PIN code')
  //     setPinSuccess(false)
  //   } finally {
  //     setPinLoading(false)
  //   }
  // }

  const closeNameChangeModal = () => {
    setShowNameChangeModal(false)
    setNameRequestError(null)
    setNameRequestSuccess(false)
  }

  const handleNameChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingNameRequest(true)
    setNameRequestError(null)

    try {
      await axiosClient.post('/auth/name-change-request', {
        currentName: userProfile?.fullname || '',
        requestedName: '',
        reason: '',
      })

      setNameRequestSuccess(true)
      setAlertMessage('Name change request submitted successfully!')
      setAlertType('success')
      setTimeout(() => {
        setAlertMessage(null)
        closeNameChangeModal()
      }, 3000)
    } catch (error: any) {
      setNameRequestError(error?.message || 'Failed to submit name change request')
    } finally {
      setSubmittingNameRequest(false)
    }
  }

  // Phone change modal handlers

  const closePhoneModal = () => {
    setPhoneModal({
      show: false,
      step: 'confirm-current',
      current: '',
      otpOld: '',
      newValue: '',
      otpNew: '',
      loading: false,
      error: '',
    })
  }

  const onSubmit = async (data: z.infer<typeof SettingsSchema>) => {
    try {
      await axiosClient.post('/auth/update-profile', {
        fullname: data.fullname,
        phonenumber: data.phonenumber,
      })
      setAlertMessage('Profile updated successfully!')
      setAlertType('success')
      setTimeout(() => setAlertMessage(null), 5000)
    } catch (error: any) {
      setAlertMessage(error?.message || 'Failed to update profile')
      setAlertType('danger')
      setTimeout(() => setAlertMessage(null), 5000)
    }
  }

  // Calculate PIN mismatch
  // const pinConfirmMismatch = pinCode.new !== pinCode.confirm || !pinCode.new || !pinCode.confirm

  // Mask email function
  const maskEmail = (email: string) => {
    if (!email) return ''
    const [local, domain] = email.split('@')
    if (!domain) return email
    const maskedLocal = local.length > 2 ? local.slice(0, 2) + '*'.repeat(local.length - 2) : local
    return `${maskedLocal}@${domain}`
  }

  // Phone modal handlers
  const handlePhoneNextStep = async () => {
    const modal = phoneModal
    setPhoneModal((prev) => ({ ...prev, error: '', loading: true }))

    try {
      if (modal.step === 'confirm-current') {
        await axiosClient.post('/auth/change-phone/verify-current', {
          currentPhone: modal.current,
          otp: modal.otpOld,
        })
        setPhoneModal((prev) => ({ ...prev, step: 'enter-new', otpOld: '', loading: false }))
      } else if (modal.step === 'enter-new') {
        if (!modal.newValue) {
          throw new Error('Please enter a valid phone number.')
        }
        if (modal.newValue === modal.current) {
          throw new Error('New phone number must be different from current phone number.')
        }

        await axiosClient.post('/auth/change-phone/send-new-otp', {
          currentPhone: modal.current,
          newPhone: modal.newValue,
        })
        setPhoneModal((prev) => ({ ...prev, step: 'confirm-new', loading: false }))
      } else if (modal.step === 'confirm-new') {
        await axiosClient.post('/auth/change-phone/complete', {
          currentPhone: modal.current,
          newPhone: modal.newValue,
          newPhoneOtp: modal.otpNew,
        })

        closePhoneModal()
        setAlertMessage('Phone number changed successfully!')
        setAlertType('success')
        setTimeout(() => setAlertMessage(null), 5000)
      }
    } catch (error: any) {
      setPhoneModal((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'An error occurred. Please try again.',
      }))
    }
  }

  const resendNewPhoneOtp = async () => {
    try {
      setPhoneModal((prev) => ({ ...prev, loading: true, error: '' }))
      await axiosClient.post('/auth/change-phone/send-new-otp', {
        currentPhone: phoneModal.current,
        newPhone: phoneModal.newValue,
      })
      setPhoneModal((prev) => ({ ...prev, loading: false }))
    } catch (error: any) {
      setPhoneModal((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to resend code. Please try again.',
      }))
    }
  }

  const goBackPhone = () => {
    if (phoneModal.step === 'enter-new') {
      setPhoneModal((prev) => ({ ...prev, step: 'confirm-current', newValue: '', error: '' }))
    } else if (phoneModal.step === 'confirm-new') {
      setPhoneModal((prev) => ({ ...prev, step: 'enter-new', otpNew: '', error: '' }))
    }
  }

  const resendNewEmailOtp = async () => {
    try {
      setEmailModal((prev) => ({ ...prev, loading: true, error: '' }))
      await axiosClient.post('/auth/change-email/send-new-otp', {
        currentEmail: emailModal.current,
        newEmail: emailModal.newValue,
      })
      setEmailModal((prev) => ({ ...prev, loading: false }))
    } catch (error: any) {
      setEmailModal((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to resend code. Please try again.',
      }))
    }
  }

  const goBackEmail = () => {
    if (emailModal.step === 'enter-new') {
      setEmailModal((prev) => ({ ...prev, step: 'confirm-current', newValue: '', error: '' }))
    } else if (emailModal.step === 'confirm-new') {
      setEmailModal((prev) => ({ ...prev, step: 'enter-new', otpNew: '', error: '' }))
    }
  }

  const closeEmailModal = () => {
    setEmailModal({
      show: false,
      step: 'confirm-current',
      current: '',
      otpOld: '',
      newValue: '',
      otpNew: '',
      loading: false,
      error: '',
    })
  }

  const handleEmailNextStep = async () => {
    const modal = emailModal
    setEmailModal((prev) => ({ ...prev, error: '', loading: true }))

    try {
      if (modal.step === 'confirm-current') {
        await axiosClient.post('/auth/change-email/verify-current', {
          currentEmail: modal.current,
          otp: modal.otpOld,
        })
        setEmailModal((prev) => ({ ...prev, step: 'enter-new', otpOld: '', loading: false }))
      } else if (modal.step === 'enter-new') {
        if (!modal.newValue || !isValidEmail(modal.newValue)) {
          throw new Error('Please enter a valid email address.')
        }
        if (modal.newValue.toLowerCase() === modal.current.toLowerCase()) {
          throw new Error('New email address must be different from current email address.')
        }

        await axiosClient.post('/auth/change-email/send-new-otp', {
          currentEmail: modal.current,
          newEmail: modal.newValue,
        })
        setEmailModal((prev) => ({ ...prev, step: 'confirm-new', loading: false }))
      } else if (modal.step === 'confirm-new') {
        await axiosClient.post('/auth/change-email/complete', {
          currentEmail: modal.current,
          newEmail: modal.newValue,
          newEmailOtp: modal.otpNew,
        })

        closeEmailModal()
        setAlertMessage('Email address changed successfully!')
        setAlertType('success')
        setTimeout(() => setAlertMessage(null), 5000)
      }
    } catch (error: any) {
      setEmailModal((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'An error occurred. Please try again.',
      }))
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl">
        <div className="text-center">
          <img src={LoaderGif} alt="Loading..." className="w-20 h-auto mx-auto mb-5" />
          <p className="text-gray-500 text-base">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[600px] bg-gray-50 rounded-xl overflow-hidden">
      <div className="bg-white min-h-[600px] flex flex-col px-4 sm:px-8 pb-10">
        {/* Header Section */}
        <div className="mb-8 pt-8 pb-8 border-b border-gray-200">
          <div className="flex justify-between items-start flex-wrap gap-5">
            <div>
              <h2 className="text-3xl font-bold text-[#2c3e50] mb-2 flex items-center">
                <Icon icon="bi:gear-fill" className="mr-3 text-[#402D87]" />
                Account Settings
              </h2>
              <p className="text-base text-gray-500">
                Manage your account information and security settings
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {alertMessage && (
          <div className="mb-6">
            <div
              className={cn(
                'border-none rounded-xl py-4 px-5 font-medium shadow-md flex items-center gap-3',
                alertType === 'success'
                  ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-l-4 border-green-600'
                  : 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-l-4 border-red-600',
              )}
            >
              <Icon
                icon={
                  alertType === 'success' ? 'bi:check-circle-fill' : 'bi:exclamation-triangle-fill'
                }
                className="text-lg"
              />
              {alertMessage}
            </div>
          </div>
        )}

        {/* Settings Section */}
        <div className="flex-1">
          {/* Personal Details Section */}
          <div className="mb-10">
            <h4 className="text-xl font-semibold text-[#2c3e50] mb-4 pb-3 border-b-2 border-gray-200 flex items-center">
              <Icon icon="bi:person-badge" className="mr-2 text-[#402D87] text-lg" />
              Personal Details
            </h4>

            {/* Profile Settings Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-6 border-b border-gray-200">
                <h5 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
                  <Icon icon="bi:person-circle" className="mr-2 text-[#402D87]" />
                  Personal Information
                </h5>
                <p className="text-gray-500 text-sm">
                  Update your personal details and contact information
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <h6 className="text-base font-semibold text-gray-700 mb-5 pb-2 border-b-2 border-gray-200 flex items-center">
                      <span className="w-1 h-4 bg-[#402D87] mr-2"></span>
                      Basic Information
                    </h6>

                    <Input
                      {...form.register('fullname')}
                      disabled
                      readOnly
                      placeholder="Enter your full name"
                      className="w-full"
                    />

                    <Input
                      type="email"
                      {...form.register('email')}
                      disabled
                      readOnly
                      placeholder="Enter your email"
                      className="w-full"
                      innerClassName="pr-12"
                    />

                    <Controller
                      control={form.control}
                      name="phonenumber"
                      render={({ field: { value, onChange } }) => {
                        return (
                          <BasePhoneInput
                            placeholder="Enter number eg. 5512345678"
                            options={countries}
                            selectedVal={value}
                            maxLength={10}
                            handleChange={onChange}
                            label="Phone Number"
                            error={form.formState.errors.phonenumber?.message}
                          />
                        )
                      }}
                    />
                  </div>
                  <div className="flex gap-2 py-4 border-t border-gray-200">
                    <Button type="submit" variant="secondary">
                      Save
                    </Button>
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Security Settings Section */}
          <div className="mb-10">
            <h4 className="text-xl font-semibold text-[#2c3e50] mb-4 pb-3 border-b-2 border-gray-200 flex items-center">
              <Icon icon="bi:shield-lock" className="mr-2 text-[#402D87] text-lg" />
              Security Settings
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 border-t-4 border-t-[#402D87] overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5">
                <div className="bg-gray-50 px-6 py-6 border-b border-gray-200">
                  <h5 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
                    <Icon icon="bi:key" className="mr-2 text-[#402D87]" />
                    Password
                  </h5>
                  <p className="text-gray-500 text-sm">Change your account password</p>
                </div>

                <div className="p-6">
                  <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="Enter current password"
                      {...form.register('oldPassword')}
                      error={form.formState.errors.oldPassword?.message}
                      className="w-full"
                    />

                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      {...form.register('password')}
                      error={form.formState.errors.password?.message}
                      className="w-full"
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                      {...form.register('newPassword')}
                      error={form.formState.errors.newPassword?.message}
                      className="w-full"
                    />

                    <div className="mt-8 pt-5 border-t border-gray-200">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-br from-[#402D87] to-[#5a4fcf] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={passwordLoading || !!form.formState.errors.newPassword?.message}
                      >
                        {passwordLoading ? (
                          <span className="flex items-center justify-center">
                            <Icon icon="mdi:loading" className="animate-spin mr-2" />
                            Changing...
                          </span>
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* PIN Code Card */}
              {/* <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 border-t-4 border-t-blue-500 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5">
                <div className="bg-gray-50 px-6 py-6 border-b border-gray-200">
                  <h5 className="text-xl font-semibold text-gray-700 mb-2 flex items-center">
                    <Icon icon="bi:123" className="mr-2 text-[#402D87]" />
                    PIN Code
                  </h5>
                  <p className="text-gray-500 text-sm">Change your transaction PIN code</p>
                </div>

                <div className="p-6">
                  {pinShowAlert && (pinError || pinSuccess) && (
                    <div
                      className={cn(
                        'mb-4 rounded-xl py-4 px-5 font-medium shadow-md flex items-center gap-3',
                        pinSuccess
                          ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-l-4 border-green-600'
                          : 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-l-4 border-red-600',
                      )}
                    >
                      <Icon
                        icon={pinSuccess ? 'bi:check-circle-fill' : 'bi:exclamation-triangle-fill'}
                        className="text-lg"
                      />
                      {pinSuccess ? 'PIN code changed successfully!' : pinError}
                    </div>
                  )}

                  <form onSubmit={handlePinCodeSubmit} className="flex flex-col gap-4">
                    <Input
                      label="Current PIN Code"
                      type="password"
                      placeholder="Enter current PIN code"
                      value={pinCode.old}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPinCode((prev) => ({ ...prev, old: e.target.value }))
                      }
                      className="w-full"
                    />

                    <Input
                      label="New PIN Code"
                      type="password"
                      placeholder="Enter new PIN code"
                      value={pinCode.new}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPinCode((prev) => ({ ...prev, new: e.target.value }))
                      }
                      className="w-full"
                    />

                    <Input
                      label="Confirm New PIN Code"
                      type="password"
                      placeholder="Confirm new PIN code"
                      value={pinCode.confirm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPinCode((prev) => ({ ...prev, confirm: e.target.value }))
                      }
                      error={pinConfirmMismatch ? 'PIN codes do not match' : undefined}
                      className="w-full"
                    />

                    <div className="mt-8 pt-5 border-t border-gray-200">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-br from-[#402D87] to-[#5a4fcf] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={pinLoading || pinConfirmMismatch}
                      >
                        {pinLoading ? (
                          <span className="flex items-center justify-center">
                            <Icon icon="mdi:loading" className="animate-spin mr-2" />
                            Changing...
                          </span>
                        ) : (
                          'Change PIN Code'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        setIsOpen={setShowLogoutModal}
        showClose={false}
        position="center"
        panelClass="max-w-md w-full"
      >
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-700 mb-3">Security Notice</h5>
          <p className="text-gray-600 mb-6">
            Your password was changed successfully.
            <br />
            You must log in again to continue.
          </p>
          <div className="flex justify-end">
            <button
              onClick={forceLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
            >
              Log Out Now
            </button>
          </div>
        </div>
      </Modal>

      {/* Name Change Request Modal */}
      <Modal
        isOpen={showNameChangeModal}
        setIsOpen={setShowNameChangeModal}
        showClose
        position="center"
        panelClass="max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200 flex items-center gap-5 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-[#402D87] flex items-center justify-center shrink-0 shadow-lg">
              <Icon icon="bi:person-badge" className="text-xl text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-800 m-0 mb-1">Name Change Request</h4>
              <p className="text-sm text-gray-500 m-0">Update your personal information</p>
            </div>
          </div>

          {nameRequestSuccess ? (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 animate-bounce">
                <Icon icon="bi:check-circle-fill" className="text-5xl text-white" />
              </div>
              <h5 className="text-2xl font-bold text-gray-800 mb-3">
                Request Submitted Successfully!
              </h5>
              <p className="text-gray-600 mb-8 max-w-md">
                Your name change request has been submitted to the administrator. You will be
                contacted shortly with an update.
              </p>
              <button
                onClick={closeNameChangeModal}
                className="bg-gradient-to-br from-[#402D87] to-[#5a4fcf] text-white px-8 py-3 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Got it
              </button>
            </div>
          ) : (
            <form onSubmit={handleNameChangeSubmit} className="flex flex-col flex-1">
              <div className="p-8 overflow-y-auto flex-1">
                {nameRequestError && (
                  <div className="mb-6 rounded-xl py-4 px-5 bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-l-4 border-red-600 flex items-start gap-4">
                    <Icon icon="bi:exclamation-triangle-fill" className="text-xl shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1">Error</strong>
                      <p className="text-sm m-0">{nameRequestError}</p>
                    </div>
                  </div>
                )}

                <div className="mb-6 rounded-xl py-4 px-5 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 border-l-4 border-blue-600 flex items-start gap-4">
                  <Icon icon="bi:info-circle-fill" className="text-xl shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Instructions</strong>
                    <p className="text-sm m-0">
                      Please provide your new name and an optional reason for the change. Your
                      request will be reviewed by our team.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2 text-sm flex items-center">
                      <Icon icon="bi:person" className="mr-2 text-[#402D87]" />
                      Current Name
                    </label>
                    <Input
                      value={userProfile?.fullname || ''}
                      disabled
                      readOnly
                      className="w-full"
                      innerClassName="bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2 text-sm flex items-center">
                      <Icon icon="bi:pencil" className="mr-2 text-[#402D87]" />
                      New Name <span className="text-red-600 ml-1">*</span>
                    </label>
                    <Input
                      {...form.register('name')}
                      placeholder="Enter your new name"
                      disabled={submittingNameRequest}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2 text-sm flex items-center">
                    <Icon icon="bi:chat-text" className="mr-2 text-[#402D87]" />
                    Reason for Change{' '}
                    <span className="text-gray-500 font-normal text-xs ml-1">(Optional)</span>
                  </label>
                  <Input
                    type="textarea"
                    {...form.register('reason')}
                    placeholder="Please explain why you want to change your name (optional)"
                    disabled={submittingNameRequest}
                    className="w-full"
                    innerClassName="min-h-[100px]"
                  />
                  <small className="text-xs text-gray-500 mt-1 block">
                    Providing a reason can help expedite your request.
                  </small>
                </div>
              </div>

              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-3 justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={closeNameChangeModal}
                  disabled={submittingNameRequest}
                  className="bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold text-base transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNameRequest || !form.formState.isValid}
                  className="bg-gradient-to-br from-[#402D87] to-[#5a4fcf] text-white px-8 py-3 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submittingNameRequest ? (
                    <span className="flex items-center">
                      <Icon icon="mdi:loading" className="animate-spin mr-2" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Phone Change Modal */}
      <Modal
        isOpen={phoneModal.show}
        setIsOpen={(open) => !open && closePhoneModal()}
        showClose
        position="center"
        panelClass="max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-8 text-center border-b border-gray-200 flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-[#402D87] flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Icon icon="bi:phone" className="text-3xl text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">Change Phone Number</h4>
            <p className="text-gray-600 text-sm">
              {phoneModal.step === 'confirm-current' &&
                "We've sent a verification code to your current phone number"}
              {phoneModal.step === 'enter-new' && 'Enter your new phone number below'}
              {phoneModal.step === 'confirm-new' &&
                "We've sent a verification code to your new phone number"}
            </p>
          </div>

          <div className="p-8 overflow-y-auto flex-1">
            {phoneModal.error && (
              <div className="mb-6 rounded-xl py-4 px-5 bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-l-4 border-red-600 flex items-start gap-4">
                <Icon icon="bi:exclamation-triangle-fill" className="text-xl shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-1">Error</strong>
                  <p className="text-sm m-0">{phoneModal.error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Confirm Current Phone */}
            {phoneModal.step === 'confirm-current' && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-8 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-[#402D87] flex items-center justify-center mb-4">
                    <Icon icon="bi:phone-fill" className="text-2xl text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Current Phone Number
                  </span>
                  <span className="font-mono text-base font-medium text-gray-800">
                    {userProfile?.phonenumber}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center">
                    <OTPInput
                      value={phoneModal.otpOld}
                      onChange={(otp) => setPhoneModal((prev) => ({ ...prev, otpOld: otp }))}
                      length={4}
                      inputType="text"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-0">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={() => {}}
                      disabled={phoneModal.loading}
                      className="text-[#402D87] font-semibold underline hover:text-[#2d2060] disabled:text-gray-400 disabled:no-underline"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Enter New Phone */}
            {phoneModal.step === 'enter-new' && (
              <div>
                <div className="mb-5">
                  <label className="block font-semibold text-gray-700 mb-2 text-sm flex items-center">
                    <Icon icon="bi:phone" className="mr-2 text-[#402D87]" />
                    New Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={phoneModal.newValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPhoneModal((prev) => ({ ...prev, newValue: e.target.value }))
                    }
                    placeholder="Enter new phone number (e.g., +1234567890)"
                    className="w-full"
                  />
                  <small className="text-xs text-gray-500 mt-1 block">
                    Please include country code (e.g., +1 for US/Canada)
                  </small>
                </div>
              </div>
            )}

            {/* Step 3: Confirm New Phone */}
            {phoneModal.step === 'confirm-new' && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-[#402D87]/5 to-blue-50 border-2 border-[#402D87] rounded-2xl p-6 mb-8 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-[#402D87] flex items-center justify-center mb-4">
                    <Icon icon="bi:phone-fill" className="text-2xl text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    New Phone Number
                  </span>
                  <span className="font-mono text-base font-medium text-gray-800">
                    {phoneModal.newValue || ''}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center">
                    <OTPInput
                      value={phoneModal.otpNew}
                      onChange={(otp) => setPhoneModal((prev) => ({ ...prev, otpNew: otp }))}
                      length={4}
                      inputType="text"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-0">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={resendNewPhoneOtp}
                      disabled={phoneModal.loading}
                      className="text-[#402D87] font-semibold underline hover:text-[#2d2060] disabled:text-gray-400 disabled:no-underline"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
            {phoneModal.step !== 'confirm-current' && (
              <button
                onClick={goBackPhone}
                disabled={phoneModal.loading}
                className="bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold text-base transition-all disabled:opacity-50 flex items-center"
              >
                <Icon icon="bi:arrow-left" className="mr-2" />
                Back
              </button>
            )}
            <button
              onClick={handlePhoneNextStep}
              disabled={
                phoneModal.loading ||
                (phoneModal.step === 'confirm-current' && phoneModal.otpOld.length !== 4) ||
                (phoneModal.step === 'enter-new' && !phoneModal.newValue) ||
                (phoneModal.step === 'confirm-new' && phoneModal.otpNew.length !== 4)
              }
              className="flex-1 bg-gradient-to-br from-[#402D87] to-[#5a4fcf] text-white px-6 py-3 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {phoneModal.loading ? (
                <Icon icon="mdi:loading" className="animate-spin mr-2" />
              ) : null}
              {phoneModal.step === 'confirm-new' ? 'Save' : 'Next'}
              {!phoneModal.loading && phoneModal.step !== 'confirm-new' && (
                <Icon icon="bi:arrow-right" className="ml-2" />
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Email Change Modal */}
      <Modal
        isOpen={emailModal.show}
        setIsOpen={(open) => !open && closeEmailModal()}
        showClose
        position="center"
        panelClass="max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-8 text-center border-b border-gray-200 flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Icon icon="bi:envelope" className="text-3xl text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">Change Email Address</h4>
            <p className="text-gray-600 text-sm">
              {emailModal.step === 'confirm-current' &&
                "We've sent a verification code to your current email address"}
              {emailModal.step === 'enter-new' && 'Enter your new email address below'}
              {emailModal.step === 'confirm-new' &&
                "We've sent a verification code to your new email address"}
            </p>
          </div>

          <div className="p-8 overflow-y-auto flex-1">
            {emailModal.error && (
              <div className="mb-6 rounded-xl py-4 px-5 bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-l-4 border-red-600 flex items-start gap-4">
                <Icon icon="bi:exclamation-triangle-fill" className="text-xl shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-1">Error</strong>
                  <p className="text-sm m-0">{emailModal.error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Confirm Current Email */}
            {emailModal.step === 'confirm-current' && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-8 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center mb-4">
                    <Icon icon="bi:envelope-fill" className="text-2xl text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Current Email Address
                  </span>
                  <span className="font-mono text-sm font-medium text-gray-800">
                    {userProfile?.email}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center">
                    <OTPInput
                      value={emailModal.otpOld}
                      onChange={(otp) => setEmailModal((prev) => ({ ...prev, otpOld: otp }))}
                      length={4}
                      inputType="text"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-0">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={() => {}}
                      disabled={emailModal.loading}
                      className="text-[#402D87] font-semibold underline hover:text-[#2d2060] disabled:text-gray-400 disabled:no-underline"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Enter New Email */}
            {emailModal.step === 'enter-new' && (
              <div>
                <div className="mb-5">
                  <label className="block font-semibold text-gray-700 mb-2 text-sm flex items-center">
                    <Icon icon="bi:envelope" className="mr-2 text-[#402D87]" />
                    New Email Address
                  </label>
                  <Input
                    type="email"
                    value={emailModal.newValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmailModal((prev) => ({ ...prev, newValue: e.target.value }))
                    }
                    placeholder="Enter your new email address"
                    className="w-full"
                  />
                  <small className="text-xs text-gray-500 mt-1 block">
                    Make sure you have access to this email address
                  </small>
                </div>
              </div>
            )}

            {/* Step 3: Confirm New Email */}
            {emailModal.step === 'confirm-new' && (
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-2xl p-6 mb-8 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center mb-4">
                    <Icon icon="bi:envelope-fill" className="text-2xl text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    New Email Address
                  </span>
                  <span className="font-mono text-sm font-medium text-gray-800">
                    {maskEmail(emailModal.newValue)}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide text-center">
                    Enter verification code
                  </label>
                  <div className="flex justify-center">
                    <OTPInput
                      value={emailModal.otpNew}
                      onChange={(otp) => setEmailModal((prev) => ({ ...prev, otpNew: otp }))}
                      length={4}
                      inputType="text"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-0">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={resendNewEmailOtp}
                      disabled={emailModal.loading}
                      className="text-[#402D87] font-semibold underline hover:text-[#2d2060] disabled:text-gray-400 disabled:no-underline"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
            {emailModal.step !== 'confirm-current' && (
              <button
                onClick={goBackEmail}
                disabled={emailModal.loading}
                className="bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold text-base transition-all disabled:opacity-50 flex items-center"
              >
                <Icon icon="bi:arrow-left" className="mr-2" />
                Back
              </button>
            )}
            <button
              onClick={handleEmailNextStep}
              disabled={emailModal.loading || !form.formState.isValid}
              className="flex-1 bg-gradient-to-br from-[#402D87] to-[#5a4fcf] text-white px-6 py-3 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {emailModal.loading ? (
                <Icon icon="mdi:loading" className="animate-spin mr-2" />
              ) : null}
              Save
              {!emailModal.loading && emailModal.step !== 'confirm-new' && (
                <Icon icon="bi:arrow-right" className="ml-2" />
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
