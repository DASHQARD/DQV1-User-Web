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

  // Check if custom size is provided via className
  const hasSmallSize = className.includes('h-10') || className.includes('w-10') || className.includes('h-12') || className.includes('w-12')
  const isRounded = className.includes('rounded-full')
  const iconSize = hasSmallSize ? 'text-lg' : 'text-[48px]'
  const buttonSize = hasSmallSize ? 'h-5 w-5 bottom-0 right-0' : 'h-8 w-8 bottom-1 -right-1'
  const borderRadius = isRounded ? 'rounded-full' : 'rounded-xl'

  return (
    <div
      className={`flex bg-gray-200 ${borderRadius} h-[120px] w-[120px] mx-auto relative overflow-hidden ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleImageChange}
        disabled={isUploading}
      />
      <div className="grid inset-0 m-auto">
        {displayImage ? (
          <img
            src={displayImage}
            alt="profile"
            className={`w-full h-full object-cover ${borderRadius}`}
          />
        ) : (
          <Icon icon="hugeicons:user" className={`${iconSize} object-cover mx-auto my-auto text-gray-400`} />
        )}
      </div>
      <button
        type="button"
        onClick={handleCameraClick}
        disabled={isUploading}
        className={`absolute ${buttonSize} border-2 border-white bg-[#8ac1ba] rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed z-10`}
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
