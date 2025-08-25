import type { ApiPromise, SubmittableExtrinsic } from '@polkadot/api'
import type { Signer } from '@polkadot/api/types'
import type { KeyringPair$Json } from '@polkadot/keyring/types'
import { createWorkerSigner } from './signerClient'
import { getAccountJson } from './localKeystore'

type GetPassword = (address: string, ctx?: any) => Promise<string> | string

type SignAndSendOptions = {
  ss58: number
  getPassword?: GetPassword
  onStatus?: (status: string) => void
  meta?: any
}

export async function signAndSend(
  api: ApiPromise,
  address: string,
  build: (api: ApiPromise) => SubmittableExtrinsic<'promise'>,
  opts: SignAndSendOptions
): Promise<string> {
  if (!api) throw new Error('API indisponível')
  if (!address) throw new Error('Endereço não informado')
  if (!opts?.ss58 && opts?.ss58 !== 0) throw new Error('Formato SS58 não informado')
  if (!opts.getPassword) throw new Error('Função getPassword não fornecida')

  const json: KeyringPair$Json | null = await getAccountJson(address)
  if (!json) throw new Error('Conta não encontrada no keystore local')

  const signer: Signer = createWorkerSigner({
    ss58: opts.ss58,
    registry: api.registry,            // <-- necessário para fallback local
    getPassword: opts.getPassword!,
    getJsonForAddress: async (addr) => {
      const j = await getAccountJson(addr)
      if (!j) throw new Error('Conta não encontrada no keystore local')
      return j
    }
  })

  const extrinsic = build(api)

  return new Promise<string>((resolve, reject) => {
    extrinsic
      .signAndSend(address, { signer }, (result) => {
        try {
          const status = result.status?.type ?? ''
          opts.onStatus?.(status)

          if (result.dispatchError) {
            let msg = result.dispatchError.toString()
            try {
              // @ts-ignore
              if (result.dispatchError.isModule && api.registry) {
                // @ts-ignore
                const mod = result.dispatchError.asModule
                const err = api.registry.findMetaError(mod)
                msg = `${err.section}.${err.name}: ${err.docs?.join(' ') || ''}`.trim()
              }
            } catch {}
            reject(new Error(msg))
            return
          }

          if (result.status?.isInBlock || result.status?.isFinalized) {
            const hash = result.txHash?.toHex?.() || String(result.txHash)
            resolve(hash)
            return
          }
        } catch (e) {
          reject(e)
        }
      })
      .catch(reject)
  })
}
