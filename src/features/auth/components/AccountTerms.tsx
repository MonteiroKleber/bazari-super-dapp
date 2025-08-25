import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, FileText, Shield, AlertCircle } from 'lucide-react'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'

interface AccountTermsProps {
  onAccept: () => void
}

export const AccountTerms: React.FC<AccountTermsProps> = ({ onAccept }) => {
  const { t } = useI18n()
  const [accepted, setAccepted] = React.useState(false)

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-matte-black-900 mb-4">
          {t('auth.terms.title')}
        </h2>
        <p className="text-matte-black-600">
          Antes de continuar, você precisa aceitar nossos termos de uso
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex items-start space-x-4 p-4 bg-sand-50 rounded-xl">
          <Shield className="text-bazari-red flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-matte-black-900 mb-2">
              Responsabilidade pela Seed Phrase
            </h3>
            <p className="text-sm text-matte-black-600">
              Você é totalmente responsável por guardar sua seed phrase em local seguro. 
              Não conseguimos recuperá-la se perdida.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-4 bg-bazari-gold-50 rounded-xl">
          <AlertCircle className="text-bazari-gold-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-matte-black-900 mb-2">
              Natureza Descentralizada
            </h3>
            <p className="text-sm text-matte-black-600">
              O Bazari é uma plataforma descentralizada. Transações são irreversíveis 
              e não podemos intermediar disputas diretamente.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-4 bg-success-50 rounded-xl">
          <FileText className="text-success flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-matte-black-900 mb-2">
              Política de Uso
            </h3>
            <p className="text-sm text-matte-black-600">
              Ao usar o Bazari, você concorda em não usar a plataforma para 
              atividades ilegais ou que violem nossos termos.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-3 mb-6">
        <button
          onClick={() => setAccepted(!accepted)}
          className="flex-shrink-0 mt-1"
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            accepted 
              ? 'bg-bazari-red border-bazari-red text-white' 
              : 'border-matte-black-300 hover:border-bazari-red'
          }`}>
            {accepted && <CheckCircle2 size={16} />}
          </div>
        </button>
        <label className="text-sm text-matte-black-700 cursor-pointer" onClick={() => setAccepted(!accepted)}>
          {t('auth.terms.accept')}
        </label>
      </div>

      <Button
        onClick={onAccept}
        disabled={!accepted}
        className="w-full"
        size="lg"
      >
        {t('app.actions.continue')}
      </Button>
    </div>
  )
}
