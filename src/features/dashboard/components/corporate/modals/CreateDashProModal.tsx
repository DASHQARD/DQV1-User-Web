import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Modal, Text, BasePhoneInput } from '@/components'
import { usePersistedModalState, useCountriesData, useToast } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { AssignRecipientSchema } from '@/utils/schemas'
import { corporateMutations, corporateQueries } from '@/features/dashboard/corporate/hooks'

const DashProAssignSchema = AssignRecipientSchema.safeExtend({
  phone: z.string().optional(),
  email: z.string().optional(),
}).superRefine((data, ctx) => {
  // If assign_to_self is false, phone and email are required
  if (!data.assign_to_self) {
    if (!data.phone || data.phone.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number is required',
        path: ['phone'],
      })
    }
    if (!data.email || data.email.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email address is required',
        path: ['email'],
      })
    }
  }
})

export function CreateDashProModal() {
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.PARAM_NAME,
  })
  const { countries } = useCountriesData()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<z.infer<typeof DashProAssignSchema>>({
    resolver: zodResolver(DashProAssignSchema),
    defaultValues: {
      assign_to_self: false,
      name: '',
      phone: '',
      email: '',
      message: '',
      amount: 0,
    },
  })

  const assignToSelf = watch('assign_to_self')
  const { useAddRecipientService } = corporateMutations()
  const { useCreateDashProAndAssignService } = corporateMutations()
  const { refetch: refetchRecipients } = corporateQueries().useGetAllRecipientsService()

  const addRecipientMutation = useAddRecipientService()
  const createDashProMutation = useCreateDashProAndAssignService()

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    reset()
  }, [modal, reset])

  const handleToggleAssignToSelf = () => {
    const newValue = !assignToSelf
    setValue('assign_to_self', newValue)
    if (newValue) {
      // Clear recipient fields when assigning to self
      setValue('name', '')
      setValue('phone', '')
      setValue('email', '')
    }
  }

  const onSubmit = async (data: z.infer<typeof DashProAssignSchema>) => {
    try {
      let recipientId: number | null = null

      // If not assigning to self, create recipient first
      if (!data.assign_to_self) {
        if (!data.name || !data.phone || !data.email) {
          toast.error('Please fill in all required recipient fields')
          return
        }

        const recipientResponse = await addRecipientMutation.mutateAsync({
          name: data.name,
          phone: data.phone,
          email: data.email,
        })

        recipientId = recipientResponse?.id || recipientResponse?.data?.id || null

        if (!recipientId) {
          toast.error('Failed to create recipient')
          return
        }

        // Refetch recipients to get the latest data
        await refetchRecipients()
      }

      // Calculate issue date
      const today = new Date()
      const issueDate = today.toISOString().split('T')[0]

      // Prepare payload for createDashProAndAssign
      // When assign_to_self is true, pass empty array (API will handle assigning to current user)
      const payload = {
        recipient_ids: data.assign_to_self ? [] : recipientId ? [recipientId] : [],
        product: 'DashPro Gift Card',
        description: data.message || 'DashPro multi-vendor gift card',
        price: data.amount,
        currency: 'GHS',
        issue_date: issueDate,
      }

      await createDashProMutation.mutateAsync(payload)

      toast.success('DashPro card created and assigned successfully')
      handleCloseModal()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create DashPro card')
    }
  }

  const isPending = addRecipientMutation.isPending || createDashProMutation.isPending

  return (
    <Modal
      position="center"
      title="Purchase Gift Cards for Employees"
      isOpen={modal.isModalOpen(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_DASHPRO)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[600px] max-w-[90vw]"
      showClose
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 py-4">
        {/* Amount Field */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
              GHS
            </span>
            <Input
              type="number"
              min={1}
              max={10000}
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
              disabled={isPending}
              className="pl-16"
            />
          </div>
        </div>

        {/* Recipient's Full Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Recipient&apos;s Full Name
          </label>
          <Input
            type="text"
            placeholder="Enter recipient's full name"
            {...register('name')}
            error={errors.name?.message}
            disabled={assignToSelf || isPending}
            className={assignToSelf ? 'bg-gray-100' : ''}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <BasePhoneInput
                placeholder="Enter phone number"
                options={countries}
                selectedVal={value || ''}
                maxLength={10}
                handleChange={onChange}
                error={error?.message}
                disabled={assignToSelf || isPending}
              />
            )}
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="Enter email address"
            {...register('email')}
            error={errors.email?.message}
            disabled={assignToSelf || isPending}
            className={assignToSelf ? 'bg-gray-100' : ''}
          />
        </div>

        {/* Personal Message */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Personal Message</label>
          <Input
            type="textarea"
            placeholder="Your personalized message will appear here..."
            rows={4}
            {...register('message')}
            error={errors.message?.message}
            disabled={isPending}
          />
        </div>

        {/* Assign to Self Toggle */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Assign to Self</label>
            <button
              type="button"
              onClick={handleToggleAssignToSelf}
              disabled={isPending}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  assignToSelf ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              <span
                className={`absolute inset-0 rounded-full transition-colors ${
                  assignToSelf ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            </button>
          </div>
          <Text variant="p" className="text-xs text-gray-600">
            {assignToSelf
              ? 'Card will be assigned to your account. Recipient details will be ignored.'
              : 'Card will be assigned to someone else. Please provide recipient details below.'}
          </Text>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" type="button" onClick={handleCloseModal} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            type="submit"
            disabled={isPending}
            loading={isPending}
            className="min-w-[200px]"
          >
            Create and customize DashPro Gift Card
          </Button>
        </div>
      </form>
    </Modal>
  )
}
