import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Text, Input, Checkbox } from '@/components'

const vendorNameSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor name is required'),
})

type VendorNameFormData = z.infer<typeof vendorNameSchema>

interface VendorNameFormProps {
  onSubmit: (data: VendorNameFormData) => void
  sameAsCorporate: boolean
  onSameAsCorporateChange: (value: boolean) => void
  initialValue?: string
}

export function VendorNameForm({
  onSubmit,
  sameAsCorporate,
  onSameAsCorporateChange,
  initialValue,
}: VendorNameFormProps) {
  const form = useForm<VendorNameFormData>({
    resolver: zodResolver(vendorNameSchema),
    defaultValues: {
      vendor_name: initialValue || '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-[120px]">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">Step 1/2</p>
        <Text variant="h2" weight="semibold" className="text-gray-900 mb-2">
          What's the name of your vendor account?
        </Text>
      </div>

      <Input
        label="Vendor Name"
        placeholder="Enter vendor name"
        className="w-full"
        {...form.register('vendor_name')}
        error={form.formState.errors.vendor_name?.message}
        disabled={sameAsCorporate}
      />

      <Checkbox
        id="vendor-name-same-as-corporate"
        checked={sameAsCorporate}
        onChange={(e) => onSameAsCorporateChange(e.target.checked)}
        label="Same as corporate"
      />

      <Button
        size="small"
        type="submit"
        variant="secondary"
        disabled={!form.formState.isValid}
        className="w-fit rounded-full"
      >
        Continue
      </Button>
    </form>
  )
}
