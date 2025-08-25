// src/app/providers/ChainProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { setChainApi } from '@app/chain/chainSingleton'

type ChainCtxShape = {
  api: ApiPromise | null
  isReady: boolean
  chainName?: string
  ss58Format: number
  symbol: string
  decimals: number
}

const ChainCtx = createContext<ChainCtxShape>({
  api: null,
  isReady: false,
  chainName: undefined,
  ss58Format: 42,
  symbol: 'BZR',
  decimals: 12,
})

export const useChain = () => useContext(ChainCtx)

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null)
  const [isReady, setReady] = useState(false)
  const [chainName, setChainName] = useState<string>()
  const [ss58Format, setSS58] = useState(42)
  const [symbol, setSymbol] = useState('BZR')
  const [decimals, setDecimals] = useState(12)

  useEffect(() => {
    let mounted = true
    const url = import.meta.env.VITE_BAZARICHAIN_WS || 'ws://127.0.0.1:9944'
    const provider = new WsProvider(url)

    ApiPromise.create({ provider })
      .then(async (apiInstance) => {
        if (!mounted) return
        setApi(apiInstance)
        const [props, chain] = await Promise.all([
          apiInstance.rpc.system.properties(),
          apiInstance.rpc.system.chain()
        ])
        setChainName(chain?.toString())
        const ss58 = (props.ss58Format?.toPrimitive() as number) ?? 42
        setSS58(ss58)
        setChainApi(api, { symbol, decimals, ss58: ss58Format })

        // metadados de token
        const toks = apiInstance.registry.chainTokens
        const decs = apiInstance.registry.chainDecimals
        if (Array.isArray(toks) && toks[0]) setSymbol(String(toks[0]))
        if (Array.isArray(decs) && typeof decs[0] === 'number') setDecimals(decs[0])

        setReady(true)
      })
      .catch((e) => {
        console.error('ChainProvider: falha ao conectar', e)
      })

    return () => {
      mounted = false
      // desconecta com elegância
      ;(async () => {
        try {
          await api?.disconnect()
        } catch {}
        try {
          await provider.disconnect()
        } catch {}
      })()
    }
  }, [])

  const value = useMemo(
    () => ({ api, isReady, chainName, ss58Format, symbol, decimals }),
    [api, isReady, chainName, ss58Format, symbol, decimals]
  )

  return <ChainCtx.Provider value={value}>{children}</ChainCtx.Provider>
}
