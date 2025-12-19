import React from 'react'
import { Button, FileUploader, Modal, Text } from '@/components'
import { usePersistedModalState, useToast } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'

type EmployeeRow = {
  firstName: string
  lastName: string
  phone?: string
  email: string
  message?: string
}

type Preview = {
  rows: EmployeeRow[]
  errors: string[]
  totalRows: number
  validRows: number
  invalidRows: number
}

function parseSimpleCSV(text: string): string[][] {
  const rows: string[][] = []
  let currentField = ''
  let currentRow: string[] = []
  let inQuotes = false

  const pushField = () => {
    currentRow.push(currentField)
    currentField = ''
  }

  const pushRow = () => {
    if (currentRow.some((v) => v.trim() !== '')) rows.push(currentRow)
    currentRow = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '"') {
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

  pushField()
  pushRow()

  return rows
}

function buildPreview(text: string): Preview {
  const grid = parseSimpleCSV(text)
  const errors: string[] = []

  if (grid.length === 0) {
    return {
      rows: [],
      errors: ['CSV is empty.'],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    }
  }

  const header = grid[0].map((h) => h.trim().toLowerCase())
  const required = ['first_name', 'last_name', 'email']

  const missingHeaders = required.filter((h) => !header.includes(h))
  if (missingHeaders.length) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missingHeaders.join(', ')}`],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    }
  }

  const idx = (key: string) => header.indexOf(key)

  const rows: EmployeeRow[] = []
  let validRows = 0
  let invalidRows = 0

  for (let r = 1; r < grid.length; r++) {
    const row = grid[r]
    const item: EmployeeRow = {
      firstName: (row[idx('first_name')] ?? '').trim(),
      lastName: (row[idx('last_name')] ?? '').trim(),
      phone: (row[idx('phone')] ?? '').trim() || undefined,
      email: (row[idx('email')] ?? '').trim(),
      message: (row[idx('message')] ?? '').trim() || undefined,
    }

    if (!Object.values(item).some((v) => String(v ?? '').trim() !== '')) continue

    const rowErrors: string[] = []
    if (!item.firstName) rowErrors.push('first_name is required')
    if (!item.lastName) rowErrors.push('last_name is required')
    if (!item.email) {
      rowErrors.push('email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
      rowErrors.push('email format is invalid')
    }

    if (rowErrors.length) {
      invalidRows++
      errors.push(`Row ${r + 1}: ${rowErrors.join(', ')}`)
    } else {
      validRows++
    }

    rows.push(item)
  }

  return {
    rows,
    errors,
    totalRows: rows.length,
    validRows,
    invalidRows,
  }
}

export function BulkPurchaseEmployees() {
  const modal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer"
        size="medium"
        onClick={() => modal.openModal(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)}
      >
        <Icon icon="hugeicons:upload-01" className="mr-2" />
        Bulk Purchase (Employees)
      </Button>
      <BulkPurchaseEmployeesModal modal={modal} />
    </>
  )
}

export function BulkPurchaseEmployeesModal({
  modal,
}: {
  modal: ReturnType<typeof usePersistedModalState>
}) {
  const [csvFile, setCsvFile] = React.useState<File | null>(null)
  const [isParsing, setIsParsing] = React.useState(false)
  const [preview, setPreview] = React.useState<Preview | null>(null)
  const toast = useToast()

  const downloadTemplate = () => {
    const example = `first_name,last_name,phone,email,message
John,Doe,+233551234567,john.doe@example.com,Happy Birthday!
Jane,Smith,,jane.smith@example.com,Thank you for your service
Bob,Johnson,+233551234569,bob.johnson@example.com,Welcome to the team!`
    const blob = new Blob([example], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employees-bulk-purchase-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  React.useEffect(() => {
    let cancelled = false

    async function parse() {
      setPreview(null)
      if (!csvFile) return

      const lower = csvFile.name.toLowerCase()
      if (!lower.endsWith('.csv')) {
        setPreview({
          rows: [],
          errors: ['Please upload a CSV file for employee bulk purchase preview.'],
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
        })
        return
      }

      try {
        setIsParsing(true)
        const text = await csvFile.text()
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
        })
      } finally {
        if (!cancelled) setIsParsing(false)
      }
    }

    parse()
    return () => {
      cancelled = true
    }
  }, [csvFile])

  const handleClose = () => {
    setCsvFile(null)
    setPreview(null)
    modal.closeModal()
  }

  const handleContinue = () => {
    if (!csvFile || !preview) return
    if (preview.invalidRows > 0) {
      toast.error('Fix CSV errors before continuing.')
      return
    }

    const employees = preview.rows.filter((r) => r.firstName && r.lastName && r.email)
    if (employees.length === 0) {
      toast.error('No valid employees found in the CSV file.')
      return
    }

    // TODO: Navigate to next step where cards can be assigned
    console.log('Valid employees:', employees)
    toast.success(`Successfully parsed ${employees.length} employee(s)`)
    // For now, just close - you'll implement the card assignment step next
    handleClose()
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)}
      setIsOpen={handleClose}
      title="Bulk Purchase Gift Cards for Employees"
      position="side"
      panelClass="!w-[864px] p-8"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Text variant="p" className="text-sm text-gray-600">
            Upload a CSV file with employee details (first name, last name, phone number, email,
            message). After uploading, you'll be able to assign gift cards to each employee.
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Text variant="span" weight="semibold" className="text-gray-900 block mb-2">
              CSV Format Required
            </Text>
            <Text variant="p" className="text-sm text-gray-600 mb-2">
              Your CSV file must include the following columns:
            </Text>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>
                <strong>first_name</strong> (required) - Employee's first name
              </li>
              <li>
                <strong>last_name</strong> (required) - Employee's last name
              </li>
              <li>
                <strong>email</strong> (required) - Employee's email address
              </li>
              <li>
                <strong>phone</strong> (optional) - Employee's phone number
              </li>
              <li>
                <strong>message</strong> (optional) - Personal message for the employee
              </li>
            </ul>
          </div>

          <div className="flex items-end ml-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Icon icon="hugeicons:download-01" className="mr-2" />
              Download CSV template
            </Button>
          </div>
        </div>

        <FileUploader
          label="Upload Employees CSV"
          accept=".csv"
          value={csvFile}
          onChange={setCsvFile}
        />

        {isParsing && (
          <div className="text-center py-4">
            <Text variant="p" className="text-sm text-gray-500">
              Parsing CSV file...
            </Text>
          </div>
        )}

        {preview && preview.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Text variant="span" weight="semibold" className="text-red-900 block mb-2">
              Errors Found ({preview.errors.length})
            </Text>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
              {preview.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {preview && preview.validRows > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <Text variant="span" weight="semibold" className="text-green-900 block mb-1">
              CSV Parsed Successfully
            </Text>
            <Text variant="p" className="text-sm text-green-800">
              Found {preview.validRows} valid employee(s). Click "Continue" to assign cards.
            </Text>
          </div>
        )}

        {csvFile && preview && preview.rows.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <Text variant="span" weight="medium" className="text-sm text-gray-800">
                Preview
              </Text>
              {isParsing ? (
                <Text variant="span" className="text-xs text-gray-500">
                  Parsing…
                </Text>
              ) : preview ? (
                <Text variant="span" className="text-xs text-gray-500">
                  Rows: {preview.totalRows} · Valid: {preview.validRows} · Invalid:{' '}
                  {preview.invalidRows}
                </Text>
              ) : null}
            </div>

            {preview?.rows?.length ? (
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        First Name
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Last Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Phone</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-gray-700">{r.firstName}</td>
                        <td className="px-3 py-2 text-gray-700">{r.lastName}</td>
                        <td className="px-3 py-2 text-gray-700">{r.phone || '-'}</td>
                        <td className="px-3 py-2 text-gray-700">{r.email}</td>
                        <td className="px-3 py-2 text-gray-700">{r.message || '-'}</td>
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
            onClick={handleContinue}
            disabled={!csvFile || !preview || preview.invalidRows > 0 || preview.validRows === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  )
}
