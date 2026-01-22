import React from 'react'
import { cn } from '@/libs'
import { ErrorText } from '../Text'
import { ExcelImage, PDFImage, DocImage, DocXImage } from '@/assets/images'

type DocumentFileType = 'excel' | 'pdf' | 'doc' | 'docx'

const DOCUMENT_ICONS: Record<DocumentFileType, string> = {
  excel: ExcelImage,
  pdf: PDFImage,
  doc: DocImage,
  docx: DocXImage,
}

function getDocumentFileType(file: File, accept?: string): DocumentFileType | null {
  const name = file.name.toLowerCase()
  const type = file.type

  if (
    type === 'application/vnd.ms-excel' ||
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    type === 'application/vnd.ms-excel.sheet.macroEnabled.12' ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    (accept && (accept.includes('.xlsx') || accept.includes('.xls')))
  ) {
    return 'excel'
  }
  if (type === 'application/pdf' || name.endsWith('.pdf') || (accept && accept.includes('.pdf'))) {
    return 'pdf'
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx') ||
    (accept && accept.includes('.docx'))
  ) {
    return 'docx'
  }
  if (
    type === 'application/msword' ||
    name.endsWith('.doc') ||
    (accept && accept.includes('.doc'))
  ) {
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
}

export default function FileUploader({
  label,
  value,
  onChange,
  error,
  accept = 'image/*',
  id,
}: FileUploaderProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const documentFileType = React.useMemo(
    () => (value ? getDocumentFileType(value, accept) : null),
    [value, accept],
  )
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

  function handleRemove() {
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400',
          value && !hasDocumentIcon && 'border-primary-500 bg-primary-50/30 min-h-48 p-4',
          !value && 'min-h-48 p-4',
          value && hasDocumentIcon && 'border-0 p-0 min-h-0',
        )}
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
          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              Click to upload
            </button>
            <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
          </div>
        ) : (
          <div className="w-full">
            {hasDocumentIcon && documentIconSrc ? (
              <div className="flex items-center gap-4 w-full pt-4">
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
                  className="text-sm text-red-600 hover:text-red-700 font-medium shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{value.name}</p>
                    <p className="text-xs text-gray-500">
                      {(value.size / 1024).toFixed(2)} KB • {value.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="ml-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
                {preview && (
                  <div className="mt-2">
                    <img
                      src={preview}
                      alt={value.name}
                      className="max-h-48 w-full object-contain rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <ErrorText error={error} />
    </div>
  )
}
