import React from 'react'
import { I18nProvider } from './I18nProvider'
import { NotificationProvider } from './NotificationProvider'
//import { useMarketplaceStore } from '@features/marketplace/store/marketplaceStore'
//import { useEnterpriseStore } from '@features/marketplace/store/enterpriseStore'
import { ChainProvider } from './ChainProvider'
import { PasswordPromptProvider } from './PasswordPromptProvider'


interface AppProvidersProps {
  children: React.ReactNode
}

// Mantém seu initializer de mocks (logs etc.)
/*
const MockDataInitializer: React.FC = () => {
  const { initializeMarketplaceMock, listings } = useMarketplaceStore()
  const { initializeEnterprisesMock, enterprises } = useEnterpriseStore()

  React.useEffect(() => {
    // seus logs e inicializações existentes aqui…
    initializeMarketplaceMock?.()
    initializeEnterprisesMock?.()
  }, [initializeMarketplaceMock, initializeEnterprisesMock])

  return null
}
*/

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    
    <I18nProvider>
      <NotificationProvider>
        <ChainProvider>
          <PasswordPromptProvider>
            {children}
          </PasswordPromptProvider>
        </ChainProvider>
      </NotificationProvider>
    </I18nProvider>
  
  )
}
