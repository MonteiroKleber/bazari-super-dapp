import React from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const spinner = (
    <Loader2 className={clsx('animate-spin text-bazari-red', sizeClasses[size], className)} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-sand bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 shadow-soft-lg">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}
