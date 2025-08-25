// src/shared/ui/Select.tsx

import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  error?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    placeholder = 'Selecione...', 
    value = '', 
    onChange, 
    options, 
    disabled = false, 
    error, 
    className = '',
    size = 'md',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }

    const baseClasses = `
      appearance-none
      w-full
      bg-white
      border border-sand-300
      rounded-lg
      focus:ring-2 focus:ring-bazari-red focus:border-transparent
      transition-colors
      ${sizeClasses[size]}
      ${disabled ? 'bg-sand-100 text-matte-black-400 cursor-not-allowed' : 'text-matte-black-900'}
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
        
        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={combinedClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown 
              size={16} 
              className={`${disabled ? 'text-matte-black-400' : 'text-matte-black-600'}`}
            />
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'