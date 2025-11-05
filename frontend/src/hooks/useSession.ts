import { useEffect, useRef } from 'react'
import fetchApi from '@/api/fetchApi'
import { useSessionStore } from '@/stores/sessionStore'
import { sessionManager } from '@/utils/sessionManager'

export const useSession = () => {
  const user = useSessionStore((state) => state.user)
  const setUser = useSessionStore((state) => state.setUser)
  const clearUser = useSessionStore((state) => state.clearUser)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user?.token || user.status !== 'authenticated') return

    const abortController = new AbortController()
    const signal = abortController.signal

    const payload = JSON.parse(atob(user.token.split('.')[1]))
    const exp = payload.exp * 1000
    const tiempoRestante = exp - Date.now()

    const anticipacion = 10 * 60 * 1000 // 10 minutos
    const timeout = Math.max(tiempoRestante - anticipacion, 0)

    if (tiempoRestante <= 0) {
      sessionManager.logout()
      return
    }

    const refreshToken = async () => {
      try {
        const res = await fetchApi.patch({
          url: '/v1/ususarios/userSession/refresh-token',
          token: user.token,
          signal,
        })

        if (!res.ok) throw new Error('No se pudo refrescar token')

        const json = await res.json()
        const newToken = json.data.token

        setUser({ ...user, token: newToken })
      } catch (err) {
        console.warn('Token expirado o inválido:', err)
        clearUser()
      }
    }

    const refreshPermissions = async () => {
      try {
        const res = await fetchApi.post({
          url: '/v1/usuarios/userSession/refresh-permissions',
          token: user.token,
          signal,
        })

        if (!res.ok) throw new Error('No se pudieron refrescar permisos')

        const json = await res.json()
        const permissions = json.data

        setUser({ ...user, permissions })
      } catch (err) {
        console.warn('Permisos no válidos:', err)
      }
    }

    if (tiempoRestante < 10 * 60 * 1000) {
      refreshToken()
    }

    if (exp < Date.now()) {
      clearUser()
      return
    }

    refreshPermissions()

    timeoutRef.current = setTimeout(async () => {
      refreshToken()
    }, timeout)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      abortController.abort()
    }

    // return () => abortController.abort()
  }, [user?.token])

  return { user, setUser, clearUser }
}
