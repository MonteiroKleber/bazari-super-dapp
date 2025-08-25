import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '../store/authStore'
import { AccountTerms } from './AccountTerms'
import { SeedReveal } from './SeedReveal'
import { SeedConfirm } from './SeedConfirm'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'

// seed real
import { mnemonicGenerate } from '@polkadot/util-crypto'

type Step = 'terms' | 'reveal' | 'confirm'

export const CreateAccountFlow: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  

  // store
  const { setSeedPhrase, importLocalFromSeed, loginLocal } = useAuthStore()

  // steps
  const [currentStep, setCurrentStep] = React.useState<Step>('terms')
  const [generatedSeed, setGeneratedSeed] = React.useState<string[]>([])

  // senha (novo, sem mudar layout geral)
  const [password, setPassword] = React.useState('')
  const [password2, setPassword2] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const pwdOk = password.length >= 8 && password === password2

  const generateSeedPhrase = (): string[] => {
    const phrase = mnemonicGenerate(12) // 12 palavras
    return phrase.trim().split(/\s+/g).slice(0, 12)
  }

  // 1) aceitar termos -> gerar seed real e mostrar
  const handleTermsAccepted = () => {
    const seed = generateSeedPhrase()
    setGeneratedSeed(seed)
    setSeedPhrase(seed)
    setCurrentStep('reveal')
  }

  // 2) usuário viu seed -> segue para confirmar
  const handleSeedRevealed = () => {
    setCurrentStep('confirm')
  }

  // 3) confirmar seed -> pedir senha e finalizar
  const finalizeWithPassword = async () => {
    if (!pwdOk || creating) return
    setCreating(true)
    try {
      const mnemonic = generatedSeed.join(' ')
      // Persistimos a conta local cifrada (compatível com Polkadot.js)
      const address = await importLocalFromSeed(mnemonic, 'Minha conta', password)
      // Desbloqueia e cria sessão
      await loginLocal(address, password)
      navigate('/dashboard')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        {/* Indicador de passos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {['terms', 'reveal', 'confirm'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step ||
                    (['reveal', 'confirm'].includes(currentStep) && step === 'terms') ||
                    (currentStep === 'confirm' && step === 'reveal')
                      ? 'bg-bazari-red text-white'
                      : 'bg-sand-200 text-matte-black-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      (['reveal', 'confirm'].includes(currentStep) && index === 0) ||
                      (currentStep === 'confirm' && index === 1)
                        ? 'bg-bazari-red'
                        : 'bg-sand-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-matte-black-600">
            {currentStep === 'terms' && t('auth.create.step.terms', 'Aceitar Termos')}
            {currentStep === 'reveal' && t('auth.create.step.reveal', 'Seed Phrase')}
            {currentStep === 'confirm' && t('auth.create.step.confirm', 'Confirmação')}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 'terms' && (
            <motion.div
              key="terms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AccountTerms onAccept={handleTermsAccepted} />
            </motion.div>
          )}

          {currentStep === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SeedReveal seedPhrase={generatedSeed} onContinue={handleSeedRevealed} />
            </motion.div>
          )}

          {currentStep === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <SeedConfirm originalSeed={generatedSeed} onConfirmed={() => { /* mantém validação visual */ }} />

              {/* Bloco de senha — segue padrão dos inputs/botões do app */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('auth.create.password_label', 'Defina uma senha (min. 8 caracteres)')}
                </label>
                <Input
                  type="password"
                  placeholder={t('auth.create.password', 'Senha')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder={t('auth.create.password_confirm', 'Confirmar senha')}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={!pwdOk || creating}
                  onClick={finalizeWithPassword}
                >
                  {creating ? t('auth.create.finalizing', 'Finalizando…') : t('auth.create.finish_and_enter', 'Finalizar e entrar')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
