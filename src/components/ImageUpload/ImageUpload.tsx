import React from 'react'

import { Icon } from '@iconify/react'

interface ImageUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  onUpload: (file: File) => void
  isUploading?: boolean
  currentImageUrl?: string
  className?: string
}

export default function ImageUpload({
  file,
  onFileChange,
  onUpload,
  isUploading = false,
  currentImageUrl,
  className = '',
}: Readonly<ImageUploadProps>) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      onFileChange(selectedFile)
      onUpload(selectedFile)
    }
  }

  function handleCameraClick() {
    fileInputRef.current?.click()
  }

  const displayImage = React.useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }
    return currentImageUrl
  }, [file, currentImageUrl])

  return (
    <div
      className={`flex size-full bg-gray-200 rounded-xl h-[120px] w-[120px] mx-auto relative ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleImageChange}
        disabled={isUploading}
      />
      <div className="grid inset-0 m-auto rounded-full">
        {displayImage ? (
          <img
            src={displayImage}
            alt="profile"
            className="w-full h-[120px] object-cover rounded-xl"
          />
        ) : (
          <Icon icon="hugeicons:user" className="text-[48px] object-cover mx-auto text-white" />
        )}
      </div>
      <button
        type="button"
        onClick={handleCameraClick}
        disabled={isUploading}
        className="absolute bottom-1 -right-1 h-8 w-8 border-2 border-white bg-[#8ac1ba] rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <Icon icon="hugeicons:loading-01" className="text-white text-base m-auto animate-spin" />
        ) : (
          <Icon icon="hugeicons:camera-01" className="text-white text-base m-auto" />
        )}
      </button>
    </div>
  )
}
