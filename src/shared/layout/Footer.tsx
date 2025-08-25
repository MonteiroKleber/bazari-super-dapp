import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@app/providers/I18nProvider'

interface FooterProps {
  variant?: 'public' | 'private'
}

export const Footer: React.FC<FooterProps> = ({ variant = 'private' }) => {
  const { t } = useI18n()

  return (
    <footer className="bg-matte-black-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-bazari-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">Bazari</span>
            </div>
            <p className="text-gray-300 max-w-md">
              O futuro do comércio digital descentralizado. Marketplace, P2P, Wallet e muito mais.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Suporte
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('footer.help')}
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:contato@bazari.com" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/terms" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Bazari. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 text-sm mt-2 sm:mt-0">
            {t('footer.version')} 1.0.0
          </p>
        </div>
      </div>
    </footer>
  )
}
