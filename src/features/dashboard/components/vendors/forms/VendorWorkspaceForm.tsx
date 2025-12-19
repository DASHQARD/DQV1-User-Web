import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Text, Input, Checkbox, FileUploader } from '@/components'
import { Icon } from '@/libs'

const vendorWorkspaceSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_description: z
    .string()
    .max(160, 'Description must be 160 characters or less')
    .optional()
    .or(z.literal('')),
  company_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  company_logo: z.instanceof(File).optional().or(z.literal(null)),
})

type VendorWorkspaceFormData = z.infer<typeof vendorWorkspaceSchema>

interface VendorWorkspaceFormProps {
  onSubmit: (data: VendorWorkspaceFormData) => void
  onCancel: () => void
  sameAsCorporate: boolean
  onSameAsCorporateChange: (value: boolean) => void
  initialValues?: Partial<VendorWorkspaceFormData>
}

export function VendorWorkspaceForm({
  onSubmit,
  onCancel,
  sameAsCorporate,
  onSameAsCorporateChange,
  initialValues,
}: VendorWorkspaceFormProps) {
  const form = useForm<VendorWorkspaceFormData>({
    resolver: zodResolver(vendorWorkspaceSchema),
    defaultValues: {
      company_name: initialValues?.company_name || '',
      company_description: initialValues?.company_description || '',
      company_url: initialValues?.company_url || '',
      location: initialValues?.location || '',
    },
  })

  const companyDescription = useWatch({
    control: form.control,
    name: 'company_description',
  })
  const descriptionLength = companyDescription?.length || 0

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6 max-w-[448px] w-full"
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">Step 3/3</p>
        <div>
          <Text variant="h2" weight="semibold" className="text-gray-900 mb-2">
            Create your vendor workspace
          </Text>
          <Text variant="p" className="text-sm text-gray-600">
            Fill in some details about your vendor workspace
          </Text>
        </div>
      </div>

      {/* Same as Corporate Checkbox at the top */}
      <Checkbox
        id="workspace-same-as-corporate"
        checked={sameAsCorporate}
        onChange={(e) => onSameAsCorporateChange(e.target.checked)}
        label="Same as corporate"
      />

      {/* Company Details Section */}
      <section className="flex flex-col gap-4">
        <div className="col-span-full">
          <Input
            type="textarea"
            innerClassName="min-h-[100px]"
            rows={10}
            label="Vendor Description"
            placeholder="Write a brief vendor description"
            {...form.register('company_description')}
            error={form.formState.errors.company_description?.message}
            disabled={sameAsCorporate}
          />
          <div className="text-right mt-1 text-xs text-gray-400">{descriptionLength}/160</div>
        </div>

        <Input
          label="Vendor URL (optional)"
          placeholder="Enter vendor URL"
          className="col-span-full"
          {...form.register('company_url')}
          error={form.formState.errors.company_url?.message}
          disabled={sameAsCorporate}
        />

        <Input
          label="Vendor Location"
          placeholder="Enter vendor location"
          className="col-span-full"
          iconBefore={<Icon icon="bi:geo-alt" className="text-gray-400 text-lg" />}
          {...form.register('location')}
          error={form.formState.errors.location?.message}
          disabled={sameAsCorporate}
        />
      </section>

      {/* Company Logo Upload */}
      <Controller
        control={form.control}
        name="company_logo"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FileUploader
            label="Upload Vendor Logo"
            value={value || null}
            onChange={onChange}
            error={error?.message}
            id="company_logo"
            accept="image/*"
          />
        )}
      />

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
