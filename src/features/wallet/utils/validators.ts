// src/features/wallet/utils/validators.ts
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'

export function isValidAddress(address: string, ss58Format = 42): boolean {
  try {
    // Try to decode the address
    const decoded = decodeAddress(address)
    // If we can encode it back, it's valid
    const reencoded = encodeAddress(decoded, ss58Format)
    return reencoded.length > 0
  } catch {
    return false
  }
}

export function isValidAmount(amount: string, maxDecimals = 12): boolean {
  if (!amount || amount.trim() === '') return false
  
  const num = parseFloat(amount)
  if (isNaN(num) || num <= 0) return false
  
  // Check decimal places
  const parts = amount.split('.')
  if (parts.length > 2) return false
  if (parts[1] && parts[1].length > maxDecimals) return false
  
  return true
}

export function isValidAssetId(assetId: string): boolean {
  const num = parseInt(assetId)
  return !isNaN(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER
}

export function validateMnemonic(mnemonic: string): { isValid: boolean; error?: string } {
  const words = mnemonic.trim().split(/\s+/)
  
  if (words.length !== 12 && words.length !== 24) {
    return {
      isValid: false,
      error: 'Mnemonic deve ter 12 ou 24 palavras'
    }
  }
  
  // Basic validation - in production, use @polkadot/util-crypto mnemonicValidate
  const hasEmptyWords = words.some(word => !word || word.trim() === '')
  if (hasEmptyWords) {
    return {
      isValid: false,
      error: 'Mnemonic contém palavras vazias'
    }
  }
  
  return { isValid: true }
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Senha deve ter pelo menos 8 caracteres'
    }
  }
  
  return { isValid: true }
}
