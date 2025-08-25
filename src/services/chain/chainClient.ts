import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

let api: ApiPromise | null = null

export async function getApi(): Promise<ApiPromise> {
  if (api && api.isReady) return api
  const provider = new WsProvider('ws://127.0.0.1:9944')
  api = await ApiPromise.create({ provider })
  await api.isReady
  return api
}

// opcional: pegar signer do Polkadot.js extension
export async function getSigner(address: string) {
  await web3Enable('Bazari DApp')
  const injector = await web3FromAddress(address)
  return injector.signer
}
