import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputType, setInputType] = React.useState(type)

    React.useEffect(() => {
      if (type === 'password') {
        setInputType(showPassword ? 'text' : 'password')
      }
    }, [type, showPassword])

    return (
      <div className="w-full">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-matte-black-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'form-input',
              leftIcon && 'pl-10',
              (rightIcon || type === 'password') && 'pr-10',
              error && 'border-danger focus:border-danger focus:ring-danger',
              className
            )}
            {...props}
          />
          
          {type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-400 hover:text-matte-black-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
          
          {rightIcon && type !== 'password' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-matte-black-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-matte-black-500">{helperText}</p>
        )}
      </div>
    )
  }
)
