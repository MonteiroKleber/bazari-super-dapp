// src/features/wallet/utils/formatters.ts
import { BN } from '@polkadot/util'

export function formatBalance(balance: string | BN, decimals: number): string {
  const bn = new BN(balance)
  const divisor = new BN(10).pow(new BN(decimals))
  
  const quotient = bn.div(divisor)
  const remainder = bn.mod(divisor)
  
  if (remainder.isZero()) {
    return quotient.toString()
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmed = remainderStr.replace(/0+$/, '')
  
  if (trimmed === '') {
    return quotient.toString()
  }
  
  return `${quotient.toString()}.${trimmed}`
}

export function parseBalance(amount: string, decimals: number): string {
  const parts = amount.split('.')
  const integer = parts[0] || '0'
  const fractional = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals)
  
  return new BN(integer).mul(new BN(10).pow(new BN(decimals))).add(new BN(fractional || '0')).toString()
}

export function formatCurrency(amount: string | number, symbol: string, decimals?: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (decimals !== undefined) {
    return `${num.toFixed(decimals)} ${symbol}`
  }
  
  return `${num.toLocaleString()} ${symbol}`
}

export function shortenAddress(address: string, length = 6): string {
  if (address.length <= length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return 'Agora'
  if (minutes < 60) return `${minutes}m atrás`
  if (hours < 24) return `${hours}h atrás`
  if (days < 7) return `${days}d atrás`
  
  return date.toLocaleDateString()
}
