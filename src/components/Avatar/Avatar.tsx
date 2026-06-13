import React from 'react'

import { cn } from '@/libs'
import { getDisplayInitials } from '@/utils/getDisplayInitials'

type AvatarProps = {
  src?: string | null
  alt?: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  fallback?: React.ReactNode
  name?: string
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
}

const textSizeClasses = {
  xs: 'text-[10px]',
  sm: 'text-sm',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export function Avatar({
  src,
  alt = 'User avatar',
  className = '',
  size = 'md',
  fallback,
  name,
}: Readonly<AvatarProps>) {
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    setError(false)
  }, [src])

  const initials = getDisplayInitials(name)
  const showImage = Boolean(src) && !error
  const showInitials = !showImage && Boolean(initials)

  if (error && fallback) {
    return (
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden shrink-0 rounded-full bg-gray-200',
          sizeClasses[size],
          className,
        )}
      >
        {fallback}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden shrink-0 rounded-full',
        showInitials ? 'bg-primary-100' : 'bg-gray-200',
        sizeClasses[size],
        className,
      )}
      aria-label={showInitials ? `${name} avatar` : undefined}
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : showInitials ? (
        <span
          className={cn('font-semibold text-primary-700 select-none', textSizeClasses[size])}
          aria-hidden="true"
        >
          {initials}
        </span>
      ) : null}
    </div>
  )
}
