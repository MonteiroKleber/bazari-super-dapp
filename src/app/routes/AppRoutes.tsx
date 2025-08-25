// src/app/routes/AppRoutes.tsx

import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { AuthGuard } from '@shared/guards/AuthGuard'

import { WalletRoutes } from '@features/wallet/routes/wallet.routes'


// Lazy load pages
const LandingPage = React.lazy(() => import('@pages/LandingPage'))
const HelpPage = React.lazy(() => import('@pages/HelpPage'))
const AboutPage = React.lazy(() => import('@pages/AboutPage'))

const LoginPage = React.lazy(() => import('@pages/LoginPage'))
const DashboardPage = React.lazy(() => import('@pages/DashboardPage'))


export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        } />

        <Route path="/wallet/*" element={<WalletRoutes />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}