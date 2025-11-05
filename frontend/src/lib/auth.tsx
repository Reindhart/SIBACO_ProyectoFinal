/**
 * Contexto de Autenticación
 * Gestiona el estado de autenticación del usuario
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient, ApiError } from '@/lib/api'
import { sessionManager } from '@/utils/sessionManager'

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  full_name: string
  role: 'admin' | 'doctor'
  phone?: string
  is_active: boolean
}

interface AuthResponse {
  status: string
  message: string
  data: {
    user: User
    access_token: string
    refresh_token: string
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

interface RegisterData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  role?: 'admin' | 'doctor'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          // soportar varias formas de respuesta: { data: user } o { user: ... } o directamente el user
          const response = await apiClient.get<any>('/api/auth/me')
          const userData = response?.data?.user ?? response?.data ?? response?.user ?? response
          // Si viene envuelto en { status, data: { ... } } userData será el usuario
          setUser(userData as User)
          // sincronizar con session manager (incluyendo token)
          const token = localStorage.getItem('access_token')
          try {
            sessionManager.setUser({ ...userData, token, status: 'authenticated' })
          } catch (e) {
            // ignore
          }
        } catch (error) {
          // Token inválido o expirado - NO limpiar todavía, puede ser problema del servidor
          console.error('[AuthProvider] Error al verificar token:', error)
          // Solo limpiar si es un error 401 (Unauthorized)
          const apiError = error as ApiError
          if (apiError.status === 'error' && apiError.message?.includes('Token')) {
            console.log('[AuthProvider] Token inválido o expirado, limpiando...')
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
          }
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', {
        username,
        password,
      })

      const { user: userData, access_token, refresh_token } = response.data

      // Guardar tokens
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      // Actualizar estado
      setUser(userData)
      try {
        sessionManager.setUser({ ...userData, token: access_token, status: 'authenticated' })
      } catch (e) {}
    } catch (error) {
      const apiError = error as ApiError
      throw new Error(apiError.message || 'Error al iniciar sesión')
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', data)

      const { user: userData, access_token, refresh_token } = response.data

      // Guardar tokens
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)

      // Actualizar estado
      setUser(userData)
      try {
        sessionManager.setUser({ ...userData, token: access_token, status: 'authenticated' })
      } catch (e) {}
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.errors) {
        // Formatear errores de validación
        const errorMessages = Object.entries(apiError.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n')
        throw new Error(errorMessages)
      }
      throw new Error(apiError.message || 'Error al registrar usuario')
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    try {
      sessionManager.logout()
    } catch (e) {}
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
