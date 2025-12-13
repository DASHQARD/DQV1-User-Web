import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { BusinessDetailsSchema, UploadBusinessIDSchema } from '@/utils/schemas'
import { useCountriesData } from '@/hooks'
import type { DropdownOption } from '@/types'

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

const vendorDetailsSchema = BusinessDetailsSchema.merge(UploadBusinessIDSchema)

type VendorDetailsFormData = z.infer<typeof vendorDetailsSchema>

interface VendorDetailsFormProps {
  onSubmit: (data: VendorDetailsFormData) => void
  onCancel: () => void
  sameAsCorporate: boolean
  onSameAsCorporateChange: (value: boolean) => void
  initialValues?: Partial<VendorDetailsFormData>
}

export function VendorDetailsForm({
  onSubmit,
  onCancel,
  sameAsCorporate,
  onSameAsCorporateChange,
  initialValues,
}: VendorDetailsFormProps) {
  const { countries } = useCountriesData()
  const form = useForm<VendorDetailsFormData>({
    resolver: zodResolver(vendorDetailsSchema),
    defaultValues: {
      name: initialValues?.name || '',
      type: initialValues?.type,
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      street_address: initialValues?.street_address || '',
      digital_address: initialValues?.digital_address || '',
      registration_number: initialValues?.registration_number || '',
      employer_identification_number: initialValues?.employer_identification_number || '',
      business_industry: initialValues?.business_industry || '',
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6 max-w-[448px] w-full"
    >
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
      <Checkbox
        id="vendor-details-same-as-corporate"
        checked={sameAsCorporate}
        onChange={(e) => onSameAsCorporateChange(e.target.checked)}
        label="Same as corporate"
      />

      {/* Vendor Details Section */}
      <section className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="type"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <div
              className={`flex flex-col gap-1 ${sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Text as="label" className="text-sm font-medium text-gray-700">
                Vendor Type
              </Text>
              <RadioGroup value={value} onValueChange={onChange}>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="llc" id="vendor-type-llc" />
                  <Text as="label" htmlFor="vendor-type-llc" className="cursor-pointer">
                    LLC
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
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
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
          disabled={sameAsCorporate}
        />

        <Input
          label="Street Address"
          placeholder="Enter your vendor street address"
          {...form.register('street_address')}
          error={form.formState.errors.street_address?.message}
          disabled={sameAsCorporate}
        />

        <Input
          label="Ghana Post Digital Address"
          placeholder="Enter your Ghana Post Digital Address"
          {...form.register('digital_address')}
          error={form.formState.errors.digital_address?.message}
          disabled={sameAsCorporate}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vendor Registration Number"
            placeholder="Enter your vendor registration number"
            {...form.register('registration_number')}
            error={form.formState.errors.registration_number?.message}
            maxLength={10}
            disabled={sameAsCorporate}
          />
          <Input
            label="Employer Identification Number"
            placeholder="Enter your employer identification number"
            {...form.register('employer_identification_number')}
            error={form.formState.errors.employer_identification_number?.message}
            disabled={sameAsCorporate}
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
              {...(sameAsCorporate ? { isDisabled: true } : {})}
            />
          )}
        />
      </section>

      {/* Documentation Section */}
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
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
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
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
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
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
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
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
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
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
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
          disabled={!form.formState.isValid}
          type="submit"
          size="medium"
          variant="secondary"
          className="w-fit rounded-full"
        >
          Complete
        </Button>
      </div>
    </form>
  )
}
