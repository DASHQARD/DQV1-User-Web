import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button, FileUploader, Modal, Text } from '@/components'
import { bulkUploadGiftCards } from '@/features/dashboard/services/bulkGiftCards'
import { usePersistedModalState, useToast } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'

type BulkRow = {
  card_id: string
  quantity: string
  amount: string
  name: string
  email: string
  phone?: string
  message?: string
}

type ParsedPreview = {
  rows: BulkRow[]
  errors: string[]
  totalRows: number
  validRows: number
  invalidRows: number
  totalValue: number
}

function parseSimpleCSV(text: string): string[][] {
  // Minimal CSV parser (handles quotes + commas); good enough for template/preview.
  const rows: string[][] = []
  let currentField = ''
  let currentRow: string[] = []
  let inQuotes = false

  const pushField = () => {
    currentRow.push(currentField)
    currentField = ''
  }

  const pushRow = () => {
    // ignore fully empty rows
    if (currentRow.some((v) => v.trim() !== '')) rows.push(currentRow)
    currentRow = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '"') {
      // Escaped quote inside quoted field
      if (inQuotes && text[i + 1] === '"') {
        currentField += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && (char === ',' || char === '\n' || char === '\r')) {
      if (char === '\r') continue
      pushField()
      if (char === '\n') pushRow()
      continue
    }

    currentField += char
  }

  // flush last field/row
  pushField()
  pushRow()

  return rows
}

function buildPreview(text: string): ParsedPreview {
  const grid = parseSimpleCSV(text)
  const errors: string[] = []

  if (grid.length === 0) {
    return {
      rows: [],
      errors: ['CSV is empty.'],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      totalValue: 0,
    }
  }

  const header = grid[0].map((h) => h.trim().toLowerCase())
  const required = ['card_id', 'quantity', 'amount', 'name', 'email']

  const missingHeaders = required.filter((h) => !header.includes(h))
  if (missingHeaders.length) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missingHeaders.join(', ')}`],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      totalValue: 0,
    }
  }

  const idx = (key: string) => header.indexOf(key)

  const rows: BulkRow[] = []
  let totalValue = 0
  let validRows = 0
  let invalidRows = 0

  for (let r = 1; r < grid.length; r++) {
    const row = grid[r]
    const item: BulkRow = {
      card_id: (row[idx('card_id')] ?? '').trim(),
      quantity: (row[idx('quantity')] ?? '').trim(),
      amount: (row[idx('amount')] ?? '').trim(),
      name: (row[idx('name')] ?? '').trim(),
      email: (row[idx('email')] ?? '').trim(),
      phone: (row[idx('phone')] ?? '').trim() || undefined,
      message: (row[idx('message')] ?? '').trim() || undefined,
    }

    // skip empty rows
    if (!Object.values(item).some((v) => String(v ?? '').trim() !== '')) continue

    const rowErrors: string[] = []
    if (!item.card_id) rowErrors.push('card_id is required')
    if (!item.name) rowErrors.push('name is required')
    if (!item.email) rowErrors.push('email is required')

    const qty = Number(item.quantity)
    const amt = Number(item.amount)
    if (!item.quantity || Number.isNaN(qty) || qty <= 0) rowErrors.push('quantity must be > 0')
    if (!item.amount || Number.isNaN(amt) || amt <= 0) rowErrors.push('amount must be > 0')
    if (item.email && !item.email.includes('@')) rowErrors.push('email looks invalid')

    if (rowErrors.length) {
      invalidRows++
      errors.push(`Row ${r + 1}: ${rowErrors.join(', ')}`)
    } else {
      validRows++
      totalValue += qty * amt
    }

    rows.push(item)
  }

  return {
    rows,
    errors,
    totalRows: rows.length,
    validRows,
    invalidRows,
    totalValue,
  }
}

export function BulkUploadGiftCards() {
  const modal = usePersistedModalState({
    paramName: MODALS.BULK_GIFT_CARDS.UPLOAD,
  })

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer"
        size={'medium'}
        onClick={() => modal.openModal(MODALS.BULK_GIFT_CARDS.UPLOAD)}
      >
        <Icon icon="hugeicons:upload-01" className="mr-2" />
        Bulk Upload (Raw)
      </Button>
      <BulkUploadModal modal={modal} />
    </>
  )
}

function BulkUploadModal({ modal }: { modal: ReturnType<typeof usePersistedModalState> }) {
  const [bulkFile, setBulkFile] = React.useState<File | null>(null)
  const [isParsing, setIsParsing] = React.useState(false)
  const [preview, setPreview] = React.useState<ParsedPreview | null>(null)
  const queryClient = useQueryClient()
  const toast = useToast()

  const bulkUploadMutation = useMutation({
    mutationFn: bulkUploadGiftCards,
    onSuccess: (response) => {
      const message =
        response.data?.successful && response.data?.total
          ? `Successfully uploaded ${response.data.successful} of ${response.data.total} gift cards`
          : 'Gift cards uploaded successfully'
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      queryClient.invalidateQueries({ queryKey: ['user-recipients'] })
      setBulkFile(null)
      modal.closeModal()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload gift cards. Please try again.')
    },
  })

  const handleBulkUpload = () => {
    if (!bulkFile) return
    if (preview?.invalidRows) {
      toast.error('Fix CSV errors before uploading.')
      return
    }
    bulkUploadMutation.mutate(bulkFile)
  }

  const handleClose = () => {
    setBulkFile(null)
    setPreview(null)
    modal.closeModal()
  }

  React.useEffect(() => {
    let cancelled = false
    async function parse() {
      setPreview(null)
      if (!bulkFile) return

      const lower = bulkFile.name.toLowerCase()
      if (!lower.endsWith('.csv')) {
        setPreview({
          rows: [],
          errors: [
            'Preview/validation is available for CSV only. Upload will still work for Excel files.',
          ],
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          totalValue: 0,
        })
        return
      }

      try {
        setIsParsing(true)
        const text = await bulkFile.text()
        if (cancelled) return
        setPreview(buildPreview(text))
      } catch (e: any) {
        if (cancelled) return
        setPreview({
          rows: [],
          errors: [e?.message || 'Failed to read CSV file.'],
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          totalValue: 0,
        })
      } finally {
        if (!cancelled) setIsParsing(false)
      }
    }

    parse()
    return () => {
      cancelled = true
    }
  }, [bulkFile])

  // Example CSV content for bulk gift card upload
  const exampleCSV = `card_id,quantity,amount,name,email,phone,message
