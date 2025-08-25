import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@shared/ui/Button'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Simple toast store
let toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

const addToast = (toast: Omit<Toast, 'id'>) => {
  const newToast: Toast = {
    ...toast,
    id: crypto.randomUUID(),
    duration: toast.duration || 5000
  }
  
  toasts = [newToast, ...toasts]
  listeners.forEach(listener => listener(toasts))
  
  if (newToast.duration > 0) {
    setTimeout(() => removeToast(newToast.id), newToast.duration)
  }
}

const removeToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id)
  listeners.forEach(listener => listener(toasts))
}

export const toast = {
  success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) => addToast({ type: 'info', title, message })
}

const ToastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const ToastColors = {
  success: 'bg-success-50 border-success-200 text-success-800',
  error: 'bg-danger-50 border-danger-200 text-danger-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

export const NotificationToastHost: React.FC = () => {
  const [currentToasts, setCurrentToasts] = React.useState<Toast[]>([])

  React.useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts)
    listeners.push(listener)
    
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-sm w-full space-y-2">
      <AnimatePresence>
        {currentToasts.map((toast) => {
          const Icon = ToastIcons[toast.type]
          const colorClasses = ToastColors[toast.type]
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              className={`p-4 rounded-xl border shadow-soft-lg ${colorClasses}`}
            >
              <div className="flex items-start space-x-3">
                <Icon size={20} className="flex-shrink-0 mt-0.5" />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{toast.title}</p>
                  {toast.message && (
                    <p className="text-sm mt-1 opacity-90">{toast.message}</p>
                  )}
                  
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="text-sm underline mt-2 hover:no-underline"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeToast(toast.id)}
                  className="p-1 opacity-70 hover:opacity-100"
                >
                  <X size={16} />
                </Button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
