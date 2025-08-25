import React from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Copy, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'
import { toast } from '@features/notifications/components/NotificationToastHost'

interface SeedRevealProps {
  seedPhrase: string[]
  onContinue: () => void
}

export const SeedReveal: React.FC<SeedRevealProps> = ({ seedPhrase, onContinue }) => {
  const { t } = useI18n()
  const [isRevealed, setIsRevealed] = React.useState(false)
  const [hasCopied, setHasCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase.join(' '))
      setHasCopied(true)
      toast.success(t('auth.seed.copied'))
      setTimeout(() => setHasCopied(false), 3000)
    } catch (error) {
      toast.error('Erro ao copiar')
    }
  }

  const handleReveal = () => {
    setIsRevealed(true)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-matte-black-900 mb-4">
          {t('auth.seed.title')}
        </h2>
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-warning flex-shrink-0 mt-1" size={20} />
            <p className="text-sm text-warning-800">
              {t('auth.seed.warning')}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        {!isRevealed ? (
          <div className="bg-matte-black-100 rounded-xl p-8 text-center">
            <EyeOff className="text-matte-black-400 mx-auto mb-4" size={48} />
            <p className="text-matte-black-600 mb-6">
              {t('auth.seed.reveal')}
            </p>
            <Button onClick={handleReveal} variant="outline">
              <Eye size={16} className="mr-2" />
              Revelar Seed Phrase
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-matte-black-900 rounded-xl p-6"
          >
            <div className="grid grid-cols-3 gap-3 mb-6">
              {seedPhrase.map((word, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-3 text-center"
                >
                  <span className="text-xs text-matte-black-500 block mb-1">
                    {index + 1}
                  </span>
                  <span className="font-mono font-medium text-matte-black-900">
                    {word}
                  </span>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              {hasCopied ? (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  {t('auth.seed.copied')}
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  {t('auth.seed.copy')}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      <Button
        onClick={onContinue}
        disabled={!isRevealed}
        className="w-full"
        size="lg"
      >
        {t('app.actions.continue')}
      </Button>
    </div>
  )
}
