import { Controller } from 'react-hook-form'
import {
  Button,
  Text,
  Input,
  Checkbox,
  FileUploader,
  ImageUpload,
  RadioGroup,
  RadioGroupItem,
  CreatableCombobox,
} from '@/components'
import { cn, Icon } from '@/libs'
import type { VendorDetailsFormProps } from '@/types'
import { BUSINESS_INDUSTRY_OPTIONS, BUSINESS_TYPE_OPTIONS } from '@/utils/constants'
import { useVendorDetailsForm } from './useVendorDetailsForm'

export function VendorDetailsForm({ onSubmit, onCancel, corporateUser }: VendorDetailsFormProps) {
  const { form, checkboxVendorDetailsSameAsCorporate, isSubmitDisabled } =
    useVendorDetailsForm(corporateUser)

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

      {/* Business logo (required, at top) — only when not same as corporate */}
      {!checkboxVendorDetailsSameAsCorporate && (
        <Controller
          control={form.control}
          name="logo"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[#151819] text-sm font-medium">Business logo</span>
                <span className="text-error">*</span>
              </div>
              <ImageUpload
                file={value ?? null}
                onFileChange={(f) => onChange(f ?? null)}
                onUpload={() => {}}
                className="h-[120px]! w-[120px]!"
              />
              {error?.message && <p className="text-sm text-red-500">{error.message}</p>}
            </div>
          )}
        />
      )}

      {/* Vendor Details Section */}
      <section className="flex flex-col gap-4">
        <Controller
          control={form.control}
          name="type"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <div
              className={cn(
                'flex flex-col gap-2',
                checkboxVendorDetailsSameAsCorporate && 'opacity-50 pointer-events-none',
              )}
            >
              <Text as="label" className="text-sm font-medium text-gray-700">
                Vendor Type
              </Text>
              <RadioGroup
                value={value ?? 'llc'}
                onValueChange={onChange}
                className="flex flex-col gap-3"
              >
                {BUSINESS_TYPE_OPTIONS.map((opt) => {
                  const isSelected = value === opt.value
                  const id = `vendor-type-${opt.value}`
                  return (
                    <label
                      key={opt.value}
                      htmlFor={id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                        'bg-gray-50 hover:bg-gray-100',
                        isSelected ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200',
                      )}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-gray-900">{opt.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
                      </div>
                      <RadioGroupItem
                        value={opt.value}
                        id={id}
                        className={cn(
                          'shrink-0 size-5',
                          isSelected &&
                            'border-primary-500 data-[state=checked]:border-primary-500',
                        )}
                      />
                    </label>
                  )
                })}
              </RadioGroup>
              {error && <p className="text-sm text-red-500">{error.message}</p>}
            </div>
          )}
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

        <Input
          label="Business registration number (VAT)"
          placeholder="Enter your business registration number (VAT)"
          {...form.register('registration_number')}
          error={form.formState.errors.registration_number?.message}
          maxLength={10}
          disabled={checkboxVendorDetailsSameAsCorporate}
        />
        <Input
          label="Taxpayer Identification Number (TIN)"
          placeholder="Enter your Taxpayer Identification Number (TIN)"
          {...form.register('employer_identification_number')}
          error={form.formState.errors.employer_identification_number?.message}
          disabled={checkboxVendorDetailsSameAsCorporate}
        />

        <Controller
          control={form.control}
          name="business_industry"
          render={({ field: { onChange, value, name }, fieldState: { error } }) => (
            <CreatableCombobox
              label="Business Industry"
              placeholder="Select or create your business industry"
              options={BUSINESS_INDUSTRY_OPTIONS}
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
          disabled={isSubmitDisabled}
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
