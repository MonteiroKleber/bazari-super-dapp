import React from 'react'
import { createPortal } from 'react-dom'
import { Card } from '@shared/ui/Card'
import { Button } from '@shared/ui/Button'
import { Input } from '@shared/ui/Input'

type PromptState =
  | { open: false }
  | {
      open: true
      title?: string
      address?: string
      context?: any
      resolve: (pwd: string) => void
      reject: (err?: any) => void
    }

const Ctx = React.createContext<{
  promptPassword: (opts?: { title?: string; address?: string; context?: any }) => Promise<string>
}>({
  promptPassword: async () => {
    throw new Error('PasswordPromptProvider not mounted')
  },
})

export const usePasswordPrompt = () => React.useContext(Ctx)

export const PasswordPromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<PromptState>({ open: false })
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const promptPassword = React.useCallback(
    (opts?: { title?: string; address?: string; context?: any }) => {
      return new Promise<string>((resolve, reject) => {
        setError(null)
        setPassword('')
        setState({ open: true, title: opts?.title, address: opts?.address, context: opts?.context, resolve, reject })
      })
    },
    []
  )

  const onClose = (err?: any) => {
    if (state.open) {
      state.reject?.(err ?? new Error('cancelled'))
    }
    setState({ open: false })
    setPassword('')
    setError(null)
  }

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!password) {
      setError('Informe a senha.')
      return
    }
    if (state.open) {
      state.resolve(password)
    }
    setState({ open: false })
    setPassword('')
    setError(null)
  }

  // ESC fecha
  React.useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && state.open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.open])

  return (
    <Ctx.Provider value={{ promptPassword }}>
      {children}

      {state.open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-5">
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="text-lg font-semibold">
                  {state.title ?? 'Confirmar assinatura'}
                </div>
                {state.address && (
                  <div className="text-sm text-matte-black-600">
                    Conta: <code>{state.address.slice(0, 6)}…{state.address.slice(-6)}</code>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Senha</label>
                  <Input
                    type="password"
                    autoFocus
                    className="mt-1"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Confirmar</Button>
                  <Button type="button" variant="ghost" onClick={() => onClose()} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          </div>,
          document.body
        )}
    </Ctx.Provider>
  )
}
