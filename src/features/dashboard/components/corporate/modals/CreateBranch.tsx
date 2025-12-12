import React from 'react'

import { Button, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'

import { CreateBranchForm } from '../forms'
import { MODALS } from '@/utils/constants'

export default function CreateBranch() {
  const modal = usePersistedModalState({
    paramName: MODALS.BRANCH.CREATE,
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
        onClick={() => modal.openModal(MODALS.BRANCH.CREATE)}
      >
        Create branch
      </Button>
      <Modal
        position="side"
        title="Create branch"
        isOpen={modal.isModalOpen(MODALS.BRANCH.CREATE)}
        setIsOpen={handleCloseModal}
        panelClass="!w-[864px]"
      >
        <section className="max-w-[480px] w-full mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleCloseModal}>
                <Icon icon="hugeicons:arrow-left-01" className="text-primary-900" />
              </button>
              <Text as="h2" className="text-xl font-semibold text-gray-900">
                Branch Information
              </Text>
            </div>

            <section className="flex flex-col gap-6 py-2 px-5">
              <CreateBranchForm />
            </section>
          </div>
        </section>
      </Modal>
    </>
  )
}
