// src/features/wallet/signing/BazariSigner.ts
import { Signer, SignerResult } from '@polkadot/api/types'
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types'
import { useAuthStore } from '@features/auth/store/authStore'
import { unlockAccount } from '@features/wallet/services/localKeystore'
import { u8aToHex, u8aConcat, stringToU8a } from '@polkadot/util'
import { blake2AsU8a } from '@polkadot/util-crypto'
import { TypeRegistry } from '@polkadot/types'

export class BazariSigner implements Signer {
  private registry: TypeRegistry

  constructor() {
    this.registry = new TypeRegistry()
  }

  async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    console.log('🔏 BazariSigner.signPayload called with:', payload)
    
    const { user } = useAuthStore.getState()
    
    if (!user?.walletAddress) {
      throw new Error('Nenhuma conta ativa encontrada')
    }

    console.log('👤 Active account:', user.walletAddress)

    // Solicita senha para desbloquear a conta
    const password = await this.requestPassword()
    
    try {
      console.log('🔓 Unlocking account...')
      const keyring = await unlockAccount(user.walletAddress, password)
      
      console.log('📝 Account unlocked, signing payload...')
      console.log('🔍 Payload details:', {
        method: payload.method,
        era: payload.era,
        nonce: payload.nonce,
        tip: payload.tip,
        specVersion: payload.specVersion,
        transactionVersion: payload.transactionVersion,
        genesisHash: payload.genesisHash,
        blockHash: payload.blockHash
      })
      
      // Convert payload to Uint8Array for signing
      const signable = this.createSignablePayload(payload)
      console.log('📄 Signable payload:', u8aToHex(signable))
      
      // Sign the payload
      const signature = keyring.sign(signable)
      console.log('✅ Signature created:', u8aToHex(signature))
      
      const result = {
        id: crypto.randomUUID(),
        signature: u8aToHex(signature)
      }
      
      console.log('🔐 Sign result:', result)
      return result
    } catch (error) {
      console.error('❌ Signing failed:', error)
      throw new Error(`Falha na assinatura: ${error.message || error}`)
    }
  }

  async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {
    console.log('🔏 BazariSigner.signRaw called with:', raw)
    
    const { user } = useAuthStore.getState()
    
    if (!user?.walletAddress) {
      throw new Error('Nenhuma conta ativa encontrada')
    }

    const password = await this.requestPassword()
    
    try {
      console.log('🔓 Unlocking account for raw signing...')
      const keyring = await unlockAccount(user.walletAddress, password)
      
      console.log('📝 Signing raw data...')
      
      // For raw signing, we need to handle the data properly
      let dataToSign: Uint8Array
      
      if (typeof raw.data === 'string') {
        // Remove 0x prefix if present and convert hex to Uint8Array
        const cleanHex = raw.data.replace(/^0x/, '')
        dataToSign = new Uint8Array(cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
      } else {
        dataToSign = raw.data
      }
      
      console.log('📄 Raw data to sign:', u8aToHex(dataToSign))
      
      const signature = keyring.sign(dataToSign, { withType: true })
      
      const result = {
        id: crypto.randomUUID(),
        signature: u8aToHex(signature)
      }
      
      console.log('🔐 Raw sign result:', result)
      return result
    } catch (error) {
      console.error('❌ Raw signing failed:', error)
      throw new Error(`Falha na assinatura raw: ${error.message || error}`)
    }
  }

  private createSignablePayload(payload: SignerPayloadJSON): Uint8Array {
    try {
      console.log('🔧 Creating signable payload with registry...')
      
      // Try to create proper ExtrinsicPayload using TypeRegistry
      try {
        const extrinsicPayload = this.registry.createType('ExtrinsicPayload', payload, { 
          version: payload.version || 4 
        })
        
        const signable = extrinsicPayload.toU8a({ method: true })
        console.log('✅ Created signable via TypeRegistry')
        return signable
      } catch (registryError) {
        console.warn('⚠️ Registry method failed, using fallback:', registryError.message)
        return this.createFallbackSignable(payload)
      }
    } catch (error) {
      console.error('❌ Error creating signable payload:', error)
      return this.createFallbackSignable(payload)
    }
  }

  private createFallbackSignable(payload: SignerPayloadJSON): Uint8Array {
    console.log('🔧 Using fallback signable creation...')
    
    try {
      // Simple concatenation of essential fields for signing
      const methodData = this.hexToU8a(payload.method)
      const eraData = this.hexToU8a(payload.era)
      const nonceData = this.hexToU8a(payload.nonce)
      const tipData = this.hexToU8a(payload.tip)
      const specVersionData = this.hexToU8a(payload.specVersion)
      const transactionVersionData = this.hexToU8a(payload.transactionVersion || '0x00000000')
      const genesisHashData = this.hexToU8a(payload.genesisHash)
      const blockHashData = this.hexToU8a(payload.blockHash)
      
      const combined = u8aConcat(
        methodData,
        eraData, 
        nonceData,
        tipData,
        specVersionData,
        transactionVersionData,
        genesisHashData,
        blockHashData
      )
      
      console.log('📄 Combined payload length:', combined.length)
      
      // If payload is too long, hash it
      if (combined.length > 256) {
        console.log('📝 Payload too long, hashing...')
        return blake2AsU8a(combined, 256)
      }
      
      return combined
    } catch (error) {
      console.error('❌ Fallback signable creation failed:', error)
      
      // Ultimate fallback - convert the entire payload to string and hash
      const payloadString = JSON.stringify(payload)
      const payloadBytes = stringToU8a(payloadString)
      
      console.log('🆘 Using ultimate fallback - JSON string hash')
      return blake2AsU8a(payloadBytes, 256)
    }
  }

  private hexToU8a(hex: string): Uint8Array {
    try {
      // Remove 0x prefix if present
      const cleanHex = hex.replace(/^0x/, '')
      
      // Ensure even length
      const paddedHex = cleanHex.length % 2 === 0 ? cleanHex : '0' + cleanHex
      
      // Convert to Uint8Array
      return new Uint8Array(
        paddedHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      )
    } catch (error) {
      console.warn('Failed to convert hex to U8a:', hex, error)
      // Fallback: convert as string
      return stringToU8a(hex)
    }
  }

  private async requestPassword(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Em produção, isto deveria ser um modal seguro
      // Por agora, usando prompt simples para desenvolvimento
      const password = window.prompt('🔐 Digite sua senha para assinar a transação:')
      if (password) {
        resolve(password)
      } else {
        reject(new Error('Senha necessária para assinar'))
      }
    })
  }
}