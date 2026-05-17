import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { Button, Input, Text, Combobox, DateInput } from '@/components'
import { Icon } from '@/libs'
import { ID_TYPE_OPTIONS } from '@/utils/constants'
import { usePersonalInformationSettings } from './usePersonalInformationSettings'

export function PersonalInformationSettings() {
  const { form, onSubmit, handleReset, isPending } = usePersonalInformationSettings()
  const dobMaxDate = useMemo(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }, [])

  return (
    <div className="space-y-6 py-6">
      <div>
        <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
          Personal Information
        </Text>
        <Text variant="p" className="text-gray-600 text-sm">
          Update your personal details and identification information. This information is used for
          account verification and compliance purposes.
        </Text>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:person-fill" className="size-4 mr-2 text-gray-500" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              {...form.register('full_name')}
              error={form.formState.errors.full_name?.message}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:geo-alt-fill" className="size-4 mr-2 text-gray-500" />
              Street Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your street address"
              {...form.register('street_address')}
              error={form.formState.errors.street_address?.message}
            />
          </div>

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
                <div>
                  <DateInput
                    label="Date of Birth *"
                    id="dob"
                    placeholder="Select or type date (dd/mm/yyyy)"
                    dateFormat="dd/MM/yyyy"
                    value={normalizedValue}
                    maxDate={new Date(dobMaxDate + 'T12:00:00')}
                    strictParsing
                    onChange={(date: Date | null) => {
                      if (!date) {
                        field.onChange('')
                        requestAnimationFrame(() => form.trigger('dob'))
                        return
                      }
                      const y = date.getFullYear()
                      const fixedDate =
                        y >= 0 && y <= 99
                          ? new Date(y <= 50 ? 2000 + y : 1900 + y, date.getMonth(), date.getDate())
                          : date
                      const next = fixedDate.toISOString().split('T')[0]
                      field.onChange(next)
                      requestAnimationFrame(() => form.trigger('dob'))
                    }}
                    error={dobError}
                  />
                </div>
              )
            }}
          />

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:card-text" className="size-4 mr-2 text-gray-500" />
              ID Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="id_type"
              control={form.control}
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  placeholder="Select ID type"
                  options={[...ID_TYPE_OPTIONS]}
                  value={field.value}
                  onChange={(e: { target: { value: string } }) => {
                    field.onChange(e.target.value)
                    void form.trigger(['id_type', 'id_number'])
                  }}
                  error={error?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Icon icon="bi:hash" className="size-4 mr-2 text-gray-500" />
              ID Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. GHA-123456789-0"
              {...form.register('id_number')}
              error={form.formState.errors.id_number?.message}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isPending}
            loading={isPending}
            variant="secondary"
            className="min-w-[150px]"
          >
            <Icon icon="bi:check-circle" className="size-4 mr-2" />
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={isPending}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
