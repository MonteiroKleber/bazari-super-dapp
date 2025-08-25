// src/shared/ui/ErrorBoundary.tsx
// ✅ Componente ErrorBoundary para capturar erros React

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Em produção, você pode enviar o erro para um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Se um componente customizado foi fornecido, usá-lo
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      // Componente de erro padrão
      return (
        <div className="min-h-screen bg-gradient-to-br from-sand-50 to-sage-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-matte-black-900 mb-2">
              Oops! Algo deu errado
            </h2>
            
            <p className="text-matte-black-600 mb-6">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-matte-black-700 mb-2">
                  Detalhes técnicos (dev only)
                </summary>
                <div className="bg-matte-black-50 p-3 rounded text-xs font-mono text-matte-black-600 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Erro:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Ir para Home
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// ✅ Hook para usar ErrorBoundary funcionalmente (React 16.8+)
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Erro capturado:', error, errorInfo)
    
    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Sentry.captureException(error, { extra: errorInfo })
    }
  }, [])
}

// ✅ Componente de erro customizado para casos específicos
export const ErrorFallback: React.FC<{ 
  error?: Error
  retry: () => void 
  title?: string
  description?: string
}> = ({ 
  error, 
  retry, 
  title = "Erro na aplicação",
  description = "Algo deu errado. Tente novamente."
}) => (
  <div className="flex flex-col items-center justify-center min-h-64 p-6">
    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
      <AlertTriangle className="h-6 w-6 text-red-600" />
    </div>
    
    <h3 className="text-lg font-semibold text-matte-black-900 mb-2">
      {title}
    </h3>
    
    <p className="text-matte-black-600 mb-4 text-center">
      {description}
    </p>

    {process.env.NODE_ENV === 'development' && error && (
      <details className="mb-4 w-full max-w-lg">
        <summary className="cursor-pointer text-sm font-medium text-matte-black-700 mb-2">
          Erro técnico
        </summary>
        <div className="bg-matte-black-50 p-3 rounded text-xs font-mono text-matte-black-600 overflow-auto max-h-24">
          {error.message}
        </div>
      </details>
    )}
    
    <Button onClick={retry} size="sm" className="gap-2">
      <RefreshCw className="h-4 w-4" />
      Tentar Novamente
    </Button>
  </div>
)