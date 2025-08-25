import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@shared/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { ImportSeed } from './ImportSeed'
import { ImportJson } from './ImportJson'

type Tab = 'seed' | 'json'

export const ImportAccountFlow: React.FC = () => {
  const navigate = useNavigate()
  const { importLocalFromSeed, importLocalFromJson, loginLocal, setLoading } = useAuthStore()
  const [tab, setTab] = React.useState<Tab>('seed')
  const [stage, setStage] = React.useState<'form' | 'password'>('form')
  const [tempAddress, setTempAddress] = React.useState<string | null>(null)
  const [password, setPassword] = React.useState<string>('')

  // 1) import por seed (sem alterar layout do componente)
  const handleImportSeed = async (data: { mnemonic: string; name?: string; password: string }) => {
    setLoading(true)
    try {
      const addr = await importLocalFromSeed(data.mnemonic.trim(), data.name, data.password)
      // já podemos logar direto após import com a mesma senha
      await loginLocal(addr, data.password)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // 2) import por JSON: primeiro valida/guarda JSON + senha, depois login
  const handleImportJson = async (data: { json: any; password: string; nameOverride?: string }) => {
    setLoading(true)
    try {
      const addr = await importLocalFromJson(data.json, data.password, data.nameOverride)
      await loginLocal(addr, data.password)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        {/* Tabs (mantém estrutura básica sem mexer no restante da página) */}
        <div className="mb-4 flex gap-2">
          <button
            className={`px-3 py-1 rounded-lg text-sm ${tab === 'seed' ? 'bg-bazari-red text-white' : 'bg-sand-200 text-matte-black-700'}`}
            onClick={() => setTab('seed')}
          >
            Importar por Seed
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-sm ${tab === 'json' ? 'bg-bazari-red text-white' : 'bg-sand-200 text-matte-black-700'}`}
            onClick={() => setTab('json')}
          >
            Importar por JSON
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'seed' ? (
            <motion.div
              key="seed"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <ImportSeed onSubmit={handleImportSeed} />
            </motion.div>
          ) : (
            <motion.div
              key="json"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <ImportJson onSubmit={handleImportJson} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
