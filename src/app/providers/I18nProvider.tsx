import React, { createContext, useContext, useState, useEffect } from 'react'
import translations from '@app/i18n/translations.json'

type Language = 'pt' | 'en' | 'es'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('bazari_language')
    if (saved && ['pt', 'en', 'es'].includes(saved)) {
      return saved as Language
    }
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('pt')) return 'pt'
    if (browserLang.startsWith('es')) return 'es'
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('bazari_language', language)
    document.documentElement.lang = language
  }, [language])

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (value && typeof value === 'object' && language in value) {
      return value[language]
    }

    console.warn(`Translation not found for key: ${key} in language: ${language}`)
    return key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}
