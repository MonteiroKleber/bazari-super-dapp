import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Globe2, Users, Building2, Coins, Network, Scale, Shield, ChevronRight } from 'lucide-react'
import { Header } from '@shared/layout/Header'
import { Footer } from '@shared/layout/Footer'
import { Button } from '@shared/ui/Button'
import { Card } from '@shared/ui/Card'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { isAuthenticated } = useAuthStore()

  const handlePrimary = () => {
    if (isAuthenticated) {
      navigate('/hub')
    } else {
      navigate('/auth/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-matte-black-25">
      <Header variant="public" />

      {/* HERO – Digital Nation */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-matte-black-100 blur-3xl opacity-40" />
          <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-matte-black-50 blur-3xl opacity-50" />
        </div>

        <div className="container mx-auto px-6 lg:px-10 py-20 lg:py-28 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-matte-black-200 bg-white/70 backdrop-blur text-sm text-matte-black-700"
          >
            <Globe2 size={16} />
            {t('landing.nation.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-matte-black-900"
          >
            {t('landing.nation.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg lg:text-2xl text-matte-black-600 max-w-4xl mx-auto"
          >
            {t('landing.nation.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={handlePrimary} className="group">
              {t('landing.nation.cta_primary')}
              <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/hub')}>
              {t('landing.nation.cta_secondary')}
            </Button>
          </motion.div>

          <div className="mt-12 flex items-center justify-center gap-6 text-matte-black-500 text-sm">
            <div className="inline-flex items-center gap-2">
              <Shield size={16} /> {t('landing.nation.trustless')}
            </div>
            <div className="hidden sm:inline-flex items-center gap-2">
              <Network size={16} /> {t('landing.nation.borderless')}
            </div>
            <div className="hidden sm:inline-flex items-center gap-2">
              <Users size={16} /> {t('landing.nation.governedByPeople')}
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <h2 className="text-2xl md:text-4xl font-bold text-matte-black-900 text-center">
          {t('landing.modules.title')}
        </h2>
        <p className="mt-4 text-matte-black-600 text-center max-w-3xl mx-auto">
          {t('landing.modules.subtitle')}
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <Building2 className="shrink-0" />
              <h3 className="text-lg font-semibold">{t('landing.modules.commerce.title')}</h3>
            </div>
            <p className="mt-3 text-matte-black-600">{t('landing.modules.commerce.desc')}</p>
            <Button className="mt-4" variant="ghost" onClick={() => navigate('/marketplace')}>
              {t('landing.modules.commerce.cta')} <ChevronRight size={18} className="ml-1" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <Coins className="shrink-0" />
              <h3 className="text-lg font-semibold">{t('landing.modules.p2p.title')}</h3>
            </div>
            <p className="mt-3 text-matte-black-600">{t('landing.modules.p2p.desc')}</p>
            <Button className="mt-4" variant="ghost" onClick={() => navigate('/p2p')}>
              {t('landing.modules.p2p.cta')} <ChevronRight size={18} className="ml-1" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <Scale className="shrink-0" />
              <h3 className="text-lg font-semibold">{t('landing.modules.dex.title')}</h3>
            </div>
            <p className="mt-3 text-matte-black-600">{t('landing.modules.dex.desc')}</p>
            <Button className="mt-4" variant="ghost" onClick={() => navigate('/dex')}>
              {t('landing.modules.dex.cta')} <ChevronRight size={18} className="ml-1" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <Network className="shrink-0" />
              <h3 className="text-lg font-semibold">{t('landing.modules.subdao.title')}</h3>
            </div>
            <p className="mt-3 text-matte-black-600">{t('landing.modules.subdao.desc')}</p>
            <Button className="mt-4" variant="ghost" onClick={() => navigate('/dao')}>
              {t('landing.modules.subdao.cta')} <ChevronRight size={18} className="ml-1" />
            </Button>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS – Nation mechanics */}
      <section className="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-matte-black-900 text-center">
            {t('landing.how.title')}
          </h2>
          <p className="mt-4 text-matte-black-600 text-center">
            {t('landing.how.subtitle')}
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
                <Users />
              </div>
              <h3 className="mt-4 font-semibold">{t('landing.how.step1.title')}</h3>
              <p className="mt-2 text-matte-black-600">{t('landing.how.step1.desc')}</p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
                <Building2 />
              </div>
              <h3 className="mt-4 font-semibold">{t('landing.how.step2.title')}</h3>
              <p className="mt-2 text-matte-black-600">{t('landing.how.step2.desc')}</p>
            </Card>

            <Card className="p-6">
              <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
                <Shield />
              </div>
              <h3 className="mt-4 font-semibold">{t('landing.how.step3.title')}</h3>
              <p className="mt-2 text-matte-black-600">{t('landing.how.step3.desc')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 lg:px-10 pb-20">
        <div className="rounded-3xl bg-matte-black-900 text-white p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">{t('landing.cta.title')}</h3>
            <p className="mt-2 text-matte-black-200">{t('landing.cta.subtitle')}</p>
          </div>
          <Button size="lg" variant="light" onClick={handlePrimary} className="group">
            {t('landing.cta.button')}
            <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      <Footer variant="public" />
    </div>
  )
}

export default LandingPage