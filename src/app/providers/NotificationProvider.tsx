import React, { createContext, useContext } from 'react'
import { NotificationToastHost } from '@features/notifications/components/NotificationToastHost'

const NotificationContext = createContext<{}>({})

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationContext.Provider value={{}}>
      {children}
      <NotificationToastHost />
    </NotificationContext.Provider>
  )
}
