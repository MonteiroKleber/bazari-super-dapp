// src/features/wallet/store/walletStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAllWalletAccounts, type WalletAccount } from '../adapters/access'
import { getAllTokenBalances, type TokenBalance, type CustomToken } from '../services/assets'
import { useAuthStore } from '@features/auth/store/authStore'

interface WalletState {
  // State
  accounts: WalletAccount[]
  tokens: TokenBalance[]
  customTokens: CustomToken[]
  activeAccount: WalletAccount | null
  isLoading: boolean
  error: string | null

  // UI State
  showSidebar: boolean
  activeTab: 'tokens' | 'nfts'
  selectedToken: TokenBalance | null

  // Actions
  loadAccounts: () => Promise<void>
  loadTokens: () => Promise<void>
  addCustomToken: (token: CustomToken) => void
  removeCustomToken: (assetId: number) => void
  setActiveAccount: (account: WalletAccount) => Promise<void>
  setShowSidebar: (show: boolean) => void
  setActiveTab: (tab: 'tokens' | 'nfts') => void
  setSelectedToken: (token: TokenBalance | null) => void
  refreshBalances: () => Promise<void>
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      accounts: [],
      tokens: [],
      customTokens: [],
      activeAccount: null,
      isLoading: false,
      error: null,
      showSidebar: false,
      activeTab: 'tokens',
      selectedToken: null,

      // Actions
      loadAccounts: async () => {
        set({ isLoading: true, error: null })
        try {
          const accounts = await getAllWalletAccounts()
          
          // Get current user from auth store to identify active account
          const { user } = useAuthStore.getState()
          let activeAccount = accounts.find(acc => acc.isActive) || null
          
          // If no active account found but user exists, try to find by address
          if (!activeAccount && user?.walletAddress) {
            activeAccount = accounts.find(acc => acc.address === user.walletAddress) || null
            if (activeAccount) {
              activeAccount.isActive = true
            }
          }
          
          set({ accounts, activeAccount, isLoading: false })
        } catch (error) {
          set({ error: String(error), isLoading: false })
        }
      },

      loadTokens: async () => {
        const { activeAccount, customTokens } = get()
        if (!activeAccount) return

        set({ isLoading: true, error: null })
        try {
          const tokens = await getAllTokenBalances(activeAccount.address, customTokens)
          set({ tokens, isLoading: false })
        } catch (error) {
          set({ error: String(error), isLoading: false })
        }
      },

      addCustomToken: (token: CustomToken) => {
        const { customTokens } = get()
        const exists = customTokens.find(t => t.assetId === token.assetId)
        if (!exists) {
          const newTokens = [...customTokens, token]
          set({ customTokens: newTokens })
          // Reload tokens to include new one
          get().loadTokens()
        }
      },

      removeCustomToken: (assetId: number) => {
        const { customTokens, tokens } = get()
        const newTokens = customTokens.filter(t => t.assetId !== assetId)
        const newBalances = tokens.filter(t => t.assetId !== assetId)
        set({ customTokens: newTokens, tokens: newBalances })
      },

      setActiveAccount: async (account: WalletAccount) => {
        set({ isLoading: true, error: null })
        try {
          // For non-watch-only accounts, update auth store
          if (!account.isWatchOnly) {
            const { loginLocal } = useAuthStore.getState()
            await loginLocal(account.address)
          }
          
          // Always update the active account in wallet store
          set({ activeAccount: account })
          
          // Reload accounts to ensure sync
          await get().loadAccounts()
          
          // Load tokens for the new active account
          await get().loadTokens()
          
          set({ isLoading: false })
        } catch (error) {
          set({ error: String(error), isLoading: false })
        }
      },

      refreshBalances: async () => {
        await get().loadTokens()
      },

      setShowSidebar: (show: boolean) => set({ showSidebar: show }),
      setActiveTab: (tab: 'tokens' | 'nfts') => set({ activeTab: tab }),
      setSelectedToken: (token: TokenBalance | null) => set({ selectedToken: token }),
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'bazari-wallet',
      partialize: (state) => ({
        customTokens: state.customTokens,
        activeTab: state.activeTab
      })
    }
  )
)