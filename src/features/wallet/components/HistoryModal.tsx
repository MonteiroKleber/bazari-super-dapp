// src/features/wallet/components/HistoryModal.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { useWalletStore } from '../store/walletStore'
import { getTransactionHistory } from '../services/tx'
import { Button } from '@shared/ui/Button'
import { Card } from '@shared/ui/Card'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { X, History, ExternalLink, Send, ArrowDownToLine } from 'lucide-react'

interface HistoryModalProps {
  onClose: () => void
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const { t } = useI18n()
  const { activeAccount } = useWalletStore()
  
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (activeAccount) {
      loadHistory()
    }
  }, [activeAccount])

  const loadHistory = async () => {
    if (!activeAccount) return
    
    setIsLoading(true)
    try {
      const history = await getTransactionHistory(activeAccount.address)
      setTransactions(history)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <History className="text-bazari-red" size={24} />
              <h2 className="text-xl font-semibold">
                {t('wallet.history.title', 'Histórico de Transações')}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-matte-black-600 mt-2">
                  {t('wallet.history.loading', 'Carregando histórico...')}
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="mx-auto mb-4 text-matte-black-400" size={48} />
                <h3 className="text-lg font-medium mb-2">
                  {t('wallet.history.no_transactions', 'Nenhuma transação encontrada')}
                </h3>
                <p className="text-matte-black-600">
                  {t('wallet.history.no_transactions_desc', 'Suas transações aparecerão aqui.')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <TransactionItem key={tx.hash || index} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

const TransactionItem: React.FC<{ transaction: any }> = ({ transaction }) => {
  const { t } = useI18n()
  
  return (
    <Card className="p-4 hover:bg-sand-25 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            transaction.type === 'send' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            {transaction.type === 'send' ? <Send size={14} /> : <ArrowDownToLine size={14} />}
          </div>
          
          <div>
            <p className="font-medium text-sm">
              {transaction.type === 'send' ? 
                t('wallet.history.sent', 'Enviado') : 
                t('wallet.history.received', 'Recebido')
              }
            </p>
            <p className="text-xs text-matte-black-600">
              {new Date(transaction.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`font-semibold text-sm ${
            transaction.type === 'send' ? 'text-red-600' : 'text-green-600'
          }`}>
            {transaction.type === 'send' ? '-' : '+'}{transaction.amount} {transaction.symbol}
          </p>
          <p className="text-xs text-matte-black-600">
            {transaction.status}
          </p>
        </div>
      </div>

      {transaction.hash && (
        <div className="mt-3 pt-3 border-t border-sand-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-matte-black-600">
              {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-8)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs flex items-center gap-1"
            >
              <ExternalLink size={12} />
              {t('wallet.history.explorer', 'Ver no Explorer')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
