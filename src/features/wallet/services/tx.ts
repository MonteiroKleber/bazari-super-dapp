// src/features/wallet/services/tx.ts
import { bazariApi } from '../api/bazariApi'
import { BazariSigner } from '../signing/BazariSigner'
import type { SubmittableExtrinsic } from '@polkadot/api/types'
import { BN } from '@polkadot/util'

export interface TransactionParams {
  from: string
  to: string
  amount: string
  assetId?: number
  memo?: string
}

export interface TransactionStatus {
  hash: string
  status: 'pending' | 'included' | 'finalized' | 'failed'
  blockHash?: string
  error?: string
}

export async function sendBZR(params: TransactionParams): Promise<string> {
  const api = await bazariApi.connect()
  
  // Verify API is ready and has required pallets
  if (!api.isReady) {
    throw new Error('API não está pronta')
  }
  
  console.log('🔍 Available pallets:', Object.keys(api.tx))
  
  // Check if balances pallet exists
  if (!api.tx.balances) {
    throw new Error('Pallet balances não encontrado na chain')
  }
  
  console.log('💰 Available balances methods:', Object.keys(api.tx.balances))
  
  const signer = new BazariSigner()
  
  // Configure signer
  bazariApi.setSigner(signer)
  
  try {
    // Try different transfer methods in order of preference
    let transfer
    
    if (api.tx.balances.transferKeepAlive) {
      // transferKeepAlive is safer as it prevents killing the account
      console.log('📤 Using transferKeepAlive')
      transfer = api.tx.balances.transferKeepAlive(params.to, new BN(params.amount))
    } else if (api.tx.balances.transfer) {
      console.log('📤 Using transfer')
      transfer = api.tx.balances.transfer(params.to, new BN(params.amount))
    } else if (api.tx.balances.transferAllowDeath) {
      console.log('📤 Using transferAllowDeath')
      transfer = api.tx.balances.transferAllowDeath(params.to, new BN(params.amount))
    } else {
      throw new Error('Nenhum método de transfer disponível no pallet balances')
    }

    console.log('📝 Transaction created:', transfer.toHuman())
    console.log('⚖️ From account:', params.from)
    console.log('📍 To account:', params.to)
    console.log('💰 Amount:', params.amount)
    
    return new Promise((resolve, reject) => {
      let unsubscribe: () => void

      const cleanup = () => {
        if (unsubscribe) {
          try {
            unsubscribe()
          } catch (e) {
            console.warn('Failed to unsubscribe:', e)
          }
        }
      }

      // Set timeout for transaction
      const timeout = setTimeout(() => {
        cleanup()
        reject(new Error('Transaction timeout (30 seconds)'))
      }, 30000)

      unsubscribe = transfer.signAndSend(
        params.from, 
        { signer },
        ({ status, txHash, events, dispatchError, isError }) => {
          console.log('📋 Transaction status:', status.type)
          console.log('🔗 Transaction hash:', txHash.toString())
          
          if (isError) {
            console.error('❌ Transaction error flag set')
            cleanup()
            clearTimeout(timeout)
            reject(new Error('Transaction marked as error'))
            return
          }
          
          if (status.isInBlock) {
            console.log(`✅ Transaction included in block: ${status.asInBlock.toString()}`)
            
            // Check for dispatch errors
            if (dispatchError) {
              cleanup()
              clearTimeout(timeout)
              
              if (dispatchError.isModule) {
                try {
                  const decoded = api.registry.findMetaError(dispatchError.asModule)
                  const { docs, name, section } = decoded
                  console.error('🚨 Module error:', { section, name, docs })
                  reject(new Error(`${section}.${name}: ${docs.join(' ')}`))
                } catch (decodeError) {
                  console.error('❌ Failed to decode dispatch error:', decodeError)
                  reject(new Error(`Module error: ${dispatchError.toString()}`))
                }
              } else {
                reject(new Error(`Dispatch error: ${dispatchError.toString()}`))
              }
              return
            }
            
            // Check events for failures
            if (events) {
              console.log('📋 Events:', events.length)
              
              const failedEvent = events.find(({ event }) => 
                api.events.system?.ExtrinsicFailed?.is(event)
              )
              
              if (failedEvent) {
                cleanup()
                clearTimeout(timeout)
                
                const [dispatchError] = failedEvent.event.data
                if (dispatchError?.isModule) {
                  try {
                    const decoded = api.registry.findMetaError(dispatchError.asModule)
                    const { docs, name, section } = decoded
                    console.error('🚨 Extrinsic failed:', { section, name, docs })
                    reject(new Error(`Transaction failed: ${section}.${name}: ${docs.join(' ')}`))
                  } catch (decodeError) {
                    reject(new Error('Transaction failed with module error'))
                  }
                } else {
                  reject(new Error('Transaction failed in block'))
                }
                return
              }
              
              // Check for success events
              const successEvent = events.find(({ event }) => 
                api.events.balances?.Transfer?.is(event) ||
                api.events.system?.ExtrinsicSuccess?.is(event)
              )
              
              if (successEvent) {
                console.log('🎉 Success event found:', successEvent.event.method)
              }
            }
            
            // Transaction successful
            cleanup()
            clearTimeout(timeout)
            console.log('✅ BZR transfer successful!')
            resolve(txHash.toString())
            
          } else if (status.isFinalized) {
            console.log(`🏁 Transaction finalized: ${status.asFinalized.toString()}`)
          } else if (status.isInvalid) {
            cleanup()
            clearTimeout(timeout)
            reject(new Error('Transaction is invalid'))
          } else if (status.isDropped) {
            cleanup()
            clearTimeout(timeout)
            reject(new Error('Transaction was dropped'))
          } else if (status.isUsurped) {
            cleanup()
            clearTimeout(timeout)
            reject(new Error('Transaction was usurped'))
          } else if (status.isRetracted) {
            cleanup()
            clearTimeout(timeout)
            reject(new Error('Transaction was retracted'))
          }
        }
      ).catch((error) => {
        cleanup()
        clearTimeout(timeout)
        console.error('❌ SignAndSend error:', error)
        
        // Common errors handling
        if (error.message?.includes('1010: Invalid Transaction')) {
          reject(new Error('Transação inválida: verifique saldo e endereço'))
        } else if (error.message?.includes('1011: ExhaustsResources')) {
          reject(new Error('Recursos insuficientes: saldo muito baixo'))
        } else if (error.message?.includes('Inability to pay some fees')) {
          reject(new Error('Saldo insuficiente para pagar taxas'))
        } else if (error.message?.includes('createType(ExtrinsicSignature)')) {
          reject(new Error('Erro na assinatura: problema com compatibilidade de tipos'))
        } else if (error.message?.includes('Unable to create Enum')) {
          reject(new Error('Erro de tipo na assinatura: versão da API incompatível'))
        } else {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('❌ Error sending BZR:', error)
    throw new Error(`Falha ao enviar BZR: ${error.message || error}`)
  }
}

export async function sendAsset(params: TransactionParams): Promise<string> {
  if (!params.assetId) {
    throw new Error('Asset ID é obrigatório')
  }

  const api = await bazariApi.connect()
  
  // Verify API is ready and has required pallets
  if (!api.isReady) {
    throw new Error('API não está pronta')
  }
  
  // Check if assets pallet exists
  if (!api.tx.assets) {
    throw new Error('Pallet assets não encontrado na chain')
  }
  
  console.log('🪙 Available assets methods:', Object.keys(api.tx.assets))
  
  const signer = new BazariSigner()
  bazariApi.setSigner(signer)
  
  try {
    // Try different asset transfer methods
    let transfer
    
    if (api.tx.assets.transferKeepAlive) {
      console.log('📤 Using assets.transferKeepAlive')
      transfer = api.tx.assets.transferKeepAlive(params.assetId, params.to, new BN(params.amount))
    } else if (api.tx.assets.transfer) {
      console.log('📤 Using assets.transfer')
      transfer = api.tx.assets.transfer(params.assetId, params.to, new BN(params.amount))
    } else {
      throw new Error('Nenhum método de transfer disponível no pallet assets')
    }
    
    return new Promise((resolve, reject) => {
      transfer.signAndSend(params.from, ({ status, txHash, events, dispatchError }) => {
        console.log('📋 Asset transaction status:', status.type)
        
        if (status.isInBlock) {
          console.log(`✅ Asset transfer included in block: ${status.asInBlock}`)
          
          // Check for dispatch errors
          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule)
              const { docs, name, section } = decoded
              reject(new Error(`${section}.${name}: ${docs.join(' ')}`))
            } else {
              reject(new Error(dispatchError.toString()))
            }
            return
          }
          
          // Check for failed events
          const failedEvent = events.find(({ event }) => 
            api.events.system.ExtrinsicFailed.is(event)
          )
          
          if (failedEvent) {
            reject(new Error('Transação de asset falhou na execução'))
            return
          }
          
          resolve(txHash.toString())
        } else if (status.isFinalized) {
          console.log(`🏁 Asset transfer finalized: ${status.asFinalized}`)
        } else if (status.isInvalid || status.isDropped || status.isUsurped) {
          reject(new Error(`Asset transfer ${status.type}`))
        }
      }).catch((error) => {
        console.error('❌ Asset SignAndSend error:', error)
        reject(error)
      })
    })
  } catch (error) {
    console.error('❌ Error sending asset:', error)
    throw new Error(`Falha ao enviar token: ${error.message || error}`)
  }
}

export async function getTransactionHistory(address: string, limit = 50): Promise<any[]> {
  // Para um histórico completo, seria necessário indexar eventos
  // Por enquanto, retorna array vazio como placeholder
  console.log(`Getting transaction history for ${address} (limit: ${limit})`)
  
  // TODO: Implementar consulta ao historical API ou indexer
  return []
}

export async function estimateFee(tx: SubmittableExtrinsic<'promise'>): Promise<string> {
  try {
    const paymentInfo = await tx.paymentInfo('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY') // dummy address
    return paymentInfo.partialFee.toString()
  } catch (error) {
    console.error('Error estimating fee:', error)
    return '0'
  }
}