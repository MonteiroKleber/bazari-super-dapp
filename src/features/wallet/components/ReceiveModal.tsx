// src/features/wallet/components/ReceiveModal.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { Card } from '@shared/ui/Card'
import { toast } from '@features/notifications/components/NotificationToastHost'
import { QRCodeSVG } from 'qrcode.react'
import {
  X,
  Copy,
  Share2,
  QrCode,
  ArrowDownToLine
} from 'lucide-react'

interface ReceiveModalProps {
  onClose: () => void
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({ onClose }) => {
  const { t } = useI18n()
  const { activeAccount, selectedToken } = useWalletStore()

  const [requestAmount, setRequestAmount] = React.useState('')
  const [requestMemo, setRequestMemo] = React.useState('')
  const [showQR, setShowQR] = React.useState(false)

  if (!activeAccount) return null

  const address = activeAccount.address

  // Generate payment request URL/string
  const generatePaymentRequest = () => {
    if (!requestAmount && !requestMemo) return address

    const params = new URLSearchParams()
    if (requestAmount) params.set('amount', requestAmount)
    if (requestMemo) params.set('memo', requestMemo)
    if (selectedToken && !selectedToken.isNative) {
      params.set('asset', selectedToken.assetId.toString())
    }

    return `${address}?${params.toString()}`
  }

  const paymentRequest = generatePaymentRequest()

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      toast.success(t('wallet.receive.address_copied', 'Endereço copiado!'))
    } catch (error) {
      toast.error(t('wallet.receive.copy_error', 'Erro ao copiar'))
    }
  }

  const handleCopyRequest = async () => {
    try {
      await navigator.clipboard.writeText(paymentRequest)
      toast.success(t('wallet.receive.request_copied', 'Solicitação copiada!'))
    } catch (error) {
      toast.error(t('wallet.receive.copy_error', 'Erro ao copiar'))
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('wallet.receive.share_title', 'Solicitação de pagamento'),
          text: requestAmount 
            ? t('wallet.receive.share_text_amount', `Envie ${requestAmount} ${selectedToken?.symbol || 'BZR'} para:`)
            : t('wallet.receive.share_text', 'Envie para este endereço:'),
          url: paymentRequest
        })
      } catch (error) {
        // Fallback to copy
        handleCopyRequest()
      }
    } else {
      handleCopyRequest()
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
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="text-bazari-red" size={24} />
              <h2 className="text-xl font-semibold">
                {t('wallet.receive.title', 'Receber')}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Account Info */}
            <div className="text-center">
              <h3 className="font-medium text-lg mb-1">{activeAccount.name}</h3>
              <p className="text-sm text-matte-black-600">
                {address.slice(0, 8)}...{address.slice(-8)}
              </p>
            </div>

            {/* Payment Request Form */}
            <Card className="p-4 bg-sand-25">
              <h4 className="font-medium mb-3">
                {t('wallet.receive.payment_request', 'Solicitação de Pagamento')}
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-matte-black-700">
                    {t('wallet.receive.amount_optional', 'Valor (opcional)')}
                  </label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="0.00"
                      className="pr-16"
                      step="any"
                      min="0"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-matte-black-600">
                      {selectedToken?.symbol || 'BZR'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-matte-black-700">
                    {t('wallet.receive.memo_optional', 'Memo (opcional)')}
                  </label>
                  <Input
                    value={requestMemo}
                    onChange={(e) => setRequestMemo(e.target.value)}
                    placeholder={t('wallet.receive.memo_placeholder', 'Adicionar uma mensagem...')}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* QR Code */}
            {!showQR ? (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowQR(true)}
                  className="flex items-center gap-2"
                >
                  <QrCode size={16} />
                  {t('wallet.receive.show_qr', 'Mostrar QR Code')}
                </Button>
              </div>
            ) : (
              <Card className="p-4 text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCodeSVG 
                    value={paymentRequest}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>
                <p className="text-xs text-matte-black-600 mt-2">
                  {t('wallet.receive.qr_desc', 'Escaneie para enviar pagamento')}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQR(false)}
                  className="mt-2"
                >
                  {t('wallet.receive.hide_qr', 'Ocultar QR')}
                </Button>
              </Card>
            )}

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-matte-black-700 mb-2 block">
                {t('wallet.receive.your_address', 'Seu Endereço')}
              </label>
              <div className="flex gap-2">
                <Input
                  value={address}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Copy size={14} />
                  {t('wallet.receive.copy', 'Copiar')}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCopyRequest}
                className="flex-1 flex items-center gap-2"
              >
                <Copy size={16} />
                {requestAmount ? 
                  t('wallet.receive.copy_request', 'Copiar Solicitação') : 
                  t('wallet.receive.copy_address', 'Copiar Endereço')
                }
              </Button>
              
              <Button
                onClick={handleShare}
                className="flex-1 flex items-center gap-2"
              >
                <Share2 size={16} />
                {t('wallet.receive.share', 'Compartilhar')}
              </Button>
            </div>

            {/* Info */}
            <Card className="p-3 bg-blue-50 border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>{t('wallet.receive.info_title', 'Dica:')} </strong>
                {t('wallet.receive.info_desc', 'Você pode receber BZR e tokens neste endereço. Certifique-se de estar na rede correta.')}
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
