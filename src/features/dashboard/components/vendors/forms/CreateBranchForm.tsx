import React from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Button,
  Input,
  Combobox,
  RadioGroup,
  RadioGroupItem,
  Text,
  BasePhoneInput,
  // Checkbox,
} from '@/components'
import { useAuth } from '@/features/auth/hooks'
import { useCountriesData, userProfile } from '@/hooks'
import { GHANA_BANKS } from '@/assets/data/banks'
import { CreateBranchFormSchema } from '@/utils/schemas'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks'
import { Icon } from '@/libs'

export default function CreateBranchForm() {
  const { useGetCountriesService } = useAuth()
  const { data: countries } = useGetCountriesService()
  const { countries: countriesData } = useCountriesData()
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
      country: '',
      country_code: '',
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

  const selectedCountryId = form.watch('country')

  // Update country_code when country changes
  React.useEffect(() => {
    if (selectedCountryId && countries) {
      const selectedCountry = countries.find(
        (c: any) => String(c.id) === selectedCountryId || c.name === selectedCountryId,
      )
      if (selectedCountry) {
        const countryCode = selectedCountry.code || selectedCountry.iso_code || ''
        form.setValue('country_code', countryCode, { shouldValidate: true })
      }
    } else if (!selectedCountryId) {
      form.setValue('country_code', '', { shouldValidate: true })
    }
  }, [selectedCountryId, countries, form])

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

  // React.useEffect(() => {
  //   if (sameAsCorporate && userProfile) {
  //     if (userProfile.momo_accounts?.length) {
  //       const momoAccount = userProfile.momo_accounts[0]
  //       const digitsOnly = momoAccount.momo_number ? momoAccount.momo_number.replace(/\D/g, '') : ''
  //       let localNumber = digitsOnly
  //       if (digitsOnly.startsWith('233')) {
  //         localNumber = digitsOnly.slice(3)
  //       }
  //       const formattedNumber = localNumber ? `+233-${localNumber}` : ''

  //       form.setValue('payment_method', 'mobile_money')
  //       form.setValue('mobile_money_provider', momoAccount.provider || '')
  //       form.setValue('mobile_money_number', formattedNumber)
  //     }
  //     // Check if user has bank accounts
  //     else if (userProfile.bank_accounts?.length) {
  //       const bankAccount = userProfile.bank_accounts[0]
  //       form.setValue('payment_method', 'bank')
  //       form.setValue('bank_name', bankAccount.bank_name || '')
  //       form.setValue('account_number', bankAccount.account_number || '')
  //       form.setValue('account_name', bankAccount.account_holder_name || '')
  //       form.setValue('sort_code', bankAccount.sort_code || '')
  //       form.setValue('swift_code', bankAccount.swift_code || '')
  //     }
  //   } else if (!sameAsCorporate) {
  //     // Clear payment fields when unchecked
  //     form.setValue('payment_method', '')
  //     form.setValue('mobile_money_provider', '')
  //     form.setValue('mobile_money_number', '')
  //     form.setValue('bank_name', '')
  //     form.setValue('account_number', '')
  //     form.setValue('account_name', '')
  //     form.setValue('sort_code', '')
  //     form.setValue('swift_code', '')
  //   }
  // }, [sameAsCorporate, userProfile, form])

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

    console.log('submitted data', data)

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
        mobile_money_number: mobile_money_number?.replace('+233', '0'),
      }
      await createBranch(mobileMoneyData as typeof data)
    } else {
      await createBranch(data)
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
          render={({ field, fieldState: { error } }) => (
            <Combobox
              label="Country"
              options={
                countries?.map((country: any) => ({
                  label: country.name,
                  value: country.name,
                })) || []
              }
              value={field.value || undefined}
              onChange={(e: { target: { value: string } }) => {
                field.onChange(e.target.value || '')
              }}
              error={error?.message}
              placeholder="Select country"
              isSearchable={true}
              isDisabled={isFormDisabled}
            />
          )}
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

        <Controller
          control={form.control}
          name="branch_manager_phone"
          render={({ field: { value, onChange } }) => (
            <BasePhoneInput
              placeholder="Enter branch manager phone number"
              options={countriesData}
              selectedVal={value}
              maxLength={10}
              handleChange={onChange}
              label="Branch Manager Phone Number"
              error={form.formState.errors.branch_manager_phone?.message}
            />
          )}
        />
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

              <Controller
                control={form.control}
                name="mobile_money_number"
                render={({ field: { value, onChange } }) => (
                  <BasePhoneInput
                    placeholder="Enter number eg. 5512345678"
                    options={countriesData}
                    selectedVal={value}
                    maxLength={10}
                    handleChange={onChange}
                    label="Mobile Money Number"
                    error={form.formState.errors.mobile_money_number?.message}
                  />
                )}
              />
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
