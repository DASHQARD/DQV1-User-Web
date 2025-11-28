import React from 'react'
import { cn } from '@/libs'
import { ErrorText } from '../Text'

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

  React.useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setPreview(null)
    }
  }, [value])

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
          'border-2 border-dashed rounded-lg p-4 transition-colors min-h-48 flex items-center justify-center',
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400',
          value && 'border-primary-500 bg-primary-50/30',
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
          <div className="space-y-2">
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
      <ErrorText error={error} />
    </div>
  )
}
