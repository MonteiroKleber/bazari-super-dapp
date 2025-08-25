// src/features/auth/store/authStore.ts
/*
Login local agora não mantém par desbloqueado; apenas verifica senha (opcional) e cria a sessão.

Mantém as ações de criação/importação que você já usa.

(Se preferir, pode tornar a senha no login opcional e validar só na primeira assinatura.)
*/


import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createLocalAccount,
  importFromMnemonic,
  importFromJson,
  listLocalAccounts,
  verifyPassword
} from '@features/wallet/services/localKeystore'
import type { KeyringPair$Json } from '@polkadot/keyring/types'



export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  walletAddress: string
  reputation: { rating: number; reviewCount: number }
  createdAt: string
  lastLoginAt: string
}

type AuthProvider = 'local' | 'extension' | undefined

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error?: string

  seedPhrase: string[]
  ss58Format: number
  localAccounts: { address: string; name?: string }[]

  setSeedPhrase: (words: string[]) => void
  setLoading: (v: boolean) => void
  login: (user: User) => void
  logout: () => void

  provider?: AuthProvider

  createLocal: (name: string, password: string, words?: 12 | 24) => Promise<{ address: string; mnemonic: string }>
  importLocalFromSeed: (mnemonic: string, name: string | undefined, password: string) => Promise<string>
  importLocalFromJson: (json: KeyringPair$Json, password: string, nameOverride?: string) => Promise<string>

  loginLocal: (address: string, password?: string) => Promise<void>
  listLocal: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: undefined,

      seedPhrase: [],
      ss58Format: 42,

      localAccounts: [],

      setSeedPhrase: (words) => set({ seedPhrase: words }),
      setLoading: (v) => set({ isLoading: v }),

      login: (user) => set({ user, isAuthenticated: true, isLoading: false, error: undefined }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: undefined,
          seedPhrase: [],
          provider: undefined,
        })
      },

      async listLocal() {
        const metas = await listLocalAccounts()
        set({ localAccounts: metas.map(m => ({ address: m.address, name: m.name })) })
      },

      async createLocal(name, password, words = 12) {
        const { ss58Format } = get()
        const res = await createLocalAccount({ name, password, ss58: ss58Format, words })
        await get().listLocal()
        return { address: res.address, mnemonic: res.mnemonic }
      },

      async importLocalFromSeed(mnemonic, name, password) {
        const { ss58Format } = get()
        const meta = await importFromMnemonic({ mnemonic, name, password, ss58: ss58Format })
        await get().listLocal()
        return meta.address
      },

      async importLocalFromJson(json, password, nameOverride) {
        const { ss58Format } = get()
        const meta = await importFromJson({ json, password, ss58: ss58Format, nameOverride })
        await get().listLocal()
        return meta.address
      },

      /** Login local: opcionalmente verifica senha (sem manter a chave desbloqueada) */
      async loginLocal(address, password) {
        const { ss58Format } = get()
        if (password) {
          await verifyPassword(address, password, ss58Format)
        }
        const now = new Date().toISOString()
        const user: User = {
          id: crypto.randomUUID(),
          name: 'Bazari User',
          walletAddress: address,
          reputation: { rating: 5, reviewCount: 0 },
          createdAt: get().user?.createdAt || now,
          lastLoginAt: now,
        }
        set({ user, isAuthenticated: true, provider: 'local' })
      },
    }),
    {
      name: 'bazari-auth',
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        ss58Format: s.ss58Format,
      }),
    }
  )
)
