import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, User, Wallet, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@app/providers/I18nProvider'
import { Button } from '@shared/ui/Button'
import { Avatar } from '@shared/ui/Avatar'
import { LanguageSelector } from '@shared/ui/LanguageSelector'
import { NotificationBell } from '@features/notifications/components/NotificationBell'
import { useAuthStore } from '@features/auth/store/authStore'

interface HeaderProps {
  variant?: 'public' | 'private'
}

export const Header: React.FC<HeaderProps> = ({ variant = 'private' }) => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (variant === 'public') {
    return (
      <header className="bg-white shadow-soft border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-bazari-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-matte-black-900">Bazari</span>
            </Link>

            {/* Public Actions */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/login')}
              >
                {t('landing.hero.cta_secondary')}
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => navigate('/login')}
              >
                {t('landing.hero.cta_primary')}
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-soft border-b border-sand-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
            >
              <Menu size={20} />
            </Button>
            
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-bazari-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-matte-black-900 hidden sm:block">
                Bazari
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/marketplace" 
              className="text-matte-black-600 hover:text-bazari-red transition-colors"
            >
              Marketplace
            </Link>
            <Link 
              to="/wallet" 
              className="text-matte-black-600 hover:text-bazari-red transition-colors"
            >
              {t('header.wallet')}
            </Link>
            <Link 
              to="/dao" 
              className="text-matte-black-600 hover:text-bazari-red transition-colors"
            >
              DAO
            </Link>
            <Link 
              to="/social" 
              className="text-matte-black-600 hover:text-bazari-red transition-colors"
            >
              Social
            </Link>
            <Link 
              to="/work" 
              className="text-matte-black-600 hover:text-bazari-red transition-colors"
            >
              Work
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <NotificationBell />
            
            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2"
              >
                <Avatar 
                  src={user?.avatar} 
                  fallback={user?.name}
                  size="sm"
                />
              </Button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-soft-lg border border-sand-200 py-2 z-50"
                >
                  <Link
                    to="/me/profile"
                    className="flex items-center px-4 py-2 text-sm text-matte-black-700 hover:bg-sand-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} className="mr-3" />
                    {t('header.profile')}
                  </Link>
                  <Link
                    to="/wallet"
                    className="flex items-center px-4 py-2 text-sm text-matte-black-700 hover:bg-sand-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Wallet size={16} className="mr-3" />
                    {t('header.wallet')}
                  </Link>
                  <hr className="my-2 border-sand-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-danger hover:bg-danger-50"
                  >
                    <LogOut size={16} className="mr-3" />
                    {t('header.logout')}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
