import React from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { useNotificationsStore } from '../store/notificationsStore'
import { NotificationDrawer } from './NotificationDrawer'

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotificationsStore()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="p-2 relative"
        >
          <Bell size={20} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge variant="danger" size="sm" className="min-w-5 h-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      <NotificationDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
