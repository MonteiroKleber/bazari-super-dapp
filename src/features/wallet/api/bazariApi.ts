// src/features/wallet/api/bazariApi.ts
import { ApiPromise, WsProvider } from '@polkadot/api'

class BazariApi {
  private static instance: BazariApi
  private api: ApiPromise | null = null
  private wsProvider: WsProvider | null = null

  private constructor() {}

  static getInstance(): BazariApi {
    if (!BazariApi.instance) {
      BazariApi.instance = new BazariApi()
    }
    return BazariApi.instance
  }

  async connect(): Promise<ApiPromise> {
    if (this.api?.isConnected) {
      return this.api
    }

    const wsUrl = import.meta.env.VITE_BAZARICHAIN_WS || 'ws://127.0.0.1:9944'
    
    try {
      console.log('🔗 Connecting to BazariChain:', wsUrl)
      
      this.wsProvider = new WsProvider(wsUrl, 1000) // 1 second timeout for each connection attempt
      
      // Wait for provider to connect
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000) // 10 seconds
        
        this.wsProvider!.on('connected', () => {
          clearTimeout(timeout)
          resolve(true)
        })
        
        this.wsProvider!.on('error', (error) => {
          clearTimeout(timeout)
          reject(error)
        })
      })
      
      // Create API with proper configuration for compatibility
      this.api = await ApiPromise.create({ 
        provider: this.wsProvider,
        throwOnConnect: false,
        throwOnUnknown: false,
        // Add types configuration for better compatibility
        types: {
          // Basic types that should work with most Substrate chains
          AccountId: 'AccountId32',
          Address: 'MultiAddress',
          LookupSource: 'MultiAddress',
          Balance: 'u128',
          BlockNumber: 'u32',
          Hash: 'H256',
          Index: 'u32'
        },
        // Runtime version handling
        typesBundle: {
          spec: {
            'node-template': {
              types: [
                {
                  minmax: [0, null],
                  types: {
                    AccountId: 'AccountId32',
                    Address: 'MultiAddress',
                    LookupSource: 'MultiAddress'
                  }
                }
              ]
            },
            'substrate-node': {
              types: [
                {
                  minmax: [0, null], 
                  types: {
                    AccountId: 'AccountId32',
                    Address: 'MultiAddress',
                    LookupSource: 'MultiAddress'
                  }
                }
              ]
            }
          }
        },
        // Signature version handling
        signedExtensions: {
          ChargeTransactionPayment: {
            extrinsic: {
              tip: 'Compact<Balance>'
            },
            payload: {
              tip: 'Compact<Balance>'
            }
          }
        }
      })
      
      await this.api.isReady
      
      // Set API to use the correct signature format
      this.configureSignatureVersion()
      
      // Verify chain has required pallets
      console.log('🔍 Checking available pallets...')
      const availablePallets = Object.keys(this.api.tx)
      console.log('📦 Available pallets:', availablePallets)
      
      if (!availablePallets.includes('balances')) {
        console.warn('⚠️ Balances pallet not found')
      }
      
      if (!availablePallets.includes('assets')) {
        console.warn('⚠️ Assets pallet not found')
      }
      
      // Get chain info
      const [chain, nodeName, nodeVersion, runtimeVersion] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.name(),
        this.api.rpc.system.version(),
        this.api.runtimeVersion
      ])
      
      console.log('📡 Connected to BazariChain:')
      console.log(`  - Chain: ${chain}`)
      console.log(`  - Node: ${nodeName} v${nodeVersion}`)
      console.log(`  - Runtime: ${runtimeVersion.specName} v${runtimeVersion.specVersion}`)
      console.log(`  - Transaction Version: ${runtimeVersion.transactionVersion}`)
      console.log(`  - Endpoint: ${wsUrl}`)
      
      return this.api
    } catch (error) {
      console.error('❌ Failed to connect to BazariChain:', error)
      
      // Clean up on failure
      if (this.wsProvider) {
        try {
          await this.wsProvider.disconnect()
        } catch (e) {
          console.warn('Failed to disconnect provider:', e)
        }
      }
      
      this.api = null
      this.wsProvider = null
      
      // Provide helpful error messages
      if (error.message?.includes('CONNECTION_REFUSED') || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('Connection timeout')) {
        throw new Error(`Não foi possível conectar com a BazariChain em ${wsUrl}. Verifique se o node está rodando.`)
      }
      
      if (error.message?.includes('WebSocket')) {
        throw new Error(`Erro de WebSocket ao conectar com ${wsUrl}. Verifique a URL e configuração de rede.`)
      }
      
      throw new Error(`Falha ao conectar com a BazariChain: ${error.message || error}`)
    }
  }

  private configureSignatureVersion() {
    if (!this.api) return

    try {
      // Configure the registry for proper signature handling
      const registry = this.api.registry
      
      // Ensure we use the correct signature version
      registry.setSignedExtensions([
        'CheckSpecVersion',
        'CheckTxVersion', 
        'CheckGenesis',
        'CheckMortality',
        'CheckNonce',
        'CheckWeight',
        'ChargeTransactionPayment'
      ])

      console.log('🔧 Signature configuration applied')
      console.log('📋 Signed extensions:', registry.signedExtensions.map(ext => ext.identifier))
    } catch (error) {
      console.warn('⚠️ Failed to configure signature version:', error)
    }
  }

  async disconnect(): Promise<void> {
    if (this.api?.isConnected) {
      await this.api.disconnect()
    }
    if (this.wsProvider) {
      await this.wsProvider.disconnect()
    }
    this.api = null
    this.wsProvider = null
  }

  getApi(): ApiPromise | null {
    return this.api
  }

  isConnected(): boolean {
    return this.api?.isConnected || false
  }

  // Verifica se a API está saudável e funcionando
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      if (!this.api || !this.api.isConnected) {
        return { healthy: false, details: 'API not connected' }
      }

      const [chain, health, peers] = await Promise.all([
        this.api.rpc.system.chain(),
        this.api.rpc.system.health(),
        this.api.rpc.system.peers()
      ])

      return {
        healthy: true,
        details: {
          chain: chain.toString(),
          peers: peers.length,
          isSyncing: health.isSyncing.isTrue,
          shouldHavePeers: health.shouldHavePeers.isTrue
        }
      }
    } catch (error) {
      return { healthy: false, details: error.message || error }
    }
  }

  // Configura o signer do controle de acesso
  setSigner(signer: any) {
    if (this.api) {
      this.api.setSigner(signer)
    }
  }
}

// Create and export the singleton instance
const bazariApi = BazariApi.getInstance()

// Export both the class and the instance
export { BazariApi, bazariApi }

// Also export as default for compatibility
export default bazariApi