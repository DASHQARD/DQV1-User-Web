import { Text, Button } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { Icon } from '@/libs'
import { corporateQueries } from '../../hooks'
import { CreateCorporateRecipient } from '@/features/dashboard/components/corporate/modals'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import type { RecipientResponse } from '@/types/responses'
import { RecipientActionCell } from '@/features/dashboard/components/corporate/tableConfigs'

// Table columns for recipients
const recipientsColumns = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
    cell: ({ row }: any) => {
      const recipient = row.original as RecipientResponse
      return (
        <Text variant="span" className="text-sm text-gray-700">
          {recipient.phone || 'N/A'}
        </Text>
      )
    },
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: RecipientActionCell,
  },
]

const recipientsCsvHeaders = [
  { name: 'Name', accessor: 'name' },
  { name: 'Email', accessor: 'email' },
  { name: 'Phone', accessor: 'phone' },
  { name: 'Message', accessor: 'message' },
]

export default function Recipients() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT,
  })
  const { useGetAllRecipientsService } = corporateQueries()
  const { data: recipientsResponse, isLoading } = useGetAllRecipientsService()

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Recipients
            </Text>
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => modal.openModal(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT)}
            >
              <Icon icon="bi:person-plus-fill" className="w-4 h-4" />
              Add Recipient
            </Button>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                All recipients
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={recipientsColumns}
              data={recipientsResponse}
              total={recipientsResponse?.length}
              loading={isLoading}
              query={query}
              setQuery={setQuery}
              csvHeaders={recipientsCsvHeaders}
              printTitle="Recipients"
            />
          </div>
        </div>
      </div>
      <CreateCorporateRecipient />
    </>
  )
}
