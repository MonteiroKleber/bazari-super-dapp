// src/shared/ui/Drawer.tsx

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  position?: 'left' | 'right' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  className?: string
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  className = ''
}) => {
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

  const getSizeClasses = () => {
    const sizes = {
      sm: position === 'bottom' ? 'h-1/3' : 'w-80',
      md: position === 'bottom' ? 'h-1/2' : 'w-96',
      lg: position === 'bottom' ? 'h-2/3' : 'w-1/2',
      xl: position === 'bottom' ? 'h-3/4' : 'w-2/3',
      full: position === 'bottom' ? 'h-full' : 'w-full'
    }
    return sizes[size]
  }

  const getPositionClasses = () => {
    const positions = {
      left: 'left-0 top-0 h-full',
      right: 'right-0 top-0 h-full',
      bottom: 'bottom-0 left-0 w-full'
    }
    return positions[position]
  }

  const getAnimationProps = () => {
    const animations = {
      left: {
        initial: { x: '-100%' },
        animate: { x: 0 },
        exit: { x: '-100%' }
      },
      right: {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' }
      },
      bottom: {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' }
      }
    }
    return animations[position]
  }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Drawer */}
          <motion.div
            {...getAnimationProps()}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed z-50 bg-white shadow-2xl
              ${getPositionClasses()}
              ${getSizeClasses()}
              ${position === 'bottom' ? 'rounded-t-2xl' : ''}
              ${className}
            `}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-sand-200">
                {title && (
                  <h2 className="text-lg font-semibold text-matte-black-900">
                    {title}
                  </h2>
                )}
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-sand-100 transition-colors"
                  >
                    <X size={20} className="text-matte-black-600" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={`
              ${position === 'bottom' ? 'h-full' : 'flex-1'} 
              overflow-y-auto
              ${(title || showCloseButton) ? '' : 'pt-4'}
            `}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // Render in portal to ensure proper stacking
  return createPortal(content, document.body)
}

// Alias for Sheet component
export const Sheet = Drawer