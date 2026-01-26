import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, Text, Input, Checkbox, FileUploader, Combobox, BasePhoneInput } from '@/components'
import { Icon } from '@/libs'
import { useCountriesData } from '@/hooks'
import type { UserProfileResponse } from '@/types/user'

interface VendorProfileFormProps {
  onSubmit: () => void
  onCancel: () => void
  corporateUser?: UserProfileResponse | null
}

export function VendorProfileForm({ onSubmit, onCancel, corporateUser }: VendorProfileFormProps) {
  const form = useFormContext()
  const { countries } = useCountriesData()

  const checkboxProfileSameAsCorporate = form.watch('checkbox_profile_same_as_corporate')
  const firstName = form.watch('first_name')
  const lastName = form.watch('last_name')
  const dob = form.watch('dob')
  const street_address = form.watch('street_address')
  const idType = form.watch('id_type')
  const idNumber = form.watch('id_number')
  const frontId = form.watch('front_id')
  const phone = form.watch('phone')
  const email = form.watch('email')

  // Update profile fields when checkbox is toggled. Exclude `form` and `business` from deps
  // to avoid "Maximum update depth exceeded" (setValue triggers re-renders; form/business
  // references can change each render and retrigger this effect).
  React.useEffect(() => {
    const business = corporateUser?.business_details?.[0]
    if (checkboxProfileSameAsCorporate && corporateUser) {
      const nameParts = corporateUser.fullname?.split(' ') || []
      const firstNameValue = nameParts[0] || ''
      const lastNameValue = nameParts.slice(1).join(' ') || ''

      form.setValue('first_name', firstNameValue, { shouldValidate: false })
      form.setValue('last_name', lastNameValue, { shouldValidate: false })
      form.setValue('dob', corporateUser.dob || '', { shouldValidate: false })
      form.setValue('street_address', corporateUser.street_address || '', {
        shouldValidate: false,
      })
      form.setValue('id_type', corporateUser.id_type || '', { shouldValidate: false })
      form.setValue('id_number', corporateUser.id_number || '', { shouldValidate: false })
      form.setValue('phone', corporateUser.phonenumber || business?.phone || '', {
        shouldValidate: false,
      })
      form.setValue('email', business?.email || '', { shouldValidate: false })
    } else if (!checkboxProfileSameAsCorporate) {
      form.setValue('first_name', '', { shouldValidate: false })
      form.setValue('last_name', '', { shouldValidate: false })
      form.setValue('dob', '', { shouldValidate: false })
      form.setValue('street_address', '', { shouldValidate: false })
      form.setValue('id_type', '', { shouldValidate: false })
      form.setValue('id_number', '', { shouldValidate: false })
      form.setValue('front_id', undefined, { shouldValidate: false })
      form.setValue('back_id', undefined, { shouldValidate: false })
      form.setValue('phone', '', { shouldValidate: false })
      form.setValue('email', '', { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form stable; business derived from corporateUser
  }, [checkboxProfileSameAsCorporate, corporateUser])

  return (
    <div className="flex flex-col gap-6 max-w-[448px] w-full">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">Step 2/3</p>
        <div>
          <Text variant="h2" weight="semibold" className="text-gray-900 mb-2">
            Profile Information
          </Text>
          <Text variant="p" className="text-sm text-gray-600">
            Complete your contact details and identity verification
          </Text>
        </div>
      </div>

      {/* Same as Corporate Checkbox */}
      <Controller
        control={form.control}
        name="checkbox_profile_same_as_corporate"
        render={({ field }) => (
          <Checkbox
            id="vendor-profile-same-as-corporate"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            label="Same as corporate"
          />
        )}
      />

      {/* Key Person Details & Contact (single section) */}
      <section className="flex flex-col gap-4">
        <div>
          <Text variant="h2" weight="semibold" className="text-gray-900">
            Key Person Details
          </Text>
          <Text variant="span" weight="normal" className="text-gray-500 text-sm">
            This would be the superuser of the vendor account. Include contact details below.
          </Text>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            isRequired
            placeholder="Enter your first name"
            {...form.register('first_name')}
            error={form.formState.errors.first_name?.message}
            disabled={checkboxProfileSameAsCorporate}
          />
          <Input
            label="Last Name"
            isRequired
            placeholder="Enter your last name"
            {...form.register('last_name')}
            error={form.formState.errors.last_name?.message}
            disabled={checkboxProfileSameAsCorporate}
          />
          <Input
            type="date"
            label="Date of Birth"
            isRequired
            placeholder="Enter your date of birth"
            className="col-span-full"
            {...form.register('dob')}
            error={form.formState.errors.dob?.message}
            disabled={checkboxProfileSameAsCorporate}
          />
          <Input
            label="Street Address"
            isRequired
            placeholder="Enter your street address"
            className="col-span-full"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
            disabled={checkboxProfileSameAsCorporate}
          />
          <Controller
            name="id_type"
            control={form.control}
            render={({ field, fieldState: { error } }) => (
              <Combobox
                label="ID Type"
                className="col-span-full"
                isRequired
                placeholder="Select your ID type"
                {...field}
                error={error?.message}
                options={[
                  { label: 'National ID', value: 'national_id' },
                  { label: 'Passport', value: 'passport' },
                ]}
                isDisabled={checkboxProfileSameAsCorporate}
              />
            )}
          />
          <Input
            label="ID Number"
            isRequired
            placeholder="Enter your ID number"
            className="col-span-full"
            {...form.register('id_number')}
            error={form.formState.errors.id_number?.message}
            disabled={checkboxProfileSameAsCorporate}
          />
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { value, onChange } }) => (
              <div
                className={`col-span-full ${checkboxProfileSameAsCorporate ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <BasePhoneInput
                  label="Vendor phone number"
                  isRequired
                  placeholder="Enter number e.g. 5512345678"
                  options={countries}
                  selectedVal={value ?? ''}
                  maxLength={14}
                  handleChange={onChange}
                  error={form.formState.errors.phone?.message}
                />
              </div>
            )}
          />
          <Input
            label="Email"
            isRequired
            placeholder="Enter vendor email"
            type="email"
            className="col-span-full"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
            disabled={checkboxProfileSameAsCorporate}
          />
        </div>
      </section>

      {!checkboxProfileSameAsCorporate && (
        <section className="flex flex-col gap-4">
          <div>
            <Text variant="h2" weight="semibold" className="text-gray-900">
              Identity Documents
            </Text>
            <Text variant="span" weight="normal" className="text-gray-500 text-sm">
              National ID and Passport require the front of your identification only.
            </Text>
          </div>

          <Controller
            control={form.control}
            name="front_id"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div
                className={checkboxProfileSameAsCorporate ? 'opacity-50 pointer-events-none' : ''}
              >
                <FileUploader
                  label="Front of Identification"
                  value={value || null}
                  onChange={onChange}
                  error={error?.message}
                  id="front_id"
                  accept="image/*"
                />
              </div>
            )}
          />
        </section>
      )}

      <div className="flex items-center gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Icon icon="hugeicons:arrow-left-01" className="text-gray-600" />
        </button>
        <Button
          disabled={
            !firstName ||
            !lastName ||
            !dob ||
            !street_address ||
            !idType ||
            !idNumber ||
            !phone ||
            !email ||
            (!checkboxProfileSameAsCorporate && !frontId) ||
            !!form.formState.errors.first_name ||
            !!form.formState.errors.last_name ||
            !!form.formState.errors.dob ||
            !!form.formState.errors.street_address ||
            !!form.formState.errors.id_type ||
            !!form.formState.errors.id_number ||
            !!form.formState.errors.phone ||
            !!form.formState.errors.email ||
            (!checkboxProfileSameAsCorporate && !!form.formState.errors.front_id)
          }
          type="button"
          onClick={onSubmit}
          size="medium"
          variant="secondary"
          className="w-fit rounded-full"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
