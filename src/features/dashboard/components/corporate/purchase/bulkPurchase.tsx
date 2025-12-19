import { useState, useMemo } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'
import { Button, Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import {
  getBulkPurchaseExampleColumns,
  EXAMPLE_BULK_PURCHASES,
} from '@/features/dashboard/components'
import { BrowseCardsModal } from '@/features/dashboard/components/corporate/modals/BrowseCardsModal'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import { useReducerSpread, usePersistedModalState } from '@/hooks'

type QueryType = typeof DEFAULT_QUERY

export default function BulkPurchase() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const browseCardsModal = usePersistedModalState({
    paramName: MODALS.BROWSE_CARDS.ROOT,
  })

  const columns = useMemo(() => getBulkPurchaseExampleColumns(), [])

  const selectedCount = Object.keys(rowSelection).length
  const totalCount = EXAMPLE_BULK_PURCHASES.length

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h4" weight="semibold" className="text-gray-900 mb-1">
              Bulk Purchase Example
            </Text>
            <Text variant="p" className="text-sm text-gray-600">
              Here's an example of how your bulk purchases will appear after uploading a CSV file.
            </Text>
          </div>
          {selectedCount > 0 && (
            <Text variant="p" className="text-sm text-gray-600">
              {selectedCount} of {totalCount} row(s) selected
            </Text>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Text variant="span" weight="semibold" className="text-blue-900">
                Assign Card to Selected ({selectedCount})
              </Text>
            </div>

            <Button
              variant="secondary"
              onClick={() => browseCardsModal.openModal(MODALS.BROWSE_CARDS.ROOT)}
            >
              Browse Cards to assign
            </Button>
          </div>
        )}

        <BrowseCardsModal />

        <PaginatedTable
          columns={columns}
          data={EXAMPLE_BULK_PURCHASES}
          total={EXAMPLE_BULK_PURCHASES.length}
          loading={false}
          query={query}
          setQuery={setQuery}
          noSearch
          noExport
          printTitle="Bulk Purchase Example"
          enableRowSelection={true}
          getRowId={(row) => row.id || ''}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
    </div>
  )
}
