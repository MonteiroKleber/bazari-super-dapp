import React from 'react'
import { motion } from 'framer-motion'
import { Globe2, Users, Scale, Shield, Network, Sparkles } from 'lucide-react'
import { Header } from '@shared/layout/Header'
import { Footer } from '@shared/layout/Footer'
import { Card } from '@shared/ui/Card'
import { useI18n } from '@app/providers/I18nProvider'

const AboutPage: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-matte-black-25">
      <Header variant="public" />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-36 w-[34rem] h-[34rem] rounded-full bg-matte-black-100 blur-3xl opacity-40" />
          <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-matte-black-50 blur-3xl opacity-50" />
        </div>

        <div className="container mx-auto px-6 lg:px-10 py-16 lg:py-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-matte-black-200 bg-white/70 backdrop-blur text-sm text-matte-black-700"
          >
            <Globe2 size={16} />
            {t('about.nation.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-matte-black-900"
          >
            {t('about.nation.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg lg:text-2xl text-matte-black-600 max-w-4xl mx-auto"
          >
            {t('about.nation.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <h2 className="text-2xl md:text-4xl font-bold text-matte-black-900 text-center">
          {t('about.pillars.title')}
        </h2>
        <p className="mt-4 text-matte-black-600 text-center max-w-3xl mx-auto">
          {t('about.pillars.subtitle')}
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
              <Shield />
            </div>
            <h3 className="mt-4 font-semibold">{t('about.pillars.sovereignty.title')}</h3>
            <p className="mt-2 text-matte-black-600">{t('about.pillars.sovereignty.desc')}</p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
              <Users />
            </div>
            <h3 className="mt-4 font-semibold">{t('about.pillars.governance.title')}</h3>
            <p className="mt-2 text-matte-black-600">{t('about.pillars.governance.desc')}</p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
              <Network />
            </div>
            <h3 className="mt-4 font-semibold">{t('about.pillars.subdaos.title')}</h3>
            <p className="mt-2 text-matte-black-600">{t('about.pillars.subdaos.desc')}</p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
              <Scale />
            </div>
            <h3 className="mt-4 font-semibold">{t('about.pillars.dex.title')}</h3>
            <p className="mt-2 text-matte-black-600">{t('about.pillars.dex.desc')}</p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-xl bg-matte-black-100 flex items-center justify-center">
              <Sparkles />
            </div>
            <h3 className="mt-4 font-semibold">{t('about.pillars.economy.title')}</h3>
            <p className="mt-2 text-matte-black-600">{t('about.pillars.economy.desc')}</p>
          </Card>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="container mx-auto px-6 lg:px-10 py-4 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold">{t('about.mv.mission.title')}</h3>
            <p className="mt-2 text-matte-black-600">{t('about.mv.mission.desc')}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold">{t('about.mv.vision.title')}</h3>
            <p className="mt-2 text-matte-black-600">{t('about.mv.vision.desc')}</p>
          </Card>
        </div>
      </section>

      {/* VALUES */}
      <section className="container mx-auto px-6 lg:px-10 pb-20">
        <h3 className="text-2xl font-bold text-matte-black-900">{t('about.values.title')}</h3>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="font-semibold">{t('about.values.community.title')}</h4>
            <p className="mt-2 text-matte-black-600">{t('about.values.community.desc')}</p>
          </Card>
          <Card className="p-6">
            <h4 className="font-semibold">{t('about.values.transparency.title')}</h4>
            <p className="mt-2 text-matte-black-600">{t('about.values.transparency.desc')}</p>
          </Card>
          <Card className="p-6">
            <h4 className="font-semibold">{t('about.values.freedom.title')}</h4>
            <p className="mt-2 text-matte-black-600">{t('about.values.freedom.desc')}</p>
          </Card>
        </div>
      </section>

      <Footer variant="public" />
    </div>
  )
}

export default AboutPage