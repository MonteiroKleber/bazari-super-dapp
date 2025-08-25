// src/features/wallet/components/TokenList.tsx
import React from 'react'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { Card } from '@shared/ui/Card'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { formatBalance } from '../utils/formatters'
import { Coins, TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@shared/ui/Button'

export const TokenList: React.FC = () => {
  const { t } = useI18n()
  const { tokens, isLoading, refreshBalances, activeAccount } = useWalletStore()

  const handleRefresh = async () => {
    await refreshBalances()
  }

  if (isLoading && tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-matte-black-600 mt-2">
            {t('wallet.tokens.loading', 'Carregando tokens...')}
          </p>
          {activeAccount && (
            <p className="text-xs text-matte-black-500 mt-1">
              {t('wallet.tokens.loading_for', 'Para')}: {activeAccount.name}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <Coins className="mx-auto mb-4 text-matte-black-400" size={48} />
        <h3 className="text-lg font-medium mb-2">
          {t('wallet.tokens.no_tokens', 'Nenhum token encontrado')}
        </h3>
        <p className="text-matte-black-600 mb-4">
          {t('wallet.tokens.no_tokens_desc', 'Adicione tokens personalizados para vê-los aqui.')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {t('wallet.tokens.title', 'Seus Tokens')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          {t('wallet.tokens.refresh', 'Atualizar')}
        </Button>
      </div>

      <div className="grid gap-4">
        {tokens.map((token) => (
          <TokenCard key={`${token.symbol}-${token.assetId}`} token={token} />
        ))}
      </div>
    </div>
  )
}

const TokenCard: React.FC<{ token: any }> = ({ token }) => {
  const { t } = useI18n()
  const { setSelectedToken } = useWalletStore()

  const formattedBalance = formatBalance(token.balance, token.decimals)
  const hasBalance = parseFloat(token.balance) > 0

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        hasBalance ? 'border-l-4 border-l-success' : ''
      }`}
      onClick={() => setSelectedToken(token)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            token.isNative ? 'bg-bazari-red' : 'bg-matte-black-600'
          }`}>
            {token.symbol.charAt(0)}
          </div>
          
          <div>
            <h4 className="font-medium">{token.symbol}</h4>
            {!token.isNative && token.assetId && (
              <p className="text-sm text-matte-black-600">
                Asset ID: {token.assetId}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold">
            {formattedBalance} {token.symbol}
          </p>
          {token.isNative && (
            <p className="text-xs text-matte-black-600">
              {t('wallet.tokens.native', 'Moeda nativa')}
            </p>
          )}
        </div>
      </div>

      {hasBalance && (
        <div className="mt-3 pt-3 border-t border-sand-200">
          <div className="flex items-center gap-2 text-sm text-success-600">
            <TrendingUp size={14} />
            <span>{t('wallet.tokens.available', 'Disponível')}</span>
          </div>
        </div>
      )}
    </Card>
  )
}