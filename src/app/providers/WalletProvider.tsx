// src/app/providers/WalletProvider.tsx
import React, { createContext, useContext, useEffect } from 'react'
import { bazariApi } from '@features/wallet/api/bazariApi'
import { BazariSigner } from '@features/wallet/signing/BazariSigner'
import { useAuthStore } from '@features/auth/store/authStore'

const WalletContext = createContext<{}>({})

export const useWallet = () => useContext(WalletContext)


export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const initWallet = async () => {
      if (isAuthenticated) {
        try {
          console.log('🔄 Initializing wallet...')
          await bazariApi.connect()
          
          // Perform health check
          const health = await bazariApi.healthCheck()
          console.log('🏥 API Health:', health)
          
          if (!health.healthy) {
            console.warn('⚠️ API not healthy:', health.details)
          }
          
          const signer = new BazariSigner()
          bazariApi.setSigner(signer)
          console.log('🔗 Wallet inicializada com sucesso')
        } catch (error) {
          console.error('❌ Erro ao inicializar wallet:', error)
          console.error('💡 Possíveis soluções:')
          console.error('  1. Verifique se o node BazariChain está rodando')
          console.error('  2. Confirme a URL do WebSocket no .env')
          console.error('  3. Verifique conectividade de rede')
        }
      }
    }

    initWallet()

    return () => {
      bazariApi.disconnect().catch(console.error)
    }
  }, [isAuthenticated])

  return (
    <WalletContext.Provider value={{}}>
      {children}
    </WalletContext.Provider>
  )
}