// src/shared/ui/Card.tsx

import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses = "rounded-lg border bg-white shadow-sm"
    const combinedClasses = `${baseClasses} ${className}`.trim()
    
    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses = "flex flex-col space-y-1.5 p-6"
    const combinedClasses = `${baseClasses} ${className}`.trim()
    
    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  className?: string
}

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses = "text-2xl font-semibold leading-none tracking-tight"
    const combinedClasses = `${baseClasses} ${className}`.trim()
    
    return (
      <h3
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  className?: string
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses = "text-sm text-gray-600"
    const combinedClasses = `${baseClasses} ${className}`.trim()
    
    return (
      <p
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </p>
    )
  }
)

CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses = "p-6 pt-0"
    const combinedClasses = `${baseClasses} ${className}`.trim()
    
    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    const baseClasses = "flex items-center p-6 pt-0"
    const combinedClasses = `${baseClasses} ${className}`.trim()
    
    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = "CardFooter"