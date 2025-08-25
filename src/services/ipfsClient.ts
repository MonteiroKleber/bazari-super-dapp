import { create } from 'ipfs-http-client'

// Kubo local (ajuste se usar gateway/API remota)
const API_URL = 'http://127.0.0.1:5001/api/v0'
const GW_URL  = 'http://127.0.0.1:8080'

export const ipfs = create({ url: API_URL })

export async function addFile(file: File) {
  const added = await ipfs.add(file, { pin: true })
  return added.cid.toString()
}

export async function addJSON(obj: unknown) {
  const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
  const added = await ipfs.add(blob, { pin: true })
  return added.cid.toString()
}

export async function fetchJsonByCid<T=any>(cid: string): Promise<T> {
  const res = await fetch(`${GW_URL}/ipfs/${cid}`)
  if (!res.ok) throw new Error(`CID fetch failed: ${cid}`)
  return res.json()
}

export const ipfsGatewayUrl = (cid?: string) => cid ? `${GW_URL}/ipfs/${cid}` : ''
