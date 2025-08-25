// src/features/wallet/services/assets.ts
import { bazariApi } from '../api/bazariApi'
import type { Balance } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'

export interface TokenBalance {
  symbol: string
  balance: string
  decimals: number
  assetId?: number
  isNative: boolean
}

export interface CustomToken {
  assetId: number
  symbol: string
  name: string
  decimals: number
}

export async function getBZRBalance(address: string): Promise<TokenBalance> {
  try {
    console.log('💰 Getting BZR balance for:', address)
    const api = await bazariApi.connect()
    
    if (!api.query?.system?.account) {
      throw new Error('sistema.account query não disponível')
    }
    
    const accountInfo = await api.query.system.account(address)
    console.log('📊 Account info:', accountInfo.toHuman())
    
    const balance = accountInfo.data.free.toString()
    console.log('💵 BZR balance:', balance)
    
    return {
      symbol: 'BZR',
      balance,
      decimals: 12, // Padrão Substrate
      isNative: true
    }
  } catch (error) {
    console.error('❌ Error fetching BZR balance:', error)
    return {
      symbol: 'BZR',
      balance: '0',
      decimals: 12,
      isNative: true
    }
  }
}

export async function getAssetBalance(address: string, assetId: number): Promise<TokenBalance> {
  try {
    console.log(`🪙 Getting asset ${assetId} balance for:`, address)
    const api = await bazariApi.connect()
    
    if (!api.query?.assets) {
      throw new Error('assets queries não disponíveis')
    }
    
    const [assetInfo, accountBalance, metadata] = await Promise.all([
      api.query.assets.asset(assetId).catch(() => null),
      api.query.assets.account(assetId, address).catch(() => null),
      api.query.assets.metadata(assetId).catch(() => null)
    ])
    
    console.log(`📋 Asset ${assetId} info:`, assetInfo?.toHuman())
    console.log(`📊 Account balance:`, accountBalance?.toHuman())
    console.log(`🏷️ Metadata:`, metadata?.toHuman())
    
    if (!assetInfo || assetInfo.isNone) {
      console.warn(`⚠️ Asset ${assetId} não existe`)
      throw new Error(`Asset ${assetId} não encontrado`)
    }

    if (!accountBalance || accountBalance.isNone) {
      console.log(`💳 Account não possui asset ${assetId}`)
      const symbol = metadata && !metadata.isEmpty ? metadata.symbol.toUtf8() : `ASSET_${assetId}`
      const decimals = metadata && !metadata.isEmpty ? metadata.decimals.toNumber() : 0
      
      return {
        symbol,
        balance: '0',
        decimals,
        assetId,
        isNative: false
      }
    }

    const balance = accountBalance.unwrap().balance.toString()
    const symbol = metadata && !metadata.isEmpty ? metadata.symbol.toUtf8() : `ASSET_${assetId}`
    const decimals = metadata && !metadata.isEmpty ? metadata.decimals.toNumber() : 0
    
    console.log(`✅ Asset ${assetId} balance:`, balance, symbol)
    
    return {
      symbol,
      balance,
      decimals,
      assetId,
      isNative: false
    }
  } catch (error) {
    console.error(`❌ Error fetching asset ${assetId} balance:`, error)
    return {
      symbol: `ASSET_${assetId}`,
      balance: '0',
      decimals: 0,
      assetId,
      isNative: false
    }
  }
}

export async function getAllTokenBalances(address: string, customTokens: CustomToken[] = []): Promise<TokenBalance[]> {
  const balances: TokenBalance[] = []
  
  // BZR balance
  const bzrBalance = await getBZRBalance(address)
  balances.push(bzrBalance)
  
  // Custom tokens balances
  for (const token of customTokens) {
    const balance = await getAssetBalance(address, token.assetId)
    balances.push({
      ...balance,
      symbol: token.symbol,
      decimals: token.decimals
    })
  }
  
  return balances
}

export async function getTokenInfo(assetId: number): Promise<CustomToken | null> {
  const api = await bazariApi.connect()
  
  try {
    const assetInfo = await api.query.assets.asset(assetId)
    const metadata = await api.query.assets.metadata(assetId)
    
    if (!assetInfo.isSome || !metadata) {
      return null
    }

    return {
      assetId,
      symbol: metadata.symbol.toUtf8(),
      name: metadata.name.toUtf8(),
      decimals: metadata.decimals.toNumber()
    }
  } catch (error) {
    console.error(`Error fetching token info for asset ${assetId}:`, error)
    return null
  }
}