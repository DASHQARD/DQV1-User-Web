import React from 'react'
import { cn } from '@/libs'
import { Icon } from '@/libs'
import { ErrorText } from '../Text'
import { ExcelImage, PDFImage, DocImage, DocXImage } from '@/assets/images'

type DocumentFileType = 'excel' | 'pdf' | 'doc' | 'docx'

const DOCUMENT_ICONS: Record<DocumentFileType, string> = {
  excel: ExcelImage,
  pdf: PDFImage,
  doc: DocImage,
  docx: DocXImage,
}

function getDocumentFileType(file: File): DocumentFileType | null {
  const name = file.name.toLowerCase()
  const type = file.type

  if (
    type === 'application/vnd.ms-excel' ||
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    type === 'application/vnd.ms-excel.sheet.macroEnabled.12' ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls')
  ) {
    return 'excel'
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf'
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx'
  }
  if (type === 'application/msword' || name.endsWith('.doc')) {
    return 'doc'
  }
  return null
}

interface FileUploaderProps {
  label?: string
  value?: File | null
  onChange?: (file: File | null) => void
  error?: string
  accept?: string
  id?: string
  formatHint?: string
  maxFileSizeMb?: number
}

export default function FileUploader({
  label,
  value,
  onChange,
  error,
  accept = 'image/*',
  id,
  formatHint = 'Format: .jpeg, .png',
  maxFileSizeMb = 25,
}: FileUploaderProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const documentFileType = React.useMemo(() => (value ? getDocumentFileType(value) : null), [value])
  const hasDocumentIcon = !!documentFileType
  const documentIconSrc = documentFileType ? DOCUMENT_ICONS[documentFileType] : null

  React.useEffect(() => {
    if (value && !hasDocumentIcon) {
      const objectUrl = URL.createObjectURL(value)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setPreview(null)
    }
  }, [value, hasDocumentIcon])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    onChange?.(file)
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] || null
    if (file) onChange?.(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  const formatSizeText = `Format: ${formatHint} & Max file size: ${maxFileSizeMb} MB`

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg transition-colors flex items-center justify-center',
          'border-primary-500 bg-primary-50/20',
          error && 'border-red-300 bg-red-50',
          isDragging && !value && 'border-primary-600 bg-primary-50/40',
          !value && 'min-h-48 p-6',
          value && hasDocumentIcon && 'border-2 border-solid border-gray-200 bg-white p-0 min-h-0',
          value && !hasDocumentIcon && 'border-primary-500 bg-primary-50/20 min-h-48 p-4',
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {!value ? (
          <div
            className="flex flex-col items-center justify-center gap-3 w-full cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon icon="bi:cloud-arrow-up" className="size-12 text-primary-500" />
            <p className="text-base font-medium text-gray-900">Drop file or browse</p>
            <p className="text-xs text-gray-500 text-center">{formatSizeText}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="mt-1 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="w-full relative">
            {hasDocumentIcon && documentIconSrc ? (
              <div className="flex items-center gap-4 w-full p-4">
                <img
                  src={documentIconSrc}
                  alt={`${documentFileType} file`}
                  className="h-12 w-12 object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{value.name}</p>
                  <p className="text-xs text-gray-500">{(value.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 shrink-0 transition-colors"
                  aria-label="Delete file"
                >
                  <Icon icon="bi:trash" className="size-5" />
                </button>
              </div>
            ) : (
              <div className="relative w-full">
                {preview && (
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-white aspect-4/3 w-full min-h-48">
                    <img src={preview} alt={value.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 shadow-sm transition-colors"
                  aria-label="Delete file"
                >
                  <Icon icon="bi:trash" className="size-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <ErrorText error={error} />
    </div>
  )
}
