// src/shared/ui/Textarea.tsx

import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  size?: 'sm' | 'md' | 'lg'
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    resize = 'vertical',
    size = 'md',
    className = '', 
    disabled = false,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    }

    const baseClasses = `
      w-full
      border border-sand-300
      rounded-lg
      focus:ring-2 focus:ring-bazari-red focus:border-transparent
      transition-colors
      ${sizeClasses[size]}
      ${resizeClasses[resize]}
      ${disabled 
        ? 'bg-sand-100 text-matte-black-400 cursor-not-allowed' 
        : 'bg-white text-matte-black-900'
      }
      ${error ? 'border-danger focus:ring-danger' : ''}
    `

    const combinedClasses = `${baseClasses} ${className}`.trim()

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-matte-black-700 mb-2">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          disabled={disabled}
          className={combinedClasses}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-danger">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-matte-black-600">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'