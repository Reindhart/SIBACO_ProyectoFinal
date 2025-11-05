import { useSessionStore } from '@/stores/sessionStore'

// 👀 Recomendado para usar fuera de React (ej: rutas TanStack)
const sessionState = () => useSessionStore.getState()

export const sessionManager = {
  // Verifica si el usuario está autenticado
  isAuthenticated: (): boolean =>
    sessionState().user.status === 'authenticated',

  // Devuelve el usuario completo
  getUser: () => sessionState().user,

  // Devuelve el token (por si necesitas pasarlo en headers)
  getToken: (): string => sessionState().user.token,

  // Asigna un nuevo usuario (con token, permisos, etc)
  setUser: (
    user: Parameters<ReturnType<typeof sessionState>['setUser']>[0]
  ): void => {

    const normalized = { ...user } as any
    if (normalized?.permissions && Array.isArray(normalized.permissions)) {
      try {
        normalized.permissions = normalized.permissions.map((p: any) => {
          if (typeof p === 'number') return p
          if (typeof p === 'string' && p.trim() !== '') return Number(p)
          return p
        }).filter((p: any) => typeof p === 'number' && !Number.isNaN(p))
      } catch (e) {
        console.warn('Error normalizing permissions', e)
      }
    }

    sessionState().setUser(normalized)
  },

  // Limpia todo el estado de sesión
  logout: () => {
    sessionState().clearUser()
  },
}
