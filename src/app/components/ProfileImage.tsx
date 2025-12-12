'use client'

import { useState } from 'react'

interface ProfileImageProps {
  src?: string
  alt: string
  className?: string
  fallbackText?: string
}

export default function ProfileImage({ src, alt, className = "w-8 h-8 rounded-full", fallbackText }: ProfileImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    const initials = (fallbackText || alt || '?')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div
        className={`${className} bg-matrix-primary/20 flex items-center justify-center text-matrix-primary font-bold text-xs`}
        title={alt}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} border border-matrix-primary/30`}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}