import React from 'react'

import { DefaultAvatar } from '@/assets/images'
import { cn } from '@/libs'
// import { Icon } from '@/libs';

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

export function Avatar({
  src,
  alt = 'User avatar',
  className = '',
  size = 'md',
  fallback,
  name,
}: Readonly<AvatarProps>) {
  const [error, setError] = React.useState(false)

  const handleError = () => {
    setError(true)
  }

  const getInitials = (fullName?: string) => {
    if (!fullName) return ''
    return fullName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  const imageSource = error || !src ? DefaultAvatar : src
  const initials = getInitials(name)

  if (error && fallback) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden shrink-0 rounded-full bg-gray-200 ${sizeClasses[size]} ${className}`}
      >
        {fallback}
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-full shrink-0 bg-gray-200 ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img
          src={imageSource}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleError}
        />
      ) : (
        <h1 className={cn(`text-[38px] leading-[38px] text-[#4b5675] font-semibold`, className)}>
          {initials?.charAt(0)}
          {initials?.charAt(1)}
        </h1>
      )}
    </div>
  )
}
