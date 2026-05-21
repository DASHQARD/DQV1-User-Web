import React from 'react'

import { Icon } from '@iconify/react'
import { cn } from '@/libs'

type ImageUploadSize = 'sm' | 'md'

interface ImageUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  onUpload: (file: File) => void
  isUploading?: boolean
  currentImageUrl?: string
  /** sm: compact avatar (sidebar). md: larger profile/logo picker (default). */
  size?: ImageUploadSize
  className?: string
}

const SIZE_STYLES: Record<
  ImageUploadSize,
  { box: string; placeholderIcon: string; useOverlay: boolean; badge: string }
> = {
  sm: {
    box: 'h-14 w-14',
    placeholderIcon: 'text-2xl',
    useOverlay: true,
    badge: 'h-6 w-6',
  },
  md: {
    box: 'h-[120px] w-[120px]',
    placeholderIcon: 'text-5xl',
    useOverlay: false,
    badge: 'h-9 w-9 bottom-1.5 right-1.5',
  },
}

export default function ImageUpload({
  file,
  onFileChange,
  onUpload,
  isUploading = false,
  currentImageUrl,
  size = 'md',
  className = '',
}: Readonly<ImageUploadProps>) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const styles = SIZE_STYLES[size]

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      onFileChange(selectedFile)
      onUpload(selectedFile)
    }
    event.target.value = ''
  }

  function handleTriggerClick() {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const displayImage = previewUrl ?? currentImageUrl
  const [imageError, setImageError] = React.useState(false)

  React.useEffect(() => {
    setImageError(false)
  }, [displayImage])

  const showImage = Boolean(displayImage) && !imageError

  const isRounded =
    className.includes('rounded-full') || size === 'sm' || !className.includes('rounded-')
  const borderRadius = isRounded ? 'rounded-full' : 'rounded-xl'

  return (
    <div className={cn('relative shrink-0', styles.box, className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleImageChange}
        disabled={isUploading}
        aria-label="Upload profile photo"
      />

      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={isUploading}
        aria-label={isUploading ? 'Uploading photo' : 'Change profile photo'}
        className={cn(
          'group relative size-full overflow-hidden border border-gray-200 bg-gray-100',
          'transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-70',
          borderRadius,
        )}
      >
        {showImage ? (
          <img
            src={displayImage!}
            alt=""
            className={cn('absolute inset-0 size-full object-cover object-center', borderRadius)}
            onError={() => setImageError(true)}
          />
        ) : (
          <span
            className={cn(
              'flex size-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200',
              borderRadius,
            )}
          >
            <Icon icon="bi:person-fill" className={cn(styles.placeholderIcon, 'text-gray-400')} />
          </span>
        )}

        {styles.useOverlay ? (
          <span
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center gap-0.5 transition-colors',
              borderRadius,
              isUploading ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/45',
            )}
          >
            {isUploading ? (
              <Icon
                icon="bi:arrow-repeat"
                className="size-5 animate-spin text-white"
                aria-hidden
              />
            ) : (
              <>
                <Icon
                  icon="bi:camera-fill"
                  className="size-4 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <span className="text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Change
                </span>
              </>
            )}
          </span>
        ) : (
          <span
            className={cn(
              'absolute flex items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white shadow-md',
              'transition-transform group-hover:scale-105',
              styles.badge,
              isUploading && 'bg-primary-700',
            )}
          >
            {isUploading ? (
              <Icon icon="bi:arrow-repeat" className="size-4 animate-spin" aria-hidden />
            ) : (
              <Icon icon="bi:camera-fill" className="size-4" aria-hidden />
            )}
          </span>
        )}
      </button>
    </div>
  )
}
