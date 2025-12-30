import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import {
  Button,
  Text,
  Input,
  Checkbox,
  FileUploader,
  RadioGroup,
  RadioGroupItem,
  BasePhoneInput,
  CreatableCombobox,
} from '@/components'
import { Icon } from '@/libs'
import { useCountriesData } from '@/hooks'
import type { DropdownOption } from '@/types'
import type { UserProfileResponse } from '@/types/user'

const businessIndustryOptions: DropdownOption[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'construction', label: 'Construction' },
  { value: 'agriculture', label: 'Agriculture' },
]

interface VendorDetailsFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  corporateUser?: UserProfileResponse | null
}

export function VendorDetailsForm({ onSubmit, onCancel, corporateUser }: VendorDetailsFormProps) {
  const { countries } = useCountriesData()
  const form = useFormContext()

  const checkboxVendorDetailsSameAsCorporate = form.watch(
    'checkbox_vendor_details_same_as_corporate',
  )
  const type = form.watch('type')
  const phone = form.watch('phone')
  const email = form.watch('email')
  const streetAddress = form.watch('street_address')
  const digitalAddress = form.watch('digital_address')
  const registrationNumber = form.watch('registration_number')
  const employerIdentificationNumber = form.watch('employer_identification_number')
  const businessIndustry = form.watch('business_industry')

  // Update vendor details fields when checkbox is toggled
  React.useEffect(() => {
    if (checkboxVendorDetailsSameAsCorporate && corporateUser?.business_details?.[0]) {
      const business = corporateUser.business_details[0]

      form.setValue('type', (business.type as 'llc' | 'sole_proprietor' | 'partnership') || 'llc', {
        shouldValidate: true,
      })
      form.setValue('phone', corporateUser?.phonenumber || '', { shouldValidate: true })
      form.setValue('email', business.email || '', { shouldValidate: true })
      form.setValue('street_address', business.street_address || '', { shouldValidate: true })
      form.setValue('digital_address', business.digital_address || '', { shouldValidate: true })
      form.setValue('registration_number', business.registration_number || '', {
        shouldValidate: true,
      })
      form.setValue(
        'employer_identification_number',
        corporateUser?.employee_identification_number || '',
        {
          shouldValidate: true,
        },
      )
      form.setValue('business_industry', corporateUser?.business_industry || '', {
        shouldValidate: true,
      })
    } else if (!checkboxVendorDetailsSameAsCorporate) {
      // Clear fields when unchecked
      form.setValue('type', 'llc', { shouldValidate: false })
      form.setValue('phone', '', { shouldValidate: false })
      form.setValue('email', '', { shouldValidate: false })
      form.setValue('street_address', '', { shouldValidate: false })
      form.setValue('digital_address', '', { shouldValidate: false })
      form.setValue('registration_number', '', { shouldValidate: false })
      form.setValue('employer_identification_number', '', { shouldValidate: false })
      form.setValue('business_industry', '', { shouldValidate: false })
    }
  }, [checkboxVendorDetailsSameAsCorporate, corporateUser])

  return (
    <div className="flex flex-col gap-6 max-w-[448px] w-full">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">Step 3/3</p>
        <div>
          <Text variant="h2" weight="semibold" className="text-gray-900 mb-2">
            Vendor Details & Documentation
          </Text>
          <Text variant="p" className="text-sm text-gray-600">
            Complete your vendor information and provide proof of incorporation
          </Text>
        </div>
      </div>

      {/* Same as Corporate Checkbox at the top */}
      <Controller
        control={form.control}
        name="checkbox_vendor_details_same_as_corporate"
        render={({ field }) => (
          <Checkbox
            id="vendor-details-same-as-corporate"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            label="Same as corporate"
          />
        )}
      />

      {/* Vendor Details Section */}
      <section className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="type"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <div
              className={`flex flex-col gap-1 ${checkboxVendorDetailsSameAsCorporate ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Text as="label" className="text-sm font-medium text-gray-700">
                Vendor Type
              </Text>
              <RadioGroup value={value} onValueChange={onChange}>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="llc" id="vendor-type-llc" />
                  <Text as="label" htmlFor="vendor-type-llc" className="cursor-pointer">
                    Limited Liability Company
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="sole_proprietor" id="vendor-type-sole" />
                  <Text as="label" htmlFor="vendor-type-sole" className="cursor-pointer">
                    Sole Proprietorship
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="partnership" id="vendor-type-partnership" />
                  <Text as="label" htmlFor="vendor-type-partnership" className="cursor-pointer">
                    Partnership
                  </Text>
                </div>
              </RadioGroup>
              {error && <p className="text-sm text-red-500">{error.message}</p>}
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="phone"
          render={({ field: { value, onChange } }) => {
            return (
              <div
                className={
                  checkboxVendorDetailsSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                }
              >
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={countries}
                  selectedVal={value}
                  maxLength={10}
                  handleChange={onChange}
                  label="Vendor Phone Number"
                  error={form.formState.errors.phone?.message}
                />
              </div>
            )
          }}
        />

        <Input
          label="Email"
          placeholder="Enter your email"
          {...form.register('email')}
          type="email"
          error={form.formState.errors.email?.message}
          disabled={checkboxVendorDetailsSameAsCorporate}
        />

        <Input
          label="Street Address"
          placeholder="Enter your vendor street address"
          {...form.register('street_address')}
          error={form.formState.errors.street_address?.message}
          disabled={checkboxVendorDetailsSameAsCorporate}
        />

        <Input
          label="Ghana Post Digital Address"
          placeholder="Enter your Ghana Post Digital Address"
          {...form.register('digital_address')}
          error={form.formState.errors.digital_address?.message}
          disabled={checkboxVendorDetailsSameAsCorporate}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vendor Registration Number"
            placeholder="Enter your vendor registration number"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
            maxLength={10}
            disabled={checkboxVendorDetailsSameAsCorporate}
          />
          <Input
            label="Employer Identification Number"
            placeholder="Enter your employer identification number"
            {...form.register('employer_identification_number')}
            error={form.formState.errors.employer_identification_number?.message}
            disabled={checkboxVendorDetailsSameAsCorporate}
          />
        </div>

        <Controller
          control={form.control}
          name="business_industry"
          render={({ field: { onChange, value, name }, fieldState: { error } }) => (
            <CreatableCombobox
              label="Business Industry"
              placeholder="Select or create your business industry"
              options={businessIndustryOptions}
              name={name}
              value={value}
              onChange={onChange}
              error={error?.message}
              {...(checkboxVendorDetailsSameAsCorporate ? { isDisabled: true } : {})}
            />
          )}
        />
      </section>

      {!checkboxVendorDetailsSameAsCorporate && (
        <section className="flex flex-col gap-4">
          <div>
            <Text variant="h2" weight="semibold" className="text-gray-900">
              Documentation
            </Text>
            <Text variant="span" weight="normal" className="text-gray-500 text-sm">
              Upload required documents
            </Text>
          </div>

          <div className="space-y-4">
            <Controller
              control={form.control}
              name="certificate_of_incorporation"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <div
                  className={
                    checkboxVendorDetailsSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                  }
                >
                  <FileUploader
                    label="Certificate of Incorporation"
                    value={value || null}
                    onChange={onChange}
                    error={error?.message}
                    id="certificate_of_incorporation"
                    accept=".pdf,.doc,.docx,image/*"
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="business_license"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <div
                  className={
                    checkboxVendorDetailsSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                  }
                >
                  <FileUploader
                    label="Business License"
                    value={value || null}
                    onChange={onChange}
                    error={error?.message}
                    id="business_license"
                    accept=".pdf,.doc,.docx,image/*"
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="articles_of_incorporation"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <div
                  className={
                    checkboxVendorDetailsSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                  }
                >
                  <FileUploader
                    label="Articles of Incorporation (Optional)"
                    value={value || null}
                    onChange={onChange}
                    error={error?.message}
                    id="articles_of_incorporation"
                    accept=".pdf,.doc,.docx,image/*"
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="utility_bill"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <div
                  className={
                    checkboxVendorDetailsSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                  }
                >
                  <FileUploader
                    label="Utility Bill"
                    value={value || null}
                    onChange={onChange}
                    error={error?.message}
                    id="utility_bill"
                    accept=".pdf,.doc,.docx,image/*"
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="logo"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <div
                  className={
                    checkboxVendorDetailsSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                  }
                >
                  <FileUploader
                    label="Logo (Optional)"
                    value={value || null}
                    onChange={onChange}
                    error={error?.message}
                    id="logo"
                    accept="image/*"
                  />
                </div>
              )}
            />
          </div>
        </section>
      )}

      {/* Action Buttons */}
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
            !type ||
            !phone ||
            !email ||
            !streetAddress ||
            !digitalAddress ||
            !registrationNumber ||
            !employerIdentificationNumber ||
            !businessIndustry ||
            (!checkboxVendorDetailsSameAsCorporate &&
              (!form.watch('certificate_of_incorporation') ||
                !form.watch('business_license') ||
                !form.watch('utility_bill'))) ||
            !!form.formState.errors.type ||
            !!form.formState.errors.phone ||
            !!form.formState.errors.email ||
            !!form.formState.errors.street_address ||
            !!form.formState.errors.digital_address ||
            !!form.formState.errors.registration_number ||
            !!form.formState.errors.employer_identification_number ||
            !!form.formState.errors.business_industry ||
            (!checkboxVendorDetailsSameAsCorporate &&
              (!!form.formState.errors.certificate_of_incorporation ||
                !!form.formState.errors.business_license ||
                !!form.formState.errors.utility_bill))
          }
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          size="medium"
          variant="secondary"
          className="w-fit rounded-full"
        >
          Complete
        </Button>
      </div>
    </div>
  )
}
