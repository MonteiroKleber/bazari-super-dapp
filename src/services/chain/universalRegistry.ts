// src/services/chain/universalRegistry.ts
import type { ApiPromise } from '@polkadot/api'
import type { SubmittableExtrinsic } from '@polkadot/api/types'
import { stringToU8a, u8aToString } from '@polkadot/util'

// helpers: SEMPRE como number[] (Vec<u8>)
const toVec = (s: string): number[] => Array.from(stringToU8a(s))
const NS_VEC: number[] = toVec('enterprises')

// ---------- Extrínsecas ----------
export function buildSetHead(api: ApiPromise, cid: string): SubmittableExtrinsic<'promise'> {
  // setHead(namespace: Vec<u8>, cid: Vec<u8>)
  return (api.tx as any).universalRegistry.setHead(NS_VEC, toVec(cid))
}

export function buildUpsertItem(api: ApiPromise, id: string, cid: string): SubmittableExtrinsic<'promise'> {
  // upsertItem(namespace: Vec<u8>, id: Vec<u8>, cid: Vec<u8>)
  return (api.tx as any).universalRegistry.upsertItem(NS_VEC, toVec(id), toVec(cid))
}

export function buildRemoveItem(api: ApiPromise, id: string): SubmittableExtrinsic<'promise'> {
  // removeItem(namespace: Vec<u8>, id: Vec<u8>)
  return (api.tx as any).universalRegistry.removeItem(NS_VEC, toVec(id))
}

// ---------- Query ----------
export async function queryHead(api: ApiPromise): Promise<string | null> {
  // Caminho A: consulta direta passando number[] (Vec<u8>)
  try {
    const opt = await (api.query as any).universalRegistry.head(NS_VEC) // Option<Vec<u8>>
    if (!opt || opt.isNone) return null
    return u8aToString(opt.unwrap())
  } catch {
    // Caminho B (fallback): varre todas as entries e filtra pelo namespace
    const entries = await (api.query as any).universalRegistry.head.entries()
    for (const [key, val] of entries) {
      const arg0 = (key as any).args?.[0]
      const ns = arg0 ? u8aToString(arg0) : ''
      if (ns === 'enterprises' && val && val.isSome) {
        return u8aToString(val.unwrap())
      }
    }
    return null
  }
}
