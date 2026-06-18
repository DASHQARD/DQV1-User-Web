import { useMemo, useRef } from 'react'
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
  PhoneFormatHint,
} from '@/components'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import { isDialCodeOnlyPhone } from '@/utils/schemas/shared'
import { getVisibleFieldError } from '@/utils/showFieldError'
import { CORPORATE_ONBOARDING_ID_TYPE_OPTIONS } from '@/utils/constants/idType'
import { Icon } from '@/libs'
import type { VendorProfileFormProps } from '@/types'
import { useVendorProfileForm, VENDOR_PROFILE_LOCKED_INNER_CLASS } from './useVendorProfileForm'

export function VendorProfileForm({ onSubmit, onCancel, corporateUser }: VendorProfileFormProps) {
  const {
    form,
    countries,
    checkboxProfileSameAsCorporate,
    isSubmitDisabled,
    isPassport,
    isNationalId,
  } = useVendorProfileForm(corporateUser)
  const phoneDialCodeSynced = useRef(false)
  const phoneError = getVisibleFieldError(form, 'phone')
  const dobMaxDate = useMemo(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }, [])

  const lockedFieldProps = checkboxProfileSameAsCorporate
    ? {
        readOnly: true,
        innerClassName: VENDOR_PROFILE_LOCKED_INNER_CLASS,
      }
    : {}

  return (
    <AnimatePresence>
      <motion.div
        className="flex w-full flex-col gap-6"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              isRequired
              placeholder="Enter your first name"
              {...form.register('first_name')}
              error={form.formState.errors.first_name?.message}
              {...lockedFieldProps}
            />
            <Input
              label="Last Name"
              isRequired
              placeholder="Enter your last name"
              {...form.register('last_name')}
              error={form.formState.errors.last_name?.message}
              {...lockedFieldProps}
            />

            <Controller
              control={form.control}
              name="phone"
              render={({ field: { value, onChange, onBlur, ref } }) => (
                <div className="col-span-full">
                  <BasePhoneInput
                    ref={ref}
                    label="Vendor phone number"
                    isRequired
                    placeholder={EXAMPLE_PHONE_PLACEHOLDER}
                    options={countries}
                    selectedVal={value ?? ''}
                    handleChange={(phone) => {
                      const normalized = phone?.trim() ?? ''
                      if (!phoneDialCodeSynced.current && isDialCodeOnlyPhone(normalized)) {
                        phoneDialCodeSynced.current = true
                        return
                      }
                      phoneDialCodeSynced.current = true
                      onChange(phone)
                    }}
                    onBlur={onBlur}
                    error={phoneError}
                    hint={<PhoneFormatHint />}
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
              className="col-span-1"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
              {...lockedFieldProps}
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
                  <div className="col-span-1">
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
              {...lockedFieldProps}
            />

            <Controller
              name="id_type"
              control={form.control}
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="ID Type"
                  className="col-span-1"
                  isRequired
                  placeholder="Select your ID type"
                  {...field}
                  error={error?.message}
                  options={[...CORPORATE_ONBOARDING_ID_TYPE_OPTIONS]}
                  isDisabled={checkboxProfileSameAsCorporate}
                />
              )}
            />
            <Input
              label="ID Number"
              isRequired
              placeholder={isNationalId ? 'e.g. GHA-123456789-0' : 'Enter your ID number'}
              className="col-span-1"
              {...form.register('id_number')}
              error={form.formState.errors.id_number?.message}
              {...lockedFieldProps}
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
                {isPassport
                  ? 'Upload a picture of your passport page.'
                  : isNationalId
                    ? 'Upload pictures of the front and back of your National ID.'
                    : 'Upload pictures of your identification.'}
              </Text>
            </div>

            <div
              className={
                isNationalId ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'flex flex-col gap-4'
              }
            >
              <Controller
                control={form.control}
                name="front_id"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <div
                    className={
                      checkboxProfileSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                    }
                  >
                    <FileUploader
                      label={
                        isPassport
                          ? 'Passport Page'
                          : isNationalId
                            ? 'Front of National ID'
                            : 'Front of Identification'
                      }
                      value={value || null}
                      onChange={onChange}
                      error={error?.message}
                      id="front_id"
                      accept="image/*"
                    />
                  </div>
                )}
              />

              {isNationalId && (
                <Controller
                  control={form.control}
                  name="back_id"
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <div
                      className={
                        checkboxProfileSameAsCorporate ? 'opacity-50 pointer-events-none' : ''
                      }
                    >
                      <FileUploader
                        label="Back of National ID"
                        value={value || null}
                        onChange={onChange}
                        error={error?.message}
                        id="back_id"
                        accept="image/*"
                      />
                    </div>
                  )}
                />
              )}
            </div>
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
