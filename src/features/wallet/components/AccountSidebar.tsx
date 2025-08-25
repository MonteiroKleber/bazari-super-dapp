// src/features/wallet/components/AccountSidebar.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { createDerivedAccount, switchActiveAccount, renameAccount, removeAccount } from '../adapters/access'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { toast } from '@features/notifications/components/NotificationToastHost'
import {
  Plus,
  Download,
  Eye,
  Check,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Copy
} from 'lucide-react'

interface AccountSidebarProps {
  isVisible: boolean
  onClose: () => void
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({ isVisible, onClose }) => {
  const { t } = useI18n()
  const { accounts, activeAccount, loadAccounts, setActiveAccount } = useWalletStore()

  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [showImportForm, setShowImportForm] = React.useState(false)
  const [showWatchForm, setShowWatchForm] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<string | null>(null)
  const [newName, setNewName] = React.useState('')

  // Create derived account
  const handleCreateAccount = async (name: string) => {
    if (!name.trim()) return

    try {
      const password = window.prompt(t('wallet.accounts.password_prompt', 'Digite sua senha:'))
      if (!password) return

      // Find next derivation path
      const derivedAccounts = accounts.filter(acc => acc.derivationPath?.startsWith('//'))
      const nextIndex = derivedAccounts.length
      
      const address = await createDerivedAccount(name, nextIndex.toString(), password)
      await loadAccounts()
      
      toast.success(t('wallet.accounts.created', 'Conta criada com sucesso!'))
      setShowCreateForm(false)
    } catch (error) {
      toast.error(t('wallet.accounts.create_error', 'Erro ao criar conta'), String(error))
    }
  }

  // Copy address
  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success(t('wallet.accounts.address_copied', 'Endereço copiado!'))
    } catch (error) {
      toast.error(t('wallet.accounts.copy_error', 'Erro ao copiar endereço'))
    }
  }

  // Switch account
  const handleSwitchAccount = async (account: any) => {
    try {
      // Always use setActiveAccount for consistency
      await setActiveAccount(account)
      
      toast.success(t('wallet.accounts.switched', 'Conta alterada!'))
      onClose()
    } catch (error) {
      toast.error(t('wallet.accounts.switch_error', 'Erro ao trocar conta'), String(error))
    }
  }

  // Rename account
  const handleRename = async (address: string) => {
    if (!newName.trim()) return

    try {
      await renameAccount(address, newName)
      await loadAccounts()
      
      toast.success(t('wallet.accounts.renamed', 'Conta renomeada!'))
      setEditingAccount(null)
      setNewName('')
    } catch (error) {
      toast.error(t('wallet.accounts.rename_error', 'Erro ao renomear'), String(error))
    }
  }

  // Remove account
  const handleRemove = async (address: string, name: string) => {
    const confirmed = window.confirm(t('wallet.accounts.remove_confirm', `Tem certeza que deseja remover "${name}"?`))
    if (!confirmed) return

    try {
      await removeAccount(address)
      await loadAccounts()
      
      toast.success(t('wallet.accounts.removed', 'Conta removida!'))
    } catch (error) {
      toast.error(t('wallet.accounts.remove_error', 'Erro ao remover conta'), String(error))
    }
  }

  const sidebarContent = (
    <Card className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t('wallet.accounts.title', 'Contas')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center gap-2"
          >
            <Plus size={16} />
            {t('wallet.accounts.new', 'Nova Conta')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportForm(true)}
            className="w-full flex items-center gap-2"
          >
            <Download size={16} />
            {t('wallet.accounts.import', 'Importar')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWatchForm(true)}
            className="w-full flex items-center gap-2"
          >
            <Eye size={16} />
            {t('wallet.accounts.watch_only', 'Watch-Only')}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {accounts.map((account) => (
          <div
            key={account.address}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              account.isActive
                ? 'bg-bazari-red-50 border-bazari-red text-bazari-red-900'
                : 'hover:bg-sand-50'
            }`}
            onClick={() => !account.isActive && handleSwitchAccount(account)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {editingAccount === account.address ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-sm h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRename(account.address)
                        } else if (e.key === 'Escape') {
                          setEditingAccount(null)
                          setNewName('')
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRename(account.address)}
                      className="p-1"
                    >
                      <Check size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAccount(null)
                        setNewName('')
                      }}
                      className="p-1"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{account.name}</span>
                      {account.isActive && <Check size={14} className="text-bazari-red" />}
                      {account.isWatchOnly && <Eye size={12} className="text-matte-black-400" />}
                    </div>
                    <p className="text-xs text-matte-black-600 truncate">
                      {account.address.slice(0, 6)}...{account.address.slice(-6)}
                    </p>
                  </>
                )}
              </div>

              {!editingAccount && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyAddress(account.address)
                    }}
                    className="p-1"
                  >
                    <Copy size={12} />
                  </Button>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Show context menu
                      }}
                      className="p-1"
                    >
                      <MoreVertical size={12} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      {showCreateForm && (
        <CreateAccountForm
          onSubmit={handleCreateAccount}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </Card>
  )

  if (isVisible && window.innerWidth < 1024) {
    // Mobile overlay
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 h-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Desktop sidebar
  return (
    <div className={`w-80 ${isVisible ? 'block' : 'hidden'} lg:block`}>
      {sidebarContent}
    </div>
  )
}

// Helper component
const CreateAccountForm: React.FC<{
  onSubmit: (name: string) => void
  onCancel: () => void
}> = ({ onSubmit, onCancel }) => {
  const { t } = useI18n()
  const [name, setName] = React.useState('')

  return (
    <div className="p-4 border-t bg-sand-25">
      <h3 className="text-sm font-medium mb-3">
        {t('wallet.accounts.new', 'Nova Conta')}
      </h3>
      <div className="space-y-3">
        <Input
          placeholder={t('wallet.accounts.name_placeholder', 'Nome da conta')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              onSubmit(name)
            } else if (e.key === 'Escape') {
              onCancel()
            }
          }}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => name.trim() && onSubmit(name)}
            disabled={!name.trim()}
            className="flex-1"
          >
            {t('app.actions.create', 'Criar')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1"
          >
            {t('app.actions.cancel', 'Cancelar')}
          </Button>
        </div>
      </div>
    </div>
  )
}