import type { ApiPromise } from '@polkadot/api'

let _api: ApiPromise | null = null
let _props: { symbol: string; decimals: number; ss58: number } | null = null

export function setChainApi(api: ApiPromise, props: { symbol: string; decimals: number; ss58: number }) {
  _api = api
  _props = props
}

export async function getChainApi(): Promise<ApiPromise> {
  if (!_api) throw new Error('Chain API not ready')
  return _api
}

export function getChainProps() {
  if (!_props) throw new Error('Chain props not ready')
  return _props
}
