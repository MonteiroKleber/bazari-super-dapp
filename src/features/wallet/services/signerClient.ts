import type { Signer, SignerPayloadJSON, SignerResult } from '@polkadot/api/types'
import type { KeyringPair$Json } from '@polkadot/keyring/types'
import type { Registry } from '@polkadot/types/types'
import SignerWorker from '../workers/signer.worker?worker'

// Fallback local (sem worker)
import { Keyring } from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { u8aToHex, hexToU8a } from '@polkadot/util'

/* ------------------------------------------------------------------ */
/* Worker bridge (request/response)                                   */
/* ------------------------------------------------------------------ */
type ReqMsg = { id: number; method: string; params?: any }
type ResMsg = { id: number; result?: any; error?: string }
type EvMsg  = { event: string; payload?: any }

let _worker: Worker | null = null
function getWorker(): Worker {
  if (_worker) return _worker
  _worker = new SignerWorker()
  return _worker
}

let _seq = 0
const pending = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void; timer?: ReturnType<typeof setTimeout> }>()

function request<T = any>(method: string, params?: any, timeoutMs = 10_000): Promise<T> {
  const worker = getWorker()
  const id = ++_seq
  const msg: ReqMsg = { id, method, params }
  return new Promise<T>((resolve, reject) => {
    const timer = timeoutMs > 0 ? setTimeout(() => {
      pending.delete(id)
      reject(new Error(`Signer worker timeout: ${method}`))
    }, timeoutMs) : undefined

    pending.set(id, { resolve, reject, timer })
    worker.postMessage(msg)
  })
}

// inicia listener uma única vez
;(function initWorkerListener() {
  const worker = getWorker()
  worker.onmessage = (evt: MessageEvent) => {
    const data = evt.data as ResMsg | EvMsg
    if ((data as any).id != null) {
      const { id, error, result } = data as ResMsg
      const p = pending.get(id)
      if (!p) return
      pending.delete(id)
      if (p.timer) clearTimeout(p.timer)
      if (error) p.reject(new Error(error))
      else p.resolve(result)
      return
    }
    // eventos opcionais do worker (log/progresso)
    // const ev = data as EvMsg
    // console.debug('[signer-worker]', ev.event, ev.payload)
  }
})()

/* ------------------------------------------------------------------ */
/* Util: resolver tipo de chave do JSON                                */
/* ------------------------------------------------------------------ */
type KeyType = 'sr25519' | 'ed25519' | 'ecdsa' | 'ethereum'
function resolveKeyType(json: KeyringPair$Json): KeyType {
  const allowed = ['sr25519', 'ed25519', 'ecdsa', 'ethereum'] as const

  // 1) meta flag
  if ((json as any)?.meta?.isEthereum) return 'ethereum'

  // 2) encoding.content pode ser string ou string[]
  const content = (json as any)?.encoding?.content
  if (Array.isArray(content)) {
    const found = content
      .map((c) => String(c).toLowerCase())
      .find((c) => (allowed as readonly string[]).includes(c))
    if (found) return found as KeyType
  } else if (typeof content === 'string') {
    const s = content.toLowerCase()
    const found = (allowed as readonly string[]).find((k) => s.includes(k))
    if (found) return found as KeyType
  }

  // 3) alguns dumps trazem "type" fora de encoding
  const t = (json as any)?.type
  if (t && (allowed as readonly string[]).includes(String(t).toLowerCase())) {
    return String(t).toLowerCase() as KeyType
  }

  // fallback seguro
  return 'sr25519'
}

/* ------------------------------------------------------------------ */
/* Fallback local (assina sem worker)                                 */
/* ------------------------------------------------------------------ */
async function signPayloadLocal(args: {
  registry: Registry
  ss58: number
  address: string
  json: KeyringPair$Json
  password: string
  payload: SignerPayloadJSON
}): Promise<string> {
  const { registry, ss58, json, password, payload } = args
  await cryptoWaitReady()

  const keyType = resolveKeyType(json)
  const kr = new Keyring({ type: keyType as any, ss58Format: ss58 })
  const pair = kr.addFromJson(json)
  pair.decodePkcs8(password)

  const extrinsicPayload = registry.createType('ExtrinsicPayload', payload, { version: payload.version })
  // @ts-ignore polkadot-js retorna objeto com assinatura
  const { signature } = extrinsicPayload.sign(pair)
  return typeof signature === 'string' ? signature : u8aToHex(signature)
}

async function signRawHexLocal(args: {
  ss58: number
  json: KeyringPair$Json
  password: string
  hex: string
}): Promise<string> {
  const { ss58, json, password, hex } = args
  await cryptoWaitReady()

  const keyType = resolveKeyType(json)
  const kr = new Keyring({ type: keyType as any, ss58Format: ss58 })
  const pair = kr.addFromJson(json)
  pair.decodePkcs8(password)

  const dataU8a = hexToU8a(hex)
  const sig = pair.sign(dataU8a)
  return u8aToHex(sig)
}

/* ------------------------------------------------------------------ */
/* API exportada para services/hook                                   */
/* ------------------------------------------------------------------ */
export async function signHexWithWorker(params: {
  ss58: number
  address: string
  json: KeyringPair$Json
  password: string
  hex: string
}): Promise<string> {
  try {
    return await request<string>('sign.hex', params, 10_000)
  } catch {
    // Fallback local
    return await signRawHexLocal({
      ss58: params.ss58,
      json: params.json,
      password: params.password,
      hex: params.hex
    })
  }
}

export function createWorkerSigner(args: {
  ss58: number
  registry: Registry
  getPassword: (address: string, ctx?: any) => Promise<string> | string
  getJsonForAddress: (address: string) => Promise<KeyringPair$Json>
}): Signer {
  const { ss58, registry, getPassword, getJsonForAddress } = args

  return {
    async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
      const password = await getPassword(payload.address, payload)
      const json = await getJsonForAddress(payload.address)

      // 1) tenta via worker
      try {
        const signature: string = await request('sign.payload', {
          ss58,
          address: payload.address,
          json,
          password,
          payload
        }, 10_000)
        return { id: Date.now(), signature }
      } catch {
        // 2) fallback local
        const signature = await signPayloadLocal({ registry, ss58, address: payload.address, json, password, payload })
        return { id: Date.now(), signature }
      }
    },

    async signRaw(raw: { address: string; data: string }): Promise<SignerResult> {
      const password = await getPassword(raw.address, raw)
      const json = await getJsonForAddress(raw.address)
      const signature = await signHexWithWorker({
        ss58,
        address: raw.address,
        json,
        password,
        hex: raw.data
      })
      return { id: Date.now(), signature }
    }
  }
}

/* ------------------------------------------------------------------ */
/* HMR cleanup                                                         */
/* ------------------------------------------------------------------ */
if (import.meta && (import.meta as any).hot) {
  ;(import.meta as any).hot.dispose(() => {
    try { _worker?.terminate() } catch {}
    _worker = null
    pending.forEach(p => { try { p.reject(new Error('HMR dispose')) } catch {} })
    pending.clear()
  })
}

export default { request, createWorkerSigner, signHexWithWorker }
