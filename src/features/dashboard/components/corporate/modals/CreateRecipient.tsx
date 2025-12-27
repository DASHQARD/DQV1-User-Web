import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Modal, BasePhoneInput } from '@/components'
import { usePersistedModalState, useCountriesData } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { CreateRecipientSchema } from '@/utils/schemas/contact'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

export function CreateRecipient() {
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT,
  })

  const { countries } = useCountriesData()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof CreateRecipientSchema>>({
    resolver: zodResolver(CreateRecipientSchema),
  })

  const { useAddRecipientService } = corporateMutations()
  const addRecipientMutation = useAddRecipientService()

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    reset()
  }, [modal, reset])

  const onSubmit = async (data: z.infer<typeof CreateRecipientSchema>) => {
    try {
      await addRecipientMutation.mutateAsync(data)
      handleCloseModal()
    } catch {
      // Error is handled by the mutation hook
    }
  }

  return (
    <Modal
      position="side"
      title="Add Recipient"
      isOpen={modal.isModalOpen(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[550px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full gap-6 py-2 px-5">
        <section className="flex flex-col gap-4" aria-label="Create recipient form">
          <Input
            label="Name"
            type="text"
            placeholder="Enter recipient's full name"
            {...register('name')}
            error={errors.name?.message}
            disabled={addRecipientMutation.isPending}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Enter recipient's email address"
            {...register('email')}
            error={errors.email?.message}
            disabled={addRecipientMutation.isPending}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <BasePhoneInput
                placeholder="Enter number eg. 5512345678"
                options={countries}
                selectedVal={value || ''}
                maxLength={10}
                handleChange={onChange}
                label="Phone Number"
                error={error?.message}
              />
            )}
          />
        </section>

        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 mt-auto">
          <Button variant="outline" type="button" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            type="submit"
            disabled={addRecipientMutation.isPending}
            loading={addRecipientMutation.isPending}
          >
            Add Recipient
          </Button>
        </div>
      </form>
    </Modal>
  )
}
