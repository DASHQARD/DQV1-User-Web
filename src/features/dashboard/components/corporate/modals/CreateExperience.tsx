import React from 'react'

import { Button, Modal } from '@/components'
import { usePersistedModalState } from '@/hooks'

import { CreateExperienceForm } from '../forms'
import { MODALS } from '@/utils/constants'

export default function CreateExperience() {
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.CREATE,
  })

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
  }, [modal])

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer"
        size={'medium'}
        onClick={() => modal.openModal(MODALS.EXPERIENCE.CREATE)}
      >
        Create Experience
      </Button>
      <Modal
        position="side"
        title="Create experience"
        isOpen={modal.isModalOpen(MODALS.EXPERIENCE.CREATE)}
        setIsOpen={handleCloseModal}
        panelClass="!w-[864px] p-8"
      >
        <section className=" w-full mx-auto">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-6 py-2 px-5">
              <CreateExperienceForm />
            </section>
          </div>
        </section>
      </Modal>
    </>
  )
}
