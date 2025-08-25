import React from 'react'
import { motion } from 'framer-motion'
import { Globe2, HelpCircle, Shield, Store, Coins, Scale, Network, Wallet, Users } from 'lucide-react'
import { Header } from '@shared/layout/Header'
import { Footer } from '@shared/layout/Footer'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@shared/ui/Accordion'
import { Card } from '@shared/ui/Card'
import { useI18n } from '@app/providers/I18nProvider'

const HelpPage: React.FC = () => {
  const { t } = useI18n()

  const faqs = [
    { icon: Store,   title: t('help.sections.commerce.title'),   q: t('help.sections.commerce.q'),   a: t('help.sections.commerce.a') },
    { icon: Coins,   title: t('help.sections.p2p.title'),        q: t('help.sections.p2p.q'),        a: t('help.sections.p2p.a') },
    { icon: Scale,   title: t('help.sections.dex.title'),        q: t('help.sections.dex.q'),        a: t('help.sections.dex.a') },
    { icon: Network, title: t('help.sections.subdao.title'),     q: t('help.sections.subdao.q'),     a: t('help.sections.subdao.a') },
    { icon: Wallet,  title: t('help.sections.wallet.title'),     q: t('help.sections.wallet.q'),     a: t('help.sections.wallet.a') },
    { icon: Shield,  title: t('help.sections.security.title'),   q: t('help.sections.security.q'),   a: t('help.sections.security.a') },
  ]

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
            {t('help.nation.badge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-matte-black-900"
          >
            {t('help.nation.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg lg:text-2xl text-matte-black-600 max-w-4xl mx-auto"
          >
            {t('help.nation.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* FAQ SECTIONS */}
      <section className="container mx-auto px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((f, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center gap-3">
                <f.icon className="shrink-0" />
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>

              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-matte-black-600">{f.a}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>

        {/* CONTACT / COMMUNITY */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Users className="mx-auto" />
            <h4 className="mt-2 font-semibold">{t('help.contact.community.title')}</h4>
            <p className="mt-2 text-matte-black-600">{t('help.contact.community.desc')}</p>
          </Card>
          <Card className="p-6 text-center">
            <HelpCircle className="mx-auto" />
            <h4 className="mt-2 font-semibold">{t('help.contact.support.title')}</h4>
            <p className="mt-2 text-matte-black-600">{t('help.contact.support.desc')}</p>
          </Card>
          <Card className="p-6 text-center">
            <Shield className="mx-auto" />
            <h4 className="mt-2 font-semibold">{t('help.contact.safety.title')}</h4>
            <p className="mt-2 text-matte-black-600">{t('help.contact.safety.desc')}</p>
          </Card>
        </div>
      </section>

      <Footer variant="public" />
    </div>
  )
}

export default HelpPage