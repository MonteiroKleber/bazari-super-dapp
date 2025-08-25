// src/features/wallet/adapters/access.ts
import { useAuthStore } from '@features/auth/store/authStore'
import { createLocalAccount, importFromMnemonic, listLocalAccounts } from '@features/wallet/services/localKeystore'
import { encodeAddress } from '@polkadot/util-crypto'

export interface WalletAccount {
  address: string
  name: string
  isActive: boolean
  isWatchOnly?: boolean
  derivationPath?: string
}

export async function createDerivedAccount(name: string, derivationPath: string, password: string): Promise<string> {
  const { user } = useAuthStore.getState()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Cria conta derivada usando HD Wallet
  const fullPath = `//${derivationPath}`
  const account = await createLocalAccount({
    name,
    password,
    derivationPath: fullPath
  })

  return account.address
}

export async function importAccountFromSeed(seed: string, name: string, password: string): Promise<string> {
  const account = await importFromMnemonic({
    mnemonic: seed,
    name,
    password
  })

  return account.address
}

export async function importWatchOnlyAccount(address: string, name: string): Promise<string> {
  const { user } = useAuthStore.getState()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Adiciona conta watch-only ao storage local
  const watchOnlyAccounts = JSON.parse(localStorage.getItem('bazari.watch.accounts') || '{}')
  watchOnlyAccounts[address] = {
    address,
    name,
    isWatchOnly: true,
    createdAt: new Date().toISOString()
  }
  localStorage.setItem('bazari.watch.accounts', JSON.stringify(watchOnlyAccounts))

  return address
}

export async function getAllWalletAccounts(): Promise<WalletAccount[]> {
  const { user } = useAuthStore.getState()
  
  if (!user) {
    return []
  }

  const localAccounts = await listLocalAccounts()
  const watchOnlyAccounts = JSON.parse(localStorage.getItem('bazari.watch.accounts') || '{}')

  const accounts: WalletAccount[] = []

  // Contas locais
  localAccounts.forEach(meta => {
    accounts.push({
      address: meta.address,
      name: meta.name || 'Conta sem nome',
      isActive: meta.address === user.walletAddress,
      derivationPath: meta.derivationPath
    })
  })

  // Contas watch-only
  Object.values(watchOnlyAccounts).forEach((account: any) => {
    accounts.push({
      address: account.address,
      name: account.name,
      isActive: account.address === user.walletAddress, // Watch-only can also be active
      isWatchOnly: true
    })
  })

  return accounts
}

export async function switchActiveAccount(address: string): Promise<void> {
  const { loginLocal } = useAuthStore.getState()
  await loginLocal(address)
}

export async function renameAccount(address: string, newName: string): Promise<void> {
  // Implementar renomeação no storage local
  const accounts = JSON.parse(localStorage.getItem('bazari.local.accounts.v1') || '{}')
  if (accounts[address]) {
    accounts[address].meta.name = newName
    localStorage.setItem('bazari.local.accounts.v1', JSON.stringify(accounts))
  }

  // Watch-only accounts
  const watchOnlyAccounts = JSON.parse(localStorage.getItem('bazari.watch.accounts') || '{}')
  if (watchOnlyAccounts[address]) {
    watchOnlyAccounts[address].name = newName
    localStorage.setItem('bazari.watch.accounts', JSON.stringify(watchOnlyAccounts))
  }
}

export async function removeAccount(address: string): Promise<void> {
  // Remove conta local
  const accounts = JSON.parse(localStorage.getItem('bazari.local.accounts.v1') || '{}')
  delete accounts[address]
  localStorage.setItem('bazari.local.accounts.v1', JSON.stringify(accounts))

  // Remove conta watch-only
  const watchOnlyAccounts = JSON.parse(localStorage.getItem('bazari.watch.accounts') || '{}')
  delete watchOnlyAccounts[address]
  localStorage.setItem('bazari.watch.accounts', JSON.stringify(watchOnlyAccounts))
}