import React from 'react'
import { clsx } from 'clsx'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={clsx('text-center py-12', className)}>
      {icon && (
        <div className="flex justify-center mb-4 text-matte-black-300">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-matte-black-700 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-matte-black-500 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {action && action}
    </div>
  )
}
