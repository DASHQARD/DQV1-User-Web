import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button, Text, Input, Checkbox } from '@/components'
import type { UserProfileResponse } from '@/types/user'

interface VendorNameFormProps {
  onSubmit: () => void
  corporateUser?: UserProfileResponse | null
}

export function VendorNameForm({ onSubmit, corporateUser }: VendorNameFormProps) {
  const form = useFormContext()

  const useCorporateInfo = form.watch('use_corporate_info')
  const vendorName = form.watch('vendor_name')
  const vendorNameError = form.formState.errors.vendor_name

  React.useEffect(() => {
    if (useCorporateInfo && corporateUser?.business_details?.[0]?.name) {
      form.setValue('vendor_name', corporateUser.business_details[0].name, {
        shouldValidate: true,
      })
    } else if (!useCorporateInfo) {
      form.setValue('vendor_name', '', {
        shouldValidate: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form intentionally omitted to avoid unnecessary re-runs
  }, [useCorporateInfo, corporateUser])

  return (
    <div className="flex flex-col gap-6 mt-[120px]">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">Step 1/3</p>
        <Text variant="h2" weight="semibold" className="text-gray-900 mb-2">
          What's the name of your vendor account?
        </Text>
      </div>

      <Input
        label="Vendor Name"
        isRequired
        placeholder="Enter vendor name"
        className="w-full"
        {...form.register('vendor_name')}
        error={form.formState.errors.vendor_name?.message}
        disabled={useCorporateInfo}
      />
      <Controller
        control={form.control}
        name="use_corporate_info"
        render={({ field }) => (
          <Checkbox
            id="vendor-name-same-as-corporate"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            label="Same as corporate"
          />
        )}
      />

      <Button
        size="small"
        type="button"
        variant="secondary"
        onClick={onSubmit}
        disabled={!vendorName || !!vendorNameError}
        className="w-fit rounded-full"
      >
        Continue
      </Button>
    </div>
  )
}
