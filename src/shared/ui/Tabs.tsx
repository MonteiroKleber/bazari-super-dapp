import React, { createContext, useContext, useState } from 'react'
import clsx from 'clsx'

/** ========== Tipos compartilhados ========== */
type TabItem = { id: string; label: React.ReactNode; content: React.ReactNode }

interface BaseProps {
  className?: string
}

/** API clássica (um componente, recebe tabs/activeTab/onTabChange) */
interface ClassicProps extends BaseProps {
  tabs: TabItem[]
  activeTab?: string
  onTabChange?: (id: string) => void
}

/** API compositional (Root + List/Trigger/Content, com defaultValue/value) */
interface CompProps extends BaseProps {
  children: React.ReactNode
  defaultValue: string
  value?: string
  onValueChange?: (id: string) => void
}

/** União das duas APIs (retrocompatível) */
type TabsProps = ClassicProps | CompProps

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

/** ========== Partes compositional ========== */
const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={clsx('flex space-x-1 rounded-xl p-1 border-b bg-sand-100', className)}>{children}</div>
)

const TabsTrigger: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({ children, value, className }) => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')

  const { activeTab, setActiveTab } = ctx
  const isActive = activeTab === value

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={clsx(
        'px-4 py-2 -mb-px border-b-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'border-success text-bazari-red bg-white shadow-sm'
          : 'border-transparent text-matte-black-600 hover:text-matte-black-900',
        className
      )}
      data-active={isActive ? 'true' : 'false'}
    >
      {children}
    </button>
  )
}

const TabsContent: React.FC<{ children: React.ReactNode; value: string; className?: string }> = ({ children, value, className }) => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')
  return ctx.activeTab === value ? <div className={className}>{children}</div> : null
}

/** ========== Root retrocompatível (suporta 2 modos) ========== */
const TabsRoot: React.FC<TabsProps> = (props) => {
  const isClassic = 'tabs' in props

  // Estados criados de forma estável (sem chamar hook condicional)
  const [classicInternal, setClassicInternal] = useState<string>(
    isClassic ? (props.activeTab ?? props.tabs?.[0]?.id ?? 'overview') : 'overview'
  )
  const [compInternal, setCompInternal] = useState<string>(
    !isClassic ? (props.defaultValue ?? 'overview') : 'overview'
  )

  if (isClassic) {
    const { tabs, className } = props
    const active = props.activeTab ?? classicInternal
    const setActive = props.onTabChange ?? setClassicInternal

    return (
      <div className={className}>
        {/* Cabeçalho */}
        <div className="flex space-x-1 rounded-xl p-1 border-b bg-sand-100">
          {tabs.map((t) => {
            const isActive = active === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={clsx(
                  'px-4 py-2 -mb-px border-b-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'border-success text-bazari-red bg-white shadow-sm'
                    : 'border-transparent text-matte-black-600 hover:text-matte-black-900'
                )}
                data-active={isActive ? 'true' : 'false'}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Conteúdo */}
        <div className="pt-8">
          {tabs.find((t) => t.id === active)?.content ?? null}
        </div>
      </div>
    )
  }

  // —— Modo compositional (Root + List/Trigger/Content)
  const { children, className } = props
  const activeTab = props.value ?? compInternal
  const setActiveTab = props.onValueChange ?? setCompInternal

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

/** Compose API: Tabs.List / Tabs.Trigger / Tabs.Content */
const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})

export default Tabs
export { Tabs }
