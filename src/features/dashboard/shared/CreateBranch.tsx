import { Button } from '@/components'
import { AddBranchForm } from '@/features/dashboard/components'
import { MODALS } from '@/utils/constants'
import { usePersistedModalState } from '@/hooks'

export default function CreateBranch() {
  const modal = usePersistedModalState({
    paramName: MODALS.BRANCH.CREATE,
  })

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer"
        size="medium"
        onClick={() => modal.openModal(MODALS.BRANCH.CREATE)}
      >
        Create branch
      </Button>
      <AddBranchForm />
    </>
  )
}
