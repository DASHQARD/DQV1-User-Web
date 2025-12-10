import React from 'react'
import { useForm } from 'react-hook-form'

import { Button, Input, Modal } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'
import { useRecipients } from '@/features/website'
import { CreateRecipientSchema } from '@/utils/schemas/contact'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export function CreateRecipient() {
  const modal = usePersistedModalState({
    paramName: MODAL_NAMES.RECIPIENT.CREATE,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof CreateRecipientSchema>>({
    resolver: zodResolver(CreateRecipientSchema),
  })

  const { useCreateRecipientService } = useRecipients()
  const createRecipientMutation = useCreateRecipientService()
  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    reset()
  }, [modal, reset])

  const onSubmit = (data: z.infer<typeof CreateRecipientSchema>) => {
    createRecipientMutation.mutate(data)
  }

  return (
    <>
      <Button
        className="cursor-pointer"
        size={'medium'}
        onClick={() => modal.openModal(MODAL_NAMES.RECIPIENT.CREATE)}
      >
        Add Recipient
      </Button>
      <Modal
        position="side"
        title="Add Recipient"
        isOpen={modal.isModalOpen(MODAL_NAMES.RECIPIENT.CREATE)}
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
              disabled={createRecipientMutation.isPending}
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter recipient's email address"
              {...register('email')}
              error={errors.email?.message}
              disabled={createRecipientMutation.isPending}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter recipient's phone number (optional)"
              {...register('phone')}
              error={errors.phone?.message}
              disabled={createRecipientMutation.isPending}
            />
          </section>

          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 mt-auto">
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              type="submit"
              disabled={createRecipientMutation.isPending}
              loading={createRecipientMutation.isPending}
            >
              Add Recipient
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