1,2,100.00,John Doe,john.doe@example.com,+233551234567,Happy Birthday!
1,1,50.00,Jane Smith,jane.smith@example.com,+233551234568,Thank you for your service
2,3,150.00,Bob Johnson,bob.johnson@example.com,+233551234569,`

  const downloadExample = () => {
    const blob = new Blob([exampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-gift-cards-example.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BULK_GIFT_CARDS.UPLOAD)}
      setIsOpen={modal.closeModal}
      title="Bulk Upload Gift Cards"
      position="side"
      panelClass="!w-[864px] p-8"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Text variant="p" className="text-sm text-gray-600">
            Upload a CSV or Excel file to bulk purchase gift cards for employees. The file should
            include the following columns:
          </Text>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
            <li>
              <strong>card_id</strong> (required) - The ID of the gift card/experience
            </li>
            <li>
              <strong>quantity</strong> (required) - Number of cards to purchase
            </li>
            <li>
              <strong>amount</strong> (required) - Amount per card
            </li>
            <li>
              <strong>name</strong> (required) - Recipient's full name
            </li>
            <li>
              <strong>email</strong> (required) - Recipient's email address
            </li>
            <li>
              <strong>phone</strong> (optional) - Recipient's phone number
            </li>
            <li>
              <strong>message</strong> (optional) - Personal message for the recipient
            </li>
          </ul>
        </div>

        {/* Example Format */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Text variant="span" weight="medium" className="text-sm text-gray-700">
              Example Format:
            </Text>
            <button
              type="button"
              onClick={downloadExample}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Icon icon="hugeicons:download-01" className="w-4 h-4" />
              Download Example CSV
            </button>
          </div>
          <div className="bg-white rounded border border-gray-300 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    card_id
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    quantity
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    amount
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    phone
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">message</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">1</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">2</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">100.00</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">John Doe</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    john.doe@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    +233551234567
                  </td>
                  <td className="px-3 py-2 text-gray-600">Happy Birthday!</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">1</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">1</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">50.00</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">Jane Smith</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    jane.smith@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    +233551234568
                  </td>
                  <td className="px-3 py-2 text-gray-600">Thank you for your service</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <FileUploader
          label="Upload Gift Cards File"
          accept=".csv,.xlsx,.xls"
          value={bulkFile}
          onChange={setBulkFile}
        />

        {/* Preview + Validation */}
        {bulkFile && (
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <Text variant="span" weight="medium" className="text-sm text-gray-800">
                Upload preview
              </Text>
              {isParsing ? (
                <Text variant="span" className="text-xs text-gray-500">
                  Parsing…
                </Text>
              ) : preview ? (
                <Text variant="span" className="text-xs text-gray-500">
                  Rows: {preview.totalRows} · Valid: {preview.validRows} · Invalid:{' '}
                  {preview.invalidRows} · Total value: {preview.totalValue.toFixed(2)}
                </Text>
              ) : null}
            </div>

            {preview?.errors?.length ? (
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <Text variant="span" className="text-xs text-amber-800">
                  {preview.errors[0]}
                </Text>
                {preview.errors.length > 1 && (
                  <ul className="mt-2 list-disc list-inside text-xs text-amber-800 space-y-1">
                    {preview.errors.slice(1, 6).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            {preview?.rows?.length ? (
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">card_id</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">quantity</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">amount</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">name</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">email</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-gray-700">{r.card_id}</td>
                        <td className="px-3 py-2 text-gray-700">{r.quantity}</td>
                        <td className="px-3 py-2 text-gray-700">{r.amount}</td>
                        <td className="px-3 py-2 text-gray-700">{r.name}</td>
                        <td className="px-3 py-2 text-gray-700">{r.email}</td>
                        <td className="px-3 py-2 text-gray-700">{r.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleBulkUpload}
            disabled={!bulkFile || bulkUploadMutation.isPending || !!preview?.invalidRows}
            loading={bulkUploadMutation.isPending}
          >
            Create Bulk Purchase
          </Button>
        </div>
      </div>
    </Modal>
  )
}
