import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { EmptyState } from '@shared/ui/EmptyState'
import { useI18n } from '@app/providers/I18nProvider'
import { useNotificationsStore } from '../store/notificationsStore'
import { NotificationItem } from './NotificationItem'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useI18n()
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAll 
  } = useNotificationsStore()

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-soft-lg flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-sand-200">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-matte-black-900">
                  {t('notifications.title')}
                </h2>
                {unreadCount > 0 && (
                  <Badge variant="primary" size="sm">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        <CheckCheck size={16} className="mr-1" />
                        {t('notifications.mark_all_read')}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs text-danger hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <EmptyState
                  icon={<Bell size={48} />}
                  title={t('notifications.no_notifications')}
                  description="Você será notificado sobre atividades importantes aqui."
                  className="mt-12"
                />
              ) : (
                <div className="divide-y divide-sand-200">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
