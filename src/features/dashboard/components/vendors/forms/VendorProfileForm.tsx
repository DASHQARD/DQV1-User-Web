import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Button,
  Text,
  Input,
  Checkbox,
  FileUploader,
  Combobox,
  BasePhoneInput,
  DateInput,
} from '@/components'
import { Icon } from '@/libs'
import type { VendorProfileFormProps } from '@/types'
import { useVendorProfileForm } from './useVendorProfileForm'

export function VendorProfileForm({ onSubmit, onCancel, corporateUser }: VendorProfileFormProps) {
  const { form, countries, checkboxProfileSameAsCorporate, isSubmitDisabled } =
    useVendorProfileForm(corporateUser)
  const dobMaxDate = useMemo(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col gap-6 max-w-[448px] w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' as const }}
      >
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

        <section className="flex flex-col gap-4">
          <div>
            <Text variant="h2" weight="semibold" className="text-gray-900">
              Key Person Details
            </Text>
            <Text variant="span" weight="normal" className="text-gray-500 text-sm">
              This would be the superuser of the vendor account.
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
                    hint={
                      <>
                        Please enter your number in the format:{' '}
                        <span className="font-medium">5512345678</span>
                      </>
                    }
                    disabled={checkboxProfileSameAsCorporate}
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

            <Controller
              name="dob"
              control={form.control}
              render={({ field }) => {
                const dobError = form.formState.errors.dob?.message
                const normalizedValue = (() => {
                  if (!field.value || !field.value.trim()) return undefined
                  const d = new Date(field.value.trim() + 'T12:00:00')
                  if (Number.isNaN(d.getTime())) return undefined
                  return d
                })()
                return (
                  <div
                    className={`col-span-full ${checkboxProfileSameAsCorporate ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <DateInput
                      label="Date of Birth"
                      id="dob"
                      placeholder="Select or type date (dd/mm/yyyy)"
                      dateFormat="dd/MM/yyyy"
                      value={normalizedValue}
                      maxDate={new Date(dobMaxDate + 'T12:00:00')}
                      strictParsing
                      disabled={checkboxProfileSameAsCorporate}
                      onChange={(date: Date | null) => {
                        if (!date) {
                          field.onChange('')
                          requestAnimationFrame(() => form.trigger('dob'))
                          return
                        }
                        const y = date.getFullYear()
                        const fixedDate =
                          y >= 0 && y <= 99
                            ? new Date(
                                y <= 50 ? 2000 + y : 1900 + y,
                                date.getMonth(),
                                date.getDate(),
                              )
                            : date
                        const next = fixedDate.toISOString().split('T')[0]
                        field.onChange(next)
                        requestAnimationFrame(() => form.trigger('dob'))
                      }}
                      error={typeof dobError === 'string' ? dobError : undefined}
                    />
                  </div>
                )
              }}
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
            disabled={isSubmitDisabled}
            type="button"
            onClick={onSubmit}
            size="medium"
            variant="secondary"
            className="w-fit rounded-full"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
