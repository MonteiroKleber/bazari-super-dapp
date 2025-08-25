// src/features/wallet/workers/signer.worker.ts
/* eslint-disable no-restricted-globals */
import { Buffer } from 'buffer/'
;(self as any).Buffer ??= Buffer

import { cryptoWaitReady } from '@polkadot/util-crypto'
import Keyring from '@polkadot/keyring'
import { hexToU8a, u8aToHex } from '@polkadot/util'
import type { KeyringPair$Json } from '@polkadot/keyring/types'

type SignMsg = {
  type: 'sign-hex'
  id: string
  ss58: number
  address: string
  json: KeyringPair$Json
  password: string
  hex: string // payload em hex (payload.data)
}

type ReadyMsg = { type: 'ready' }
type RespMsg = { type: 'signed'; id: string; signature: string }
type ErrMsg = { type: 'error'; id: string; message: string }

async function signHex(msg: SignMsg): Promise<string> {
  await cryptoWaitReady()
  const keyring = new Keyring({ type: 'sr25519', ss58Format: msg.ss58 })
  const pair = keyring.addFromJson(msg.json)
  pair.decodePkcs8(msg.password)
  try {
    const payloadU8a = hexToU8a(msg.hex)
    const sigU8a = pair.sign(payloadU8a, { withType: true })
    return u8aToHex(sigU8a)
  } finally {
    try { pair.lock() } catch {}
  }
}

self.addEventListener('message', async (ev: MessageEvent<SignMsg>) => {
  const data = ev.data
  if (!data) return
  if (data.type === 'sign-hex') {
    try {
      const signature = await signHex(data)
      ;(self as any).postMessage({ type: 'signed', id: data.id, signature } as RespMsg)
    } catch (e: any) {
      ;(self as any).postMessage({ type: 'error', id: data.id, message: String(e?.message || e) } as ErrMsg)
    }
  }
})

;(self as any).postMessage({ type: 'ready' } as ReadyMsg)
