import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/authStore'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'

interface Props { children: React.ReactNode }

export const AuthGuard: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <LoadingSpinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}
