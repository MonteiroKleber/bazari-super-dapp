// src/features/wallet/components/SendModal.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { sendBZR, sendAsset } from '../services/tx'
import { formatBalance, parseBalance } from '../utils/formatters'
import { isValidAddress } from '../utils/validators'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Card } from '@shared/ui/Card'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { toast } from '@features/notifications/components/NotificationToastHost'
import {
  X,
  ArrowRight,
  Send,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface SendModalProps {
  onClose: () => void
}

type Step = 'select-token' | 'enter-recipient' | 'enter-amount' | 'review' | 'sending' | 'success'

export const SendModal: React.FC<SendModalProps> = ({ onClose }) => {
  const { t } = useI18n()
  const { tokens, activeAccount } = useWalletStore()

  const [currentStep, setCurrentStep] = React.useState<Step>('select-token')
  const [selectedToken, setSelectedToken] = React.useState<any>(null)
  const [recipient, setRecipient] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [memo, setMemo] = React.useState('')
  const [txHash, setTxHash] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const availableTokens = tokens.filter(token => parseFloat(token.balance) > 0)

  const handleSelectToken = (token: any) => {
    setSelectedToken(token)
    setCurrentStep('enter-recipient')
  }

  const handleSetRecipient = () => {
    if (!isValidAddress(recipient)) {
      setError(t('wallet.send.invalid_address', 'Endereço inválido'))
      return
    }
    setError(null)
    setCurrentStep('enter-amount')
  }

  const handleSetAmount = () => {
    const amountNum = parseFloat(amount)
    const maxBalance = parseFloat(formatBalance(selectedToken.balance, selectedToken.decimals))
    
    if (!amountNum || amountNum <= 0) {
      setError(t('wallet.send.invalid_amount', 'Valor inválido'))
      return
    }
    
    if (amountNum > maxBalance) {
      setError(t('wallet.send.insufficient_balance', 'Saldo insuficiente'))
      return
    }
    
    setError(null)
    setCurrentStep('review')
  }

  const handleSend = async () => {
    if (!activeAccount || !selectedToken) return

    setCurrentStep('sending')
    setError(null)

    try {
      const amountInUnits = parseBalance(amount, selectedToken.decimals)
      
      const txHash = selectedToken.isNative
        ? await sendBZR({
            from: activeAccount.address,
            to: recipient,
            amount: amountInUnits,
            memo
          })
        : await sendAsset({
            from: activeAccount.address,
            to: recipient,
            amount: amountInUnits,
            assetId: selectedToken.assetId,
            memo
          })

      setTxHash(txHash)
      setCurrentStep('success')
      
      toast.success(
        t('wallet.send.success', 'Transação enviada!'),
        t('wallet.send.success_desc', 'Sua transação foi enviada com sucesso.')
      )
    } catch (error) {
      console.error('Send error:', error)
      setError(String(error))
      setCurrentStep('review')
      
      toast.error(
        t('wallet.send.failed', 'Erro ao enviar'),
        String(error)
      )
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select-token':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Send className="mx-auto mb-3 text-bazari-red" size={32} />
              <h3 className="text-lg font-semibold mb-2">
                {t('wallet.send.select_token', 'Selecionar Token')}
              </h3>
              <p className="text-sm text-matte-black-600">
                {t('wallet.send.select_token_desc', 'Escolha qual token você quer enviar')}
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableTokens.map((token) => (
                <Card
                  key={`${token.symbol}-${token.assetId}`}
                  className="p-3 cursor-pointer hover:bg-sand-50 transition-colors"
                  onClick={() => handleSelectToken(token)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        token.isNative ? 'bg-bazari-red' : 'bg-matte-black-600'
                      }`}>
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-xs text-matte-black-600">
                          {formatBalance(token.balance, token.decimals)} disponível
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-matte-black-400" />
                  </div>
                </Card>
              ))}
            </div>

            {availableTokens.length === 0 && (
              <div className="text-center py-6">
                <AlertTriangle className="mx-auto mb-2 text-matte-black-400" size={32} />
                <p className="text-sm text-matte-black-600">
                  {t('wallet.send.no_balance', 'Nenhum token com saldo disponível')}
                </p>
              </div>
            )}
          </div>
        )

      case 'enter-recipient':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {t('wallet.send.recipient', 'Destinatário')}
              </h3>
              <p className="text-sm text-matte-black-600">
                {t('wallet.send.recipient_desc', 'Digite o endereço do destinatário')}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-matte-black-700">
                  {t('wallet.send.recipient_address', 'Endereço')}
                </label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-matte-black-700">
                  {t('wallet.send.memo_optional', 'Memo (opcional)')}
                </label>
                <Input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder={t('wallet.send.memo_placeholder', 'Adicionar uma mensagem...')}
                  className="mt-1"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('select-token')}
                className="flex-1"
              >
                {t('app.actions.back', 'Voltar')}
              </Button>
              <Button
                onClick={handleSetRecipient}
                disabled={!recipient.trim()}
                className="flex-1"
              >
                {t('app.actions.next', 'Próximo')}
              </Button>
            </div>
          </div>
        )

      case 'enter-amount':
        const maxBalance = formatBalance(selectedToken?.balance || '0', selectedToken?.decimals || 0)
        
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {t('wallet.send.amount', 'Valor')}
              </h3>
              <p className="text-sm text-matte-black-600">
                {t('wallet.send.amount_desc', 'Digite o valor que deseja enviar')}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-matte-black-700">
                    {t('wallet.send.amount_label', 'Valor')}
                  </label>
                  <span className="text-xs text-matte-black-600">
                    {t('wallet.send.available', 'Disponível')}: {maxBalance} {selectedToken?.symbol}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-16"
                    step="any"
                    min="0"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-matte-black-600">
                    {selectedToken?.symbol}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAmount(maxBalance)}
                  className="mt-1 text-xs"
                >
                  {t('wallet.send.max', 'Máximo')}
                </Button>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('enter-recipient')}
                className="flex-1"
              >
                {t('app.actions.back', 'Voltar')}
              </Button>
              <Button
                onClick={handleSetAmount}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1"
              >
                {t('app.actions.next', 'Próximo')}
              </Button>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {t('wallet.send.review', 'Revisar Transação')}
              </h3>
              <p className="text-sm text-matte-black-600">
                {t('wallet.send.review_desc', 'Verifique os detalhes antes de enviar')}
              </p>
            </div>

            <Card className="p-4 bg-sand-25">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-matte-black-600">{t('wallet.send.from', 'De')}:</span>
                  <span className="text-sm font-medium">
                    {activeAccount?.name} ({activeAccount?.address.slice(0, 6)}...{activeAccount?.address.slice(-6)})
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-matte-black-600">{t('wallet.send.to', 'Para')}:</span>
                  <span className="text-sm font-medium">
                    {recipient.slice(0, 6)}...{recipient.slice(-6)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-matte-black-600">{t('wallet.send.amount', 'Valor')}:</span>
                  <span className="text-sm font-semibold">
                    {amount} {selectedToken?.symbol}
                  </span>
                </div>

                {memo && (
                  <div className="flex justify-between">
                    <span className="text-sm text-matte-black-600">{t('wallet.send.memo', 'Memo')}:</span>
                    <span className="text-sm">{memo}</span>
                  </div>
                )}
              </div>
            </Card>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('enter-amount')}
                className="flex-1"
              >
                {t('app.actions.back', 'Voltar')}
              </Button>
              <Button
                onClick={handleSend}
                className="flex-1 bg-bazari-red hover:bg-bazari-red-700"
              >
                {t('wallet.send.confirm', 'Confirmar Envio')}
              </Button>
            </div>
          </div>
        )

      case 'sending':
        return (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
            <h3 className="text-lg font-semibold mt-4 mb-2">
              {t('wallet.send.sending', 'Enviando...')}
            </h3>
            <p className="text-sm text-matte-black-600">
              {t('wallet.send.sending_desc', 'Sua transação está sendo processada')}
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto mb-4 text-success" size={48} />
            <h3 className="text-lg font-semibold mb-2">
              {t('wallet.send.success', 'Transação Enviada!')}
            </h3>
            <p className="text-sm text-matte-black-600 mb-4">
              {t('wallet.send.success_desc', 'Sua transação foi enviada com sucesso')}
            </p>
            
            {txHash && (
              <Card className="p-3 bg-sand-25 mb-4">
                <p className="text-xs text-matte-black-600 mb-1">Hash da transação:</p>
                <p className="text-xs font-mono break-all">{txHash}</p>
              </Card>
            )}

            <Button onClick={onClose} className="w-full">
              {t('app.actions.close', 'Fechar')}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">
              {t('wallet.send.title', 'Enviar Token')}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="p-6">
            {renderStepContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
