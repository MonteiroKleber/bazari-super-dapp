import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '@features/auth/store/authStore'

const SEED_WORDS_HINT = 'ex: one two three four five six seven eight nine ten eleven twelve'

export const ImportSeed: React.FC = () => {
  const nav = useNavigate()
  const { t } = useI18n()

  const { importLocalFromSeed, loginLocal } = useAuthStore()

  const [mnemonic, setMnemonic] = React.useState('')
  const [name, setName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [password2, setPassword2] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const pwdOk = password.length >= 8 && password === password2
  const canImport = mnemonic.trim().split(/\s+/).length >= 12 && pwdOk && !loading

  const onImport = async () => {
    setError(null)
    if (!canImport) return
    setLoading(true)
    try {
      const address = await importLocalFromSeed(mnemonic.trim(), name || 'Conta', password)
      await loginLocal(address, password)
      nav('/dashboard')
    } catch (e: any) {
      setError(String(e?.message || 'Falha ao importar seed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <h3 className="text-lg font-semibold">{t('wallet.import.seed.title', 'Importar com Seed')}</h3>

      <div>
        <label className="text-sm font-medium">{t('wallet.import.seed.label', 'Sua seed phrase')}</label>
        <textarea
          className="mt-1 w-full border rounded-lg p-2 text-sm min-h-[96px]"
          placeholder={SEED_WORDS_HINT}
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
        />
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
          <Input
            type="password"
            className="mt-2"
            placeholder={t('auth.create.password_confirm', 'Confirmar senha')}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
          <div className="text-xs text-matte-black-600 mt-1">
            {t('wallet.import.password_hint', 'Mínimo 8 caracteres. Use esta senha para desbloquear sua conta.')}
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button className="w-full" disabled={!canImport} onClick={onImport}>
        {loading ? t('common.loading', 'Carregando…') : t('wallet.import.cta', 'Importar e entrar')}
      </Button>
    </Card>
  )
}

export default ImportSeed
