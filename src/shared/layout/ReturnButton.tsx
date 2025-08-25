import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'

interface ReturnButtonProps {
  to?: string
  label?: string
  className?: string
}

export const ReturnButton: React.FC<ReturnButtonProps> = ({
  to,
  label,
  className
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()

  const handleReturn = () => {
    if (to) {
      navigate(to)
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      // Fallback routes based on current path
      const path = location.pathname
      if (path.startsWith('/wallet')) {
        navigate('/dashboard')
      } else if (path.startsWith('/marketplace')) {
        navigate('/marketplace')
      } else if (path.startsWith('/profile')) {
        navigate('/dashboard')
      } else {
        navigate('/dashboard')
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReturn}
      className={className}
    >
      <ArrowLeft size={16} className="mr-2" />
      {label || t('app.actions.back')}
    </Button>
  )
}