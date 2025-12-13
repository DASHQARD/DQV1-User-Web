import { CustomIcon, Dropdown } from '@/components'

export function ExperienceActionCell() {
  return (
    <Dropdown actions={[]}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <CustomIcon name="MoreVertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
