// src/features/wallet/components/AddTokenModal.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { getTokenInfo } from '../services/assets'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { toast } from '@features/notifications/components/NotificationToastHost'
import { X, Plus, Search } from 'lucide-react'

interface AddTokenModalProps {
  onClose: () => void
}

export const AddTokenModal: React.FC<AddTokenModalProps> = ({ onClose }) => {
  const { t } = useI18n()
  const { addCustomToken } = useWalletStore()
  
  const [assetId, setAssetId] = React.useState('')
  const [tokenInfo, setTokenInfo] = React.useState<any>(null)
  const [isSearching, setIsSearching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSearch = async () => {
    const id = parseInt(assetId)
    if (!id || id < 0) {
      setError(t('wallet.add_token.invalid_id', 'ID do asset inválido'))
      return
    }

    setIsSearching(true)
    setError(null)
    setTokenInfo(null)

    try {
      const info = await getTokenInfo(id)
      if (info) {
        setTokenInfo(info)
      } else {
        setError(t('wallet.add_token.not_found', 'Token não encontrado'))
      }
    } catch (error) {
      setError(t('wallet.add_token.search_error', 'Erro ao buscar token'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleAdd = () => {
    if (tokenInfo) {
      addCustomToken(tokenInfo)
      toast.success(
        t('wallet.add_token.added', 'Token adicionado!'),
        `${tokenInfo.symbol} foi adicionado à sua carteira.`
      )
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Plus className="text-bazari-red" size={24} />
              <h2 className="text-xl font-semibold">
                {t('wallet.add_token.title', 'Adicionar Token')}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-matte-black-700 mb-2 block">
                {t('wallet.add_token.asset_id', 'Asset ID')}
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  placeholder="123"
                  min="0"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={!assetId || isSearching}
                  className="flex items-center gap-2"
                >
                  {isSearching ? <LoadingSpinner size="sm" /> : <Search size={16} />}
                  {t('wallet.add_token.search', 'Buscar')}
                </Button>
              </div>
              <p className="text-xs text-matte-black-600 mt-1">
                {t('wallet.add_token.asset_id_desc', 'Digite o ID do asset que deseja adicionar')}
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            {tokenInfo && (
              <div className="border rounded-lg p-4 bg-sand-25">
                <h3 className="font-medium mb-2">{t('wallet.add_token.token_info', 'Informações do Token')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-matte-black-600">{t('wallet.add_token.name', 'Nome')}:</span>
                    <span className="font-medium">{tokenInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-matte-black-600">{t('wallet.add_token.symbol', 'Símbolo')}:</span>
                    <span className="font-medium">{tokenInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-matte-black-600">{t('wallet.add_token.decimals', 'Decimais')}:</span>
                    <span className="font-medium">{tokenInfo.decimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-matte-black-600">Asset ID:</span>
                    <span className="font-medium">{tokenInfo.assetId}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {t('app.actions.cancel', 'Cancelar')}
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!tokenInfo}
                className="flex-1"
              >
                {t('wallet.add_token.add', 'Adicionar Token')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
