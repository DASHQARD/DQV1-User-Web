import React from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  Input,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  Text,
  BasePhoneInput,
} from '@/components'
import { useCountriesData, userProfile } from '@/hooks'
import { GHANA_BANKS } from '@/assets/data/banks'
import { CreateBranchFormSchema } from '@/utils/schemas'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks'
import { Icon } from '@/libs'
import { useAuth } from '@/features/auth/hooks'
import { ROUTES } from '@/utils/constants'

export default function CreateBranchForm() {
  const navigate = useNavigate()
  const { useGetCountriesService } = useAuth()
  const { data: countries } = useGetCountriesService()
  const { countries: phoneCountries } = useCountriesData()
  const { useGetUserProfileService } = userProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const { useAddBranchService } = useVendorMutations()
  const { mutateAsync: createBranch } = useAddBranchService()

  const isUserActive =
    userProfileData?.status === 'active' ||
    userProfileData?.status === 'verified' ||
    userProfileData?.status === 'approved'
  const isFormDisabled = !isUserActive

  const form = useForm<z.infer<typeof CreateBranchFormSchema>>({
    resolver: zodResolver(CreateBranchFormSchema),
    defaultValues: {
      country: 'Ghana',
      country_code: '01',
      branch_name: '',
      branch_location: '',
      branch_manager_name: '',
      branch_manager_email: '',
      branch_manager_phone: '',
      payment_method: 'mobile_money',
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: '',
      branch: '',
      account_name: '',
      account_number: '',
      sort_code: '',
      swift_code: '',
    },
  })

  const paymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  })

  // Clear payment fields when payment method changes
  React.useEffect(() => {
    if (paymentMethod === 'bank') {
      // Clear mobile money fields when bank is selected
      form.setValue('mobile_money_provider', '', { shouldValidate: false })
      form.setValue('mobile_money_number', '', { shouldValidate: false })
    } else if (paymentMethod === 'mobile_money') {
      // Clear bank fields when mobile money is selected
      form.setValue('bank_name', '', { shouldValidate: false })
      form.setValue('branch', '', { shouldValidate: false })
      form.setValue('account_name', '', { shouldValidate: false })
      form.setValue('account_number', '', { shouldValidate: false })
      form.setValue('sort_code', '', { shouldValidate: false })
      form.setValue('swift_code', '', { shouldValidate: false })
    }
  }, [paymentMethod, form])

  React.useEffect(() => {
    if (countries && !form.getValues('country')) {
      const ghana = countries.find(
        (country: any) =>
          country.id === 1 || country.name === 'Ghana' || country.name?.toLowerCase() === 'ghana',
      )
      if (ghana) {
        form.setValue('country', String(ghana.id))
      }
    }
  }, [countries, form])

  const mobileMoneyProviders = [
    { label: 'MTN Mobile Money', value: 'mtn' },
    { label: 'Vodafone Cash', value: 'vodafone' },
    { label: 'AirtelTigo Money', value: 'airteltigo' },
  ]

  const onSubmit = async (data: z.infer<typeof CreateBranchFormSchema>) => {
    // Prevent submission if user is not active
    if (!isUserActive) {
      return
    }

    try {
      // Remove mobile money fields if payment method is bank
      if (data.payment_method === 'bank') {
        const {
          branch_name,
          branch_location,
          branch_manager_name,
          branch_manager_email,
          branch_manager_phone,
          country,
          country_code,
          payment_method,
          bank_name,
          branch,
          account_name,
          account_number,
          sort_code,
          swift_code,
        } = data
        const bankData = {
          branch_name,
          branch_location,
          branch_manager_name,
          branch_manager_email,
          branch_manager_phone,
          country,
          country_code,
          payment_method,
          bank_name,
          branch,
          account_name,
          account_number,
          sort_code,
          swift_code,
        }
        await createBranch(bankData as typeof data)
      }
      // Remove bank fields if payment method is mobile_money
      else if (data.payment_method === 'mobile_money') {
        const {
          branch_name,
          branch_location,
          branch_manager_name,
          branch_manager_email,
          branch_manager_phone,
          country,
          country_code,
          payment_method,
          mobile_money_provider,
          mobile_money_number,
        } = data
        const mobileMoneyData = {
          branch_name,
          branch_location,
          branch_manager_name,
          branch_manager_email,
          branch_manager_phone,
          country,
          country_code,
          payment_method,
          mobile_money_provider,
          mobile_money_number,
        }
        await createBranch(mobileMoneyData as typeof data)
      } else {
        await createBranch(data)
      }

      // Navigate to branch managers page after successful creation
      navigate(`${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCH_MANAGERS}?account=vendor`)
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Failed to create branch:', error)
    }
  }

  // Show message if user is not active
  if (!isUserActive) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <Icon icon="bi:exclamation-triangle-fill" className="text-3xl text-yellow-600" />
        </div>
        <div className="text-center">
          <Text as="h3" className="text-lg font-semibold text-gray-900 mb-2">
            Account Inactive
          </Text>
          <Text as="p" className="text-sm text-gray-600 max-w-md">
            Your account status is currently <span className="font-semibold">inactive</span>. Please
            contact the administrator to activate your account before creating a branch.
          </Text>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
      {/* Branch Information */}
      <section className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="country"
          render={({ field, fieldState: { error } }) => {
            return (
              <Combobox
                label="Country"
                options={countries?.map((country: any) => ({
                  label: country.name,
                  value: country.name,
                }))}
                value={field.value || undefined}
                error={error?.message}
                placeholder="Select country"
                isDisabled={true}
              />
            )
          }}
        />

        <Input
          label="Branch Name"
          placeholder="Enter branch name"
          {...form.register('branch_name')}
          error={form.formState.errors.branch_name?.message}
          disabled={isFormDisabled}
        />

        <Input
          label="Branch Location"
          placeholder="Enter branch location/address"
          {...form.register('branch_location')}
          error={form.formState.errors.branch_location?.message}
          disabled={isFormDisabled}
        />
      </section>

      {/* Branch Manager Information */}
      <section className="flex flex-col gap-4">
        <Text as="h3" className="text-lg font-semibold text-gray-900">
          Branch Manager Information
        </Text>

        <Input
          label="Branch Manager Name"
          placeholder="Enter manager full name"
          {...form.register('branch_manager_name')}
          error={form.formState.errors.branch_manager_name?.message}
          disabled={isFormDisabled}
        />

        <Input
          label="Branch Manager Email"
          placeholder="Enter manager email"
          type="email"
          {...form.register('branch_manager_email')}
          error={form.formState.errors.branch_manager_email?.message}
          disabled={isFormDisabled}
        />

        <div className="flex flex-col gap-1">
          <Controller
            control={form.control}
            name="branch_manager_phone"
            render={({ field: { onChange } }) => {
              return (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={phoneCountries}
                  maxLength={9}
                  handleChange={onChange}
                  label="Phone Number"
                  error={form.formState.errors.branch_manager_phone?.message}
                />
              )
            }}
          />
          <p className="text-xs text-gray-500">
            Please enter your number in the format: <span className="font-medium">5512345678</span>
          </p>
        </div>
      </section>

      {/* Payment Method */}
      <section className="flex flex-col gap-4 border-t border-gray-200 pt-4">
        <Text as="h3" className="text-lg font-semibold text-gray-900">
          Payment Method
        </Text>

        <>
          <Controller
            control={form.control}
            name="payment_method"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <div className="flex flex-col gap-3">
                <RadioGroup value={value || ''} onValueChange={onChange} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="mobile_money" id="mobile-money" />
                    <Text as="label" htmlFor="mobile-money" className="cursor-pointer">
                      Mobile Money
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Text as="label" htmlFor="bank" className="cursor-pointer">
                      Bank Account
                    </Text>
                  </div>
                </RadioGroup>
                {error && <p className="text-sm text-red-500">{error.message}</p>}
              </div>
            )}
          />

          {/* Mobile Money Fields */}
          {paymentMethod === 'mobile_money' && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <Controller
                control={form.control}
                name="mobile_money_provider"
                render={({ field, fieldState: { error } }) => (
                  <Combobox
                    label="Mobile Money Provider"
                    options={mobileMoneyProviders}
                    {...field}
                    error={error?.message}
                    placeholder="Select provider"
                  />
                )}
              />

              <div className="flex flex-col gap-1">
                <Controller
                  control={form.control}
                  name="mobile_money_number"
                  render={({ field: { onChange } }) => {
                    return (
                      <BasePhoneInput
                        placeholder="Enter number eg. 5512345678"
                        options={phoneCountries}
                        maxLength={9}
                        handleChange={onChange}
                        label="Phone Number"
                        error={form.formState.errors.mobile_money_number?.message}
                      />
                    )
                  }}
                />
                <p className="text-xs text-gray-500">
                  Please enter your number in the format:{' '}
                  <span className="font-medium">5512345678</span>
                </p>
              </div>
            </div>
          )}

          {/* Bank Fields */}
          {paymentMethod === 'bank' && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <Controller
                control={form.control}
                name="bank_name"
                render={({ field, fieldState: { error } }) => (
                  <Combobox
                    label="Bank Name"
                    options={GHANA_BANKS.map((bank) => ({ label: bank.name, value: bank.name }))}
                    {...field}
                    error={error?.message}
                    placeholder="Select bank"
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bank Branch"
                  placeholder="Enter bank branch"
                  {...form.register('branch')}
                  error={form.formState.errors.branch?.message}
                />

                <Input
                  label="Account Number"
                  placeholder="Enter account number"
                  {...form.register('account_number')}
                  error={form.formState.errors.account_number?.message}
                />

                <Input
                  className="col-span-full"
                  label="Account Name"
                  placeholder="Enter account holder name"
                  {...form.register('account_name')}
                  error={form.formState.errors.account_name?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Sort Code"
                  placeholder="Enter sort code"
                  {...form.register('sort_code')}
                  error={form.formState.errors.sort_code?.message}
                />

                <Input
                  label="SWIFT Code"
                  placeholder="Enter SWIFT code"
                  {...form.register('swift_code')}
                  error={form.formState.errors.swift_code?.message}
                />
              </div>
            </div>
          )}
        </>
      </section>

      {/* Submit Button */}
      <div className="flex gap-4 border-t border-gray-200 pt-4">
        <Button
          type="submit"
          variant="secondary"
          disabled={!form.formState.isValid || isFormDisabled}
          // loading={createBranch.isLoading}
          className="w-full"
        >
          Create Branch
        </Button>
      </div>
    </form>
  )
}
