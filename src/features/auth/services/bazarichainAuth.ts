// src/features/auth/services/bazarichainAuth.ts
import { web3Enable, web3Accounts, web3FromAddress, isWeb3Injected } from '@polkadot/extension-dapp'
import { encodeAddress } from '@polkadot/util-crypto'

export type ChainAccount = { address: string; name?: string; source?: string }

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Bazari Super App'

export async function ensureExtension(): Promise<boolean> {
  if (!isWeb3Injected) return false
  const injected = await web3Enable(APP_NAME)
  return injected && injected.length > 0
}

export async function getAccounts(ss58Format = 42): Promise<ChainAccount[]> {
  const all = await web3Accounts()
  return all.map((a) => ({
    address: encodeAddress(a.address, ss58Format),
    name: a.meta?.name,
    source: a.meta?.source as string,
  }))
}

export async function signMessage(address: string, message: string) {
  const { signer } = await web3FromAddress(address)
  const signRaw = (signer as any).signRaw
  if (!signRaw) throw new Error('A extensão não suporta signRaw')
  const { signature } = await signRaw({ address, data: `0x${Buffer.from(message, 'utf-8').toString('hex')}`, type: 'bytes' })
  return signature as string
}
