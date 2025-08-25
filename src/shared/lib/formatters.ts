export const formatCurrency = (amount: number, currency: 'BZR' | 'BRL') => {
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }
  
  return `${amount.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  })} BZR`
}

export const formatDate = (dateString: string, locale: string = 'pt-BR') => {
  return new Date(dateString).toLocaleDateString(locale)
}

export const formatDateTime = (dateString: string, locale: string = 'pt-BR') => {
  return new Date(dateString).toLocaleString(locale)
}

export const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`
  return `${Math.floor(diffDays / 365)}a`
}

export const formatWalletAddress = (address: string, length: number = 8) => {
  if (!address) return ''
  if (address.length <= length * 2) return address
  
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
