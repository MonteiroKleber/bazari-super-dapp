import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'
import { useI18n } from '@app/providers/I18nProvider'
import { useAuthStore } from '../store/authStore'

export const ExistingAccountLogin: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()

  const { listLocal, localAccounts, loginLocal } = useAuthStore()
  const [address, setAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    listLocal().catch(() => null)
  }, [listLocal])

  const onLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const addr = address || localAccounts[0]?.address
      if (!addr) {
        setError(t('auth.login.no_local_accounts', 'Nenhuma conta local encontrada. Importe ou crie uma conta.'))
        return
      }
      if (!password) {
        setError(t('auth.login.password_required', 'Informe a senha.'))
        return
      }
      await loginLocal(addr, password)
      navigate('/dashboard')
    } catch (e: any) {
      setError(String(e?.message || t('auth.login.failed', 'Falha ao entrar')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <LogIn className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          {t('auth.login_existing', 'Acessar sua conta existente')}
        </h3>
      </div>

      {/* Seleção de conta local */}
      <div>
        <label className="text-sm font-medium">
          {t('auth.login.account_label', 'Conta')}
        </label>
        {localAccounts.length > 0 ? (
          <select
            className="w-full border rounded-lg p-2 mt-1 text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          >
            <option value="">{t('auth.login.select', 'Selecionar…')}</option>
            {localAccounts.map((a) => (
              <option key={a.address} value={a.address}>
                {(a.name || t('auth.login.account', 'Conta'))} — {a.address.slice(0, 6)}…{a.address.slice(-6)}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-matte-black-600 mt-1">
            {t('auth.login.no_local_accounts_hint', 'Nenhuma conta local encontrada.')}
            {' '}
            <Link to="/auth/import" className="text-bazari-red underline">
              {t('auth.login.import', 'Importe')}
            </Link>
            {' '}
            {t('common.or', 'ou')}
            {' '}
            <Link to="/auth/create" className="text-bazari-red underline">
              {t('auth.login.create', 'crie')}
            </Link>
            {' '}
            {t('auth.login.one', 'uma conta.')}
          </div>
        )}
      </div>

      {/* Senha para desbloquear */}
      <div>
        <label className="text-sm font-medium">
          {t('auth.login.password', 'Senha')}
        </label>
        <Input
          type="password"
          className="mt-1"
          placeholder={t('auth.login.password_placeholder', 'Digite sua senha')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button onClick={onLogin} disabled={loading || !password} className="w-full">
        {loading ? t('auth.login.entering', 'Entrando…') : t('auth.login.enter', 'Entrar')}
      </Button>

      {/* (Opcional) Se você mantiver um bloco de "Entrar com extensão", ele pode continuar logo abaixo sem alterações visuais */}
    </Card>
  )
}
