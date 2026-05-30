import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Modal, Text, BasePhoneInput, GiftCardPriceFormField } from '@/components'
import { usePersistedModalState, useCountriesData, useToast } from '@/hooks'
import { EXAMPLE_PHONE_PLACEHOLDER_E164, MODALS } from '@/utils/constants'
import { AssignRecipientSchema } from '@/utils/schemas'
import { formatPersonName } from '@/utils/personName'
import {
  INVALID_PHONE_MESSAGE,
  isValidInternationalPhoneDigits,
} from '@/utils/schemas/shared'
import { corporateMutations, corporateQueries } from '@/features/dashboard/corporate/hooks'

const DashProAssignSchema = AssignRecipientSchema.safeExtend({
  phone: z.string().optional(),
  email: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.assign_to_self) {
    const phone = data.phone?.trim()
    if (phone && !isValidInternationalPhoneDigits(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: INVALID_PHONE_MESSAGE,
        path: ['phone'],
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
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      message: '',
      amount: undefined,
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
      setValue('first_name', '')
      setValue('last_name', '')
      setValue('phone', '')
      setValue('email', '')
    }
  }

  const onSubmit = async (data: z.infer<typeof DashProAssignSchema>) => {
    try {
      let recipientId: number | null = null

      // If not assigning to self, create recipient first
      if (!data.assign_to_self) {
        const recipientFullName = formatPersonName(data.first_name ?? '', data.last_name ?? '')
        if (!recipientFullName || !data.phone || !data.email) {
          toast.error('Please fill in all required recipient fields')
          return
        }

        const recipientResponse = await addRecipientMutation.mutateAsync({
          name: recipientFullName,
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

        <GiftCardPriceFormField
          control={control}
          name="amount"
          label="Amount"
          disabled={isPending}
          error={errors.amount?.message}
          iconBefore={<span className="text-gray-400 font-medium">GHS</span>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">First Name</label>
            <Input
              type="text"
              placeholder="First name"
              {...register('first_name')}
              error={errors.first_name?.message}
              disabled={assignToSelf || isPending}
              className={assignToSelf ? 'bg-gray-100' : ''}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Last Name</label>
            <Input
              type="text"
              placeholder="Last name"
              {...register('last_name')}
              error={errors.last_name?.message}
              disabled={assignToSelf || isPending}
              className={assignToSelf ? 'bg-gray-100' : ''}
            />
          </div>
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
                placeholder={EXAMPLE_PHONE_PLACEHOLDER_E164}
                options={countries}
                selectedVal={value || ''}
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
