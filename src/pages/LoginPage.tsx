import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, UserPlus, LogIn, Download, Users } from 'lucide-react'
import { Header } from '@shared/layout/Header'
import { Button } from '@shared/ui/Button'
import { Card } from '@shared/ui/Card'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { CreateAccountFlow } from '@features/auth/components/CreateAccountFlow'
import { ImportAccountFlow } from '@features/auth/components/ImportAccountFlow'
import { ExistingAccountLogin } from '@features/auth/components/ExistingAccountLogin'

type LoginMode = 'select' | 'create' | 'import' | 'existing' | 'guest'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const { isAuthenticated } = useAuthStore()
  
  const [mode, setMode] = React.useState<LoginMode>(() => {
    // Check URL hash for initial mode
    const hash = location.hash.replace('#', '')
    if (['create', 'import', 'existing', 'guest'].includes(hash)) {
      return hash as LoginMode
    }
    return 'select'
  })

  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from)
    }
  }, [isAuthenticated, navigate, location])

  const handleBack = () => {
    if (mode === 'select') {
      navigate('/')
    } else {
      setMode('select')
    }
  }

  if (mode !== 'select') {
    return (
      <div className="min-h-screen bg-sand">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('app.actions.back')}
          </Button>

          {mode === 'create' && <CreateAccountFlow />}
          {mode === 'import' && <ImportAccountFlow />}
          {mode === 'existing' && <ExistingAccountLogin />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <Header variant="public" />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-matte-black-900 mb-4">
            {t('auth.login.title')}
          </h1>
          <p className="text-xl text-matte-black-600">
            {t('auth.login.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Account */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="p-8 h-full cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => setMode('create')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-bazari-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={32} className="text-bazari-red" />
                </div>
                <h2 className="text-xl font-semibold text-matte-black-900 mb-3">
                  {t('auth.login.new_account')}
                </h2>
                <p className="text-matte-black-600 mb-6">
                  Crie uma nova conta com seed phrase segura
                </p>
                <Button variant="primary" className="w-full">
                  Começar
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Existing Account */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="p-8 h-full cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => setMode('existing')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-bazari-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn size={32} className="text-bazari-gold-600" />
                </div>
                <h2 className="text-xl font-semibold text-matte-black-900 mb-3">
                  {t('auth.login.existing_account')}
                </h2>
                <p className="text-matte-black-600 mb-6">
                  Acesse sua conta existente
                </p>
                <Button variant="secondary" className="w-full">
                  Entrar
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Import Account */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="p-8 h-full cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => setMode('import')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download size={32} className="text-success" />
                </div>
                <h2 className="text-xl font-semibold text-matte-black-900 mb-3">
                  {t('auth.login.import_account')}
                </h2>
                <p className="text-matte-black-600 mb-6">
                  Restaure com seed phrase ou arquivo JSON
                </p>
                <Button variant="outline" className="w-full">
                  Importar
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Guest Mode */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              className="p-8 h-full cursor-pointer hover:shadow-soft-lg transition-shadow"
              onClick={() => navigate('/marketplace')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-matte-black-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-matte-black-600" />
                </div>
                <h2 className="text-xl font-semibold text-matte-black-900 mb-3">
                  {t('auth.login.guest_mode')}
                </h2>
                <p className="text-matte-black-600 mb-6">
                  Explore sem criar conta (funcionalidade limitada)
                </p>
                <Button variant="ghost" className="w-full">
                  Explorar
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
