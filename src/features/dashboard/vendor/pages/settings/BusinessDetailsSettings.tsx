import { Controller } from 'react-hook-form'
import { Button, Input, CreatableCombobox, BasePhoneInput } from '@/components'
import { useBusinessDetailsSettingsForm, type FormValues } from '@/features/dashboard/vendor/hooks'

export function BusinessDetailsSettings() {
  const { form, phoneCountries, businessTypeOptions, onSubmit, isPending, isApproved } =
    useBusinessDetailsSettingsForm()

  const handleSubmit = form.handleSubmit((data: FormValues) => onSubmit(data))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
        <div className="md:col-span-2">
          <Input
            label="Business Name"
            isRequired
            placeholder="Provide your business name"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
            disabled={isApproved}
          />
        </div>
        <div>
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState: { error } }) => (
              <CreatableCombobox
                label="Business Type"
                options={[...businessTypeOptions]}
                value={field.value}
                onChange={(e: unknown) => {
                  const ev = e as { target?: { value?: string }; value?: string }
                  const value = ev?.target?.value ?? ev?.value ?? ''
                  field.onChange(value)
                }}
                error={error?.message}
                placeholder="Select business type"
                isDisabled={isApproved}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { onChange, value } }) => {
              const phoneValue = value || ''
              return (
                <BasePhoneInput
                  placeholder="Enter number eg. 5512345678"
                  options={phoneCountries}
                  maxLength={14}
                  handleChange={onChange}
                  isRequired
                  selectedVal={phoneValue}
                  label="Phone Number"
                  error={form.formState.errors.phone?.message}
                  disabled={isApproved}
                  hint={
                    <>
                      Please enter your number in the format:{' '}
                      <span className="font-medium">5512345678</span>
                    </>
                  }
                />
              )
            }}
          />
        </div>

        <Input
          label="Email"
          isRequired
          type="email"
          placeholder="Enter email address"
          {...form.register('email')}
          error={form.formState.errors.email?.message}
          disabled={isApproved}
        />

        <Input
          label="Street Address"
          isRequired
          placeholder="Enter street address"
          {...form.register('street_address')}
          error={form.formState.errors.street_address?.message}
          disabled={isApproved}
        />

        <Input
          label="Digital Address"
          isRequired
          placeholder="Enter digital address (optional)"
          {...form.register('digital_address')}
          error={form.formState.errors.digital_address?.message}
          disabled={isApproved}
        />

        <Input
          label="Registration Number"
          isRequired
          placeholder="Enter registration number"
          {...form.register('registration_number')}
          error={form.formState.errors.registration_number?.message}
          disabled={isApproved}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" variant="secondary" loading={isPending} disabled={isApproved}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
