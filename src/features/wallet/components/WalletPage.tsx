// src/features/wallet/components/WalletPage.tsx
import React from 'react'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { AccountSidebar } from './AccountSidebar'
import { TokenList } from './TokenList'
import { NFTList } from './NFTList'
import { SendModal } from './SendModal'
import { ReceiveModal } from './ReceiveModal'
import { HistoryModal } from './HistoryModal'
import { AddTokenModal } from './AddTokenModal'
import { Header } from '@shared/layout/Header'
import { Button } from '@shared/ui/Button'
import { Card } from '@shared/ui/Card'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { 
  Menu, 
  Send, 
  ArrowDownToLine, 
  History, 
  Plus,
  Wallet2
} from 'lucide-react'

export const WalletPage: React.FC = () => {
  const { t } = useI18n()
  const {
    accounts,
    activeAccount,
    activeTab,
    showSidebar,
    isLoading,
    error,
    setShowSidebar,
    setActiveTab,
    loadAccounts,
    loadTokens,
    refreshBalances
  } = useWalletStore()

  const [showSendModal, setShowSendModal] = React.useState(false)
  const [showReceiveModal, setShowReceiveModal] = React.useState(false)
  const [showHistoryModal, setShowHistoryModal] = React.useState(false)
  const [showAddTokenModal, setShowAddTokenModal] = React.useState(false)

  React.useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // Load tokens when accounts change or activeAccount changes
  React.useEffect(() => {
    if (activeAccount) {
      loadTokens()
    }
  }, [activeAccount?.address, loadTokens])

  // Auto-refresh tokens every 30 seconds
  React.useEffect(() => {
    if (activeAccount) {
      const interval = setInterval(() => {
        refreshBalances()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [activeAccount?.address, refreshBalances])

  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-sand">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <Wallet2 className="mx-auto mb-4 text-matte-black-400" size={48} />
            <h2 className="text-xl font-semibold mb-2">
              {t('wallet.no_account_title', 'Nenhuma conta encontrada')}
            </h2>
            <p className="text-matte-black-600 mb-4">
              {t('wallet.no_account_desc', 'Crie ou importe uma conta para usar a wallet.')}
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              {t('wallet.create_account', 'Criar Conta')}
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <Header />
      
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex items-center gap-2"
        >
          <Menu size={16} />
          {t('wallet.accounts.title', 'Contas')}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        <div className="flex gap-6">
          {/* Sidebar de Contas */}
          <AccountSidebar 
            isVisible={showSidebar}
            onClose={() => setShowSidebar(false)}
          />

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            {error && (
              <Card className="p-4 mb-6 bg-red-50 border-red-200">
                <p className="text-red-800 text-sm">{error}</p>
              </Card>
            )}

            {/* Header da Wallet */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-matte-black-900">
                    {t('wallet.title', 'Carteira')}
                  </h1>
                  <p className="text-matte-black-600">
                    {activeAccount.name}
                  </p>
                </div>
                
                {isLoading && <LoadingSpinner size="sm" />}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="sm"
                  onClick={() => setShowSendModal(true)}
                  className="flex items-center gap-2"
                >
                  <Send size={16} />
                  {t('wallet.actions.send', 'Enviar')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReceiveModal(true)}
                  className="flex items-center gap-2"
                >
                  <ArrowDownToLine size={16} />
                  {t('wallet.actions.receive', 'Receber')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center gap-2"
                >
                  <History size={16} />
                  {t('wallet.actions.history', 'Histórico')}
                </Button>

                {activeTab === 'tokens' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddTokenModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    {t('wallet.actions.add_token', 'Adicionar Token')}
                  </Button>
                )}
              </div>
            </Card>

            {/* Tabs */}
            <Card className="mb-6">
              <div className="border-b">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('tokens')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'tokens'
                        ? 'border-bazari-red text-bazari-red'
                        : 'border-transparent text-matte-black-600 hover:text-matte-black-900'
                    }`}
                  >
                    {t('wallet.tabs.tokens', 'Tokens')}
                  </button>
                  <button
                    onClick={() => setActiveTab('nfts')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'nfts'
                        ? 'border-bazari-red text-bazari-red'
                        : 'border-transparent text-matte-black-600 hover:text-matte-black-900'
                    }`}
                  >
                    {t('wallet.tabs.nfts', 'NFTs')}
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'tokens' && <TokenList />}
                {activeTab === 'nfts' && <NFTList />}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showSendModal && <SendModal onClose={() => setShowSendModal(false)} />}
      {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} />}
      {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} />}
      {showAddTokenModal && <AddTokenModal onClose={() => setShowAddTokenModal(false)} />}
    </div>
  )
}