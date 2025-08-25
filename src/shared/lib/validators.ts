export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateWalletAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  const addressRegex = /^0x[a-fA-F0-9]{40}$/
  return addressRegex.test(address)
}

export const validateSeedPhrase = (seedPhrase: string): boolean => {
  const words = seedPhrase.trim().split(/\s+/)
  return words.length === 12 || words.length === 24
}

export const validatePrice = (price: string): boolean => {
  const priceNumber = parseFloat(price)
  return !isNaN(priceNumber) && priceNumber > 0
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}
