import { Button, Modal, Tag, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'
import { formatFullDate } from '@/utils/format'

type AdminDetailsData = {
  id: number
  corporate_user_id: number
  admin_user_id: number
  invited_by_user_id: number
  invitation_id: number
  phone_number: string
  status: string
  email: string
  created_at: string
  updated_at: string
  admin_email: string
  admin_fullname: string | null
  admin_avatar: string | null
  admin_status: string
  corporate_name: string
  corporate_email: string
  corporate_business_name: string
  invited_by_name: string
  invited_by_email: string
}

export function ViewAdminDetails() {
  const modal = usePersistedModalState<AdminDetailsData>({
    paramName: MODALS.CORPORATE_ADMIN.PARAM_NAME,
  })

  const adminData = modal.modalData

  const adminInfo = [
    {
      label: 'Status',
      value: (
        <Tag
          value={adminData?.status || '-'}
          variant={getStatusVariant(adminData?.status || '')}
          className="w-fit"
        />
      ),
    },
    {
      label: 'Admin Status',
      value: (
        <Tag
          value={adminData?.admin_status || '-'}
          variant={getStatusVariant(adminData?.admin_status || '')}
          className="w-fit"
        />
      ),
    },
    {
      label: 'Full Name',
      value: adminData?.admin_fullname || '-',
    },
    {
      label: 'Email',
      value: adminData?.admin_email || adminData?.email || '-',
    },
    {
      label: 'Phone Number',
      value: adminData?.phone_number || '-',
    },
    {
      label: 'Corporate Name',
      value: adminData?.corporate_name || '-',
    },
    {
      label: 'Corporate Business Name',
      value: adminData?.corporate_business_name || '-',
    },
    {
      label: 'Corporate Email',
      value: adminData?.corporate_email || '-',
    },
    {
      label: 'Invited By',
      value: adminData?.invited_by_name || '-',
    },
    {
      label: 'Invited By Email',
      value: adminData?.invited_by_email || '-',
    },
    {
      label: 'Invitation ID',
      value: adminData?.invitation_id?.toString() || '-',
    },
    {
      label: 'Created At',
      value: formatFullDate(adminData?.created_at),
    },
    {
      label: 'Updated At',
      value: formatFullDate(adminData?.updated_at),
    },
  ]

  return (
    <Modal
      position="side"
      title="Admin details"
      panelClass="w-[398px]"
      isOpen={modal.isModalOpen(MODALS.CORPORATE_ADMIN.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
      showClose={true}
    >
      <section className="flex flex-col h-full">
        <div className="px-6 flex flex-col gap-3 flex-1 overflow-y-auto">
          {adminInfo.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0"
            >
              <p className="text-gray-400 text-xs">{item.label}</p>
              {typeof item.value === 'string' ? (
                <Text variant="span" weight="normal" className="text-gray-800">
                  {item.value}
                </Text>
              ) : (
                item.value
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="h-12 cursor-pointer w-full"
            onClick={modal.closeModal}
          >
            Close
          </Button>
        </div>
      </section>
    </Modal>
  )
}
