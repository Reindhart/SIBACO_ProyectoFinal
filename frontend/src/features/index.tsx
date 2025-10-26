import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ApiResponse {
  status: string
  message: string
  version?: string
}

type ConnectionStatus = 'idle' | 'loading' | 'success' | 'error'

export default function Index() {
  const [message, setMessage] = useState<string>('')
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const fetchMessage = async () => {
    setStatus('loading')
    setError(null)
    setMessage('')
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor no devolvió JSON. Verifica que el backend esté corriendo.')
      }
      
      const data: ApiResponse = await response.json()
      
      if (!data.message) {
        throw new Error('Respuesta del servidor incompleta')
      }
      
      setMessage(data.message)
      setStatus('success')
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Timeout: El servidor no responde. Verifica que el backend esté corriendo.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Error desconocido al conectar con el servidor')
      }
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchMessage()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold">
            Bienvenido
          </CardTitle>
          <CardDescription className="text-lg">
            Plantilla React + Flask
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estado de Conexión */}
          <div className="flex flex-col items-center gap-4">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-3">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base">Conectando con el servidor...</p>
              </div>
            )}
            
            {status === 'error' && error && (
              <div className="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold">Error de conexión</h3>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}
            
            {status === 'success' && message && (
              <div className="w-full space-y-4">
                <div className="alert alert-success shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Conexión exitosa con el backend</span>
                </div>
                
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body items-center">
                    <div className="badge badge-success badge-lg mb-2">API Activa</div>
                    <h2 className="card-title text-3xl text-center">
                      {message}
                    </h2>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón de Reconexión */}
          <div className="flex justify-center">
            <Button 
              onClick={fetchMessage} 
              disabled={status === 'loading'}
              size="lg"
              className="gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {status === 'loading' ? 'Conectando...' : status === 'error' ? 'Reintentar' : 'Reconectar'}
            </Button>
          </div>

          <div className="divider">Tecnologías</div>
          
          {/* Grid de Tecnologías */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Frontend
                </h3>
                <ul className="space-y-1">
                  {['React 19', 'TypeScript', 'TanStack Router', 'Tailwind CSS v4', 'DaisyUI', 'shadcn/ui'].map((tech) => (
                    <li key={tech} className="flex items-center gap-2">
                      <div className="badge badge-primary badge-sm"></div>
                      <span className="text-sm">{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Backend
                </h3>
                <ul className="space-y-1">
                  {['Flask 3', 'SQLAlchemy', 'Flask-JWT-Extended', 'Flask-CORS', 'PostgreSQL', 'Python-dotenv'].map((tech) => (
                    <li key={tech} className="flex items-center gap-2">
                      <div className="badge badge-secondary badge-sm"></div>
                      <span className="text-sm">{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
