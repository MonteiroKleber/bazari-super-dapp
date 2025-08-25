import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  ShoppingBag, 
  Wallet, 
  Users, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { useNotificationsStore, type Notification } from '../store/notificationsStore'

interface NotificationItemProps {
  notification: Notification
}

const NotificationIcons = {
  p2p_trade: MessageCircle,
  escrow: AlertTriangle,
  chat: MessageCircle,
  marketplace: ShoppingBag,
  wallet: Wallet,
  system: Info
}

const NotificationColors = {
  p2p_trade: 'text-bazari-gold-600',
  escrow: 'text-warning-600',
  chat: 'text-bazari-red-600',
  marketplace: 'text-success-600',
  wallet: 'text-bazari-red-600',
  system: 'text-matte-black-600'
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification
}) => {
  const navigate = useNavigate()
  const { markAsRead, removeNotification } = useNotificationsStore()
  
  const Icon = NotificationIcons[notification.type]
  const iconColor = NotificationColors[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeNotification(notification.id)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 hover:bg-sand-50 cursor-pointer relative ${
        !notification.read ? 'bg-bazari-red-50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-1 ${iconColor}`}>
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-matte-black-900 mb-1">
                {notification.title}
              </p>
              <p className="text-sm text-matte-black-600 mb-2">
                {notification.message}
              </p>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-matte-black-400">
                  {formatTime(notification.timestamp)}
                </span>
                
                {notification.priority === 'high' && (
                  <Badge variant="warning" size="sm">
                    Alta
                  </Badge>
                )}
                
                {notification.priority === 'critical' && (
                  <Badge variant="danger" size="sm">
                    Crítica
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <div className="w-2 h-2 bg-bazari-red rounded-full"></div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-danger-100 hover:text-danger"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
