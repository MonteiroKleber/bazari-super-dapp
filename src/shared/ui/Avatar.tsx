import React from 'react'
import { clsx } from 'clsx'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className,
  fallback
}) => {
  const [imageError, setImageError] = React.useState(false)
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const shouldShowImage = src && !imageError

  return (
    <div className={clsx(
      'rounded-full bg-matte-black-200 flex items-center justify-center overflow-hidden',
      sizeClasses[size],
      className
    )}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : fallback ? (
        <span className="font-medium text-matte-black-600">
          {fallback.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className="w-1/2 h-1/2 text-matte-black-400" />
      )}
    </div>
  )
}
