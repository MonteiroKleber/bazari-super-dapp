  // src/features/wallet/routes/wallet.routes.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { WalletPage } from '../components/WalletPage'
import { AuthGuard } from '@shared/guards/AuthGuard'

export const WalletRoutes: React.FC = () => {
  return (
    <AuthGuard>
      <Routes>
        <Route path="/" element={<WalletPage />} />
        <Route path="/*" element={<WalletPage />} />
      </Routes>
    </AuthGuard>
  )
}
