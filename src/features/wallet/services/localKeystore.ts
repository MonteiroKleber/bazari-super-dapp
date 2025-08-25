// src/features/wallet/services/localKeystore.ts
import { cryptoWaitReady, mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto'
import Keyring from '@polkadot/keyring'
import type { KeyringPair$Json } from '@polkadot/keyring/types'

const STORAGE_KEY = 'bazari.local.accounts.v1'

export type LocalAccountMeta = { address: string; name?: string; ss58: number; createdAt: string }
export type LocalAccountRecord = { meta: LocalAccountMeta; json: KeyringPair$Json }
type StoreShape = Record<string, LocalAccountRecord>

function readStore(): StoreShape {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
function writeStore(data: StoreShape) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** Lista metadados das contas locais */
export async function listLocalAccounts(): Promise<LocalAccountMeta[]> {
  const s = readStore()
  return Object.values(s).map(r => r.meta)
}

/** Cria conta local (gera mnemonic) e persiste JSON cifrado por senha */
export async function createLocalAccount(opts: { name?: string; password: string; ss58?: number; words?: 12 | 24 }) {
  await cryptoWaitReady()
  const { name, password, ss58 = 42, words = 12 } = opts
  const mnemonic = mnemonicGenerate(words)
  const keyring = new Keyring({ type: 'sr25519', ss58Format: ss58 })
  const pair = keyring.addFromUri(mnemonic, { name }, 'sr25519')
  const json = pair.toJson(password)

  const rec: LocalAccountRecord = {
    meta: { address: pair.address, name, ss58, createdAt: new Date().toISOString() },
    json
  }
  const store = readStore(); store[rec.meta.address] = rec; writeStore(store)
  return { address: rec.meta.address, mnemonic, meta: rec.meta }
}

/** Importa conta a partir de mnemonic (seed) */
export async function importFromMnemonic(opts: { mnemonic: string; name?: string; password: string; ss58?: number }) {
  await cryptoWaitReady()
  const { mnemonic, name, password, ss58 = 42 } = opts
  if (!mnemonicValidate(mnemonic)) throw new Error('Mnemonic inválido')

  const keyring = new Keyring({ type: 'sr25519', ss58Format: ss58 })
  const pair = keyring.addFromUri(mnemonic, { name }, 'sr25519')
  const json = pair.toJson(password)

  const rec: LocalAccountRecord = {
    meta: { address: pair.address, name, ss58, createdAt: new Date().toISOString() },
    json
  }
  const store = readStore(); store[rec.meta.address] = rec; writeStore(store)
  return rec.meta
}

/** Importa conta a partir de JSON (compatível Polkadot.js) */
export async function importFromJson(opts: { json: KeyringPair$Json; password: string; ss58?: number; nameOverride?: string }) {
  await cryptoWaitReady()
  const { json, password, ss58 = 42, nameOverride } = opts
  const keyring = new Keyring({ type: 'sr25519', ss58Format: ss58 })
  const pair = keyring.addFromJson(json)

  // valida senha
  try { pair.decodePkcs8(password) } catch { throw new Error('Senha do JSON incorreta') }

  const name = nameOverride || (json.meta?.name as string | undefined)
  const rec: LocalAccountRecord = {
    meta: { address: pair.address, name, ss58, createdAt: new Date().toISOString() },
    json
  }
  const store = readStore(); store[rec.meta.address] = rec; writeStore(store)
  return rec.meta
}

/** Retorna o JSON cifrado da conta (para o Worker assinar) */
export async function getAccountJson(address: string): Promise<KeyringPair$Json> {
  const rec = readStore()[address]
  if (!rec) throw new Error('Conta não encontrada')
  return rec.json
}

/** Verifica senha sem manter a chave em memória global */
export async function verifyPassword(address: string, password: string, ss58 = 42) {
  await cryptoWaitReady()
  const rec = readStore()[address]; if (!rec) throw new Error('Conta não encontrada')
  const keyring = new Keyring({ type: 'sr25519', ss58Format: ss58 })
  const pair = keyring.addFromJson(rec.json)
  try { pair.decodePkcs8(password) } catch { throw new Error('Senha incorreta') }
  // não mantém pair em nenhum lugar
  return true
}

/** Exporta JSON cifrado */
export async function exportAccountJson(address: string) {
  const rec = readStore()[address]; if (!rec) throw new Error('Conta não encontrada'); return rec.json
}

export async function unlockAccount(address: string, password: string, ss58?: number): Promise<any> {
  await cryptoWaitReady()
  
  const store = readStore()
  const record = store[address]
  
  if (!record) {
    throw new Error('Conta não encontrada')
  }
  
  try {
    const keyring = new Keyring({ type: 'sr25519', ss58Format: ss58 || record.meta.ss58 })
    const pair = keyring.addFromJson(record.json)
    pair.decodePkcs8(password)
    
    return pair
  } catch (error) {
    throw new Error('Senha incorreta')
  }
}


// Função para criar conta derivada
export async function createDerivedAccount(opts: { 
  parentAddress: string
  derivationPath: string
  name?: string
  password: string
  ss58?: number 
}): Promise<{ address: string; meta: LocalAccountMeta }> {
  await cryptoWaitReady()
  const { parentAddress, derivationPath, name, password, ss58 = 42 } = opts
  
  const store = readStore()
  const parentRecord = store[parentAddress]
  
  if (!parentRecord) {
    throw new Error('Conta pai não encontrada')
  }
  
  try {
    // Desbloqueia a conta pai
    const parentPair = await unlockAccount(parentAddress, password)
    
    // Cria derivada
    const derivedPair = parentPair.derive(derivationPath)
    derivedPair.meta.name = name
    
    // Salva como nova conta
    const json = derivedPair.toJson(password)
    
    const rec: LocalAccountRecord = {
      meta: { 
        address: derivedPair.address, 
        name, 
        ss58, 
        createdAt: new Date().toISOString(),
        derivationPath 
      },
      json
    }
    
    store[rec.meta.address] = rec
    writeStore(store)
    
    return { address: rec.meta.address, meta: rec.meta }
  } catch (error) {
    throw new Error(`Falha ao criar conta derivada: ${error}`)
  }
}

