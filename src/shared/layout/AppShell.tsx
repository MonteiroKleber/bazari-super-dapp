// src/shared/layout/AppShell.tsx
// ✅ VERSÃO ORIGINAL RESTAURADA (sem modificações que quebram o app)

import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { ReturnButton } from './ReturnButton'

interface AppShellProps {
  children: React.ReactNode
  showReturnButton?: boolean
  returnTo?: string
  returnLabel?: string
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  showReturnButton = true,
  returnTo,
  returnLabel
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-sand">
      <Header variant="private" />
      
      <main className="flex-1">
        {showReturnButton && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <ReturnButton to={returnTo} label={returnLabel} />
          </div>
        )}
        {children}
      </main>
      
      <Footer variant="private" />
    </div>
  )
}