import fetchApi from '@/api/fetchApi'
import { sessionManager } from './sessionManager'

export const refreshSession = async () => {
  const user = sessionManager.getUser()

  if (!user?.token || user.status !== 'authenticated') return

  const payload = JSON.parse(atob(user.token.split('.')[1]))
  const exp = payload.exp * 1000
  const tiempoRestante = exp - Date.now()

  if (exp < Date.now()) {
    sessionManager.logout()
    return
  }

  if (tiempoRestante < 10 * 60 * 1000) {
    try {
      const res = await fetchApi.post({
        url: '/v1/usuarios/refresh-token',
        token: user.token,
      })

      const json = await res.json()
      sessionManager.setUser({ ...user, token: json.data.token })
    } catch (e) {
      sessionManager.logout()
    }
  }

  try {
    const res = await fetchApi.post({
      url: '/v1/usuarios/refresh-permissions',
      token: user.token,
    })
    const json = await res.json()
    sessionManager.setUser({ ...user, permissions: json.data })
  } catch (e) {
    console.log('Error al refrescar permisos:', e)
  }
}
