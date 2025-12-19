import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Text, Input } from '@/components'
import { Icon } from '@/libs'
import { getRequiredStringSchema, getRequiredEmailSchema } from '@/utils/schemas/shared'

const vendorProfileSchema = z.object({
  first_name: getRequiredStringSchema('First Name'),
  last_name: getRequiredStringSchema('Last Name'),
  email: getRequiredEmailSchema('Email'),
})

type VendorProfileFormData = z.infer<typeof vendorProfileSchema>

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
  initialValues,
}: VendorProfileFormProps) {
  const form = useForm<VendorProfileFormData>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      email: initialValues?.email || '',
    },
  })

  // Hide form if same as corporate
  if (sameAsCorporate) {
    return null
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6 max-w-[448px] w-full"
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-gray-500">Step 2/2</p>
        <div>
          <Text variant="h2" weight="semibold" className="text-gray-900 mb-2">
            Profile Information
          </Text>
          <Text variant="p" className="text-sm text-gray-600">
            Complete your contact details
          </Text>
        </div>
      </div>

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
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            {...form.register('last_name')}
            error={form.formState.errors.last_name?.message}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            className="col-span-full"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
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
          Invite
        </Button>
      </div>
    </form>
  )
}
