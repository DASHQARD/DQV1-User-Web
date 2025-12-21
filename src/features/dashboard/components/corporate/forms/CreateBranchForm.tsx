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
import { CreateBranchFormSchema } from '@/utils/schemas/auth/auth'
import { useAuth } from '@/features/auth/hooks'
import { useCountriesData, useToast } from '@/hooks'
import { GHANA_BANKS } from '@/assets/data/banks'
import { useQueryClient } from '@tanstack/react-query'
import { axiosClient } from '@/libs'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'

export default function CreateBranchForm() {
  const modal = usePersistedModalState({
    paramName: MODALS.BRANCH.CREATE,
  })
  // const { data: userProfile } = useUserProfile()
  const { useGetCountriesService } = useAuth()
  const { data: countries } = useGetCountriesService()
  const { countries: countriesData } = useCountriesData()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof CreateBranchFormSchema>>({
    resolver: zodResolver(CreateBranchFormSchema),
    defaultValues: {
      country: undefined,
      country_code: '',
      branch_name: '',
      branch_location: '',
      branch_manager_name: '',
      branch_manager_email: '',
      phone_number: '',
      same_as_corporate: false,
      payment_method: '',
      mobile_money_provider: '',
      mobile_money_number: '',
      bank_name: '',
      account_number: '',
      account_name: '',
      sort_code: '',
      swift_code: '',
    },
  })

  const sameAsCorporate = useWatch({
    control: form.control,
    name: 'same_as_corporate',
  })

  const paymentMethod = useWatch({
    control: form.control,
    name: 'payment_method',
  })

  const selectedCountryId = form.watch('country')

  // Update country_code when country changes
  React.useEffect(() => {
    if (selectedCountryId && countries) {
      const selectedCountry = countries.find((c) => c.id === selectedCountryId)
      if (selectedCountry) {
        const countryCode = selectedCountry.code || selectedCountry.iso_code || ''
        form.setValue('country_code', countryCode, { shouldValidate: true })
      }
    } else if (!selectedCountryId) {
      form.setValue('country_code', '', { shouldValidate: true })
    }
  }, [selectedCountryId, countries, form])

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
    setIsSubmitting(true)
    try {
      const payload: any = {
        country: String(data.country),
        country_code: data.country_code || '',
        branch_name: data.branch_name,
        branch_location: data.branch_location,
        branch_manager_name: data.branch_manager_name,
        branch_manager_email: data.branch_manager_email,
        phone_number: data.phone_number,
        same_as_corporate: data.same_as_corporate || false,
      }

      // Add payment details if not same as corporate
      if (!data.same_as_corporate && data.payment_method) {
        if (data.payment_method === 'mobile_money') {
          const phoneValue = data.mobile_money_number || ''
          const numberPart = phoneValue.includes('-') ? phoneValue.split('-')[1] : phoneValue
          const cleanedMobileMoneyNumber = '0' + numberPart.replace(/\D/g, '')

          payload.payment_method = 'mobile_money'
          payload.mobile_money_provider = data.mobile_money_provider
          payload.mobile_money_number = cleanedMobileMoneyNumber
        } else if (data.payment_method === 'bank') {
          payload.payment_method = 'bank'
          payload.bank_name = data.bank_name
          payload.account_number = data.account_number
          payload.account_name = data.account_name
          payload.sort_code = data.sort_code
          payload.swift_code = data.swift_code
        }
      }

      const response = await axiosClient.post('/vendors/branches', payload)
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success(response.data?.message || 'Branch created successfully')
      form.reset()
      modal.closeModal()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create branch. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                countries?.map((country) => ({
                  label: country.name,
                  value: String(country.id),
                })) || []
              }
              value={field.value ? String(field.value) : undefined}
              onChange={(e: { target: { value: string } }) => {
                const value = e.target.value ? Number(e.target.value) : undefined
                field.onChange(value)
              }}
              error={error?.message}
              placeholder="Select country"
              isSearchable={true}
            />
          )}
        />

        <Input
          label="Branch Name"
          placeholder="Enter branch name"
          {...form.register('branch_name')}
          error={form.formState.errors.branch_name?.message}
        />

        <Input
          label="Branch Location"
          placeholder="Enter branch location/address"
          {...form.register('branch_location')}
          error={form.formState.errors.branch_location?.message}
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
        />

        <Input
          label="Branch Manager Email"
          placeholder="Enter manager email"
          type="email"
          {...form.register('branch_manager_email')}
          error={form.formState.errors.branch_manager_email?.message}
        />

        <Controller
          control={form.control}
          name="phone_number"
          render={({ field: { value, onChange } }) => (
            <BasePhoneInput
              placeholder="Enter phone number"
              options={countriesData}
              selectedVal={value}
              maxLength={10}
              handleChange={onChange}
              label="Phone Number"
              error={form.formState.errors.phone_number?.message}
            />
          )}
        />
      </section>

      {/* Payment Method */}
      <section className="flex flex-col gap-4 border-t border-gray-200 pt-4">
        <Text as="h3" className="text-lg font-semibold text-gray-900">
          Payment Method
        </Text>

        {/* {(userProfile as any)?.user_type === 'corporate_vendor' && (
          <Controller
            control={form.control}
            name="same_as_corporate"
            render={({ field: { value, onChange } }) => (
              <Checkbox
                id="same_as_corporate"
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                label="Same as corporate account"
              />
            )}
          />
        )} */}

        {!sameAsCorporate && (
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
                    label="Account Number"
                    placeholder="Enter account number"
                    {...form.register('account_number')}
                    error={form.formState.errors.account_number?.message}
                  />

                  <Input
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
        )}
      </section>

      {/* Submit Button */}
      <div className="flex gap-4 border-t border-gray-200 pt-4">
        <Button
          type="submit"
          variant="secondary"
          disabled={!form.formState.isValid || isSubmitting}
          loading={isSubmitting}
          className="w-full"
        >
          Create Branch
        </Button>
      </div>
    </form>
  )
}
