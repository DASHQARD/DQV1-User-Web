import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Text, Input, Checkbox, FileUploader, Combobox } from '@/components'
import { Icon } from '@/libs'
import { ProfileAndIdentitySchema } from '@/utils/schemas'

type VendorProfileFormData = z.infer<typeof ProfileAndIdentitySchema>

interface VendorProfileFormProps {
  onSubmit: (data: VendorProfileFormData) => void
  onCancel: () => void
  sameAsCorporate: boolean
  onSameAsCorporateChange: (value: boolean) => void
  initialValues?: Partial<VendorProfileFormData>
}

export function VendorProfileForm({
  onSubmit,
  onCancel,
  sameAsCorporate,
  onSameAsCorporateChange,
  initialValues,
}: VendorProfileFormProps) {
  const form = useForm<VendorProfileFormData>({
    resolver: zodResolver(ProfileAndIdentitySchema),
    defaultValues: {
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      street_address: initialValues?.street_address || '',
      dob: initialValues?.dob || '',
      id_type: initialValues?.id_type || '',
      id_number: initialValues?.id_number || '',
      front_id: initialValues?.front_id,
      back_id: initialValues?.back_id,
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6 max-w-[448px] w-full"
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

      {/* Same as Corporate Checkbox */}
      <Checkbox
        id="vendor-profile-same-as-corporate"
        checked={sameAsCorporate}
        onChange={(e) => onSameAsCorporateChange(e.target.checked)}
        label="Same as corporate"
      />

      {/* Key Person Details Section */}
      <section className="flex flex-col gap-4">
        <div>
          <Text variant="h2" weight="semibold" className="text-gray-900">
            Key Person Details
          </Text>
          <Text variant="span" weight="normal" className="text-gray-500 text-sm">
            This would be the superuser of the vendor account
          </Text>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            {...form.register('first_name')}
            error={form.formState.errors.first_name?.message}
            disabled={sameAsCorporate}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            {...form.register('last_name')}
            error={form.formState.errors.last_name?.message}
            disabled={sameAsCorporate}
          />
          <Input
            type="date"
            label="Date of Birth"
            placeholder="Enter your date of birth"
            className="col-span-full"
            {...form.register('dob')}
            error={form.formState.errors.dob?.message}
            disabled={sameAsCorporate}
          />
          <Input
            label="Street Address"
            placeholder="Enter your street address"
            className="col-span-full"
            {...form.register('street_address')}
            error={form.formState.errors.street_address?.message}
            disabled={sameAsCorporate}
          />
          <Controller
            name="id_type"
            control={form.control}
            render={({ field, fieldState: { error } }) => (
              <Combobox
                label="ID Type"
                className="col-span-full"
                placeholder="Select your ID type"
                {...field}
                error={error?.message}
                options={[
                  { label: 'National ID', value: 'national_id' },
                  { label: 'Passport', value: 'passport' },
                  { label: "Driver's License", value: 'drivers_license' },
                  { label: 'Other', value: 'other' },
                ]}
                isDisabled={sameAsCorporate}
              />
            )}
          />
          <Input
            label="ID Number"
            placeholder="Enter your ID number"
            className="col-span-full"
            {...form.register('id_number')}
            error={form.formState.errors.id_number?.message}
            disabled={sameAsCorporate}
          />
        </div>
      </section>

      {/* Identity Documents Section */}
      <section className="flex flex-col gap-4">
        <div>
          <Text variant="h2" weight="semibold" className="text-gray-900">
            Identity Documents
          </Text>
          <Text variant="span" weight="normal" className="text-gray-500 text-sm">
            Upload pictures of your identification (front and back)
          </Text>
        </div>

        <div className="space-y-4">
          <Controller
            control={form.control}
            name="front_id"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
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

          <Controller
            control={form.control}
            name="back_id"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className={sameAsCorporate ? 'opacity-50 pointer-events-none' : ''}>
                <FileUploader
                  label="Back of Identification"
                  value={value || null}
                  onChange={onChange}
                  error={error?.message}
                  id="back_id"
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
          Continue
        </Button>
      </div>
    </form>
  )
}
