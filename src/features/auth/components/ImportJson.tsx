import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'
import type { KeyringPair$Json } from '@polkadot/keyring/types'

export const ImportJson: React.FC = () => {
  const nav = useNavigate()
  const { t } = useI18n()

  const { importLocalFromJson, loginLocal } = useAuthStore()

  const [json, setJson] = React.useState<KeyringPair$Json | null>(null)
  const [name, setName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canImport = !!json && password.length >= 1 && !loading

  const onFile = async (file?: File) => {
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      setJson(parsed)
      const jsonName = parsed?.meta?.name
      if (jsonName && !name) setName(String(jsonName))
      setError(null)
    } catch {
      setError('Arquivo JSON inválido')
    }
  }

  const onImport = async () => {
    setError(null)
    if (!json || !canImport) return
    setLoading(true)
    try {
      const address = await importLocalFromJson(json, password, name || undefined)
      await loginLocal(address, password)

      nav('/dashboard')
    } catch (e: any) {
      setError(String(e?.message || 'Falha ao importar JSON'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-lg font-semibold">{t('wallet.import.json.title', 'Importar com JSON (Polkadot.js)')}</h3>

      <div>
        <label className="text-sm font-medium">{t('wallet.import.json.label', 'Selecione o arquivo JSON')}</label>
        <input
          className="mt-1 block w-full text-sm"
          type="file"
          accept=".json,application/json"
          onChange={(e) => onFile(e.target.files?.[0] || undefined)}
        />
        <div className="text-xs text-matte-black-600 mt-1">
          {t('wallet.import.json.hint', 'Compatível com backup exportado da extensão Polkadot.js')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">{t('wallet.import.name', 'Nome (opcional)')}</label>
          <Input
            className="mt-1"
            placeholder={t('wallet.import.name_ph', 'Minha conta')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">{t('auth.create.password', 'Senha')}</label>
          <Input
            type="password"
            className="mt-1"
            placeholder={t('auth.create.password', 'Senha')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button className="w-full" disabled={!canImport} onClick={onImport}>
        {loading ? t('common.loading', 'Carregando…') : t('wallet.import.cta', 'Importar e entrar')}
      </Button>
    </Card>
  )
}

export default ImportJson
