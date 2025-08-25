import { useCallback } from 'react'
import { useChain } from '@app/providers/ChainProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import { usePasswordPrompt } from '@app/providers/PasswordPromptProvider'
import { signAndSend } from '../services/extrinsicSigner'
import type { ApiPromise } from '@polkadot/api'
import type { SubmittableExtrinsic } from '@polkadot/api/types'

type SendOptions = { onStatus?: (s: string) => void; meta?: any }

export function useSignAndSend() {
  const { api, isReady, ss58Format } = useChain()
  const user = useAuthStore(s => (s as any).user)
  const { promptPassword } = usePasswordPrompt()

  const send = useCallback(async (
    build: (api: ApiPromise) => SubmittableExtrinsic<'promise'>,
    opts?: SendOptions
  ) => {
    if (!api || !isReady) throw new Error('API não está pronta')
    const address: string | undefined = user?.walletAddress || user?.address
    if (!address) throw new Error('Endereço da conta não encontrado')

    const getPassword = async () => {
      const pwd = await promptPassword({
        address,
        title: 'Desbloquear carteira',
        message: 'Digite sua senha para assinar a transação'
      })
      if (!pwd) throw new Error('Senha não informada')
      return pwd
    }

    return await signAndSend(api, address, build, {
      ss58: ss58Format,
      getPassword,
      onStatus: opts?.onStatus,
      meta: opts?.meta
    })
  }, [api, isReady, ss58Format, promptPassword, user?.walletAddress, user?.address])

  return send
}
