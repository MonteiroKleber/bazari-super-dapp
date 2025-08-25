import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'p2p_trade' | 'escrow' | 'chat' | 'marketplace' | 'wallet' | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionUrl?: string
  metadata?: Record<string, any>
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  getUnreadCount: () => number
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }

        set(state => {
          const newNotifications = [newNotification, ...state.notifications]
          const unreadCount = newNotifications.filter(n => !n.read).length
          
          return {
            notifications: newNotifications,
            unreadCount
          }
        })

        // Show toast for critical notifications
        if (notification.priority === 'critical') {
          // This would trigger a toast notification
          console.log('Critical notification:', notification.title)
        }
      },

      markAsRead: (id: string) => {
        set(state => {
          const notifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
          const unreadCount = notifications.filter(n => !n.read).length
          
          return { notifications, unreadCount }
        })
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }))
      },

      removeNotification: (id: string) => {
        set(state => {
          const notifications = state.notifications.filter(n => n.id !== id)
          const unreadCount = notifications.filter(n => !n.read).length
          
          return { notifications, unreadCount }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length
      }
    }),
    {
      name: 'bazari-notifications',
      partialize: (state) => ({
        notifications: state.notifications
      })
    }
  )
)
